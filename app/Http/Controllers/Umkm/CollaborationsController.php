<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Actions\Collaboration\AcceptRequestAction;
use App\Actions\Collaboration\CancelCollaborationAction;
use App\Actions\Collaboration\InviteCreatorAction;
use App\Actions\Collaboration\RejectRequestAction;
use App\Actions\Content\ApproveSubmissionAction;
use App\Actions\Content\RequestRevisionAction;
use App\Actions\Content\SubmitForReviewAction;
use App\Actions\Review\CompleteCollaborationAction;
use App\Actions\Review\StoreReviewAction;
use App\Enums\CollaborationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Collaboration\CancelCollaborationRequest;
use App\Http\Requests\Collaboration\InviteCreatorRequest;
use App\Http\Requests\Collaboration\ReviewRequest;
use App\Http\Requests\Collaboration\SendMessageRequest;
use App\Http\Requests\Collaboration\StoreProgressRequest;
use App\Http\Requests\Content\StoreSubmissionRequest;
use App\Http\Requests\Content\SubmitForReviewRequest;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use App\Models\MessageAttachment;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kolaborasi untuk UMKM (FR-COLLAB-*, FR-CONTENT-*, FR-REVIEW-001).
 */
class CollaborationsController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function index(Request $request): Response
    {
        $collaborations = Collaboration::query()
            ->with(['campaign', 'creator'])
            ->where('umkm_id', $request->user()->id)
            ->latest()
            ->paginate(10);
        $collaborations->setCollection(
            $collaborations->getCollection()->map(fn (Collaboration $c): array => [
                'id' => $c->id,
                'campaign' => ['id' => $c->campaign->id, 'title' => $c->campaign->title],
                'creator' => ['id' => $c->creator->id, 'name' => $c->creator->name],
                'status' => $c->status->value,
                'status_label' => $c->status->label(),
                'started_at' => $c->started_at?->toDateTimeString(),
                'completed_at' => $c->completed_at?->toDateTimeString(),
                'cancelled_at' => $c->cancelled_at?->toDateTimeString(),
            ]),
        );

        return Inertia::render('Umkm/Collaborations/Index', [
            'collaborations' => $collaborations,
        ]);
    }

    public function show(Request $request, Collaboration $collaboration): Response
    {
        $this->authorize('view', $collaboration);
        $collaboration->load([
            'campaign',
            'creator',
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
            ->with(['sender', 'attachments'])
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m): array => [
                'id' => $m->id,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->sender?->name,
                'body' => $m->body,
                'created_at' => $m->created_at->toIso8601String(),
                'read_at' => $m->read_at?->toIso8601String(),
                'attachments' => $m->attachments->map(fn (MessageAttachment $a): array => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'mime_type' => $a->mime_type,
                    'size' => $a->size,
                    'url' => $this->files->privateUrl($a->file_path),
                ])->all(),
            ]) ?? collect();

        if ($conversation) {
            $conversation->messages()
                ->where('sender_id', '!=', $request->user()->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

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
                        'url' => $this->files->privateUrl($f->file_path),
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
        ]);
    }

    public function invite(InviteCreatorRequest $request, InviteCreatorAction $action): RedirectResponse
    {
        $umkm = $request->user()->umkmProfile()->firstOrFail();
        $action->execute($umkm, $request->validated());

        return back()->with('status', 'Undangan terkirim.');
    }

    public function inviteByCampaign(InviteCreatorRequest $request, InviteCreatorAction $action): RedirectResponse
    {
        $umkm = $request->user()->umkmProfile()->firstOrFail();
        $action->execute($umkm, $request->validated());

        return back()->with('status', 'Undangan terkirim.');
    }

    public function acceptRequest(Request $request, Collaboration $collaboration, CollaborationRequest $requestModel, AcceptRequestAction $action): RedirectResponse
    {
        $user = $request->user();
        abort_unless(
            $user->is($collaboration->umkm) || $user->is($collaboration->creator),
            403,
        );
        $action->execute($requestModel);

        return back()->with('status', 'Pengajuan diterima.');
    }

    public function rejectRequest(Request $request, Collaboration $collaboration, CollaborationRequest $requestModel, RejectRequestAction $action): RedirectResponse
    {
        $user = $request->user();
        abort_unless(
            $user->is($collaboration->umkm) || $user->is($collaboration->creator),
            403,
        );
        $action->execute($requestModel, $request->input('reason'));

        return back()->with('status', 'Pengajuan ditolak.');
    }

    public function acceptByRequest(Request $request, CollaborationRequest $requestModel, AcceptRequestAction $action): RedirectResponse
    {
        $user = $request->user();
        $campaign = $requestModel->campaign()->with('umkmProfile')->first();
        $allowed = $user->isAdmin()
            || ($campaign && $campaign->umkmProfile?->user_id === $user->id)
            || $user->is($requestModel->creator);
        abort_unless($allowed, 403);
        $action->execute($requestModel);

        return back()->with('status', 'Pengajuan diterima.');
    }

    public function rejectByRequest(Request $request, CollaborationRequest $requestModel, RejectRequestAction $action): RedirectResponse
    {
        $user = $request->user();
        $campaign = $requestModel->campaign()->with('umkmProfile')->first();
        $allowed = $user->isAdmin()
            || ($campaign && $campaign->umkmProfile?->user_id === $user->id)
            || $user->is($requestModel->creator);
        abort_unless($allowed, 403);
        $action->execute($requestModel, $request->input('reason'));

        return back()->with('status', 'Pengajuan ditolak.');
    }

    public function sendMessage(SendMessageRequest $request, Collaboration $collaboration): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        abort_if($collaboration->status === CollaborationStatus::Completed || $collaboration->status === CollaborationStatus::Cancelled, 422, 'Kolaborasi tidak aktif.');

        $conversation = $collaboration->conversation()->firstOrCreate([]);
        $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);
        $conversation->update(['last_message_at' => now()]);

        return back()->with('status', 'Pesan terkirim.');
    }

    public function storeProgress(StoreProgressRequest $request, Collaboration $collaboration): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        // Progress update biasanya oleh Creator; UMKM tidak boleh.
        abort(403);
    }

    public function storeSubmission(StoreSubmissionRequest $request, Collaboration $collaboration): RedirectResponse
    {
        // Submission oleh Creator; UMKM tidak boleh.
        abort(403);
    }

    public function submitForReview(SubmitForReviewRequest $request, Collaboration $collaboration, ContentSubmission $submission, SubmitForReviewAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($submission);

        return back()->with('status', 'Submission dikirim untuk review.');
    }

    public function requestRevision(Request $request, Collaboration $collaboration, ContentSubmission $submission, RequestRevisionAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($submission, $request->user(), $request->input('note', ''));

        return back()->with('status', 'Permintaan revisi dikirim.');
    }

    public function approveSubmission(Request $request, Collaboration $collaboration, ContentSubmission $submission, ApproveSubmissionAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($submission);

        return back()->with('status', 'Submission disetujui.');
    }

    public function complete(Request $request, Collaboration $collaboration, CompleteCollaborationAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($collaboration, $request->user());

        return back()->with('status', 'Kolaborasi selesai.');
    }

    public function storeReview(ReviewRequest $request, Collaboration $collaboration, StoreReviewAction $action): RedirectResponse
    {
        return self::storeReviewStatic($request, $collaboration, $action);
    }

    /**
     * Static entrypoint for cross-controller delegation (e.g. Umkm\ReviewsController::storeForUmkm).
     */
    public static function storeReviewStatic(Request $request, Collaboration $collaboration, StoreReviewAction $action): RedirectResponse
    {
        $reviewer = $request->user();
        $reviewee = $reviewer->is($collaboration->umkm)
            ? $collaboration->creator
            : $collaboration->umkm;
        $action->execute($collaboration, $reviewer, $reviewee, $request->validated());

        return back()->with('status', 'Review terkirim.');
    }

    public function cancel(CancelCollaborationRequest $request, Collaboration $collaboration, CancelCollaborationAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($collaboration, $request->user(), $request->validated('reason'));

        return back()->with('status', 'Kolaborasi dibatalkan.');
    }
}
