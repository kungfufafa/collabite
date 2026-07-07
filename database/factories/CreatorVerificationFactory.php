<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\CreatorProfile;
use App\Models\CreatorVerification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CreatorVerification>
 */
class CreatorVerificationFactory extends Factory
{
    protected $model = CreatorVerification::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'creator_profile_id' => CreatorProfile::factory(),
            'status' => VerificationStatus::Pending,
            'submitted_at' => now()->subDays(fake()->numberBetween(1, 7)),
            'reviewed_at' => null,
            'reviewed_by' => null,
            'rejection_reason' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'status' => VerificationStatus::Pending,
            'submitted_at' => now()->subDays(fake()->numberBetween(1, 7)),
            'reviewed_at' => null,
            'reviewed_by' => null,
            'rejection_reason' => null,
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn (): array => [
            'status' => VerificationStatus::Verified,
            'submitted_at' => now()->subDays(fake()->numberBetween(10, 60)),
            'reviewed_at' => now()->subDays(fake()->numberBetween(8, 58)),
            'reviewed_by' => User::factory()->withRole(UserRole::Admin),
            'rejection_reason' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (): array => [
            'status' => VerificationStatus::Rejected,
            'submitted_at' => now()->subDays(fake()->numberBetween(5, 30)),
            'reviewed_at' => now()->subDays(fake()->numberBetween(3, 28)),
            'reviewed_by' => User::factory()->withRole(UserRole::Admin),
            'rejection_reason' => fake()->randomElement([
                'Foto KTP tidak jelas.',
                'Dokumen portofolio tidak memadai.',
                'Identitas tidak terbaca, mohon unggah ulang.',
            ]),
        ]);
    }
}
