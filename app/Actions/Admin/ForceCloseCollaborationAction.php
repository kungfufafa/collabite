<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Models\Collaboration;
use App\Models\User;
use App\Notifications\CollaborationForceClosedNotification;
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
}
