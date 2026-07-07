import { Form, Head, usePage } from '@inertiajs/react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import type { ReactNode } from 'react';

import { FormErrorSummary } from '@/components/app/form-error-summary';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mergeValidationErrors  } from '@/lib/form-errors';
import type {ValidationErrors} from '@/lib/form-errors';

type Props = {
    token?: string;
    email?: string;
};

export default function ResetPassword({ token, email }: Props): ReactNode {
    const pageErrors = (usePage().props.errors ?? {}) as ValidationErrors;

    return (
        <>
            <Head title="Reset Password" />
            <div className="text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Atur ulang kata sandi
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Silakan masukkan kata sandi baru untuk akun Anda.
                </p>
            </div>

            <Form
                action="/reset-password"
                method="post"
                className="mt-5 space-y-4"
            >
                {({ errors, processing }) => {
                    const validationErrors = mergeValidationErrors(pageErrors, errors);

                    return (
                        <>
                            <FormErrorSummary errors={validationErrors} />

                            <input type="hidden" name="token" value={token ?? ''} />
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        defaultValue={email ?? ''}
                                        className="h-11 pl-9"
                                        required
                                        aria-invalid={Boolean(validationErrors.email) || undefined}
                                    />
                                </div>
                                <InputError message={validationErrors.email} className="mt-1" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Kata Sandi Baru</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        className="h-11 pl-9"
                                        required
                                        minLength={8}
                                        aria-invalid={Boolean(validationErrors.password) || undefined}
                                    />
                                </div>
                                <InputError message={validationErrors.password} className="mt-1" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi Kata Sandi
                                </Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        className="h-11 pl-9"
                                        required
                                        minLength={8}
                                        aria-invalid={
                                            Boolean(validationErrors.password_confirmation) ||
                                            undefined
                                        }
                                    />
                                </div>
                                <InputError
                                    message={validationErrors.password_confirmation}
                                    className="mt-1"
                                />
                            </div>
                            <Button type="submit" disabled={processing} className="h-11 w-full">
                                {processing ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
                                <ArrowRight className="size-4" />
                            </Button>
                        </>
                    );
                }}
            </Form>
        </>
    );
}
