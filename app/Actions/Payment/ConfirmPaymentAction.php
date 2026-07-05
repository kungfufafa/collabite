<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\Enums\PaymentStatus;
use App\Models\CollaborationPayment;
use App\Models\User;
use App\Notifications\PaymentConfirmedNotification;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class ConfirmPaymentAction
{
    public function execute(CollaborationPayment $payment, User $creatorUser): CollaborationPayment
    {
        if ($creatorUser->id !== $payment->collaboration->creator_id) {
            throw ValidationException::withMessages(['payment' => 'Hanya Creator yang dapat mengonfirmasi pembayaran.']);
        }

        if ($payment->status !== PaymentStatus::AwaitingConfirmation) {
            throw ValidationException::withMessages(['payment' => 'Pembayaran belum siap dikonfirmasi.']);
        }

        $payment->update([
            'status' => PaymentStatus::Confirmed,
            'confirmed_at' => now(),
            'confirmed_by' => $creatorUser->id,
        ]);

        $fresh = $payment->fresh(['collaboration.campaign', 'collaboration.umkm']);

        app(AuditLogger::class)->log(
            $creatorUser,
            'payment.confirmed',
            $fresh,
            ['collaboration_id' => $fresh->collaboration_id, 'amount' => (string) $fresh->amount],
        );

        Notification::send(
            $fresh->collaboration->umkm,
            new PaymentConfirmedNotification($fresh),
        );

        return $fresh;
    }
}
