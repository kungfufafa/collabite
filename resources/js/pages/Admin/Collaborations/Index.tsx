import { Head } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableDetailLink, TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { useClientTableSearch } from '@/hooks/use-client-table-search';

type Collaboration = {
    id: number;
    campaign: { id: number; title: string };
    umkm: { id: number; name: string };
    creator: { id: number; name: string };
    status: string;
    status_label: string;
    started_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    cancelled_reason: string | null;
};

type Props = {
    collaborations: {
        data: Collaboration[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
};

function statusTone(status: string): 'success' | 'info' | 'danger' | 'warning' {
    if (status === 'active') {
        return 'success';
    }

    if (status === 'completed') {
        return 'info';
    }

    if (status === 'cancelled') {
        return 'danger';
    }

    return 'warning';
}

export default function AdminCollaborationsIndex({
    collaborations,
}: Props): ReactNode {
    const getSearchText = useCallback(
        (collaboration: Collaboration) =>
            [
                collaboration.campaign.title,
                collaboration.umkm.name,
                collaboration.creator.name,
                collaboration.status_label,
            ].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        collaborations.data,
        getSearchText,
    );

    return (
        <>
            <Head title="Kolaborasi" />
            <WorkspacePage
                description="Oversight admin untuk seluruh kolaborasi platform."
                title="Daftar Kolaborasi"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Campaign',
                            cell: (c) => (
                                <p className="min-w-[10rem] font-medium">{c.campaign.title}</p>
                            ),
                        },
                        { header: 'UMKM', cell: (c) => c.umkm.name },
                        { header: 'Creator', cell: (c) => c.creator.name },
                        {
                            header: 'Status',
                            cell: (c) => (
                                <StatusBadge
                                    label={c.status_label}
                                    tone={statusTone(c.status)}
                                />
                            ),
                        },
                        {
                            header: 'Dimulai',
                            cell: (c) => c.started_at ?? '—',
                        },
                        {
                            header: 'Aksi',
                            className: 'text-right',
                            cell: (c) => (
                                <TableRowActions>
                                    <TableDetailLink
                                        href={`/admin/collaborations/${c.id}`}
                                    />
                                </TableRowActions>
                            ),
                        },
                    ]}
                    emptyDescription="Kolaborasi akan muncul setelah UMKM dan Creator bekerja sama."
                    emptyTitle="Belum ada kolaborasi"
                    getRowKey={(c) => c.id}
                    paginationLinks={collaborations.links}
                    rows={filteredRows}
                    search={{
                        onChange: setQuery,
                        placeholder: 'Cari campaign, UMKM, atau creator...',
                        resultCount,
                        totalCount,
                        value: query,
                    }}
                />
            </WorkspacePage>
        </>
    );
}
