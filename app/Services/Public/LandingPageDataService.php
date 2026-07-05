<?php

declare(strict_types=1);

namespace App\Services\Public;

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\VerificationStatus;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CreatorProfile;
use App\Models\PortfolioItem;
use App\Services\FileUrlService;
use Illuminate\Support\Number;

/**
 * Data dinamis untuk halaman landing publik.
 */
class LandingPageDataService
{
    public function __construct(private readonly FileUrlService $files) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function featuredCreators(int $limit = 3): array
    {
        return CreatorProfile::query()
            ->with(['user', 'categories', 'portfolioItems' => fn ($q) => $q->orderBy('display_order')->limit(3)])
            ->withCount([
                'portfolioItems',
                'portfolioItems as portfolio_with_media_count' => fn ($q) => $q->whereNotNull('media_path'),
            ])
            ->where('verification_status', VerificationStatus::Verified)
            ->whereHas('portfolioItems', fn ($q) => $q->whereNotNull('media_path'))
            ->orderByDesc('rating_avg')
            ->orderByDesc('rating_count')
            ->limit($limit)
            ->get()
            ->map(fn (CreatorProfile $creator): array => $this->serializeFeaturedCreator($creator))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    public function heroSpotlight(): ?array
    {
        $collaboration = Collaboration::query()
            ->with([
                'campaign.deliverables',
                'creator.creatorProfile',
                'progressUpdates',
                'submissions' => fn ($q) => $q->latest('version')->limit(1),
            ])
            ->where('status', CollaborationStatus::Active)
            ->latest('started_at')
            ->first();

        if ($collaboration === null) {
            return null;
        }

        $creatorProfile = $collaboration->creator->creatorProfile;
        $latestSubmission = $collaboration->submissions->first();
        $deliverableCount = max(1, $collaboration->campaign->deliverables->count());
        $progressCount = $collaboration->progressUpdates->count();
        $progressPercent = min(95, max(25, (int) round(($progressCount / $deliverableCount) * 100)));

        if ($latestSubmission?->status === ContentSubmissionStatus::InReview) {
            $progressPercent = max($progressPercent, 75);
        }

        return [
            'campaign_title' => $collaboration->campaign->title,
            'campaign_status' => $collaboration->status->value,
            'campaign_status_label' => $collaboration->status->label(),
            'creator_name' => $collaboration->creator->name,
            'creator_headline' => $creatorProfile?->headline,
            'creator_profile_photo_url' => $this->files->publicUrl($creatorProfile?->profile_photo_path),
            'creator_rating_avg' => (float) ($creatorProfile?->rating_avg ?? 0),
            'progress_percent' => $progressPercent,
            'deadline' => $collaboration->campaign->deadline?->translatedFormat('d M Y'),
            'submission_title' => $latestSubmission?->title,
            'submission_file_label' => $latestSubmission !== null
                ? 'Submission v'.$latestSubmission->version
                : null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function featuredCampaign(): ?array
    {
        $campaign = Campaign::query()
            ->withCount('deliverables')
            ->whereIn('status', [
                CampaignStatus::InCollaboration,
                CampaignStatus::Open,
                CampaignStatus::Completed,
            ])
            ->where('is_hidden', false)
            ->orderByRaw('CASE status WHEN ? THEN 0 WHEN ? THEN 1 ELSE 2 END', [
                CampaignStatus::InCollaboration->value,
                CampaignStatus::Open->value,
            ])
            ->latest('published_at')
            ->first();

        if ($campaign === null) {
            return null;
        }

        return [
            'id' => $campaign->id,
            'title' => $campaign->title,
            'status' => $campaign->status->value,
            'status_label' => $campaign->status->label(),
            'budget' => $campaign->budget !== null
                ? Number::currency((float) $campaign->budget, 'IDR', locale: 'id')
                : null,
            'deliverable_count' => $campaign->deliverables_count,
            'deadline' => $campaign->deadline?->translatedFormat('d M'),
            'timeline' => $this->timelineForCampaign($campaign->status),
        ];
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    public function categories(): array
    {
        return Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeFeaturedCreator(CreatorProfile $creator): array
    {
        $collaborationCount = Collaboration::query()
            ->where('creator_id', $creator->user_id)
            ->whereIn('status', [CollaborationStatus::Active, CollaborationStatus::Completed])
            ->count();

        /** @var array<int, string|null> $portfolioUrls */
        $portfolioUrls = $creator->portfolioItems
            ->map(fn (PortfolioItem $item): ?string => $this->files->publicUrl($item->media_path))
            ->filter()
            ->values()
            ->take(3)
            ->all();

        return [
            'id' => $creator->id,
            'name' => $creator->user?->name ?? 'Creator',
            'headline' => $creator->headline,
            'city' => $creator->city,
            'rating_avg' => (float) $creator->rating_avg,
            'rating_count' => $creator->rating_count,
            'verification_status' => $creator->verification_status->value,
            'profile_photo_url' => $this->files->publicUrl($creator->profile_photo_path),
            'portfolio_urls' => $portfolioUrls,
            'categories' => $creator->categories->pluck('name')->values()->all(),
            'collaboration_count' => $collaborationCount,
        ];
    }

    /**
     * @return array<int, array{label: string, state: string}>
     */
    private function timelineForCampaign(CampaignStatus $status): array
    {
        $steps = [
            ['label' => 'Draft', 'key' => 'draft'],
            ['label' => 'Dipublikasikan', 'key' => 'open'],
            ['label' => 'Kolaborasi Aktif', 'key' => 'in_collaboration'],
            ['label' => 'Review Konten', 'key' => 'review'],
            ['label' => 'Selesai', 'key' => 'completed'],
        ];

        $currentKey = match ($status) {
            CampaignStatus::Draft => 'draft',
            CampaignStatus::Open => 'open',
            CampaignStatus::InCollaboration => 'in_collaboration',
            CampaignStatus::Completed => 'completed',
            default => 'open',
        };

        $currentIndex = array_search($currentKey, array_column($steps, 'key'), true);
        if ($currentIndex === false) {
            $currentIndex = 0;
        }

        return array_map(
            static function (array $step, int $index) use ($currentIndex): array {
                $state = 'todo';
                if ($index < $currentIndex) {
                    $state = 'done';
                } elseif ($index === $currentIndex) {
                    $state = 'current';
                }

                return [
                    'label' => $step['label'],
                    'state' => $state,
                ];
            },
            $steps,
            array_keys($steps),
        );
    }
}
