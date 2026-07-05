import { Form, Head } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';
import { useClientTableSearch } from '@/hooks/use-client-table-search';

type Review = {
    id: number;
    rating: number;
    body: string | null;
    reviewer: { id: number; name: string };
    reviewee: { id: number; name: string };
    is_hidden: boolean;
};

type Props = {
    reviews: {
        data: Review[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
};

export default function AdminReviewsIndex({ reviews }: Props): ReactNode {
    const getSearchText = useCallback(
        (review: Review) =>
            [
                review.reviewer.name,
                review.reviewee.name,
                review.body ?? '',
                String(review.rating),
            ].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        reviews.data,
        getSearchText,
    );

    return (
        <>
            <Head title="Moderasi Review" />
            <WorkspacePage
                description="Review tersembunyi dapat dipulihkan agar tampil kembali di profil publik."
                title="Moderasi Review"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Reviewer',
                            cell: (r) => r.reviewer.name,
                        },
                        { header: 'Reviewee', cell: (r) => r.reviewee.name },
                        {
                            header: 'Rating',
                            cell: (r) => (
                                <StatusBadge
                                    label={`★ ${r.rating}/5`}
                                    tone="warning"
                                />
                            ),
                        },
                        {
                            header: 'Ulasan',
                            cell: (r) => (
                                <span className="line-clamp-3 max-w-md whitespace-pre-line">
                                    {r.body ?? '—'}
                                </span>
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
                            cell: (r) => (
                                <TableRowActions>
                                    <Form
                                        action={`/admin/moderation/reviews/${r.id}/hide`}
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
                    emptyDescription="Semua review saat ini terlihat normal."
                    emptyTitle="Tidak ada review tersembunyi"
                    getRowKey={(r) => r.id}
                    paginationLinks={reviews.links}
                    rows={filteredRows}
                    search={{
                        onChange: setQuery,
                        placeholder: 'Cari reviewer, reviewee, atau ulasan...',
                        resultCount,
                        totalCount,
                        value: query,
                    }}
                />
            </WorkspacePage>
        </>
    );
}
