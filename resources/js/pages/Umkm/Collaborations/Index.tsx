import { Head } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { TableDetailLink, TableRowActions } from '@/components/app/table-row-actions';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { useClientTableSearch } from '@/hooks/use-client-table-search';

type Collaboration = {
    id: number;
    campaign: { id: number; title: string };
    umkm: { id: number; name: string };
    creator?: { id: number; name: string };
    status: string;
    status_label: string;
    started_at?: string | null;
    completed_at?: string | null;
    cancelled_at?: string | null;
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
            [
                collaboration.campaign.title,
                collaboration.creator?.name ?? collaboration.umkm.name,
                collaboration.status_label,
            ].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        list,
        getSearchText,
    );

    return (
        <>
            <Head title="Kolaborasi" />
            <div>
                <PageHeader
                    title="Kolaborasi"
                    description="Daftar kolaborasi aktif dan riwayat kolaborasi Anda."
                />

                <div className="mt-8">
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
                                header: 'Creator',
                                cell: (c) => c.creator?.name ?? '—',
                            },
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
                                            href={`/umkm/collaborations/${c.id}`}
                                        />
                                    </TableRowActions>
                                ),
                            },
                        ]}
                        emptyDescription="Kolaborasi muncul setelah lamaran diterima atau undangan disetujui."
                        emptyTitle="Belum ada kolaborasi"
                        getRowKey={(c) => c.id}
                        rows={filteredRows}
                        search={{
                            onChange: setQuery,
                            placeholder: 'Cari campaign atau creator...',
                            resultCount,
                            totalCount,
                            value: query,
                        }}
                    />
                </div>
            </div>
        </>
    );
}
