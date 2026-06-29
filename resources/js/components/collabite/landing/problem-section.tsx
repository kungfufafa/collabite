import { FolderX, History, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

import { SectionHeading } from '@/components/collabite/section-heading';

const PROBLEMS = [
    {
        icon: SearchX,
        title: 'Sulit Menemukan Creator yang Cocok',
        desc: 'UMKM sering kesulitan memilih creator berdasarkan kategori, portofolio, dan budget.',
    },
    {
        icon: FolderX,
        title: 'Brief dan Revisi Tercecer',
        desc: 'Percakapan, file, progres, dan catatan revisi tersebar di banyak aplikasi.',
    },
    {
        icon: History,
        title: 'Tidak Ada Riwayat Kolaborasi',
        desc: 'Sulit mengetahui reputasi dan pengalaman pihak yang akan diajak bekerja sama.',
    },
];

export function ProblemSection(): ReactNode {
    return (
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
            <SectionHeading title="Kolaborasi Konten Seharusnya Tidak Serumit Ini" />

            <div className="mt-12 grid gap-5 md:grid-cols-3">
                {PROBLEMS.map(({ icon: Icon, title, desc }) => (
                    <div
                        key={title}
                        className="rounded-xl border border-border bg-card p-6"
                    >
                        <span className="flex size-11 items-center justify-center rounded-lg bg-[var(--neutral-100)] text-[var(--neutral-600)]">
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
