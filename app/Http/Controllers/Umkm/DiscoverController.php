<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CreatorProfile;
use App\Services\FileUrlService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Discovery Creator untuk UMKM (FR-DISCOVERY-001..004).
 */
class DiscoverController extends Controller
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
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$keyword}%"))
                    ->orWhereHas('skills', fn ($s) => $s->where('name', 'like', "%{$keyword}%"));
            });
        }

        if ($cat = $request->query('category_id')) {
            $query->whereHas('categories', fn ($q) => $q->where('categories.id', $cat));
        }
        if ($minRating = $request->query('min_rating')) {
            $query->where('rating_avg', '>=', (float) $minRating);
        }
        if ($request->query('verified_only') === '1') {
            $query->where('verification_status', 'verified');
        }

        $creators = $query->orderByDesc('rating_avg')
            ->orderByDesc('rating_count')
            ->paginate(15)
            ->withQueryString();
        $creators->setCollection(
            $creators->getCollection()->map(fn (CreatorProfile $c): array => [
                'id' => $c->id,
                'name' => $c->user->name,
                'headline' => $c->headline,
                'city' => $c->city,
                'verification_status' => $c->verification_status->value,
                'rating_avg' => $c->rating_avg,
                'rating_count' => $c->rating_count,
                'profile_photo_url' => $this->files->publicUrl($c->profile_photo_path),
                'categories' => $c->categories->pluck('name'),
                'skills' => $c->skills->pluck('name'),
                'portfolio_count' => $c->portfolio_items_count,
            ]),
        );

        return Inertia::render('Umkm/Discover/Index', [
            'filters' => [
                'q' => $keyword,
                'category_id' => $cat,
                'min_rating' => $minRating,
                'verified_only' => $request->query('verified_only'),
            ],
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'creators' => $creators,
            'pagination' => [
                'current_page' => $creators->currentPage(),
                'last_page' => $creators->lastPage(),
                'total' => $creators->total(),
            ],
        ]);
    }
}
