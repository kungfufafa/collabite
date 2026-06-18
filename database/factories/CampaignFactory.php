<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\UmkmProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Campaign>
 */
class CampaignFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'umkm_profile_id' => UmkmProfile::factory(),
            'category_id' => Category::factory(),
            'title' => ucwords(fake()->words(4, true)),
            'description' => fake()->paragraphs(2, true),
            'budget' => fake()->numberBetween(500000, 10000000),
            'deadline' => now()->addDays(30)->toDateString(),
            'status' => CampaignStatus::Draft,
            'is_hidden' => false,
        ];
    }

    public function open(): static
    {
        return $this->state(fn (): array => [
            'status' => CampaignStatus::Open,
            'published_at' => now(),
        ]);
    }

    public function inCollaboration(): static
    {
        return $this->state(fn (): array => [
            'status' => CampaignStatus::InCollaboration,
            'published_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => [
            'status' => CampaignStatus::Cancelled,
        ]);
    }
}
