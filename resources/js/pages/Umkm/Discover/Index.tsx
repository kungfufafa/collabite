import { Form, Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { FilterPanel } from '@/components/app/filter-panel';
import { FlashBanner } from '@/components/app/flash-banner';
import { InitialsAvatar } from '@/components/app/initials-avatar';
import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index as discoverIndex } from '@/routes/umkm/discover';

type Category = { id: number; name: string };

type Creator = {
    id: number;
    name: string;
    headline: string | null;
    city: string | null;
    verification_status: string;
    rating_avg: number;
    rating_count: number;
    profile_photo_url: string | null;
    categories: string[];
    skills: string[];
    portfolio_count: number;
};

export default function Index({
    creators,
    categories,
    filters,
    pagination,
}: {
    creators: { data: Creator[] } | Creator[];
    categories: Category[];
    filters: { q: string; category_id: string | null; min_rating: string | null; verified_only: string | null };
    pagination?: { current_page: number; last_page: number; total: number };
}): ReactNode {
    const flash = usePage().props.status as string | undefined;
    const list = Array.isArray(creators) ? creators : creators.data;

    return (
        <>
            <Head title="Cari Creator" />
            <div>
                <PageHeader
                    description="Temukan Creator yang tepat untuk campaign Anda."
                    title="Cari Content Creator"
                />

                {flash ? (
                    <div className="mt-6">
                        <FlashBanner message={flash} />
                    </div>
                ) : null}

                <div className="mt-8">
                    <FilterPanel>
                        <Form
                            {...discoverIndex.form()}
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            options={{ preserveState: true }}
                        >
                            {() => (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="q">Kata kunci</Label>
                                        <Input
                                            defaultValue={filters.q ?? ''}
                                            id="q"
                                            name="q"
                                            placeholder="Nama, keahlian, headline"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="category_id">Kategori</Label>
                                        <input
                                            defaultValue={filters.category_id ?? ''}
                                            id="category_id_input"
                                            name="category_id"
                                            type="hidden"
                                        />
                                        <Select
                                            defaultValue={filters.category_id ?? ''}
                                            onValueChange={(v) => {
                                                const el = document.getElementById(
                                                    'category_id_input',
                                                ) as HTMLInputElement | null;

                                                if (el) {
                                                    el.value = v;
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Semua</SelectItem>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="min_rating">Rating minimal</Label>
                                        <Input
                                            defaultValue={filters.min_rating ?? ''}
                                            id="min_rating"
                                            max="5"
                                            min="0"
                                            name="min_rating"
                                            step="0.1"
                                            type="number"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2 pb-1">
                                        <input
                                            className="size-4 rounded border-border"
                                            defaultChecked={filters.verified_only === '1'}
                                            id="verified_only"
                                            name="verified_only"
                                            type="checkbox"
                                            value="1"
                                        />
                                        <Label htmlFor="verified_only">Hanya terverifikasi</Label>
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-4">
                                        <Button type="submit">Terapkan filter</Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </FilterPanel>
                </div>

                {list.length === 0 ? (
                    <div className="mt-8">
                        <ListEmptyState
                            description="Coba ubah filter pencarian Anda."
                            title="Tidak ada Creator yang cocok"
                        />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((c) => (
                            <ResourceCard key={c.id}>
                                <div className="flex items-start gap-3">
                                    <InitialsAvatar
                                        name={c.name ?? 'Creator'}
                                        size="md"
                                        tone="brand"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="truncate font-semibold text-foreground">
                                                {c.name ?? '-'}
                                            </h3>
                                            <span className="text-xs font-medium text-[var(--warning)]">
                                                ★ {Number(c.rating_avg).toFixed(1)} ({c.rating_count})
                                            </span>
                                        </div>
                                        <p className="line-clamp-1 text-sm text-muted-foreground">
                                            {c.headline ?? 'Tanpa headline'}
                                            {c.city ? ` · ${c.city}` : ''}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {c.verification_status === 'verified' ? (
                                                <StatusBadge label="Terverifikasi" tone="success" />
                                            ) : (
                                                <StatusBadge label="Belum terverifikasi" tone="neutral" />
                                            )}
                                            <StatusBadge
                                                label={`${c.portfolio_count} Portofolio`}
                                                tone="neutral"
                                            />
                                        </div>
                                        {c.skills.length > 0 ? (
                                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                                Keahlian: {c.skills.join(', ')}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </ResourceCard>
                        ))}
                    </div>
                )}

                {pagination ? (
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Halaman {pagination.current_page} dari {pagination.last_page} · Total{' '}
                        {pagination.total}
                    </p>
                ) : null}
            </div>
        </>
    );
}
