<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\AccountStatus;
use App\Mail\CollabiteMailMessage;
use App\Models\User;
use App\Services\NotificationContentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly AccountStatus $newStatus,
        public readonly ?string $reason = null,
    ) {}

    public function type(): string
    {
        return $this->newStatus === AccountStatus::Suspended
            ? 'account.suspended'
            : 'account.activated';
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
            'new_status' => $this->newStatus->value,
            'reason' => $this->reason,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var User $notifiable */
        $data = $this->toArray($notifiable);
        $type = $this->type();

        return CollabiteMailMessage::make()
            ->subject(NotificationContentService::title($type))
            ->greeting('Halo '.$notifiable->name.'!')
            ->line(NotificationContentService::body($type, $data));
    }
}
