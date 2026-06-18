import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import { login, register } from '@/routes';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
                <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="mb-1 text-2xl font-bold">Masuk ke Collabite</h1>
                    <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
                        Belum punya akun?{' '}
                        <TextLink href={register()}>Daftar di sini</TextLink>
                    </p>
                    {status ? (
                        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {status}
                        </div>
                    ) : null}
                    <Form action={login()} method="post" resetOnSuccess={['password']} className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" required autoFocus tabIndex={1} autoComplete="email" />
                            <InputError message={undefined} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {canResetPassword ? (
                                    <Link href="/forgot-password" className="text-xs text-slate-600 hover:underline">
                                        Lupa password?
                                    </Link>
                                ) : null}
                            </div>
                            <Input id="password" type="password" name="password" required tabIndex={2} autoComplete="current-password" />
                        </div>
                        <Button type="submit" tabIndex={3}>
                            Masuk
                        </Button>
                    </Form>
                </div>
            </div>
        </>
    );
}