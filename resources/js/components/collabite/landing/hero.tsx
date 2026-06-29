import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Eye,
    RefreshCw,
    Star,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress-placeholder';

export function Hero(): ReactNode {
    return (
        <section id="top" className="border-b border-border">
            <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-24 lg:pt-20">
                <div>
                    <span className="inline-flex items-center rounded-md bg-[var(--brand-primary-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary-active)]">
                        Platform Kolaborasi UMKM &amp; Content Creator
                    </span>

                    <h1 className="mt-5 text-[2.1rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[2.9rem] lg:text-[3.25rem]">
                        Temukan Creator yang Tepat,{' '}
                        <span className="text-[var(--brand-primary)]">
                            jalankan campaign tanpa ribet.
                        </span>
                    </h1>

                    <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
                        Collabite membantu UMKM menemukan content creator,
                        mengelola campaign, memantau progres, dan menyetujui
                        konten dalam satu tempat.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild size="lg" className="h-11 px-6">
                            <Link href="/register?role=umkm">
                                Buat Campaign Gratis
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-11 border-[var(--brand-primary-muted)] px-6 text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-hover)]"
                        >
                            <Link href="/register?role=creator">
                                Daftar sebagai Creator
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="size-4 text-[var(--success)]" />
                        Gratis untuk memulai • Tanpa kartu kredit
                    </p>
                </div>

                <div>
                    <HeroMockup />
                </div>
            </div>
        </section>
    );
}

function HeroMockup(): ReactNode {
    return (
        <div className="mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-xl border border-border bg-card p-5 shadow-md">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Campaign</p>
                        <h3 className="mt-0.5 text-base font-semibold text-foreground">
                            Promosi Produk Kopi Lokal
                        </h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--warning-soft)] px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-[var(--warning-border)]">
                        <span className="size-1.5 rounded-full bg-[var(--warning)]" />
                        Sedang Berjalan
                    </span>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-[var(--neutral-50)] p-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-muted)] text-sm font-semibold text-[var(--brand-primary)]">
                        NP
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                            Nadia Putri
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            Food &amp; Lifestyle Creator
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        4,9
                    </span>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            Progres pengerjaan
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                            75%
                        </span>
                    </div>
                    <Progress value={75} className="mt-2 h-2" />
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border p-3">
                    <Calendar className="size-4 text-[var(--brand-primary)]" />
                    <span className="text-xs text-muted-foreground">Deadline</span>
                    <span className="ml-auto text-xs font-medium tabular-nums text-foreground">
                        24 Jun 2026
                    </span>
                </div>

                <div className="mt-3 rounded-lg border border-[var(--brand-primary-muted)] bg-[var(--brand-primary-soft)] p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">
                            Konten Submission #2
                        </p>
                        <span className="text-[0.65rem] text-muted-foreground">
                            draft.mp4
                        </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[0.7rem] font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <Eye className="size-3" /> Lihat
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[0.7rem] font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <RefreshCw className="size-3" /> Revisi
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1 rounded-md bg-[var(--success)] px-2 py-1.5 text-[0.7rem] font-medium text-white transition-opacity hover:opacity-90"
                        >
                            <CheckCircle2 className="size-3" /> Setujui
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
