<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Actions\Review\StoreReviewAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\StoreReviewRequest;
use App\Models\Collaboration;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Review dari sudut UMKM (FR-REVIEW-001).
 */
class ReviewsController extends Controller
{
    public function index(Request $request): Response
    {
        $umkm = $request->user()->umkmProfile()->firstOrFail();
        $reviews = Review::query()
            ->with(['collaboration.campaign', 'reviewer'])
            ->where('reviewee_id', $request->user()->id)
            ->where('is_hidden', false)
            ->latest()
            ->paginate(15);

        return Inertia::render('Umkm/Reviews/Index', [
            'reviews' => $reviews->through(fn ($r): array => [
                'id' => $r->id,
                'rating' => $r->rating,
                'body' => $r->body,
                'reviewer' => ['id' => $r->reviewer->id, 'name' => $r->reviewer->name],
                'campaign' => ['id' => $r->collaboration->campaign->id, 'title' => $r->collaboration->campaign->title],
                'created_at' => $r->created_at->toDateTimeString(),
            ])->all(),
        ]);
    }

    public function storeForUmkm(StoreReviewRequest $request, Collaboration $collaboration): RedirectResponse
    {
        // Disatukan dengan CollaborationsController::storeReview — biarkan sebagai alias.
        return app(CollaborationsController::class)->storeReview($request, $collaboration, app(StoreReviewAction::class));
    }
}
