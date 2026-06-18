<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status verifikasi Creator (TDD §14.2).
 */
enum VerificationStatus: string
{
    case Unverified = 'unverified';
    case Pending = 'pending';
    case Verified = 'verified';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Unverified => 'Belum terverifikasi',
            self::Pending => 'Menunggu tinjauan',
            self::Verified => 'Terverifikasi',
            self::Rejected => 'Ditolak',
        };
    }
}
