import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { FilterPanel } from '@/components/app/filter-panel';
import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { index as creatorsIndex } from '@/routes/public/creators';

type Creator = {
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
};

type PaginatedLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    links: PaginatedLink[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Filters = {
    q: string;
    category: string | null;
    rating: number;
    verified: string | null;
};

type Props = {
    creators: Paginated<Creator>;
    categories: { id: number; name: string }[];
    filters: Filters;
};

export default function CreatorDirectory({ creators, categories, filters }: Props): ReactNode {
    const [q, setQ] = useState(filters.q);
    const [category, setCategory] = useState(filters.category ?? '');
    const [rating, setRating] = useState(filters.rating);
    const [verified, setVerified] = useState(filters.verified ?? '');

    function applyFilters(overrides: Partial<Filters> = {}): void {
        router.get(
            creatorsIndex(),
            {
                q: overrides.q ?? q,
                category: overrides.category ?? (category || undefined),
                rating: overrides.rating ?? (rating || undefined),
                verified: overrides.verified ?? (verified || undefined),
            },
            { preserveState: true, replace: true },
        );
    }

    function onSearch(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        applyFilters();
    }

    return (
        <>
            <Head title="Direktori Creator" />
            <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
                <PageHeader
                    title="Direktori Creator"
                    description="Temukan Creator terverifikasi untuk kolaborasi campaign Anda."
                />

                <div className="mt-8">
                    <FilterPanel>
                        <form
                            onSubmit={onSearch}
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <Label htmlFor="q">Kata kunci</Label>
                                <Input
                                    id="q"
                                    name="q"
                                    value={q}
                                    onChange={(event) => setQ(event.target.value)}
                                    placeholder="Cari nama, headline, atau bio"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="category">Kategori</Label>
                                <select
                                    id="category"
                                    name="category"
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value)}
                                    className="border-input bg-transparent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                                >
                                    <option value="">Semua</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="rating">Rating minimal</Label>
                                <select
                                    id="rating"
                                    name="rating"
                                    value={rating}
                                    onChange={(event) => setRating(Number(event.target.value))}
                                    className="border-input bg-transparent flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                                >
                                    <option value={0}>Semua</option>
                                    <option value={3}>3+</option>
                                    <option value={4}>4+</option>
                                    <option value={4.5}>4.5+</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-2 pb-1 sm:col-span-2 lg:col-span-4">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={verified === '1'}
                                    onChange={(event) => setVerified(event.target.checked ? '1' : '')}
                                    className="size-4 rounded border-border"
                                />
                                <Label htmlFor="verified">Hanya Creator terverifikasi</Label>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2 lg:col-span-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setQ('');
                                        setCategory('');
                                        setRating(0);
                                        setVerified('');
                                        applyFilters({ q: '', category: '', rating: 0, verified: '' });
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button type="submit">Terapkan filter</Button>
                            </div>
                        </form>
                    </FilterPanel>
                </div>

                {creators.data.length === 0 ? (
                    <div className="mt-8">
                        <ListEmptyState
                            description="Coba ubah filter pencarian Anda."
                            title="Belum ada Creator yang cocok"
                        />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {creators.data.map((creator) => (
                            <ResourceCard key={creator.id}>
                                <div className="flex items-start gap-3">
                                    <Avatar className="size-10 shrink-0">
                                        {creator.profile_photo_url ? (
                                            <AvatarImage
                                                src={creator.profile_photo_url}
                                                alt={creator.name ?? ''}
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-[var(--brand-primary-muted)] text-sm font-semibold text-[var(--brand-primary)]">
                                            {(creator.name ?? 'C').slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-foreground">
                                                    {creator.name ?? 'Creator'}
                                                </h3>
                                                {creator.headline ? (
                                                    <p className="line-clamp-1 text-sm text-muted-foreground">
                                                        {creator.headline}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <span className="shrink-0 text-xs font-medium text-[var(--warning)]">
                                                ★ {creator.rating_avg.toFixed(1)} ({creator.rating_count})
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {creator.city ?? 'Lokasi tidak diisi'}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {creator.verification_status === 'verified' ? (
                                                <StatusBadge label="Terverifikasi" tone="success" />
                                            ) : (
                                                <StatusBadge label="Belum terverifikasi" tone="neutral" />
                                            )}
                                            <StatusBadge
                                                label={`${creator.portfolio_count} portofolio`}
                                                tone="neutral"
                                            />
                                        </div>
                                        {creator.categories.length > 0 ? (
                                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                                {creator.categories.join(', ')}
                                            </p>
                                        ) : null}
                                        <div className="mt-4 flex justify-end">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/creators/${creator.id}`}>Lihat Profil</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ResourceCard>
                        ))}
                    </div>
                )}

                {creators.last_page > 1 ? (
                    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">
                        {creators.links.map((link, index) => (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url ?? '#'}
                                className={cn(
                                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                                    link.active
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : link.url
                                          ? 'border-border bg-card text-foreground hover:bg-muted'
                                          : 'cursor-not-allowed border-border text-muted-foreground opacity-50',
                                )}
                                preserveState
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ))}
                    </nav>
                ) : null}
            </div>
        </>
    );
}
