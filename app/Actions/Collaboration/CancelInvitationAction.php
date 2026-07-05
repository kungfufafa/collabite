<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationRequestType;
use App\Models\CollaborationRequest;
use App\Models\User;
use App\Notifications\CollaborationRequestCancelledNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * UMKM membatalkan undangan pending (TDD §15.2, CancelledByUmkm).
 */
class CancelInvitationAction
{
    public function execute(CollaborationRequest $request, User $umkm): CollaborationRequest
    {
        if ($request->status !== CollaborationRequestStatus::Pending) {
            throw ValidationException::withMessages(['request' => 'Request ini sudah tidak pending.']);
        }

        if ($request->type !== CollaborationRequestType::Invitation) {
            throw ValidationException::withMessages(['request' => 'Hanya undangan yang dapat dibatalkan oleh UMKM.']);
        }

        $ownerId = $request->campaign->umkmProfile?->user_id;

        if ($ownerId !== $umkm->id) {
            throw ValidationException::withMessages(['request' => 'Hanya UMKM pemilik campaign yang dapat membatalkan undangan.']);
        }

        $request->update([
            'status' => CollaborationRequestStatus::CancelledByUmkm,
            'responded_at' => now(),
        ]);

        Notification::sendNow(
            $request->creator,
            new CollaborationRequestCancelledNotification($request->fresh(['campaign', 'creator']), 'cancelled_by_umkm'),
        );

        return $request->fresh();
    }
}
