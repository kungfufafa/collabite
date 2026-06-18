<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Peran pengguna pada aplikasi Collabite.
 * Lihat PRD §11.1 (FR-AUTH-007) dan TDD §9.
 */
enum UserRole: string
{
    case Umkm = 'umkm';
    case Creator = 'creator';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Umkm => 'UMKM',
            self::Creator => 'Content Creator',
            self::Admin => 'Admin',
        };
    }
}
