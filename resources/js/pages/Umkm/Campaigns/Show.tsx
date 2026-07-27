import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import {
    acceptByRequest,
    cancelInvitation,
    rejectByRequest,
} from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { DashboardSection } from '@/components/app/dashboard-section';
import { FlashBanner } from '@/components/app/flash-banner';
import { PageActionGroup } from '@/components/app/page-action-group';
import { PageHeader } from '@/components/app/page-header';
import { ProfileIncompleteBanner } from '@/components/app/profile-incomplete-banner';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { edit, publish, cancel } from '@/routes/umkm/campaigns';
import { index as umkmDiscoverIndex } from '@/routes/umkm/discover';
import { terms } from '@/routes/public';

type Request = {
    id: number;
    type: string;
    status: string;
    creator_name: string;
    message: string | null;
    responded_at: string | null;
};

type Campaign = {
    id: number;
    title: string;
    description: string;
    status: string;
    status_label: string;
    budget: string | null;
    deadline: string | null;
    is_hidden: boolean;
    category: string | null;
    deliverables: { id: number; title: string; description: string | null; quantity: number }[];
    requests: Request[];
    collaboration_id: number | null;
};

type ProfileStatus = {
    isComplete: boolean;
    missingFields: string[];
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

export default function Show({
    campaign,
    profileStatus,
}: {
    campaign: Campaign;
    profileStatus?: ProfileStatus;
}): ReactNode {
    const flash = usePage().props.status as string | undefined;
    const canPublish = profileStatus?.isComplete ?? true;
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [termsAccepted, setTermsAccepted] = useState<Record<number, boolean>>({});

    return (
        <>
            <Head title={`Campaign - ${campaign.title}`} />
            <div>
                <PageHeader
                    actions={
                        <PageActionGroup>
                            {campaign.status === 'draft' ? (
                                <Form {...publish.form(campaign.id)}>
                                    {({ processing }) => (
                                        <Button disabled={processing || !canPublish} type="submit">
                                            Publikasikan
                                        </Button>
                                    )}
                                </Form>
                            ) : null}
                            <Button asChild variant={campaign.status === 'draft' ? 'outline' : 'default'}>
                                <Link href={edit(campaign.id).url}>Edit Campaign</Link>
                            </Button>
                            {campaign.collaboration_id ? (
                                <Button asChild variant="outline">
                                    <Link href={`/umkm/collaborations/${campaign.collaboration_id}`}>
                                        Lihat Kolaborasi
                                    </Link>
                                </Button>
                            ) : null}
                            {!['cancelled', 'completed'].includes(campaign.status) ? (
                                <Form {...cancel.form(campaign.id)}>
                                    {({ processing }) => (
                                        <Button
                                            disabled={processing}
                                            onClick={(e) => {
                                                if (!confirm('Batalkan campaign ini?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            type="submit"
                                            variant="destructive"
                                        >
                                            Batalkan
                                        </Button>
                                    )}
                                </Form>
                            ) : null}
                        </PageActionGroup>
                    }
                    description={
                        `${campaign.category ? `Kategori: ${campaign.category}` : 'Tanpa kategori'}${
                            campaign.budget
                                ? ` · Budget: Rp ${Number(campaign.budget).toLocaleString('id-ID')}`
                                : ''
                        }${campaign.deadline ? ` · Deadline: ${campaign.deadline}` : ''}`
                    }
                    meta={
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge label={campaign.status_label} tone={statusTone(campaign.status)} />
                            {campaign.is_hidden ? (
                                <StatusBadge label="Disembunyikan admin" tone="danger" />
                            ) : null}
                        </div>
                    }
                    title={campaign.title}
                />

                {flash ? (
                    <div className="mt-6">
                        <FlashBanner message={flash} />
                    </div>
                ) : null}

                <div className="mt-6">
                    <ProfileIncompleteBanner profileStatus={profileStatus} />
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <SectionPanel description="Ringkasan brief campaign." title="Deskripsi">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                                {campaign.description}
                            </p>
                        </SectionPanel>

                        <DashboardSection title={`Lamaran & Undangan (${campaign.requests.length})`}>
                            {campaign.requests.length === 0 ? (
                                <div className="flex flex-col items-start gap-3">
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada lamaran dari Creator. Anda juga bisa mengirim undangan
                                        dari Cari Creator.
                                    </p>
                                    <Button asChild size="sm">
                                        <Link href={umkmDiscoverIndex().url}>Cari Creator</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {campaign.requests.map((r) => (
                                        <ResourceCard key={r.id}>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {r.creator_name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {r.type === 'application' ? 'Lamaran' : 'Undangan'} ·{' '}
                                                            {r.status}
                                                        </p>
                                                        {r.message ? (
                                                            <p className="mt-2 text-sm text-foreground">
                                                                {r.message}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    {r.type === 'invitation' && r.status === 'pending' ? (
                                                        <Form {...cancelInvitation.form(r.id)}>
                                                            {({ processing }) => (
                                                                <Button
                                                                    disabled={processing}
                                                                    onClick={(e) => {
                                                                        if (
                                                                            !confirm(
                                                                                'Batalkan undangan ke Creator ini?',
                                                                            )
                                                                        ) {
                                                                            e.preventDefault();
                                                                        }
                                                                    }}
                                                                    type="submit"
                                                                    variant="outline"
                                                                >
                                                                    Batalkan Undangan
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    ) : null}
                                                </div>

                                                {r.type === 'application' && r.status === 'pending' ? (
                                                    <div className="flex flex-col gap-3 border-t-2 border-[var(--neutral-900)] pt-3">
                                                        <Form {...acceptByRequest.form(r.id)} className="flex flex-col gap-3">
                                                            {({ processing, errors }) => (
                                                                <>
                                                                    <input
                                                                        name="terms_accepted"
                                                                        type="hidden"
                                                                        value={termsAccepted[r.id] ? '1' : '0'}
                                                                    />
                                                                    <label
                                                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                                                        htmlFor={`terms-accept-${r.id}`}
                                                                    >
                                                                        <Checkbox
                                                                            checked={termsAccepted[r.id] === true}
                                                                            className="mt-0.5"
                                                                            id={`terms-accept-${r.id}`}
                                                                            onCheckedChange={(checked) =>
                                                                                setTermsAccepted((prev) => ({
                                                                                    ...prev,
                                                                                    [r.id]: checked === true,
                                                                                }))
                                                                            }
                                                                        />
                                                                        <span>
                                                                            Saya telah membaca dan menyetujui{' '}
                                                                            <Link
                                                                                className="font-bold text-foreground underline underline-offset-4"
                                                                                href={terms()}
                                                                                target="_blank"
                                                                            >
                                                                                Syarat dan Ketentuan
                                                                            </Link>{' '}
                                                                            Collabite.
                                                                        </span>
                                                                    </label>
                                                                    <InputError message={errors.terms_accepted} />
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <Button
                                                                            disabled={
                                                                                processing ||
                                                                                termsAccepted[r.id] !== true
                                                                            }
                                                                            size="sm"
                                                                            type="submit"
                                                                        >
                                                                            Terima Lamaran
                                                                        </Button>
                                                                        {rejectingId === r.id ? null : (
                                                                            <Button
                                                                                size="sm"
                                                                                type="button"
                                                                                variant="outline"
                                                                                onClick={() => setRejectingId(r.id)}
                                                                            >
                                                                                Tolak
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </Form>
                                                        {rejectingId === r.id ? (
                                                            <Form
                                                                {...rejectByRequest.form(r.id)}
                                                                className="flex flex-col gap-2"
                                                                onSuccess={() => {
                                                                    setRejectingId(null);
                                                                    setRejectReason('');
                                                                }}
                                                            >
                                                                {({ processing, errors }) => (
                                                                    <>
                                                                        <Textarea
                                                                            name="reason"
                                                                            placeholder="Alasan penolakan (opsional)"
                                                                            rows={2}
                                                                            value={rejectReason}
                                                                            onChange={(e) =>
                                                                                setRejectReason(e.target.value)
                                                                            }
                                                                        />
                                                                        <InputError message={errors.reason} />
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <Button
                                                                                disabled={processing}
                                                                                size="sm"
                                                                                type="submit"
                                                                                variant="destructive"
                                                                            >
                                                                                Konfirmasi Tolak
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                type="button"
                                                                                variant="outline"
                                                                                onClick={() => setRejectingId(null)}
                                                                            >
                                                                                Batal
                                                                            </Button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </Form>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </ResourceCard>
                                    ))}
                                </div>
                            )}
                        </DashboardSection>
                    </div>

                    <SectionPanel title="Deliverable">
                        {campaign.deliverables.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada deliverable.</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {campaign.deliverables.map((d) => (
                                    <ResourceCard key={d.id}>
                                        <p className="font-medium text-foreground">{d.title}</p>
                                        {d.description ? (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {d.description}
                                            </p>
                                        ) : null}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Qty: {d.quantity}
                                        </p>
                                    </ResourceCard>
                                ))}
                            </ul>
                        )}
                    </SectionPanel>
                </div>
            </div>
        </>
    );
}
