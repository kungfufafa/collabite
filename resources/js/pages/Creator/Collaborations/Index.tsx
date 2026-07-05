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
    creator?: { id: number; name: string };
    status: string;
    status_label: string;
    payment_status_label?: string | null;
    started_at?: string | null;
};

function statusTone(status: string): 'success' | 'neutral' | 'danger' | 'info' | 'warning' {
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

export default function Index({
    collaborations,
}: {
    collaborations: { data: Collaboration[] } | Collaboration[];
}): ReactNode {
    const list = Array.isArray(collaborations) ? collaborations : collaborations.data;
    const getSearchText = useCallback(
        (collaboration: Collaboration) =>
            [collaboration.campaign.title, collaboration.umkm.name, collaboration.status_label].join(
                ' ',
            ),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        list,
        getSearchText,
    );

    return (
        <>
            <Head title="Kolaborasi" />
            <WorkspacePage
                description="Campaign yang sedang atau pernah Anda kerjakan."
                title="Kolaborasi"
            >
                <WorkspaceTable
                        columns={[
                            {
                                header: 'Campaign',
                                cell: (c) => (
                                    <p className="min-w-[12rem] font-medium text-foreground">
                                        {c.campaign.title}
                                    </p>
                                ),
                            },
                            {
                                header: 'UMKM',
                                cell: (c) => c.umkm.name,
                            },
                            {
                                header: 'Status',
                                cell: (c) => (
                                    <div className="flex flex-col gap-1">
                                        <StatusBadge
                                            label={c.status_label}
                                            tone={statusTone(c.status)}
                                        />
                                        {c.payment_status_label ? (
                                            <span className="text-xs text-muted-foreground">
                                                {c.payment_status_label}
                                            </span>
                                        ) : null}
                                    </div>
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
                                            href={`/creator/collaborations/${c.id}`}
                                        />
                                    </TableRowActions>
                                ),
                            },
                        ]}
                        emptyDescription="Mulai dengan melamar campaign atau menerima undangan UMKM."
                        emptyTitle="Belum ada kolaborasi"
                        getRowKey={(c) => c.id}
                        rows={filteredRows}
                        search={{
                            onChange: setQuery,
                            placeholder: 'Cari campaign atau UMKM...',
                            resultCount,
                            totalCount,
                            value: query,
                        }}
                    />
            </WorkspacePage>
        </>
    );
}
