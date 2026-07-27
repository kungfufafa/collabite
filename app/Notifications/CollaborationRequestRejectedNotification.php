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

class CollaborationRequestRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly CollaborationRequest $request,
        public readonly User $rejectedBy,
        public readonly ?string $reason = null,
    ) {}

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
            'type' => 'collaboration_request.rejected',
            'request_id' => $this->request->id,
            'campaign_id' => $this->request->campaign_id,
            'campaign_title' => $this->request->campaign?->title,
            'rejected_by_name' => $this->rejectedBy->name,
            'reason' => $this->reason,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var User $notifiable */
        $data = $this->toArray($notifiable);
        $type = 'collaboration_request.rejected';
        $message = CollabiteMailMessage::make()
            ->subject(NotificationContentService::title($type))
            ->greeting('Halo '.$notifiable->name.'!')
            ->line(NotificationContentService::body($type, $data));

        $actionUrl = NotificationContentService::actionUrlAbsolute($type, $data, $notifiable);

        if ($actionUrl !== null) {
            $message->action('Lihat Detail', $actionUrl);
        }

        return $message;
    }
}
