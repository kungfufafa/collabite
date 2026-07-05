<?php

declare(strict_types=1);

use App\Actions\Collaboration\AcceptRequestAction;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\CreatorProfile;
use App\Models\CreatorVerification;
use App\Models\Review;
use App\Models\UmkmProfile;
use App\Models\User;

/**
 * @return array{
 *     umkm: User,
 *     umkmProfile: UmkmProfile,
 *     creator: User,
 *     creatorProfile: CreatorProfile,
 *     admin: User,
 *     category: Category,
 *     campaign: Campaign,
 *     collaboration: Collaboration,
 *     verification: CreatorVerification,
 *     review: Review,
 * }
 */
function makeSmokeFixtures(): array
{
    $umkm = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);
    $umkmProfile = UmkmProfile::factory()->for($umkm, 'user')->create();
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $creatorProfile = CreatorProfile::factory()->for($creator, 'user')->create();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);
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
        'message' => 'Smoke test application',
    ]);

    app(AcceptRequestAction::class)->execute($request);
    $collaboration = Collaboration::firstOrFail();
    $verification = CreatorVerification::create([
        'creator_profile_id' => $creatorProfile->id,
        'status' => VerificationStatus::Pending,
        'submitted_at' => now(),
    ]);
    $review = Review::create([
        'collaboration_id' => $collaboration->id,
        'reviewer_id' => $collaboration->umkm_id,
        'reviewee_id' => $collaboration->creator_id,
        'rating' => 5,
        'body' => 'Smoke test review',
        'is_hidden' => true,
    ]);

    return compact(
        'umkm',
        'umkmProfile',
        'creator',
        'creatorProfile',
        'admin',
        'category',
        'campaign',
        'collaboration',
        'verification',
        'review',
    );
}

test('public and guest inertia pages respond successfully', function (): void {
    $this->get('/')->assertOk()->assertInertia(fn ($page) => $page
        ->component('Public/Welcome')
        ->has('featuredCreators')
        ->has('heroSpotlight')
        ->has('featuredCampaign')
        ->has('categories'));
    $this->get('/creators')->assertOk()->assertInertia(fn ($page) => $page->component('Public/CreatorDirectory'));
    $this->get('/kebijakan-privasi')->assertOk()->assertInertia(fn ($page) => $page->component('Public/PrivacyPolicy'));
    $this->get('/syarat-dan-ketentuan')->assertOk()->assertInertia(fn ($page) => $page->component('Public/TermsOfService'));
    $this->get('/login')->assertOk()->assertInertia(fn ($page) => $page->component('Auth/Login'));
    $this->get('/register')->assertOk()->assertInertia(fn ($page) => $page->component('Auth/Register'));
    $this->get('/forgot-password')->assertOk()->assertInertia(fn ($page) => $page->component('Auth/ForgotPassword'));
});

test('umkm portal pages respond successfully', function (): void {
    $fixtures = makeSmokeFixtures();

    $paths = [
        '/dashboard' => null,
        '/umkm/dashboard' => 'Umkm/Dashboard/Index',
        '/umkm/profile' => 'Umkm/Profile/Edit',
        '/umkm/products' => 'Umkm/Products/Index',
        '/umkm/campaigns' => 'Umkm/Campaigns/Index',
        '/umkm/campaigns/create' => 'Umkm/Campaigns/Form',
        '/umkm/campaigns/'.$fixtures['campaign']->id => 'Umkm/Campaigns/Show',
        '/umkm/campaigns/'.$fixtures['campaign']->id.'/edit' => 'Umkm/Campaigns/Form',
        '/umkm/discover' => 'Umkm/Discover/Index',
        '/umkm/reviews' => 'Umkm/Reviews/Index',
        '/umkm/collaborations' => 'Umkm/Collaborations/Index',
        '/umkm/collaborations/'.$fixtures['collaboration']->id => 'Umkm/Collaborations/Show',
        '/settings/profile' => 'settings/profile',
        '/settings/security' => 'settings/security',
        '/settings/appearance' => 'settings/appearance',
        '/creators/'.$fixtures['creatorProfile']->id => 'Public/CreatorProfile',
        '/umkm/'.$fixtures['umkmProfile']->id => 'Public/UmkmProfile',
    ];

    foreach ($paths as $path => $component) {
        $response = $this->actingAs($fixtures['umkm'])
            ->withSession(['auth.password_confirmed_at' => time()])
            ->get($path);

        if ($path === '/dashboard') {
            $response->assertRedirect(route('umkm.dashboard'));

            continue;
        }

        $response->assertOk();

        if ($component !== null) {
            $response->assertInertia(fn ($page) => $page->component($component));
        }
    }
});

test('creator portal pages respond successfully', function (): void {
    $fixtures = makeSmokeFixtures();

    $paths = [
        '/dashboard' => null,
        '/creator/dashboard' => 'Creator/Dashboard/Index',
        '/creator/profile' => 'Creator/Profile/Edit',
        '/creator/portfolio' => 'Creator/Portfolio/Index',
        '/creator/skills' => 'Creator/Skills/Edit',
        '/creator/verification' => 'Creator/Verification/Show',
        '/creator/campaigns' => 'Creator/Campaigns/Index',
        '/creator/campaigns/'.$fixtures['campaign']->id => 'Creator/Campaigns/Show',
        '/creator/requests' => 'Creator/Requests/Index',
        '/creator/collaborations' => 'Creator/Collaborations/Index',
        '/creator/collaborations/'.$fixtures['collaboration']->id => 'Creator/Collaborations/Show',
        '/settings/profile' => 'settings/profile',
        '/settings/security' => 'settings/security',
        '/settings/appearance' => 'settings/appearance',
    ];

    foreach ($paths as $path => $component) {
        $response = $this->actingAs($fixtures['creator'])
            ->withSession(['auth.password_confirmed_at' => time()])
            ->get($path);

        if ($path === '/dashboard') {
            $response->assertRedirect(route('creator.dashboard'));

            continue;
        }

        $response->assertOk();

        if ($component !== null) {
            $response->assertInertia(fn ($page) => $page->component($component));
        }
    }
});

test('admin portal pages respond successfully', function (): void {
    $fixtures = makeSmokeFixtures();

    $paths = [
        '/dashboard' => null,
        '/admin/dashboard' => 'Admin/Dashboard/Index',
        '/admin/users' => 'Admin/Users/Index',
        '/admin/verifications' => 'Admin/Verifications/Index',
        '/admin/verifications/'.$fixtures['verification']->id => 'Admin/Verifications/Show',
        '/admin/moderation/campaigns' => 'Admin/Campaigns/Index',
        '/admin/moderation/content' => 'Admin/Content/Index',
        '/admin/moderation/reviews' => 'Admin/Reviews/Index',
        '/admin/audit-logs' => 'Admin/AuditLogs/Index',
        '/admin/reports' => 'Admin/Reports/Index',
        '/admin/collaborations' => 'Admin/Collaborations/Index',
        '/admin/collaborations/'.$fixtures['collaboration']->id => 'Admin/Collaborations/Show',
        '/settings/profile' => 'settings/profile',
        '/settings/appearance' => 'settings/appearance',
    ];

    foreach ($paths as $path => $component) {
        $response = $this->actingAs($fixtures['admin'])->get($path);

        if ($path === '/dashboard') {
            $response->assertRedirect(route('admin.dashboard'));

            continue;
        }

        $response->assertOk();

        if ($component !== null) {
            $response->assertInertia(fn ($page) => $page->component($component));
        }
    }
});
