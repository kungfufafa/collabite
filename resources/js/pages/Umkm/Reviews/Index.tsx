import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';

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

    return (
        <>
            <Head title="Review untuk UMKM" />
            <div>
                <PageHeader
                    title="Review"
                    description="Review yang diberikan Creator kepada Anda."
                />

                {list.length === 0 ? (
                    <div className="mt-8">
                        <ListEmptyState
                            description="Review akan muncul setelah kolaborasi selesai."
                            title="Belum ada review masuk"
                        />
                    </div>
                ) : (
                    <div className="mt-8 space-y-3">
                        {list.map((r) => (
                            <ResourceCard key={r.id}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {r.reviewer.name}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            <Link
                                                href={`/umkm/campaigns/${r.campaign.id}`}
                                                className="hover:text-foreground hover:underline"
                                            >
                                                {r.campaign.title}
                                            </Link>{' '}
                                            · {r.created_at}
                                        </p>
                                    </div>
                                    <StatusBadge label={`${r.rating}/5`} tone="info" />
                                </div>
                                {r.body ? (
                                    <p className="mt-3 text-sm text-muted-foreground">{r.body}</p>
                                ) : null}
                            </ResourceCard>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
