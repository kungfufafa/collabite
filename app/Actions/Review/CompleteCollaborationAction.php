<?php

declare(strict_types=1);

namespace App\Actions\Review;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Models\Collaboration;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * UMKM menyelesaikan kolaborasi (UC-CONT-007).
 * Wajib ada submission approved.
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

        $collaboration->update([
            'status' => CollaborationStatus::Completed,
            'completed_at' => now(),
        ]);

        $collaboration->campaign->update(['status' => CampaignStatus::Completed]);

        return $collaboration->fresh();
    }
}
