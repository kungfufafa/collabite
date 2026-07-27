<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Actions\Collaboration\AcceptRequestAction;
use App\Actions\Collaboration\CancelCollaborationAction;
use App\Actions\Collaboration\CancelInvitationAction;
use App\Actions\Collaboration\InviteCreatorAction;
use App\Actions\Collaboration\RejectRequestAction;
use App\Actions\Content\ApproveSubmissionAction;
use App\Actions\Content\RequestRevisionAction;
use App\Actions\Payment\EnsureCollaborationPaymentAction;
use App\Actions\Payment\SubmitPaymentProofAction;
use App\Actions\Review\CompleteCollaborationAction;
use App\Actions\Review\StoreReviewAction;
use App\Enums\CollaborationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Collaboration\AcceptCollaborationTermsRequest;
use App\Http\Requests\Collaboration\CancelCollaborationRequest;
use App\Http\Requests\Collaboration\InviteCreatorRequest;
use App\Http\Requests\Collaboration\ReviewRequest;
use App\Http\Requests\Collaboration\SendMessageRequest;
use App\Http\Requests\Payment\SubmitPaymentProofRequest;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\Review;
use App\Notifications\MessageReceivedNotification;
use App\Services\CollaborationPaymentPresenter;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kolaborasi untuk UMKM (FR-COLLAB-*, FR-CONTENT-*, FR-REVIEW-001).
 */
