import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { create } from '@/routes/umkm/campaigns';

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

export default function Index({ campaigns }: { campaigns: { data: Campaign[] } | Campaign[] }): ReactNode {
    const list = Array.isArray(campaigns) ? campaigns : campaigns.data;

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

                {list.length === 0 ? (
                    <div className="mt-8">
                        <ListEmptyState
                            action={
                                <Button asChild>
                                    <Link href={create().url}>
                                        <Plus className="size-4" />
                                        Buat Campaign Pertama
                                    </Link>
                                </Button>
                            }
                            description="Buat campaign untuk mulai menerima lamaran dari creator."
                            title="Belum ada campaign"
                        />
                    </div>
                ) : (
                    <div className="mt-8 flex flex-col gap-3">
                        {list.map((c) => (
                            <ResourceCard
                                className="flex flex-col gap-4"
                                key={c.id}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <Link
                                            className="text-base font-semibold text-foreground hover:underline"
                                            href={`/umkm/campaigns/${c.id}`}
                                        >
                                            {c.title}
                                        </Link>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {c.budget
                                                ? `Rp ${Number(c.budget).toLocaleString('id-ID')}`
                                                : 'Budget belum ditentukan'}
                                            {c.deadline ? ` · Deadline ${c.deadline}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <StatusBadge
                                            label={c.status_label}
                                            tone={statusTone(c.status)}
                                        />
                                        {c.is_hidden ? (
                                            <StatusBadge
                                                label="Disembunyikan admin"
                                                tone="danger"
                                            />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-t border-border pt-4 text-sm">
                                    <div className="flex gap-4 text-muted-foreground">
                                        <span>
                                            Pengajuan:{' '}
                                            <strong className="text-foreground">
                                                {c.pending_requests}
                                            </strong>
                                        </span>
                                        <span>
                                            Kolaborasi:{' '}
                                            <strong className="text-foreground">
                                                {c.has_collaboration ? 'Aktif' : 'Belum ada'}
                                            </strong>
                                        </span>
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/umkm/campaigns/${c.id}`}>Detail</Link>
                                    </Button>
                                </div>
                            </ResourceCard>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
