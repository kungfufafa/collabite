<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;

class NotificationContentService
{
    public static function title(string $type): string
    {
        return match ($type) {
            'collaboration.force_closed' => 'Kolaborasi ditutup paksa',
            'collaboration.cancelled' => 'Kolaborasi dibatalkan',
            'collaboration.completed' => 'Kolaborasi selesai',
            'collaboration_request.cancelled_by_creator' => 'Lamaran dibatalkan Creator',
            'collaboration_request.cancelled_by_umkm' => 'Undangan dibatalkan UMKM',
            'payment.proof_submitted' => 'Bukti pembayaran diunggah',
            'payment.confirmed' => 'Pembayaran dikonfirmasi',
            'payment.refunded' => 'Pembayaran direfund',
            'payment.voided' => 'Pembayaran dibatalkan',
            'verification.approved' => 'Verifikasi disetujui',
            'verification.rejected' => 'Verifikasi ditolak',
            'account.suspended' => 'Akun dinonaktifkan',
            'account.activated' => 'Akun diaktifkan kembali',
            default => 'Notifikasi',
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function body(string $type, array $data): string
    {
        $campaignTitle = is_string($data['campaign_title'] ?? null)
            ? $data['campaign_title']
            : 'Campaign';

        return match ($type) {
            'collaboration.force_closed' => sprintf(
                'Kolaborasi "%s" ditutup oleh admin.%s',
                $campaignTitle,
                isset($data['reason']) && is_string($data['reason'])
                    ? ' Alasan: '.$data['reason']
                    : '',
            ),
            'collaboration.cancelled' => sprintf(
                'Kolaborasi "%s" dibatalkan oleh %s.%s',
                $campaignTitle,
                is_string($data['cancelled_by_name'] ?? null) ? $data['cancelled_by_name'] : 'pihak lain',
                isset($data['reason']) && is_string($data['reason'])
                    ? ' Alasan: '.$data['reason']
                    : '',
            ),
            'collaboration.completed' => sprintf(
                'Kolaborasi "%s" ditandai selesai oleh %s.',
                $campaignTitle,
                is_string($data['completed_by_name'] ?? null) ? $data['completed_by_name'] : 'UMKM',
            ),
            'collaboration_request.cancelled_by_creator' => sprintf(
                'Creator %s membatalkan lamaran untuk campaign "%s".',
                is_string($data['creator_name'] ?? null) ? $data['creator_name'] : 'Creator',
                $campaignTitle,
            ),
            'collaboration_request.cancelled_by_umkm' => sprintf(
                'UMKM membatalkan undangan kolaborasi untuk campaign "%s".',
                $campaignTitle,
            ),
            'payment.proof_submitted' => sprintf(
                'UMKM mengunggah bukti transfer untuk "%s". Konfirmasi setelah dana diterima.',
                $campaignTitle,
            ),
            'payment.confirmed' => sprintf(
                'Creator mengonfirmasi penerimaan pembayaran untuk "%s". Anda dapat menyelesaikan kolaborasi.',
                $campaignTitle,
            ),
            'payment.refunded' => sprintf(
                'Pembayaran untuk "%s" ditandai perlu direfund karena kolaborasi dibatalkan.%s',
                $campaignTitle,
                isset($data['reason']) && is_string($data['reason'])
                    ? ' Alasan: '.$data['reason']
                    : '',
            ),
            'payment.voided' => sprintf(
                'Record pembayaran untuk "%s" dibatalkan karena kolaborasi dibatalkan.%s',
                $campaignTitle,
                isset($data['reason']) && is_string($data['reason'])
                    ? ' Alasan: '.$data['reason']
                    : '',
            ),
            'verification.approved' => 'Verifikasi kreator Anda telah disetujui. Kini Anda dapat mengikuti kolaborasi terverifikasi.',
            'verification.rejected' => sprintf(
                'Pengajuan verifikasi Anda ditolak.%s',
                isset($data['rejection_reason']) && is_string($data['rejection_reason'])
                    ? ' Alasan: '.$data['rejection_reason']
                    : ' Silakan periksa kembali dokumen Anda.',
            ),
            'account.suspended' => sprintf(
                'Akun Anda dinonaktifkan oleh admin.%s',
                isset($data['reason']) && is_string($data['reason'])
                    ? ' Alasan: '.$data['reason']
                    : '',
            ),
            'account.activated' => 'Akun Anda telah diaktifkan kembali. Anda dapat login seperti biasa.',
            default => 'Anda memiliki pembaruan baru.',
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function actionUrl(string $type, array $data, User $user): ?string
    {
        // Tipe yang tidak terikat ke collaboration (verifikasi, status akun) tidak
        // memerlukan collaboration_id; selesaikan dulu sebelum guard di bawah.
        if ($type === 'verification.approved' || $type === 'verification.rejected') {
            return match ($user->role) {
                UserRole::Creator => route('creator.verification.show', absolute: false),
                default => null,
            };
        }

        if ($type === 'account.suspended' || $type === 'account.activated') {
            return null;
        }

        $collaborationId = $data['collaboration_id'] ?? null;

        if (! is_int($collaborationId) && ! (is_string($collaborationId) && ctype_digit($collaborationId))) {
            return null;
        }

        $collaborationId = (int) $collaborationId;

        return match ($type) {
            'collaboration.force_closed', 'collaboration.cancelled', 'collaboration.completed' => match ($user->role) {
                UserRole::Admin => route('admin.collaborations.show', $collaborationId, absolute: false),
                UserRole::Umkm => route('umkm.collaborations.show', $collaborationId, absolute: false),
                UserRole::Creator => route('creator.collaborations.show', $collaborationId, absolute: false),
            },
            'collaboration_request.cancelled_by_creator' => match ($user->role) {
                UserRole::Umkm => route('umkm.campaigns.show', (int) ($data['campaign_id'] ?? 0), absolute: false),
                default => null,
            },
            'collaboration_request.cancelled_by_umkm' => match ($user->role) {
                UserRole::Creator => route('creator.requests.index', absolute: false),
                default => null,
            },
            'payment.proof_submitted', 'payment.confirmed', 'payment.refunded', 'payment.voided' => match ($user->role) {
                UserRole::Umkm => route('umkm.collaborations.show', $collaborationId, absolute: false),
                UserRole::Creator => route('creator.collaborations.show', $collaborationId, absolute: false),
                default => null,
            },
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function actionUrlAbsolute(string $type, array $data, User $user): ?string
    {
        $relative = self::actionUrl($type, $data, $user);

        return $relative !== null ? url($relative) : null;
    }
}
