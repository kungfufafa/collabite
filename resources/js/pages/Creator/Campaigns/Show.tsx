import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { apply } from '@/actions/App/Http/Controllers/Creator/CollaborationsController';
import InputError from '@/components/input-error';
import { FlashBanner } from '@/components/app/flash-banner';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { index as creatorCampaignsIndex } from '@/routes/creator/campaigns';

type Deliverable = { id: number; title: string; description: string | null; quantity: number };
type Campaign = {
    id: number;
    title: string;
    description: string;
    budget: string | null;
    deadline: string | null;
    category: string | null;
    deliverables: Deliverable[];
    umkm: { name: string | null; city: string | null; business_type: string | null };
    published_at: string | null;
};

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
            <div>
                <PageHeader
                    description={`${campaign.umkm.name ?? 'UMKM'} · ${campaign.umkm.city ?? '-'} · ${campaign.umkm.business_type ?? ''}`}
                    meta={<StatusBadge label="Terbuka" tone="success" />}
                    title={campaign.title}
                />

                {flash ? (
                    <div className="mt-6">
                        <FlashBanner message={flash} />
                    </div>
                ) : null}

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
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

                        {already_applied ? (
                            <ResourceCard>
                                <p className="text-sm text-muted-foreground">
                                    Anda sudah mengajukan lamaran untuk campaign ini.
                                </p>
                            </ResourceCard>
                        ) : showForm ? (
                            <SectionPanel title="Kirim Lamaran">
                                <Form {...apply.form(campaign.id)}>
                                    {({ processing }) => (
                                        <>
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
                                                />
                                                <InputError className="mt-1" message={errors?.message} />
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Button disabled={processing} type="submit">
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

                <div className="mt-8">
                    <Button asChild variant="link">
                        <Link href={creatorCampaignsIndex().url}>Kembali ke daftar campaign</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
