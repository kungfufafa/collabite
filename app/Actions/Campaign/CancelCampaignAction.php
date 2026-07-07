<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationStatus;
use App\Models\Campaign;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Batalkan campaign (UC-CAMP-003, FR-CAMPAIGN-003).
 */
class CancelCampaignAction
{
    public function execute(Campaign $campaign, ?User $actor = null): Campaign
    {
        if (in_array($campaign->status, [CampaignStatus::Cancelled, CampaignStatus::Completed], true)) {
            throw ValidationException::withMessages([
                'status' => 'Campaign ini tidak dapat dibatalkan.',
            ]);
        }

        // Hanya kolaborasi aktif yang memblokir cancel. Record collaboration
        // yang sudah Completed/Cancelled tetap ada, tetapi tidak boleh mengunci
        // campaign selamanya setelah kolaborasi selesai/dibatalkan.
        if ($campaign->collaboration()->where('status', CollaborationStatus::Active->value)->exists()) {
            throw ValidationException::withMessages([
                'status' => 'Tidak dapat membatalkan campaign yang sudah memiliki kolaborasi aktif.',
            ]);
        }

        return DB::transaction(function () use ($campaign, $actor): Campaign {
            $previousStatus = $campaign->status->value;
            $campaign->status = CampaignStatus::Cancelled;
            $campaign->save();

            // Auto-reject pending requests (BR-004)
            $campaign->collaborationRequests()
                ->where('status', CollaborationRequestStatus::Pending->value)
                ->update([
                    'status' => CollaborationRequestStatus::Rejected->value,
                    'responded_at' => now(),
                ]);

            app(AuditLogger::class)->log($actor, 'campaign.cancelled', $campaign->fresh(), [
                'previous_status' => $previousStatus,
                'new_status' => CampaignStatus::Cancelled->value,
            ]);

            return $campaign;
        });
    }
}
