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

import {
    brutalCard,
    brutalIconBox,
} from '@/components/collabite/landing/brutal-styles';
import { SectionHeading } from '@/components/collabite/section-heading';
import type { LandingFeaturedCampaign } from '@/pages/Public/Welcome';

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

const FALLBACK_TIMELINE = [
    { label: 'Draft', state: 'done' as const },
    { label: 'Dipublikasikan', state: 'done' as const },
    { label: 'Kolaborasi Aktif', state: 'current' as const },
    { label: 'Review Konten', state: 'todo' as const },
    { label: 'Selesai', state: 'todo' as const },
];

export function CampaignManagement({
    campaign,
}: {
    campaign: LandingFeaturedCampaign | null;
}): ReactNode {
    const timeline = campaign?.timeline ?? FALLBACK_TIMELINE;

    return (
        <section className="brutal-section-alt border-y-[3px] border-[var(--neutral-900)] py-16 lg:py-24">
            <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
                <div>
                    <SectionHeading
                        brutal
                        eyebrow="Campaign Management"
                        title="Kelola Campaign dari Brief hingga Konten Disetujui"
                        align="left"
                    />
                    <ul className="mt-7 space-y-3.5">
                        {FEATURES.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-start gap-3">
                                <span className={`${brutalIconBox} mt-0.5 size-7`}>
                                    <Icon className="size-4" />
                                </span>
                                <span className="text-sm font-bold leading-relaxed text-foreground">
                                    {text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {campaign ? (
                    <div className={`${brutalCard} bg-[var(--neutral-50)] p-6`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                    Campaign #{campaign.id}
                                </p>
                                <h3 className="mt-0.5 text-base font-black text-foreground">
                                    {campaign.title}
                                </h3>
                            </div>
                            <span className="inline-flex items-center gap-1.5 border-2 border-[var(--neutral-900)] bg-[var(--info-soft)] px-2.5 py-1 text-xs font-bold text-[var(--info)] shadow-[2px_2px_0_0_var(--neutral-900)]">
                                {campaign.status_label}
                            </span>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                                Status Campaign
                            </p>
                            <ol className="mt-4 space-y-0">
                                {timeline.map((step, index) => {
                                    const isLast = index === timeline.length - 1;

                                    return (
                                        <li key={step.label} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    className={`flex size-6 items-center justify-center border-2 border-[var(--neutral-900)] text-[0.6rem] font-black ${
                                                        step.state === 'done'
                                                            ? 'bg-[var(--success)] text-white'
                                                            : step.state ===
                                                                'current'
                                                              ? 'bg-[var(--brand-primary)] text-white'
                                                              : 'bg-white text-muted-foreground'
                                                    }`}
                                                >
                                                    {step.state === 'done' ? (
                                                        <Check className="size-3" />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </span>
                                                {!isLast ? (
                                                    <span
                                                        className={`my-1 w-[3px] flex-1 ${
                                                            step.state === 'done'
                                                                ? 'bg-[var(--success)]'
                                                                : 'bg-[var(--neutral-900)]'
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
                                                            ? 'font-medium text-muted-foreground'
                                                            : 'font-black text-foreground'
                                                    }`}
                                                >
                                                    {step.label}
                                                </p>
                                                {step.state === 'current' ? (
                                                    <p className="mt-0.5 text-xs font-bold text-[var(--brand-primary)]">
                                                        Sedang berlangsung
                                                    </p>
                                                ) : null}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-3 border-t-[3px] border-[var(--neutral-900)] pt-4">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">
                                    Budget
                                </p>
                                <p className="text-sm font-black text-foreground">
                                    {campaign.budget ?? '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">
                                    Deliverables
                                </p>
                                <p className="text-sm font-black text-foreground">
                                    {campaign.deliverable_count} konten
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">
                                    Deadline
                                </p>
                                <p className="text-sm font-black text-foreground">
                                    {campaign.deadline ?? '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="border-[3px] border-dashed border-[var(--neutral-900)] bg-[var(--neutral-50)] p-8 text-center text-sm font-medium text-muted-foreground">
                        Belum ada campaign demo yang dipublikasikan.
                    </div>
                )}
            </div>
        </section>
    );
}
