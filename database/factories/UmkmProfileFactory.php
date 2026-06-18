<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UmkmProfile>
 */
class UmkmProfileFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->withRole(UserRole::Umkm),
            'business_name' => fake()->company(),
            'business_type' => fake()->randomElement(['F&B', 'Fashion', 'Kecantikan', 'Jasa', 'Retail', 'Kreatif']),
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress(),
            'city' => fake()->randomElement(['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Denpasar']),
            'contact_phone' => fake()->phoneNumber(),
            'contact_email' => fake()->safeEmail(),
            'website_url' => fake()->url(),
        ];
    }
}
