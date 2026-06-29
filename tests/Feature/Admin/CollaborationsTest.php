<?php

declare(strict_types=1);

use App\Actions\Collaboration\AcceptRequestAction;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\CreatorProfile;
use App\Models\Review;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Notifications\CollaborationForceClosedNotification;
use Illuminate\Support\Facades\Notification;

function makeActiveCollabForAdmin(): array
{
    $umkm = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);
    $umkmProfile = UmkmProfile::factory()->for($umkm, 'user')->create();
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->for($umkmProfile, 'umkmProfile')->create([
        'category_id' => $category->id,
        'status' => CampaignStatus::Open,
        'published_at' => now(),
    ]);
    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);
    app(AcceptRequestAction::class)->execute($request);
    $collaboration = Collaboration::firstOrFail();

    return [$umkm, $creator, $campaign, $collaboration];
}

test('admin can list collaborations via admin namespace', function (): void {
    [, , , $collaboration] = makeActiveCollabForAdmin();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->get(route('admin.collaborations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Collaborations/Index')
            ->where('collaborations.data.0.id', $collaboration->id),
        );
});

test('admin can view a specific collaboration via admin namespace', function (): void {
    [, , , $collaboration] = makeActiveCollabForAdmin();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->get(route('admin.collaborations.show', $collaboration))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Collaborations/Show')
            ->where('collaboration.id', $collaboration->id),
        );
});

test('admin cannot use UMKM accept/reject routes (403 via role middleware)', function (): void {
    [, , , $collaboration] = makeActiveCollabForAdmin();
    // Build a separate campaign owned by the same UMKM to host the pending request.
    $otherCampaign = Campaign::factory()
        ->for($collaboration->campaign->umkmProfile, 'umkmProfile')
        ->create([
            'category_id' => $collaboration->campaign->category_id,
            'status' => CampaignStatus::Open,
            'published_at' => now(),
        ]);
    $otherCreator = User::factory()->withRole(UserRole::Creator)->create();
    CreatorProfile::factory()->for($otherCreator, 'user')->create();
    $pendingReq = CollaborationRequest::create([
        'campaign_id' => $otherCampaign->id,
        'creator_id' => $otherCreator->id,
        'sender_id' => $collaboration->umkm_id,
        'type' => CollaborationRequestType::Invitation,
        'status' => 'pending',
    ]);
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('umkm.requests.accept', $pendingReq->id))
        ->assertForbidden();

    $this->actingAs($admin)
        ->post(route('umkm.requests.reject', $pendingReq->id), ['reason' => 'tidak relevan'])
        ->assertForbidden();

    expect($pendingReq->fresh()->status->value)->toBe('pending');
});

test('admin cannot use Creator accept/reject routes (403 via role middleware)', function (): void {
    [, , , $collaboration] = makeActiveCollabForAdmin();

    // Use a fresh campaign + creator pair so the unique pending-request constraint isn't hit.
    $otherCampaign = Campaign::factory()
        ->for($collaboration->campaign->umkmProfile, 'umkmProfile')
        ->create([
            'category_id' => $collaboration->campaign->category_id,
            'status' => CampaignStatus::Open,
            'published_at' => now(),
        ]);
    $otherCreator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($otherCreator, 'user')->create();

    $req = CollaborationRequest::create([
        'campaign_id' => $otherCampaign->id,
        'creator_id' => $otherCreator->id,
        'sender_id' => $collaboration->umkm_id,
        'type' => CollaborationRequestType::Invitation,
        'status' => 'pending',
    ]);
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('creator.collaborations.requests.accept', [$collaboration->id, $req->id]))
        ->assertForbidden();

    $this->actingAs($admin)
        ->post(route('creator.collaborations.requests.reject', [$collaboration->id, $req->id]))
        ->assertForbidden();
});

test('admin can force-close an active collaboration with a reason', function (): void {
    Notification::fake();
    [$umkm, $creator, $campaign, $collaboration] = makeActiveCollabForAdmin();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Disengketakan secara eksternal',
        ])
        ->assertRedirect();

    $collaboration->refresh();
    expect($collaboration->status)->toBe(CollaborationStatus::Cancelled)
        ->and($collaboration->cancelled_by)->toBe($admin->id)
        ->and($collaboration->cancelled_reason)->toContain('Disengketakan secara eksternal');

    $campaign->refresh();
    expect($campaign->status)->toBe(CampaignStatus::Open);

    Notification::assertSentTo($umkm, CollaborationForceClosedNotification::class);
    Notification::assertSentTo($creator, CollaborationForceClosedNotification::class);

    expect(ActivityLog::where('action', 'collaboration.force_closed')->count())->toBe(1);
});

