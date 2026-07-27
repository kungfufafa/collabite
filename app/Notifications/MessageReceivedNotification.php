<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Mail\CollabiteMailMessage;
use App\Models\Message;
use App\Models\User;
use App\Services\NotificationContentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MessageReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Message $message) {}

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
            'type' => 'message.received',
            'collaboration_id' => $this->message->collaboration_id,
            'campaign_title' => $this->message->conversation?->collaboration?->campaign?->title,
            'sender_name' => $this->message->sender?->name,
            'message_id' => $this->message->id,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var User $notifiable */
        $data = $this->toArray($notifiable);
        $type = 'message.received';
        $message = CollabiteMailMessage::make()
            ->subject(NotificationContentService::title($type))
            ->greeting('Halo '.$notifiable->name.'!')
            ->line(NotificationContentService::body($type, $data));

        $actionUrl = NotificationContentService::actionUrlAbsolute($type, $data, $notifiable);

        if ($actionUrl !== null) {
            $message->action('Lihat Pesan', $actionUrl);
        }

        return $message;
    }
}
