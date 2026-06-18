<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\ContentSubmission;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin: moderasi campaign, content submission, review, message.
 */
class ModerationController extends Controller
{
    public function campaigns(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $campaigns = Campaign::query()->with('umkmProfile')
            ->where('is_hidden', true)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Campaigns/Index', [
            'campaigns' => $campaigns->through(fn (Campaign $c): array => [
                'id' => $c->id,
                'title' => $c->title,
                'umkm' => $c->umkmProfile?->business_name,
                'status' => $c->status->value,
                'is_hidden' => $c->is_hidden,
            ])->all(),
        ]);
    }

    public function toggleCampaignHide(Request $request, Campaign $campaign): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        $campaign->update(['is_hidden' => ! $campaign->is_hidden]);

        return back()->with('status', 'Status hide campaign diperbarui.');
    }

    public function content(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $submissions = ContentSubmission::query()->with(['collaboration.campaign', 'collaboration.creator'])
            ->where('is_hidden', true)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Content/Index', [
            'submissions' => $submissions->through(fn (ContentSubmission $s): array => [
                'id' => $s->id,
                'version' => $s->version,
                'title' => $s->title,
                'campaign' => $s->collaboration->campaign->title,
                'creator' => $s->collaboration->creator->name,
                'is_hidden' => $s->is_hidden,
            ])->all(),
        ]);
    }

    public function toggleSubmissionHide(Request $request, ContentSubmission $submission): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        $submission->update(['is_hidden' => ! $submission->is_hidden]);

        return back()->with('status', 'Status hide submission diperbarui.');
    }

    public function reviews(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $reviews = Review::query()->with(['collaboration.campaign', 'reviewer', 'reviewee'])
            ->where('is_hidden', true)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews->through(fn (Review $r): array => [
                'id' => $r->id,
                'rating' => $r->rating,
                'body' => $r->body,
                'reviewer' => $r->reviewer->name,
                'reviewee' => $r->reviewee->name,
                'is_hidden' => $r->is_hidden,
            ])->all(),
        ]);
    }

    public function toggleReviewHide(Request $request, Review $review): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        $review->update(['is_hidden' => ! $review->is_hidden]);

        return back()->with('status', 'Status hide review diperbarui.');
    }
}
