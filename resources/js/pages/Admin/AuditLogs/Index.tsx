import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { WorkspacePage } from '@/components/app/workspace-page';
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
        total?: number;
    };
    filters?: {
        q?: string | null;
        action?: string | null;
        actor_id?: string | null;
    };
};

function formatTimestamp(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function metadataSummary(metadata: Record<string, unknown> | null): string | null {
    if (!metadata) {
        return null;
    }

    const actorName = metadata.actor_name;
    const subjectLabel = metadata.subject_label;

    const parts = [
        typeof actorName === 'string' ? actorName : null,
        typeof subjectLabel === 'string' ? subjectLabel : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : null;
}

export default function AdminAuditLogsIndex({ logs, filters }: Props): ReactNode {
    const [query, setQuery] = useState(filters?.q ?? '');

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.get(
            '/admin/audit-logs',
            {
                q: query || undefined,
                action: filters?.action || undefined,
                actor_id: filters?.actor_id || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Audit Log" />
            <WorkspacePage
                description="Catatan aktivitas append-only untuk oversight."
                title="Audit Log"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Waktu',
                            cell: (log) => (
                                <span className="whitespace-nowrap tabular-nums">
                                    {formatTimestamp(log.created_at)}
                                </span>
                            ),
                        },
                        {
                            header: 'Aksi',
                            cell: (log) => (
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    {log.action}
                                </code>
                            ),
                        },
                        {
                            header: 'Actor',
                            cell: (log) => (
                                <div>
                                    <p className="font-medium">
                                        #{log.actor_id ?? '—'}
                                        {log.actor_role ? ` (${log.actor_role})` : ''}
                                    </p>
                                    {metadataSummary(log.metadata) ? (
                                        <p className="text-xs text-muted-foreground">
                                            {metadataSummary(log.metadata)}
                                        </p>
                                    ) : null}
                                </div>
                            ),
                        },
                        {
                            header: 'Subject',
                            cell: (log) =>
                                log.subject_type
                                    ? `${log.subject_type}#${log.subject_id}`
                                    : '—',
                        },
                    ]}
                    emptyDescription={
                        filters?.q
                            ? 'Tidak ada log yang cocok dengan pencarian Anda.'
                            : 'Aktivitas sistem akan tercatat di sini.'
                    }
                    emptyTitle={
                        filters?.q ? 'Hasil pencarian kosong' : 'Belum ada aktivitas tercatat'
                    }
                    getRowKey={(log) => log.id}
                    paginationLinks={logs.links}
                    rows={logs.data}
                    search={{
                        onChange: setQuery,
                        onSubmit: handleSearchSubmit,
                        placeholder: 'Cari aksi, actor, subject, atau ID...',
                        resultCount: logs.data.length,
                        totalCount: logs.total ?? logs.data.length,
                        value: query,
                    }}
                />
            </WorkspacePage>
        </>
    );
}
