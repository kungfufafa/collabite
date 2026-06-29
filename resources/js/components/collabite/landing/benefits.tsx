import { Link } from '@inertiajs/react';
import { Check, Megaphone, Store } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

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
        <section className="border-y border-border bg-card py-16 lg:py-24">
            <div className="mx-auto grid max-w-[1200px] gap-6 px-5 sm:px-8 lg:grid-cols-2">
                <div
                    id="umkm"
                    className="scroll-mt-20 rounded-xl border border-border bg-[var(--brand-primary-soft)] p-7 lg:p-9"
                >
                    <span className="flex size-12 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white">
                        <Store className="size-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-bold text-foreground">
                        Promosi Lebih Mudah untuk UMKM
                    </h3>
                    <ul className="mt-5 space-y-3">
                        {UMKM.map((item) => (
                            <li key={item} className="flex items-start gap-2.5">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-muted)] text-[var(--brand-primary)]">
                                    <Check className="size-3" />
                                </span>
                                <span className="text-sm text-foreground">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <Button asChild className="mt-7 w-full sm:w-auto">
                        <Link href="/register?role=umkm">
                            Mulai sebagai UMKM
                        </Link>
                    </Button>
                </div>

                <div
                    id="creator"
                    className="scroll-mt-20 rounded-xl border border-border bg-[var(--brand-secondary-soft)] p-7 lg:p-9"
                >
                    <span className="flex size-12 items-center justify-center rounded-lg bg-[var(--brand-secondary)] text-white">
                        <Megaphone className="size-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-bold text-foreground">
                        Lebih Banyak Peluang untuk Creator
                    </h3>
                    <ul className="mt-5 space-y-3">
                        {CREATOR.map((item) => (
                            <li key={item} className="flex items-start gap-2.5">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-secondary-muted)] text-[var(--brand-secondary)]">
                                    <Check className="size-3" />
                                </span>
                                <span className="text-sm text-foreground">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <Button
                        asChild
                        className="mt-7 w-full bg-[var(--brand-secondary)] text-white hover:bg-[var(--brand-secondary-hover)] sm:w-auto"
                    >
                        <Link href="/register?role=creator">
                            Gabung sebagai Creator
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
