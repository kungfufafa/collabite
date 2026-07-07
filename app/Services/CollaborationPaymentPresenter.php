<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CollaborationPayment;

/**
 * @phpstan-type PaymentPayload array{
 *     id: int,
 *     amount: string,
 *     status: string,
 *     status_label: string,
 *     note: string|null,
 *     proof_url: string|null,
 *     proof_original_name: string|null,
 *     submitted_at: string|null,
 *     confirmed_at: string|null,
 *     voided_at: string|null,
 *     voided_reason: string|null,
 * }
 */
class CollaborationPaymentPresenter
{
    public function __construct(private readonly FileUrlService $files) {}

    /**
     * @return PaymentPayload|null
     */
    public function present(?CollaborationPayment $payment): ?array
    {
        if ($payment === null) {
            return null;
        }

        return [
            'id' => $payment->id,
            'amount' => (string) $payment->amount,
            'status' => $payment->status->value,
            'status_label' => $payment->status->label(),
            'note' => $payment->note,
            'proof_url' => $payment->proof_path !== null
                ? $this->files->privateUrl($payment->proof_path)
                : null,
            'proof_original_name' => $payment->proof_original_name,
            'submitted_at' => $payment->submitted_at?->toIso8601String(),
            'confirmed_at' => $payment->confirmed_at?->toIso8601String(),
            'voided_at' => $payment->voided_at?->toIso8601String(),
            'voided_reason' => $payment->voided_reason,
        ];
    }
}
