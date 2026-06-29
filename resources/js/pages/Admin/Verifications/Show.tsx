import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler, ReactNode } from 'react';

import InputError from '@/components/input-error';
import { PageHeader } from '@/components/app/page-header';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Verification = {
    id: number;
    status: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    creator: { id: number | null; name: string | null; email: string | null };
    reviewer: { id: number; name: string } | null;
    documents_count: number;
    documents: {
        id: number;
        type: string;
        type_label: string;
        original_name: string;
        mime_type: string;
        size: number;
        download_url: string | null;
    }[];
};

type Props = { verification: Verification };

export default function Show({ verification }: Props): ReactNode {
    const reject = useForm({ rejection_reason: '' });

    const approve: FormEventHandler = (e) => {
        e.preventDefault();

        if (!confirm('Setujui verifikasi ini?')) {
            return;
        }

        reject.post(`/admin/verifications/${verification.id}/approve`);
    };

    const rejectSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        reject.post(`/admin/verifications/${verification.id}/reject`);
    };

    return (
        <>
            <Head title={`Verifikasi #${verification.id}`} />
            <div>
                <PageHeader
                    title={`Pengajuan #${verification.id}`}
                    description={`Creator: ${verification.creator.name} (${verification.creator.email})`}
                />

                <div className="mt-8 max-w-3xl space-y-6">
                    <SectionPanel title="Ringkasan">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Status:</span>
                                <StatusBadge label={verification.status} tone="info" />
                            </div>
                            <p>Diajukan: {verification.submitted_at ?? '—'}</p>
                            {verification.reviewed_at ? (
                                <p>
                                    Ditinjau: {verification.reviewed_at} oleh{' '}
                                    {verification.reviewer?.name ?? '—'}
                                </p>
                            ) : null}
                            {verification.rejection_reason ? (
                                <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-destructive">
                                    Alasan: {verification.rejection_reason}
                                </p>
                            ) : null}
                        </div>
                    </SectionPanel>

                    <SectionPanel title="Berkas">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {verification.documents.map((d) => (
                                <li key={d.id}>
                                    {d.type_label} — {d.original_name}{' '}
                                    {d.download_url ? (
                                        <a className="text-primary hover:underline" href={d.download_url}>
                                            unduh
                                        </a>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </SectionPanel>

                    {verification.status === 'pending' ? (
                        <SectionPanel title="Tindakan">
                            <div className="space-y-4">
                                <form onSubmit={approve}>
                                    <Button type="submit" disabled={reject.processing}>
                                        Setujui
                                    </Button>
                                </form>
                                <form onSubmit={rejectSubmit} className="space-y-2">
                                    <Label htmlFor="rejection_reason">Alasan Penolakan</Label>
                                    <Textarea
                                        id="rejection_reason"
                                        value={reject.data.rejection_reason}
                                        onChange={(e) => reject.setData('rejection_reason', e.target.value)}
                                        rows={3}
                                    />
                                    <InputError message={reject.errors.rejection_reason} />
                                    <Button type="submit" variant="destructive" disabled={reject.processing}>
                                        Tolak
                                    </Button>
                                </form>
                            </div>
                        </SectionPanel>
                    ) : null}
                </div>
            </div>
        </>
    );
}
