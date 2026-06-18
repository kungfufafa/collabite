<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Enums\UserRole;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Mendaftarkan akun UMKM baru dan otomatis membuat profil UMKM kosong.
 *
 * Lihat PRD §11.1 (FR-AUTH-001), UC-AUTH-001.
 */
class RegisterUmkmAction
{
    /**
     * @param  array{name: string, email: string, password: string, business_name: string, business_type: string}  $data
     */
    public function execute(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => UserRole::Umkm,
            ]);

            UmkmProfile::create([
                'user_id' => $user->id,
                'business_name' => $data['business_name'],
                'business_type' => $data['business_type'],
            ]);

            event(new Registered($user));

            return $user;
        });
    }
}
