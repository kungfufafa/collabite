<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentSubmissionFile>
 */
class ContentSubmissionFileFactory extends Factory
{
    protected $model = ContentSubmissionFile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $uuid = fake()->uuid();

        return [
            'content_submission_id' => ContentSubmission::factory(),
            'file_path' => 'submissions/1/'.$uuid.'.mp4',
            'original_name' => fake()->randomElement(['draft-reels.mp4', 'final-cut.mp4', 'thumbnail.jpg', 'raw-footage.mov']),
            'mime_type' => fake()->randomElement(['video/mp4', 'image/jpeg', 'video/quicktime']),
            'size' => fake()->numberBetween(500_000, 80_000_000),
        ];
    }
}
