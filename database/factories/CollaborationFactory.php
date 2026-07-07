<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CollaborationStatus;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Collaboration>
 */
class CollaborationFactory extends Factory
{
    protected $model = Collaboration::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'campaign_id' => Campaign::factory()->inCollaboration(),
            'umkm_id' => User::factory()->withRole(UserRole::Umkm),
            'creator_id' => User::factory()->withRole(UserRole::Creator),
            'status' => CollaborationStatus::Active,
            'started_at' => now(),
            'completed_at' => null,
            'cancelled_at' => null,
            'cancelled_by' => null,
            'cancelled_reason' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (): array => [
            'status' => CollaborationStatus::Active,
            'started_at' => now()->subDays(fake()->numberBetween(1, 14)),
            'completed_at' => null,
            'cancelled_at' => null,
            'cancelled_by' => null,
            'cancelled_reason' => null,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'status' => CollaborationStatus::Completed,
            'started_at' => now()->subWeeks(fake()->numberBetween(3, 10)),
            'completed_at' => now()->subWeeks(fake()->numberBetween(1, 8)),
            'cancelled_at' => null,
            'cancelled_by' => null,
            'cancelled_reason' => null,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => [
            'status' => CollaborationStatus::Cancelled,
            'started_at' => now()->subWeeks(fake()->numberBetween(1, 6)),
            'completed_at' => null,
            'cancelled_at' => now()->subDays(fake()->numberBetween(1, 14)),
            'cancelled_by' => User::factory()->withRole(UserRole::Umkm),
            'cancelled_reason' => fake()->randomElement([
                'Creator tidak responsif.',
                'Brief berubah drastis, deal dibatalkan.',
                'Budget UMKM terpotong, tidak bisa lanjut.',
                'Jadwal bentrok, disepakati berhenti.',
            ]),
        ]);
    }
}
