import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { apply } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import InputError from '@/components/input-error';
import { FlashBanner } from '@/components/app/flash-banner';
import { FormErrorSummary } from '@/components/app/form-error-summary';
import { NoticeBanner } from '@/components/app/notice-banner';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { PageBackButton, WorkspacePage } from '@/components/app/workspace-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fieldErrorProps } from '@/lib/form-errors';
import { index as creatorCampaignsIndex } from '@/routes/creator/campaigns';
import { index as creatorRequestsIndex } from '@/routes/creator/requests';

type Deliverable = { id: number; title: string; description: string | null; quantity: number };
type Campaign = {
    id: number;
    title: string;
    description: string;
    budget: string | null;
    deadline: string | null;
    category: string | null;
    status?: string;
    status_label?: string;
    deliverables: Deliverable[];
    umkm: { name: string | null; city: string | null; business_type: string | null };
    published_at: string | null;
};

function statusTone(status: string | undefined): 'success' | 'neutral' | 'danger' | 'info' | 'warning' {
    if (status === 'open') {
        return 'success';
    }

    if (status === 'in_collaboration') {
        return 'info';
    }

    if (status === 'completed') {
        return 'neutral';
    }

    if (status === 'cancelled') {
        return 'danger';
    }

    return 'warning';
}

export default function Show({
    campaign,
    already_applied,
}: {
    campaign: Campaign;
    already_applied: boolean;
}): ReactNode {
    const flash = usePage().props.status as string | undefined;
    const errors = usePage().props.errors as Record<string, string> | undefined;
    const [showForm, setShowForm] = useState(false);

    return (
        <>
            <Head title={`Campaign - ${campaign.title}`} />
            <WorkspacePage
                actions={<PageBackButton href={creatorCampaignsIndex().url} label="Daftar campaign" />}
                description={`${campaign.umkm.name ?? 'UMKM'} · ${campaign.umkm.city ?? '-'} · ${campaign.umkm.business_type ?? ''}`}
                meta={
                    <StatusBadge
                        label={campaign.status_label ?? 'Terbuka'}
                        tone={statusTone(campaign.status)}
                    />
                }
                title={campaign.title}
                titleUppercase={false}
            >
                {flash ? <FlashBanner message={flash} /> : null}

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <SectionPanel title="Deskripsi campaign">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                                {campaign.description}
                            </p>
                            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                                <div>
                                    <dt className="text-xs text-muted-foreground">Budget</dt>
                                    <dd className="font-semibold text-foreground">
                                        {campaign.budget
                                            ? `Rp ${Number(campaign.budget).toLocaleString('id-ID')}`
                                            : 'Fleksibel'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">Deadline</dt>
                                    <dd className="font-semibold text-foreground">
                                        {campaign.deadline ?? '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">Kategori</dt>
                                    <dd className="font-semibold text-foreground">
                                        {campaign.category ?? '—'}
                                    </dd>
                                </div>
                            </dl>
                        </SectionPanel>

                        {campaign.status && campaign.status !== 'open' ? (
                            <NoticeBanner
                                message="Campaign ini sudah tidak menerima lamaran baru."
                                title="Campaign ditutup"
                                tone="warning"
                            />
                        ) : already_applied ? (
                            <NoticeBanner
                                action={{
                                    href: creatorRequestsIndex().url,
                                    label: 'Lihat status lamaran',
                                }}
                                message="Anda sudah mengajukan lamaran untuk campaign ini. Pantau respons UMKM di halaman Permintaan."
                                title="Lamaran terkirim"
                                tone="info"
                            />
                        ) : showForm ? (
                            <SectionPanel title="Kirim Lamaran">
                                <Form {...apply.form(campaign.id)}>
                                    {({ errors, processing }) => (
                                        <>
                                            <FormErrorSummary errors={errors} />
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-medium" htmlFor="message">
                                                    Pesan
                                                </label>
                                                <Textarea
                                                    id="message"
                                                    maxLength={2000}
                                                    name="message"
                                                    placeholder="Ceritakan mengapa Anda tertarik dan bagaimana Anda akan mengerjakannya..."
                                                    rows={4}
                                                    {...fieldErrorProps(errors.message)}
                                                />
                                                <InputError className="mt-1" message={errors.message} />
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Button disabled={processing} type="submit" variant="success">
                                                    {processing ? 'Mengirim...' : 'Kirim Lamaran'}
                                                </Button>
                                                <Button
                                                    onClick={() => setShowForm(false)}
                                                    type="button"
                                                    variant="outline"
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </SectionPanel>
                        ) : (
                            <Button onClick={() => setShowForm(true)}>Lamar Campaign Ini</Button>
                        )}
                    </div>

                    <SectionPanel title="Deliverable yang diharapkan">
                        {campaign.deliverables.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                UMKM belum menentukan deliverable.
                            </p>
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
            </WorkspacePage>
        </>
    );
}
