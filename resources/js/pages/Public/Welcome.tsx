import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';

export default function Welcome() {
    return (
        <>
            <Head title="Collabite" />
            <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950">
                <header className="container mx-auto flex items-center justify-between px-6 py-6">
                    <span className="text-xl font-bold tracking-tight">Collabite</span>
                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link href={login()}>Masuk</Link>
                        </Button>
                        <Button asChild>
                            <Link href={register()}>Daftar</Link>
                        </Button>
                    </nav>
                </header>
                <section className="container mx-auto px-6 py-16 text-center lg:py-24">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                        Temukan Creator. Jalankan Campaign. Selesaikan Kolaborasi.
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                        Platform untuk UMKM dan Content Creator Indonesia untuk menjalankan
                        kolaborasi promosi berbasis konten, dari brief hingga review.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Button size="lg" asChild>
                            <Link href={register()}>Daftar Sekarang</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href={login()}>Masuk</Link>
                        </Button>
                    </div>
                </section>
                <section className="container mx-auto grid gap-6 px-6 py-12 md:grid-cols-3">
                    <article className="rounded-lg border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-semibold">Discovery Terstruktur</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Cari Creator berdasarkan kategori, keahlian, dan rating.
                        </p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-semibold">Brief yang Jelas</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Campaign dengan judul, deskripsi, budget, deadline, dan deliverable.
                        </p>
                    </article>
                    <article className="rounded-lg border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-semibold">Alur Terdokumentasi</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Setiap perubahan status, progres, dan revisi tercatat dengan rapi.
                        </p>
                    </article>
                </section>
                <footer className="container mx-auto px-6 py-8 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Collabite. MVP.
                </footer>
            </main>
        </>
    );
}