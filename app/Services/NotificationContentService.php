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
            'collaboration_request.cancelled_by_creator' => 'Lamaran dibatalkan Creator',
            'collaboration_request.cancelled_by_umkm' => 'Undangan dibatalkan UMKM',
            'payment.proof_submitted' => 'Bukti pembayaran diunggah',
            'payment.confirmed' => 'Pembayaran dikonfirmasi',
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
            default => 'Anda memiliki pembaruan baru.',
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function actionUrl(string $type, array $data, User $user): ?string
    {
        $collaborationId = $data['collaboration_id'] ?? null;

        if (! is_int($collaborationId) && ! (is_string($collaborationId) && ctype_digit($collaborationId))) {
            return null;
        }

        $collaborationId = (int) $collaborationId;

        return match ($type) {
            'collaboration.force_closed', 'collaboration.cancelled' => match ($user->role) {
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
            'payment.proof_submitted', 'payment.confirmed' => match ($user->role) {
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
