'use client';

import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    ChevronsUpDown,
    LogOut,
    Settings,
    User,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { InitialsAvatar } from '@/components/app/initials-avatar';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { MarketplaceRole } from '@/config/navigation';
import { logout } from '@/routes';

const MENU_LINK_CLASS =
    'flex w-full cursor-default items-center gap-2';

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

function initialsOf(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

const ROLE_LABEL: Record<MarketplaceRole, string> = {
    umkm: 'UMKM',
    creator: 'Creator',
    admin: 'Admin',
};

type NavUserProps = {
    role: MarketplaceRole;
    variant?: 'header' | 'sidebar';
};

type UserMenuItemsProps = {
    role: MarketplaceRole;
    user: { name: string; email?: string; avatar?: string | null };
};

function UserMenuItems({ role, user }: UserMenuItemsProps): ReactNode {
    return (
        <>
            <DropdownMenuLabel className="flex items-center gap-3">
                <Avatar className="size-10">
                    {user.avatar ? (
                        <AvatarImage alt={user.name} src={user.avatar} />
                    ) : null}
                    <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                        {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {user.email ?? ROLE_LABEL[role]}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {ROLE_LABEL[role]}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className={MENU_LINK_CLASS}
                        href={profileHref(role)}
                        prefetch
                    >
                        <User />
                        Profil
                    </Link>
                </DropdownMenuItem>
                {role === 'creator' ? (
                    <DropdownMenuItem asChild>
                        <Link
                            className={MENU_LINK_CLASS}
                            href="/creator/verification"
                            prefetch
                        >
                            <BadgeCheck />
                            Verifikasi
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                    <Link
                        className={MENU_LINK_CLASS}
                        href="/settings/profile"
                        prefetch
                    >
                        <Settings />
                        Pengaturan
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild variant="destructive">
                    <Link
                        as="button"
                        className={MENU_LINK_CLASS}
                        data-testid="app-shell-logout"
                        href={logout()}
                    >
                        <LogOut />
                        Keluar
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </>
    );
}

export function NavUser({
    role,
    variant = 'header',
}: NavUserProps): ReactNode {
    const page = usePage();
    const user = page.props.auth?.user as
        | { name: string; email?: string; avatar?: string | null }
        | undefined;

    if (!user) {
        return null;
    }

    const headerMenuTestId =
        role === 'admin' ? 'admin-user-menu' : 'app-shell-user-menu';
    const sidebarMenuTestId =
        role === 'admin'
            ? 'admin-sidebar-user-menu'
            : 'app-shell-sidebar-user-menu';

    const menuContent = (
        <DropdownMenuContent
            align="end"
            className={
                variant === 'sidebar'
                    ? 'w-[var(--radix-dropdown-menu-trigger-width)] min-w-56'
                    : 'w-60'
            }
            side={variant === 'sidebar' ? 'top' : 'bottom'}
            sideOffset={4}
        >
            <UserMenuItems role={role} user={user} />
        </DropdownMenuContent>
    );

    if (variant === 'sidebar') {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                className="data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
                                data-testid={sidebarMenuTestId}
                                size="lg"
                            >
                                <InitialsAvatar
                                    className="group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:shadow-none"
                                    name={user.name}
                                    size="sm"
                                    tone={role === 'creator' ? 'brand' : 'secondary'}
                                />
                                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-medium">
                                        {user.name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {ROLE_LABEL[role]}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        {menuContent}
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="rounded-none border-2 border-[var(--neutral-900)] bg-card shadow-[2px_2px_0_0_var(--neutral-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                    data-testid={headerMenuTestId}
                    type="button"
                >
                    <Avatar className="size-9 rounded-none border-0 shadow-none">
                        {user.avatar ? (
                            <AvatarImage alt={user.name} src={user.avatar} />
                        ) : null}
                        <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            {menuContent}
        </DropdownMenu>
    );
}
