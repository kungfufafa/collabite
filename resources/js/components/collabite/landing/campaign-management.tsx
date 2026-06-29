import {
    Activity,
    Check,
    FileText,
    MessagesSquare,
    RefreshCw,
    ScrollText,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { SectionHeading } from '@/components/collabite/section-heading';

const FEATURES = [
    {
        icon: FileText,
        text: 'Buat brief, budget, deadline, dan kebutuhan konten',
    },
    { icon: Users, text: 'Kelola undangan dan pengajuan creator' },
    { icon: Activity, text: 'Pantau progres kolaborasi' },
    {
        icon: MessagesSquare,
        text: 'Simpan komunikasi dalam satu workspace',
    },
    { icon: RefreshCw, text: 'Review konten dan berikan catatan revisi' },
    { icon: ScrollText, text: 'Lihat riwayat aktivitas campaign' },
];

const TIMELINE = [
    { label: 'Draft', state: 'done' as const },
    { label: 'Dipublikasikan', state: 'done' as const },
    { label: 'Kolaborasi Aktif', state: 'current' as const },
    { label: 'Review Konten', state: 'todo' as const },
    { label: 'Selesai', state: 'todo' as const },
];

export function CampaignManagement(): ReactNode {
    return (
        <section className="border-y border-border bg-card py-16 lg:py-24">
            <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
                <div>
                    <SectionHeading
                        eyebrow="Campaign Management"
                        title="Kelola Campaign dari Brief hingga Konten Disetujui"
                        align="left"
                    />
                    <ul className="mt-7 space-y-3.5">
                        {FEATURES.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
                                    <Icon className="size-4" />
                                </span>
                                <span className="text-sm leading-relaxed text-foreground">
                                    {text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-border bg-[var(--neutral-50)] p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Campaign #1024
                            </p>
                            <h3 className="mt-0.5 text-base font-semibold text-foreground">
                                Promosi Produk Kopi Lokal
                            </h3>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--info-soft)] px-2.5 py-1 text-xs font-medium text-[var(--info)] ring-1 ring-inset ring-[var(--info-border)]">
                            Kolaborasi Aktif
                        </span>
                    </div>

                    <div className="mt-6">
                        <p className="text-xs font-medium text-muted-foreground">
                            Status Campaign
                        </p>
                        <ol className="mt-4 space-y-0">
                            {TIMELINE.map((step, i) => {
                                const isLast = i === TIMELINE.length - 1;

                                return (
                                    <li key={step.label} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <span
                                                className={`flex size-6 items-center justify-center rounded-full text-[0.6rem] font-bold ${
                                                    step.state === 'done'
                                                        ? 'bg-[var(--success)] text-white'
                                                        : step.state ===
                                                            'current'
                                                          ? 'bg-[var(--brand-primary)] text-white ring-4 ring-[var(--brand-primary-muted)]'
                                                          : 'border border-border bg-card text-muted-foreground'
                                                }`}
                                            >
                                                {step.state === 'done' ? (
                                                    <Check className="size-3" />
                                                ) : (
                                                    i + 1
                                                )}
                                            </span>
                                            {!isLast ? (
                                                <span
                                                    className={`my-1 w-px flex-1 ${
                                                        step.state === 'done'
                                                            ? 'bg-[var(--success)]'
                                                            : 'bg-border'
                                                    }`}
                                                />
                                            ) : null}
                                        </div>
                                        <div
                                            className={
                                                isLast ? 'pb-0' : 'pb-5'
                                            }
                                        >
                                            <p
                                                className={`text-sm ${
                                                    step.state === 'todo'
                                                        ? 'text-muted-foreground'
                                                        : 'font-medium text-foreground'
                                                }`}
                                            >
                                                {step.label}
                                            </p>
                                            {step.state === 'current' ? (
                                                <p className="mt-0.5 text-xs text-[var(--brand-primary)]">
                                                    Sedang berlangsung
                                                </p>
                                            ) : null}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-3 border-t border-border pt-4">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Budget
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                                Rp 2,5jt
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Deliverables
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                                3 konten
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Deadline
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                                24 Jun
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
