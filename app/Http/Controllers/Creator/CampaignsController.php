<?php

declare(strict_types=1);

namespace App\Http\Controllers\Creator;

use App\Enums\CampaignStatus;
use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Browse campaign untuk Creator (FR-CAMPAIGN-006..008).
 */
class CampaignsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Campaign::query()
            ->with(['umkmProfile', 'category'])
            ->where('status', CampaignStatus::Open)
            ->where('is_hidden', false);

        if ($keyword = trim((string) $request->query('q', ''))) {
            $query->where(function ($q) use ($keyword): void {
                $q->where('title', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        }
        if ($cat = $request->query('category_id')) {
            $query->where('category_id', $cat);
        }
        if ($minBudget = $request->query('min_budget')) {
            $query->where('budget', '>=', (float) $minBudget);
        }
        if ($maxBudget = $request->query('max_budget')) {
            $query->where('budget', '<=', (float) $maxBudget);
        }

        $campaigns = $query->latest('published_at')
            ->paginate(15)
            ->withQueryString();
        $campaigns->setCollection(
            $campaigns->getCollection()->map(fn (Campaign $c): array => [
                'id' => $c->id,
                'title' => $c->title,
                'description' => Str::limit($c->description, 200),
                'budget' => $c->budget,
                'deadline' => $c->deadline?->toDateString(),
                'category' => $c->category?->name,
                'umkm' => [
                    'name' => $c->umkmProfile?->business_name,
                    'city' => $c->umkmProfile?->city,
                ],
                'published_at' => $c->published_at?->toDateTimeString(),
            ]),
        );

        return Inertia::render('Creator/Campaigns/Index', [
            'filters' => [
                'q' => $keyword,
                'category_id' => $cat,
                'min_budget' => $minBudget,
                'max_budget' => $maxBudget,
            ],
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'campaigns' => $campaigns,
        ]);
    }

    public function show(Request $request, Campaign $campaign): Response
    {
        abort_unless($campaign->status === CampaignStatus::Open && ! $campaign->is_hidden, 404);

        $campaign->load(['category', 'deliverables', 'umkmProfile']);
        $user = $request->user();

        $alreadyApplied = $user->isCreator() && $campaign->collaborationRequests()
            ->where('creator_id', $user->id)
            ->whereIn('status', ['pending', 'accepted'])
            ->exists();

        return Inertia::render('Creator/Campaigns/Show', [
            'campaign' => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'description' => $campaign->description,
                'budget' => $campaign->budget,
                'deadline' => $campaign->deadline?->toDateString(),
                'category' => $campaign->category?->name,
                'deliverables' => $campaign->deliverables->map(fn ($d): array => [
                    'id' => $d->id,
                    'title' => $d->title,
                    'description' => $d->description,
                    'quantity' => $d->quantity,
                ])->all(),
                'umkm' => [
                    'name' => $campaign->umkmProfile?->business_name,
                    'city' => $campaign->umkmProfile?->city,
                    'business_type' => $campaign->umkmProfile?->business_type,
                ],
                'published_at' => $campaign->published_at?->toDateTimeString(),
            ],
            'already_applied' => $alreadyApplied,
        ]);
    }
}
