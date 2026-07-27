import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

import { PageActionGroup } from '@/components/app/page-action-group';
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
import { create, edit, index as campaignsIndex } from '@/routes/umkm/campaigns';

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

function isPendingFocus(url: string): boolean {
    const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';

    return new URLSearchParams(query).get('pending') === '1';
}

export default function Index({ campaigns }: { campaigns: { data: Campaign[] } | Campaign[] }): ReactNode {
    const pageUrl = usePage().url;
    const focusPending = isPendingFocus(pageUrl);
    const list = Array.isArray(campaigns) ? campaigns : campaigns.data;
    const scopedList = useMemo(() => {
        if (!focusPending) {
            return list;
        }

        return [...list]
            .filter((campaign) => campaign.pending_requests > 0)
            .sort((a, b) => b.pending_requests - a.pending_requests);
    }, [focusPending, list]);
    const getSearchText = useCallback(
        (campaign: Campaign) =>
            [campaign.title, campaign.status_label, campaign.deadline ?? ''].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        scopedList,
        getSearchText,
    );

    return (
        <>
            <Head title={focusPending ? 'Lamaran menunggu' : 'Campaign'} />
            <div>
                <PageHeader
                    title={focusPending ? 'Lamaran menunggu' : 'Campaign'}
                    description={
                        focusPending
                            ? 'Buka campaign untuk meninjau dan menerima atau menolak lamaran creator.'
                            : 'Kelola semua campaign Anda di satu tempat.'
                    }
                    actions={
                        <PageActionGroup>
                            {focusPending ? (
                                <Button asChild variant="outline">
                                    <Link href={campaignsIndex().url}>Semua campaign</Link>
                                </Button>
                            ) : null}
                            <Button asChild>
                                <Link href={create().url}>
                                    <Plus className="size-4" />
                                    Buat Campaign
                                </Link>
                            </Button>
                        </PageActionGroup>
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
                                header: 'Lamaran menunggu',
                                cell: (c) =>
                                    c.pending_requests > 0 ? (
                                        <StatusBadge
                                            label={`${c.pending_requests} menunggu`}
                                            tone="warning"
                                        />
                                    ) : (
                                        <span className="text-muted-foreground">0</span>
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
                        emptyAction={
                            focusPending ? (
                                <Button asChild variant="outline">
                                    <Link href={campaignsIndex().url}>Semua campaign</Link>
                                </Button>
                            ) : (
                                <Button asChild>
                                    <Link href={create().url}>
                                        <Plus className="size-4" />
                                        Buat Campaign
                                    </Link>
                                </Button>
                            )
                        }
                        emptyDescription={
                            focusPending
                                ? 'Tidak ada campaign dengan lamaran yang menunggu tinjauan. Undang creator dari Cari Creator jika perlu.'
                                : 'Buat campaign untuk mulai menerima lamaran dari creator.'
                        }
                        emptyTitle={
                            focusPending ? 'Tidak ada lamaran menunggu' : 'Belum ada campaign'
                        }
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
