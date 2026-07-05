import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { InitialsAvatar } from '@/components/app/initials-avatar';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { MarketplaceRole } from '@/config/navigation';
import type { Auth } from '@/types/auth';

const ROLE_LABEL: Record<MarketplaceRole, string> = {
    umkm: 'UMKM',
    creator: 'Creator',
    admin: 'Admin',
};

type SidebarIdentityProps = {
    role: MarketplaceRole;
};

export function SidebarIdentity({ role }: SidebarIdentityProps): ReactNode {
    const page = usePage<{ auth: Auth }>();
    const user = page.props.auth.user;

    if (!user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    className="pointer-events-none"
                    size="lg"
                    tooltip={`${user.name} · ${ROLE_LABEL[role]}`}
                >
                    <InitialsAvatar
                        className="group-data-[collapsible=icon]:size-8"
                        name={user.name}
                        size="sm"
                        tone={role === 'creator' ? 'brand' : 'secondary'}
                    />
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-medium">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {ROLE_LABEL[role]}
                        </span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
