<?php

declare(strict_types=1);

use App\Actions\Collaboration\AcceptRequestAction;
use App\Actions\Collaboration\CancelApplicationAction;
use App\Actions\Collaboration\RejectRequestAction;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\CollaborationStatus;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\CreatorProfile;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Validation\ValidationException;

function makeUmkmCampaign(): array
{
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->create(['category_id' => $category->id]);

    return [$user, $profile, $campaign];
}

function makeCreator(): array
{
    $user = User::factory()->withRole(UserRole::Creator)->create();
    $profile = CreatorProfile::factory()->for($user, 'user')->create();

    return [$user, $profile];
}

test('creator can apply to an open campaign', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $this->actingAs($creator)
        ->post(route('creator.campaigns.apply', $campaign), ['message' => 'Saya tertarik'])
        ->assertRedirect();

    $this->assertDatabaseHas('collaboration_requests', [
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'type' => CollaborationRequestType::Application->value,
        'status' => 'pending',
    ]);
});

test('creator cannot apply to a closed campaign', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign(); // draft
    [$creator] = makeCreator();

    $this->actingAs($creator)
        ->post(route('creator.campaigns.apply', $campaign), [])
        ->assertStatus(422);
});

test('duplicate application is rejected', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    $this->actingAs($creator)
        ->from(route('creator.campaigns.show', $campaign))
        ->post(route('creator.campaigns.apply', $campaign), [])
        ->assertSessionHasErrors('campaign');
});

test('UMKM cannot apply (apply is creator-only)', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);

    $this->actingAs($umkm)
        ->post(route('creator.campaigns.apply', $campaign), [])
        ->assertForbidden();
});

test('UMKM can invite a creator to a campaign', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $this->actingAs($umkm)
        ->post(route('umkm.campaigns.invitations.store', $campaign), [
            'campaign_id' => $campaign->id,
            'creator_id' => $creator->id,
            'message' => 'Mau gabung?',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('collaboration_requests', [
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'type' => CollaborationRequestType::Invitation->value,
        'status' => 'pending',
    ]);
});

test('duplicate invitation is rejected with 422', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $umkm->id,
        'type' => CollaborationRequestType::Invitation,
        'status' => 'pending',
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.campaigns.invitations.store', $campaign), [
            'campaign_id' => $campaign->id,
            'creator_id' => $creator->id,
        ])
        ->assertSessionHasErrors('creator_id');
});

test('UMKM cannot invite creator to a non-owned campaign', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $other = User::factory()->withRole(UserRole::Umkm)->create();
    $otherProfile = UmkmProfile::factory()->for($other, 'user')->create();
    $otherCampaign = Campaign::factory()->for($otherProfile, 'umkmProfile')->create([
        'status' => CampaignStatus::Open,
        'published_at' => now(),
    ]);
    [$creator] = makeCreator();

    $this->actingAs($umkm)
        ->post(route('umkm.campaigns.invitations.store', $otherCampaign), [
            'campaign_id' => $otherCampaign->id,
            'creator_id' => $creator->id,
        ])
        ->assertSessionHasErrors('campaign_id');
});

test('creator can cancel a pending application', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    // Use the action directly - the route is bound via a collaboration model
    // that doesn't exist yet.
    app(CancelApplicationAction::class)->execute($request);

    $request->refresh();
    expect($request->status->value)->toBe('cancelled_by_creator')
        ->and($request->responded_at)->not->toBeNull();
});

test('creator cannot cancel an invitation', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $umkm->id,
        'type' => CollaborationRequestType::Invitation,
        'status' => 'pending',
    ]);

    expect(fn () => app(CancelApplicationAction::class)->execute($request))
        ->toThrow(ValidationException::class);
});

