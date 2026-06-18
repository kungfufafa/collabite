<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Jenis dokumen verifikasi Creator.
 */
enum VerificationDocumentType: string
{
    case IdentityCard = 'identity_card';
    case PortfolioProof = 'portfolio_proof';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::IdentityCard => 'Kartu Identitas',
            self::PortfolioProof => 'Bukti Portofolio',
            self::Other => 'Lainnya',
        };
    }
}
