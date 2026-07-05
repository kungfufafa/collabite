import { Form, Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { cancelInvitation } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { DashboardSection } from '@/components/app/dashboard-section';
import { FlashBanner } from '@/components/app/flash-banner';
import { PageHeader } from '@/components/app/page-header';
import { ProfileIncompleteBanner } from '@/components/app/profile-incomplete-banner';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { edit, publish, cancel } from '@/routes/umkm/campaigns';

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

    return (
        <>
            <Head title={`Campaign - ${campaign.title}`} />
            <div>
                <PageHeader
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href={edit(campaign.id).url}>Edit Campaign</Link>
                            </Button>
                            {campaign.status === 'draft' ? (
                                <Form {...publish.form(campaign.id)}>
                                    {({ processing }) => (
                                        <Button disabled={processing || !canPublish} type="submit" variant="success">
                                            Publikasikan
                                        </Button>
                                    )}
                                </Form>
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
                            {campaign.collaboration_id ? (
                                <Button asChild variant="outline">
                                    <Link href={`/umkm/collaborations/${campaign.collaboration_id}`}>
                                        Lihat Kolaborasi
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    }
                    description={
                        <>
                            {campaign.category ? `Kategori: ${campaign.category}` : 'Tanpa kategori'}
                            {campaign.budget
                                ? ` · Budget: Rp ${Number(campaign.budget).toLocaleString('id-ID')}`
                                : ''}
                            {campaign.deadline ? ` · Deadline: ${campaign.deadline}` : ''}
                        </>
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

                        <DashboardSection title={`Pengajuan (${campaign.requests.length})`}>
                            {campaign.requests.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada pengajuan dari Creator.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {campaign.requests.map((r) => (
                                        <ResourceCard key={r.id}>
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {r.creator_name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {r.type === 'application' ? 'Lamaran' : 'Undangan'} · {r.status}
                                                    </p>
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
