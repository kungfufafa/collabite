import { Head, Link } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { TableDetailLink, TableRowActions } from '@/components/app/table-row-actions';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { useClientTableSearch } from '@/hooks/use-client-table-search';

type Review = {
    id: number;
    rating: number;
    body: string | null;
    reviewer: { id: number; name: string };
    campaign: { id: number; title: string };
    created_at: string;
};

export default function Index({ reviews }: { reviews: { data: Review[] } | Review[] }): ReactNode {
    const list = Array.isArray(reviews) ? reviews : reviews.data;
    const getSearchText = useCallback(
        (review: Review) =>
            [review.reviewer.name, review.campaign.title, review.body ?? ''].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        list,
        getSearchText,
    );

    return (
        <>
            <Head title="Review untuk UMKM" />
            <div>
                <PageHeader
                    title="Review"
                    description="Review yang diberikan Creator kepada Anda."
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            {
                                header: 'Reviewer',
                                cell: (r) => (
                                    <p className="font-medium text-foreground">{r.reviewer.name}</p>
                                ),
                            },
                            {
                                header: 'Campaign',
                                cell: (r) => (
                                    <Link
                                        className="text-foreground hover:underline"
                                        href={`/umkm/campaigns/${r.campaign.id}`}
                                    >
                                        {r.campaign.title}
                                    </Link>
                                ),
                            },
                            {
                                header: 'Rating',
                                cell: (r) => (
                                    <StatusBadge label={`${r.rating}/5`} tone="info" />
                                ),
                            },
                            {
                                header: 'Ulasan',
                                cell: (r) => (
                                    <p className="max-w-md truncate text-muted-foreground">
                                        {r.body ?? '—'}
                                    </p>
                                ),
                            },
                            {
                                header: 'Tanggal',
                                cell: (r) => r.created_at,
                            },
                            {
                                header: 'Aksi',
                                className: 'text-right',
                                cell: (r) => (
                                    <TableRowActions>
                                        <TableDetailLink
                                            href={`/umkm/campaigns/${r.campaign.id}`}
                                        />
                                    </TableRowActions>
                                ),
                            },
                        ]}
                        emptyDescription="Review akan muncul setelah kolaborasi selesai."
                        emptyTitle="Belum ada review masuk"
                        getRowKey={(r) => r.id}
                        rows={filteredRows}
                        search={{
                            onChange: setQuery,
                            placeholder: 'Cari reviewer atau campaign...',
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
