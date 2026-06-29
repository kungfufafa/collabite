import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { index as creatorCampaignsIndex } from '@/routes/creator/campaigns';

type Collaboration = {
    id: number;
    campaign: { id: number; title: string };
    umkm: { id: number; name: string };
    creator?: { id: number; name: string };
    status: string;
    status_label: string;
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

    return (
        <>
            <Head title="Kolaborasi" />
            <div>
                <PageHeader
                    title="Kolaborasi"
                    description="Campaign yang sedang atau pernah kamu kerjakan."
                />

                {list.length === 0 ? (
                    <div className="mt-8">
                        <ListEmptyState
                            action={
                                <Button asChild>
                                    <Link href={creatorCampaignsIndex().url}>
                                        Cari Campaign
                                    </Link>
                                </Button>
                            }
                            description="Mulai dengan melamar campaign atau menerima undangan UMKM."
                            title="Belum ada kolaborasi"
                        />
                    </div>
                ) : (
                    <div className="mt-8 flex flex-col gap-3">
                        {list.map((c) => (
                            <ResourceCard
                                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                                key={c.id}
                            >
                                <div className="min-w-0">
                                    <Link
                                        className="text-base font-semibold text-foreground hover:underline"
                                        href={`/creator/collaborations/${c.id}`}
                                    >
                                        {c.campaign.title}
                                    </Link>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        UMKM: {c.umkm.name}
                                        {c.started_at ? ` · Dimulai ${c.started_at}` : ''}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <StatusBadge
                                        label={c.status_label}
                                        tone={statusTone(c.status)}
                                    />
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/creator/collaborations/${c.id}`}>
                                            Buka workspace
                                        </Link>
                                    </Button>
                                </div>
                            </ResourceCard>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
