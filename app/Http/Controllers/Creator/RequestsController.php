<?php

declare(strict_types=1);

namespace App\Http\Controllers\Creator;

use App\Actions\Collaboration\AcceptRequestAction;
use App\Actions\Collaboration\CancelApplicationAction;
use App\Actions\Collaboration\RejectRequestAction;
use App\Enums\CollaborationRequestStatus;
use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inbox lamaran & undangan untuk Creator.
 */
class RequestsController extends Controller
{
    public function index(Request $request): Response
    {
        $requests = CollaborationRequest::query()
            ->with(['campaign.umkmProfile.user'])
            ->where('creator_id', $request->user()->id)
            ->where('status', CollaborationRequestStatus::Pending)
            ->latest()
            ->get()
            ->map(fn (CollaborationRequest $req): array => [
                'id' => $req->id,
                'type' => $req->type->value,
                'type_label' => $req->type->value === 'invitation' ? 'Undangan UMKM' : 'Lamaran Anda',
                'message' => $req->message,
                'created_at' => $req->created_at->toIso8601String(),
                'campaign' => [
                    'id' => $req->campaign->id,
                    'title' => $req->campaign->title,
                    'budget' => $req->campaign->budget,
                ],
                'umkm' => [
                    'name' => $req->campaign->umkmProfile?->business_name
                        ?? $req->campaign->umkmProfile?->user?->name
                        ?? 'UMKM',
                ],
            ]);

        return Inertia::render('Creator/Requests/Index', [
            'requests' => $requests->all(),
        ]);
    }

    public function accept(Request $httpRequest, CollaborationRequest $collaborationRequest, AcceptRequestAction $action): RedirectResponse
    {
        $this->authorize('respond', $collaborationRequest);
        $action->execute($collaborationRequest);

        return redirect()
            ->route('creator.collaborations.index')
            ->with('status', 'Undangan diterima. Kolaborasi dimulai.');
    }

    public function reject(Request $httpRequest, CollaborationRequest $collaborationRequest, RejectRequestAction $action): RedirectResponse
    {
        $this->authorize('respond', $collaborationRequest);
        $action->execute($collaborationRequest, $httpRequest->input('reason'));

        return back()->with('status', 'Permintaan ditolak.');
    }

    public function cancel(Request $httpRequest, CollaborationRequest $collaborationRequest, CancelApplicationAction $action): RedirectResponse
    {
        $this->authorize('cancel', $collaborationRequest);
        $action->execute($collaborationRequest);

        return back()->with('status', 'Pengajuan dibatalkan.');
    }
}
