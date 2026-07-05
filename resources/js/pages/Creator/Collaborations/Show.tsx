import { Form as InertiaForm, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { cancel } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import { confirmPayment } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import { resubmit } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import { sendMessage } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import { storeProgress } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import { storeSubmission } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import { submitForReview } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import { submitReview } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import InputError from '@/components/input-error';
import {
    brutalDashedPanel,
    brutalDivider,
    brutalInlinePanel,
    brutalNativeSelect,
    brutalWarningBanner,
} from '@/components/collabite/landing/brutal-styles';
import { CollaborationPaymentPanel } from '@/components/app/collaboration-payment-panel';
import { FlashBanner } from '@/components/app/flash-banner';
import { SectionPanel } from '@/components/app/section-panel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import CollaborationWorkspaceLayout, {
    type CollaborationTab,
} from '@/layouts/collaboration-workspace-layout';

type Message = {
    id: number;
    sender_id: number;
    sender_name: string | null;
    body: string;
    created_at: string;
    read_at: string | null;
};

type Progress = { id: number; message: string; created_at: string };

type SubmissionFile = { id: number; original_name: string; mime_type: string; size: number; url: string };

type Submission = {
    id: number;
    version: number;
    title: string;
    description: string | null;
    status: string;
    status_label: string;
    submitted_at: string | null;
    files: SubmissionFile[];
};

type Review = {
    id: number;
    reviewer_id: number;
    rating: number;
    body: string | null;
    is_hidden: boolean;
};

type Payment = {
    id: number;
    amount: string;
    status: string;
    status_label: string;
    note: string | null;
    proof_url: string | null;
    proof_original_name: string | null;
    submitted_at: string | null;
    confirmed_at: string | null;
};

type Collaboration = {
    id: number;
    status: string;
    status_label: string;
    campaign: { id: number; title: string };
    umkm: { id: number; name: string };
    messages: Message[];
    progress: Progress[];
    submissions: Submission[];
    reviews: Review[];
    payment: Payment | null;
    budget: string | number | null;
};

