<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

class NotificationPresenter
{
    /**
     * @return array{
     *     id: string,
     *     title: string,
     *     body: string,
     *     href: string|null,
     *     read_at: string|null,
     *     created_at: string|null,
     *     is_read: bool,
     *     type: string,
     *     data: array<string, mixed>,
     * }
     */
    public static function present(DatabaseNotification $notification, User $user): array
    {
        /** @var array<string, mixed> $data */
        $data = $notification->data;
        $type = is_string($data['type'] ?? null) ? $data['type'] : 'unknown';

        return [
            'id' => $notification->id,
            'title' => NotificationContentService::title($type),
            'body' => NotificationContentService::body($type, $data),
            'href' => NotificationContentService::actionUrl($type, $data, $user),
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->format('d M Y H:i'),
            'is_read' => $notification->read_at !== null,
            'type' => $type,
            'data' => $data,
        ];
    }

    /**
     * @return list<array{
     *     id: string,
     *     title: string,
     *     body: string,
     *     href: string|null,
     *     read_at: string|null,
     *     created_at: string|null,
     *     is_read: bool,
     *     type: string,
     *     data: array<string, mixed>,
     * }>
     */
    public static function recentForUser(User $user, int $limit = 5): array
    {
        return self::presentCollection(
            $user->notifications()->limit($limit)->get(),
            $user,
        );
    }

    /**
     * @param  Collection<int, DatabaseNotification>  $notifications
     * @return list<array{
     *     id: string,
     *     title: string,
     *     body: string,
     *     href: string|null,
     *     read_at: string|null,
     *     created_at: string|null,
     *     is_read: bool,
     *     type: string,
     *     data: array<string, mixed>,
     * }>
     */
    public static function presentCollection(Collection $notifications, User $user): array
    {
        return $notifications
            ->map(fn (DatabaseNotification $notification): array => self::present($notification, $user))
            ->values()
            ->all();
    }
}
