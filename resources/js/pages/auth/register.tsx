import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';

type Props = {
    role: 'umkm' | 'creator' | null;
};

export default function Register({ role }: Props) {
    const isUmkm = role === 'umkm';
    const isCreator = role === 'creator';

    return (
        <>
            <Head title="Daftar Collabite" />
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
                <div className="w-full max-w-lg rounded-lg border bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="mb-1 text-2xl font-bold">Daftar di Collabite</h1>
                    <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
                        Sudah punya akun?{' '}
                        <Link href={login()} className="text-slate-900 underline dark:text-slate-100">
                            Masuk di sini
                        </Link>
                    </p>

                    <div className="mb-6 grid grid-cols-2 gap-3">
                        <Link
                            href="/register?role=umkm"
                            className={`rounded border p-3 text-center text-sm font-medium ${
                                isUmkm ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'
                            }`}
                        >
                            Saya UMKM
                        </Link>
                        <Link
                            href="/register?role=creator"
                            className={`rounded border p-3 text-center text-sm font-medium ${
                                isCreator ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'
                            }`}
                        >
                            Saya Creator
                        </Link>
                    </div>

                    {isUmkm ? (
                        <Form action="/register/umkm" method="post" className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="name">Nama Anda</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" required />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" name="password" required minLength={8} />
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <Input id="password_confirmation" type="password" name="password_confirmation" required minLength={8} />
                            </div>
                            <div>
                                <Label htmlFor="business_name">Nama Usaha</Label>
                                <Input id="business_name" name="business_name" required />
                            </div>
                            <div>
                                <Label htmlFor="business_type">Jenis Usaha</Label>
                                <Input id="business_type" name="business_type" required />
                            </div>
                            <Button type="submit">Daftar UMKM</Button>
                        </Form>
                    ) : null}

                    {isCreator ? (
                        <Form action="/register/creator" method="post" className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="name">Nama Anda</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" required />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" name="password" required minLength={8} />
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <Input id="password_confirmation" type="password" name="password_confirmation" required minLength={8} />
                            </div>
                            <div>
                                <Label htmlFor="city">Kota</Label>
                                <Input id="city" name="city" />
                            </div>
                            <div>
                                <Label htmlFor="contact_phone">Kontak (opsional)</Label>
                                <Input id="contact_phone" name="contact_phone" />
                            </div>
                            <Button type="submit">Daftar Creator</Button>
                        </Form>
                    ) : null}

                    {!isUmkm && !isCreator ? (
                        <p className="text-sm text-slate-500">Pilih peran terlebih dahulu untuk melanjutkan.</p>
                    ) : null}
                </div>
            </div>
        </>
    );
}