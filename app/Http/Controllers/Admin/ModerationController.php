<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use App\Models\Review;
use App\Services\AuditLogger;
use App\Services\FileUrlService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
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
            ->tap(fn ($q) => $this->scopeVisibility($q, $request))
            ->latest()
            ->paginate(20)
            ->appends(['status' => $request->input('status', 'visible')]);
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
            'filter' => $request->input('status', 'visible'),
        ]);
    }

    public function toggleCampaignHide(Request $request, Campaign $campaign): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        $previous = (bool) $campaign->is_hidden;
        $campaign->update(['is_hidden' => ! $campaign->is_hidden]);

        app(AuditLogger::class)->log($request->user(), 'campaign.moderation.hide_toggled', $campaign->fresh(), [
            'previous_is_hidden' => $previous,
            'new_is_hidden' => ! $previous,
        ]);

        return back()->with('status', 'Status hide campaign diperbarui.');
    }

    public function content(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $submissions = ContentSubmission::query()->with(['collaboration.campaign', 'collaboration.creator'])
            ->tap(fn ($q) => $this->scopeVisibility($q, $request))
            ->latest()
            ->paginate(20)
            ->appends(['status' => $request->input('status', 'visible')]);
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
            'filter' => $request->input('status', 'visible'),
        ]);
    }

    public function toggleSubmissionHide(Request $request, ContentSubmission $submission): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        $previous = (bool) $submission->is_hidden;
        $submission->update(['is_hidden' => ! $submission->is_hidden]);

        app(AuditLogger::class)->log($request->user(), 'submission.moderation.hide_toggled', $submission->fresh(), [
            'previous_is_hidden' => $previous,
            'new_is_hidden' => ! $previous,
        ]);

        return back()->with('status', 'Status hide submission diperbarui.');
    }

    public function reviews(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $reviews = Review::query()->with(['collaboration.campaign', 'reviewer', 'reviewee'])
            ->tap(fn ($q) => $this->scopeVisibility($q, $request))
            ->latest()
            ->paginate(20)
            ->appends(['status' => $request->input('status', 'visible')]);
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
            'filter' => $request->input('status', 'visible'),
        ]);
    }

    /**
     * Filter visibilitas: ?status=visible (default) | hidden | all.
     * Default `visible` agar admin dapat menemukan item baru untuk di-hide,
     * bukan hanya melihat item yang sudah disembunyikan.
     *
     * @param  Builder<Model>  $query
     */
    private function scopeVisibility($query, Request $request): void
    {
        $status = $request->input('status', 'visible');

        if ($status === 'hidden') {
            $query->where('is_hidden', true);
        } elseif ($status === 'all') {
            // tanpa filter
        } else {
            $query->where('is_hidden', false);
        }
    }

    public function toggleReviewHide(Request $request, Review $review): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        $previous = (bool) $review->is_hidden;
        $review->update(['is_hidden' => ! $review->is_hidden]);

        app(AuditLogger::class)->log($request->user(), 'review.moderation.hide_toggled', $review->fresh(), [
            'previous_is_hidden' => $previous,
            'new_is_hidden' => ! $previous,
        ]);

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
