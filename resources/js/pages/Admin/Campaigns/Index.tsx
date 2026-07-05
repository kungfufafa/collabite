import { Form, Head } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';
import { useClientTableSearch } from '@/hooks/use-client-table-search';

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
};

export default function AdminCampaignsIndex({ campaigns }: Props): ReactNode {
    const getSearchText = useCallback(
        (campaign: Campaign) =>
            [campaign.title, campaign.umkm ?? '', campaign.status].join(' '),
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
                description="Campaign yang disembunyikan dapat dipulihkan."
                title="Moderasi Campaign"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Judul',
                            cell: (c) => (
                                <p className="min-w-[12rem] font-medium">{c.title}</p>
                            ),
                        },
                        { header: 'UMKM', cell: (c) => c.umkm ?? '—' },
                        {
                            header: 'Status',
                            cell: (c) => (
                                <StatusBadge label={c.status} tone="neutral" />
                            ),
                        },
                        {
                            header: 'Visibilitas',
                            cell: () => (
                                <StatusBadge label="Tersembunyi" tone="danger" />
                            ),
                        },
                        {
                            header: 'Aksi',
                            className: 'text-right',
                            cell: (c) => (
                                <TableRowActions>
                                    <Form
                                        action={`/admin/moderation/campaigns/${c.id}/hide`}
                                        className="inline-flex"
                                        method="patch"
                                    >
                                        <Button size="sm" type="submit" variant="outline">
                                            Pulihkan
                                        </Button>
                                    </Form>
                                </TableRowActions>
                            ),
                        },
                    ]}
                    emptyDescription="Semua campaign saat ini terlihat normal."
                    emptyTitle="Tidak ada campaign tersembunyi"
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
