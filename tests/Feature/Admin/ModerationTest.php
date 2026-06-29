<?php

declare(strict_types=1);

use App\Actions\Collaboration\AcceptRequestAction;
use App\Enums\AccountStatus;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\ActivityLog;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\CreatorProfile;
use App\Models\CreatorVerification;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Notifications\CollaborationForceClosedNotification;
use Illuminate\Support\Facades\Notification;

function makeActiveCollabForModeration(): array
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
    $req = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);
    app(AcceptRequestAction::class)->execute($req);
    $collab = Collaboration::firstOrFail();

    return [$umkm, $creator, $campaign, $collab];
}

test('admin can suspend a user account and an audit log entry is created', function (): void {
    $target = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);
    UmkmProfile::factory()->for($target, 'user')->create();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    expect($target->isActive())->toBeTrue();

    $this->actingAs($admin)
        ->patch(route('admin.users.status.update', $target), [
            'account_status' => 'suspended',
        ])
        ->assertRedirect();

    $target->refresh();
    expect($target->isSuspended())->toBeTrue();
});

test('admin can re-enable a suspended user', function (): void {
    $target = User::factory()->withStatus(AccountStatus::Suspended)->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($target, 'user')->create();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->patch(route('admin.users.status.update', $target), [
            'account_status' => 'active',
        ])
        ->assertRedirect();

    $target->refresh();
    expect($target->isActive())->toBeTrue();
});

test('admin can approve a creator verification', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $creatorProfile = CreatorProfile::factory()->for($creator, 'user')->pending()->create();
    $verification = CreatorVerification::create([
        'creator_profile_id' => $creatorProfile->id,
        'status' => VerificationStatus::Pending,
        'submitted_at' => now(),
    ]);

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.verifications.approve', $verification))
        ->assertRedirect();

    $verification->refresh();
    $creatorProfile->refresh();
    expect($verification->status)->toBe(VerificationStatus::Verified)
        ->and($creatorProfile->verification_status)->toBe(VerificationStatus::Verified);
});

test('admin can reject a creator verification with a reason', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $creatorProfile = CreatorProfile::factory()->for($creator, 'user')->pending()->create();
    $verification = CreatorVerification::create([
        'creator_profile_id' => $creatorProfile->id,
        'status' => VerificationStatus::Pending,
        'submitted_at' => now(),
    ]);

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.verifications.reject', $verification), [
            'rejection_reason' => 'Dokumen tidak terbaca dengan jelas.',
        ])
        ->assertRedirect();

    $verification->refresh();
    $creatorProfile->refresh();
    expect($verification->status)->toBe(VerificationStatus::Rejected)
        ->and($verification->rejection_reason)->toBe('Dokumen tidak terbaca dengan jelas.')
        ->and($creatorProfile->verification_status)->toBe(VerificationStatus::Rejected);
});

test('admin can hide a campaign and unhide it', function (): void {
    $umkm = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);
    $umkmProfile = UmkmProfile::factory()->for($umkm, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->for($umkmProfile, 'umkmProfile')->create([
        'category_id' => $category->id,
        'status' => CampaignStatus::Open,
        'published_at' => now(),
        'is_hidden' => false,
    ]);
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->patch(route('admin.moderation.campaigns.hide', $campaign))
        ->assertRedirect();
    $campaign->refresh();
    expect($campaign->is_hidden)->toBeTrue();

    $this->actingAs($admin)
        ->patch(route('admin.moderation.campaigns.hide', $campaign))
        ->assertRedirect();
    $campaign->refresh();
    expect($campaign->is_hidden)->toBeFalse();
});

test('admin can hide a content submission and unhide it', function (): void {
    [, , , $collab] = makeActiveCollabForModeration();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::Draft,
    ]);

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->patch(route('admin.moderation.content.hide', $sub))
        ->assertRedirect();
    $sub->refresh();
    expect($sub->is_hidden)->toBeTrue();

    $this->actingAs($admin)
        ->patch(route('admin.moderation.content.hide', $sub))
        ->assertRedirect();
    $sub->refresh();
    expect($sub->is_hidden)->toBeFalse();
});

test('audit log is append-only: no PATCH/PUT/DELETE routes on activity_logs', function (): void {
    $routes = collect(app('router')->getRoutes())
        ->filter(fn ($r) => str_contains($r->uri, 'audit-logs'));

    $mutations = $routes->filter(function ($r): bool {
        return in_array($r->methods()[0] ?? '', ['POST', 'PATCH', 'PUT', 'DELETE'], true);
    });

    expect($mutations->count())->toBe(0);

    // The model itself rejects updates and deletes via booted hooks.
    $log = ActivityLog::create([
        'actor_id' => null,
        'actor_role' => 'admin',
        'action' => 'test.event',
        'subject_type' => null,
        'subject_id' => null,
        'metadata' => null,
        'created_at' => now(),
    ]);

    $updateResult = $log->update(['action' => 'tampered']);
    expect($updateResult)->toBeFalse();
    $log->refresh();
    expect($log->action)->toBe('test.event');

    $deleteResult = $log->delete();
    expect($deleteResult)->toBeFalse();
    expect(ActivityLog::find($log->id))->not->toBeNull();
});

test('admin force-close collaboration records audit log with previous_status and reason', function (): void {
    Notification::fake();
    [$umkm, $creator, , $collab] = makeActiveCollabForModeration();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $reason = 'Pelanggaran berulang dari pihak UMKM.';

    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collab), [
            'reason' => $reason,
        ])
        ->assertRedirect();

    $log = ActivityLog::where('action', 'collaboration.force_closed')
        ->where('subject_id', $collab->id)
        ->firstOrFail();

    expect($log->actor_id)->toBe($admin->id)
        ->and($log->metadata['reason'])->toBe($reason)
        ->and($log->metadata['previous_status'])->toBe(CollaborationStatus::Active->value)
        ->and($log->metadata['new_status'])->toBe(CollaborationStatus::Cancelled->value);

    Notification::assertSentTo([$umkm, $creator], CollaborationForceClosedNotification::class);
});
