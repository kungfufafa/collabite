import { Form, Head, Link } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';
import { useClientTableSearch } from '@/hooks/use-client-table-search';
import { hide as hideReview } from '@/routes/admin/moderation/reviews';
import { reviews as reviewsIndex } from '@/routes/admin/moderation';

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
    filter?: string;
};

const FILTERS: { value: string; label: string }[] = [
    { value: 'visible', label: 'Tampil' },
    { value: 'hidden', label: 'Tersembunyi' },
    { value: 'all', label: 'Semua' },
];

export default function AdminReviewsIndex({ reviews, filter = 'visible' }: Props): ReactNode {
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
                description="Sembunyikan atau pulihkan review agar tampil kembali di profil publik."
                title="Moderasi Review"
            >
                <WorkspaceTable
                    columns={[
                        { header: 'Reviewer', cell: (r) => r.reviewer.name },
                        { header: 'Reviewee', cell: (r) => r.reviewee.name },
                        {
                            header: 'Rating',
                            cell: (r) => (
                                <StatusBadge label={`★ ${r.rating}/5`} tone="warning" />
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
                            cell: (r) => (
                                <StatusBadge
                                    label={r.is_hidden ? 'Tersembunyi' : 'Tampil'}
                                    tone={r.is_hidden ? 'danger' : 'success'}
                                />
                            ),
                        },
                        {
                            header: 'Aksi',
                            className: 'text-right',
                            cell: (r) => (
                                <TableRowActions>
                                    <Form
                                        action={hideReview.url(r.id)}
                                        className="inline-flex"
                                        method="patch"
                                    >
                                        <Button size="sm" type="submit" variant="outline">
                                            {r.is_hidden ? 'Pulihkan' : 'Sembunyikan'}
                                        </Button>
                                    </Form>
                                </TableRowActions>
                            ),
                        },
                    ]}
                    emptyDescription="Tidak ada review pada filter ini."
                    emptyTitle="Tidak ada review"
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
                                        href={reviewsIndex.url({ query: { status: f.value } })}
                                        preserveScroll
                                    >
                                        {f.label}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    }
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