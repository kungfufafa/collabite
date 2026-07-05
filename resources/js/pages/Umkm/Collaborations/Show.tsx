import { Form as InertiaForm, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { cancel, sendMessage } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { requestRevision } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { approveSubmission } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { complete } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { submitPaymentProof } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { storeForUmkm as submitReview } from '@/actions/App/Http/Controllers/Umkm/ReviewsController';
import { CollaborationPaymentPanel } from '@/components/app/collaboration-payment-panel';
import { FlashBanner } from '@/components/app/flash-banner';
import { SectionPanel } from '@/components/app/section-panel';
import {
    brutalDivider,
    brutalInlinePanel,
    brutalNativeSelect,
} from '@/components/collabite/landing/brutal-styles';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCollaborationMessagePolling } from '@/hooks/use-collaboration-message-polling';
import CollaborationWorkspaceLayout from '@/layouts/collaboration-workspace-layout';
import type {CollaborationTab} from '@/layouts/collaboration-workspace-layout';

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
    creator: { id: number; name: string };
    messages: Message[];
    progress: Progress[];
    submissions: Submission[];
    reviews: Review[];
    payment: Payment | null;
    budget: string | number | null;
};

type Props = { collaboration: Collaboration; isUmkm?: boolean };

export default function Show({ collaboration, isUmkm = true }: Props): ReactNode {
    const [tab, setTab] = useState<CollaborationTab>('messages');
    const page = usePage<{ features?: { manualPaymentEnabled?: boolean } }>();
    const flash = page.props.status as string | undefined;
    const manualPaymentEnabled = page.props.features?.manualPaymentEnabled ?? false;
    const [message, setMessage] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewBody, setReviewBody] = useState('');
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useCollaborationMessagePolling(tab);

    const paymentConfirmed = collaboration.payment?.status === 'confirmed';
    const hasApprovedSubmission = collaboration.submissions.some(
        (submission) => submission.status === 'approved',
    );
    const canCancel = collaboration.status === 'active' && !hasApprovedSubmission;

    const workspaceTabs = [
        {
            value: 'messages' as const,
            label: 'Pesan',
            count: collaboration.messages.length,
        },
        {
            value: 'progress' as const,
            label: 'Progres',
            count: collaboration.progress.length,
        },
        {
            value: 'content' as const,
            label: 'Submission',
            count: collaboration.submissions.length,
        },
        ...(manualPaymentEnabled
            ? [
                  {
                      value: 'payment' as const,
                      label: 'Pembayaran',
                      count: collaboration.payment ? 1 : 0,
                  },
              ]
            : []),
        {
            value: 'review' as const,
            label: 'Review',
            count: collaboration.reviews.length,
        },
    ];

    const canComplete =
        hasApprovedSubmission && (!manualPaymentEnabled || paymentConfirmed);

    return (
        <>
            <Head title={`Kolaborasi #${collaboration.id}`} />
            <CollaborationWorkspaceLayout
                context={{
                    id: collaboration.id,
                    title: collaboration.campaign.title,
                    subtitle: `Kolaborasi #${collaboration.id}`,
                    statusLabel: collaboration.status_label,
                    counterpartyLabel: isUmkm ? 'Creator' : 'UMKM',
                    counterpartyValue: collaboration.creator.name,
                    campaignHref: `/umkm/campaigns/${collaboration.campaign.id}`,
                    backHref: isUmkm ? '/umkm/collaborations' : '/creator/collaborations',
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
                                                <Button type="submit" disabled={processing || message.trim() === ''}>
                                                    Kirim
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </InertiaForm>
                            </div>
                        </SectionPanel>
                ) : null}

                {tab === 'progress' ? (
                        <SectionPanel
                            title="Progres"
                            description="Update progres kolaborasi dari Creator."
                        >
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
                            </div>
                        </SectionPanel>
                ) : null}

                {tab === 'content' ? (
                        <SectionPanel
                            title="Submission"
                            description="Versi konten yang dikirimkan Creator."
                        >
                            <div className="space-y-3">
                                {collaboration.submissions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Belum ada submission.</p>
                                ) : (
                                    collaboration.submissions.map((s) => (
                                        <div key={s.id} className={brutalInlinePanel}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">v{s.version}: {s.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {s.status_label} {s.submitted_at ? `• ${s.submitted_at}` : ''}
                                                    </div>
                                                </div>
                                                {isUmkm && s.status === 'in_review' ? (
                                                    <div className="flex gap-2">
                                                        <InertiaForm
                                                            {...approveSubmission.form({
                                                                collaboration: collaboration.id,
                                                                submission: s.id,
                                                            })}
                                                        >
                                                            {({ processing }) => (
                                                                <Button
                                                                    disabled={processing}
                                                                    size="sm"
                                                                    type="submit"
                                                                    variant="success"
                                                                >
                                                                    Setujui
                                                                </Button>
                                                            )}
                                                        </InertiaForm>
                                                        <InertiaForm
                                                            {...requestRevision.form({
                                                                collaboration: collaboration.id,
                                                                submission: s.id,
                                                            })}
                                                        >
                                                            {({ processing }) => (
                                                                <Button
                                                                    disabled={processing}
                                                                    size="sm"
                                                                    type="submit"
                                                                    variant="warning"
                                                                >
                                                                    Minta Revisi
                                                                </Button>
                                                            )}
                                                        </InertiaForm>
                                                    </div>
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
                            </div>
                        </SectionPanel>
                ) : null}

                {tab === 'payment' && manualPaymentEnabled ? (
                    <CollaborationPaymentPanel
                        budget={collaboration.budget}
                        collaborationId={collaboration.id}
                        isUmkm={isUmkm}
                        payment={collaboration.payment}
                        submitProofForm={submitPaymentProof}
                    />
                ) : null}

                {tab === 'review' ? (
                        <SectionPanel
                            title="Review"
                            description="Berikan review setelah kolaborasi selesai."
                        >
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
                                                        <label className="text-sm font-medium" htmlFor="umkm-review-rating">
                                                            Rating
                                                        </label>
                                                        <input
                                                            id="umkm-review-rating"
                                                            type="number"
                                                            name="rating"
                                                            min="1"
                                                            max="5"
                                                            value={reviewRating}
                                                            onChange={(e) => setReviewRating(Number(e.target.value))}
                                                            className={brutalNativeSelect}
                                                        />
                                                        <InputError message={errors.rating} className="mt-1" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium" htmlFor="umkm-review-body">
                                                            Ulasan
                                                        </label>
                                                        <Textarea
                                                            id="umkm-review-body"
                                                            name="body"
                                                            rows={3}
                                                            value={reviewBody}
                                                            onChange={(e) => setReviewBody(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <Button type="submit" disabled={processing} className="mt-2">
                                                    Kirim Review
                                                </Button>
                                            </>
                                        )}
                                    </InertiaForm>
                                ) : null}

                                {isUmkm && collaboration.status === 'active' ? (
                                    <div className="space-y-2">
                                        {!manualPaymentEnabled ? (
                                            <p className="text-sm text-muted-foreground">
                                                Pembayaran dilakukan di luar platform Collabite.
                                            </p>
                                        ) : null}
                                        {manualPaymentEnabled &&
                                        !paymentConfirmed &&
                                        hasApprovedSubmission ? (
                                            <p className="text-sm text-amber-700">
                                                Unggah bukti pembayaran dan tunggu konfirmasi Creator
                                                sebelum menyelesaikan kolaborasi.
                                            </p>
                                        ) : null}
                                        <InertiaForm {...complete.form(collaboration.id)}>
                                            {({ processing }) => (
                                                <Button
                                                    className="mt-2"
                                                    disabled={processing || !canComplete}
                                                    type="submit"
                                                    variant="success"
                                                    onClick={(e) => {
                                                        if (!confirm('Tandai kolaborasi selesai?')) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    Selesaikan Kolaborasi
                                                </Button>
                                            )}
                                        </InertiaForm>
                                    </div>
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
                                                                disabled={
                                                                    processing || cancelReason.length < 10
                                                                }
                                                                type="submit"
                                                                variant="destructive"
                                                            >
                                                                Konfirmasi Batalkan
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setShowCancelForm(false);
                                                                    setCancelReason('');
                                                                }}
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
