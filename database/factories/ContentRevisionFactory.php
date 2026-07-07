<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\ContentRevision;
use App\Models\ContentSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentRevision>
 */
class ContentRevisionFactory extends Factory
{
    protected $model = ContentRevision::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_submission_id' => ContentSubmission::factory(),
            'umkm_id' => User::factory()->withRole(UserRole::Umkm),
            'note' => fake()->randomElement([
                'Teks hook kurang menarik, tolong diperkuat.',
                'Logo produk belum kelihatan, perlu close-up.',
                'Color grading terlalu gelap, cerahkan sedikit.',
                'Durasi sedikit kepanjangan, potong 5 detik.',
                'Tambahkan CTA di akhir video.',
            ]),
        ];
    }
}
