import { describe, expect, it } from 'vitest';

import {
    adminNavigation,
    getNavigationForRole,
    getNavigationGroupsForRole,
    isNavigationItemActive,
    umkmPrimaryAction,
} from '@/config/navigation';
import { PUBLIC_NAV_LINKS } from '@/config/public-navigation';

describe('Navigation configuration', () => {
    it('exposes only UMKM destinations for the umkm role', () => {
        const labels = getNavigationForRole('umkm').map((item) => item.label);
        expect(labels).toEqual([
            'Dashboard',
            'Campaign',
            'Cari Creator',
            'Kolaborasi',
            'Profil Bisnis',
            'Produk',
            'Ulasan',
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
            'Permintaan',
            'Profil Creator',
            'Portofolio',
            'Keahlian',
            'Verifikasi',
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

        const review = adminNavigation.find((item) => item.label === 'Review');
        const auditLog = adminNavigation.find((item) => item.label === 'Audit Log');
        const dashboard = adminNavigation.find((item) => item.label === 'Dashboard');
        const laporan = adminNavigation.find((item) => item.label === 'Laporan');
        expect(review?.icon).toBeDefined();
        expect(auditLog?.icon).toBeDefined();
        expect(review?.icon).not.toBe(auditLog?.icon);
        expect(dashboard?.icon).toBeDefined();
        expect(laporan?.icon).toBeDefined();
        expect(dashboard?.icon).not.toBe(laporan?.icon);
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

    it('keeps the public navbar concise with paired actor sections', () => {
        expect(PUBLIC_NAV_LINKS.map((link) => link.label)).toEqual([
            'Cara Kerja',
            'UMKM',
            'Creator',
            'Fitur',
            'FAQ',
        ]);

        expect(PUBLIC_NAV_LINKS[1]?.href).toBe('/#umkm');
        expect(PUBLIC_NAV_LINKS[2]?.href).toBe('/#creator');
    });

    it('orders public nav anchors top-to-bottom on the landing page', () => {
        const anchors = PUBLIC_NAV_LINKS.map((link) => link.href.replace('/#', ''));

        expect(anchors).toEqual([
            'cara-kerja',
            'umkm',
            'creator',
            'fitur',
            'faq',
        ]);
    });
});
