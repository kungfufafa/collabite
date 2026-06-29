import { Form as InertiaForm, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { sendMessage } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { storeProgress } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { storeSubmission } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { requestRevision } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { approveSubmission } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { complete } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { storeForUmkm as submitReview } from '@/actions/App/Http/Controllers/Umkm/ReviewsController';
import InputError from '@/components/input-error';
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
};

type Props = { collaboration: Collaboration; isUmkm?: boolean };

export default function Show({ collaboration, isUmkm = true }: Props): ReactNode {
    const [tab, setTab] = useState<CollaborationTab>('messages');
    const flash = usePage().props.status as string | undefined;
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState('');
    const [submissionTitle, setSubmissionTitle] = useState('');
    const [submissionDesc, setSubmissionDesc] = useState('');
    const [, setSubmissionFiles] = useState<FileList | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewBody, setReviewBody] = useState('');

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
                tabs={[
                    {
                        value: 'messages',
                        label: 'Pesan',
                        count: collaboration.messages.length,
                    },
                    {
                        value: 'progress',
                        label: 'Progres',
                        count: collaboration.progress.length,
                    },
                    {
                        value: 'content',
                        label: 'Submission',
                        count: collaboration.submissions.length,
                    },
                    {
                        value: 'review',
                        label: 'Review',
                        count: collaboration.reviews.length,
                    },
                ]}
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
                                        <div key={m.id} className="rounded-md border border-border p-3">
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
                                        <div key={p.id} className="rounded-md border border-border p-3">
                                            <div className="text-xs text-muted-foreground">{p.created_at}</div>
                                            <div className="mt-1 text-sm">{p.message}</div>
                                        </div>
                                    ))
                                )}
                                {!isUmkm ? (
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
                                                    <Button type="submit" disabled={processing || progress.trim() === ''}>
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
                        <SectionPanel
                            title="Submission"
                            description="Versi konten yang dikirimkan Creator."
                        >
                            <div className="space-y-3">
                                {collaboration.submissions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Belum ada submission.</p>
                                ) : (
                                    collaboration.submissions.map((s) => (
                                        <div key={s.id} className="rounded-md border border-border p-3">
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
                                                                <Button size="sm" type="submit" disabled={processing}>
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
                                                                <Button size="sm" variant="outline" type="submit" disabled={processing}>
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

                                {!isUmkm ? (
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
                                                            type="text"
                                                            name="title"
                                                            value={submissionTitle}
                                                            onChange={(e) => setSubmissionTitle(e.target.value)}
                                                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                                            required
                                                        />
                                                        <InputError message={errors.title} className="mt-1" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">File (maks 5)</label>
                                                        <input
                                                            type="file"
                                                            name="files[]"
                                                            multiple
                                                            onChange={(e) => setSubmissionFiles(e.target.files)}
                                                            className="mt-1 w-full text-sm"
                                                            accept="image/*,video/mp4,video/quicktime,video/webm,application/pdf"
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
                                                <Button type="submit" disabled={processing} className="mt-2">
                                                    Upload Submission
                                                </Button>
                                            </>
                                        )}
                                    </InertiaForm>
                                ) : null}
                            </div>
                        </SectionPanel>
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
                                        <div key={r.id} className="rounded-md border border-border p-3">
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
                                                            type="number"
                                                            name="rating"
                                                            min="1"
                                                            max="5"
                                                            value={reviewRating}
                                                            onChange={(e) => setReviewRating(Number(e.target.value))}
                                                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
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
                                                <Button type="submit" disabled={processing} className="mt-2">
                                                    Kirim Review
                                                </Button>
                                            </>
                                        )}
                                    </InertiaForm>
                                ) : null}

                                {isUmkm && collaboration.status === 'active' ? (
                                    <InertiaForm {...complete.form(collaboration.id)}>
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="default"
                                                disabled={processing}
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
                                ) : null}
                            </div>
                        </SectionPanel>
                ) : null}
            </CollaborationWorkspaceLayout>
        </>
    );
}
