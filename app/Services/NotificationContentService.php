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
            'collaboration_request.invitation_received' => 'Anda diundang berkolaborasi',
            'collaboration_request.application_received' => 'Lamaran baru diterima',
            'collaboration_request.accepted' => 'Pengajuan diterima',
            'collaboration_request.rejected' => 'Pengajuan ditolak',
            'content.submitted_for_review' => 'Submission dikirim untuk review',
            'content.revision_requested' => 'Revisi diminta',
            'content.approved' => 'Submission disetujui',
            'message.received' => 'Pesan baru',
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
            'collaboration_request.invitation_received' => sprintf(
                'UMKM %s mengundang Anda untuk berkolaborasi pada campaign "%s".',
                is_string($data['umkm_name'] ?? null) ? $data['umkm_name'] : 'UMKM',
                $campaignTitle,
            ),
            'collaboration_request.application_received' => sprintf(
                'Creator %s mengirim lamaran untuk campaign "%s" Anda.',
                is_string($data['creator_name'] ?? null) ? $data['creator_name'] : 'Creator',
                $campaignTitle,
            ),
            'collaboration_request.accepted' => sprintf(
                'Pengajuan untuk campaign "%s" diterima oleh %s. Kolaborasi dimulai.',
                $campaignTitle,
                is_string($data['accepted_by_name'] ?? null) ? $data['accepted_by_name'] : 'pihak lain',
            ),
            'collaboration_request.rejected' => sprintf(
                'Pengajuan untuk campaign "%s" ditolak oleh %s.%s',
                $campaignTitle,
                is_string($data['rejected_by_name'] ?? null) ? $data['rejected_by_name'] : 'pihak lain',
                isset($data['reason']) && is_string($data['reason'])
                    ? ' Alasan: '.$data['reason']
                    : '',
            ),
            'content.submitted_for_review' => sprintf(
                'Creator mengirim submission v%s pada kolaborasi "%s" untuk ditinjau.',
                isset($data['version']) ? (string) $data['version'] : '1',
                $campaignTitle,
            ),
            'content.revision_requested' => sprintf(
                'UMKM meminta revisi pada submission v%s kolaborasi "%s". Lihat catatan revisi.',
                isset($data['version']) ? (string) $data['version'] : '1',
                $campaignTitle,
            ),
            'content.approved' => sprintf(
                'Submission v%s pada kolaborasi "%s" disetujui oleh UMKM.',
                isset($data['version']) ? (string) $data['version'] : '1',
                $campaignTitle,
            ),
            'message.received' => sprintf(
                '%s mengirim pesan baru pada kolaborasi "%s".',
                is_string($data['sender_name'] ?? null) ? $data['sender_name'] : 'Pihak lain',
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
            'collaboration_request.invitation_received' => match ($user->role) {
                UserRole::Creator => route('creator.requests.index', absolute: false),
                default => null,
            },
            'collaboration_request.application_received' => match ($user->role) {
                UserRole::Umkm => route('umkm.campaigns.show', (int) ($data['campaign_id'] ?? 0), absolute: false),
                default => null,
            },
            'collaboration_request.accepted' => match ($user->role) {
                UserRole::Umkm => route('umkm.collaborations.show', $collaborationId, absolute: false),
                UserRole::Creator => route('creator.collaborations.show', $collaborationId, absolute: false),
                default => null,
            },
            'collaboration_request.rejected' => match ($user->role) {
                UserRole::Creator => route('creator.requests.index', absolute: false),
                UserRole::Umkm => route('umkm.campaigns.show', (int) ($data['campaign_id'] ?? 0), absolute: false),
                default => null,
            },
            'content.submitted_for_review', 'content.revision_requested', 'content.approved', 'message.received' => match ($user->role) {
                UserRole::Umkm => route('umkm.collaborations.show', $collaborationId, absolute: false),
                UserRole::Creator => route('creator.collaborations.show', $collaborationId, absolute: false),
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
