<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status collaboration request (TDD §14.4 + ADR-014).
 */
enum CollaborationRequestStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case CancelledByCreator = 'cancelled_by_creator';
    case CancelledByUmkm = 'cancelled_by_umkm';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu',
            self::Accepted => 'Diterima',
            self::Rejected => 'Ditolak',
            self::CancelledByCreator => 'Dibatalkan Creator',
            self::CancelledByUmkm => 'Dibatalkan UMKM',
        };
    }

    /**
     * Status yang masih aktif (membentuk kolaborasi jika diterima).
     */
    public function isOpen(): bool
    {
        return $this === self::Pending;
    }
}
