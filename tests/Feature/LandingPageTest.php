<?php

declare(strict_types=1);

use App\Models\CreatorProfile;
use App\Models\PortfolioItem;
use Database\Seeders\DatabaseSeeder;

test('homepage renders dynamic landing props from database', function (): void {
    $this->seed(DatabaseSeeder::class);

    $response = $this->get(route('home'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('Public/Welcome')
        ->has('featuredCreators')
        ->has('heroSpotlight')
        ->has('featuredCampaign')
        ->has('categories')
        ->where('featuredCreators', fn ($creators) => count($creators) >= 3)
        ->where('heroSpotlight.campaign_title', 'Showcase Koleksi Batik')
        ->where('featuredCampaign.title', 'Showcase Koleksi Batik')
    );
});

test('featured creators include portfolio image urls when demo media is seeded', function (): void {
    $this->seed(DatabaseSeeder::class);

    $creatorsWithMedia = CreatorProfile::query()
        ->where('verification_status', 'verified')
        ->whereHas('portfolioItems', fn ($q) => $q->whereNotNull('media_path'))
        ->count();

    expect($creatorsWithMedia)->toBeGreaterThanOrEqual(3);

    $response = $this->get(route('home'));

    $response->assertInertia(fn ($page) => $page
        ->where('featuredCreators.0.portfolio_urls', fn ($urls) => count($urls) >= 1)
        ->where('featuredCreators.0.profile_photo_url', fn ($url) => is_string($url) && $url !== '')
    );

    expect(PortfolioItem::query()->whereNotNull('media_path')->count())->toBeGreaterThanOrEqual(9);
});
