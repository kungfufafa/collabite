<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationStatus;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\Conversation;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Terima request collaboration (application/invitation) dan bentuk Collaboration.
 */
class AcceptRequestAction
{
    public function execute(CollaborationRequest $request): Collaboration
    {
        if ($request->status !== CollaborationRequestStatus::Pending) {
            throw ValidationException::withMessages(['request' => 'Request ini sudah tidak pending.']);
        }

        return DB::transaction(function () use ($request): Collaboration {
            // 1. Set request ini accepted
            $request->update([
                'status' => CollaborationRequestStatus::Accepted,
                'responded_at' => now(),
            ]);

            // 2. Auto-reject semua request pending lain untuk campaign yang sama
            CollaborationRequest::query()
                ->where('campaign_id', $request->campaign_id)
                ->where('id', '!=', $request->id)
                ->where('status', CollaborationRequestStatus::Pending)
                ->update(['status' => CollaborationRequestStatus::Rejected, 'responded_at' => now()]);

            // 3. Bentuk collaboration (1 campaign = 1 collaboration)
            $campaign = $request->campaign;
            $collaboration = Collaboration::query()->updateOrCreate(
                ['campaign_id' => $campaign->id],
                [
                    'umkm_id' => $campaign->umkm_profile_id === $request->creator_id ? $campaign->umkmProfile->user_id : $campaign->umkmProfile->user_id,
                    'creator_id' => $request->creator_id,
                    'status' => CollaborationStatus::Active,
                    'started_at' => now(),
                ],
            );

            // Note: umkm_id adalah user_id, bukan profile_id. Campaign->umkmProfile->user->id
            $collaboration->update([
                'umkm_id' => $campaign->umkmProfile->user_id,
            ]);

            // 4. Conversation
            $collaboration->conversation()->firstOrCreate([]);

            // 5. Campaign -> in_collaboration
            $campaign->update(['status' => CampaignStatus::InCollaboration]);

            app(AuditLogger::class)->log(
                $request->sender_id === $request->creator_id ? $request->creator : $campaign->umkmProfile->user,
                'collaboration.accepted',
                $collaboration,
                ['campaign_id' => $campaign->id, 'request_id' => $request->id],
            );

            return $collaboration->fresh(['conversation']);
        });
    }
}
