import { Link } from '@inertiajs/react';
import {
    BadgeCheck,
    MapPin,
    Search,
    SlidersHorizontal,
    Star,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { SectionHeading } from '@/components/collabite/section-heading';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { Button } from '@/components/ui/button';

const FILTERS = [
    'Semua',
    'Food & Lifestyle',
    'Beauty',
    'Fashion',
    'Product Photo',
    'Travel',
];

type Creator = {
    name: string;
    initials: string;
    category: string;
    rating: string;
    reviews: number;
    collabs: number;
    location: string;
    portfolio: string[];
};

const CREATORS: Creator[] = [
    {
        name: 'Nadia Putri',
        initials: 'NP',
        category: 'Food & Lifestyle Creator',
        rating: '4,9',
        reviews: 28,
        collabs: 32,
        location: 'Bandung',
        portfolio: [
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
        ],
    },
    {
        name: 'Rizky Visual',
        initials: 'RV',
        category: 'Product Photography',
        rating: '4,8',
        reviews: 21,
        collabs: 27,
        location: 'Jakarta',
        portfolio: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
        ],
    },
    {
        name: 'Anisa Daily',
        initials: 'AD',
        category: 'Beauty & Skincare Creator',
        rating: '5,0',
        reviews: 35,
        collabs: 41,
        location: 'Surabaya',
        portfolio: [
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
        ],
    },
];

function CreatorCard({ creator }: { creator: Creator }): ReactNode {
    return (
        <div className="flex w-[85vw] shrink-0 flex-col rounded-xl border border-border bg-card p-5 sm:w-auto sm:shrink">
            <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-muted)] text-base font-semibold text-[var(--brand-primary)]">
                    {creator.initials}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                        {creator.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {creator.category}
                    </p>
                </div>
            </div>

            <div className="mt-3 inline-flex w-fit items-center gap-1 rounded-md bg-[var(--brand-secondary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-secondary)] ring-1 ring-inset ring-[var(--brand-secondary-muted)]">
                <BadgeCheck className="size-3.5" />
                Terverifikasi
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="tabular-nums">{creator.rating}</span>
                    <span className="font-normal text-muted-foreground">
                        ({creator.reviews} ulasan)
                    </span>
                </span>
                <span className="tabular-nums">{creator.collabs} kolaborasi</span>
                <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {creator.location}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                {creator.portfolio.map((src, i) => (
                    <ImageWithFallback
                        key={src}
                        src={src}
                        alt={`Contoh portofolio ${creator.category} ${i + 1}`}
                        className="aspect-square w-full rounded-lg object-cover"
                    />
                ))}
            </div>

            <Button
                variant="outline"
                className="mt-4 w-full border-[var(--brand-primary-muted)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-hover)]"
            >
                Lihat Profil
            </Button>
        </div>
    );
}

export function CreatorDiscovery(): ReactNode {
    return (
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
            <SectionHeading
                eyebrow="Creator Discovery"
                title="Cari Creator Berdasarkan Kebutuhan Campaign"
                description="Lihat kategori konten, portofolio, rating, lokasi, dan pengalaman sebelum memulai kolaborasi."
            />

            <div className="mx-auto mt-10 max-w-3xl">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-xs">
                    <div className="flex flex-1 items-center gap-2 px-2">
                        <Search className="size-4 text-muted-foreground" />
                        <input
                            type="text"
                            aria-label="Cari creator"
                            placeholder="Cari creator, kategori, atau lokasi..."
                            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5">
                        <SlidersHorizontal className="size-3.5" />
                        <span className="hidden sm:inline">Filter</span>
                    </Button>
                    <Button size="sm">Cari</Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {FILTERS.map((f, i) => (
                        <button
                            key={f}
                            type="button"
                            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                                i === 0
                                    ? 'border-transparent bg-[var(--brand-primary)] text-white'
                                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        4,5+
                    </span>
                </div>
            </div>

            <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
                {CREATORS.map((c) => (
                    <CreatorCard key={c.name} creator={c} />
                ))}
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
                Pratinjau produk — data creator di atas merupakan contoh untuk
                menggambarkan tampilan marketplace.
            </p>
        </section>
    );
}
