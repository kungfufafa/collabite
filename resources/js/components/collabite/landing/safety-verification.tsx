import {
    BadgeCheck,
    ClipboardList,
    History,
    Star,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { SectionHeading } from '@/components/collabite/section-heading';

const MECHANISMS = [
    {
        icon: BadgeCheck,
        title: 'Verifikasi Creator',
        desc: 'Creator dapat mengajukan verifikasi profil sehingga UMKM lebih yakin sebelum memulai kolaborasi.',
    },
    {
        icon: ClipboardList,
        title: 'Brief dan Kesepakatan Terstruktur',
        desc: 'Setiap campaign memiliki brief, deadline, dan kebutuhan konten yang jelas, sehingga ekspektasi kedua pihak tercatat.',
    },
    {
        icon: Star,
        title: 'Rating dari Kolaborasi Nyata',
        desc: 'Rating dan ulasan hanya berasal dari kolaborasi yang benar-benar selesai di platform, bukan penilaian acak.',
    },
    {
        icon: History,
        title: 'Riwayat Aktivitas',
        desc: 'Progres, pengajuan, revisi, dan persetujuan tercatat dalam riwayat campaign yang dapat ditinjau kembali.',
    },
];

export function SafetyVerification(): ReactNode {
    return (
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
            <SectionHeading
                eyebrow="Keamanan & Verifikasi"
                title="Kolaborasi yang Lebih Tepercaya untuk Kedua Pihak"
                description="Collabite membangun kepercayaan melalui proses yang transparan, bukan sekadar klaim."
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
                {MECHANISMS.map(({ icon: Icon, title, desc }) => (
                    <div
                        key={title}
                        className="flex gap-4 rounded-xl border border-border bg-card p-6"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)]">
                            <Icon className="size-5" />
                        </span>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">
                                {title}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                {desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
                Collabite masih dalam tahap awal MVP. Fitur keamanan akan
                terus dikembangkan seiring pertumbuhan platform.
            </p>
        </section>
    );
}
