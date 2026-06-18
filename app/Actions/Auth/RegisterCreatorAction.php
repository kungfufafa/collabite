<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Mendaftarkan akun Content Creator baru dengan profil Creator kosong.
 *
 * Lihat PRD §11.1 (FR-AUTH-002), UC-AUTH-002.
 */
class RegisterCreatorAction
{
    /**
     * @param  array{name: string, email: string, password: string, contact_phone?: string|null, city?: string|null}  $data
     */
    public function execute(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => UserRole::Creator,
            ]);

            CreatorProfile::create([
                'user_id' => $user->id,
                'contact_phone' => $data['contact_phone'] ?? null,
                'city' => $data['city'] ?? null,
                'verification_status' => VerificationStatus::Unverified,
            ]);

            event(new Registered($user));

            return $user;
        });
    }
}
