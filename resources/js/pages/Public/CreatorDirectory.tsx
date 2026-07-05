import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { ListEmptyState } from '@/components/app/list-empty-state';
import {
    brutalChip,
    brutalChipActive,
    brutalPaginationLink,
    brutalPaginationLinkActive,
    brutalSelectField,
} from '@/components/collabite/landing/brutal-styles';
import {
    CreatorDirectoryCard
    
} from '@/components/collabite/public/creator-directory-card';
import type {CreatorDirectoryItem} from '@/components/collabite/public/creator-directory-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { index as creatorsIndex } from '@/routes/public/creators';

type PaginatedLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    links: PaginatedLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
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
    creators: Paginated<CreatorDirectoryItem>;
    categories: { id: number; name: string }[];
    filters: Filters;
};

const RATING_OPTIONS = [
    { value: 0, label: 'Semua rating' },
    { value: 3, label: '3+ bintang' },
    { value: 4, label: '4+ bintang' },
    { value: 4.5, label: '4,5+ bintang' },
] as const;

const filterLabelClass =
    'text-[11px] font-bold uppercase leading-none tracking-wide text-muted-foreground';

const controlHeightClass = 'h-12';

const controlFieldClass = cn(
    brutalSelectField,
    controlHeightClass,
    '!h-12 min-h-12',
);

