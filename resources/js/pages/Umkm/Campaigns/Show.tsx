import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

export default function Show({ campaign }: { campaign: Campaign }) {
    const flash = usePage().props.status as string | undefined;
    const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (status === 'open') return 'default';
        if (status === 'draft') return 'secondary';
        if (status === 'cancelled' || status === 'completed') return 'outline';
        return 'secondary';
    };

    return (
        <>
            <Head title={`Campaign - ${campaign.title}`} />
            <main className="container mx-auto max-w-4xl px-6 py-10">
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
                                    {campaign.category ? `Kategori: ${campaign.category}` : 'Tanpa kategori'}
                                    {campaign.budget ? ` • Budget: Rp ${Number(campaign.budget).toLocaleString('id-ID')}` : ''}
                                    {campaign.deadline ? ` • Deadline: ${campaign.deadline}` : ''}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge variant={statusVariant(campaign.status)}>{campaign.status_label}</Badge>
                                {campaign.is_hidden ? <Badge variant="destructive">Disembunyikan admin</Badge> : null}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {campaign.description}
                        </p>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Deliverable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {campaign.deliverables.length === 0 ? (
                            <p className="text-sm text-slate-500">Belum ada deliverable.</p>
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

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Pengajuan ({campaign.requests.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {campaign.requests.length === 0 ? (
                            <p className="text-sm text-slate-500">Belum ada pengajuan dari Creator.</p>
                        ) : (
                            <ul className="space-y-2">
                                {campaign.requests.map((r) => (
                                    <li key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                        <div>
                                            <div className="font-medium">{r.creator_name}</div>
                                            <div className="text-xs text-slate-500">
                                                {r.type === 'application' ? 'Lamaran' : 'Undangan'} • {r.status}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Separator className="my-6" />

                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href={edit(campaign.id).url}>Edit Campaign</Link>
                    </Button>
                    {campaign.status === 'draft' ? (
                        <Form {...publish.form(campaign.id)}>
                            {({ processing }) => (
                                <Button type="submit" disabled={processing}>
                                    Publikasikan
                                </Button>
                            )}
                        </Form>
                    ) : null}
                    {!['cancelled', 'completed'].includes(campaign.status) ? (
                        <Form {...cancel.form(campaign.id)}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                    onClick={(e) => {
                                        if (!confirm('Batalkan campaign ini?')) e.preventDefault();
                                    }}
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
            </main>
        </>
    );
}
