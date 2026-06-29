<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder akun admin pertama (PRD FR-AUTH-007, AGENTS.md §11).
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@collabite.test'],
            [
                'name' => 'Admin Collabite',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ]
        );
    }
}
