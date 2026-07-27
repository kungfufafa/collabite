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
use App\Models\CollaborationRequest;
use App\Models\ContentSubmission;
use App\Models\CreatorProfile;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Notifications\PaymentConfirmedNotification;
use App\Notifications\PaymentProofSubmittedNotification;
use App\Notifications\PaymentRefundedNotification;
use App\Notifications\PaymentVoidedNotification;
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

// ---------------------------------------------------------------------------
// P1-12: escrow integrity — admin force-close menandai payment Confirmed
// menjadi Refunded (bukan sekadar diblokir) + audit log.
// ---------------------------------------------------------------------------

function drivePaymentToConfirmed(Collaboration $collaboration, User $umkm, User $creator): void
{
    approveSubmissionForPayment($collaboration);

    test()->actingAs($umkm)
        ->post(route('umkm.collaborations.payment.proof', $collaboration), [
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ])
        ->assertRedirect();

    test()->actingAs($creator)
        ->post(route('creator.collaborations.payment.confirm', $collaboration))
        ->assertRedirect();
}

test('force-close with confirmed payment marks it refunded and audits the refund', function (): void {
    [$umkm, $creator, , $collaboration] = makeCollabForPayment();
    drivePaymentToConfirmed($collaboration, $umkm, $creator);

    expect($collaboration->fresh()->payment->status)->toBe(PaymentStatus::Confirmed);

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Sengketa pembayaran diluar platform.',
        ])
        ->assertRedirect();

    $payment = $collaboration->fresh()->payment;
    expect($payment->status)->toBe(PaymentStatus::Refunded)
        ->and($payment->voided_at)->not->toBeNull()
        ->and($payment->voided_by)->toBe($admin->id)
        ->and($payment->voided_reason)->toContain('Force-close');

    expect(ActivityLog::where('action', 'payment.refunded')->count())->toBe(1)
        ->and($collaboration->fresh()->status)->toBe(CollaborationStatus::Cancelled);

    Notification::assertSentTo($umkm, PaymentRefundedNotification::class);
    Notification::assertSentTo($creator, PaymentRefundedNotification::class);
});

test('force-close with active (pending proof) payment voids it instead of refunding', function (): void {
    [$umkm, $creator, , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    expect($collaboration->fresh()->payment->status)->toBe(PaymentStatus::PendingProof);

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Pelanggaran ketentuan platform.',
        ])
        ->assertRedirect();

    $payment = $collaboration->fresh()->payment;
    expect($payment->status)->toBe(PaymentStatus::Voided)
        ->and($payment->voided_at)->not->toBeNull()
        ->and($payment->voided_by)->toBe($admin->id);

    expect(ActivityLog::where('action', 'payment.voided')->count())->toBe(1)
        ->and(ActivityLog::where('action', 'payment.refunded')->count())->toBe(0);

    Notification::assertSentTo($umkm, PaymentVoidedNotification::class);
    Notification::assertSentTo($creator, PaymentVoidedNotification::class);
});

test('non-admin cancel rejects a confirmed payment instead of refunding', function (): void {
    [$umkm, $creator, , $collaboration] = makeCollabForPayment();
    drivePaymentToConfirmed($collaboration, $umkm, $creator);

    // UMKM biasa tidak boleh membatalkan kolaborasi yang dananya sudah Confirmed;
    // aksi cancel harus ditolak agar escrow tidak hilang tanpa refund record.
    $this->actingAs($umkm)
        ->from(route('umkm.collaborations.show', $collaboration))
        ->post(route('umkm.collaborations.cancel', $collaboration), [
            'reason' => 'Coba batal setelah bayar.',
        ])
        ->assertSessionHasErrors('collaboration');

    expect($collaboration->fresh()->status)->toBe(CollaborationStatus::Active)
        ->and($collaboration->fresh()->payment->status)->toBe(PaymentStatus::Confirmed);
});

// ---------------------------------------------------------------------------
// P2-18: E2E MVP flow — apply → accept → upload → submit-for-review → approve
// → payment record → proof → confirm → complete.
// ---------------------------------------------------------------------------

