<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PaymentStatus;
use App\Models\CollaborationPayment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CollaborationPaymentPolicy
{
    public function view(User $actor, CollaborationPayment $payment): Response
    {
        $collaboration = $payment->collaboration;

        if ($actor->isAdmin()) {
            return Response::allow();
        }

        return $actor->id === $collaboration->umkm_id || $actor->id === $collaboration->creator_id
            ? Response::allow()
            : Response::deny('Anda tidak berhak melihat pembayaran ini.');
    }

    public function submitProof(User $actor, CollaborationPayment $payment): Response
    {
        if ($actor->id !== $payment->collaboration->umkm_id) {
            return Response::deny('Hanya UMKM yang dapat mengunggah bukti pembayaran.');
        }

        return $payment->status === PaymentStatus::PendingProof
            ? Response::allow()
            : Response::deny('Bukti pembayaran sudah dikirim atau dikonfirmasi.');
    }

    public function confirm(User $actor, CollaborationPayment $payment): Response
    {
        if ($actor->id !== $payment->collaboration->creator_id) {
            return Response::deny('Hanya Creator yang dapat mengonfirmasi pembayaran.');
        }

        return $payment->status === PaymentStatus::AwaitingConfirmation
            ? Response::allow()
            : Response::deny('Pembayaran belum siap dikonfirmasi.');
    }
}
