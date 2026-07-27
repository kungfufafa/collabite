import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { index as auditLogsIndex } from '@/routes/admin/audit-logs';

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

/**
 * Ringkas metadata audit menjadi satu baris konteks yang dibaca manusia.
 * Ambil field-field yang paling sering diisi oleh AuditLogger (actor_name,
 * subject_label, collaboration_id, version, previous_status) supaya admin
 * cepat memahami konteks tanpa membuka raw JSON.
 */
function metadataSummary(metadata: Record<string, unknown> | null): string | null {
    if (!metadata) {
        return null;
    }

    const pick = (key: string): string | null => {
        const value = metadata[key];

        return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
    };

    const parts = [
        pick('actor_name'),
        pick('subject_label'),
        pick('collaboration_id') !== null ? `collab #${metadata.collaboration_id}` : null,
        pick('version') !== null ? `v${metadata.version}` : null,
        pick('previous_status') !== null ? `${metadata.previous_status}` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : null;
}

function subjectLabel(log: Log): string {
    if (!log.subject_type) {
        return '—';
    }

    return log.subject_id !== null ? `${log.subject_type}#${log.subject_id}` : log.subject_type;
}

export default function AdminAuditLogsIndex({ logs, filters }: Props): ReactNode {
    const [query, setQuery] = useState(filters?.q ?? '');

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.get(
            auditLogsIndex.url(),
            {
                q: query || undefined,
                action: filters?.action || undefined,
                actor_id: filters?.actor_id || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const summaryByLog = useMemo(() => {
        const map: Record<number, string | null> = {};

        for (const log of logs.data) {
            map[log.id] = metadataSummary(log.metadata);
        }

        return map;
    }, [logs.data]);

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
                                    {summaryByLog[log.id] ? (
                                        <p className="text-xs text-muted-foreground">
                                            {summaryByLog[log.id]}
                                        </p>
                                    ) : null}
                                </div>
                            ),
                        },
                        {
                            header: 'Subject',
                            cell: (log) => subjectLabel(log),
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