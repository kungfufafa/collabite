import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { FilterPanel } from '@/components/app/filter-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { TableDetailLink, TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { brutalSelectField } from '@/components/collabite/landing/brutal-styles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as creatorCampaignsIndex, show as creatorCampaignShow } from '@/routes/creator/campaigns';

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
        return 'Fleksibel';
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
            <WorkspacePage
                description="Temukan campaign UMKM yang sesuai keahlian dan kategori konten Anda."
                title="Cari Campaign"
            >
                <FilterPanel title="Filter & Pencarian">
                        <form
                            action={creatorCampaignsIndex.url()}
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            method="GET"
                        >
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <Label htmlFor="q">Kata kunci</Label>
                                <Input
                                    defaultValue={filters.q ?? ''}
                                    id="q"
                                    name="q"
                                    placeholder="Judul, deskripsi, atau nama UMKM"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="category_id">Kategori</Label>
                                <select
                                    className={brutalSelectField + ' h-11'}
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

                <WorkspaceTable
                        columns={[
                            {
                                header: 'Judul',
                                headClassName: 'w-[26%]',
                                className: 'whitespace-normal',
                                cell: (c) => (
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-foreground">
                                            {c.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                            {c.description}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                header: 'UMKM',
                                headClassName: 'w-[16%]',
                                className: 'whitespace-normal',
                                cell: (c) => (
                                    <div className="min-w-0">
                                        <p className="truncate">{c.umkm.name ?? '—'}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {c.umkm.city ?? '—'}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                header: 'Kategori',
                                headClassName: 'w-[12%]',
                                className: 'truncate',
                                cell: (c) => c.category ?? '—',
                            },
                            {
                                header: 'Budget',
                                headClassName: 'w-[14%]',
                                className: 'truncate',
                                cell: (c) => formatBudget(c.budget),
                            },
                            {
                                header: 'Deadline',
                                headClassName: 'w-[12%]',
                                className: 'truncate',
                                cell: (c) => c.deadline ?? '—',
                            },
                            {
                                header: 'Status',
                                headClassName: 'w-[10%]',
                                cell: () => <StatusBadge label="Terbuka" tone="success" />,
                            },
                            {
                                header: 'Aksi',
                                headClassName: 'w-[10%]',
                                className: 'text-right',
                                cell: (c) => (
                                    <TableRowActions>
                                        <TableDetailLink href={creatorCampaignShow.url({ campaign: c.id })} />
                                    </TableRowActions>
                                ),
                            },
                        ]}
                        emptyDescription="Coba ubah filter atau cek lagi nanti."
                        emptyTitle="Belum ada campaign yang cocok"
                        getRowKey={(c) => c.id}
                        rows={list}
                    />
            </WorkspacePage>
        </>
    );
}
