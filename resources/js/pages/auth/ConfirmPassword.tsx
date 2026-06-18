import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi Password" />
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
                <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="mb-1 text-2xl font-bold">Konfirmasi Password</h1>
                    <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
                        Masukkan password Anda untuk melanjutkan.
                    </p>
                    <Form action="/confirm-password" method="post" className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" name="password" required autoFocus />
                        </div>
                        <Button type="submit">Konfirmasi</Button>
                    </Form>
                </div>
            </div>
        </>
    );
}