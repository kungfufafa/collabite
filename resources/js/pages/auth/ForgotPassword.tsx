import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    status?: string;
};

export default function ForgotPassword({ status }: Props) {
    return (
        <>
            <Head title="Lupa Password" />
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
                <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="mb-1 text-2xl font-bold">Lupa Password</h1>
                    <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
                        Masukkan email Anda. Kami akan mengirim tautan untuk mengatur ulang password.
                    </p>
                    {status ? (
                        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {status}
                        </div>
                    ) : null}
                    <Form action="/forgot-password" method="post" className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" required autoFocus />
                        </div>
                        <Button type="submit">Kirim Tautan Reset</Button>
                    </Form>
                </div>
            </div>
        </>
    );
}