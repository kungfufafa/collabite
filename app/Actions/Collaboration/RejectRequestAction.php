<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationRequestType;
use App\Models\CollaborationRequest;
use App\Models\User;
use App\Notifications\CollaborationRequestRejectedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class RejectRequestAction
{
    public function execute(CollaborationRequest $request, ?string $reason = null, ?User $rejectedBy = null): CollaborationRequest
    {
        if ($request->status !== CollaborationRequestStatus::Pending) {
            throw ValidationException::withMessages(['request' => 'Request ini sudah tidak pending.']);
        }

        $request->update([
            'status' => CollaborationRequestStatus::Rejected,
            'responded_at' => now(),
            'message' => $reason ? ($request->message."\n\n[Reject reason] ".$reason) : $request->message,
        ]);

        // Notifikasi dikirim ke pengirim request (yang ditolak):
        //   invitation -> dikirim UMKM, ditolak Creator -> pemberitahuan ke UMKM.
        //   application -> dikirim Creator, ditolak UMKM -> pemberitahuan ke Creator.
        // Actor (penolak) adalah pihak yang merespons: kebalikan dari pengirim.
        $request->load('creator', 'campaign.umkmProfile.user');
        $umkm = $request->campaign?->umkmProfile?->user;
        $isInvitation = $request->type === CollaborationRequestType::Invitation;

        $recipient = $isInvitation ? $umkm : $request->creator;
        $actor = $rejectedBy ?? ($isInvitation ? $request->creator : $umkm);

        if ($recipient !== null && $actor !== null) {
            DB::afterCommit(fn () => Notification::send(
                $recipient,
                new CollaborationRequestRejectedNotification($request, $actor, $reason),
            ));
        }

        return $request;
    }
}
