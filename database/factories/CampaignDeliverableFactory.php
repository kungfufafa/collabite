<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Campaign;
use App\Models\CampaignDeliverable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CampaignDeliverable>
 */
class CampaignDeliverableFactory extends Factory
{
    protected $model = CampaignDeliverable::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titles = [
            'Video Reels 30 detik',
            'Feed Post Instagram',
            'Foto Produk High-res',
            'Story 24 Jam',
            'Video Review 60 detik',
            'Carousel Edukasi',
            'TikTok Video 45 detik',
            'Booster Ads Booster',
        ];

        return [
            'campaign_id' => Campaign::factory(),
            'title' => fake()->randomElement($titles).' #'.fake()->numberBetween(1, 9),
            'description' => fake()->sentence(),
            'quantity' => fake()->numberBetween(1, 6),
        ];
    }
}
