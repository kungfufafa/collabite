<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\CollaborationStatus;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\User;
use App\Notifications\CollaborationRequestAcceptedNotification;
use App\Notifications\CollaborationRequestRejectedNotification;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * Terima request collaboration (application/invitation) dan bentuk Collaboration.
 *
 * Concurrency-safe: gunakan DB::transaction + lockForUpdate pada baris campaign
 * untuk mencegah dua request diterima bersamaan untuk campaign yang sama.
 */
class AcceptRequestAction
{
    /**
     * @param  array{terms_accepted?: bool, terms_version?: string, terms_accepted_at?: string}  $consent
     */
    public function execute(CollaborationRequest $request, ?User $actor = null, array $consent = []): Collaboration
    {
        if ($request->status !== CollaborationRequestStatus::Pending) {
            throw ValidationException::withMessages(['request' => 'Request ini sudah tidak pending.']);
        }

        return DB::transaction(function () use ($request, $actor, $consent): Collaboration {
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
            $rejectedRequests = CollaborationRequest::query()
                ->where('campaign_id', $request->campaign_id)
                ->where('id', '!=', $request->id)
                ->where('status', CollaborationRequestStatus::Pending)
                ->get();
            $rejectedRequests->each->update([
                'status' => CollaborationRequestStatus::Rejected,
                'responded_at' => now(),
            ]);

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

            // 6. Notifikasi: pihak yang menerima = pengirim tipe request (invitation
            // -> creator menerima -> umkm diberitahu; application -> umkm menerima
            // -> creator diberitahu). Pihak lain = lawan dari pengirim.
            $request->load('creator', 'campaign.umkmProfile.user');
            $isInvitation = $request->type === CollaborationRequestType::Invitation;
            $acceptingParty = $isInvitation ? $request->creator : $campaign->umkmProfile->user;
            $recipient = $isInvitation ? $campaign->umkmProfile->user : $request->creator;

            $metadata = [
                'campaign_id' => $campaign->id,
                'request_id' => $request->id,
                'creator_id' => $request->creator_id,
            ];

            if (($consent['terms_accepted'] ?? false) === true) {
                $metadata['terms_accepted'] = true;
                $metadata['terms_version'] = $consent['terms_version']
                    ?? (string) config('collabite.terms_version');
                $metadata['terms_accepted_at'] = $consent['terms_accepted_at']
                    ?? now()->toIso8601String();
            }

            app(AuditLogger::class)->log(
                $actor ?? $acceptingParty,
                'collaboration.accepted',
                $collaboration,
                $metadata,
            );

            $collaboration->load('campaign');
            DB::afterCommit(fn () => Notification::send(
                $recipient,
                new CollaborationRequestAcceptedNotification($collaboration, $acceptingParty),
            ));

            // Notifikasi penolakan otomatis untuk request pending lain. Penerima
            // = pengirim request yang kalah (invitation -> UMKM, application -> Creator).
            $rejectActor = $acceptingParty;
            $rejectedRequests->load('creator', 'campaign.umkmProfile.user');
            DB::afterCommit(function () use ($rejectedRequests, $rejectActor): void {
                foreach ($rejectedRequests as $rejected) {
                    $rejectedRecipient = $rejected->type === CollaborationRequestType::Invitation
                        ? $rejected->campaign?->umkmProfile?->user
                        : $rejected->creator;
                    if ($rejectedRecipient !== null) {
                        Notification::send(
                            $rejectedRecipient,
                            new CollaborationRequestRejectedNotification($rejected, $rejectActor, 'Campaign telah menerima pengajuan lain.'),
                        );
                    }
                }
            });

            return $collaboration->fresh(['conversation']);
        });
    }
}
