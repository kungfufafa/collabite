import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as creatorsIndex } from '@/routes/public/creators';

type Creator = {
    id: number;
    name: string | null;
    headline: string | null;
    city: string | null;
    rating_avg: number;
    rating_count: number;
    verification_status: string;
    profile_photo_url: string | null;
    categories: string[];
    portfolio_count: number;
};

type PaginatedLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    links: PaginatedLink[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Filters = {
    q: string;
    category: string | null;
    rating: number;
    verified: string | null;
};

type Props = {
    creators: Paginated<Creator>;
    categories: { id: number; name: string }[];
    filters: Filters;
};

export default function CreatorDirectory({ creators, categories, filters }: Props) {
    const [q, setQ] = useState(filters.q);
    const [category, setCategory] = useState(filters.category ?? '');
    const [rating, setRating] = useState(filters.rating);
    const [verified, setVerified] = useState(filters.verified ?? '');

    function applyFilters(overrides: Partial<Filters> = {}): void {
        router.get(
            creatorsIndex(),
            {
                q: overrides.q ?? q,
                category: overrides.category ?? (category || undefined),
                rating: overrides.rating ?? (rating || undefined),
                verified: overrides.verified ?? (verified || undefined),
            },
            { preserveState: true, replace: true },
        );
    }

    function onSearch(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        applyFilters();
    }

    return (
        <>
            <Head title="Direktori Creator" />
            <main className="container mx-auto px-6 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Direktori Creator</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Temukan Creator terverifikasi untuk kolaborasi campaign Anda.
                    </p>
                </header>

                <form onSubmit={onSearch} className="mb-6 grid gap-3 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="q">Kata Kunci</Label>
                        <Input
                            id="q"
                            name="q"
                            value={q}
                            onChange={(event) => setQ(event.target.value)}
                            placeholder="Cari nama, headline, atau bio"
                        />
                    </div>
                    <div>
                        <Label htmlFor="category">Kategori</Label>
                        <select
                            id="category"
                            name="category"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="border-input bg-transparent mt-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                        >
                            <option value="">Semua</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="rating">Rating Minimum</Label>
                        <select
                            id="rating"
                            name="rating"
                            value={rating}
                            onChange={(event) => setRating(Number(event.target.value))}
                            className="border-input bg-transparent mt-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                        >
                            <option value={0}>Semua</option>
                            <option value={3}>3+</option>
                            <option value={4}>4+</option>
                            <option value={4.5}>4.5+</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-3 md:col-span-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={verified === '1'}
                                onChange={(event) => setVerified(event.target.checked ? '1' : '')}
                                className="size-4 rounded border-slate-300"
                            />
                            Hanya Creator Terverifikasi
                        </label>
                        <div className="ml-auto flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setQ('');
                                    setCategory('');
                                    setRating(0);
                                    setVerified('');
                                    applyFilters({ q: '', category: '', rating: 0, verified: '' });
                                }}
                            >
                                Reset
                            </Button>
                            <Button type="submit">Terapkan</Button>
                        </div>
                    </div>
                </form>

                {creators.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-slate-500">
                            Belum ada Creator yang cocok dengan filter saat ini.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {creators.data.map((creator) => (
                            <Card key={creator.id}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-12">
                                            {creator.profile_photo_url ? (
                                                <AvatarImage src={creator.profile_photo_url} alt={creator.name ?? ''} />
                                            ) : null}
                                            <AvatarFallback>
                                                {(creator.name ?? 'C').slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle className="text-base">{creator.name ?? 'Creator'}</CardTitle>
                                            {creator.headline ? (
                                                <CardDescription className="line-clamp-1">{creator.headline}</CardDescription>
                                            ) : null}
                                        </div>
                                        {creator.verification_status === 'verified' ? (
                                            <Badge variant="default">Verified</Badge>
                                        ) : null}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {creator.city ?? 'Lokasi tidak diisi'}
                                    </p>
                                    <p className="mt-2 text-sm">
                                        Rating: {creator.rating_avg.toFixed(1)} ({creator.rating_count} ulasan)
                                    </p>
                                    {creator.categories.length > 0 ? (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {creator.categories.map((name) => (
                                                <Badge key={name} variant="secondary">
                                                    {name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                    <p className="mt-3 text-xs text-slate-500">
                                        {creator.portfolio_count} item portofolio
                                    </p>
                                    <div className="mt-4 flex justify-end">
                                        <Button asChild size="sm">
                                            <Link href={`/creators/${creator.id}`}>Lihat Profil</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {creators.last_page > 1 ? (
                    <nav className="mt-6 flex items-center justify-center gap-2">
                        {creators.links.map((link, index) => (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url ?? '#'}
                                className={`rounded-md border px-3 py-1 text-sm ${
                                    link.active
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : link.url
                                          ? 'border-slate-200 hover:bg-slate-50'
                                          : 'cursor-not-allowed border-slate-100 text-slate-400'
                                }`}
                                preserveState
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ))}
                    </nav>
                ) : null}
            </main>
        </>
    );
}
