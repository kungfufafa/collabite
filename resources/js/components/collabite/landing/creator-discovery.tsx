import { Link } from '@inertiajs/react';
import {
    BadgeCheck,
    MapPin,
    Search,
    SlidersHorizontal,
    Star,
} from 'lucide-react';
import type { ReactNode } from 'react';

import {
    brutalBtnOutline,
    brutalBtnPrimary,
    brutalCard,
    brutalChip,
    brutalChipActive,
} from '@/components/collabite/landing/brutal-styles';
import { SectionHeading } from '@/components/collabite/section-heading';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type {
    LandingCategory,
    LandingFeaturedCreator,
} from '@/pages/Public/Welcome';
import { show as creatorShow } from '@/routes/public/creators';

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

function CreatorCard({ creator }: { creator: LandingFeaturedCreator }): ReactNode {
    const isVerified = creator.verification_status === 'verified';
    const categoryLabel =
        creator.headline ??
        creator.categories[0] ??
        'Content Creator';

    return (
        <div
            className={`${brutalCard} flex w-[85vw] shrink-0 flex-col p-5 sm:w-auto sm:shrink`}
        >
            <div className="flex items-center gap-3">
                <Avatar className="size-12 border-2 border-[var(--neutral-900)]">
                    {creator.profile_photo_url ? (
                        <AvatarImage src={creator.profile_photo_url} alt={creator.name} />
                    ) : null}
                    <AvatarFallback className="bg-[var(--brand-primary-muted)] text-base font-black text-[var(--brand-primary)]">
                        {initials(creator.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-foreground">
                        {creator.name}
                    </p>
                    <p className="truncate text-xs font-medium text-muted-foreground">
                        {categoryLabel}
                    </p>
                </div>
            </div>

            {isVerified ? (
                <div className="mt-3 inline-flex w-fit items-center gap-1 border-2 border-[var(--neutral-900)] bg-[var(--brand-secondary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--brand-secondary)] shadow-[2px_2px_0_0_var(--neutral-900)]">
                    <BadgeCheck className="size-3.5" />
                    Terverifikasi
                </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                {creator.rating_count > 0 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-foreground">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="tabular-nums">
                            {formatRating(creator.rating_avg)}
                        </span>
                        <span className="font-medium text-muted-foreground">
                            ({creator.rating_count} ulasan)
                        </span>
                    </span>
                ) : null}
                <span className="tabular-nums">
                    {creator.collaboration_count} kolaborasi
                </span>
                {creator.city ? (
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {creator.city}
                    </span>
                ) : null}
            </div>

            {creator.portfolio_urls.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {creator.portfolio_urls.map((src, index) => (
                        <ImageWithFallback
                            key={`${creator.id}-${src}`}
                            src={src}
                            alt={`Portofolio ${creator.name} ${index + 1}`}
                            className="aspect-square w-full border-2 border-[var(--neutral-900)] object-cover"
                        />
                    ))}
                </div>
            ) : null}

            <Link
                href={creatorShow(creator.id)}
                className={`${brutalBtnOutline} mt-4 w-full`}
            >
                Lihat Profil
            </Link>
        </div>
    );
}

export function CreatorDiscovery({
    creators,
    categories,
}: {
    creators: LandingFeaturedCreator[];
    categories: LandingCategory[];
}): ReactNode {
    const filterLabels = ['Semua', ...categories.slice(0, 5).map((c) => c.name)];

    return (
        <section
            id="umkm"
            className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-16 sm:px-8 lg:py-24"
        >
            <SectionHeading
                brutal
                eyebrow="Creator Discovery"
                title="Cari Creator Berdasarkan Kebutuhan Campaign"
                description="Lihat kategori konten, portofolio, rating, lokasi, dan pengalaman sebelum memulai kolaborasi."
            />

            <div className="mx-auto mt-10 max-w-3xl">
                <div className="flex items-center gap-2 border-[3px] border-[var(--neutral-900)] bg-white p-2 shadow-[4px_4px_0_0_var(--neutral-900)]">
                    <div className="flex flex-1 items-center gap-2 px-2">
                        <Search className="size-4 text-muted-foreground" />
                        <input
                            type="text"
                            aria-label="Cari creator"
                            placeholder="Cari creator, kategori, atau lokasi..."
                            className="w-full bg-transparent py-2 text-sm font-medium outline-none placeholder:text-muted-foreground"
                            readOnly
                        />
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-2 border-[var(--neutral-900)] font-bold shadow-[2px_2px_0_0_var(--neutral-900)]"
                        asChild
                    >
                        <Link href="/creators">
                            <SlidersHorizontal className="size-3.5" />
                            <span className="hidden sm:inline">Filter</span>
                        </Link>
                    </Button>
                    <Link
                        href="/creators"
                        className={`${brutalBtnPrimary} h-9 px-4 text-xs`}
                    >
                        Cari
                    </Link>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {filterLabels.map((label, index) => (
                        <span
                            key={label}
                            className={
                                index === 0 ? brutalChipActive : brutalChip
                            }
                        >
                            {label}
                        </span>
                    ))}
                    <span className={`${brutalChip} ml-auto gap-1`}>
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        4,5+
                    </span>
                </div>
            </div>

            {creators.length > 0 ? (
                <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
                    {creators.map((creator) => (
                        <CreatorCard key={creator.id} creator={creator} />
                    ))}
                </div>
            ) : (
                <p className="mt-8 border-[3px] border-dashed border-[var(--neutral-900)] bg-[var(--neutral-100)] px-4 py-8 text-center text-sm font-medium text-muted-foreground">
                    Belum ada creator terverifikasi dengan portofolio. Jalankan{' '}
                    <code className="rounded border border-[var(--neutral-900)] bg-white px-1 py-0.5 text-xs">
                        php artisan migrate:fresh --seed
                    </code>{' '}
                    di environment lokal.
                </p>
            )}

            <div className="mt-10 flex justify-center">
                <Link href="/creators" className={brutalBtnOutline}>
                    Lihat Direktori Creator
                </Link>
            </div>
        </section>
    );
}
