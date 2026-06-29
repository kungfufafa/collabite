import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';

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
    return (
        <>
            <Head title="Moderasi Konten" />
            <div>
                <PageHeader
                    description="Submission tersembunyi dapat dipulihkan."
                    title="Moderasi Konten"
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            { header: 'Versi', cell: (s) => `v${s.version}` },
                            { header: 'Judul', cell: (s) => s.title },
                            { header: 'Campaign', cell: (s) => s.campaign },
                            { header: 'Creator', cell: (s) => s.creator },
                            {
                                header: 'Aksi',
                                className: 'text-right',
                                cell: (s) => (
                                    <Form
                                        action={`/admin/moderation/submissions/${s.id}/hide`}
                                        className="inline-flex"
                                        method="patch"
                                    >
                                        <Button size="sm" type="submit" variant="outline">
                                            Pulihkan
                                        </Button>
                                    </Form>
                                ),
                            },
                        ]}
                        emptyDescription="Semua submission saat ini terlihat normal."
                        emptyTitle="Tidak ada submission tersembunyi"
                        getRowKey={(s) => s.id}
                        rows={submissions.data}
                    />
                </div>
            </div>
        </>
    );
}
