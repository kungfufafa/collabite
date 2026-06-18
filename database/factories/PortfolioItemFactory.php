<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CreatorProfile;
use App\Models\PortfolioItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PortfolioItem>
 */
class PortfolioItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'creator_profile_id' => CreatorProfile::factory(),
            'title' => ucwords(fake()->words(3, true)),
            'description' => fake()->sentence(),
            'media_path' => null,
            'external_url' => fake()->url(),
            'display_order' => 0,
        ];
    }
}
