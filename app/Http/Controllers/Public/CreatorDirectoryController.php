<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CreatorProfile;
use App\Services\FileUrlService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Direktori Creator publik (FR-DISCOVERY-001..004).
 */
class CreatorDirectoryController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function index(Request $request): Response
    {
        $query = CreatorProfile::query()
            ->with(['user', 'categories', 'skills'])
            ->withCount('portfolioItems');

        $keyword = trim((string) $request->query('q', ''));
        if ($keyword !== '') {
            $query->where(function ($q) use ($keyword): void {
                $q->where('headline', 'like', "%{$keyword}%")
                    ->orWhere('bio', 'like', "%{$keyword}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$keyword}%"));
            });
        }

        $categoryId = $request->query('category');
        if ($categoryId) {
            $query->whereHas('categories', fn ($q) => $q->where('categories.id', $categoryId));
        }

        $minRating = (float) $request->query('rating', 0);
        if ($minRating > 0) {
            $query->where('rating_avg', '>=', $minRating);
        }

        $verified = $request->query('verified');
        if ($verified === '1') {
            $query->where('verification_status', 'verified');
        }

        $creators = $query->orderByDesc('rating_avg')->paginate(15)->withQueryString();

        return Inertia::render('Public/CreatorDirectory', [
            'creators' => $creators->through(fn (CreatorProfile $c): array => $this->serialize($c)),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'q' => $keyword,
                'category' => $categoryId,
                'rating' => $minRating,
                'verified' => $verified,
            ],
        ]);
    }

    public function show(CreatorProfile $creatorProfile): Response
    {
        $creatorProfile->load(['user', 'categories', 'skills', 'portfolioItems']);

        return Inertia::render('Public/CreatorProfile', [
            'creator' => $this->serializeDetail($creatorProfile),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(CreatorProfile $creator): array
    {
        return [
            'id' => $creator->id,
            'name' => $creator->user?->name,
            'headline' => $creator->headline,
            'city' => $creator->city,
            'rating_avg' => (float) $creator->rating_avg,
            'rating_count' => $creator->rating_count,
            'verification_status' => $creator->verification_status->value,
            'profile_photo_url' => $this->files->publicUrl($creator->profile_photo_path),
            'categories' => $creator->categories->pluck('name'),
            'portfolio_count' => $creator->portfolio_items_count ?? $creator->portfolioItems->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDetail(CreatorProfile $creator): array
    {
        return [
            'id' => $creator->id,
            'name' => $creator->user?->name,
            'headline' => $creator->headline,
            'bio' => $creator->bio,
            'city' => $creator->city,
            'rating_avg' => (float) $creator->rating_avg,
            'rating_count' => $creator->rating_count,
            'verification_status' => $creator->verification_status->value,
            'profile_photo_url' => $this->files->publicUrl($creator->profile_photo_path),
            'categories' => $creator->categories->map(fn ($c): array => ['id' => $c->id, 'name' => $c->name]),
            'skills' => $creator->skills->map(fn ($s): array => ['id' => $s->id, 'name' => $s->name]),
            'portfolio' => $creator->portfolioItems->map(fn ($p): array => [
                'id' => $p->id,
                'title' => $p->title,
                'description' => $p->description,
                'media_url' => $p->media_path ? $this->files->publicUrl($p->media_path) : null,
                'external_url' => $p->external_url,
            ]),
        ];
    }
}
