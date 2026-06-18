import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Props = {
    stats: {
        total_campaigns: number;
        open_campaigns: number;
        collaborations: number;
    };
    profile: { business_name: string; city: string | null } | null;
};

export default function Index({ stats, profile }: Props) {
    return (
        <>
            <Head title="Dashboard UMKM" />
            <main className="container mx-auto px-6 py-10">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard UMKM</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Halo, {profile?.business_name ?? 'UMKM'}. Kelola campaign dan kolaborasi Anda.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/umkm/campaigns/create">Buat Campaign</Link>
                        </Button>
                        <form method="post" action="/logout">
                            <Button type="submit" variant="outline">Keluar</Button>
                        </form>
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Total Campaign</h2>
                        <p className="text-3xl font-bold">{stats.total_campaigns}</p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Campaign Terbuka</h2>
                        <p className="text-3xl font-bold">{stats.open_campaigns}</p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Kolaborasi Aktif</h2>
                        <p className="text-3xl font-bold">{stats.collaborations}</p>
                    </article>
                </section>

                <section className="mt-10 grid gap-4 md:grid-cols-3">
                    <Link href="/umkm/campaigns" className="rounded-lg border bg-white p-6 hover:shadow dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold">Kelola Campaign</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Buat, publikasikan, dan pantau campaign.</p>
                    </Link>
                    <Link href="/umkm/discover" className="rounded-lg border bg-white p-6 hover:shadow dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold">Cari Creator</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Temukan Creator terverifikasi.</p>
                    </Link>
                    <Link href="/umkm/collaborations" className="rounded-lg border bg-white p-6 hover:shadow dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold">Kolaborasi</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Pantau kolaborasi aktif dan selesai.</p>
                    </Link>
                </section>
            </main>
        </>
    );
}