import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { InitialsAvatar } from '@/components/app/initials-avatar';
import type { MarketplaceRole } from '@/config/navigation';

const ROLE_LABEL: Record<MarketplaceRole, string> = {
    umkm: 'UMKM',
    creator: 'Creator',
    admin: 'Admin',
};

type SidebarIdentityProps = {
    role: MarketplaceRole;
};

export function SidebarIdentity({ role }: SidebarIdentityProps): ReactNode {
    const page = usePage();
    const user = page.props.auth?.user as
        | { name: string; email?: string }
        | undefined;

    if (!user) {
        return null;
    }

    return (
        <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
                <InitialsAvatar
                    name={user.name}
                    size="md"
                    tone={role === 'creator' ? 'brand' : 'secondary'}
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                        {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {ROLE_LABEL[role]}
                    </p>
                </div>
            </div>
        </div>
    );
}
