<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\Enums\PaymentStatus;
use App\Models\CollaborationPayment;
use App\Models\User;
use App\Notifications\PaymentConfirmedNotification;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * Creator mengonfirmasi penerimaan pembayaran (escrow release).
 *
 * Concurrency-safe: lockForUpdate pada baris payment + re-cek status di dalam
 * transaksi mencegah double-confirm akibat double-click (race condition).
 */
class ConfirmPaymentAction
{
    public function execute(CollaborationPayment $payment, User $creatorUser): CollaborationPayment
    {
        if ($creatorUser->id !== $payment->collaboration->creator_id) {
            throw ValidationException::withMessages(['payment' => 'Hanya Creator yang dapat mengonfirmasi pembayaran.']);
        }

        return DB::transaction(function () use ($payment, $creatorUser): CollaborationPayment {
            $locked = CollaborationPayment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== PaymentStatus::AwaitingConfirmation) {
                throw ValidationException::withMessages(['payment' => 'Pembayaran belum siap dikonfirmasi.']);
            }

            $locked->update([
                'status' => PaymentStatus::Confirmed,
                'confirmed_at' => now(),
                'confirmed_by' => $creatorUser->id,
            ]);

            $fresh = $locked->fresh(['collaboration.campaign', 'collaboration.umkm']);

            app(AuditLogger::class)->log(
                $creatorUser,
                'payment.confirmed',
                $fresh,
                ['collaboration_id' => $fresh->collaboration_id, 'amount' => (string) $fresh->amount],
            );

            // Notifikasi setelah commit agar tidak dikirim bila transaksi di-rollback.
            DB::afterCommit(fn () => Notification::send(
                $fresh->collaboration->umkm,
                new PaymentConfirmedNotification($fresh),
            ));

            return $fresh;
        });
    }
}
