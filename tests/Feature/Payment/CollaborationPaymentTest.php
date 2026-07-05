<?php

declare(strict_types=1);

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\ContentSubmission;
use App\Models\CreatorProfile;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Notifications\PaymentConfirmedNotification;
use App\Notifications\PaymentProofSubmittedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    config(['collabite.manual_payment_enabled' => true]);
    Storage::fake('local');
    Notification::fake();
});

/**
 * @return array{0: User, 1: User, 2: Campaign, 3: Collaboration}
 */
function makeCollabForPayment(): array
{
    $umkm = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);
    UmkmProfile::factory()->for($umkm, 'user')->create();
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->create([
        'umkm_profile_id' => $umkm->umkmProfile->id,
        'category_id' => $category->id,
        'status' => CampaignStatus::InCollaboration,
        'published_at' => now(),
        'budget' => 1500000,
    ]);
    $collaboration = Collaboration::create([
        'campaign_id' => $campaign->id,
        'umkm_id' => $umkm->id,
        'creator_id' => $creator->id,
        'status' => CollaborationStatus::Active,
        'started_at' => now(),
    ]);
    $collaboration->conversation()->create([]);

    return [$umkm, $creator, $campaign, $collaboration];
}

function approveSubmissionForPayment(Collaboration $collaboration): ContentSubmission
{
    $sub = $collaboration->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::InReview,
        'submitted_at' => now(),
    ]);

    test()->actingAs($collaboration->umkm)
        ->post(route('umkm.collaborations.submissions.approve', [$collaboration, $sub]))
        ->assertRedirect();

    return $sub->fresh();
}

test('approving submission creates pending payment record', function (): void {
    [, , $campaign, $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $this->assertDatabaseHas('collaboration_payments', [
        'collaboration_id' => $collaboration->id,
        'status' => PaymentStatus::PendingProof->value,
        'amount' => '1500000.00',
    ]);
});

test('UMKM can upload payment proof', function (): void {
    [$umkm, $creator, , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $proof = UploadedFile::fake()->image('bukti.jpg');

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.payment.proof', $collaboration), [
            'proof' => $proof,
            'note' => 'Transfer BCA ref 123',
        ])
        ->assertRedirect();

    $payment = $collaboration->fresh()->payment;
    expect($payment)->not->toBeNull()
        ->and($payment->status)->toBe(PaymentStatus::AwaitingConfirmation)
        ->and($payment->note)->toBe('Transfer BCA ref 123');

    Notification::assertSentTo($creator, PaymentProofSubmittedNotification::class);
    expect(ActivityLog::where('action', 'payment.proof_submitted')->count())->toBe(1);
});

test('creator can confirm payment after proof uploaded', function (): void {
    [$umkm, $creator, , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.payment.proof', $collaboration), [
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ])
        ->assertRedirect();

    $this->actingAs($creator)
        ->post(route('creator.collaborations.payment.confirm', $collaboration))
        ->assertRedirect();

    $payment = $collaboration->fresh()->payment;
    expect($payment->status)->toBe(PaymentStatus::Confirmed)
        ->and($payment->confirmed_by)->toBe($creator->id);

    Notification::assertSentTo($umkm, PaymentConfirmedNotification::class);
    expect(ActivityLog::where('action', 'payment.confirmed')->count())->toBe(1);
});

test('UMKM can complete collaboration after payment confirmed', function (): void {
    [$umkm, $creator, , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.payment.proof', $collaboration), [
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ]);

    $this->actingAs($creator)
        ->post(route('creator.collaborations.payment.confirm', $collaboration));

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.complete', $collaboration))
        ->assertRedirect();

    expect($collaboration->fresh()->status)->toBe(CollaborationStatus::Completed);
});

test('creator cannot confirm payment before proof uploaded', function (): void {
    [, $creator, , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $this->actingAs($creator)
        ->from(route('creator.collaborations.show', $collaboration))
        ->post(route('creator.collaborations.payment.confirm', $collaboration))
        ->assertForbidden();
});

test('UMKM cannot complete collaboration before payment confirmed when manual payment enabled', function (): void {
    config(['collabite.manual_payment_enabled' => true]);

    [$umkm, , , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $this->actingAs($umkm)
        ->from(route('umkm.collaborations.show', $collaboration))
        ->post(route('umkm.collaborations.complete', $collaboration))
        ->assertSessionHasErrors('payment');

    expect($collaboration->fresh()->status)->toBe(CollaborationStatus::Active);
});

test('UMKM can complete collaboration without payment when manual payment disabled', function (): void {
    config(['collabite.manual_payment_enabled' => false]);

    [$umkm, , , $collaboration] = makeCollabForPayment();
    $sub = $collaboration->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::InReview,
        'submitted_at' => now(),
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.submissions.approve', [$collaboration, $sub]))
        ->assertRedirect();

    $this->assertDatabaseMissing('collaboration_payments', [
        'collaboration_id' => $collaboration->id,
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.complete', $collaboration))
        ->assertRedirect();

    expect($collaboration->fresh()->status)->toBe(CollaborationStatus::Completed);
});

test('payment routes return 404 when manual payment disabled', function (): void {
    config(['collabite.manual_payment_enabled' => false]);

    [$umkm, $creator, , $collaboration] = makeCollabForPayment();

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.payment.proof', $collaboration), [
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ])
        ->assertNotFound();

    $this->actingAs($creator)
        ->post(route('creator.collaborations.payment.confirm', $collaboration))
        ->assertNotFound();
});
