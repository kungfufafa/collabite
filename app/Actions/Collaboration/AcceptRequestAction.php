<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationStatus;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Terima request collaboration (application/invitation) dan bentuk Collaboration.
 *
 * Concurrency-safe: gunakan DB::transaction + lockForUpdate pada baris campaign
 * untuk mencegah dua request diterima bersamaan untuk campaign yang sama.
 */
class AcceptRequestAction
{
    public function execute(CollaborationRequest $request): Collaboration
    {
        if ($request->status !== CollaborationRequestStatus::Pending) {
            throw ValidationException::withMessages(['request' => 'Request ini sudah tidak pending.']);
        }

        return DB::transaction(function () use ($request): Collaboration {
            // Lock campaign row agar tidak ada accept ganda.
            $campaign = Campaign::query()
                ->whereKey($request->campaign_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($campaign->collaboration()->exists()) {
                throw ValidationException::withMessages(['request' => 'Campaign sudah memiliki kolaborasi aktif.']);
            }

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
            $collaboration = Collaboration::create([
                'campaign_id' => $campaign->id,
                'umkm_id' => $campaign->umkmProfile->user_id,
                'creator_id' => $request->creator_id,
                'status' => CollaborationStatus::Active,
                'started_at' => now(),
            ]);

            // 4. Conversation
            $collaboration->conversation()->firstOrCreate([]);

            // 5. Campaign -> in_collaboration
            $campaign->update(['status' => CampaignStatus::InCollaboration]);

            app(AuditLogger::class)->log(
                $campaign->umkmProfile->user,
                'collaboration.accepted',
                $collaboration,
                ['campaign_id' => $campaign->id, 'request_id' => $request->id, 'creator_id' => $request->creator_id],
            );

            return $collaboration->fresh(['conversation']);
        });
    }
}
