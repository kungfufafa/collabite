import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';

type Campaign = {
    id: number;
    title: string;
    umkm: string | null;
    status: string;
    is_hidden: boolean;
};

type Props = {
    campaigns: {
        data: Campaign[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
};

export default function AdminCampaignsIndex({ campaigns }: Props): ReactNode {
    return (
        <>
            <Head title="Moderasi Campaign" />
            <div>
                <PageHeader
                    description="Campaign yang disembunyikan dapat dipulihkan."
                    title="Moderasi Campaign"
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            { header: 'Judul', cell: (c) => c.title },
                            { header: 'UMKM', cell: (c) => c.umkm ?? '—' },
                            { header: 'Status', cell: (c) => c.status },
                            {
                                header: 'Aksi',
                                className: 'text-right',
                                cell: (c) => (
                                    <Form
                                        action={`/admin/moderation/campaigns/${c.id}/hide`}
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
                        emptyDescription="Semua campaign saat ini terlihat normal."
                        emptyTitle="Tidak ada campaign tersembunyi"
                        getRowKey={(c) => c.id}
                        rows={campaigns.data}
                    />
                </div>
            </div>
        </>
    );
}
