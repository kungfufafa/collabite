import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { FormEventHandler, ReactNode } from 'react';

import {
    approve as approveVerification,
    reject as rejectVerification,
} from '@/actions/App/Http/Controllers/Admin/VerificationsController';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { PageBackButton, WorkspacePage } from '@/components/app/workspace-page';
import { brutalDangerBanner } from '@/components/collabite/landing/brutal-styles';
import InputError from '@/components/input-error';
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

function statusTone(
    status: string,
): 'warning' | 'success' | 'danger' | 'neutral' {
    if (status === 'pending') {
        return 'warning';
    }

    if (status === 'verified') {
        return 'success';
    }

    if (status === 'rejected') {
        return 'danger';
    }

    return 'neutral';
}

export default function Show({ verification }: Props): ReactNode {
    const approval = useForm({});
    const rejection = useForm({ rejection_reason: '' });

    const approve: FormEventHandler = (e) => {
        e.preventDefault();

        if (!confirm('Setujui verifikasi ini?')) {
            return;
        }

        approval.post(approveVerification.url(verification.id));
    };

    const rejectSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        rejection.post(rejectVerification.url(verification.id));
    };

    return (
        <>
            <Head title={`Verifikasi #${verification.id}`} />
            <WorkspacePage
                actions={<PageBackButton href="/admin/verifications" />}
                description={`Creator: ${verification.creator.name} (${verification.creator.email})`}
                title={`Pengajuan #${verification.id}`}
            >
                <div className="max-w-3xl space-y-6">
                    <SectionPanel title="Ringkasan">
                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">
                                    Status
                                </dt>
                                <dd className="mt-1">
                                    <StatusBadge
                                        label={verification.status}
                                        tone={statusTone(verification.status)}
                                    />
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    Diajukan
                                </dt>
                                <dd className="mt-1 font-medium text-foreground">
                                    {verification.submitted_at ?? '—'}
                                </dd>
                            </div>
                            {verification.reviewed_at ? (
                                <div className="sm:col-span-2">
                                    <dt className="text-muted-foreground">
                                        Ditinjau
                                    </dt>
                                    <dd className="mt-1 font-medium text-foreground">
                                        {verification.reviewed_at} oleh{' '}
                                        {verification.reviewer?.name ?? '—'}
                                    </dd>
                                </div>
                            ) : null}
                        </dl>
                        {verification.rejection_reason ? (
                            <p className={`mt-4 ${brutalDangerBanner}`}>
                                Alasan penolakan:{' '}
                                {verification.rejection_reason}
                            </p>
                        ) : null}
                    </SectionPanel>

                    <SectionPanel
                        description={`${verification.documents_count} berkas terlampir.`}
                        title="Berkas"
                    >
                        {verification.documents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Tidak ada berkas terlampir.
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {verification.documents.map((document) => (
                                    <li
                                        className="flex flex-col gap-1 py-3 text-sm first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                        key={document.id}
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {document.type_label}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {document.original_name}
                                            </p>
                                        </div>
                                        {document.download_url ? (
                                            <a
                                                className="text-sm font-medium text-primary hover:underline"
                                                href={document.download_url}
                                            >
                                                Unduh
                                            </a>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionPanel>

                    {verification.status === 'pending' ? (
                        <SectionPanel
                            description="Pilih satu keputusan setelah dokumen dan profil Creator selesai ditinjau."
                            title="Tindakan"
                        >
                            <div className="flex flex-col gap-5">
                                <form
                                    className="flex flex-col gap-3 border-b-2 border-[var(--neutral-900)] pb-5 sm:flex-row sm:items-center sm:justify-between"
                                    onSubmit={approve}
                                >
                                    <div>
                                        <p className="text-sm font-bold text-foreground">
                                            Setujui pengajuan
                                        </p>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                            Creator akan berstatus terverifikasi
                                            dan dapat ditampilkan sebagai akun
                                            kredibel.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full sm:w-auto"
                                        disabled={
                                            approval.processing ||
                                            rejection.processing
                                        }
                                        type="submit"
                                        variant="success"
                                    >
                                        <CheckCircle2 data-icon="inline-start" />
                                        Setujui verifikasi
                                    </Button>
                                </form>

                                <form
                                    className="flex flex-col gap-3"
                                    onSubmit={rejectSubmit}
                                >
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="rejection_reason">
                                            Alasan penolakan
                                        </Label>
                                        <Textarea
                                            aria-invalid={
                                                Boolean(
                                                    rejection.errors
                                                        .rejection_reason,
                                                ) || undefined
                                            }
                                            id="rejection_reason"
                                            onChange={(e) =>
                                                rejection.setData(
                                                    'rejection_reason',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Foto identitas buram atau bukti portofolio belum sesuai."
                                            rows={3}
                                            value={
                                                rejection.data.rejection_reason
                                            }
                                        />
                                        <InputError
                                            message={
                                                rejection.errors
                                                    .rejection_reason
                                            }
                                        />
                                        <p className="text-xs leading-relaxed font-medium text-muted-foreground">
                                            Alasan ini akan dikirim ke Creator
                                            agar mereka bisa memperbaiki dan
                                            mengajukan ulang.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full sm:ml-auto sm:w-auto"
                                        disabled={
                                            approval.processing ||
                                            rejection.processing
                                        }
                                        type="submit"
                                        variant="destructive"
                                    >
                                        <XCircle data-icon="inline-start" />
                                        Tolak verifikasi
                                    </Button>
                                </form>
                            </div>
                        </SectionPanel>
                    ) : null}
                </div>
            </WorkspacePage>
        </>
    );
}
