<?php

declare(strict_types=1);

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\CollaborationRequest;
use App\Models\CreatorProfile;
use App\Models\UmkmProfile;
use App\Models\User;

function makeUmkm(array $attrs = []): array
{
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();

    return [$user, $profile];
}

test('guests are redirected from UMKM campaigns index', function (): void {
    $this->get(route('umkm.campaigns.index'))->assertRedirect(route('login'));
});

test('verified UMKM sees only their own campaigns', function (): void {
    [$owner, $profile] = makeUmkm();
    $other = User::factory()->withRole(UserRole::Umkm)->create();
    $otherProfile = UmkmProfile::factory()->for($other, 'user')->create();

    Campaign::factory()->for($profile, 'umkmProfile')->create(['title' => 'Mine']);
    Campaign::factory()->for($otherProfile, 'umkmProfile')->create(['title' => 'Other']);

    $this->actingAs($owner)
        ->get(route('umkm.campaigns.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Umkm/Campaigns/Index')
            ->where('campaigns.data.0.title', 'Mine'),
        );
});

test('UMKM can create a campaign with deliverables', function (): void {
    [$owner, $profile] = makeUmkm();
    $category = Category::factory()->create();

    $this->actingAs($owner)
        ->post(route('umkm.campaigns.store'), [
            'title' => 'Launching Product Baru',
            'description' => 'Mencari Creator untuk video TikTok.',
            'category_id' => $category->id,
            'budget' => 1500000,
            'deadline' => now()->addDays(14)->toDateString(),
            'deliverables' => [
                ['title' => '1 video TikTok', 'description' => '60 detik', 'quantity' => 1],
                ['title' => '3 story IG', 'description' => null, 'quantity' => 3],
            ],
        ])
        ->assertRedirect();

    $campaign = Campaign::where('title', 'Launching Product Baru')->firstOrFail();
    expect($campaign->status)->toBe(CampaignStatus::Draft)
        ->and($campaign->umkm_profile_id)->toBe($profile->id);
    expect($campaign->deliverables)->toHaveCount(2);
});

test('UMKM cannot create a campaign for another UMKM category that does not exist', function (): void {
    [$owner] = makeUmkm();

    $this->actingAs($owner)
        ->from(route('umkm.campaigns.create'))
        ->post(route('umkm.campaigns.store'), [
            'title' => 'Test',
            'description' => 'Test',
            'category_id' => 999999,
        ])
        ->assertSessionHasErrors('category_id');
});

test('campaign requires title and description', function (): void {
    [$owner] = makeUmkm();
    $category = Category::factory()->create();

    $this->actingAs($owner)
        ->from(route('umkm.campaigns.create'))
        ->post(route('umkm.campaigns.store'), [
            'title' => '',
            'description' => '',
            'category_id' => $category->id,
        ])
        ->assertSessionHasErrors(['title', 'description']);
});

test('UMKM can update their own campaign', function (): void {
    [$owner, $profile] = makeUmkm();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->create([
        'title' => 'Old',
    ]);

    $this->actingAs($owner)
        ->patch(route('umkm.campaigns.update', $campaign), [
            'title' => 'New',
            'description' => 'Updated description',
            'category_id' => $category->id,
            'budget' => 2500000,
        ])
        ->assertRedirect();

    $campaign->refresh();
    expect($campaign->title)->toBe('New')
        ->and((float) $campaign->budget)->toBe(2500000.0);
});

test('UMKM cannot edit another UMKM campaign', function (): void {
    [$owner] = makeUmkm();
    $other = User::factory()->withRole(UserRole::Umkm)->create();
    $otherProfile = UmkmProfile::factory()->for($other, 'user')->create();
    $campaign = Campaign::factory()->for($otherProfile, 'umkmProfile')->create();

    $this->actingAs($owner)
        ->get(route('umkm.campaigns.edit', $campaign))
        ->assertForbidden();

    $this->actingAs($owner)
        ->patch(route('umkm.campaigns.update', $campaign), [
            'title' => 'Hacked',
            'description' => 'Hacked',
            'category_id' => $campaign->category_id,
        ])
        ->assertForbidden();
});

test('UMKM can publish their draft campaign', function (): void {
    [$owner, $profile] = makeUmkm();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->create();
    $campaign->deliverables()->create(['title' => '1 video', 'quantity' => 1]);

    $this->actingAs($owner)
        ->post(route('umkm.campaigns.publish', $campaign))
        ->assertRedirect();

    $campaign->refresh();
    expect($campaign->status)->toBe(CampaignStatus::Open)
        ->and($campaign->published_at)->not->toBeNull();
});

test('publishing requires at least one deliverable', function (): void {
    [$owner, $profile] = makeUmkm();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->create();

    $this->actingAs($owner)
        ->post(route('umkm.campaigns.publish', $campaign))
        ->assertSessionHasErrors('deliverables');
});

test('UMKM can cancel their open campaign', function (): void {
    [$owner, $profile] = makeUmkm();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->open()->create();

    $this->actingAs($owner)
        ->post(route('umkm.campaigns.cancel', $campaign))
        ->assertRedirect();

    $campaign->refresh();
    expect($campaign->status)->toBe(CampaignStatus::Cancelled);
});

test('cancel rejects pending requests on the campaign', function (): void {
    [$owner, $profile] = makeUmkm();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->open()->create();

    $creator = User::factory()->withRole(UserRole::Creator)->create();
    CreatorProfile::factory()->for($creator, 'user')->create();

    $req = CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'sender_id' => $creator->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    $this->actingAs($owner)
        ->post(route('umkm.campaigns.cancel', $campaign))
        ->assertRedirect();

    $req->refresh();
    expect($req->status->value)->toBe('rejected')
        ->and($req->responded_at)->not->toBeNull();
});

