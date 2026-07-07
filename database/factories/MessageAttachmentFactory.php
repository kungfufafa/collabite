<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Message;
use App\Models\MessageAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MessageAttachment>
 */
class MessageAttachmentFactory extends Factory
{
    protected $model = MessageAttachment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $uuid = fake()->uuid();

        return [
            'message_id' => Message::factory(),
            'file_path' => 'messages/1/'.$uuid.'.jpg',
            'original_name' => fake()->randomElement(['moodboard.jpg', 'brief.pdf', 'referensi.png']),
            'mime_type' => fake()->randomElement(['image/jpeg', 'application/pdf', 'image/png']),
            'size' => fake()->numberBetween(50_000, 5_000_000),
        ];
    }
}
