import {
    Images,
    LayoutDashboard,
    MessagesSquare,
    RefreshCw,
    Star,
    UserSearch,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { SectionHeading } from '@/components/collabite/section-heading';

const FEATURES = [
    {
        icon: LayoutDashboard,
        title: 'Campaign Management',
        desc: 'Buat dan kelola campaign lengkap dengan brief, budget, dan deadline.',
    },
    {
        icon: UserSearch,
        title: 'Creator Discovery',
        desc: 'Temukan creator yang relevan berdasarkan kategori, rating, dan lokasi.',
    },
    {
        icon: Images,
        title: 'Portofolio Creator',
        desc: 'Lihat hasil karya dan pengalaman creator sebelum mulai bekerja sama.',
    },
    {
        icon: MessagesSquare,
        title: 'Kolaborasi dan Pesan',
        desc: 'Komunikasi, file, dan catatan tersimpan rapi dalam satu workspace.',
    },
    {
        icon: RefreshCw,
        title: 'Review dan Revisi Konten',
        desc: 'Beri catatan revisi atau setujui konten langsung dari platform.',
    },
    {
        icon: Star,
        title: 'Rating dan Riwayat Kolaborasi',
        desc: 'Bangun kepercayaan lewat rating dan rekam jejak kolaborasi nyata.',
    },
];

export function FeatureGrid(): ReactNode {
    return (
        <section
            id="fitur"
            className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24"
        >
            <SectionHeading
                eyebrow="Fitur"
                title="Semua yang Dibutuhkan untuk Kolaborasi yang Lebih Terarah"
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                    <div
                        key={title}
                        className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-[var(--brand-primary-muted)]"
                    >
                        <span className="flex size-11 items-center justify-center rounded-lg bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
                            <Icon className="size-5" />
                        </span>
                        <h3 className="mt-4 text-base font-semibold text-foreground">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