test('creator search only returns open non-hidden campaigns', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    [$owner, $profile] = makeUmkm();

    Campaign::factory()->for($profile, 'umkmProfile')->open()->create(['title' => 'Open One']);
    Campaign::factory()->for($profile, 'umkmProfile')->create(['title' => 'Draft']); // not published
    Campaign::factory()->for($profile, 'umkmProfile')->open()->create(['title' => 'Hidden'])->update(['is_hidden' => true]);

    $this->actingAs($creator)
        ->get(route('creator.campaigns.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Creator/Campaigns/Index')
            ->where('campaigns.data', fn ($data) => collect($data)->pluck('title')->all() === ['Open One']),
        );
});

test('creator search filters by keyword and category', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    [$owner, $profile] = makeUmkm();
    $cat1 = Category::factory()->create(['name' => 'F&B']);
    $cat2 = Category::factory()->create(['name' => 'Fashion']);

    Campaign::factory()->for($profile, 'umkmProfile')->open()->create(['title' => 'Promo Kopi', 'category_id' => $cat1->id]);
    Campaign::factory()->for($profile, 'umkmProfile')->open()->create(['title' => 'Promo Baju', 'category_id' => $cat2->id]);

    $this->actingAs($creator)
        ->get(route('creator.campaigns.index').'?q=Kopi')
        ->assertInertia(fn ($page) => $page
            ->where('campaigns.data.0.title', 'Promo Kopi'),
        );

    $this->actingAs($creator)
        ->get(route('creator.campaigns.index').'?category_id='.$cat2->id)
        ->assertInertia(fn ($page) => $page
            ->where('campaigns.data.0.title', 'Promo Baju'),
        );
});

test('creator can apply to an open campaign', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    [$owner, $profile] = makeUmkm();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->open()->create();

    $this->actingAs($creator)
        ->post(route('creator.campaigns.apply', $campaign), [
            'message' => 'Saya tertarik dan punya portofolio video.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('collaboration_requests', [
        'campaign_id' => $campaign->id,
        'creator_id' => $creator->id,
        'type' => 'application',
        'status' => 'pending',
    ]);
});

test('duplicate application is rejected with error', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    [$owner, $profile] = makeUmkm();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->open()->create();

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

test('creator cannot apply to a draft campaign', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($creator, 'user')->create();
    [$owner, $profile] = makeUmkm();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->create(); // draft

    $this->actingAs($creator)
        ->post(route('creator.campaigns.apply', $campaign), [])
        ->assertStatus(422);
});

test('creator cannot apply to another creator application', function (): void {
    $a = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($a, 'user')->create();
    $b = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($b, 'user')->create();
    [$owner, $profile] = makeUmkm();
    $campaign = Campaign::factory()->for($profile, 'umkmProfile')->open()->create();

    CollaborationRequest::create([
        'campaign_id' => $campaign->id,
        'creator_id' => $a->id,
        'sender_id' => $a->id,
        'type' => CollaborationRequestType::Application,
        'status' => 'pending',
    ]);

    $this->actingAs($b)
        ->post(route('creator.campaigns.apply', $campaign), [])
        ->assertRedirect();

    expect(CollaborationRequest::where('campaign_id', $campaign->id)->count())->toBe(2);
});

test('UMKM discover search filters creators by category, rating, and verified', function (): void {
    [$owner] = makeUmkm();
    $category = Category::factory()->create();
    $verified = User::factory()->withRole(UserRole::Creator)->create();
    $verifiedProfile = CreatorProfile::factory()->for($verified, 'user')->verified()->create([
        'rating_avg' => 4.8,
        'rating_count' => 10,
    ]);
    $verifiedProfile->categories()->attach($category->id);

    $unverified = User::factory()->withRole(UserRole::Creator)->create();
    $unverifiedProfile = CreatorProfile::factory()->for($unverified, 'user')->create([
        'rating_avg' => 3.5,
        'rating_count' => 5,
    ]);

    $this->actingAs($owner)
        ->get(route('umkm.discover.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Umkm/Discover/Index'));

    $this->actingAs($owner)
        ->get(route('umkm.discover.index').'?verified_only=1')
        ->assertInertia(fn ($page) => $page
            ->where('creators.data', fn ($data) => collect($data)->pluck('verification_status')->all() === ['verified']),
        );

    $this->actingAs($owner)
        ->get(route('umkm.discover.index').'?min_rating=4')
        ->assertInertia(fn ($page) => $page
            ->where('creators.data.0.id', $verifiedProfile->id),
        );

    $this->actingAs($owner)
        ->get(route('umkm.discover.index').'?category_id='.$category->id)
        ->assertInertia(fn ($page) => $page
            ->where('creators.data.0.id', $verifiedProfile->id),
        );
});

test('unverified creators are labeled as "Belum terverifikasi" in discover results', function (): void {
    [$owner] = makeUmkm();
    $creator = User::factory()->withRole(UserRole::Creator)->create();
    CreatorProfile::factory()->for($creator, 'user')->create();

    $this->actingAs($owner)
        ->get(route('umkm.discover.index'))
        ->assertInertia(fn ($page) => $page
            ->where('creators.data.0.verification_status', VerificationStatus::Unverified->value),
        );
});
