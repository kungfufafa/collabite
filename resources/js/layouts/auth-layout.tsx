import type { ReactNode } from 'react';

import { Auth5Layout } from '@/components/auth/auth-5-layout';

const AUTH_PANELS = {
    login: {
        title: 'Masuk atau Daftar',
        description: 'Masuk ke akun Collabite atau buat akun baru.',
        quote:
            'Collabite membantu UMKM kami menemukan creator yang tepat lebih cepat dari sebelumnya.',
        quoteAuthor: 'Sari, Pemilik Kopi Lokal',
    },
    register: {
        title: 'Gabung Collabite',
        description: 'Daftar gratis dan mulai kolaborasi konten hari ini.',
        quote:
            'Sejak pakai Collabite, proses review konten dan komunikasi dengan UMKM jadi jauh lebih rapi.',
        quoteAuthor: 'Nadia, Content Creator',
    },
    recovery: {
        title: 'Pulihkan Akses Akun',
        description: 'Atur ulang kata sandi atau verifikasi email Anda.',
        quote:
            'Platform yang aman dan mudah dipakai untuk kolaborasi UMKM dan creator.',
        quoteAuthor: 'Tim Collabite',
    },
    default: {
        title: 'Selamat datang di Collabite',
        description: 'Platform kolaborasi UMKM dan content creator.',
        quote:
            'Collabite menghubungkan UMKM dengan creator untuk campaign yang lebih efektif.',
        quoteAuthor: 'Collabite',
    },
} as const;

export default function AuthLayout({
    children,
    variant = 'default',
}: {
    children: ReactNode;
    title?: string;
    description?: string;
    variant?: keyof typeof AUTH_PANELS;
}): ReactNode {
    const panel = AUTH_PANELS[variant] ?? AUTH_PANELS.default;

    return (
        <Auth5Layout
            title={panel.title}
            description={panel.description}
            quote={panel.quote}
            quoteAuthor={panel.quoteAuthor}
        >
            {children}
        </Auth5Layout>
    );
}
