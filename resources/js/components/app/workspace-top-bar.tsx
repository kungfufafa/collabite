'use client';

import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    ChevronDown,
    LogOut,
    Search,
    Settings,
    User,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { InitialsAvatar } from '@/components/app/initials-avatar';
import { NotificationsMenu } from '@/components/app/notifications-menu';
import { WorkspaceMobileNav } from '@/components/app/workspace-sidebar';
import { AppBreadcrumbs } from '@/components/app-breadcrumbs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    getNavigationForRole,
    isNavigationItemActive,
    type MarketplaceRole,
} from '@/config/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';
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

type WorkspaceTopBarProps = {
    role: MarketplaceRole;
    showSearch?: boolean;
    headerSlot?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export function WorkspaceTopBar({
    role,
    showSearch = false,
    headerSlot,
    breadcrumbs = [],
}: WorkspaceTopBarProps): ReactNode {
    const page = usePage();
    const { currentUrl } = useCurrentUrl();
    const user = page.props.auth?.user as
        | { name: string; email?: string; avatar?: string | null }
        | undefined;

    const activeNavItem = getNavigationForRole(role).find((item) =>
        isNavigationItemActive(item, currentUrl),
    );

    const breadcrumbPage =
        breadcrumbs.length > 0
            ? null
            : activeNavItem
              ? { title: activeNavItem.label }
              : null;

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-5 backdrop-blur-md sm:px-8">
            <div className="lg:hidden">
                <WorkspaceMobileNav role={role} />
            </div>

            {breadcrumbs.length > 0 ? (
                <div className="hidden min-w-0 flex-1 md:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            ) : breadcrumbPage ? (
                <div className="hidden min-w-0 flex-1 md:block">
                    <AppBreadcrumbs page={breadcrumbPage} />
                </div>
            ) : (
                <div className="hidden flex-1 md:block" />
            )}

            {showSearch ? (
                <div className="hidden max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 md:flex">
                    <Search className="size-4 text-muted-foreground" />
                    <input
                        aria-label="Cari"
                        className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                        data-testid="app-shell-search"
                        placeholder={SEARCH_PLACEHOLDER[role]}
                    />
                </div>
            ) : null}

            <div className="ml-auto flex items-center gap-1.5">
                {headerSlot}
                <NotificationsMenu />
                {user ? (
                    <IdentityMenu role={role} user={user} />
                ) : null}
            </div>
        </header>
    );
}

function IdentityMenu({
    role,
    user,
}: {
    role: MarketplaceRole;
    user: { name: string; email?: string; avatar?: string | null };
}): ReactNode {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    data-testid={
                        role === 'admin'
                            ? 'admin-user-menu'
                            : 'app-shell-user-menu'
                    }
                    type="button"
                >
                    <InitialsAvatar
                        name={user.name}
                        size="sm"
                        tone={role === 'creator' ? 'brand' : 'secondary'}
                    />
                    <span className="hidden text-left sm:block">
                        <span className="block max-w-[10rem] truncate text-sm font-medium leading-tight text-foreground">
                            {user.name}
                        </span>
                        <span className="block text-xs leading-tight text-muted-foreground">
                            {ROLE_LABEL[role]}
                        </span>
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                        {user.email ?? ROLE_LABEL[role]}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={profileHref(role)}>
                        <User className="size-4" />
                        Profil
                    </Link>
                </DropdownMenuItem>
                {role === 'creator' ? (
                    <DropdownMenuItem asChild>
                        <Link href="/creator/verification">
                            <BadgeCheck className="size-4" />
                            Verifikasi
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                        <Settings className="size-4" />
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
                        <LogOut className="size-4" />
                        Keluar
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
