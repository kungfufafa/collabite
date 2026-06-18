<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Models\Collaboration;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
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

        return DB::transaction(function () use ($collaboration, $actor, $reason): Collaboration {
            $collaboration->update([
                'status' => CollaborationStatus::Cancelled,
                'cancelled_at' => now(),
                'cancelled_by' => $actor->id,
                'cancelled_reason' => $reason,
                'completed_at' => null,
            ]);

            // Kembalikan campaign ke open (request lain tidak dipulihkan, BR-005).
            $collaboration->campaign->update(['status' => CampaignStatus::Open]);

            app(AuditLogger::class)->log(
                $actor,
                'collaboration.cancelled',
                $collaboration,
                ['reason' => $reason],
            );

            return $collaboration->fresh();
        });
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

            app(AuditLogger::class)->log(
                $admin,
                'collaboration.force_closed',
                $collaboration,
                ['reason' => $reason],
            );

            return $collaboration->fresh();
        });
    }
}
