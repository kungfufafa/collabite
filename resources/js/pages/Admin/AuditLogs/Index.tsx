import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { WorkspaceTable } from '@/components/app/workspace-table';

type Log = {
    id: number;
    actor_id: number | null;
    actor_role: string | null;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
};

type Props = {
    logs: {
        data: Log[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
};

export default function AdminAuditLogsIndex({ logs }: Props): ReactNode {
    return (
        <>
            <Head title="Audit Log" />
            <div>
                <PageHeader
                    description="Catatan aktivitas append-only untuk oversight."
                    title="Audit Log"
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            {
                                header: 'Waktu',
                                cell: (log) => log.created_at ?? '—',
                            },
                            { header: 'Aksi', cell: (log) => log.action },
                            {
                                header: 'Actor',
                                cell: (log) =>
                                    `#${log.actor_id ?? '-'} ${log.actor_role ? `(${log.actor_role})` : ''}`,
                            },
                            {
                                header: 'Subject',
                                cell: (log) =>
                                    log.subject_type
                                        ? `${log.subject_type}#${log.subject_id}`
                                        : '—',
                            },
                        ]}
                        emptyDescription="Aktivitas sistem akan tercatat di sini."
                        emptyTitle="Belum ada aktivitas tercatat"
                        getRowKey={(log) => log.id}
                        rows={logs.data}
                    />
                </div>
            </div>
        </>
    );
}
