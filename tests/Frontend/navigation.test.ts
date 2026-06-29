import { describe, expect, it } from 'vitest';

import {
    adminNavigation,
    getNavigationForRole,
    getNavigationGroupsForRole,
    isNavigationItemActive,
    umkmPrimaryAction,
} from '@/config/navigation';

describe('Navigation configuration', () => {
    it('exposes only UMKM destinations for the umkm role', () => {
        const labels = getNavigationForRole('umkm').map((item) => item.label);
        expect(labels).toEqual([
            'Dashboard',
            'Campaign',
            'Cari Creator',
            'Kolaborasi',
            'Profil Bisnis',
            'Pengaturan',
        ]);

        getNavigationForRole('umkm').forEach((item) => {
            const href = typeof item.href === 'string' ? item.href : item.href.url;
            expect(
                href.startsWith('/umkm') || href.startsWith('/settings'),
            ).toBe(true);
        });
    });

    it('exposes only Creator destinations for the creator role', () => {
        const labels = getNavigationForRole('creator').map((item) => item.label);
        expect(labels).toEqual([
            'Dashboard',
            'Cari Campaign',
            'Kolaborasi',
            'Portofolio',
            'Profil & Verifikasi',
            'Pengaturan',
        ]);

        getNavigationForRole('creator').forEach((item) => {
            const href = typeof item.href === 'string' ? item.href : item.href.url;
            expect(
                href.startsWith('/creator') || href.startsWith('/settings'),
            ).toBe(true);
        });
    });

    it('exposes only Admin destinations for the admin role', () => {
        const labels = adminNavigation.map((item) => item.label);

        expect(labels).toEqual([
            'Dashboard',
            'Pengguna',
            'Verifikasi Creator',
            'Campaign',
            'Kolaborasi',
            'Konten',
            'Review',
            'Audit Log',
            'Laporan',
        ]);

        adminNavigation.forEach((item) => {
            const href = typeof item.href === 'string' ? item.href : item.href.url;
            expect(href.startsWith('/admin')).toBe(true);
        });
    });

    it('marks the active navigation item based on the current path', () => {
        const campaigns = getNavigationForRole('umkm').find(
            (i) => i.label === 'Campaign',
        );
        expect(campaigns).toBeDefined();
        expect(isNavigationItemActive(campaigns!, '/umkm/campaigns')).toBe(true);
        expect(isNavigationItemActive(campaigns!, '/umkm/campaigns/12')).toBe(true);
        expect(isNavigationItemActive(campaigns!, '/umkm/dashboard')).toBe(false);

        const dashboard = getNavigationForRole('creator').find(
            (i) => i.label === 'Dashboard',
        );
        expect(dashboard).toBeDefined();
        expect(isNavigationItemActive(dashboard!, '/creator/dashboard')).toBe(true);
        expect(isNavigationItemActive(dashboard!, '/creator/campaigns')).toBe(false);
    });

    it('groups navigation by section for marketplace roles', () => {
        const umkmGroups = getNavigationGroupsForRole('umkm');
        expect(umkmGroups.map((g) => g.heading ?? 'main')).toEqual([
            'main',
            'Bisnis',
            'Lainnya',
        ]);
    });

    it('exposes the UMKM primary action with the expected href', () => {
        expect(umkmPrimaryAction.label).toBe('Buat Campaign');
        const href =
            typeof umkmPrimaryAction.href === 'string'
                ? umkmPrimaryAction.href
                : umkmPrimaryAction.href.url;
        expect(href).toBe('/umkm/campaigns/create');
    });
});