class CollaborationsController extends Controller
{
    public function __construct(
        private readonly FileUrlService $files,
        private readonly CollaborationPaymentPresenter $paymentPresenter,
    ) {}

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
            'submissions' => fn ($q) => $q->where('is_hidden', false)->orderByDesc('version'),
            'submissions.files',
            'submissions.revisions.umkm',
            'reviews',
            'payment',
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
                    'revisions' => $s->revisions->map(fn ($r): array => [
                        'id' => $r->id,
                        'umkm_name' => $r->umkm?->name,
                        'note' => $r->note,
                        'created_at' => $r->created_at?->toIso8601String(),
                    ])->all(),
                ])->all(),
                'reviews' => $collaboration->reviews->map(fn ($r): array => [
                    'id' => $r->id,
                    'reviewer_id' => $r->reviewer_id,
                    'rating' => $r->rating,
                    'body' => $r->body,
                    'is_hidden' => $r->is_hidden,
                ])->all(),
                'payment' => $this->paymentPresenter->present($collaboration->payment),
                'budget' => $collaboration->campaign->budget,
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

    public function acceptRequest(AcceptCollaborationTermsRequest $request, Collaboration $collaboration, CollaborationRequest $requestModel, AcceptRequestAction $action): RedirectResponse
    {
        abort_unless($requestModel->campaign_id === $collaboration->campaign_id, 404);
        $action->execute($requestModel, $request->user(), $this->termsConsentPayload());

        return back()->with('status', 'Pengajuan diterima. Kolaborasi dimulai.');
    }

    public function rejectRequest(Request $request, Collaboration $collaboration, CollaborationRequest $requestModel, RejectRequestAction $action): RedirectResponse
    {
        abort_unless($requestModel->campaign_id === $collaboration->campaign_id, 404);
        $this->authorize('respond', $requestModel);
        $action->execute($requestModel, $request->input('reason'), $request->user());

        return back()->with('status', 'Pengajuan ditolak.');
    }

    public function acceptByRequest(AcceptCollaborationTermsRequest $request, CollaborationRequest $collaborationRequest, AcceptRequestAction $action): RedirectResponse
    {
        $action->execute($collaborationRequest, $request->user(), $this->termsConsentPayload());

        return back()->with('status', 'Pengajuan diterima. Kolaborasi dimulai.');
    }

    public function rejectByRequest(Request $request, CollaborationRequest $collaborationRequest, RejectRequestAction $action): RedirectResponse
    {
        $this->authorize('respond', $collaborationRequest);
        $action->execute($collaborationRequest, $request->input('reason'), $request->user());

        return back()->with('status', 'Pengajuan ditolak.');
    }

    public function sendMessage(SendMessageRequest $request, Collaboration $collaboration): RedirectResponse
    {
        $this->authorize('view', $collaboration);
        abort_if($collaboration->status === CollaborationStatus::Completed || $collaboration->status === CollaborationStatus::Cancelled, 422, 'Kolaborasi tidak aktif.');

        $conversation = $collaboration->conversation()->firstOrCreate([]);
        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);
        $this->storeMessageAttachments($request, $message);
        $conversation->update(['last_message_at' => now()]);

        $message->load('conversation.collaboration.campaign', 'sender', 'attachments');
        $recipient = $collaboration->creator;
        DB::afterCommit(fn () => Notification::send($recipient, new MessageReceivedNotification($message)));

        return back()->with('status', 'Pesan terkirim.');
    }

    /**
     * Simpan lampiran pesan (maks 5 file) ke disk private.
     */
    private function storeMessageAttachments(Request $request, Message $message): void
    {
        foreach ($request->file('attachments', []) as $file) {
            $path = $this->files->storePrivate($file, 'message', $message->id);
            $message->attachments()->create([
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                'size' => $file->getSize() ?? 0,
            ]);
        }
    }

    public function requestRevision(Request $request, Collaboration $collaboration, ContentSubmission $submission, RequestRevisionAction $action): RedirectResponse
    {
        abort_unless($submission->collaboration->is($collaboration), 404);
        abort_if($collaboration->status === CollaborationStatus::Completed || $collaboration->status === CollaborationStatus::Cancelled, 422, 'Kolaborasi tidak aktif.');
        $this->authorize('requestRevision', $submission);
        $action->execute($submission, $request->user(), (string) $request->input('note', ''));

        return back()->with('status', 'Permintaan revisi dikirim.');
    }

    public function approveSubmission(
        Request $request,
        Collaboration $collaboration,
        ContentSubmission $submission,
        ApproveSubmissionAction $action,
        EnsureCollaborationPaymentAction $ensurePayment,
    ): RedirectResponse {
        abort_unless($submission->collaboration->is($collaboration), 404);
        abort_if($collaboration->status === CollaborationStatus::Completed || $collaboration->status === CollaborationStatus::Cancelled, 422, 'Kolaborasi tidak aktif.');
        $this->authorize('approve', $submission);
        $action->execute($submission, $request->user());

        if (config('collabite.manual_payment_enabled')) {
            $ensurePayment->execute($collaboration);
        }

        return back()->with('status', 'Submission disetujui.');
    }

    public function submitPaymentProof(
        SubmitPaymentProofRequest $request,
        Collaboration $collaboration,
        SubmitPaymentProofAction $action,
    ): RedirectResponse {
        abort_unless(config('collabite.manual_payment_enabled'), 404);
        $this->authorize('view', $collaboration);

        // Record pembayaran hanya tercipta saat submission disetujui (escrow hold).
        // Upload bukti sebelum approve ditolak untuk menjaga urutan state machine.
        $payment = $collaboration->payment;
        if ($payment === null) {
            abort(422, 'Record pembayaran belum tersedia.');
        }

        $this->authorize('submitProof', $payment);
        $action->execute($payment, $request->user(), $request->validated());

        return back()->with('status', 'Bukti pembayaran terkirim.');
    }

    public function complete(Request $request, Collaboration $collaboration, CompleteCollaborationAction $action): RedirectResponse
    {
        $this->authorize('complete', $collaboration);
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
        // Enforce ReviewPolicy::create (status completed + pihak kolaborasi) sebagai
        // ValidationException agar konsisten dengan kontrak respons Inertia (session
        // errors) — pertahanan kedua tetap ada di StoreReviewAction.
        $gate = Gate::inspect('create', [Review::class, $collaboration]);
        if (! $gate->allowed()) {
            throw ValidationException::withMessages(['collaboration' => $gate->message() ?? 'Tidak dapat memberi review.']);
        }

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

    public function cancelInvitation(
        Request $request,
        CollaborationRequest $collaborationRequest,
        CancelInvitationAction $action,
    ): RedirectResponse {
        $this->authorize('cancelInvitation', $collaborationRequest);
        $action->execute($collaborationRequest, $request->user());

        return back()->with('status', 'Undangan dibatalkan.');
    }

    /**
     * @return array{terms_accepted: bool, terms_version: string, terms_accepted_at: string}
     */
    private function termsConsentPayload(): array
    {
        return [
            'terms_accepted' => true,
            'terms_version' => (string) config('collabite.terms_version'),
            'terms_accepted_at' => now()->toIso8601String(),
        ];
    }
}
