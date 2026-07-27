<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\PaymentStatus;
use App\Models\Collaboration;
use App\Models\CollaborationPayment;
use App\Models\CollaborationRequest;
use App\Models\User;
use App\Notifications\CollaborationCancelledNotification;
use App\Notifications\PaymentRefundedNotification;
use App\Notifications\PaymentVoidedNotification;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * Pembatalan kolaborasi oleh UMKM atau Creator (FR-COLLAB-011, BR-013).
 *
 * - Hanya boleh selama submission belum `approved`.
 * - Wajib alasan (≥10 karakter, divalidasi di Form Request).
 * - Admin dapat memaksa tutup walau approved (UC-ADMIN-010) — method forceClose().
 */
class CancelCollaborationAction
{
    public function execute(Collaboration $collaboration, User $actor, string $reason, bool $forceAdmin = false): Collaboration
    {
        if ($collaboration->status !== CollaborationStatus::Active) {
            throw ValidationException::withMessages(['collaboration' => 'Kolaborasi tidak dalam status aktif.']);
        }

        $latestApproved = $collaboration->submissions()
            ->where('status', ContentSubmissionStatus::Approved)
            ->exists();

        if ($latestApproved && ! $forceAdmin) {
            throw ValidationException::withMessages(['collaboration' => 'Tidak dapat membatalkan: submission sudah disetujui. Hubungi admin.']);
        }

        if (! $forceAdmin) {
            $isParty = $actor->is($collaboration->umkm) || $actor->is($collaboration->creator);
            if (! $isParty) {
                throw ValidationException::withMessages(['collaboration' => 'Anda bukan pihak kolaborasi.']);
            }
        }

        return DB::transaction(function () use ($collaboration, $actor, $reason, $forceAdmin): Collaboration {
            $collaboration->update([
                'status' => CollaborationStatus::Cancelled,
                'cancelled_at' => now(),
                'cancelled_by' => $actor->id,
                'cancelled_reason' => $reason,
                'completed_at' => null,
            ]);

            // Kembalikan campaign ke open (request lain tidak dipulihkan, BR-005).
            $collaboration->campaign->update(['status' => CampaignStatus::Open]);

            // Tutup request accepted asalnya agar creator dapat melamar ulang
            // (dan UMKM mengundang ulang) setelah kolaborasi dibatalkan.
            $this->closeOriginatingRequest($collaboration, $actor);

            // Lindungi integritas escrow (defense-in-depth). Record payment hanya
            // tercipta setelah submission disetujui, yang sudah diblokir di atas
            // untuk non-admin; blok ini menutup kemungkinan edge case di masa depan.
            $this->settlePaymentOnCancel($collaboration, $actor, $reason, $forceAdmin);

            app(AuditLogger::class)->log(
                $actor,
                'collaboration.cancelled',
                $collaboration,
                ['reason' => $reason],
            );

            $otherParty = $actor->is($collaboration->umkm)
                ? $collaboration->creator
                : $collaboration->umkm;

            Notification::sendNow(
                $otherParty,
                new CollaborationCancelledNotification($collaboration->fresh(['campaign']), $actor, $reason),
            );

            return $collaboration->fresh();
        });
    }

    /**
     * Selesaikan record payment saat kolaborasi dibatalkan.
     *
     * Non-admin: tolak jika payment Confirmed (dana sah diterima Creator —
     * harus lewat admin force-close). Payment aktif -> Voided.
     * Admin (forceAdmin): Confirmed -> Refunded, aktif -> Voided.
     */
    private function settlePaymentOnCancel(Collaboration $collaboration, User $actor, string $reason, bool $forceAdmin): void
    {
        $payment = CollaborationPayment::query()
            ->where('collaboration_id', $collaboration->id)
            ->lockForUpdate()
            ->first();

        if ($payment === null || $payment->status->isClosed()) {
            return;
        }

        if ($payment->status === PaymentStatus::Confirmed && ! $forceAdmin) {
            throw ValidationException::withMessages(['payment' => 'Pembayaran sudah dikonfirmasi Creator. Hubungi admin untuk penyelesaian.']);
        }

        $logger = app(AuditLogger::class);

        if ($payment->status === PaymentStatus::Confirmed) {
            $payment->update([
                'status' => PaymentStatus::Refunded,
                'voided_at' => now(),
                'voided_reason' => 'Kolaborasi dibatalkan: dana perlu direfund manual. '.$reason,
                'voided_by' => $actor->id,
            ]);

            $logger->log($actor, 'payment.refunded', $payment->fresh(), [
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
            'voided_reason' => 'Kolaborasi dibatalkan. '.$reason,
            'voided_by' => $actor->id,
        ]);

        $logger->log($actor, 'payment.voided', $payment->fresh(), [
            'collaboration_id' => $collaboration->id,
            'amount' => (string) $payment->amount,
            'reason' => $reason,
        ]);

        $this->notifyPaymentSettled($payment->fresh(), $reason, false);
    }

    /**
     * Notifikasi void/refund dikirim setelah commit. Refund hanya terjadi pada
     * admin force-close (non-admin ditolak sebelumnya); void untuk cancel biasa.
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

    /**
     * Force close oleh Admin (UC-ADMIN-010). Wajib alasan; submission approved diperbolehkan.
     */
    public function forceClose(Collaboration $collaboration, User $admin, string $reason): Collaboration
    {
        if (! $admin->isAdmin()) {
            throw ValidationException::withMessages(['admin' => 'Hanya admin yang dapat force close.']);
        }

        if ($collaboration->status !== CollaborationStatus::Active) {
            throw ValidationException::withMessages(['collaboration' => 'Kolaborasi tidak dalam status aktif.']);
        }

        return DB::transaction(function () use ($collaboration, $admin, $reason): Collaboration {
            $collaboration->update([
                'status' => CollaborationStatus::Cancelled,
                'cancelled_at' => now(),
                'cancelled_by' => $admin->id,
                'cancelled_reason' => '[FORCE CLOSE] '.$reason,
                'completed_at' => null,
            ]);

            $collaboration->campaign->update(['status' => CampaignStatus::Open]);

            // Tutup request accepted asalnya (sama seperti cancel biasa).
            $this->closeOriginatingRequest($collaboration, $admin);

            app(AuditLogger::class)->log(
                $admin,
                'collaboration.force_closed',
                $collaboration,
                ['reason' => $reason],
            );

            return $collaboration->fresh();
        });
    }

    /**
     * Tandai request accepted yang membentuk kolaborasi ini sebagai
     * cancelled, agar creator dapat melamar ulang / UMKM mengundang ulang.
     */
    private function closeOriginatingRequest(Collaboration $collaboration, User $actor): void
    {
        $status = $actor->is($collaboration->creator)
            ? CollaborationRequestStatus::CancelledByCreator
            : CollaborationRequestStatus::CancelledByUmkm;

        CollaborationRequest::query()
            ->where('campaign_id', $collaboration->campaign_id)
            ->where('creator_id', $collaboration->creator_id)
            ->where('status', CollaborationRequestStatus::Accepted)
            ->update([
                'status' => $status,
                'responded_at' => now(),
            ]);
    }
}
