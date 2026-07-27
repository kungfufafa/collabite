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
use App\Models\CreatorProfile;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Notifications\ApplicationReceivedNotification;
use App\Notifications\CollaborationRequestAcceptedNotification;
use App\Notifications\CollaborationRequestRejectedNotification;
use App\Notifications\ContentApprovedNotification;
use App\Notifications\ContentRevisionRequestedNotification;
use App\Notifications\ContentSubmittedForReviewNotification;
use App\Notifications\InvitationReceivedNotification;
use App\Notifications\MessageReceivedNotification;
use Illuminate\Support\Facades\Notification;

use function Pest\Laravel\actingAs;

function makeNotifFixtures(): array
{
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
    ]);

    return compact('umkm', 'creator', 'campaign');
}

function makeActiveCollabNotifFixtures(): array
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
    ]);
    $collaboration = Collaboration::create([
        'campaign_id' => $campaign->id,
        'umkm_id' => $umkm->id,
        'creator_id' => $creator->id,
        'status' => CollaborationStatus::Active,
        'started_at' => now(),
    ]);
    $collaboration->conversation()->create([]);

    return compact('umkm', 'creator', 'campaign', 'collaboration');
}

beforeEach(function (): void {
    Notification::fake();
});

test('UMKM invitation notifies the creator', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'campaign' => $campaign] = makeNotifFixtures();

    actingAs($umkm)
        ->post(route('umkm.campaigns.invitations.store', $campaign), [
            'campaign_id' => $campaign->id,
            'creator_id' => $creator->id,
            'message' => 'Mari kolaborasi.',
        ])
        ->assertRedirect();

    Notification::assertSentTo($creator, InvitationReceivedNotification::class);
    Notification::assertNotSentTo($umkm, InvitationReceivedNotification::class);
});

test('creator application notifies the UMKM', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'campaign' => $campaign] = makeNotifFixtures();

    actingAs($creator)
        ->post(route('creator.campaigns.apply', $campaign), [
            'message' => 'Saya tertarik.',
        ])
        ->assertRedirect();

    Notification::assertSentTo($umkm, ApplicationReceivedNotification::class);
    Notification::assertNotSentTo($creator, ApplicationReceivedNotification::class);
});

test('UMKM accepting an application notifies the creator', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'campaign' => $campaign] = makeNotifFixtures();
    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    actingAs($umkm)
        ->post(route('umkm.requests.accept', $request), ['terms_accepted' => '1'])
        ->assertRedirect();

    Notification::assertSentTo($creator, CollaborationRequestAcceptedNotification::class);
});

test('accepting a request auto-rejects other pending requests and notifies their senders', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'campaign' => $campaign] = makeNotifFixtures();
    $otherCreator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($otherCreator, 'user')->create();

    $winner = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);
    $loser = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $otherCreator->id,
        'sender_id' => $otherCreator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    actingAs($umkm)
        ->post(route('umkm.requests.accept', $winner), ['terms_accepted' => '1'])
        ->assertRedirect();

    Notification::assertSentTo($creator, CollaborationRequestAcceptedNotification::class);
    Notification::assertSentTo($otherCreator, CollaborationRequestRejectedNotification::class);
    expect($loser->fresh()->status->value)->toBe('rejected');
});

test('UMKM rejecting an application notifies the creator', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'campaign' => $campaign] = makeNotifFixtures();
    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    actingAs($umkm)
        ->post(route('umkm.requests.reject', $request), ['reason' => 'Budget tidak cocok.'])
        ->assertRedirect();

    Notification::assertSentTo(
        $creator,
        fn (CollaborationRequestRejectedNotification $n, $channels, $notifiable) => $notifiable->is($creator),
    );
});

test('creator rejecting an invitation notifies the UMKM', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'campaign' => $campaign] = makeNotifFixtures();
    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $umkm->id,
        'type' => CollaborationRequestType::Invitation,
        'status' => 'pending',
    ]);

    actingAs($creator)
        ->post(route('creator.requests.reject', $request), ['reason' => 'Sedang sibuk.'])
        ->assertRedirect();

    Notification::assertSentTo(
        $umkm,
        fn (CollaborationRequestRejectedNotification $n, $channels, $notifiable) => $notifiable->is($umkm),
    );
});

test('creator submitting for review notifies the UMKM', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'collaboration' => $collab] = makeActiveCollabNotifFixtures();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::Draft,
    ]);

    actingAs($creator)
        ->post(route('creator.collaborations.submissions.submitForReview', [$collab, $sub]))
        ->assertRedirect();

    Notification::assertSentTo($umkm, ContentSubmittedForReviewNotification::class);
});

test('UMKM requesting a revision notifies the creator', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'collaboration' => $collab] = makeActiveCollabNotifFixtures();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::InReview,
        'submitted_at' => now(),
    ]);

    actingAs($umkm)
        ->post(route('umkm.collaborations.submissions.requestRevision', [$collab, $sub]), [
            'note' => 'Tambah intro.',
        ])
        ->assertRedirect();

    Notification::assertSentTo($creator, ContentRevisionRequestedNotification::class);
});

test('UMKM approving a submission notifies the creator', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'collaboration' => $collab] = makeActiveCollabNotifFixtures();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::InReview,
        'submitted_at' => now(),
    ]);

    actingAs($umkm)
        ->post(route('umkm.collaborations.submissions.approve', [$collab, $sub]))
        ->assertRedirect();

    Notification::assertSentTo($creator, ContentApprovedNotification::class);
});

test('a sent message notifies the other party', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'collaboration' => $collab] = makeActiveCollabNotifFixtures();

    actingAs($umkm)
        ->post(route('umkm.collaborations.messages.store', $collab), ['body' => 'Halo creator.'])
        ->assertRedirect();

    Notification::assertSentTo($creator, MessageReceivedNotification::class);
    Notification::assertNotSentTo($umkm, MessageReceivedNotification::class);
});
