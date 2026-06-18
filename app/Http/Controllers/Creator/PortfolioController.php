<?php

declare(strict_types=1);

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Creator\PortfolioItemRequest;
use App\Models\CreatorProfile;
use App\Models\PortfolioItem;
use App\Models\User;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function index(Request $request): Response
    {
        $profile = $this->profileForUser($request->user());
        $items = $profile->portfolioItems()
            ->orderBy('display_order')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Creator/Portfolio/Index', [
            'portfolio_items' => $items->map(fn (PortfolioItem $item): array => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'external_url' => $item->external_url,
                'media_url' => $this->files->publicUrl($item->media_path),
                'display_order' => $item->display_order,
            ])->all(),
        ]);
    }

    public function store(PortfolioItemRequest $request): RedirectResponse
    {
        $profile = $this->profileForUser($request->user());
        $data = $request->validated();

        DB::transaction(function () use ($profile, $data, $request): void {
            $mediaPath = null;
            if ($request->hasFile('media')) {
                $mediaPath = $this->files->storePublic($request->file('media'), 'portfolio', $profile->id);
            }

            $profile->portfolioItems()->create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'external_url' => $data['external_url'] ?? null,
                'media_path' => $mediaPath,
                'display_order' => $data['display_order'] ?? 0,
            ]);
        });

        return back()->with('status', 'Item portofolio berhasil ditambahkan.');
    }

    public function destroy(Request $request, PortfolioItem $portfolioItem): RedirectResponse
    {
        $profile = $this->profileForUser($request->user());

        abort_unless($portfolioItem->creator_profile_id === $profile->id, 403);

        DB::transaction(function () use ($portfolioItem): void {
            $this->files->delete($portfolioItem->media_path, 'public');
            $portfolioItem->delete();
        });

        return back()->with('status', 'Item portofolio dihapus.');
    }

    private function profileForUser(User $user): CreatorProfile
    {
        return $user->creatorProfile()->firstOrFail();
    }
}
