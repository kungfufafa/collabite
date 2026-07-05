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

import {
    brutalBadge,
    brutalBtnOutline,
    brutalBtnPrimary,
    brutalCard,
    brutalCardStatic,
} from '@/components/collabite/landing/brutal-styles';
import type { LandingHeroSpotlight } from '@/pages/Public/Welcome';
import { Progress } from '@/components/ui/progress-placeholder';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function initials(name: string): string {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

function formatRating(value: number): string {
    return value.toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
}

export function Hero({
    spotlight,
}: {
    spotlight: LandingHeroSpotlight | null;
}): ReactNode {
    return (
        <section
            id="top"
            className="border-b-[3px] border-[var(--neutral-900)]"
        >
            <div className="mx-auto grid max-w-[1200px] items-start gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-24 lg:pt-20">
                <div className="flex flex-col gap-6">
                    <span className={`${brutalBadge} w-fit`}>
                        Platform Kolaborasi UMKM &amp; Creator
                    </span>

                    <h1 className="brutal-heading-display text-[2.25rem] leading-[1.12] sm:text-[2.9rem] lg:text-[3.5rem]">
                        Temukan Creator yang Tepat,{' '}
                        <span className="text-[var(--brand-primary)]">
                            Jalankan Campaign
                        </span>{' '}
                        <span className="text-[var(--brand-secondary)]">
                            Tanpa Ribet.
                        </span>
                    </h1>

                    <p className="max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
                        Collabite membantu UMKM menemukan content creator,
                        mengelola campaign, memantau progres, dan menyetujui
                        konten dalam satu tempat.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/register?role=umkm"
                                className={brutalBtnPrimary}
                            >
                                Buat Campaign Gratis
                                <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href="/register?role=creator"
                                className={brutalBtnOutline}
                            >
                                Daftar sebagai Creator
                            </Link>
                        </div>

                        <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <CheckCircle2 className="size-4 text-[var(--success)]" />
                            Gratis untuk memulai • Tanpa kartu kredit
                        </p>
                    </div>
                </div>

                <div className="w-full">
                    <HeroMockup spotlight={spotlight} />
                </div>
            </div>
        </section>
    );
}

function HeroMockup({
    spotlight,
}: {
    spotlight: LandingHeroSpotlight | null;
}): ReactNode {
    if (spotlight === null) {
        return (
            <div
                className={`${brutalCardStatic} mx-auto w-full max-w-md p-8 text-center text-sm font-medium text-muted-foreground lg:max-w-none`}
            >
                Belum ada kolaborasi aktif. Jalankan seeder demo untuk melihat
                pratinjau campaign nyata.
            </div>
        );
    }

    return (
        <div className={`${brutalCard} mx-auto w-full max-w-md lg:max-w-none`}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            Campaign
                        </p>
                        <h3 className="mt-0.5 text-base font-black text-foreground">
                            {spotlight.campaign_title}
                        </h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 border-2 border-[var(--neutral-900)] bg-[var(--warning-soft)] px-2.5 py-1 text-xs font-bold text-foreground shadow-[2px_2px_0_0_var(--neutral-900)]">
                        <span className="size-1.5 rounded-full bg-[var(--warning)]" />
                        {spotlight.campaign_status_label}
                    </span>
                </div>

                <div className="mt-4 flex items-center gap-3 border-2 border-[var(--neutral-900)] bg-[var(--neutral-50)] p-3 shadow-[2px_2px_0_0_var(--neutral-900)]">
                    <Avatar className="size-10 border-2 border-[var(--neutral-900)]">
                        {spotlight.creator_profile_photo_url ? (
                            <AvatarImage
                                src={spotlight.creator_profile_photo_url}
                                alt={spotlight.creator_name}
                            />
                        ) : null}
                        <AvatarFallback className="bg-[var(--brand-primary-muted)] text-sm font-black text-[var(--brand-primary)]">
                            {initials(spotlight.creator_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">
                            {spotlight.creator_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {spotlight.creator_headline ?? 'Content Creator'}
                        </p>
                    </div>
                    {spotlight.creator_rating_avg > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            {formatRating(spotlight.creator_rating_avg)}
                        </span>
                    ) : null}
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground">
                            Progres pengerjaan
                        </span>
                        <span className="tabular-nums text-foreground">
                            {spotlight.progress_percent}%
                        </span>
                    </div>
                    <Progress
                        value={spotlight.progress_percent}
                        className="mt-2 h-3 border-2 border-[var(--neutral-900)]"
                    />
                </div>

                {spotlight.deadline ? (
                    <div className="mt-4 flex items-center gap-2 border-2 border-[var(--neutral-900)] p-3 shadow-[2px_2px_0_0_var(--neutral-900)]">
                        <Calendar className="size-4 text-[var(--brand-primary)]" />
                        <span className="text-xs font-bold text-muted-foreground">
                            Deadline
                        </span>
                        <span className="ml-auto text-xs font-black tabular-nums text-foreground">
                            {spotlight.deadline}
                        </span>
                    </div>
                ) : null}

                {spotlight.submission_title ? (
                    <div className="mt-3 border-2 border-[var(--neutral-900)] bg-[var(--brand-primary-soft)] p-3 shadow-[2px_2px_0_0_var(--neutral-900)]">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-foreground">
                                {spotlight.submission_title}
                            </p>
                            {spotlight.submission_file_label ? (
                                <span className="text-[0.65rem] font-medium text-muted-foreground">
                                    {spotlight.submission_file_label}
                                </span>
                            ) : null}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-1 border-2 border-[var(--neutral-900)] bg-white px-2 py-1.5 text-[0.7rem] font-bold text-foreground shadow-[2px_2px_0_0_var(--neutral-900)] transition-transform hover:-translate-x-px hover:-translate-y-px"
                            >
                                <Eye className="size-3" /> Lihat
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-1 border-2 border-[var(--neutral-900)] bg-white px-2 py-1.5 text-[0.7rem] font-bold text-foreground shadow-[2px_2px_0_0_var(--neutral-900)] transition-transform hover:-translate-x-px hover:-translate-y-px"
                            >
                                <RefreshCw className="size-3" /> Revisi
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-1 border-2 border-[var(--neutral-900)] bg-[var(--success)] px-2 py-1.5 text-[0.7rem] font-bold text-white shadow-[2px_2px_0_0_var(--neutral-900)]"
                            >
                                <CheckCircle2 className="size-3" /> Setujui
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
