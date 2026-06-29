import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export function FinalCta(): ReactNode {
    return (
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
            <div
                className="overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-12 lg:py-20"
                style={{
                    backgroundImage:
                        'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                }}
            >
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-[1.8rem] font-bold leading-tight tracking-tight text-white sm:text-[2.4rem]">
                        Mulai Kolaborasi Pertamamu Bersama Collabite
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
                        Buat campaign, temukan creator, dan kelola proses
                        pembuatan konten dalam satu platform.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="h-11 bg-white px-6 text-[var(--brand-primary-active)] hover:bg-white/90"
                        >
                            <Link href="/register?role=umkm">
                                Daftar sebagai UMKM
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-11 border-white/50 bg-transparent px-6 text-white hover:bg-white/15 hover:text-white"
                        >
                            <Link href="/register?role=creator">
                                Gabung sebagai Creator
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
