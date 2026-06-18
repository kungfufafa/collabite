<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Models\Campaign;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Batalkan campaign (UC-CAMP-003, FR-CAMPAIGN-003).
 */
class CancelCampaignAction
{
    public function execute(Campaign $campaign): Campaign
    {
        if (in_array($campaign->status, [CampaignStatus::Cancelled, CampaignStatus::Completed], true)) {
            throw ValidationException::withMessages([
                'status' => 'Campaign ini tidak dapat dibatalkan.',
            ]);
        }

        if ($campaign->collaboration()->exists()) {
            throw ValidationException::withMessages([
                'status' => 'Tidak dapat membatalkan campaign yang sudah memiliki kolaborasi aktif.',
            ]);
        }

        return DB::transaction(function () use ($campaign): Campaign {
            $campaign->status = CampaignStatus::Cancelled;
            $campaign->save();

            // Auto-reject pending requests (BR-004)
            $campaign->collaborationRequests()
                ->where('status', CollaborationRequestStatus::Pending->value)
                ->update([
                    'status' => CollaborationRequestStatus::Rejected->value,
                    'responded_at' => now(),
                ]);

            return $campaign;
        });
    }
}
