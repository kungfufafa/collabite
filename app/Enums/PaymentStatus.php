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
    case Voided = 'voided';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::PendingProof => 'Menunggu Bukti Transfer',
            self::AwaitingConfirmation => 'Menunggu Konfirmasi Creator',
            self::Confirmed => 'Pembayaran Dikonfirmasi',
            self::Voided => 'Dibatalkan',
            self::Refunded => 'Dikembalikan (Refund)',
        };
    }

    /**
     * Apakah status ini menandakan pembayaran sudah batal/dikembalikan
     * (escrow dilepas tanpa dana sah diterima Creator).
     */
    public function isSettled(): bool
    {
        return $this === self::Confirmed
            || $this === self::Voided
            || $this === self::Refunded;
    }

    /**
     * Apakah record pembayaran masih dalam siklus aktif (belum settled).
     */
    public function isActive(): bool
    {
        return $this === self::PendingProof
            || $this === self::AwaitingConfirmation;
    }

    /**
     * Apakah record pembayaran sudah ditutup tanpa dana sah (Voided/Refunded).
     * Confirmed TIDAK termasuk — dana sudah sah diterima dan harus direfund
     * secara eksplisit saat kolaborasi dibatalkan/force-close, bukan diabaikan.
     */
    public function isClosed(): bool
    {
        return $this === self::Voided
            || $this === self::Refunded;
    }
}
