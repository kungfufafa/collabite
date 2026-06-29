<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationStatus;
use App\Enums\VerificationStatus;
use App\Models\ActivityLog;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\CollaborationRequest;
use App\Models\CreatorProfile;
use App\Models\CreatorVerification;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Collection;

class DashboardDataService
{
    /**
     * @return array<string, mixed>
     */
    public function forUmkm(User $user): array
    {
        $umkm = $user->umkmProfile()->withCount('campaigns')->first();
        $campaignIds = $umkm
            ? Campaign::query()->where('umkm_profile_id', $umkm->id)->pluck('id')
            : collect();

        $openCampaigns = $umkm
            ? $umkm->campaigns()->where('status', CampaignStatus::Open)->count()
            : 0;
        $totalCampaigns = $umkm?->campaigns_count ?? 0;
        $activeCollaborations = Collaboration::query()
            ->where('umkm_id', $user->id)
            ->where('status', CollaborationStatus::Active)
            ->count();
        $pendingRequests = $campaignIds->isEmpty()
            ? 0
            : CollaborationRequest::query()
                ->whereIn('campaign_id', $campaignIds)
                ->where('status', CollaborationRequestStatus::Pending)
                ->count();

        $requestQuery = CollaborationRequest::query()
            ->whereIn('campaign_id', $campaignIds);
        $collaborationQuery = Collaboration::query()->where('umkm_id', $user->id);

        $stats = [
            [
                'label' => 'Campaign terbuka',
                'value' => (string) $openCampaigns,
                'delta' => $this->percentChange(
                    $this->countSince($umkm?->campaigns()->where('status', CampaignStatus::Open) ?? Campaign::query()->whereRaw('0=1'), now()->subDays(7)),
                    $this->countBetween($umkm?->campaigns()->where('status', CampaignStatus::Open) ?? Campaign::query()->whereRaw('0=1'), now()->subDays(14), now()->subDays(7)),
                ),
            ],
            [
                'label' => 'Kolaborasi aktif',
                'value' => (string) $activeCollaborations,
                'delta' => $this->percentChange(
                    $this->countSince($collaborationQuery->clone()->where('status', CollaborationStatus::Active), now()->subDays(7)),
                    $this->countBetween($collaborationQuery->clone()->where('status', CollaborationStatus::Active), now()->subDays(14), now()->subDays(7)),
                ),
            ],
            [
                'label' => 'Total campaign',
                'value' => (string) $totalCampaigns,
                'delta' => $this->percentChange(
                    $this->countSince($umkm?->campaigns() ?? Campaign::query()->whereRaw('0=1'), now()->subDays(7)),
                    $this->countBetween($umkm?->campaigns() ?? Campaign::query()->whereRaw('0=1'), now()->subDays(14), now()->subDays(7)),
                ),
            ],
            [
                'label' => 'Lamaran menunggu',
                'value' => (string) $pendingRequests,
                'delta' => $this->percentChange(
                    $this->countSince($requestQuery->clone()->where('status', CollaborationRequestStatus::Pending), now()->subDays(7)),
                    $this->countBetween($requestQuery->clone()->where('status', CollaborationRequestStatus::Pending), now()->subDays(14), now()->subDays(7)),
                ),
            ],
        ];

        return [
            'stats' => $stats,
            'profile' => $umkm ? [
                'business_name' => $umkm->business_name,
                'city' => $umkm->city,
            ] : null,
            'charts' => [
                'requests_daily' => $this->dailySeries(
                    CollaborationRequest::query()->whereIn('campaign_id', $campaignIds),
                ),
                'collaborations_daily' => $this->dualDailySeries(
                    CollaborationRequest::query()
                        ->whereIn('campaign_id', $campaignIds)
                        ->where('status', CollaborationRequestStatus::Pending),
                    CollaborationRequest::query()
                        ->whereIn('campaign_id', $campaignIds)
                        ->where('status', CollaborationRequestStatus::Accepted),
                    'pending',
                    'accepted',
                ),
            ],
            'recent_collaborations' => $this->recentCollaborationsForUmkm($user),
            'activity' => $this->buildActivityFromRequests(
                CollaborationRequest::query()
                    ->whereIn('campaign_id', $campaignIds)
                    ->with(['campaign', 'creator.creatorProfile'])
                    ->latest()
                    ->limit(4)
                    ->get(),
            ),
            'health' => [
                'caught_up' => $pendingRequests === 0,
                'message' => $pendingRequests === 0
                    ? 'Tidak ada lamaran yang menunggu tinjauan.'
                    : "{$pendingRequests} lamaran menunggu keputusanmu.",
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function forCreator(User $user): array
    {
        $profile = $user->creatorProfile;
        $collaborationQuery = Collaboration::query()->where('creator_id', $user->id);
        $requestQuery = CollaborationRequest::query()->where('creator_id', $user->id);

        $activeCollaborations = $collaborationQuery->clone()
            ->where('status', CollaborationStatus::Active)
            ->count();
        $portfolioItems = $profile?->portfolioItems()->count() ?? 0;
        $pendingRequests = $requestQuery->clone()
            ->where('status', CollaborationRequestStatus::Pending)
            ->count();

        $portfolioCompletion = $this->portfolioCompletion($profile);

        $stats = [
            [
                'label' => 'Kolaborasi aktif',
                'value' => (string) $activeCollaborations,
                'delta' => $this->percentChange(
                    $this->countSince($collaborationQuery->clone()->where('status', CollaborationStatus::Active), now()->subDays(7)),
                    $this->countBetween($collaborationQuery->clone()->where('status', CollaborationStatus::Active), now()->subDays(14), now()->subDays(7)),
                ),
            ],
            [
                'label' => 'Item portofolio',
                'value' => (string) $portfolioItems,
                'delta' => $profile
                    ? $this->percentChange(
                        $this->countSince($profile->portfolioItems(), now()->subDays(7)),
                        $this->countBetween($profile->portfolioItems(), now()->subDays(14), now()->subDays(7)),
                    )
                    : 0.0,
            ],
            [
                'label' => 'Rating rata-rata',
                'value' => number_format((float) ($profile?->rating_avg ?? 0), 1),
                'delta' => 0.0,
            ],
            [
                'label' => 'Undangan menunggu',
                'value' => (string) $pendingRequests,
                'delta' => $this->percentChange(
                    $this->countSince($requestQuery->clone()->where('status', CollaborationRequestStatus::Pending), now()->subDays(7)),
                    $this->countBetween($requestQuery->clone()->where('status', CollaborationRequestStatus::Pending), now()->subDays(14), now()->subDays(7)),
                ),
            ],
        ];

        return [
            'stats' => $stats,
            'profile' => $profile ? [
                'headline' => $profile->headline,
                'verification_status' => $profile->verification_status->value,
                'name' => $user->name,
            ] : ['name' => $user->name, 'headline' => null, 'verification_status' => 'unverified'],
            'portfolio_completion' => $portfolioCompletion,
            'charts' => [
                'applications_daily' => $this->dailySeries($requestQuery->clone()),
                'outcomes_daily' => $this->dualDailySeries(
                    $requestQuery->clone()->where('status', CollaborationRequestStatus::Pending),
                    $requestQuery->clone()->where('status', CollaborationRequestStatus::Accepted),
                    'pending',
                    'accepted',
                ),
            ],
            'recent_collaborations' => $this->recentCollaborationsForCreator($user),
            'activity' => $this->buildActivityFromRequests(
                CollaborationRequest::query()
                    ->where('creator_id', $user->id)
                    ->with(['campaign', 'creator'])
                    ->latest()
                    ->limit(4)
                    ->get(),
            ),
            'health' => [
                'caught_up' => $profile?->verification_status === VerificationStatus::Verified && $portfolioCompletion['percent'] >= 80,
                'message' => $profile?->verification_status === VerificationStatus::Verified
                    ? 'Profil terverifikasi. Portofolio '.$portfolioCompletion['percent'].'% lengkap.'
                    : 'Lengkapi verifikasi dan portofolio untuk meningkatkan peluang kolaborasi.',
                'percent' => $portfolioCompletion['percent'],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function forAdmin(): array
    {
        $userQuery = User::query();
        $verificationQuery = CreatorVerification::query()->where('status', VerificationStatus::Pending);
        $campaignQuery = Campaign::query()->where('status', CampaignStatus::Open);
        $collaborationQuery = Collaboration::query()->where('status', CollaborationStatus::Active);

        $stats = [
            [
                'label' => 'Total pengguna',
                'value' => (string) User::count(),
                'delta' => $this->percentChange(
                    $this->countSince($userQuery->clone(), now()->subDays(7)),
                    $this->countBetween($userQuery->clone(), now()->subDays(14), now()->subDays(7)),
                ),
            ],
            [
                'label' => 'Verifikasi pending',
                'value' => (string) $verificationQuery->clone()->count(),
                'delta' => $this->percentChange(
                    $this->countSince($verificationQuery->clone(), now()->subDays(7)),
                    $this->countBetween($verificationQuery->clone(), now()->subDays(14), now()->subDays(7)),
                ),
            ],
            [
                'label' => 'Campaign terbuka',
                'value' => (string) $campaignQuery->clone()->count(),
                'delta' => $this->percentChange(
                    $this->countSince($campaignQuery->clone(), now()->subDays(7)),
                    $this->countBetween($campaignQuery->clone(), now()->subDays(14), now()->subDays(7)),
                ),
            ],
            [
                'label' => 'Kolaborasi aktif',
                'value' => (string) $collaborationQuery->clone()->count(),
                'delta' => $this->percentChange(
                    $this->countSince($collaborationQuery->clone(), now()->subDays(7)),
                    $this->countBetween($collaborationQuery->clone(), now()->subDays(14), now()->subDays(7)),
                ),
            ],
        ];

        return [
            'stats' => $stats,
            'summary' => [
                'total_umkm' => User::where('role', 'umkm')->count(),
                'total_creators' => User::where('role', 'creator')->count(),
            ],
            'charts' => [
                'registrations_daily' => $this->dailySeries(User::query()),
                'moderation_daily' => $this->dualDailySeries(
                    CreatorVerification::query()->where('status', VerificationStatus::Pending),
                    CreatorVerification::query()->where('status', VerificationStatus::Verified),
                    'pending',
                    'verified',
                ),
            ],
            'recent_activity' => $this->recentAuditActivity(),
            'moderation_queues' => $this->moderationQueues(),
            'health' => [
                'caught_up' => CreatorVerification::where('status', VerificationStatus::Pending)->count() === 0,
                'message' => CreatorVerification::where('status', VerificationStatus::Pending)->count() === 0
                    ? 'Tidak ada antrean verifikasi yang menunggu.'
                    : 'Ada pengajuan verifikasi yang perlu ditinjau.',
            ],
        ];
    }

    /**
     * @return array{percent: int, missing: list<string>}
     */
    private function portfolioCompletion(?CreatorProfile $profile): array
    {
        if (! $profile) {
            return ['percent' => 0, 'missing' => ['Profil creator', 'Portofolio', 'Verifikasi']];
        }

        $checks = [
            'Headline' => filled($profile->headline),
            'Bio' => filled($profile->bio),
            'Foto profil' => filled($profile->profile_photo_path),
            'Portofolio' => $profile->portfolioItems()->exists(),
            'Verifikasi' => $profile->verification_status === VerificationStatus::Verified,
        ];

        $completed = collect($checks)->filter()->count();
        $total = count($checks);

        return [
            'percent' => (int) round(($completed / $total) * 100),
            'missing' => collect($checks)->reject(fn (bool $passed): bool => $passed)->keys()->values()->all(),
        ];
    }

    /**
     * @param  Builder<Model>|Relation<Model, Model, *>  $query
     * @return list<array{label: string, value: int}>
     */
    private function dailySeries(Builder|Relation $query, string $dateColumn = 'created_at'): array
    {
        $days = $this->lastSevenDays();

        $counts = $query
            ->clone()
            ->where($dateColumn, '>=', $days[0]['date'].' 00:00:00')
            ->selectRaw('DATE('.$dateColumn.') as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        return array_map(
            fn (array $day): array => [
                'label' => $day['label'],
                'value' => (int) ($counts[$day['date']] ?? 0),
            ],
            $days,
        );
    }

    /**
     * @param  Builder<Model>|Relation<Model, Model, *>  $firstQuery
     * @param  Builder<Model>|Relation<Model, Model, *>  $secondQuery
     * @return list<array{label: string, date: string, first: int, second: int}>
     */
    private function dualDailySeries(
        Builder|Relation $firstQuery,
        Builder|Relation $secondQuery,
        string $firstKey,
        string $secondKey,
        string $dateColumn = 'created_at',
    ): array {
        $days = $this->lastSevenDays();
        $since = $days[0]['date'].' 00:00:00';

        $firstCounts = $firstQuery
            ->clone()
            ->where($dateColumn, '>=', $since)
            ->selectRaw('DATE('.$dateColumn.') as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $secondCounts = $secondQuery
            ->clone()
            ->where($dateColumn, '>=', $since)
            ->selectRaw('DATE('.$dateColumn.') as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        return array_map(
            fn (array $day): array => [
                'label' => $day['label'],
                'date' => $day['date'],
                $firstKey => (int) ($firstCounts[$day['date']] ?? 0),
                $secondKey => (int) ($secondCounts[$day['date']] ?? 0),
            ],
            $days,
        );
    }

    /**
     * @return list<array{date: string, label: string}>
     */
    private function lastSevenDays(): array
    {
        return Collection::times(7, function (int $index): array {
            /** @var CarbonInterface $date */
            $date = now()->subDays(7 - $index)->startOfDay();

            return [
                'date' => $date->toDateString(),
                'label' => $date->isoFormat('ddd'),
            ];
        })->all();
    }

    /**
     * @param  Builder<Model>|Relation<Model, Model, *>  $query
     */
    private function countSince(Builder|Relation $query, CarbonInterface $since): int
    {
        return $query->clone()->where('created_at', '>=', $since)->count();
    }

    /**
     * @param  Builder<Model>|Relation<Model, Model, *>  $query
     */
    private function countBetween(Builder|Relation $query, CarbonInterface $start, CarbonInterface $end): int
    {
        return $query->clone()
            ->where('created_at', '>=', $start)
            ->where('created_at', '<', $end)
            ->count();
    }

    private function percentChange(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * @return list<array{id: int, title: string, meta: string, status: string, href: string}>
     */
    private function recentCollaborationsForUmkm(User $user): array
    {
        return Collaboration::query()
            ->where('umkm_id', $user->id)
            ->with(['campaign', 'creator'])
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Collaboration $collaboration): array => [
                'id' => $collaboration->id,
                'title' => $collaboration->campaign?->title ?? 'Kolaborasi',
                'meta' => $collaboration->creator?->name ?? 'Creator',
                'status' => $collaboration->status->label(),
                'href' => route('umkm.collaborations.show', $collaboration, absolute: false),
            ])
            ->all();
    }

    /**
     * @return list<array{id: int, title: string, meta: string, status: string, href: string}>
     */
    private function recentCollaborationsForCreator(User $user): array
    {
        return Collaboration::query()
            ->where('creator_id', $user->id)
            ->with(['campaign'])
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Collaboration $collaboration): array => [
                'id' => $collaboration->id,
                'title' => $collaboration->campaign?->title ?? 'Kolaborasi',
                'meta' => $collaboration->status->label(),
                'status' => $collaboration->status->label(),
                'href' => route('creator.collaborations.show', $collaboration, absolute: false),
            ])
            ->all();
    }

    /**
     * @param  Collection<int, CollaborationRequest>  $requests
     * @return list<array{title: string, time: string}>
     */
    private function buildActivityFromRequests(Collection $requests): array
    {
        return $requests->map(function (CollaborationRequest $request): array {
            $creatorName = $request->creator?->name ?? 'Creator';
            $campaignTitle = $request->campaign?->title ?? 'campaign';

            return [
                'title' => match ($request->status) {
                    CollaborationRequestStatus::Pending => "Lamaran dari {$creatorName} untuk \"{$campaignTitle}\"",
                    CollaborationRequestStatus::Accepted => "Lamaran {$creatorName} diterima",
                    CollaborationRequestStatus::Rejected => "Lamaran {$creatorName} ditolak",
                    default => "Pembaruan lamaran {$creatorName}",
                },
                'time' => $request->created_at?->diffForHumans() ?? '',
            ];
        })->all();
    }

    /**
     * @return list<array{id: int, actor: string|null, action: string, subject: string|null, created_at: string}>
     */
    private function recentAuditActivity(): array
    {
        return ActivityLog::query()
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(function (ActivityLog $log): array {
                $metadata = $log->metadata ?? [];

                return [
                    'id' => $log->id,
                    'actor' => isset($metadata['actor_name']) && is_string($metadata['actor_name'])
                        ? $metadata['actor_name']
                        : ($log->actor_role ?? 'Sistem'),
                    'action' => $log->action,
                    'subject' => isset($metadata['subject_label']) && is_string($metadata['subject_label'])
                        ? $metadata['subject_label']
                        : $log->subject_type,
                    'created_at' => $log->created_at?->diffForHumans() ?? '',
                ];
            })
            ->all();
    }

    /**
     * @return array{
     *     verifications: list<array{id: int, title: string, meta: string, href: string, cta: string}>,
     *     campaigns: list<array{id: int, title: string, meta: string, href: string, cta: string}>,
     *     content: list<array{id: int, title: string, meta: string, href: string, cta: string}>
     * }
     */
    private function moderationQueues(): array
    {
        $verifications = CreatorVerification::query()
            ->with('creatorProfile.user')
            ->where('status', VerificationStatus::Pending)
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (CreatorVerification $verification): array => [
                'id' => $verification->id,
                'title' => $verification->creatorProfile?->user?->name ?? 'Creator',
                'meta' => 'Menunggu review',
                'href' => route('admin.verifications.index', absolute: false),
                'cta' => 'Tinjau',
            ])
            ->all();

        $campaigns = Campaign::query()
            ->where('is_hidden', true)
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Campaign $campaign): array => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'meta' => 'Tersembunyi',
                'href' => route('admin.moderation.campaigns', absolute: false),
                'cta' => 'Moderasi',
            ])
            ->all();

        return [
            'verifications' => $verifications,
            'campaigns' => $campaigns,
            'content' => [],
        ];
    }
}
