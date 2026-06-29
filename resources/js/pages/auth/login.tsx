import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

import { store as loginStore } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';

type Props = {
    status?: string;
    canResetPassword: boolean;
    errors?: {
        email?: string;
        password?: string;
    };
};

export default function Login({
    status,
    canResetPassword,
    errors: initialErrors,
}: Props) {
    const pageProps = usePage();
    const pageErrors = (pageProps?.props as { errors?: Props['errors'] }).errors;
    const serverErrors: NonNullable<Props['errors']> = {
        ...(pageErrors ?? {}),
        ...(initialErrors ?? {}),
    };
    const [errors, setErrors] =
        useState<NonNullable<Props['errors']>>(serverErrors);
    const [showPassword, setShowPassword] = useState(false);
    const displayErrors = { ...serverErrors, ...errors };

    return (
        <>
            <Head title="Masuk" />

            <div className="flex flex-col gap-6">
                {status ? (
                    <div className="rounded-md border border-[var(--success-border)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
                        {status}
                    </div>
                ) : null}

                <Form
                    action={loginStore.url()}
                    method="post"
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                    onError={(errs) =>
                        setErrors(errs as NonNullable<Props['errors']>)
                    }
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="nama@email.com"
                                className="h-11 pl-9"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                            />
                        </div>
                        <InputError
                            message={displayErrors.email}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Kata Sandi</Label>
                            {canResetPassword ? (
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-medium text-[var(--brand-primary-hover)] hover:underline"
                                >
                                    Lupa kata sandi?
                                </Link>
                            ) : null}
                        </div>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Masukkan kata sandi"
                                className="h-11 px-9"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={
                                    showPassword
                                        ? 'Sembunyikan kata sandi'
                                        : 'Tampilkan kata sandi'
                                }
                            >
                                {showPassword ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                            </button>
                        </div>
                        <InputError
                            message={displayErrors.password}
                            className="mt-1"
                        />
                    </div>

                    <label className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Checkbox id="remember" name="remember" value="1" />
                        Ingat saya
                    </label>

                    <Button
                        type="submit"
                        tabIndex={3}
                        className="h-11 w-full text-base shadow-sm"
                        data-testid="login-submit"
                    >
                        Masuk
                        <ArrowRight className="size-4" />
                    </Button>
                </Form>

                <p className="text-center text-sm text-muted-foreground">
                    Belum punya akun?{' '}
                    <TextLink href={register()}>Daftar gratis</TextLink>
                </p>
            </div>
        </>
    );
}
