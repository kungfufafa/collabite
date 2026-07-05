export type PublicNavLink = {
    label: string;
    href: string;
};

/**
 * Navbar publik — maks. 5 item agar tidak penuh di desktop.
 * Urutan anchor harus sama dengan urutan section di Welcome.tsx (atas → bawah).
 */
export const PUBLIC_NAV_LINKS: PublicNavLink[] = [
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'UMKM', href: '/#umkm' },
    { label: 'Creator', href: '/#creator' },
    { label: 'Fitur', href: '/#fitur' },
    { label: 'FAQ', href: '/#faq' },
];

export const PUBLIC_FOOTER_PRODUCT_LINKS: PublicNavLink[] = [
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'UMKM', href: '/#umkm' },
    { label: 'Creator', href: '/#creator' },
    { label: 'Fitur', href: '/#fitur' },
];

export const PUBLIC_FOOTER_EXPLORE_LINKS: PublicNavLink[] = [
    { label: 'Direktori Creator', href: '/creators' },
    { label: 'Cari Campaign', href: '/register?role=creator' },
    { label: 'Daftar UMKM', href: '/register?role=umkm' },
];

export const PUBLIC_FOOTER_LEGAL_LINKS: PublicNavLink[] = [
    { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
    { label: 'Syarat dan Ketentuan', href: '/syarat-dan-ketentuan' },
];
