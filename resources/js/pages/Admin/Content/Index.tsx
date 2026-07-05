import { Form, Head } from '@inertiajs/react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';
import { useClientTableSearch } from '@/hooks/use-client-table-search';

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
};

export default function AdminContentIndex({ submissions }: Props): ReactNode {
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
                description="Submission tersembunyi dapat dipulihkan."
                title="Moderasi Konten"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Versi',
                            cell: (s) => (
                                <span className="tabular-nums">v{s.version}</span>
                            ),
                        },
                        {
                            header: 'Judul',
                            cell: (s) => (
                                <p className="min-w-[12rem] font-medium">{s.title}</p>
                            ),
                        },
                        { header: 'Campaign', cell: (s) => s.campaign },
                        { header: 'Creator', cell: (s) => s.creator },
                        {
                            header: 'Visibilitas',
                            cell: () => (
                                <StatusBadge label="Tersembunyi" tone="danger" />
                            ),
                        },
                        {
                            header: 'Aksi',
                            className: 'text-right',
                            cell: (s) => (
                                <TableRowActions>
                                    <Form
                                        action={`/admin/moderation/submissions/${s.id}/hide`}
                                        className="inline-flex"
                                        method="patch"
                                    >
                                        <Button size="sm" type="submit" variant="outline">
                                            Pulihkan
                                        </Button>
                                    </Form>
                                </TableRowActions>
                            ),
                        },
                    ]}
                    emptyDescription="Semua submission saat ini terlihat normal."
                    emptyTitle="Tidak ada submission tersembunyi"
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
