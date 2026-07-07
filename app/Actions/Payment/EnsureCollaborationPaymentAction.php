<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\Enums\ContentSubmissionStatus;
use App\Enums\PaymentStatus;
use App\Models\Collaboration;
use App\Models\CollaborationPayment;
use Illuminate\Validation\ValidationException;

/**
 * Buat record pembayaran saat submission disetujui (MVP+ manual payment).
 *
 * Record escrow hanya boleh tercipta setelah UMKM menyetujui submission —
 * ini menjamin urutan state machine: konten disetujui dulu, baru pembayaran
 * ditahan (hold), lalu UMKM upload bukti, Creator konfirmasi (release).
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

        $hasApproved = $collaboration->submissions()
            ->where('status', ContentSubmissionStatus::Approved)
            ->exists();
        if (! $hasApproved) {
            throw ValidationException::withMessages(['payment' => 'Pembayaran hanya dapat dibuat setelah submission disetujui.']);
        }

        return $collaboration->payment()->create([
            'amount' => $collaboration->campaign->budget ?? 0,
            'status' => PaymentStatus::PendingProof,
        ]);
    }
}
