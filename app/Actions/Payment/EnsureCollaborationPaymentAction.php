<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\Enums\PaymentStatus;
use App\Models\Collaboration;
use App\Models\CollaborationPayment;

/**
 * Buat record pembayaran saat submission disetujui (MVP+ manual payment).
 */
class EnsureCollaborationPaymentAction
{
    public function execute(Collaboration $collaboration): CollaborationPayment
    {
        $existing = $collaboration->payment;

        if ($existing !== null) {
            return $existing;
        }

        $collaboration->loadMissing('campaign');

        return $collaboration->payment()->create([
            'amount' => $collaboration->campaign->budget ?? 0,
            'status' => PaymentStatus::PendingProof,
        ]);
    }
}