test('full MVP escrow flow from application to completion', function (): void {
    $umkm = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);
    UmkmProfile::factory()->for($umkm, 'user')->create();
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->create([
        'umkm_profile_id' => $umkm->umkmProfile->id,
        'category_id' => $category->id,
        'status' => CampaignStatus::Open,
        'published_at' => now(),
        'budget' => 1500000,
    ]);

    // 1. Creator melamar.
    $this->actingAs($creator)
        ->post(route('creator.campaigns.apply', $campaign), ['message' => 'Saya tertarik.'])
        ->assertRedirect();

    $request = CollaborationRequest::where('campaign_id', $campaign->id)->firstOrFail();

    // 2. UMKM menerima lamaran → kolaborasi aktif.
    $this->actingAs($umkm)
        ->post(route('umkm.requests.accept', $request), ['terms_accepted' => '1'])
        ->assertRedirect();

    $collaboration = Collaboration::where('campaign_id', $campaign->id)->firstOrFail();
    expect($collaboration->status)->toBe(CollaborationStatus::Active);

    // 3. Creator upload submission draft.
    $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.store', $collaboration), [
            'title' => 'Konsep final',
            'description' => 'Draft video',
            'files' => [UploadedFile::fake()->image('frame.jpg')],
        ])
        ->assertRedirect();

    $submission = ContentSubmission::where('collaboration_id', $collaboration->id)->firstOrFail();
    expect($submission->status)->toBe(ContentSubmissionStatus::Draft);

    // 4. Creator submit for review.
    $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.submitForReview', [$collaboration, $submission]))
        ->assertRedirect();
    expect($submission->fresh()->status)->toBe(ContentSubmissionStatus::InReview);

    // 5. UMKM approve → escrow hold (payment PendingProof tercipta).
    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.submissions.approve', [$collaboration, $submission]))
        ->assertRedirect();

    $this->assertDatabaseHas('collaboration_payments', [
        'collaboration_id' => $collaboration->id,
        'status' => PaymentStatus::PendingProof->value,
        'amount' => '1500000.00',
    ]);

    // 6. UMKM upload bukti transfer → AwaitingConfirmation.
    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.payment.proof', $collaboration), [
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
            'note' => 'Transfer BCA',
        ])
        ->assertRedirect();
    expect($collaboration->fresh()->payment->status)->toBe(PaymentStatus::AwaitingConfirmation);

    // 7. Creator konfirmasi → escrow release (Confirmed).
    $this->actingAs($creator)
        ->post(route('creator.collaborations.payment.confirm', $collaboration))
        ->assertRedirect();
    expect($collaboration->fresh()->payment->status)->toBe(PaymentStatus::Confirmed);

    // 8. UMKM menyelesaikan kolaborasi.
    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.complete', $collaboration))
        ->assertRedirect();

    expect($collaboration->fresh()->status)->toBe(CollaborationStatus::Completed);
});

// ---------------------------------------------------------------------------
// P2-19: cross-role payment access control — peran tidak boleh menyentuh
// rute pembayaran peran lain, dan UMKM lain tidak boleh mengakses kolaborasi
// milik UMKM berbeda.
// ---------------------------------------------------------------------------

test('creator cannot upload payment proof via UMKM route (role boundary)', function (): void {
    [, $creator, , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $this->actingAs($creator)
        ->post(route('umkm.collaborations.payment.proof', $collaboration), [
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ])
        ->assertForbidden();
});

test('umkm cannot confirm payment via creator route (role boundary)', function (): void {
    [$umkm, , , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $this->actingAs($umkm)
        ->post(route('creator.collaborations.payment.confirm', $collaboration))
        ->assertForbidden();
});

test('another umkm cannot access payment of a collaboration they do not own', function (): void {
    [$umkmA, , , $collaboration] = makeCollabForPayment();
    approveSubmissionForPayment($collaboration);

    $umkmB = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);
    UmkmProfile::factory()->for($umkmB, 'user')->create();

    $this->actingAs($umkmB)
        ->from(route('umkm.collaborations.show', $collaboration))
        ->post(route('umkm.collaborations.payment.proof', $collaboration), [
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ])
        ->assertForbidden();

    expect($collaboration->fresh()->payment->status)->toBe(PaymentStatus::PendingProof);
});
