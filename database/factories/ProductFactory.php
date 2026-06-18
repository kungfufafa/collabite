<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\UmkmProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'umkm_profile_id' => UmkmProfile::factory(),
            'name' => ucwords(fake()->words(2, true)),
            'description' => fake()->paragraph(),
            'price' => fake()->numberBetween(10000, 500000),
            'is_active' => true,
        ];
    }
}
