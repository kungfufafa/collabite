import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';

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
    return (
        <>
            <Head title="Moderasi Review" />
            <div>
                <PageHeader
                    description="Review tersembunyi dapat dipulihkan agar tampil kembali di profil publik."
                    title="Moderasi Review"
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            { header: 'Reviewer', cell: (r) => r.reviewer.name },
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
                                header: 'Aksi',
                                className: 'text-right',
                                cell: (r) => (
                                    <Form
                                        action={`/admin/moderation/reviews/${r.id}/hide`}
                                        className="inline-flex"
                                        method="patch"
                                    >
                                        <Button size="sm" type="submit" variant="outline">
                                            Pulihkan
                                        </Button>
                                    </Form>
                                ),
                            },
                        ]}
                        emptyDescription="Semua review saat ini terlihat normal."
                        emptyTitle="Tidak ada review tersembunyi"
                        getRowKey={(r) => r.id}
                        rows={reviews.data}
                    />
                </div>
            </div>
        </>
    );
}
