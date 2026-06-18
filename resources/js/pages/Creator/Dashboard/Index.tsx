import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Props = {
    stats: {
        rating_avg: number;
        rating_count: number;
        portfolio_items: number;
        collaborations: number;
    };
    profile: { headline: string | null; verification_status: string } | null;
};

export default function Index({ stats, profile }: Props) {
    return (
        <>
            <Head title="Dashboard Creator" />
            <main className="container mx-auto px-6 py-10">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard Creator</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {profile?.headline ?? 'Lengkapi profil untuk menarik UMKM.'}
                        </p>
                    </div>
                    <form method="post" action="/logout">
                        <Button type="submit" variant="outline">Keluar</Button>
                    </form>
                </header>

                <section className="grid gap-4 md:grid-cols-4">
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Rating Rata-rata</h2>
                        <p className="text-3xl font-bold">{Number(stats.rating_avg).toFixed(1)}</p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Jumlah Review</h2>
                        <p className="text-3xl font-bold">{stats.rating_count}</p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Item Portofolio</h2>
                        <p className="text-3xl font-bold">{stats.portfolio_items}</p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Total Kolaborasi</h2>
                        <p className="text-3xl font-bold">{stats.collaborations}</p>
                    </article>
                </section>

                <section className="mt-10 grid gap-4 md:grid-cols-3">
                    <Link href="/creator/profile" className="rounded-lg border bg-white p-6 hover:shadow dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold">Profil & Keahlian</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Perbarui bio, kategori, dan skill.</p>
                    </Link>
                    <Link href="/creator/portfolio" className="rounded-lg border bg-white p-6 hover:shadow dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold">Portofolio</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tambah karya terbaikmu.</p>
                    </Link>
                    <Link href="/creator/verification" className="rounded-lg border bg-white p-6 hover:shadow dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold">Verifikasi</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Status: <strong>{profile?.verification_status ?? 'unverified'}</strong>
                        </p>
                    </Link>
                </section>
            </main>
        </>
    );
}