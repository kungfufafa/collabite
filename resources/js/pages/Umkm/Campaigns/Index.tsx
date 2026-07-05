import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import {
    TableDetailLink,
    TableEditLink,
    TableRowActions,
} from '@/components/app/table-row-actions';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';
import { useClientTableSearch } from '@/hooks/use-client-table-search';
import { create, edit } from '@/routes/umkm/campaigns';

type Campaign = {
    id: number;
    title: string;
    status: string;
    status_label: string;
    budget: string | null;
    deadline: string | null;
    is_hidden: boolean;
    pending_requests: number;
    has_collaboration: boolean;
    created_at: string;
};

function statusTone(status: string): 'success' | 'neutral' | 'danger' | 'info' | 'warning' {
    if (status === 'open') {
        return 'success';
    }

    if (status === 'draft') {
        return 'neutral';
    }

    if (status === 'cancelled') {
        return 'danger';
    }

    if (status === 'completed') {
        return 'info';
    }

    return 'warning';
}

function formatBudget(value: string | null): string {
    if (!value) {
        return '—';
    }

    return `Rp ${Number(value).toLocaleString('id-ID')}`;
}

function canEditCampaign(status: string): boolean {
    return status === 'draft' || status === 'open';
}

export default function Index({ campaigns }: { campaigns: { data: Campaign[] } | Campaign[] }): ReactNode {
    const list = Array.isArray(campaigns) ? campaigns : campaigns.data;
    const getSearchText = useCallback(
        (campaign: Campaign) =>
            [campaign.title, campaign.status_label, campaign.deadline ?? ''].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        list,
        getSearchText,
    );

    return (
        <>
            <Head title="Campaign" />
            <div>
                <PageHeader
                    title="Campaign"
                    description="Kelola semua campaign Anda di satu tempat."
                    actions={
                        <Button asChild>
                            <Link href={create().url}>
                                <Plus className="size-4" />
                                Buat Campaign
                            </Link>
                        </Button>
                    }
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            {
                                header: 'Judul',
                                cell: (c) => (
                                    <div className="min-w-[12rem]">
                                        <p className="font-medium text-foreground">{c.title}</p>
                                        {c.is_hidden ? (
                                            <p className="mt-0.5 text-xs text-destructive">
                                                Disembunyikan admin
                                            </p>
                                        ) : null}
                                    </div>
                                ),
                            },
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
                                header: 'Budget',
                                cell: (c) => formatBudget(c.budget),
                            },
                            {
                                header: 'Deadline',
                                cell: (c) => c.deadline ?? '—',
                            },
                            {
                                header: 'Pengajuan',
                                cell: (c) => (
                                    <span className="tabular-nums">{c.pending_requests}</span>
                                ),
                            },
                            {
                                header: 'Kolaborasi',
                                cell: (c) => (c.has_collaboration ? 'Aktif' : 'Belum ada'),
                            },
                            {
                                header: 'Aksi',
                                className: 'text-right',
                                cell: (c) => (
                                    <TableRowActions>
                                        <TableDetailLink href={`/umkm/campaigns/${c.id}`} />
                                        {canEditCampaign(c.status) ? (
                                            <TableEditLink href={edit(c.id).url} />
                                        ) : null}
                                    </TableRowActions>
                                ),
                            },
                        ]}
                        emptyDescription="Buat campaign untuk mulai menerima lamaran dari creator."
                        emptyTitle="Belum ada campaign"
                        getRowKey={(c) => c.id}
                        rows={filteredRows}
                        search={{
                            onChange: setQuery,
                            placeholder: 'Cari judul atau status campaign...',
                            resultCount,
                            totalCount,
                            value: query,
                        }}
                    />
                </div>
            </div>
        </>
    );
}
