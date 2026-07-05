import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { PageBackButton, WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type AuditLog = {
    id: number;
    action: string;
    actor_id: number | null;
    actor_role: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
};

type Submission = {
    id: number;
    version: number;
    title: string;
    description: string | null;
    status: string;
};

type Review = {
    id: number;
    rating: number;
    body: string | null;
    is_hidden: boolean;
    reviewer: string | null;
    reviewee: string | null;
};

type Collaboration = {
    id: number;
    status: string;
    status_label: string;
    campaign: { id: number; title: string; umkm_business: string | null };
    umkm: { id: number; name: string };
    creator: { id: number; name: string };
    cancelled_at: string | null;
    cancelled_reason: string | null;
    progress: { id: number; message: string; created_at: string }[];
    submissions: Submission[];
    reviews: Review[];
};

type Props = {
    collaboration: Collaboration;
    audit_logs: AuditLog[];
};

function statusTone(status: string): 'success' | 'info' | 'danger' | 'warning' {
    if (status === 'active') {
        return 'success';
    }

    if (status === 'completed') {
        return 'info';
    }

    if (status === 'cancelled') {
        return 'danger';
    }

    return 'warning';
}

export default function AdminCollaborationsShow({ collaboration, audit_logs }: Props): ReactNode {
    const isActive = collaboration.status === 'active';

    return (
        <>
            <Head title={`Admin: Kolaborasi #${collaboration.id}`} />
            <WorkspacePage
                actions={
                    <>
                        <StatusBadge
                            label={collaboration.status_label}
                            tone={statusTone(collaboration.status)}
                        />
                        <PageBackButton href="/admin/collaborations" />
                    </>
                }
                description={`${collaboration.campaign.umkm_business ?? collaboration.umkm.name} ↔ ${collaboration.creator.name}`}
                title={collaboration.campaign.title}
            >
                <div className="space-y-6">
                    {collaboration.cancelled_at ? (
                        <SectionPanel title="Riwayat Pembatalan">
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Dibatalkan pada {collaboration.cancelled_at}.</p>
                                <p>Alasan: {collaboration.cancelled_reason ?? '—'}</p>
                            </div>
                        </SectionPanel>
                    ) : null}

                    <SectionPanel title="Progress">
                        {collaboration.progress.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada progress update.
                            </p>
                        ) : (
                            <ol className="space-y-3">
                                {collaboration.progress.map((progress) => (
                                    <ResourceCard key={progress.id}>
                                        <div className="text-xs text-muted-foreground">
                                            {progress.created_at}
                                        </div>
                                        <div className="mt-1 text-sm text-foreground">
                                            {progress.message}
                                        </div>
                                    </ResourceCard>
                                ))}
                            </ol>
                        )}
                    </SectionPanel>

                    <SectionPanel title="Submissions">
                        {collaboration.submissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada submission.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {collaboration.submissions.map((submission) => (
                                    <ResourceCard key={submission.id}>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-medium text-foreground">
                                                v{submission.version} — {submission.title}
                                            </span>
                                            <StatusBadge
                                                label={submission.status}
                                                tone="neutral"
                                            />
                                        </div>
                                    </ResourceCard>
                                ))}
                            </ul>
                        )}
                    </SectionPanel>

                    <SectionPanel title="Audit log">
                        {audit_logs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada catatan audit untuk kolaborasi ini.
                            </p>
                        ) : (
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
                                            `#${log.actor_id ?? '—'} ${log.actor_role ? `(${log.actor_role})` : ''}`,
                                    },
                                ]}
                                emptyTitle="Belum ada catatan audit"
                                getRowKey={(log) => log.id}
                                rows={audit_logs}
                            />
                        )}
                    </SectionPanel>

                    <SectionPanel
                        description="Hanya tersedia untuk kolaborasi berstatus aktif."
                        title="Force-close"
                    >
                        {!isActive ? (
                            <p className="text-sm text-muted-foreground">
                                Kolaborasi tidak dalam status aktif sehingga tidak dapat
                                di-force-close.
                            </p>
                        ) : (
                            <Form
                                action={`/admin/collaborations/${collaboration.id}/force-close`}
                                className="space-y-3"
                                method="post"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div>
                                            <Label htmlFor="reason">Alasan (≥ 10 karakter)</Label>
                                            <Textarea
                                                id="reason"
                                                maxLength={1000}
                                                minLength={10}
                                                name="reason"
                                                required
                                                rows={3}
                                            />
                                            <InputError className="mt-1" message={errors.reason} />
                                        </div>
                                        <Button
                                            disabled={processing}
                                            onClick={(e) => {
                                                if (!confirm('Force-close kolaborasi ini?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            type="submit"
                                            variant="destructive"
                                        >
                                            {processing
                                                ? 'Memproses...'
                                                : 'Force-close kolaborasi'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </SectionPanel>

                    {collaboration.reviews.length > 0 ? (
                        <SectionPanel title="Reviews">
                            <ul className="space-y-3">
                                {collaboration.reviews.map((review) => (
                                    <ResourceCard key={review.id}>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-foreground">
                                                {review.reviewer} → {review.reviewee}
                                            </span>
                                            <span className="font-medium tabular-nums">
                                                {review.rating}/5
                                            </span>
                                        </div>
                                        {review.body ? (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {review.body}
                                            </p>
                                        ) : null}
                                        {review.is_hidden ? (
                                            <div className="mt-2">
                                                <StatusBadge
                                                    label="Tersembunyi"
                                                    tone="neutral"
                                                />
                                            </div>
                                        ) : null}
                                    </ResourceCard>
                                ))}
                            </ul>
                        </SectionPanel>
                    ) : null}
                </div>
            </WorkspacePage>
        </>
    );
}
