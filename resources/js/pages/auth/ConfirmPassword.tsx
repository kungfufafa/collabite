import { Form, Head, usePage } from '@inertiajs/react';
import { ArrowRight, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

import { FormErrorSummary } from '@/components/app/form-error-summary';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mergeValidationErrors  } from '@/lib/form-errors';
import type {ValidationErrors} from '@/lib/form-errors';

export default function ConfirmPassword(): ReactNode {
    const pageErrors = (usePage().props.errors ?? {}) as ValidationErrors;

    return (
        <>
            <Head title="Konfirmasi Password" />
            <div className="text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Konfirmasi kata sandi
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Masukkan kata sandi Anda untuk melanjutkan.
                </p>
            </div>

            <Form
                action="/confirm-password"
                method="post"
                className="mt-5 space-y-4"
            >
                {({ errors, processing }) => {
                    const validationErrors = mergeValidationErrors(pageErrors, errors);

                    return (
                        <>
                            <FormErrorSummary errors={validationErrors} />

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Kata Sandi</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        className="h-11 pl-9"
                                        required
                                        autoFocus
                                        aria-invalid={Boolean(validationErrors.password) || undefined}
                                    />
                                </div>
                                <InputError message={validationErrors.password} className="mt-1" />
                            </div>
                            <Button type="submit" disabled={processing} className="h-11 w-full">
                                {processing ? 'Memverifikasi...' : 'Konfirmasi'}
                                <ArrowRight className="size-4" />
                            </Button>
                        </>
                    );
                }}
            </Form>
        </>
    );
}
