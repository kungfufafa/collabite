<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\Enums\PaymentStatus;
use App\Models\CollaborationPayment;
use App\Models\User;
use App\Notifications\PaymentProofSubmittedNotification;
use App\Services\AuditLogger;
use App\Services\FileUrlService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class SubmitPaymentProofAction
{
    public function __construct(private readonly FileUrlService $files) {}

    /**
     * @param  array{proof: UploadedFile, note?: string|null}  $data
     */
    public function execute(CollaborationPayment $payment, User $umkmUser, array $data): CollaborationPayment
    {
        if ($umkmUser->id !== $payment->collaboration->umkm_id) {
            throw ValidationException::withMessages(['payment' => 'Hanya UMKM yang dapat mengunggah bukti pembayaran.']);
        }

        if ($payment->status !== PaymentStatus::PendingProof) {
            throw ValidationException::withMessages(['payment' => 'Bukti pembayaran sudah dikirim atau dikonfirmasi.']);
        }

        return DB::transaction(function () use ($payment, $data, $umkmUser): CollaborationPayment {
            // Lock baris payment agar dua upload bukti konkuren tidak saling
            // menimpa (race condition pada status + file proof).
            $locked = CollaborationPayment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== PaymentStatus::PendingProof) {
                throw ValidationException::withMessages(['payment' => 'Bukti pembayaran sudah dikirim atau dikonfirmasi.']);
            }

            if ($locked->proof_path) {
                $this->files->delete($locked->proof_path, 'local');
            }

            $file = $data['proof'];
            $path = $this->files->storePrivate($file, 'payment', $locked->collaboration_id);

            $locked->update([
                'proof_path' => $path,
                'proof_original_name' => $file->getClientOriginalName(),
                'proof_mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                'proof_size' => $file->getSize() ?? 0,
                'note' => $data['note'] ?? null,
                'status' => PaymentStatus::AwaitingConfirmation,
                'submitted_at' => now(),
            ]);

            $fresh = $locked->fresh(['collaboration.campaign', 'collaboration.creator']);

            app(AuditLogger::class)->log(
                $umkmUser,
                'payment.proof_submitted',
                $fresh,
                ['collaboration_id' => $fresh->collaboration_id, 'amount' => (string) $fresh->amount],
            );

            // Notifikasi setelah commit agar tidak terkirim jika transaksi di-rollback.
            $creator = $fresh->collaboration->creator;
            $notification = new PaymentProofSubmittedNotification($fresh);
            DB::afterCommit(fn () => Notification::send($creator, $notification));

            return $fresh;
        });
    }
}
