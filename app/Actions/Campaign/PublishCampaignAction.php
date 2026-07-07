<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\UmkmProfileCompletenessService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Publikasikan campaign (UC-CAMP-004, FR-CAMPAIGN-004).
 */
class PublishCampaignAction
{
    public function __construct(private readonly UmkmProfileCompletenessService $profileCompleteness) {}

    public function execute(Campaign $campaign, ?User $actor = null): Campaign
    {
        if ($campaign->status !== CampaignStatus::Draft) {
            throw ValidationException::withMessages([
                'status' => 'Hanya campaign berstatus draft yang dapat dipublikasikan.',
            ]);
        }

        $campaign->loadMissing('umkmProfile');

        if ($campaign->umkmProfile === null) {
            throw ValidationException::withMessages([
                'profile' => 'Profil usaha belum tersedia. Lengkapi profil terlebih dahulu.',
            ]);
        }

        if (! $this->profileCompleteness->isComplete($campaign->umkmProfile)) {
            throw ValidationException::withMessages([
                'profile' => $this->profileCompleteness->incompleteMessage($campaign->umkmProfile),
            ]);
        }

        if ($campaign->deliverables()->count() === 0) {
            throw ValidationException::withMessages([
                'deliverables' => 'Tambahkan minimal satu deliverable.',
            ]);
        }

        return DB::transaction(function () use ($campaign, $actor): Campaign {
            $previousStatus = $campaign->status->value;
            $campaign->status = CampaignStatus::Open;
            $campaign->published_at = now();
            $campaign->save();

            app(AuditLogger::class)->log($actor, 'campaign.published', $campaign->fresh(), [
                'previous_status' => $previousStatus,
                'new_status' => CampaignStatus::Open->value,
            ]);

            return $campaign;
        });
    }
}
