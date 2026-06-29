import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Bell,
    Briefcase,
    Building2,
    Compass,
    Home,
    Images,
    Inbox,
    LayoutGrid,
    PlusCircle,
    Search,
    Settings,
    ShieldCheck,
    Users,
} from 'lucide-react';

import { dashboard as adminDashboard } from '@/routes/admin';
import { dashboard as creatorDashboard } from '@/routes/creator';
import { index as creatorCampaignsIndex } from '@/routes/creator/campaigns';
import { index as creatorCollaborationsIndex } from '@/routes/creator/collaborations';
import { index as creatorPortfolioIndex } from '@/routes/creator/portfolio';
import { show as creatorVerificationShow } from '@/routes/creator/verification';
import { dashboard as umkmDashboard } from '@/routes/umkm';
import { index as umkmCampaignsIndex } from '@/routes/umkm/campaigns';
import { index as umkmCollaborationsIndex } from '@/routes/umkm/collaborations';
import { index as umkmDiscoverIndex } from '@/routes/umkm/discover';

export type MarketplaceRole = 'umkm' | 'creator' | 'admin';

export type NavigationItem = {
    label: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    badge?: number;
    /** Returns true if this item should be marked as active for the given current path. */
    isActive?: (currentPath: string) => boolean;
};

export type NavGroup = {
    heading?: string;
    items: NavigationItem[];
};

export type PrimaryAction = {
    label: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    /** Optional: whether to show a small badge (e.g. for verification status). */
    badgeLabel?: string;
};

export type MobileNavItem = NavigationItem;

const pathStartsWith = (currentPath: string, prefix: string): boolean => {
    if (currentPath === prefix) {
        return true;
    }

    return currentPath.startsWith(`${prefix}/`);
};

const buildPath = (
    value: NonNullable<InertiaLinkProps['href']>,
): string => {
    if (typeof value === 'string') {
        return value;
    }

    if (value && typeof value === 'object' && 'url' in value) {
        return value.url;
    }

    return '';
};

export const umkmNavigation: NavigationItem[] = [
    {
        label: 'Beranda',
        href: umkmDashboard(),
        icon: Home,
        isActive: (path) => path === buildPath(umkmDashboard()),
    },
    {
        label: 'Campaign Saya',
        href: umkmCampaignsIndex(),
        icon: Briefcase,
        isActive: (path) => pathStartsWith(path, buildPath(umkmCampaignsIndex())),
    },
    {
        label: 'Cari Creator',
        href: umkmDiscoverIndex(),
        icon: Search,
        isActive: (path) => pathStartsWith(path, buildPath(umkmDiscoverIndex())),
    },
    {
        label: 'Kolaborasi',
        href: umkmCollaborationsIndex(),
        icon: Users,
        isActive: (path) => pathStartsWith(path, buildPath(umkmCollaborationsIndex())),
    },
    {
        label: 'Undangan',
        href: '/umkm/collaborations',
        icon: Inbox,
        isActive: (path) => pathStartsWith(path, '/umkm/collaborations'),
    },
];

export const creatorNavigation: NavigationItem[] = [
    {
        label: 'Beranda',
        href: creatorDashboard(),
        icon: Home,
        isActive: (path) => path === buildPath(creatorDashboard()),
    },
    {
        label: 'Cari Campaign',
        href: creatorCampaignsIndex(),
        icon: Compass,
        isActive: (path) => pathStartsWith(path, buildPath(creatorCampaignsIndex())),
    },
    {
        label: 'Kolaborasi',
        href: creatorCollaborationsIndex(),
        icon: Users,
        isActive: (path) => pathStartsWith(path, buildPath(creatorCollaborationsIndex())),
    },
    {
        label: 'Portofolio',
        href: creatorPortfolioIndex(),
        icon: Briefcase,
        isActive: (path) => pathStartsWith(path, buildPath(creatorPortfolioIndex())),
    },
    {
        label: 'Verifikasi',
        href: creatorVerificationShow(),
        icon: ShieldCheck,
        isActive: (path) => pathStartsWith(path, buildPath(creatorVerificationShow())),
    },
];

export const adminNavigation: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: adminDashboard(),
        icon: LayoutGrid,
        isActive: (path) => path === buildPath(adminDashboard()),
    },
    {
        label: 'Pengguna',
        href: '/admin/users',
        icon: Users,
        isActive: (path) => pathStartsWith(path, '/admin/users'),
    },
    {
        label: 'Verifikasi Creator',
        href: '/admin/verifications',
        icon: ShieldCheck,
        isActive: (path) => pathStartsWith(path, '/admin/verifications'),
    },
    {
        label: 'Campaign',
        href: '/admin/moderation/campaigns',
        icon: Briefcase,
        isActive: (path) => pathStartsWith(path, '/admin/moderation/campaigns'),
    },
    {
        label: 'Kolaborasi',
        href: '/admin/collaborations',
        icon: Users,
        isActive: (path) => pathStartsWith(path, '/admin/collaborations'),
    },
    {
        label: 'Konten',
        href: '/admin/moderation/content',
        icon: Briefcase,
        isActive: (path) => pathStartsWith(path, '/admin/moderation/content'),
    },
    {
        label: 'Review',
        href: '/admin/moderation/reviews',
        icon: Inbox,
        isActive: (path) => pathStartsWith(path, '/admin/moderation/reviews'),
    },
    {
        label: 'Audit Log',
        href: '/admin/audit-logs',
        icon: Inbox,
        isActive: (path) => pathStartsWith(path, '/admin/audit-logs'),
    },
    {
        label: 'Laporan',
        href: '/admin/reports',
        icon: LayoutGrid,
        isActive: (path) => pathStartsWith(path, '/admin/reports'),
    },
];

