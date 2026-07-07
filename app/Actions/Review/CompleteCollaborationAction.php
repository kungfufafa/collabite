<?php

declare(strict_types=1);

namespace App\Actions\Review;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\PaymentStatus;
use App\Models\Collaboration;
use App\Models\User;
use App\Notifications\CollaborationCompletedNotification;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * UMKM menyelesaikan kolaborasi (UC-CONT-007).
 * Wajib ada submission approved, dan (jika manual payment aktif) pembayaran
 * sudah dikonfirmasi Creator (escrow release). Atomik: update Collaboration +
 * Campaign dalam satu transaksi, dengan audit log dan notifikasi ke Creator.
 */
class CompleteCollaborationAction
{
    public function execute(Collaboration $collaboration, User $actor): Collaboration
    {
        if ($collaboration->status !== CollaborationStatus::Active) {
            throw ValidationException::withMessages(['collaboration' => 'Kolaborasi tidak aktif.']);
        }

        if ($actor->id !== $collaboration->umkm_id) {
            throw ValidationException::withMessages(['collaboration' => 'Hanya UMKM yang dapat menyelesaikan kolaborasi.']);
        }

        $approved = $collaboration->submissions()
            ->where('status', ContentSubmissionStatus::Approved)
            ->exists();
        if (! $approved) {
            throw ValidationException::withMessages(['collaboration' => 'Belum ada submission yang disetujui.']);
        }

        if (config('collabite.manual_payment_enabled')) {
            $payment = $collaboration->payment;
            if ($payment === null || $payment->status !== PaymentStatus::Confirmed) {
                throw ValidationException::withMessages(['payment' => 'Pembayaran belum dikonfirmasi oleh Creator.']);
            }
        }

        return DB::transaction(function () use ($collaboration, $actor): Collaboration {
            $collaboration->update([
                'status' => CollaborationStatus::Completed,
                'completed_at' => now(),
            ]);

            $collaboration->campaign->update(['status' => CampaignStatus::Completed]);

            $fresh = $collaboration->fresh(['campaign', 'creator']);

            app(AuditLogger::class)->log(
                $actor,
                'collaboration.completed',
                $fresh,
                ['campaign_id' => $fresh->campaign_id, 'creator_id' => $fresh->creator_id],
            );

            // Notifikasi ke Creator setelah commit.
            DB::afterCommit(fn () => Notification::send(
                $fresh->creator,
                new CollaborationCompletedNotification($fresh, $actor),
            ));

            return $fresh;
        });
    }
}
