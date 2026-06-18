<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status akun pengguna.
 * Lihat PRD §11.1 (FR-AUTH-008) dan TDD §9.
 */
enum AccountStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Suspended => 'Dinonaktifkan',
        };
    }
}
