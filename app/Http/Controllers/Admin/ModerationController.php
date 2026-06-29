<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use App\Models\Review;
use App\Services\FileUrlService;
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
        $campaigns->setCollection(
            $campaigns->getCollection()->map(fn (Campaign $c): array => [
                'id' => $c->id,
                'title' => $c->title,
                'umkm' => $c->umkmProfile?->business_name,
                'status' => $c->status->value,
                'is_hidden' => $c->is_hidden,
            ]),
        );

        return Inertia::render('Admin/Campaigns/Index', [
            'campaigns' => $campaigns,
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
        $submissions->setCollection(
            $submissions->getCollection()->map(fn (ContentSubmission $s): array => [
                'id' => $s->id,
                'version' => $s->version,
                'title' => $s->title,
                'campaign' => $s->collaboration->campaign->title,
                'creator' => $s->collaboration->creator->name,
                'is_hidden' => $s->is_hidden,
            ]),
        );

        return Inertia::render('Admin/Content/Index', [
            'submissions' => $submissions,
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
        $reviews->setCollection(
            $reviews->getCollection()->map(fn (Review $r): array => [
                'id' => $r->id,
                'rating' => $r->rating,
                'body' => $r->body,
                'reviewer' => ['id' => $r->reviewer->id, 'name' => $r->reviewer->name],
                'reviewee' => ['id' => $r->reviewee->id, 'name' => $r->reviewee->name],
                'is_hidden' => $r->is_hidden,
            ]),
        );

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }

    public function toggleReviewHide(Request $request, Review $review): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        $review->update(['is_hidden' => ! $review->is_hidden]);

        return back()->with('status', 'Status hide review diperbarui.');
    }

    public function showCollaboration(Request $request, Collaboration $collaboration): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $collaboration->load([
            'campaign',
            'creator',
            'umkm',
            'conversation.messages.sender',
            'progressUpdates',
            'submissions' => fn ($q) => $q->orderByDesc('version'),
            'submissions.files',
            'submissions.revisions',
            'reviews',
        ]);

        $conversation = $collaboration->conversation;
        $messages = $conversation?->messages()
            ->where('is_hidden', false)
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m): array => [
                'id' => $m->id,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->sender?->name,
                'body' => $m->body,
                'created_at' => $m->created_at->toIso8601String(),
                'read_at' => $m->read_at?->toIso8601String(),
            ]) ?? collect();

        return Inertia::render('Umkm/Collaborations/Show', [
            'collaboration' => [
                'id' => $collaboration->id,
                'status' => $collaboration->status->value,
                'status_label' => $collaboration->status->label(),
                'campaign' => ['id' => $collaboration->campaign->id, 'title' => $collaboration->campaign->title],
                'creator' => [
                    'id' => $collaboration->creator->id,
                    'name' => $collaboration->creator->name,
                ],
                'messages' => $messages->all(),
                'progress' => $collaboration->progressUpdates->map(fn ($p): array => [
                    'id' => $p->id,
                    'message' => $p->message,
                    'created_at' => $p->created_at->toIso8601String(),
                ])->all(),
                'submissions' => $collaboration->submissions->map(fn (ContentSubmission $s): array => [
                    'id' => $s->id,
                    'version' => $s->version,
                    'title' => $s->title,
                    'description' => $s->description,
                    'status' => $s->status->value,
                    'status_label' => $s->status->label(),
                    'submitted_at' => $s->submitted_at?->toIso8601String(),
                    'files' => $s->files->map(fn (ContentSubmissionFile $f): array => [
                        'id' => $f->id,
                        'original_name' => $f->original_name,
                        'mime_type' => $f->mime_type,
                        'size' => $f->size,
                        'url' => app(FileUrlService::class)->privateUrl($f->file_path),
                    ])->all(),
                ])->all(),
                'reviews' => $collaboration->reviews->map(fn ($r): array => [
                    'id' => $r->id,
                    'reviewer_id' => $r->reviewer_id,
                    'rating' => $r->rating,
                    'body' => $r->body,
                    'is_hidden' => $r->is_hidden,
                ])->all(),
            ],
            'isUmkm' => true,
        ]);
    }
}
