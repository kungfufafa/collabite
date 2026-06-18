<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status kolaborasi (TDD §14.5).
 */
enum CollaborationStatus: string
{
    case Active = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
        };
    }
}
