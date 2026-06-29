'use client';

import { Link, usePage } from '@inertiajs/react';
import { HelpCircleIcon, PlusIcon, SearchIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppNavGroup } from '@/components/app/nav-group';
import { LogoIcon } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    getNavigationGroupsForRole,
    type MarketplaceRole,
    type PrimaryAction,
} from '@/config/navigation';
import { home } from '@/routes';
import { toUrl } from '@/lib/utils';

type MarketplaceSidebarProps = {
    role: MarketplaceRole;
    primaryAction?: PrimaryAction;
    showSearch?: boolean;
};

const footerNavLinks = [
    {
        title: 'Bantuan',
        path: '/',
        icon: <HelpCircleIcon />,
    },
] as const;

export function MarketplaceSidebar({
    role,
    primaryAction,
    showSearch = false,
}: MarketplaceSidebarProps): ReactNode {
    const page = usePage();
    const navGroups = getNavigationGroupsForRole(role);
    const sidebarTestId =
        role === 'admin' ? 'admin-sidebar' : 'app-shell-sidebar';
    const currentPath = new URL(
        page.url,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    ).pathname;
    const PrimaryIcon = primaryAction?.icon ?? PlusIcon;

    return (
        <Sidebar collapsible="icon" data-testid={sidebarTestId} variant="floating">
            <SidebarHeader className="h-14 justify-center">
                <SidebarMenuButton asChild>
                    <Link href={home()} prefetch>
                        <LogoIcon />
                        <span className="font-medium">Collabite</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarContent>
                {primaryAction ? (
                    <SidebarGroup>
                        <SidebarMenuItem className="flex items-center gap-2">
                            <SidebarMenuButton
                                asChild
                                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                                tooltip={primaryAction.label}
                            >
                                <Link
                                    data-testid="app-shell-primary-action"
                                    href={toUrl(primaryAction.href)}
                                    prefetch
                                >
                                    <PrimaryIcon />
                                    <span>{primaryAction.label}</span>
                                </Link>
                            </SidebarMenuButton>
                            {showSearch ? (
                                <Button
                                    aria-label="Cari"
                                    className="size-8 group-data-[collapsible=icon]:opacity-0"
                                    data-testid="app-shell-sidebar-search"
                                    size="icon"
                                    variant="outline"
                                >
                                    <SearchIcon />
                                    <span className="sr-only">Cari</span>
                                </Button>
                            ) : null}
                        </SidebarMenuItem>
                    </SidebarGroup>
                ) : null}

                {navGroups.map((group, index) => (
                    <AppNavGroup
                        key={group.heading ?? `nav-group-${index}`}
                        label={group.heading}
                        items={group.items}
                    />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu className="mt-2">
                    {footerNavLinks.map((item) => {
                        const isActive = currentPath.startsWith(item.path);

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className="text-muted-foreground"
                                    isActive={isActive}
                                    size="sm"
                                >
                                    <Link href={item.path} prefetch>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
