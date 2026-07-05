<?php

declare(strict_types=1);

use App\Actions\Collaboration\AcceptRequestAction;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\CreatorProfile;
use App\Models\UmkmProfile;
use App\Models\User;

/**
 * @return array{umkm: User, creator: User, collaboration: Collaboration}
 */
function makeNotificationFixtures(): array
{
    $umkm = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);
    UmkmProfile::factory()->for($umkm, 'user')->create();
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->for($umkm->umkmProfile, 'umkmProfile')->create([
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

    return compact('umkm', 'creator', 'collaboration');
}

test('guests are redirected from notifications pages', function (): void {
    $this->get(route('notifications.index'))->assertRedirect(route('login'));
});

test('verified user can view notifications index', function (): void {
    ['umkm' => $umkm] = makeNotificationFixtures();

    $this->actingAs($umkm)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->has('notifications.data')
            ->has('unread_count'),
        );
});

test('user can view notification detail and it is marked as read', function (): void {
    ['umkm' => $umkm, 'collaboration' => $collaboration] = makeNotificationFixtures();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Kolaborasi tidak sesuai kebijakan platform.',
        ])
        ->assertRedirect();

    $notification = $umkm->notifications()->firstOrFail();

    expect($notification->read_at)->toBeNull();

    $this->actingAs($umkm)
        ->get(route('notifications.show', $notification->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Notifications/Show')
            ->where('notification.id', $notification->id)
            ->where('notification.is_read', true)
            ->where('notification.type', 'collaboration.force_closed'),
        );

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('user cannot view another users notification', function (): void {
    ['umkm' => $umkm, 'creator' => $creator, 'collaboration' => $collaboration] = makeNotificationFixtures();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Kolaborasi tidak sesuai kebijakan platform.',
        ])
        ->assertRedirect();

    $notification = $umkm->notifications()->firstOrFail();

    $this->actingAs($creator)
        ->get(route('notifications.show', $notification->id))
        ->assertNotFound();
});

test('user can mark all notifications as read', function (): void {
    ['umkm' => $umkm, 'collaboration' => $collaboration] = makeNotificationFixtures();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.collaborations.force-close', $collaboration), [
            'reason' => 'Kolaborasi tidak sesuai kebijakan platform.',
        ])
        ->assertRedirect();

    expect($umkm->unreadNotifications()->count())->toBe(1);

    $this->actingAs($umkm)
        ->post(route('notifications.read-all'))
        ->assertRedirect(route('notifications.index'));

    expect($umkm->fresh()->unreadNotifications()->count())->toBe(0);
});
