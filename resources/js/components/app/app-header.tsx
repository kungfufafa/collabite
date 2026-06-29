'use client';

import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Bell,
    LogOut,
    Search,
    Settings,
    User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { CustomSidebarTrigger } from '@/components/app/custom-sidebar-trigger';
import { AppBreadcrumbs } from '@/components/app-breadcrumbs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    getNavigationForRole,
    isNavigationItemActive,
    type MarketplaceRole,
} from '@/config/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { logout } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const ROLE_LABEL: Record<MarketplaceRole, string> = {
    umkm: 'UMKM',
    creator: 'Creator',
    admin: 'Admin',
};

const SEARCH_PLACEHOLDER: Record<MarketplaceRole, string> = {
    umkm: 'Cari creator atau campaign...',
    creator: 'Cari campaign...',
    admin: 'Cari...',
};

function profileHref(role: MarketplaceRole): string {
    switch (role) {
        case 'umkm':
            return '/umkm/profile';
        case 'creator':
            return '/creator/profile';
        default:
            return '/settings/profile';
    }
}

type NavUserProps = {
    role: MarketplaceRole;
    user: { name: string; email?: string; avatar?: string | null };
};

function NavUser({ role, user }: NavUserProps): ReactNode {
    const initials = user.name.charAt(0).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    data-testid={
                        role === 'admin'
                            ? 'admin-user-menu'
                            : 'app-shell-user-menu'
                    }
                    type="button"
                >
                    <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium">
                        {user.avatar ? (
                            <img
                                alt={user.name}
                                className="size-full object-cover"
                                src={user.avatar}
                            />
                        ) : (
                            initials
                        )}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem className="flex items-center justify-start gap-2">
                    <DropdownMenuLabel className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium">
                            {initials}
                        </span>
                        <div>
                            <span className="font-medium text-foreground">
                                {user.name}
                            </span>
                            <br />
                            <div className="max-w-full overflow-hidden text-xs text-ellipsis whitespace-nowrap text-muted-foreground">
                                {user.email ?? ROLE_LABEL[role]}
                            </div>
                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                                {ROLE_LABEL[role]}
                            </div>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={profileHref(role)}>
                        <User />
                        Profil
                    </Link>
                </DropdownMenuItem>
                {role === 'creator' ? (
                    <DropdownMenuItem asChild>
                        <Link href="/creator/verification">
                            <BadgeCheck />
                            Verifikasi
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                        <Settings />
                        Pengaturan
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        as="button"
                        className="text-[var(--danger)]"
                        data-testid="app-shell-logout"
                        href={logout()}
                    >
                        <LogOut />
                        Keluar
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

type AppHeaderProps = {
    role: MarketplaceRole;
    showSearch?: boolean;
    headerSlot?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({
    role,
    showSearch = false,
    headerSlot,
    breadcrumbs = [],
}: AppHeaderProps): ReactNode {
    const page = usePage();
    const { currentUrl } = useCurrentUrl();
    const user = page.props.auth?.user as
        | { name: string; email?: string; avatar?: string | null }
        | undefined;

    const activeNavItem = getNavigationForRole(role).find((item) =>
        isNavigationItemActive(item, currentUrl),
    );
    const ActiveIcon = activeNavItem?.icon as LucideIcon | undefined;

    const breadcrumbPage =
        breadcrumbs.length > 0
            ? null
            : activeNavItem
              ? {
                    title: activeNavItem.label,
                    icon: ActiveIcon ? <ActiveIcon /> : undefined,
                }
              : null;

    return (
        <header
            className={cn(
                'mb-6 flex items-center justify-between gap-2 border-b border-border pb-4 px-4 md:px-2',
            )}
        >
            <div className="flex min-w-0 items-center gap-3">
                <CustomSidebarTrigger />
                <Separator
                    className="mr-2 h-4 data-[orientation=vertical]:self-center"
                    orientation="vertical"
                />
                {breadcrumbs.length > 0 ? (
                    <div className="hidden min-w-0 md:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                ) : (
                    <AppBreadcrumbs page={breadcrumbPage} />
                )}
            </div>

            <div className="flex items-center gap-3">
                {showSearch ? (
                    <div className="hidden max-w-md items-center gap-2 rounded-md border border-border bg-background px-3 md:flex">
                        <Search className="size-4 text-muted-foreground" />
                        <input
                            aria-label="Cari"
                            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                            data-testid="app-shell-search"
                            placeholder={SEARCH_PLACEHOLDER[role]}
                        />
                    </div>
                ) : null}

                {headerSlot}

                <Button aria-label="Notifikasi" size="icon" variant="ghost">
                    <Bell />
                </Button>
                <Separator
                    className="h-4 data-[orientation=vertical]:self-center"
                    orientation="vertical"
                />
                {user ? <NavUser role={role} user={user} /> : null}
            </div>
        </header>
    );
}
