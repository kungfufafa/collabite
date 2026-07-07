import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Mail } from 'lucide-react';
import type { ReactNode } from 'react';

import { FormErrorSummary } from '@/components/app/form-error-summary';
import { brutalSuccessBanner } from '@/components/collabite/landing/brutal-styles';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mergeValidationErrors  } from '@/lib/form-errors';
import type {ValidationErrors} from '@/lib/form-errors';
import { cn } from '@/lib/utils';
import { login } from '@/routes';

type Props = {
    status?: string;
};

export default function ForgotPassword({ status }: Props): ReactNode {
    const pageErrors = (usePage().props.errors ?? {}) as ValidationErrors;

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
                <div className={cn('mt-6', brutalSuccessBanner)}>
                    {status}
                </div>
            ) : null}

            <Form
                action="/forgot-password"
                method="post"
                className="mt-5 space-y-4"
            >
                {({ errors, processing }) => {
                    const validationErrors = mergeValidationErrors(pageErrors, errors);

                    return (
                        <>
                            <FormErrorSummary errors={validationErrors} />

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
                                        aria-invalid={Boolean(validationErrors.email) || undefined}
                                    />
                                </div>
                                <InputError message={validationErrors.email} className="mt-1" />
                            </div>
                            <Button type="submit" disabled={processing} className="h-11 w-full">
                                {processing ? 'Mengirim...' : 'Kirim Tautan Reset'}
                                <ArrowRight className="size-4" />
                            </Button>
                        </>
                    );
                }}
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