test('force-close requires a non-empty reason of at least 10 characters', function (): void {
    [, , , $collaboration] = makeActiveCollabForAdmin();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->from(route('admin.collaborations.show', $collaboration))
        ->post(route('admin.collaborations.force-close', $collaboration), ['reason' => ''])
        ->assertSessionHasErrors('reason');

    $this->actingAs($admin)
        ->from(route('admin.collaborations.show', $collaboration))
        ->post(route('admin.collaborations.force-close', $collaboration), ['reason' => 'short'])
        ->assertSessionHasErrors('reason');

    expect($collaboration->fresh()->status)->toBe(CollaborationStatus::Active);
});

test('force-close cannot apply to an already-cancelled collaboration', function (): void {
    Notification::fake();
    [, , , $collaboration] = makeActiveCollabForAdmin();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    // First force-close succeeds.
    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Pembatalan administratif yang dibenarkan.',
        ])
        ->assertRedirect();

    // Second attempt must fail because the collaboration is no longer active.
    $this->actingAs($admin)
        ->from(route('admin.collaborations.show', $collaboration))
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Coba ulang yang seharusnya gagal.',
        ])
        ->assertSessionHasErrors('collaboration');
});

test('force-close cannot apply to a completed collaboration', function (): void {
    [, , , $collaboration] = makeActiveCollabForAdmin();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $collaboration->submissions()->create([
        'version' => 1,
        'title' => 'final',
        'status' => ContentSubmissionStatus::Approved,
        'approved_at' => now(),
    ]);
    $collaboration->update([
        'status' => CollaborationStatus::Completed,
        'completed_at' => now(),
    ]);

    $this->actingAs($admin)
        ->from(route('admin.collaborations.show', $collaboration))
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Mestinya ditolak karena sudah completed.',
        ])
        ->assertSessionHasErrors('collaboration');
});

test('non-admin users cannot call force-close', function (): void {
    [$umkm, $creator, , $collaboration] = makeActiveCollabForAdmin();

    $this->actingAs($umkm)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Mestinya 403 karena bukan admin.',
        ])
        ->assertForbidden();

    $this->actingAs($creator)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Mestinya 403 karena bukan admin.',
        ])
        ->assertForbidden();
});

test('admin can list hidden reviews through admin moderation namespace', function (): void {
    Notification::fake();
    [, , , $collaboration] = makeActiveCollabForAdmin();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $review = Review::create([
        'collaboration_id' => $collaboration->id,
        'reviewer_id' => $collaboration->umkm_id,
        'reviewee_id' => $collaboration->creator_id,
        'rating' => 5,
        'body' => 'Test review',
        'is_hidden' => true,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.moderation.reviews'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviews/Index')
            ->where('reviews.data.0.id', $review->id)
            ->where('reviews.data.0.reviewer.id', $collaboration->umkm_id)
            ->where('reviews.data.0.reviewee.id', $collaboration->creator_id)
        );
});

test('admin can unhide a review via the moderation endpoint', function (): void {
    [, , , $collaboration] = makeActiveCollabForAdmin();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $review = Review::create([
        'collaboration_id' => $collaboration->id,
        'reviewer_id' => $collaboration->umkm_id,
        'reviewee_id' => $collaboration->creator_id,
        'rating' => 5,
        'body' => 'Test review',
        'is_hidden' => true,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.moderation.reviews.hide', $review))
        ->assertRedirect();

    $review->refresh();
    expect($review->is_hidden)->toBeFalse();
});

test('force-close preserves messages, submissions, progress, and reviews', function (): void {
    Notification::fake();
    [$umkm, $creator, , $collaboration] = makeActiveCollabForAdmin();

    $collaboration->conversation->messages()->create([
        'sender_id' => $umkm->id,
        'body' => 'Pesan sebelum force-close',
    ]);
    $collaboration->progressUpdates()->create([
        'creator_id' => $creator->id,
        'message' => 'Sedang mengerjakan',
    ]);
    $submission = $collaboration->submissions()->create([
        'version' => 1,
        'title' => 'Draft 1',
        'status' => ContentSubmissionStatus::InReview,
        'submitted_at' => now(),
    ]);

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Disengketakan secara eksternal',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('messages', ['body' => 'Pesan sebelum force-close']);
    $this->assertDatabaseHas('collaboration_progress_updates', ['message' => 'Sedang mengerjakan']);
    $this->assertDatabaseHas('content_submissions', ['id' => $submission->id, 'status' => 'in_review']);
});
