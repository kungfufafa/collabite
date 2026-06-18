import { Form, Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { discover } from '@/routes/umkm/discover';

type Category = { id: number; name: string };

type Creator = {
    id: number;
    name: string;
    headline: string | null;
    city: string | null;
    verification_status: string;
    rating_avg: number;
    rating_count: number;
    profile_photo_url: string | null;
    categories: string[];
    skills: string[];
    portfolio_count: number;
};

export default function Index({
    creators,
    categories,
    filters,
    pagination,
}: {
    creators: { data: Creator[] } | Creator[];
    categories: Category[];
    filters: { q: string; category_id: string | null; min_rating: string | null; verified_only: string | null };
    pagination?: { current_page: number; last_page: number; total: number };
}) {
    const flash = usePage().props.status as string | undefined;
    const list = Array.isArray(creators) ? creators : creators.data;

    return (
        <>
            <Head title="Cari Creator" />
            <main className="container mx-auto px-6 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Cari Content Creator</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Temukan Creator yang tepat untuk campaign Anda.
                    </p>
                </header>

                {flash ? (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash}
                    </div>
                ) : null}

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...discover.form()} options={{ preserveState: true }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {() => (
                                <>
                                    <div>
                                        <Label htmlFor="q">Kata kunci</Label>
                                        <Input id="q" name="q" defaultValue={filters.q ?? ''} placeholder="Nama, keahlian, headline" />
                                    </div>
                                    <div>
                                        <Label htmlFor="category_id">Kategori</Label>
                                        <input
                                            type="hidden"
                                            name="category_id"
                                            defaultValue={filters.category_id ?? ''}
                                        />
                                        <Select
                                            defaultValue={filters.category_id ?? ''}
                                            onValueChange={(v) => {
                                                const el = document.getElementById('cat_id') as HTMLInputElement | null;
                                                if (el) el.value = v;
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Semua</SelectItem>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="min_rating">Rating minimal</Label>
                                        <Input
                                            id="min_rating"
                                            name="min_rating"
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            defaultValue={filters.min_rating ?? ''}
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <input
                                            id="verified_only"
                                            name="verified_only"
                                            type="checkbox"
                                            value="1"
                                            defaultChecked={filters.verified_only === '1'}
                                            className="size-4 rounded border-slate-300"
                                        />
                                        <Label htmlFor="verified_only">Hanya terverifikasi</Label>
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-4">
                                        <Button type="submit">Terapkan</Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((c) => (
                        <Card key={c.id}>
                            <CardContent className="flex items-start gap-3 py-4">
                                <div className="size-12 shrink-0 overflow-hidden rounded-full border bg-slate-100 dark:bg-slate-800">
                                    {c.profile_photo_url ? (
                                        <img src={c.profile_photo_url} alt={c.name ?? ''} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                            {c.name?.[0] ?? '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="truncate font-semibold">{c.name ?? '-'}</h3>
                                        <span className="text-xs text-amber-600">
                                            ★ {Number(c.rating_avg).toFixed(1)} ({c.rating_count})
                                        </span>
                                    </div>
                                    <p className="line-clamp-1 text-sm text-slate-500">
                                        {c.headline ?? 'Tanpa headline'}{c.city ? ` • ${c.city}` : ''}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {c.verification_status === 'verified' ? (
                                            <Badge variant="default">Terverifikasi</Badge>
                                        ) : (
                                            <Badge variant="secondary">Belum terverifikasi</Badge>
                                        )}
                                        <Badge variant="outline">{c.portfolio_count} Portofolio</Badge>
                                    </div>
                                    {c.skills.length > 0 ? (
                                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                                            Keahlian: {c.skills.join(', ')}
                                        </p>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {list.length === 0 ? (
                    <p className="mt-6 text-center text-sm text-slate-500">Tidak ada Creator yang cocok dengan filter.</p>
                ) : null}

                {pagination ? (
                    <p className="mt-6 text-center text-xs text-slate-500">
                        Halaman {pagination.current_page} dari {pagination.last_page} • Total {pagination.total}
                    </p>
                ) : null}
            </main>
        </>
    );
}
