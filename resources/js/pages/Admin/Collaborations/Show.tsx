import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
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

export default function AdminCollaborationsShow({ collaboration, audit_logs }: Props): ReactNode {
    const isActive = collaboration.status === 'active';

    return (
        <>
            <Head title={`Admin: Kolaborasi #${collaboration.id}`} />
            <div>
                <PageHeader
                    title={collaboration.campaign.title}
                    description={`${collaboration.campaign.umkm_business ?? collaboration.umkm.name} ↔ ${collaboration.creator.name}`}
                    actions={<StatusBadge label={collaboration.status_label} tone="info" />}
                />

                <div className="mt-8 space-y-6">
                    {collaboration.cancelled_at ? (
                        <SectionPanel title="Riwayat Pembatalan">
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Dibatalkan pada {collaboration.cancelled_at}.</p>
                                <p>Alasan: {collaboration.cancelled_reason ?? '-'}</p>
                            </div>
                        </SectionPanel>
                    ) : null}

                    <SectionPanel title="Progress">
                        {collaboration.progress.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada progress update.</p>
                        ) : (
                            <ol className="space-y-2 text-sm">
                                {collaboration.progress.map((p) => (
                                    <ResourceCard key={p.id}>
                                        <div className="text-xs text-muted-foreground">{p.created_at}</div>
                                        <div className="mt-1 text-foreground">{p.message}</div>
                                    </ResourceCard>
                                ))}
                            </ol>
                        )}
                    </SectionPanel>

                    <SectionPanel title="Submissions">
                        {collaboration.submissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada submission.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {collaboration.submissions.map((s) => (
                                    <ResourceCard key={s.id}>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-medium text-foreground">
                                                v{s.version} — {s.title}
                                            </span>
                                            <StatusBadge label={s.status} tone="neutral" />
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
                                        cell: (log) => log.created_at ?? '-',
                                    },
                                    { header: 'Aksi', cell: (log) => log.action },
                                    {
                                        header: 'Actor',
                                        cell: (log) =>
                                            `#${log.actor_id ?? '-'} ${log.actor_role ? `(${log.actor_role})` : ''}`,
                                    },
                                ]}
                                emptyTitle="Belum ada catatan audit"
                                getRowKey={(log) => log.id}
                                rows={audit_logs}
                            />
                        )}
                    </SectionPanel>

                    <SectionPanel title="Force-close">
                        {!isActive ? (
                            <p className="text-sm text-muted-foreground">
                                Kolaborasi tidak dalam status aktif sehingga tidak dapat di-force-close.
                            </p>
                        ) : (
                            <Form
                                action={`/admin/collaborations/${collaboration.id}/force-close`}
                                method="post"
                                className="space-y-3"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div>
                                            <Label htmlFor="reason">Alasan (≥ 10 karakter)</Label>
                                            <Textarea
                                                id="reason"
                                                name="reason"
                                                rows={3}
                                                required
                                                minLength={10}
                                                maxLength={1000}
                                            />
                                            <InputError message={errors.reason} className="mt-1" />
                                        </div>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={processing}
                                            onClick={(e) => {
                                                if (!confirm('Force-close kolaborasi ini?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            {processing ? 'Memproses...' : 'Force-close kolaborasi'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </SectionPanel>

                    {collaboration.reviews.length > 0 ? (
                        <SectionPanel title="Reviews">
                            <ul className="space-y-2 text-sm">
                                {collaboration.reviews.map((r) => (
                                    <ResourceCard key={r.id}>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-foreground">
                                                {r.reviewer} → {r.reviewee}
                                            </span>
                                            <span className="font-medium">{r.rating}/5</span>
                                        </div>
                                        {r.body ? (
                                            <p className="mt-2 text-muted-foreground">{r.body}</p>
                                        ) : null}
                                        {r.is_hidden ? (
                                            <div className="mt-2">
                                                <StatusBadge label="Tersembunyi" tone="neutral" />
                                            </div>
                                        ) : null}
                                    </ResourceCard>
                                ))}
                            </ul>
                        </SectionPanel>
                    ) : null}
                </div>
            </div>
        </>
    );
}
