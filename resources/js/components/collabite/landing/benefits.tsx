import { Link } from '@inertiajs/react';
import { Check, Megaphone, Store } from 'lucide-react';
import type { ReactNode } from 'react';

import {
    brutalBtnPrimary,
    brutalBtnSecondary,
    brutalCard,
} from '@/components/collabite/landing/brutal-styles';

const UMKM = [
    'Pilih creator berdasarkan data dan portofolio',
    'Brief dan deadline lebih terstruktur',
    'Progres campaign selalu terlihat',
    'Konten dapat direvisi sebelum disetujui',
];

const CREATOR = [
    'Temukan campaign yang sesuai kategori',
    'Tampilkan kemampuan melalui portofolio',
    'Kelola pekerjaan dan revisi',
    'Bangun reputasi melalui rating dan review',
];

export function Benefits(): ReactNode {
    return (
        <section
            id="creator"
            className="scroll-mt-20 border-y-[3px] border-[var(--neutral-900)] bg-[var(--neutral-100)] py-16 lg:py-24"
        >
            <div className="mx-auto grid max-w-[1200px] gap-6 px-5 sm:px-8 lg:grid-cols-2">
                <div
                    className={`${brutalCard} bg-[var(--brand-secondary-soft)] p-7 lg:p-9`}
                >
                    <span className="flex size-12 items-center justify-center border-[3px] border-[var(--neutral-900)] bg-[var(--brand-secondary)] text-white shadow-[4px_4px_0_0_var(--neutral-900)]">
                        <Megaphone className="size-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-black uppercase text-foreground">
                        Lebih Banyak Peluang untuk Creator
                    </h3>
                    <ul className="mt-5 space-y-3">
                        {CREATOR.map((item) => (
                            <li key={item} className="flex items-start gap-2.5">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border-2 border-[var(--neutral-900)] bg-white text-[var(--brand-secondary)]">
                                    <Check className="size-3" />
                                </span>
                                <span className="text-sm font-bold text-foreground">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/register?role=creator"
                        className={`${brutalBtnSecondary} mt-7 w-full sm:w-auto`}
                    >
                        Gabung sebagai Creator
                    </Link>
                </div>

                <div
                    className={`${brutalCard} bg-[var(--brand-primary-soft)] p-7 lg:p-9`}
                >
                    <span className="flex size-12 items-center justify-center border-[3px] border-[var(--neutral-900)] bg-[var(--brand-primary)] text-white shadow-[4px_4px_0_0_var(--neutral-900)]">
                        <Store className="size-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-black uppercase text-foreground">
                        Promosi Lebih Mudah untuk UMKM
                    </h3>
                    <ul className="mt-5 space-y-3">
                        {UMKM.map((item) => (
                            <li key={item} className="flex items-start gap-2.5">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border-2 border-[var(--neutral-900)] bg-white text-[var(--brand-primary)]">
                                    <Check className="size-3" />
                                </span>
                                <span className="text-sm font-bold text-foreground">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/register?role=umkm"
                        className={`${brutalBtnPrimary} mt-7 w-full sm:w-auto`}
                    >
                        Mulai sebagai UMKM
                    </Link>
                </div>
            </div>
        </section>
    );
}
