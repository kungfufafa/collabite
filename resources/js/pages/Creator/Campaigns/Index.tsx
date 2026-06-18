import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Campaign = {
    id: number;
    title: string;
    description: string;
    budget: string | null;
    deadline: string | null;
    category: string | null;
    umkm: { name: string | null; city: string | null };
    published_at: string | null;
};

function formatBudget(value: string | null): string {
    if (!value) return 'Budget fleksibel';
    return 'Rp ' + Number(value).toLocaleString('id-ID');
}

export default function Index({
    campaigns,
    categories,
    filters,
}: {
    campaigns: { data: Campaign[] } | Campaign[];
    categories: { id: number; name: string }[];
    filters: { q: string; category_id: string | null; min_budget: string | null; max_budget: string | null };
}) {
    const list = Array.isArray(campaigns) ? campaigns : campaigns.data;

    return (
        <>
            <Head title="Cari Campaign" />
            <main className="container mx-auto px-6 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Cari Campaign</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Temukan campaign UMKM yang sesuai untuk Anda.
                    </p>
                </header>

                <form method="GET" action="/creator/campaigns" className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label htmlFor="q" className="text-sm font-medium">Kata kunci</label>
                        <input id="q" name="q" defaultValue={filters.q ?? ''} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label htmlFor="category_id" className="text-sm font-medium">Kategori</label>
                        <select id="category_id" name="category_id" defaultValue={filters.category_id ?? ''} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                            <option value="">Semua</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="min_budget" className="text-sm font-medium">Budget min</label>
                        <input id="min_budget" name="min_budget" type="number" defaultValue={filters.min_budget ?? ''} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label htmlFor="max_budget" className="text-sm font-medium">Budget max</label>
                        <input id="max_budget" name="max_budget" type="number" defaultValue={filters.max_budget ?? ''} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                        <Button type="submit">Terapkan</Button>
                    </div>
                </form>

                {list.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-slate-500">
                            Belum ada campaign yang cocok.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {list.map((c) => (
                            <Card key={c.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <CardTitle>
                                                <Link href={`/creator/campaigns/${c.id}`} className="hover:underline">
                                                    {c.title}
                                                </Link>
                                            </CardTitle>
                                            <CardDescription>
                                                {c.umkm.name ?? 'UMKM'} • {c.umkm.city ?? '-'} •{' '}
                                                {c.category ?? 'Tanpa kategori'} • {formatBudget(c.budget)}
                                                {c.deadline ? ` • Deadline ${c.deadline}` : ''}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="default">Terbuka</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
