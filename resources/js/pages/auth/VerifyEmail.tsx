import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Props = {
    status?: string;
};

export default function VerifyEmail({ status }: Props) {
    return (
        <>
            <Head title="Verifikasi Email" />
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
                <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="mb-2 text-2xl font-bold">Verifikasi Email Anda</h1>
                    <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
                        Kami telah mengirim tautan verifikasi ke email Anda. Klik tautan tersebut untuk mengaktifkan akun.
                    </p>
                    {status ? (
                        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {status}
                        </div>
                    ) : null}
                    <form method="post" action="/email/verification-notification">
                        <Button type="submit">Kirim Ulang Tautan</Button>
                    </form>
                    <p className="mt-6 text-sm text-slate-500">
                        <Link href="/logout" method="post" as="button" className="underline">
                            Keluar
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}