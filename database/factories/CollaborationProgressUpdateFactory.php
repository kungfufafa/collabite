<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Collaboration;
use App\Models\CollaborationProgressUpdate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CollaborationProgressUpdate>
 */
class CollaborationProgressUpdateFactory extends Factory
{
    protected $model = CollaborationProgressUpdate::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'collaboration_id' => Collaboration::factory(),
            'creator_id' => User::factory()->withRole(UserRole::Creator),
            'message' => fake()->randomElement([
                'Shooting day 1 selesai, 3 looks terekam.',
                'Draft edit mentah sudah saya kirim, menunggu feedback.',
                'Sudah rekam voice over, tinggal final cut.',
                'Materi foto sudah kurating, 8 frame pilihan.',
                'Revisi sesuai catatan sudah diterapkan, mohon review.',
                'Pengambilan b-roll tambahan hari ini.',
            ]),
            'attachment_path' => null,
            'attachment_original_name' => null,
        ];
    }
}
