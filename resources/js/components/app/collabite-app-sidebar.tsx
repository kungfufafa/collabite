'use client';

import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { NotificationsMenu } from '@/components/app/notifications-menu';
import { Logo } from '@/components/collabite/logo';
import { NavGroup } from '@/components/nav-group';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    creatorPrimaryActions,
    umkmPrimaryAction,
} from '@/config/navigation';
import type { MarketplaceRole } from '@/config/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { buildSidebarNavGroups } from '@/lib/sidebar-navigation';
import { toUrl } from '@/lib/utils';

type CollabiteAppSidebarProps = {
    role: MarketplaceRole;
};

function primaryActionForRole(role: MarketplaceRole): {
    label: string;
    href: string;
    icon: ReactNode;
} | null {
    if (role === 'umkm') {
        const Icon = umkmPrimaryAction.icon;

        return {
            label: umkmPrimaryAction.label,
            href: toUrl(umkmPrimaryAction.href),
            icon: Icon ? <Icon /> : null,
        };
    }

    if (role === 'creator') {
        const action = creatorPrimaryActions[0];
        const Icon = action.icon;

        return {
            label: action.label,
            href: toUrl(action.href),
            icon: Icon ? <Icon /> : null,
        };
    }

    return null;
}

export function CollabiteAppSidebar({ role }: CollabiteAppSidebarProps): ReactNode {
    const { currentUrl } = useCurrentUrl();
    const navGroups = buildSidebarNavGroups(role, currentUrl);
    const primaryAction = primaryActionForRole(role);
    const sidebarTestId =
        role === 'admin' ? 'admin-sidebar' : 'app-shell-sidebar';

    return (
        <Sidebar
            collapsible="icon"
            data-testid={sidebarTestId}
            variant="inset"
        >
            <SidebarHeader className="h-14 justify-center group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
                <SidebarMenuButton
                    asChild
                    className="group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
                    size="lg"
                >
                    <Logo className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:[&>span:first-child]:size-8 group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                {role === 'admin' ? (
                    <SidebarGroup>
                        <SidebarMenuItem>
                            <NotificationsMenu variant="sidebar" />
                        </SidebarMenuItem>
                    </SidebarGroup>
                ) : null}
                {primaryAction ? (
                    <SidebarGroup>
                        <SidebarMenuItem className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                            <SidebarMenuButton
                                asChild
                                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                                tooltip={primaryAction.label}
                            >
                                <Link href={primaryAction.href} prefetch>
                                    {primaryAction.icon}
                                    <span>{primaryAction.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarGroup>
                ) : null}
                {navGroups.map((group, index) => (
                    <NavGroup key={`sidebar-group-${group.label}-${index}`} {...group} />
                ))}
            </SidebarContent>
            <SidebarFooter className="group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
                <SidebarSeparator />
                <NavUser role={role} variant="sidebar" />
            </SidebarFooter>
        </Sidebar>
    );
}
