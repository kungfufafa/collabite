<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Collaboration;
use Illuminate\Notifications\Notification;

class CollaborationForceClosedNotification extends Notification
{
    public function __construct(
        public readonly Collaboration $collaboration,
        public readonly string $reason,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        unset($notifiable); // signature required by base class; payload is identical for both parties.

        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        unset($notifiable);

        return [
            'type' => 'collaboration.force_closed',
            'collaboration_id' => $this->collaboration->id,
            'campaign_title' => $this->collaboration->campaign?->title,
            'reason' => $this->reason,
        ];
    }
}
