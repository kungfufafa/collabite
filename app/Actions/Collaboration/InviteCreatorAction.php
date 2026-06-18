<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationRequestType;
use App\Models\Campaign;
use App\Models\CollaborationRequest;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Kirim invitation dari UMKM ke Creator (FR-COLLAB-002).
 */
class InviteCreatorAction
{
    /**
     * @param  array{campaign_id:int, creator_id:int, message?:string|null}  $data
     */
    public function execute(UmkmProfile $umkm, array $data): CollaborationRequest
    {
        $campaign = Campaign::query()->where('umkm_profile_id', $umkm->id)->findOrFail($data['campaign_id']);

        if ($campaign->status !== CampaignStatus::Open) {
            throw ValidationException::withMessages(['campaign_id' => 'Campaign tidak terbuka untuk invitation.']);
        }

        $creator = User::query()->where('role', 'creator')->findOrFail($data['creator_id']);

        $duplicate = CollaborationRequest::query()
            ->where('campaign_id', $campaign->id)
            ->where('creator_id', $creator->id)
            ->whereIn('status', [CollaborationRequestStatus::Pending->value, CollaborationRequestStatus::Accepted->value])
            ->exists();
        if ($duplicate) {
            throw ValidationException::withMessages(['creator_id' => 'Creator sudah memiliki pengajuan/undangan untuk campaign ini.']);
        }

        return DB::transaction(function () use ($campaign, $creator, $umkm, $data): CollaborationRequest {
            return CollaborationRequest::create([
                'campaign_id' => $campaign->id,
                'creator_id' => $creator->id,
                'sender_id' => $umkm->user->id,
                'type' => CollaborationRequestType::Invitation,
                'status' => CollaborationRequestStatus::Pending,
                'message' => $data['message'] ?? null,
            ]);
        });
    }
}
