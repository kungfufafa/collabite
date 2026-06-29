import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';

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
    return (
        <>
            <Head title="Kolaborasi" />
            <div>
                <PageHeader
                    description="Oversight admin untuk seluruh kolaborasi platform."
                    title="Daftar Kolaborasi"
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            { header: 'Campaign', cell: (c) => c.campaign.title },
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
                                header: '',
                                className: 'text-right',
                                cell: (c) => (
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/admin/collaborations/${c.id}`}>
                                            Buka
                                        </Link>
                                    </Button>
                                ),
                            },
                        ]}
                        emptyDescription="Kolaborasi akan muncul setelah UMKM dan Creator bekerja sama."
                        emptyTitle="Belum ada kolaborasi"
                        getRowKey={(c) => c.id}
                        rows={collaborations.data}
                    />
                </div>
            </div>
        </>
    );
}