export const umkmPrimaryAction: PrimaryAction = {
    label: 'Buat Campaign',
    href: '/umkm/campaigns/create',
    icon: PlusCircle,
};

export const creatorPrimaryActions: PrimaryAction[] = [
    {
        label: 'Status Verifikasi',
        href: creatorVerificationShow(),
        icon: ShieldCheck,
    },
    {
        label: 'Cari Campaign',
        href: creatorCampaignsIndex(),
        icon: Compass,
    },
];

export const adminPrimaryAction: PrimaryAction = {
    label: 'Notifikasi',
    href: '/admin/dashboard',
    icon: Bell,
};

export const umkmMobileHighlights: MobileNavItem[] = [
    {
        label: 'Beranda',
        href: umkmDashboard(),
        icon: Home,
    },
    {
        label: 'Campaign',
        href: umkmCampaignsIndex(),
        icon: Briefcase,
    },
    {
        label: 'Cari Creator',
        href: umkmDiscoverIndex(),
        icon: Search,
    },
    {
        label: 'Kolaborasi',
        href: umkmCollaborationsIndex(),
        icon: Users,
    },
];

export const creatorMobileHighlights: MobileNavItem[] = [
    {
        label: 'Beranda',
        href: creatorDashboard(),
        icon: Home,
    },
    {
        label: 'Cari Campaign',
        href: creatorCampaignsIndex(),
        icon: Compass,
    },
    {
        label: 'Kolaborasi',
        href: creatorCollaborationsIndex(),
        icon: Users,
    },
    {
        label: 'Portofolio',
        href: creatorPortfolioIndex(),
        icon: Briefcase,
    },
];

export function getNavigationGroupsForRole(role: MarketplaceRole): NavGroup[] {
    switch (role) {
        case 'umkm':
            return [
                {
                    items: [
                        {
                            label: 'Dashboard',
                            href: umkmDashboard(),
                            icon: Home,
                            isActive: (path) => path === buildPath(umkmDashboard()),
                        },
                        {
                            label: 'Campaign',
                            href: umkmCampaignsIndex(),
                            icon: Briefcase,
                            isActive: (path) =>
                                pathStartsWith(path, buildPath(umkmCampaignsIndex())),
                        },
                        {
                            label: 'Cari Creator',
                            href: umkmDiscoverIndex(),
                            icon: Search,
                            isActive: (path) =>
                                pathStartsWith(path, buildPath(umkmDiscoverIndex())),
                        },
                        {
                            label: 'Kolaborasi',
                            href: umkmCollaborationsIndex(),
                            icon: Users,
                            isActive: (path) =>
                                pathStartsWith(path, buildPath(umkmCollaborationsIndex())),
                        },
                    ],
                },
                {
                    heading: 'Bisnis',
                    items: [
                        {
                            label: 'Profil Bisnis',
                            href: '/umkm/profile',
                            icon: Building2,
                            isActive: (path) => pathStartsWith(path, '/umkm/profile'),
                        },
                    ],
                },
                {
                    heading: 'Lainnya',
                    items: [
                        {
                            label: 'Pengaturan',
                            href: '/settings/profile',
                            icon: Settings,
                            isActive: (path) => pathStartsWith(path, '/settings'),
                        },
                    ],
                },
            ];
        case 'creator':
            return [
                {
                    items: [
                        {
                            label: 'Dashboard',
                            href: creatorDashboard(),
                            icon: Home,
                            isActive: (path) => path === buildPath(creatorDashboard()),
                        },
                        {
                            label: 'Cari Campaign',
                            href: creatorCampaignsIndex(),
                            icon: Compass,
                            isActive: (path) =>
                                pathStartsWith(path, buildPath(creatorCampaignsIndex())),
                        },
                        {
                            label: 'Kolaborasi',
                            href: creatorCollaborationsIndex(),
                            icon: Users,
                            isActive: (path) =>
                                pathStartsWith(path, buildPath(creatorCollaborationsIndex())),
                        },
                    ],
                },
                {
                    heading: 'Profil',
                    items: [
                        {
                            label: 'Portofolio',
                            href: creatorPortfolioIndex(),
                            icon: Images,
                            isActive: (path) =>
                                pathStartsWith(path, buildPath(creatorPortfolioIndex())),
                        },
                        {
                            label: 'Profil & Verifikasi',
                            href: creatorVerificationShow(),
                            icon: ShieldCheck,
                            isActive: (path) =>
                                pathStartsWith(path, buildPath(creatorVerificationShow())) ||
                                pathStartsWith(path, '/creator/profile'),
                        },
                    ],
                },
                {
                    heading: 'Lainnya',
                    items: [
                        {
                            label: 'Pengaturan',
                            href: '/settings/profile',
                            icon: Settings,
                            isActive: (path) => pathStartsWith(path, '/settings'),
                        },
                    ],
                },
            ];
        case 'admin':
            return [{ items: adminNavigation }];
    }
}

export function getNavigationForRole(role: MarketplaceRole): NavigationItem[] {
    return getNavigationGroupsForRole(role).flatMap((group) => group.items);
}

export function isNavigationItemActive(
    item: NavigationItem,
    currentPath: string,
): boolean {
    if (item.isActive) {
        return item.isActive(currentPath);
    }

    return currentPath === buildPath(item.href);
}
