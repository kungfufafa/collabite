import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavigationItem } from '@/config/navigation';
import { isNavigationItemActive } from '@/config/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';

export type AppNavGroupProps = {
    label?: string;
    items: NavigationItem[];
};

export function AppNavGroup({ label, items }: AppNavGroupProps): ReactNode {
    const { currentUrl } = useCurrentUrl();

    return (
        <SidebarGroup>
            {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
            <SidebarMenu>
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isNavigationItemActive(item, currentUrl);

                    return (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.label }}
                            >
                                <Link
                                    href={toUrl(item.href)}
                                    prefetch
                                    data-testid={`app-shell-nav-${item.label}`}
                                >
                                    {Icon ? <Icon /> : null}
                                    <span>{item.label}</span>
                                    {item.badge ? (
                                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1.5 text-xs font-semibold text-white tabular-nums">
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
