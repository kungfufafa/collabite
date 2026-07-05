<?php

declare(strict_types=1);

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\ContentSubmission;
use App\Models\CreatorProfile;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Notifications\CollaborationCancelledNotification;
use App\Notifications\CollaborationRequestCancelledNotification;
use Illuminate\Support\Facades\Notification;

function makeActiveCollaboration(): array
{
    $umkmUser = User::factory()->withRole(UserRole::Umkm)->create();
    $umkmProfile = UmkmProfile::factory()->for($umkmUser, 'user')->create();
    $creatorUser = User::factory()->withRole(UserRole::Creator)->create();
    CreatorProfile::factory()->for($creatorUser, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->for($umkmProfile, 'umkmProfile')->create([
        'category_id' => $category->id,
        'status' => CampaignStatus::InCollaboration,
    ]);
    $collaboration = Collaboration::create([
        'campaign_id' => $campaign->id,
        'umkm_id' => $umkmUser->id,
        'creator_id' => $creatorUser->id,
        'status' => CollaborationStatus::Active,
        'started_at' => now(),
    ]);

    return [$umkmUser, $creatorUser, $campaign, $collaboration];
}

test('umkm can cancel active collaboration and notifies creator', function (): void {
    Notification::fake();

    [$umkm, $creator, $campaign, $collaboration] = makeActiveCollaboration();

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.cancel', $collaboration), [
            'reason' => 'Creator tidak responsif sama sekali.',
        ])
        ->assertRedirect();

    $collaboration->refresh();
    $campaign->refresh();

    expect($collaboration->status)->toBe(CollaborationStatus::Cancelled)
        ->and($campaign->status)->toBe(CampaignStatus::Open);

    Notification::assertSentTo($creator, CollaborationCancelledNotification::class);
    Notification::assertNotSentTo($umkm, CollaborationCancelledNotification::class);
});

test('creator can cancel active collaboration and notifies umkm', function (): void {
    Notification::fake();

    [$umkm, $creator, $campaign, $collaboration] = makeActiveCollaboration();

    $this->actingAs($creator)
        ->post(route('creator.collaborations.cancel', $collaboration), [
            'reason' => 'Brief tidak sesuai ekspektasi kami.',
        ])
        ->assertRedirect();

    Notification::assertSentTo($umkm, CollaborationCancelledNotification::class);
    Notification::assertNotSentTo($creator, CollaborationCancelledNotification::class);
});

test('collaboration cannot be cancelled after submission approved', function (): void {
    [$umkm, $creator, $campaign, $collaboration] = makeActiveCollaboration();

    ContentSubmission::create([
        'collaboration_id' => $collaboration->id,
        'version' => 1,
        'title' => 'Final',
        'status' => ContentSubmissionStatus::Approved,
        'submitted_at' => now(),
        'approved_at' => now(),
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.cancel', $collaboration), [
            'reason' => 'Ingin batalkan setelah approve.',
        ])
        ->assertSessionHasErrors('collaboration');
});

test('umkm can cancel pending invitation and notifies creator', function (): void {
    Notification::fake();

    $umkmUser = User::factory()->withRole(UserRole::Umkm)->create();
    $umkmProfile = UmkmProfile::factory()->for($umkmUser, 'user')->create();
    $creatorUser = User::factory()->withRole(UserRole::Creator)->create();
    CreatorProfile::factory()->for($creatorUser, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->for($umkmProfile, 'umkmProfile')->create([
        'category_id' => $category->id,
        'status' => CampaignStatus::Open,
        'published_at' => now(),
    ]);

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creatorUser->id,
        'sender_id' => $umkmUser->id,
        'type' => CollaborationRequestType::Invitation,
        'status' => 'pending',
        'message' => 'Kami mengundang Anda.',
    ]);

    $this->actingAs($umkmUser)
        ->post(route('umkm.requests.cancel-invitation', $request))
        ->assertRedirect();

    expect($request->fresh()->status->value)->toBe('cancelled_by_umkm');

    Notification::assertSentTo(
        $creatorUser,
        CollaborationRequestCancelledNotification::class,
        fn (CollaborationRequestCancelledNotification $notification): bool => $notification->cancelledByRole === 'cancelled_by_umkm',
    );
});

test('creator cancel application notifies umkm', function (): void {
    Notification::fake();

    $umkmUser = User::factory()->withRole(UserRole::Umkm)->create();
    $umkmProfile = UmkmProfile::factory()->for($umkmUser, 'user')->create();
    $creatorUser = User::factory()->withRole(UserRole::Creator)->create();
    CreatorProfile::factory()->for($creatorUser, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->for($umkmProfile, 'umkmProfile')->create([
        'category_id' => $category->id,
        'status' => CampaignStatus::Open,
        'published_at' => now(),
    ]);

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creatorUser->id,
        'sender_id' => $creatorUser->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    $this->actingAs($creatorUser)
        ->post(route('creator.requests.cancel', $request))
        ->assertRedirect();

    Notification::assertSentTo(
        $umkmUser,
        CollaborationRequestCancelledNotification::class,
        fn (CollaborationRequestCancelledNotification $notification): bool => $notification->cancelledByRole === 'cancelled_by_creator',
    );
});
