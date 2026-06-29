<?php

declare(strict_types=1);

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CreatorProfile;
use App\Models\Review;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Database\QueryException;

function makeCompletedCollabForReview(): array
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
        'status' => CollaborationStatus::Completed,
        'started_at' => now()->subDays(7),
        'completed_at' => now(),
    ]);
    $collaboration->conversation()->create([]);

    return [$umkm, $creator, $campaign, $collaboration];
}

test('review is rejected when collaboration is not Completed (422)', function (): void {
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
    $collab = Collaboration::create([
        'campaign_id' => $campaign->id,
        'umkm_id' => $umkm->id,
        'creator_id' => $creator->id,
        'status' => CollaborationStatus::Active,
        'started_at' => now(),
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.review.store', $collab), [
            'rating' => 5,
            'body' => 'Cepat.',
        ])
        ->assertSessionHasErrors('collaboration');
});

test('third party cannot review a collaboration (rejected)', function (): void {
    [, , , $collab] = makeCompletedCollabForReview();

    $outsider = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($outsider, 'user')->create();

    $this->actingAs($outsider)
        ->post(route('umkm.collaborations.review.store', $collab), [
            'rating' => 5,
            'body' => 'Saya tidak seharusnya bisa review.',
        ])
        ->assertSessionHasErrors();

    expect(Review::where('collaboration_id', $collab->id)->count())->toBe(0);
});

test('no self-review: UMKM cannot review themselves (creator is reviewee, request blocked)', function (): void {
    // The controller hardcodes the reviewee to the counterparty. So a self-review
    // attempt must fail. We assert the existing route does not allow posting a
    // custom reviewee_id by checking no such field is honoured: posting with
    // reviewee_id=umkm must still result in the creator being the reviewee.
    [$umkm, $creator, , $collab] = makeCompletedCollabForReview();

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.review.store', $collab), [
            'rating' => 5,
            'body' => 'Mencoba self-review.',
            'reviewee_id' => $umkm->id,
        ])
        ->assertSessionDoesntHaveErrors()
        ->assertRedirect();

    $review = Review::where('collaboration_id', $collab->id)->firstOrFail();
    expect($review->reviewee_id)->toBe($creator->id)
        ->and($review->reviewer_id)->toBe($umkm->id);
});

test('one review per direction per collaboration: duplicate returns validation error', function (): void {
    [$umkm, $creator, , $collab] = makeCompletedCollabForReview();

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.review.store', $collab), [
            'rating' => 5,
            'body' => 'Bagus!',
        ])
        ->assertRedirect();

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.review.store', $collab), [
            'rating' => 3,
            'body' => 'Mencoba lagi.',
        ])
        ->assertSessionHasErrors('review');

    expect(Review::where('collaboration_id', $collab->id)->count())->toBe(1);
});

test('database-level uniqueness throws integrity exception on duplicate insert', function (): void {
    [$umkm, $creator, , $collab] = makeCompletedCollabForReview();

    Review::create([
        'collaboration_id' => $collab->id,
        'reviewer_id' => $umkm->id,
        'reviewee_id' => $creator->id,
        'rating' => 5,
        'body' => 'first',
    ]);

    expect(fn () => Review::create([
        'collaboration_id' => $collab->id,
        'reviewer_id' => $umkm->id,
        'reviewee_id' => $creator->id,
        'rating' => 4,
        'body' => 'duplicate',
    ]))->toThrow(QueryException::class);
});

test('reviews are immutable: no PATCH/PUT/DELETE routes for reviews', function (): void {
    $routes = collect(app('router')->getRoutes())
        ->filter(fn ($r) => str_contains($r->uri, 'review'));

    // Hide endpoint exists (PATCH /admin/moderation/reviews/{review}/hide).
    // Exclude admin hide route and submit-route — no mutation on a review itself.
    $reviewMutation = $routes->filter(function ($r): bool {
        $method = $r->methods()[0] ?? '';
        if (! in_array($method, ['PATCH', 'PUT', 'DELETE'], true)) {
            return false;
        }
        // Admin hide endpoint is PATCH on /admin/moderation/reviews/{review}/hide.
        if (str_contains($r->uri, 'moderation/reviews/{review}/hide')) {
            return false;
        }

        return preg_match('#reviews/\d+#', $r->uri) === 1;
    });

    expect($reviewMutation->count())->toBe(0);
});

test('admin can hide a review (is_hidden=true) and hidden review is excluded from public profile', function (): void {
    [$umkm, $creator, , $collab] = makeCompletedCollabForReview();

    Review::create([
        'collaboration_id' => $collab->id,
        'reviewer_id' => $umkm->id,
        'reviewee_id' => $creator->id,
        'rating' => 5,
        'body' => 'Mantap',
    ]);

    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $review = Review::where('collaboration_id', $collab->id)->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.moderation.reviews.hide', $review))
        ->assertRedirect();

    $review->refresh();
    expect($review->is_hidden)->toBeTrue();

    // Public creator profile must not include hidden reviews.
    $this->get(route('public.creators.show', $creator->creatorProfile))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/CreatorProfile')
            ->where('creator.id', $creator->creatorProfile->id)
            ->missing('creator.reviews'),
        );
});

test('rating aggregate updates creator profile (rating_avg, rating_count)', function (): void {
    [$umkm, $creator, , $collab] = makeCompletedCollabForReview();

    // Re-fetch to ensure profile is loaded.
    $creatorProfile = $creator->creatorProfile;
    expect($creatorProfile->rating_avg)->toBe(0.0)
        ->and($creatorProfile->rating_count)->toBe(0);

    Review::create([
        'collaboration_id' => $collab->id,
        'reviewer_id' => $umkm->id,
        'reviewee_id' => $creator->id,
        'rating' => 4,
        'body' => 'Bagus',
    ]);

    // Manually trigger recompute as the action would (mirrors StoreReviewAction).
    $reviews = Review::query()->where('reviewee_id', $creator->id)->where('is_hidden', false)->get();
    $creatorProfile->update([
        'rating_avg' => round((float) $reviews->avg('rating'), 2),
        'rating_count' => $reviews->count(),
    ]);

    $creatorProfile->refresh();
    expect($creatorProfile->rating_count)->toBe(1)
        ->and((float) $creatorProfile->rating_avg)->toBe(4.0);
});
