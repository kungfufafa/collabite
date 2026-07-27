<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Mail\CollabiteMailMessage;
use App\Models\CollaborationRequest;
use App\Models\User;
use App\Services\NotificationContentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly CollaborationRequest $request) {}

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
            'type' => 'collaboration_request.application_received',
            'request_id' => $this->request->id,
            'campaign_id' => $this->request->campaign_id,
            'campaign_title' => $this->request->campaign?->title,
            'creator_name' => $this->request->creator?->name,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var User $notifiable */
        $data = $this->toArray($notifiable);
        $type = 'collaboration_request.application_received';
        $message = CollabiteMailMessage::make()
            ->subject(NotificationContentService::title($type))
            ->greeting('Halo '.$notifiable->name.'!')
            ->line(NotificationContentService::body($type, $data));

        $actionUrl = NotificationContentService::actionUrlAbsolute($type, $data, $notifiable);

        if ($actionUrl !== null) {
            $message->action('Lihat Lamaran', $actionUrl);
        }

        return $message;
    }
}
