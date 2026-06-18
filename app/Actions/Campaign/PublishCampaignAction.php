<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Publikasikan campaign (UC-CAMP-004, FR-CAMPAIGN-004).
 */
class PublishCampaignAction
{
    public function execute(Campaign $campaign): Campaign
    {
        if ($campaign->status !== CampaignStatus::Draft) {
            throw ValidationException::withMessages([
                'status' => 'Hanya campaign berstatus draft yang dapat dipublikasikan.',
            ]);
        }

        if ($campaign->deliverables()->count() === 0) {
            throw ValidationException::withMessages([
                'deliverables' => 'Tambahkan minimal satu deliverable.',
            ]);
        }

        return DB::transaction(function () use ($campaign): Campaign {
            $campaign->status = CampaignStatus::Open;
            $campaign->published_at = now();
            $campaign->save();

            return $campaign;
        });
    }
}
