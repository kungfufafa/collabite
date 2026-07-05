import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import { WorkspacePage } from '@/components/app/workspace-page';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/notifications';

type NotificationItem = {
    id: string;
    title: string;
    body: string;
    href: string | null;
    read_at: string | null;
    created_at: string | null;
    is_read: boolean;
    type: string;
};

type Props = {
    notifications: {
        data: NotificationItem[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
    unread_count: number;
};

export default function NotificationsIndex({
    notifications,
    unread_count,
}: Props): ReactNode {
    const handleMarkAllRead = (): void => {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Notifikasi" />
            <WorkspacePage
                actions={
                    unread_count > 0 ? (
                        <Button onClick={handleMarkAllRead} type="button" variant="outline">
                            <CheckCheck />
                            Tandai semua dibaca
                        </Button>
                    ) : null
                }
                description={
                    unread_count > 0
                        ? `${unread_count} notifikasi belum dibaca.`
                        : 'Semua notifikasi sudah dibaca.'
                }
                title="Notifikasi"
            >
                {notifications.data.length === 0 ? (
                    <ResourceCard className="flex flex-col items-center gap-3 py-10 text-center">
                        <Bell className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Belum ada notifikasi untuk akun Anda.
                        </p>
                    </ResourceCard>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notifications.data.map((notification) => (
                            <ResourceCard
                                className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                                key={notification.id}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-foreground">
                                            {notification.title}
                                        </p>
                                        {!notification.is_read ? (
                                            <StatusBadge label="Baru" tone="info" />
                                        ) : null}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {notification.body}
                                    </p>
                                    {notification.created_at ? (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {notification.created_at}
                                        </p>
                                    ) : null}
                                </div>
                                <Button asChild className="shrink-0" size="sm" variant="outline">
                                    <Link href={show(notification.id)} prefetch>
                                        Lihat detail
                                    </Link>
                                </Button>
                            </ResourceCard>
                        ))}
                    </div>
                )}
            </WorkspacePage>
        </>
    );
}
