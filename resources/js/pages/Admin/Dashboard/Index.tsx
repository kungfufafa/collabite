import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Stats = {
    total_users: number;
    total_umkm: number;
    total_creators: number;
    pending_verifications: number;
    active_campaigns: number;
    active_collaborations: number;
};

type Props = { stats: Stats };

export default function Index({ stats }: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <main className="container mx-auto px-6 py-10">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Pantauan operasional Collabite.
                        </p>
                    </div>
                    <form method="post" action="/logout">
                        <Button type="submit" variant="outline">Keluar</Button>
                    </form>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Total Pengguna</h2>
                        <p className="text-3xl font-bold">{stats.total_users}</p>
                        <p className="mt-1 text-xs text-slate-500">
                            UMKM: {stats.total_umkm} · Creator: {stats.total_creators}
                        </p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Verifikasi Pending</h2>
                        <p className="text-3xl font-bold">{stats.pending_verifications}</p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Campaign Terbuka</h2>
                        <p className="text-3xl font-bold">{stats.active_campaigns}</p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm text-slate-500">Kolaborasi Aktif</h2>
                        <p className="text-3xl font-bold">{stats.active_collaborations}</p>
                    </article>
                </section>
            </main>
        </>
    );
}