export default function CreatorDirectory({
    creators,
    categories,
    filters,
}: Props): ReactNode {
    const [q, setQ] = useState(filters.q);
    const [category, setCategory] = useState(filters.category ?? '');
    const [rating, setRating] = useState(filters.rating);
    const [verified, setVerified] = useState(filters.verified ?? '');

    const hasActiveFilters =
        q !== '' ||
        category !== '' ||
        rating > 0 ||
        verified === '1';

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

    function resetFilters(): void {
        setQ('');
        setCategory('');
        setRating(0);
        setVerified('');
        applyFilters({ q: '', category: '', rating: 0, verified: '' });
    }

    function selectCategoryChip(categoryId: string): void {
        const next = category === categoryId ? '' : categoryId;
        setCategory(next);
        applyFilters({ category: next || '' });
    }

    const resultLabel =
        creators.total === 0
            ? 'Tidak ada creator ditemukan'
            : creators.from && creators.to
              ? `${creators.from}–${creators.to} dari ${creators.total} creator`
              : `${creators.total} creator`;

    return (
        <>
            <Head title="Direktori Creator" />

            <section className="border-b-[3px] border-[var(--neutral-900)] bg-[var(--brand-primary-soft)]">
                <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10">
                    <p className="inline-flex border-2 border-[var(--neutral-900)] bg-[var(--brand-secondary)] px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_var(--neutral-900)]">
                        Direktori Creator
                    </p>
                    <h1 className="brutal-heading-display mt-4 max-w-2xl text-[1.65rem] sm:text-[2.1rem]">
                        Cari Creator untuk Campaign Anda
                    </h1>
                    <p className="mt-2 max-w-xl text-sm font-medium text-muted-foreground">
                        Filter berdasarkan kategori, rating, dan status verifikasi.
                    </p>

                    <form onSubmit={onSearch} className="mt-6 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                            <label
                                className={cn(
                                    'flex flex-1 items-center gap-3 border-2 border-[var(--neutral-900)] bg-white px-3 shadow-[3px_3px_0_0_var(--neutral-900)]',
                                    controlHeightClass,
                                )}
                            >
                                <Search className="size-5 shrink-0 text-muted-foreground" />
                                <span className="sr-only">Kata kunci</span>
                                <input
                                    id="q"
                                    name="q"
                                    value={q}
                                    onChange={(event) => setQ(event.target.value)}
                                    placeholder="Nama, headline, atau bio..."
                                    className="h-full w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
                                />
                            </label>
                            <Button
                                type="submit"
                                size="lg"
                                className={cn(
                                    controlHeightClass,
                                    'w-full shrink-0 px-6 text-sm font-black uppercase sm:w-auto sm:min-w-[7.5rem]',
                                )}
                            >
                                Cari
                            </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)_auto] lg:items-end">
                            <label className="flex flex-col gap-1.5">
                                <span className={filterLabelClass}>Kategori</span>
                                <select
                                    id="category"
                                    name="category"
                                    value={category}
                                    onChange={(event) => {
                                        const next = event.target.value;
                                        setCategory(next);
                                        applyFilters({ category: next });
                                    }}
                                    className={controlFieldClass}
                                >
                                    <option value="">Semua kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className={filterLabelClass}>
                                    Rating minimal
                                </span>
                                <select
                                    id="rating"
                                    name="rating"
                                    value={rating}
                                    onChange={(event) => {
                                        const next = Number(event.target.value);
                                        setRating(next);
                                        applyFilters({ rating: next });
                                    }}
                                    className={controlFieldClass}
                                >
                                    {RATING_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                                <span className={filterLabelClass}>Verifikasi</span>
                                <label
                                    htmlFor="verified"
                                    className={cn(
                                        'flex items-center gap-2.5 border-2 border-[var(--neutral-900)] bg-white px-3 shadow-[2px_2px_0_0_var(--neutral-900)]',
                                        controlHeightClass,
                                    )}
                                >
                                    <Checkbox
                                        id="verified"
                                        checked={verified === '1'}
                                        onCheckedChange={(checked) => {
                                            const next =
                                                checked === true ? '1' : '';
                                            setVerified(next);
                                            applyFilters({ verified: next });
                                        }}
                                    />
                                    <span className="text-sm font-semibold leading-none">
                                        Hanya terverifikasi
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                                <span
                                    className={cn(filterLabelClass, 'select-none opacity-0')}
                                    aria-hidden
                                >
                                    Aksi
                                </span>
                                <div className="flex gap-2">
                                    {hasActiveFilters ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            className={cn(
                                                controlHeightClass,
                                                'flex-1 font-bold',
                                            )}
                                            onClick={resetFilters}
                                        >
                                            Reset
                                        </Button>
                                    ) : (
                                        <div
                                            className={cn(
                                                controlHeightClass,
                                                'hidden flex-1 lg:block',
                                            )}
                                            aria-hidden
                                        />
                                    )}
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        size="lg"
                                        className={cn(
                                            controlHeightClass,
                                            'flex-1 font-bold lg:hidden',
                                        )}
                                    >
                                        Terapkan
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {categories.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                    type="button"
                                    className={
                                        category === ''
                                            ? brutalChipActive
                                            : brutalChip
                                    }
                                    onClick={() => selectCategoryChip('')}
                                >
                                    Semua
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={
                                            String(category) === String(cat.id)
                                                ? brutalChipActive
                                                : brutalChip
                                        }
                                        onClick={() =>
                                            selectCategoryChip(String(cat.id))
                                        }
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </form>
                </div>
            </section>

            <section className="border-b-[3px] border-[var(--neutral-900)] bg-[var(--neutral-100)] py-8 sm:py-10">
                <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-2 border-[var(--neutral-900)] bg-white px-4 py-3 shadow-[3px_3px_0_0_var(--neutral-900)]">
                        <p className="text-sm font-black text-foreground">
                            {resultLabel}
                        </p>
                        {hasActiveFilters ? (
                            <span className="text-xs font-bold text-[var(--brand-primary)]">
                                Filter aktif
                            </span>
                        ) : null}
                    </div>

                    {creators.data.length === 0 ? (
                        <ListEmptyState
                            description="Coba kata kunci lain atau longgarkan filter pencarian."
                            title="Belum ada Creator yang cocok"
                        />
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {creators.data.map((creator) => (
                                <CreatorDirectoryCard
                                    key={creator.id}
                                    creator={creator}
                                />
                            ))}
                        </div>
                    )}

                    {creators.last_page > 1 ? (
                        <nav
                            aria-label="Paginasi direktori"
                            className="mt-10 flex flex-wrap items-center justify-center gap-2"
                        >
                            {creators.links.map((link, index) => (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url ?? '#'}
                                    className={cn(
                                        link.active
                                            ? brutalPaginationLinkActive
                                            : link.url
                                              ? `${brutalPaginationLink} bg-card text-foreground hover:-translate-x-px hover:-translate-y-px hover:bg-muted shadow-[2px_2px_0_0_var(--neutral-900)]`
                                              : `${brutalPaginationLink} cursor-not-allowed bg-muted text-muted-foreground opacity-50 shadow-none`,
                                    )}
                                    preserveState
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Link>
                            ))}
                        </nav>
                    ) : null}
                </div>
            </section>
        </>
    );
}
