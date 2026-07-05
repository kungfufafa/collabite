import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { index, show } from '@/routes/notifications';

type NotificationPreview = {
    id: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string | null;
};

type NotificationsMenuProps = {
    variant?: 'header' | 'sidebar';
};

export function NotificationsMenu({
    variant = 'header',
}: NotificationsMenuProps): ReactNode {
    const page = usePage();
    const count =
        (page.props.unreadNotificationsCount as number | undefined) ?? 0;
    const recent =
        (page.props.recentNotifications as NotificationPreview[] | undefined) ??
        [];

    const trigger =
        variant === 'sidebar' ? (
            <SidebarMenuButton
                asChild
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                tooltip="Notifikasi"
            >
                <Link href={index()} prefetch>
                    <Bell />
                    <span>Notifikasi</span>
                </Link>
            </SidebarMenuButton>
        ) : (
            <Button
                aria-label={`Notifikasi${count > 0 ? ` (${count} belum dibaca)` : ''}`}
                className="relative size-9 shrink-0"
                size="icon"
                variant="outline"
            >
                <Bell className="size-4" strokeWidth={2.5} />
                {count > 0 ? (
                    <span className="absolute right-1.5 top-1.5 size-2.5 border-2 border-[var(--neutral-900)] bg-[var(--danger)] shadow-[1px_1px_0_0_var(--neutral-900)]" />
                ) : null}
            </Button>
        );

    if (variant === 'sidebar') {
        return trigger;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    Notifikasi
                    {count > 0 ? (
                        <span className="text-xs font-normal text-muted-foreground">
                            {count} baru
                        </span>
                    ) : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recent.length === 0 ? (
                    <DropdownMenuItem
                        className="text-sm text-muted-foreground"
                        disabled
                    >
                        Belum ada notifikasi.
                    </DropdownMenuItem>
                ) : (
                    recent.map((notification) => (
                        <DropdownMenuItem asChild key={notification.id}>
                            <Link
                                className="flex flex-col items-start gap-1"
                                href={show(notification.id)}
                                prefetch
                            >
                                <span className="font-medium">
                                    {notification.title}
                                </span>
                                <span className="line-clamp-2 text-xs text-muted-foreground">
                                    {notification.body}
                                </span>
                            </Link>
                        </DropdownMenuItem>
                    ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        className="justify-center text-sm font-medium text-[var(--brand-primary-hover)]"
                        href={index()}
                        prefetch
                    >
                        Lihat semua notifikasi
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
