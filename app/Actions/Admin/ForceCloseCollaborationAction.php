<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\PaymentStatus;
use App\Models\Collaboration;
use App\Models\CollaborationPayment;
use App\Models\User;
use App\Notifications\CollaborationForceClosedNotification;
use App\Notifications\PaymentRefundedNotification;
use App\Notifications\PaymentVoidedNotification;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * Admin force-close kolaborasi (UC-ADMIN-010, BR-013).
 *
 * - Hanya dapat dipanggil melalui endpoint admin.
 * - Wajib alasan (≥10 karakter divalidasi di Form Request).
 * - Mengizinkan force-close walau ada submission `approved`.
 * - Menyelesaikan record escrow: payment aktif -> Voided, Confirmed -> Refunded.
 * - Mencatat audit log dengan reason, previous_status, dan admin.
 * - Mengirim notifikasi ke UMKM dan Creator.
 */
class ForceCloseCollaborationAction
{
    public function execute(Collaboration $collaboration, User $admin, string $reason): Collaboration
    {
        if (! $admin->isAdmin()) {
            throw ValidationException::withMessages(['admin' => 'Hanya admin yang dapat force close.']);
        }

        if ($collaboration->status !== CollaborationStatus::Active) {
            throw ValidationException::withMessages([
                'collaboration' => 'Force-close hanya berlaku untuk kolaborasi aktif.',
            ]);
        }

        return DB::transaction(function () use ($collaboration, $admin, $reason): Collaboration {
            $previousStatus = $collaboration->status->value;

            $collaboration->update([
                'status' => CollaborationStatus::Cancelled,
                'cancelled_at' => now(),
                'cancelled_by' => $admin->id,
                'cancelled_reason' => '[FORCE CLOSE] '.$reason,
                'completed_at' => null,
            ]);

            $collaboration->campaign->update(['status' => CampaignStatus::Open]);

            // Selesaikan record escrow agar tidak tertinggal pada collab batal.
            $this->settlePaymentOnForceClose($collaboration, $admin, $reason);

            app(AuditLogger::class)->log(
                $admin,
                'collaboration.force_closed',
                $collaboration,
                [
                    'reason' => $reason,
                    'previous_status' => $previousStatus,
                    'new_status' => CollaborationStatus::Cancelled->value,
                ],
            );

            Notification::send(
                [$collaboration->umkm, $collaboration->creator],
                new CollaborationForceClosedNotification($collaboration, $reason),
            );

            return $collaboration->fresh();
        });
    }

    /**
     * Tandai record payment sesuai status terakhir:
     * - PendingProof / AwaitingConfirmation -> Voided (belum ada dana sah).
     * - Confirmed -> Refunded (dana sudah transfer off-platform; perlu refund manual).
     * - Voided / Refunded -> tidak diubah (sudah settled).
     */
    private function settlePaymentOnForceClose(Collaboration $collaboration, User $admin, string $reason): void
    {
        $payment = CollaborationPayment::query()
            ->where('collaboration_id', $collaboration->id)
            ->lockForUpdate()
            ->first();

        if ($payment === null || $payment->status->isClosed()) {
            return;
        }

        $logger = app(AuditLogger::class);

        if ($payment->status === PaymentStatus::Confirmed) {
            $payment->update([
                'status' => PaymentStatus::Refunded,
                'voided_at' => now(),
                'voided_reason' => 'Force-close: dana perlu direfund manual. '.$reason,
                'voided_by' => $admin->id,
            ]);

            $logger->log($admin, 'payment.refunded', $payment->fresh(), [
                'collaboration_id' => $collaboration->id,
                'amount' => (string) $payment->amount,
                'reason' => $reason,
            ]);

            $this->notifyPaymentSettled($payment->fresh(), $reason, true);

            return;
        }

        $payment->update([
            'status' => PaymentStatus::Voided,
            'voided_at' => now(),
            'voided_reason' => 'Force-close: kolaborasi dibatalkan. '.$reason,
            'voided_by' => $admin->id,
        ]);

        $logger->log($admin, 'payment.voided', $payment->fresh(), [
            'collaboration_id' => $collaboration->id,
            'amount' => (string) $payment->amount,
            'reason' => $reason,
        ]);

        $this->notifyPaymentSettled($payment->fresh(), $reason, false);
    }

    /**
     * Notifikasi void/refund dikirim setelah commit agar tidak terkirim bila
     * transaksi di-rollback. Refund → kedua pihak; void → kedua pihak (transparansi).
     */
    private function notifyPaymentSettled(CollaborationPayment $payment, string $reason, bool $isRefund): void
    {
        $notification = $isRefund
            ? new PaymentRefundedNotification($payment, $reason)
            : new PaymentVoidedNotification($payment, $reason);

        $payment->loadMissing('collaboration.umkm', 'collaboration.creator');

        DB::afterCommit(fn () => Notification::send(
            [$payment->collaboration->umkm, $payment->collaboration->creator],
            $notification,
        ));
    }
}
