import type { ReactNode } from 'react';

import type { NavGroup, NavigationItem } from '@/config/navigation';
import {
    getNavigationGroupsForRole,
    isNavigationItemActive,
    type MarketplaceRole,
} from '@/config/navigation';
import { toUrl } from '@/lib/utils';

import type { SidebarNavGroup, SidebarNavItem } from '@/components/app-shared';

export function buildSidebarNavGroups(
    role: MarketplaceRole,
    currentPath: string,
): SidebarNavGroup[] {
    return getNavigationGroupsForRole(role).map((group) =>
        toSidebarNavGroup(group, currentPath),
    );
}

function toSidebarNavGroup(group: NavGroup, currentPath: string): SidebarNavGroup {
    return {
        label: group.heading ?? '',
        items: group.items.map((item) => toSidebarNavItem(item, currentPath)),
    };
}

function toSidebarNavItem(
    item: NavigationItem,
    currentPath: string,
): SidebarNavItem {
    const Icon = item.icon;

    return {
        title: item.label,
        path: toUrl(item.href),
        icon: Icon ? <Icon /> : undefined,
        isActive: isNavigationItemActive(item, currentPath),
    };
}

export function flattenSidebarNavLinks(groups: SidebarNavGroup[]): SidebarNavItem[] {
    return groups.flatMap((group) => group.items);
}
