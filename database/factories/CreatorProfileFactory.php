<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CreatorProfile>
 */
class CreatorProfileFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->withRole(UserRole::Creator),
            'headline' => fake()->jobTitle(),
            'bio' => fake()->paragraph(),
            'city' => fake()->randomElement(['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Denpasar']),
            'contact_phone' => fake()->phoneNumber(),
            'contact_email' => fake()->safeEmail(),
            'verification_status' => VerificationStatus::Unverified,
            'rating_avg' => 0,
            'rating_count' => 0,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (): array => [
            'verification_status' => VerificationStatus::Verified,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'verification_status' => VerificationStatus::Pending,
        ]);
    }
}
