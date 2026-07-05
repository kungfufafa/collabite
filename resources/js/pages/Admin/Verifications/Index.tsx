import { Head } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableActionLink, TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { useClientTableSearch } from '@/hooks/use-client-table-search';

type Verification = {
    id: number;
    status: string;
    submitted_at: string | null;
    creator: { id: number | null; name: string | null; email: string | null };
    documents_count: number;
};

type Props = {
    verifications: {
        data: Verification[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
    pagination: { current_page: number; last_page: number; per_page: number; total: number };
};

function statusTone(status: string): 'warning' | 'success' | 'danger' | 'neutral' {
    if (status === 'pending') {
        return 'warning';
    }

    if (status === 'verified') {
        return 'success';
    }

    if (status === 'rejected') {
        return 'danger';
    }

    return 'neutral';
}

export default function Index({ verifications, pagination }: Props): ReactNode {
    const rows = verifications.data ?? [];
    const getSearchText = useCallback(
        (verification: Verification) =>
            [
                verification.creator.name ?? '',
                verification.creator.email ?? '',
                verification.status,
            ].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        rows,
        getSearchText,
    );

    return (
        <>
            <Head title="Antrian Verifikasi" />
            <WorkspacePage
                description={`${pagination.total} pengajuan terdaftar. Pending ditampilkan di paling atas.`}
                title="Antrian Verifikasi Creator"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Creator',
                            cell: (v) => (
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {v.creator.name ?? '—'}
                                    </p>
                                    <p className="break-all text-xs text-muted-foreground">
                                        {v.creator.email}
                                    </p>
                                </div>
                            ),
                        },
                        {
                            header: 'Status',
                            cell: (v) => (
                                <StatusBadge
                                    label={v.status}
                                    tone={statusTone(v.status)}
                                />
                            ),
                        },
                        {
                            header: 'Berkas',
                            cell: (v) => (
                                <span className="tabular-nums">{v.documents_count}</span>
                            ),
                        },
                        {
                            header: 'Diajukan',
                            cell: (v) => v.submitted_at ?? '—',
                        },
                        {
                            header: 'Aksi',
                            className: 'text-right',
                            cell: (v) => (
                                <TableRowActions>
                                    <TableActionLink
                                        href={`/admin/verifications/${v.id}`}
                                        label="Tinjau"
                                    />
                                </TableRowActions>
                            ),
                        },
                    ]}
                    emptyDescription="Tidak ada pengajuan verifikasi saat ini."
                    emptyTitle="Tidak ada pengajuan"
                    getRowKey={(v) => v.id}
                    paginationLinks={verifications.links}
                    rows={filteredRows}
                    search={{
                        onChange: setQuery,
                        placeholder: 'Cari creator atau email...',
                        resultCount,
                        totalCount,
                        value: query,
                    }}
                />
            </WorkspacePage>
        </>
    );
}
