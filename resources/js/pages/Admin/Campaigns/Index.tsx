import { Form, Head, Link } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';
import { useClientTableSearch } from '@/hooks/use-client-table-search';
import { hide as hideCampaign } from '@/routes/admin/moderation/campaigns';
import { campaigns as campaignsIndex } from '@/routes/admin/moderation';

type Campaign = {
    id: number;
    title: string;
    umkm: string | null;
    status: string;
    is_hidden: boolean;
};

type Props = {
    campaigns: {
        data: Campaign[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
    filter?: string;
};

const FILTERS: { value: string; label: string }[] = [
    { value: 'visible', label: 'Tampil' },
    { value: 'hidden', label: 'Tersembunyi' },
    { value: 'all', label: 'Semua' },
];

export default function AdminCampaignsIndex({ campaigns, filter = 'visible' }: Props): ReactNode {
    const getSearchText = useCallback(
        (campaign: Campaign) => [campaign.title, campaign.umkm ?? '', campaign.status].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        campaigns.data,
        getSearchText,
    );

    return (
        <>
            <Head title="Moderasi Campaign" />
            <WorkspacePage
                description="Sembunyikan atau pulihkan campaign dari pencarian publik."
                title="Moderasi Campaign"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Judul',
                            cell: (c) => <p className="min-w-[12rem] font-medium">{c.title}</p>,
                        },
                        { header: 'UMKM', cell: (c) => c.umkm ?? '—' },
                        {
                            header: 'Status',
                            cell: (c) => <StatusBadge label={c.status} tone="neutral" />,
                        },
                        {
                            header: 'Visibilitas',
                            cell: (c) => (
                                <StatusBadge
                                    label={c.is_hidden ? 'Tersembunyi' : 'Tampil'}
                                    tone={c.is_hidden ? 'danger' : 'success'}
                                />
                            ),
                        },
                        {
                            header: 'Aksi',
                            className: 'text-right',
                            cell: (c) => (
                                <TableRowActions>
                                    <Form
                                        action={hideCampaign.url(c.id)}
                                        className="inline-flex"
                                        method="patch"
                                    >
                                        <Button size="sm" type="submit" variant="outline">
                                            {c.is_hidden ? 'Pulihkan' : 'Sembunyikan'}
                                        </Button>
                                    </Form>
                                </TableRowActions>
                            ),
                        },
                    ]}
                    emptyDescription="Tidak ada campaign pada filter ini."
                    emptyTitle="Tidak ada campaign"
                    filtersSlot={
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map((f) => (
                                <Button
                                    asChild
                                    key={f.value}
                                    size="sm"
                                    variant={filter === f.value ? 'default' : 'outline'}
                                >
                                    <Link
                                        href={campaignsIndex.url({ query: { status: f.value } })}
                                        preserveScroll
                                    >
                                        {f.label}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    }
                    getRowKey={(c) => c.id}
                    paginationLinks={campaigns.links}
                    rows={filteredRows}
                    search={{
                        onChange: setQuery,
                        placeholder: 'Cari judul, UMKM, atau status...',
                        resultCount,
                        totalCount,
                        value: query,
                    }}
                />
            </WorkspacePage>
        </>
    );
}