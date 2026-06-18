<?php

declare(strict_types=1);

namespace App\Http\Controllers\Creator;

use App\Actions\Collaboration\AcceptRequestAction;
use App\Actions\Collaboration\CancelApplicationAction;
use App\Actions\Collaboration\CancelCollaborationAction;
use App\Actions\Collaboration\RejectRequestAction;
use App\Actions\Content\ResubmitSubmissionAction;
use App\Actions\Content\SubmitForReviewAction;
use App\Actions\Review\StoreReviewAction;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Collaboration\CancelCollaborationRequest;
use App\Http\Requests\Collaboration\ReviewRequest;
use App\Http\Requests\Collaboration\SendMessageRequest;
use App\Http\Requests\Collaboration\StoreProgressRequest;
use App\Http\Requests\Content\ResubmitSubmissionRequest;
use App\Http\Requests\Content\StoreSubmissionRequest;
use App\Http\Requests\Content\SubmitForReviewRequest;
use App\Http\Requests\Creator\ApplyCampaignRequest;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kolaborasi & submission untuk Creator.
 */
class CollaborationsController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function index(Request $request): Response
    {
        $collaborations = Collaboration::query()
            ->with(['campaign', 'umkm'])
            ->where('creator_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Creator/Collaborations/Index', [
            'collaborations' => $collaborations->through(fn (Collaboration $c): array => [
                'id' => $c->id,
                'campaign' => ['id' => $c->campaign->id, 'title' => $c->campaign->title],
                'umkm' => ['id' => $c->umkm->id, 'name' => $c->umkm->name],
                'status' => $c->status->value,
                'status_label' => $c->status->label(),
            ])->all(),
        ]);
    }

    public function show(Request $request, Collaboration $collaboration): Response
    {
        $this->authorize('view', $collaboration);
        $collaboration->load([
            'campaign',
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

        if ($conversation) {
            $conversation->messages()
                ->where('sender_id', '!=', $request->user()->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        return Inertia::render('Creator/Collaborations/Show', [
            'collaboration' => [
                'id' => $collaboration->id,
                'status' => $collaboration->status->value,
                'campaign' => ['id' => $collaboration->campaign->id, 'title' => $collaboration->campaign->title],
                'umkm' => ['id' => $collaboration->umkm->id, 'name' => $collaboration->umkm->name],
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
                    'files' => $s->files->map(fn (ContentSubmissionFile $f): array => [
                        'id' => $f->id,
                        'original_name' => $f->original_name,
                        'mime_type' => $f->mime_type,
                        'size' => $f->size,
                        'url' => $this->files->privateUrl($f->file_path),
                    ])->all(),
                ])->all(),
            ],
        ]);
    }

    public function apply(ApplyCampaignRequest $request, Campaign $campaign): RedirectResponse
    {
        $creator = $request->user()->creatorProfile()->firstOrFail();
        abort_unless($campaign->status === CampaignStatus::Open, 422, 'Campaign tidak terbuka.');

        $existing = CollaborationRequest::query()
            ->where('campaign_id', $campaign->id)
            ->where('creator_id', $request->user()->id)
            ->whereIn('status', ['pending', 'accepted'])
            ->first();
        if ($existing) {
            return back()->withErrors(['campaign' => 'Anda sudah memiliki pengajuan untuk campaign ini.']);
        }

        CollaborationRequest::create([
            'campaign_id' => $campaign->id,
            'creator_id' => $request->user()->id,
            'sender_id' => $request->user()->id,
            'type' => CollaborationRequestType::Application,
            'status' => 'pending',
            'message' => $request->validated('message'),
        ]);

        return back()->with('status', 'Lamaran terkirim.');
    }

    public function acceptRequest(Request $request, Collaboration $collaboration, CollaborationRequest $requestModel, AcceptRequestAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($requestModel);

        return back()->with('status', 'Undangan diterima.');
    }

    public function rejectRequest(Request $request, Collaboration $collaboration, CollaborationRequest $requestModel, RejectRequestAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($requestModel, $request->input('reason'));

        return back()->with('status', 'Undangan ditolak.');
    }

    public function cancelRequest(Request $request, Collaboration $collaboration, CollaborationRequest $requestModel, CancelApplicationAction $action): RedirectResponse
    {
        $action->execute($requestModel);

        return back()->with('status', 'Pengajuan dibatalkan.');
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
        abort_if($collaboration->status === CollaborationStatus::Completed || $collaboration->status === CollaborationStatus::Cancelled, 422);

        $collaboration->progressUpdates()->create([
            'creator_id' => $request->user()->id,
            'message' => $request->validated('message'),
        ]);

        return back()->with('status', 'Progres diperbarui.');
    }

    public function storeSubmission(StoreSubmissionRequest $request, Collaboration $collaboration): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        abort_if($collaboration->status === CollaborationStatus::Completed || $collaboration->status === CollaborationStatus::Cancelled, 422);

        $version = ($collaboration->submissions()->max('version') ?? 0) + 1;

        DB::transaction(function () use ($request, $collaboration, $version): void {
            $submission = $collaboration->submissions()->create([
                'version' => $version,
                'title' => $request->validated('title'),
                'description' => $request->validated('description'),
                'status' => ContentSubmissionStatus::Draft,
            ]);

            foreach ($request->file('files', []) as $file) {
                $path = $this->files->storePrivate($file, 'submission', $submission->id);
                $submission->files()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                    'size' => $file->getSize() ?? 0,
                ]);
            }
        });

        return back()->with('status', "Submission v{$version} berhasil dibuat.");
    }

    public function submitForReview(SubmitForReviewRequest $request, Collaboration $collaboration, ContentSubmission $submission, SubmitForReviewAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($submission);

        return back()->with('status', 'Submission dikirim untuk review.');
    }

    public function resubmit(ResubmitSubmissionRequest $request, Collaboration $collaboration, ContentSubmission $oldSubmission, ResubmitSubmissionAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $new = $action->execute($oldSubmission, $request->validated());

        return back()->with('status', "Submission v{$new->version} dibuat.");
    }

    public function submitReview(ReviewRequest $request, Collaboration $collaboration, StoreReviewAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($collaboration, $request->user(), $collaboration->umkm, $request->validated());

        return back()->with('status', 'Review terkirim.');
    }

    public function cancel(CancelCollaborationRequest $request, Collaboration $collaboration, CancelCollaborationAction $action): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        $action->execute($collaboration, $request->user(), $request->validated('reason'));

        return back()->with('status', 'Kolaborasi dibatalkan.');
    }
}
