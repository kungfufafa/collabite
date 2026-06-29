import { Link } from '@inertiajs/react';
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

type NotificationsMenuProps = {
    count?: number;
};

export function NotificationsMenu({
    count = 0,
}: NotificationsMenuProps): ReactNode {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    aria-label={`Notifikasi${count > 0 ? ` (${count} belum dibaca)` : ''}`}
                    className="relative"
                    size="icon"
                    variant="ghost"
                >
                    <Bell className="size-5" />
                    {count > 0 ? (
                        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--danger)] ring-2 ring-background" />
                    ) : null}
                </Button>
            </DropdownMenuTrigger>
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
                {count === 0 ? (
                    <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                        Belum ada notifikasi baru.
                    </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        className="justify-center text-sm font-medium text-[var(--brand-primary-hover)]"
                        href="/settings/profile"
                    >
                        Lihat semua notifikasi
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
