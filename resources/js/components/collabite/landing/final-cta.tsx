import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

import {
    brutalBtnSecondary,
    brutalBtnWhite,
} from '@/components/collabite/landing/brutal-styles';

export function FinalCta(): ReactNode {
    return (
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
            <div className="overflow-hidden border-[3px] border-[var(--neutral-900)] bg-[var(--brand-primary)] px-6 py-14 shadow-[6px_6px_0_0_var(--neutral-900)] sm:px-12 lg:py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="brutal-heading-display text-[1.8rem] text-white sm:text-[2.4rem]">
                        Siap Kolaborasi Bareng Collabite?
                    </h2>
                    <p className="mt-4 text-base font-medium leading-relaxed text-white/90 sm:text-lg">
                        Buat campaign, temukan creator, dan kelola proses
                        pembuatan konten dalam satu platform.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register?role=umkm"
                            className={brutalBtnWhite}
                        >
                            Daftar sebagai UMKM
                            <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            href="/register?role=creator"
                            className={brutalBtnSecondary}
                        >
                            Gabung sebagai Creator
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
