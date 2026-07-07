<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\CollaborationRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CollaborationRequest>
 */
class CollaborationRequestFactory extends Factory
{
    protected $model = CollaborationRequest::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $creator = User::factory()->withRole(UserRole::Creator);

        return [
            'campaign_id' => Campaign::factory()->open(),
            'creator_id' => $creator,
            'sender_id' => $creator,
            'type' => CollaborationRequestType::Application,
            'status' => CollaborationRequestStatus::Pending,
            'message' => fake()->paragraph(),
            'responded_at' => null,
        ];
    }

    public function application(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => CollaborationRequestType::Application,
            'sender_id' => $attributes['creator_id'] ?? User::factory()->withRole(UserRole::Creator),
        ]);
    }

    public function invitation(): static
    {
        return $this->state(fn (): array => [
            'type' => CollaborationRequestType::Invitation,
            'sender_id' => User::factory()->withRole(UserRole::Umkm),
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn (): array => [
            'status' => CollaborationRequestStatus::Accepted,
            'responded_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (): array => [
            'status' => CollaborationRequestStatus::Rejected,
            'responded_at' => now(),
        ]);
    }

    public function cancelledByCreator(): static
    {
        return $this->state(fn (): array => [
            'status' => CollaborationRequestStatus::CancelledByCreator,
            'responded_at' => now(),
        ]);
    }

    public function cancelledByUmkm(): static
    {
        return $this->state(fn (): array => [
            'status' => CollaborationRequestStatus::CancelledByUmkm,
            'responded_at' => now(),
        ]);
    }
}
