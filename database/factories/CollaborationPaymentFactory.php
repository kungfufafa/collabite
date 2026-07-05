<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Collaboration;
use App\Models\CollaborationPayment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CollaborationPayment>
 */
class CollaborationPaymentFactory extends Factory
{
    protected $model = CollaborationPayment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'collaboration_id' => Collaboration::factory(),
            'amount' => fake()->numberBetween(100000, 5000000),
            'status' => PaymentStatus::PendingProof,
        ];
    }

    public function awaitingConfirmation(): static
    {
        return $this->state(fn (): array => [
            'status' => PaymentStatus::AwaitingConfirmation,
            'proof_path' => 'payment/1/'.fake()->uuid().'.jpg',
            'proof_original_name' => 'bukti-transfer.jpg',
            'proof_mime_type' => 'image/jpeg',
            'proof_size' => 1024,
            'submitted_at' => now(),
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (): array => [
            'status' => PaymentStatus::Confirmed,
            'proof_path' => 'payment/1/'.fake()->uuid().'.jpg',
            'proof_original_name' => 'bukti-transfer.jpg',
            'proof_mime_type' => 'image/jpeg',
            'proof_size' => 1024,
            'submitted_at' => now()->subHour(),
            'confirmed_at' => now(),
        ]);
    }
}
