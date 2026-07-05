import { FolderX, History, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

import {
    brutalCard,
    brutalIconBoxMuted,
} from '@/components/collabite/landing/brutal-styles';
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
            <SectionHeading
                brutal
                title="Kolaborasi Konten Seharusnya Tidak Serumit Ini"
            />

            <div className="mt-12 grid gap-5 md:grid-cols-3">
                {PROBLEMS.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className={`${brutalCard} p-6`}>
                        <span className={brutalIconBoxMuted}>
                            <Icon className="size-5" />
                        </span>
                        <h3 className="mt-4 text-base font-black text-foreground">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                            {desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
