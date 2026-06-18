import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { apply } from '@/routes/creator/campaigns';

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
}) {
    const flash = usePage().props.status as string | undefined;
    const errors = usePage().props.errors as Record<string, string> | undefined;
    const [showForm, setShowForm] = useState(false);

    return (
        <>
            <Head title={`Campaign - ${campaign.title}`} />
            <main className="container mx-auto max-w-3xl px-6 py-10">
                {flash ? (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash}
                    </div>
                ) : null}

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                                <CardDescription>
                                    {campaign.umkm.name ?? 'UMKM'} • {campaign.umkm.city ?? '-'} •{' '}
                                    {campaign.umkm.business_type ?? ''}
                                </CardDescription>
                            </div>
                            <Badge variant="default">Terbuka</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {campaign.description}
                        </p>

                        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div>
                                <dt className="text-xs text-slate-500">Budget</dt>
                                <dd className="font-semibold">
                                    {campaign.budget
                                        ? `Rp ${Number(campaign.budget).toLocaleString('id-ID')}`
                                        : 'Fleksibel'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Deadline</dt>
                                <dd className="font-semibold">{campaign.deadline ?? '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Kategori</dt>
                                <dd className="font-semibold">{campaign.category ?? '-'}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Deliverable yang diharapkan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {campaign.deliverables.length === 0 ? (
                            <p className="text-sm text-slate-500">UMKM belum menentukan deliverable.</p>
                        ) : (
                            <ul className="space-y-2">
                                {campaign.deliverables.map((d) => (
                                    <li key={d.id} className="rounded-md border px-3 py-2 text-sm">
                                        <div className="font-medium">{d.title}</div>
                                        {d.description ? <div className="text-slate-500">{d.description}</div> : null}
                                        <div className="text-xs text-slate-400">Qty: {d.quantity}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6">
                    {already_applied ? (
                        <p className="text-sm text-slate-500">
                            Anda sudah mengajukan lamaran untuk campaign ini.
                        </p>
                    ) : showForm ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Kirim Lamaran</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...apply.form(campaign.id)}>
                                    {({ processing }) => (
                                        <>
                                            <Textarea
                                                name="message"
                                                rows={4}
                                                maxLength={2000}
                                                placeholder="Ceritakan mengapa Anda tertarik dan bagaimana Anda akan mengerjakannya..."
                                            />
                                            <InputError message={errors?.message} className="mt-1" />
                                            <div className="mt-4 flex gap-2">
                                                <Button type="submit" disabled={processing}>
                                                    {processing ? 'Mengirim...' : 'Kirim Lamaran'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowForm(false)}
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Button onClick={() => setShowForm(true)}>Lamar Campaign Ini</Button>
                    )}
                </div>

                <p className="mt-6">
                    <Button asChild variant="link">
                        <Link href="/creator/campaigns">Kembali ke daftar campaign</Link>
                    </Button>
                </p>
            </main>
        </>
    );
}
