<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Mail\CollabiteMailMessage;
use App\Models\ContentSubmission;
use App\Models\User;
use App\Services\NotificationContentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContentRevisionRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ContentSubmission $submission) {}

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
            'type' => 'content.revision_requested',
            'collaboration_id' => $this->submission->collaboration_id,
            'campaign_title' => $this->submission->collaboration?->campaign?->title,
            'submission_id' => $this->submission->id,
            'version' => $this->submission->version,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var User $notifiable */
        $data = $this->toArray($notifiable);
        $type = 'content.revision_requested';
        $message = CollabiteMailMessage::make()
            ->subject(NotificationContentService::title($type))
            ->greeting('Halo '.$notifiable->name.'!')
            ->line(NotificationContentService::body($type, $data));

        $actionUrl = NotificationContentService::actionUrlAbsolute($type, $data, $notifiable);

        if ($actionUrl !== null) {
            $message->action('Lihat Catatan Revisi', $actionUrl);
        }

        return $message;
    }
}
