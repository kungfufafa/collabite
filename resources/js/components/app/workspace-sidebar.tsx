'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';

import { SidebarIdentity } from '@/components/app/sidebar-identity';
import { WorkspaceSidebarNav } from '@/components/app/workspace-sidebar-nav';
import { Logo } from '@/components/collabite/logo';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    getNavigationGroupsForRole,
    type MarketplaceRole,
    type NavGroup,
} from '@/config/navigation';

type WorkspaceSidebarProps = {
    role: MarketplaceRole;
};

export function WorkspaceSidebar({ role }: WorkspaceSidebarProps): ReactNode {
    const groups = getNavigationGroupsForRole(role);
    const sidebarTestId =
        role === 'admin' ? 'admin-sidebar' : 'app-shell-sidebar';

    return (
        <aside
            className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-card lg:flex"
            data-slot="sidebar-wrapper"
            data-testid={sidebarTestId}
        >
            <div className="flex h-16 items-center border-b border-border px-5">
                <Logo />
            </div>
            <WorkspaceSidebarNav
                className="flex-1 overflow-y-auto p-3"
                groups={groups}
            />
            <SidebarIdentity role={role} />
        </aside>
    );
}

export function WorkspaceMobileNav({
    role,
}: {
    role: MarketplaceRole;
}): ReactNode {
    const [open, setOpen] = useState(false);
    const groups = getNavigationGroupsForRole(role);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    aria-label="Buka menu"
                    data-testid="app-shell-mobile-menu-trigger"
                    size="icon"
                    variant="outline"
                >
                    <Menu className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-[80%] max-w-xs p-0"
                data-mobile="true"
                side="left"
            >
                <SheetTitle className="sr-only">Navigasi</SheetTitle>
                <div className="flex h-16 items-center border-b border-border px-5">
                    <Logo />
                </div>
                <WorkspaceSidebarNav
                    className="p-3"
                    groups={groups}
                    onNavigate={() => setOpen(false)}
                />
                <SidebarIdentity role={role} />
            </SheetContent>
        </Sheet>
    );
}

export function useWorkspaceNavGroups(role: MarketplaceRole): NavGroup[] {
    return getNavigationGroupsForRole(role);
}