test('third party cannot view a collaboration they do not belong to', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();
    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);
    app(AcceptRequestAction::class)->execute($request);
    $collaboration = Collaboration::firstOrFail();

    $intruder = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($intruder, 'user')->create();

    $this->actingAs($intruder)
        ->get(route('umkm.collaborations.show', $collaboration))
        ->assertForbidden();
});

test('admin can view any collaboration', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();
    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);
    app(AcceptRequestAction::class)->execute($request);
    $collaboration = Collaboration::firstOrFail();

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->get(route('admin.collaborations.show', $collaboration))
        ->assertOk();
});

test('admin cannot access UMKM collaboration show route', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();
    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);
    app(AcceptRequestAction::class)->execute($request);
    $collaboration = Collaboration::firstOrFail();

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->get(route('umkm.collaborations.show', $collaboration))
        ->assertForbidden();
});

test('admin cannot accept or reject through UMKM request routes', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $req = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('umkm.requests.accept', $req->id))
        ->assertForbidden();

    $this->actingAs($admin)
        ->post(route('umkm.requests.reject', $req->id), ['reason' => 'tidak relevan'])
        ->assertForbidden();

    $req->refresh();
    expect($req->status->value)->toBe('pending');
});

test('admin can hide a campaign via moderation', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->patch(route('admin.moderation.campaigns.hide', $campaign))
        ->assertRedirect();

    $campaign->refresh();
    expect($campaign->is_hidden)->toBeTrue();
});

test('UMKM can accept an application and form a collaboration', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    app(AcceptRequestAction::class)->execute($request);

    $request->refresh();
    expect($request->status->value)->toBe('accepted');

    $collaboration = Collaboration::where('campaign_id', $campaign->id)->firstOrFail();
    expect($collaboration->status)->toBe(CollaborationStatus::Active)
        ->and($collaboration->umkm_id)->toBe($umkm->id)
        ->and($collaboration->creator_id)->toBe($creator->id)
        ->and($collaboration->conversation)->not->toBeNull();

    $campaign->refresh();
    expect($campaign->status)->toBe(CampaignStatus::InCollaboration);
});

test('accepting auto-rejects other pending requests on the same campaign', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$winner] = makeCreator();
    [$loser] = makeCreator();

    $winnerReq = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $winner->id,
        'sender_id' => $winner->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);
    $loserReq = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $loser->id,
        'sender_id' => $loser->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    app(AcceptRequestAction::class)->execute($winnerReq);

    $winnerReq->refresh();
    $loserReq->refresh();

    expect($winnerReq->status->value)->toBe('accepted')
        ->and($loserReq->status->value)->toBe('rejected');
});

test('only campaign owner can accept an application', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    $other = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($other, 'user')->create();

    // Use the request-keyed route which doesn't require a Collaboration.
    $this->actingAs($other)
        ->post(route('umkm.requests.accept', $request->id))
        ->assertForbidden();
});

test('rejecting an application sets status to rejected', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    app(RejectRequestAction::class)->execute($request, 'Tidak sesuai');

    $request->refresh();
    expect($request->status->value)->toBe('rejected');
});

test('creator can accept an invitation', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $umkm->id,
        'type' => CollaborationRequestType::Invitation,
        'status' => 'pending',
    ]);

    // No collaboration exists yet, so the route binding fails; use action directly.
    app(AcceptRequestAction::class)->execute($request);

    $request->refresh();
    expect($request->status->value)->toBe('accepted');

    $collaboration = Collaboration::where('campaign_id', $campaign->id)->firstOrFail();
    expect($collaboration->status)->toBe(CollaborationStatus::Active);
});

test('re-accepting an already-responded request throws validation', function (): void {
    [$umkm, $profile, $campaign] = makeUmkmCampaign();
    $campaign->update(['status' => CampaignStatus::Open, 'published_at' => now()]);
    [$creator] = makeCreator();

    $request = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'rejected',
    ]);

    expect(fn () => app(AcceptRequestAction::class)->execute($request))
        ->toThrow(ValidationException::class);
});
