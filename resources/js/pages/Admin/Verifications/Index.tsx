import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';

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

    return (
        <>
            <Head title="Antrian Verifikasi" />
            <div>
                <PageHeader
                    description={`${pagination.total} pengajuan terdaftar. Pending ditampilkan di paling atas.`}
                    title="Antrian Verifikasi Creator"
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            {
                                header: 'Creator',
                                cell: (v) => (
                                    <div>
                                        <p className="font-medium">
                                            {v.creator.name ?? '—'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
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
                                cell: (v) => v.documents_count,
                            },
                            {
                                header: 'Diajukan',
                                cell: (v) => v.submitted_at ?? '—',
                            },
                            {
                                header: '',
                                className: 'text-right',
                                cell: (v) => (
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/admin/verifications/${v.id}`}>
                                            Tinjau
                                        </Link>
                                    </Button>
                                ),
                            },
                        ]}
                        emptyDescription="Tidak ada pengajuan verifikasi saat ini."
                        emptyTitle="Tidak ada pengajuan"
                        getRowKey={(v) => v.id}
                        rows={rows}
                    />
                </div>
            </div>
        </>
    );
}
