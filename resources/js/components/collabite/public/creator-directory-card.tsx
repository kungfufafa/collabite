import { Link } from '@inertiajs/react';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import type { ReactNode } from 'react';

import {
    brutalBtnOutline,
    brutalCard,
    brutalChip,
} from '@/components/collabite/landing/brutal-styles';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { show as creatorShow } from '@/routes/public/creators';

export type CreatorDirectoryItem = {
    id: number;
    name: string | null;
    headline: string | null;
    city: string | null;
    rating_avg: number;
    rating_count: number;
    verification_status: string;
    profile_photo_url: string | null;
    categories: string[];
    portfolio_count: number;
    portfolio_urls: string[];
};

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

export function CreatorDirectoryCard({
    creator,
}: {
    creator: CreatorDirectoryItem;
}): ReactNode {
    const isVerified = creator.verification_status === 'verified';
    const displayName = creator.name ?? 'Creator';
    const subtitle =
        creator.headline ?? creator.categories[0] ?? 'Content Creator';

    return (
        <article className={`${brutalCard} flex h-full flex-col p-5`}>
            <div className="flex items-start gap-3">
                <Avatar className="size-14 shrink-0 border-2 border-[var(--neutral-900)] shadow-[2px_2px_0_0_var(--neutral-900)]">
                    {creator.profile_photo_url ? (
                        <AvatarImage
                            src={creator.profile_photo_url}
                            alt={displayName}
                        />
                    ) : null}
                    <AvatarFallback className="bg-[var(--brand-primary-muted)] text-base font-black text-[var(--brand-primary)]">
                        {initials(displayName)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-black text-foreground">
                        {displayName}
                    </h3>
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {isVerified ? (
                    <span className="inline-flex items-center gap-1 border-2 border-[var(--neutral-900)] bg-[var(--brand-secondary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--brand-secondary)] shadow-[2px_2px_0_0_var(--neutral-900)]">
                        <BadgeCheck className="size-3.5" />
                        Terverifikasi
                    </span>
                ) : (
                    <span className="inline-flex items-center border-2 border-[var(--neutral-900)] bg-[var(--neutral-100)] px-2 py-0.5 text-xs font-bold text-muted-foreground shadow-[2px_2px_0_0_var(--neutral-900)]">
                        Belum terverifikasi
                    </span>
                )}
                {creator.rating_count > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {formatRating(creator.rating_avg)}
                        <span className="font-medium text-muted-foreground">
                            ({creator.rating_count})
                        </span>
                    </span>
                ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                <span>{creator.portfolio_count} portofolio</span>
                {creator.city ? (
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5 shrink-0" />
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
                            alt={`Portofolio ${displayName} ${index + 1}`}
                            className="aspect-square w-full border-2 border-[var(--neutral-900)] object-cover"
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {Array.from({ length: Math.min(creator.portfolio_count, 3) || 1 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="aspect-square border-2 border-dashed border-[var(--neutral-900)] bg-[var(--neutral-50)]"
                            />
                        ),
                    )}
                </div>
            )}

            {creator.categories.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {creator.categories.slice(0, 2).map((category) => (
                        <span key={category} className={brutalChip}>
                            {category}
                        </span>
                    ))}
                </div>
            ) : null}

            <Link
                href={creatorShow(creator.id)}
                className={`${brutalBtnOutline} mt-5 flex h-11 w-full items-center justify-center`}
            >
                Lihat Profil
            </Link>
        </article>
    );
}
