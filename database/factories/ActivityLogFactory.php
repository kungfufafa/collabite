<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<ActivityLog>
 *
 * ActivityLog append-only dengan $timestamps=false (hanya created_at).
 * Factory menyetel created_at lewat afterMaking karena kolom tidak mass-assignable.
 */
class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'actor_id' => User::factory(),
            'actor_role' => UserRole::Umkm->value,
            'action' => 'seed.activity',
            'subject_type' => null,
            'subject_id' => null,
            'metadata' => null,
        ];
    }

    /**
     * Set created_at secara manual (kolom tidak fillable, model append-only).
     */
    public function occurredAt(\DateTimeInterface|string|null $at): static
    {
        return $this->afterMaking(function (ActivityLog $log) use ($at): void {
            $log->created_at = $at !== null ? Carbon::parse($at) : now();
        });
    }
}
