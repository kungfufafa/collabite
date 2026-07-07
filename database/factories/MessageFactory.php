<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    protected $model = Message::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'sender_id' => User::factory()->withRole(UserRole::Creator),
            'body' => fake()->randomElement([
                'Halo, saya tertarik dengan brief ini.',
                'Bisa kirim referensi visualnya?',
                'Sudah saya kirim draft awalnya.',
                'Terima kasih, masukan saya terapkan.',
                'Kapan deadline final-nya?',
                'Oke, deal. Saya mulai persiapan.',
            ]),
            'is_hidden' => false,
            'read_at' => fake()->optional(0.7)->passthrough(now()->subHours(fake()->numberBetween(1, 48))),
        ];
    }

    public function unread(): static
    {
        return $this->state(fn (): array => [
            'read_at' => null,
        ]);
    }
}
