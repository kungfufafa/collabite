<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\ForceCloseCollaborationAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ForceCloseCollaborationRequest;
use App\Models\ActivityLog;
use App\Models\Collaboration;
use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin collaboration moderation namespace (UC-ADMIN-010, FR-COLLAB-011).
 *
 * Admin route group keeps role-specific UMKM/Creator routes isolated, while
 * still allowing oversight via dedicated endpoints.
 */
class CollaborationsController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $collaborations = Collaboration::query()
            ->with(['campaign', 'umkm', 'creator'])
            ->latest()
            ->paginate(20);
        $collaborations->setCollection(
            $collaborations->getCollection()->map(fn (Collaboration $c): array => [
                'id' => $c->id,
                'campaign' => ['id' => $c->campaign->id, 'title' => $c->campaign->title],
                'umkm' => ['id' => $c->umkm->id, 'name' => $c->umkm->name],
                'creator' => ['id' => $c->creator->id, 'name' => $c->creator->name],
                'status' => $c->status->value,
                'status_label' => $c->status->label(),
                'started_at' => $c->started_at?->toDateTimeString(),
                'completed_at' => $c->completed_at?->toDateTimeString(),
                'cancelled_at' => $c->cancelled_at?->toDateTimeString(),
                'cancelled_reason' => $c->cancelled_reason,
            ]),
        );

        return Inertia::render('Admin/Collaborations/Index', [
            'collaborations' => $collaborations,
        ]);
    }

    public function show(Request $request, Collaboration $collaboration): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $collaboration->load([
            'campaign.umkmProfile',
            'umkm',
            'creator',
            'conversation.messages.sender',
            'progressUpdates',
            'submissions' => fn ($q) => $q->orderByDesc('version'),
            'submissions.files',
            'submissions.revisions',
            'reviews.reviewer',
            'reviews.reviewee',
        ]);

        $auditLogs = ActivityLog::query()
            ->where('subject_type', Collaboration::class)
            ->where('subject_id', $collaboration->id)
            ->latest()
            ->limit(50)
            ->get(['id', 'actor_id', 'actor_role', 'action', 'metadata', 'created_at']);

        return Inertia::render('Admin/Collaborations/Show', [
            'collaboration' => [
                'id' => $collaboration->id,
                'status' => $collaboration->status->value,
                'status_label' => $collaboration->status->label(),
                'campaign' => [
                    'id' => $collaboration->campaign->id,
                    'title' => $collaboration->campaign->title,
                    'umkm_business' => $collaboration->campaign->umkmProfile?->business_name,
                ],
                'umkm' => ['id' => $collaboration->umkm->id, 'name' => $collaboration->umkm->name],
                'creator' => ['id' => $collaboration->creator->id, 'name' => $collaboration->creator->name],
                'cancelled_at' => $collaboration->cancelled_at?->toIso8601String(),
                'cancelled_reason' => $collaboration->cancelled_reason,
                'messages' => $collaboration->conversation?->messages
                    ->map(fn ($m): array => [
                        'id' => $m->id,
                        'sender_name' => $m->sender?->name,
                        'body' => $m->body,
                        'is_hidden' => $m->is_hidden,
                        'created_at' => $m->created_at->toIso8601String(),
                    ])->all() ?? [],
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
                    'files' => $s->files->map(fn (ContentSubmissionFile $f): array => [
                        'id' => $f->id,
                        'original_name' => $f->original_name,
                        'mime_type' => $f->mime_type,
                        'size' => $f->size,
                        'url' => $this->files->privateUrl($f->file_path),
                    ])->all(),
                ])->all(),
                'reviews' => $collaboration->reviews->map(fn ($r): array => [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'body' => $r->body,
                    'is_hidden' => $r->is_hidden,
                    'reviewer' => $r->reviewer?->name,
                    'reviewee' => $r->reviewee?->name,
                ])->all(),
            ],
            'audit_logs' => $auditLogs->map(fn ($log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'actor_id' => $log->actor_id,
                'actor_role' => $log->actor_role,
                'metadata' => $log->metadata,
                'created_at' => $log->created_at?->toIso8601String(),
            ])->all(),
        ]);
    }

    public function forceClose(ForceCloseCollaborationRequest $request, Collaboration $collaboration, ForceCloseCollaborationAction $action): RedirectResponse
    {
        $action->execute($collaboration, $request->user(), $request->validated('reason'));

        return back()->with('status', 'Kolaborasi ditutup paksa oleh admin.');
    }
}
