<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\VerificationStatus;
use App\Mail\CollabiteMailMessage;
use App\Models\CreatorVerification;
use App\Models\User;
use App\Services\NotificationContentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly CreatorVerification $verification,
        public readonly ?string $rejectionReason = null,
    ) {}

    public function type(): string
    {
        return $this->verification->status === VerificationStatus::Verified
            ? 'verification.approved'
            : 'verification.rejected';
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        unset($notifiable);

        return ['database', 'mail'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        unset($notifiable);

        return [
            'type' => $this->type(),
            'verification_id' => $this->verification->id,
            'status' => $this->verification->status->value,
            'rejection_reason' => $this->rejectionReason,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var User $notifiable */
        $data = $this->toArray($notifiable);
        $type = $this->type();
        $message = CollabiteMailMessage::make()
            ->subject(NotificationContentService::title($type))
            ->greeting('Halo '.$notifiable->name.'!')
            ->line(NotificationContentService::body($type, $data));

        $actionUrl = NotificationContentService::actionUrlAbsolute($type, $data, $notifiable);

        if ($actionUrl !== null) {
            $message->action('Lihat Status Verifikasi', $actionUrl);
        }

        return $message;
    }
}
