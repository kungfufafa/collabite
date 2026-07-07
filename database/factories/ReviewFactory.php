<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Collaboration;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'collaboration_id' => Collaboration::factory()->completed(),
            'reviewer_id' => User::factory()->withRole(UserRole::Umkm),
            'reviewee_id' => User::factory()->withRole(UserRole::Creator),
            'rating' => fake()->numberBetween(4, 5),
            'body' => fake()->paragraph(),
            'is_hidden' => false,
        ];
    }

    /**
     * @param  int<1, 5>  $rating
     */
    public function rating(int $rating): static
    {
        return $this->state(fn (): array => [
            'rating' => max(1, min(5, $rating)),
        ]);
    }

    public function hidden(): static
    {
        return $this->state(fn (): array => [
            'is_hidden' => true,
        ]);
    }
}
