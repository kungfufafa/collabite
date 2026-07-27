import { Form, Head, Link } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';
import { useClientTableSearch } from '@/hooks/use-client-table-search';
import { hide as hideContent } from '@/routes/admin/moderation/content';
import { content as contentIndex } from '@/routes/admin/moderation';

type Submission = {
    id: number;
    version: number;
    title: string;
    campaign: string;
    creator: string;
    is_hidden: boolean;
};

type Props = {
    submissions: {
        data: Submission[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
    filter?: string;
};

const FILTERS: { value: string; label: string }[] = [
    { value: 'visible', label: 'Tampil' },
    { value: 'hidden', label: 'Tersembunyi' },
    { value: 'all', label: 'Semua' },
];

export default function AdminContentIndex({ submissions, filter = 'visible' }: Props): ReactNode {
    const getSearchText = useCallback(
        (submission: Submission) =>
            [
                submission.title,
                submission.campaign,
                submission.creator,
                `v${submission.version}`,
            ].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        submissions.data,
        getSearchText,
    );

    return (
        <>
            <Head title="Moderasi Konten" />
            <WorkspacePage
                description="Sembunyikan atau pulihkan submission konten."
                title="Moderasi Konten"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Versi',
                            cell: (s) => <span className="tabular-nums">v{s.version}</span>,
                        },
                        {
                            header: 'Judul',
                            cell: (s) => <p className="min-w-[12rem] font-medium">{s.title}</p>,
                        },
                        { header: 'Campaign', cell: (s) => s.campaign },
                        { header: 'Creator', cell: (s) => s.creator },
                        {
                            header: 'Visibilitas',
                            cell: (s) => (
                                <StatusBadge
                                    label={s.is_hidden ? 'Tersembunyi' : 'Tampil'}
                                    tone={s.is_hidden ? 'danger' : 'success'}
                                />
                            ),
                        },
                        {
                            header: 'Aksi',
                            className: 'text-right',
                            cell: (s) => (
                                <TableRowActions>
                                    <Form
                                        action={hideContent.url(s.id)}
                                        className="inline-flex"
                                        method="patch"
                                    >
                                        <Button size="sm" type="submit" variant="outline">
                                            {s.is_hidden ? 'Pulihkan' : 'Sembunyikan'}
                                        </Button>
                                    </Form>
                                </TableRowActions>
                            ),
                        },
                    ]}
                    emptyDescription="Tidak ada submission pada filter ini."
                    emptyTitle="Tidak ada submission"
                    filtersSlot={
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map((f) => (
                                <Button
                                    asChild
                                    key={f.value}
                                    size="sm"
                                    variant={filter === f.value ? 'default' : 'outline'}
                                >
                                    <Link
                                        href={contentIndex.url({ query: { status: f.value } })}
                                        preserveScroll
                                    >
                                        {f.label}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    }
                    getRowKey={(s) => s.id}
                    paginationLinks={submissions.links}
                    rows={filteredRows}
                    search={{
                        onChange: setQuery,
                        placeholder: 'Cari judul, campaign, atau creator...',
                        resultCount,
                        totalCount,
                        value: query,
                    }}
                />
            </WorkspacePage>
        </>
    );
}