<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContentSubmissionStatus;
use App\Models\Collaboration;
use App\Models\ContentSubmission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentSubmission>
 */
class ContentSubmissionFactory extends Factory
{
    protected $model = ContentSubmission::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'collaboration_id' => Collaboration::factory(),
            'version' => 1,
            'title' => 'Draft '.fake()->words(3, true),
            'description' => fake()->paragraph(),
            'status' => ContentSubmissionStatus::Draft,
            'is_hidden' => false,
            'submitted_at' => null,
            'approved_at' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => [
            'status' => ContentSubmissionStatus::Draft,
            'submitted_at' => null,
            'approved_at' => null,
        ]);
    }

    public function inReview(): static
    {
        return $this->state(fn (): array => [
            'status' => ContentSubmissionStatus::InReview,
            'submitted_at' => now()->subDays(fake()->numberBetween(1, 5)),
            'approved_at' => null,
        ]);
    }

    public function revisionRequested(): static
    {
        return $this->state(fn (): array => [
            'status' => ContentSubmissionStatus::RevisionRequested,
            'submitted_at' => now()->subDays(fake()->numberBetween(2, 8)),
            'approved_at' => null,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (): array => [
            'status' => ContentSubmissionStatus::Approved,
            'submitted_at' => now()->subDays(fake()->numberBetween(5, 14)),
            'approved_at' => now()->subDays(fake()->numberBetween(1, 5)),
        ]);
    }

    public function superseded(): static
    {
        return $this->state(fn (): array => [
            'status' => ContentSubmissionStatus::Superseded,
            'submitted_at' => now()->subDays(fake()->numberBetween(8, 18)),
            'approved_at' => null,
        ]);
    }
}
