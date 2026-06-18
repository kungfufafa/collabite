<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status campaign (TDD §14.3).
 */
enum CampaignStatus: string
{
    case Draft = 'draft';
    case Open = 'open';
    case InCollaboration = 'in_collaboration';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Open => 'Terbuka',
            self::InCollaboration => 'Dalam Kolaborasi',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
        };
    }

    /**
     * Status yang tampil di pencarian publik Creator.
     */
    public function isPubliclyVisible(): bool
    {
        return $this === self::Open;
    }
}
