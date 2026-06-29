import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

type Props = {
    status?: string;
};

export default function VerifyEmail({ status }: Props): ReactNode {
    return (
        <>
            <Head title="Verifikasi Email" />
            <div className="text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Verifikasi email Anda
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Kami telah mengirim tautan verifikasi ke email Anda. Klik
                    tautan tersebut untuk mengaktifkan akun.
                </p>
            </div>

            {status ? (
                <div className="mt-6 rounded-md border border-[var(--success-border)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
                    {status}
                </div>
            ) : null}

            <form
                method="post"
                action="/email/verification-notification"
                className="mt-5"
            >
                <Button type="submit" className="h-11 w-full">
                    Kirim Ulang Tautan
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground lg:text-left">
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="font-medium text-[var(--brand-primary-hover)] hover:underline"
                >
                    Keluar
                </Link>
            </p>
        </>
    );
}
