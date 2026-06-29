import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, Mail } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';

type Props = {
    status?: string;
};

export default function ForgotPassword({ status }: Props): ReactNode {
    return (
        <>
            <Head title="Lupa Password" />
            <div className="text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Lupa kata sandi?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Masukkan email Anda. Kami akan mengirim tautan untuk
                    mengatur ulang kata sandi.
                </p>
            </div>

            {status ? (
                <div className="mt-6 rounded-md border border-[var(--success-border)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
                    {status}
                </div>
            ) : null}

            <Form
                action="/forgot-password"
                method="post"
                className="mt-5 space-y-4"
            >
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            className="h-11 pl-9"
                            required
                            autoFocus
                        />
                    </div>
                </div>
                <Button type="submit" className="h-11 w-full">
                    Kirim Tautan Reset
                    <ArrowRight className="size-4" />
                </Button>
            </Form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Ingat kata sandi?{' '}
                <Link
                    href={login()}
                    className="font-medium text-[var(--brand-primary-hover)] hover:underline"
                >
                    Kembali masuk
                </Link>
            </p>
        </>
    );
}
