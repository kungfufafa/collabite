<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status konfirmasi pembayaran manual (MVP+).
 */
enum PaymentStatus: string
{
    case PendingProof = 'pending_proof';
    case AwaitingConfirmation = 'awaiting_confirmation';
    case Confirmed = 'confirmed';

    public function label(): string
    {
        return match ($this) {
            self::PendingProof => 'Menunggu Bukti Transfer',
            self::AwaitingConfirmation => 'Menunggu Konfirmasi Creator',
            self::Confirmed => 'Pembayaran Dikonfirmasi',
        };
    }
}