export default function Show({ collaboration }: { collaboration: Collaboration }): ReactNode {
    const [tab, setTab] = useState<CollaborationTab>('messages');
    const page = usePage<{ features?: { manualPaymentEnabled?: boolean } }>();
    const flash = page.props.status as string | undefined;
    const manualPaymentEnabled = page.props.features?.manualPaymentEnabled ?? false;
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState('');
    const [submissionTitle, setSubmissionTitle] = useState('');
    const [submissionDesc, setSubmissionDesc] = useState('');
    const [resubmitTitle, setResubmitTitle] = useState('');
    const [resubmitDesc, setResubmitDesc] = useState('');
    const [resubmitSubmissionId, setResubmitSubmissionId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewBody, setReviewBody] = useState('');

    const hasApprovedSubmission = collaboration.submissions.some((s) => s.status === 'approved');
    const revisionSubmission = collaboration.submissions.find((s) => s.status === 'revision_requested');
    const canCancel =
        collaboration.status === 'active' && !hasApprovedSubmission;

    const paymentBanner = ((): string | null => {
        if (!manualPaymentEnabled) {
            return null;
        }

        if (collaboration.payment?.status === 'pending_proof') {
            return 'Menunggu UMKM mengunggah bukti transfer.';
        }

        if (collaboration.payment?.status === 'awaiting_confirmation') {
            return 'UMKM sudah mengunggah bukti. Konfirmasi setelah dana diterima.';
        }

        return null;
    })();

    const workspaceTabs = [
        { value: 'messages' as const, label: 'Pesan', count: collaboration.messages.length },
        { value: 'progress' as const, label: 'Progres', count: collaboration.progress.length },
        { value: 'content' as const, label: 'Submission', count: collaboration.submissions.length },
        ...(manualPaymentEnabled
            ? [
                  {
                      value: 'payment' as const,
                      label: 'Pembayaran',
                      count: collaboration.payment ? 1 : 0,
                  },
              ]
            : []),
        { value: 'review' as const, label: 'Review', count: collaboration.reviews.length },
    ];

    return (
        <>
            <Head title={`Kolaborasi #${collaboration.id}`} />
            <CollaborationWorkspaceLayout
                context={{
                    id: collaboration.id,
                    title: collaboration.campaign.title,
                    subtitle: `Kolaborasi #${collaboration.id}`,
                    statusLabel: collaboration.status_label,
                    counterpartyLabel: 'UMKM',
                    counterpartyValue: collaboration.umkm.name,
                    campaignHref: `/creator/campaigns/${collaboration.campaign.id}`,
                    backHref: '/creator/collaborations',
                    backLabel: 'Kolaborasi',
                }}
                tabs={workspaceTabs}
                activeTab={tab}
                onTabChange={setTab}
            >
                {flash ? (
                    <div className="mb-4">
                        <FlashBanner message={flash} />
                    </div>
                ) : null}

                {paymentBanner ? (
                    <div className={`mb-4 ${brutalWarningBanner}`}>
                        {paymentBanner}
                    </div>
                ) : null}

                {tab === 'messages' ? (
                    <SectionPanel title="Pesan">
                        <div className="space-y-3">
                            {collaboration.messages.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada pesan.</p>
                            ) : (
                                collaboration.messages.map((m) => (
                                    <div key={m.id} className={brutalInlinePanel}>
                                        <div className="text-xs text-muted-foreground">
                                            {m.sender_name ?? 'Sistem'} • {m.created_at}
                                            {m.read_at ? ' ✓' : ''}
                                        </div>
                                        <div className="mt-1 text-sm">{m.body}</div>
                                    </div>
                                ))
                            )}

                            {collaboration.status === 'active' ? (
                                <InertiaForm {...sendMessage.form(collaboration.id)} resetOnSuccess>
                                    {({ errors, processing }) => (
                                        <>
                                            <Textarea
                                                name="body"
                                                rows={3}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Tulis pesan..."
                                            />
                                            <InputError message={errors.body} className="mt-1" />
                                            <div className="mt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={processing || message.trim() === ''}
                                                >
                                                    Kirim
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </InertiaForm>
                            ) : null}
                        </div>
                    </SectionPanel>
                ) : null}

                {tab === 'progress' ? (
                    <SectionPanel title="Progres" description="Update progres kolaborasi dari Anda.">
                        <div className="space-y-3">
                            {collaboration.progress.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada update progres.</p>
                            ) : (
                                collaboration.progress.map((p) => (
                                    <div key={p.id} className={brutalInlinePanel}>
                                        <div className="text-xs text-muted-foreground">{p.created_at}</div>
                                        <div className="mt-1 text-sm">{p.message}</div>
                                    </div>
                                ))
                            )}
                            {collaboration.status === 'active' ? (
                                <InertiaForm {...storeProgress.form(collaboration.id)} resetOnSuccess>
                                    {({ processing }) => (
                                        <>
                                            <Textarea
                                                name="message"
                                                rows={2}
                                                value={progress}
                                                onChange={(e) => setProgress(e.target.value)}
                                                placeholder="Update progres..."
                                            />
                                            <div className="mt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={processing || progress.trim() === ''}
                                                >
                                                    Posting Progres
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </InertiaForm>
                            ) : null}
                        </div>
                    </SectionPanel>
                ) : null}

                {tab === 'content' ? (
                    <SectionPanel title="Submission" description="Versi konten yang Anda kirimkan.">
                        <div className="space-y-3">
                            {collaboration.submissions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada submission.</p>
                            ) : (
                                collaboration.submissions.map((s) => (
                                    <div key={s.id} className={brutalInlinePanel}>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <div className="font-medium">
                                                    v{s.version}: {s.title}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {s.status_label}
                                                    {s.submitted_at ? ` • ${s.submitted_at}` : ''}
                                                </div>
                                            </div>
                                            {s.status === 'draft' ? (
                                                <InertiaForm
                                                    {...submitForReview.form({
                                                        collaboration: collaboration.id,
                                                        submission: s.id,
                                                    })}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            size="sm"
                                                            type="submit"
                                                            disabled={processing}
                                                            variant="success"
                                                        >
                                                            Kirim untuk Review
                                                        </Button>
                                                    )}
                                                </InertiaForm>
                                            ) : null}
                                            {s.status === 'revision_requested' ? (
                                                <Button
                                                    size="sm"
                                                    type="button"
                                                    variant="warning"
                                                    onClick={() => setResubmitSubmissionId(s.id)}
                                                >
                                                    Kirim Revisi
                                                </Button>
                                            ) : null}
                                        </div>
                                        {s.description ? <p className="mt-2 text-sm">{s.description}</p> : null}
                                        {s.files.length > 0 ? (
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                                                {s.files.map((f) => (
                                                    <li key={f.id}>
                                                        <a
                                                            className="text-[var(--brand-primary-hover)] underline"
                                                            href={f.url}
                                                        >
                                                            {f.original_name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </div>
                                ))
                            )}

                            {resubmitSubmissionId !== null ? (
                                <InertiaForm
                                    {...resubmit.form({
                                        collaboration: collaboration.id,
                                        submission: resubmitSubmissionId,
                                    })}
                                    encType="multipart/form-data"
                                    resetOnSuccess
                                    onSuccess={() => {
                                        setResubmitSubmissionId(null);
                                        setResubmitTitle('');
                                        setResubmitDesc('');
                                    }}
                                >
                                    {({ processing, errors }) => (
                                        <div className={brutalDashedPanel}>
                                            <p className="text-sm font-medium">Upload revisi</p>
                                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                <div>
                                                    <label className="text-sm font-medium">Judul</label>
                                                    <input
                                                        className={brutalNativeSelect}
                                                        name="title"
                                                        required
                                                        type="text"
                                                        value={resubmitTitle}
                                                        onChange={(e) => setResubmitTitle(e.target.value)}
                                                    />
                                                    <InputError message={errors.title} className="mt-1" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">File</label>
                                                    <input
                                                        accept="image/*,video/mp4,video/quicktime,video/webm,application/pdf"
                                                        className="mt-1 w-full text-sm"
                                                        name="files[]"
                                                        required
                                                        type="file"
                                                    />
                                                    <InputError message={errors['files.0']} className="mt-1" />
                                                </div>
                                            </div>
                                            <Textarea
                                                className="mt-2"
                                                name="description"
                                                rows={2}
                                                value={resubmitDesc}
                                                onChange={(e) => setResubmitDesc(e.target.value)}
                                            />
                                            <div className="mt-2 flex gap-2">
                                                <Button disabled={processing} type="submit" variant="success">
                                                    Upload Revisi
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setResubmitSubmissionId(null)}
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </InertiaForm>
                            ) : null}

                            {collaboration.status === 'active' && !revisionSubmission ? (
                                <InertiaForm
                                    {...storeSubmission.form(collaboration.id)}
                                    encType="multipart/form-data"
                                    resetOnSuccess
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <div>
                                                    <label className="text-sm font-medium">Judul</label>
                                                    <input
                                                        className={brutalNativeSelect}
                                                        name="title"
                                                        required
                                                        type="text"
                                                        value={submissionTitle}
                                                        onChange={(e) => setSubmissionTitle(e.target.value)}
                                                    />
                                                    <InputError message={errors.title} className="mt-1" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">File (maks 5)</label>
                                                    <input
                                                        accept="image/*,video/mp4,video/quicktime,video/webm,application/pdf"
                                                        className="mt-1 w-full text-sm"
                                                        multiple
                                                        name="files[]"
                                                        type="file"
                                                    />
                                                    <InputError message={errors['files.0']} className="mt-1" />
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <label className="text-sm font-medium">Deskripsi</label>
                                                <Textarea
                                                    name="description"
                                                    rows={3}
                                                    value={submissionDesc}
                                                    onChange={(e) => setSubmissionDesc(e.target.value)}
                                                />
                                            </div>
                                            <Button className="mt-2" disabled={processing} type="submit">
                                                Upload Submission
                                            </Button>
                                        </>
                                    )}
                                </InertiaForm>
                            ) : null}
                        </div>
                    </SectionPanel>
                ) : null}

                {tab === 'payment' && manualPaymentEnabled ? (
                    <CollaborationPaymentPanel
                        budget={collaboration.budget}
                        collaborationId={collaboration.id}
                        confirmPaymentForm={confirmPayment}
                        isUmkm={false}
                        payment={collaboration.payment}
                    />
                ) : null}

                {tab === 'review' ? (
                    <SectionPanel title="Review" description="Berikan review setelah kolaborasi selesai.">
                        <div className="space-y-3">
                            {collaboration.reviews.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada review.</p>
                            ) : (
                                collaboration.reviews.map((r) => (
                                    <div key={r.id} className={brutalInlinePanel}>
                                        <div className="text-sm font-medium">★{r.rating}/5</div>
                                        <p className="mt-1 text-sm">{r.body ?? '-'}</p>
                                    </div>
                                ))
                            )}

                            {collaboration.status === 'completed' ? (
                                <InertiaForm {...submitReview.form(collaboration.id)} resetOnSuccess>
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                                                <div>
                                                    <label className="text-sm font-medium">Rating</label>
                                                    <input
                                                        className={brutalNativeSelect}
                                                        max="5"
                                                        min="1"
                                                        name="rating"
                                                        type="number"
                                                        value={reviewRating}
                                                        onChange={(e) => setReviewRating(Number(e.target.value))}
                                                    />
                                                    <InputError message={errors.rating} className="mt-1" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Ulasan</label>
                                                    <Textarea
                                                        name="body"
                                                        rows={3}
                                                        value={reviewBody}
                                                        onChange={(e) => setReviewBody(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <Button className="mt-2" disabled={processing} type="submit">
                                                Kirim Review
                                            </Button>
                                        </>
                                    )}
                                </InertiaForm>
                            ) : null}

                            {canCancel ? (
                                <div className={`mt-6 ${brutalDivider} pt-4`}>
                                    {!showCancelForm ? (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => setShowCancelForm(true)}
                                        >
                                            Batalkan Kolaborasi
                                        </Button>
                                    ) : (
                                        <InertiaForm
                                            {...cancel.form(collaboration.id)}
                                            onSuccess={() => setShowCancelForm(false)}
                                        >
                                            {({ processing, errors }) => (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                        Alasan pembatalan (min. 10 karakter)
                                                    </label>
                                                    <Textarea
                                                        name="reason"
                                                        required
                                                        rows={3}
                                                        value={cancelReason}
                                                        onChange={(e) => setCancelReason(e.target.value)}
                                                    />
                                                    <InputError message={errors.reason} />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            disabled={processing || cancelReason.length < 10}
                                                            type="submit"
                                                            variant="destructive"
                                                        >
                                                            Konfirmasi Batalkan
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setShowCancelForm(false)}
                                                        >
                                                            Batal
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </InertiaForm>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </SectionPanel>
                ) : null}
            </CollaborationWorkspaceLayout>
        </>
    );
}
