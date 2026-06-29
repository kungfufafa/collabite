import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { FilterPanel } from '@/components/app/filter-panel';
import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Campaign = {
    id: number;
    title: string;
    description: string;
    budget: string | null;
    deadline: string | null;
    category: string | null;
    umkm: { name: string | null; city: string | null };
    published_at: string | null;
};

function formatBudget(value: string | null): string {
    if (!value) {
        return 'Budget fleksibel';
    }

    return 'Rp ' + Number(value).toLocaleString('id-ID');
}

export default function Index({
    campaigns,
    categories,
    filters,
}: {
    campaigns: { data: Campaign[] } | Campaign[];
    categories: { id: number; name: string }[];
    filters: { q: string; category_id: string | null; min_budget: string | null; max_budget: string | null };
}): ReactNode {
    const list = Array.isArray(campaigns) ? campaigns : campaigns.data;

    return (
        <>
            <Head title="Cari Campaign" />
            <div>
                <PageHeader
                    description="Temukan campaign UMKM yang sesuai untuk Anda."
                    title="Cari Campaign"
                />

                <div className="mt-8">
                    <FilterPanel>
                        <form
                            action="/creator/campaigns"
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            method="GET"
                        >
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="q">Kata kunci</Label>
                                <Input
                                    defaultValue={filters.q ?? ''}
                                    id="q"
                                    name="q"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="category_id">Kategori</Label>
                                <select
                                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    defaultValue={filters.category_id ?? ''}
                                    id="category_id"
                                    name="category_id"
                                >
                                    <option value="">Semua</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="min_budget">Budget min</Label>
                                <Input
                                    defaultValue={filters.min_budget ?? ''}
                                    id="min_budget"
                                    name="min_budget"
                                    type="number"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="max_budget">Budget max</Label>
                                <Input
                                    defaultValue={filters.max_budget ?? ''}
                                    id="max_budget"
                                    name="max_budget"
                                    type="number"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4">
                                <Button type="submit">Terapkan filter</Button>
                            </div>
                        </form>
                    </FilterPanel>
                </div>

                {list.length === 0 ? (
                    <div className="mt-8">
                        <ListEmptyState
                            description="Coba ubah filter atau cek lagi nanti."
                            title="Belum ada campaign yang cocok"
                        />
                    </div>
                ) : (
                    <div className="mt-8 flex flex-col gap-3">
                        {list.map((c) => (
                            <ResourceCard key={c.id}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <Link
                                            className="text-base font-semibold text-foreground hover:underline"
                                            href={`/creator/campaigns/${c.id}`}
                                        >
                                            {c.title}
                                        </Link>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {c.umkm.name ?? 'UMKM'} · {c.umkm.city ?? '-'} ·{' '}
                                            {c.category ?? 'Tanpa kategori'} ·{' '}
                                            {formatBudget(c.budget)}
                                            {c.deadline ? ` · Deadline ${c.deadline}` : ''}
                                        </p>
                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                            {c.description}
                                        </p>
                                    </div>
                                    <StatusBadge label="Terbuka" tone="success" />
                                </div>
                            </ResourceCard>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
