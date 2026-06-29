import { Form, Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Mail,
    User,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import {
    RoleSelector,
    type AuthRole,
} from '@/components/auth/role-selector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';

type Props = {
    role: AuthRole | null;
};

export default function Register({ role: initialRole }: Props): ReactNode {
    const [role, setRole] = useState<AuthRole>(
        initialRole === 'creator' ? 'creator' : 'umkm',
    );
    const [showPassword, setShowPassword] = useState(false);

    const selectRole = (nextRole: AuthRole): void => {
        setRole(nextRole);
        router.visit(`/register?role=${nextRole}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Daftar Collabite" />

            <div className="flex flex-col gap-6">
                <RoleSelector value={role} onChange={selectRole} />

                {role === 'umkm' ? (
                    <Form
                        action="/register/umkm"
                        method="post"
                        className="flex flex-col gap-5"
                    >
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="umkm-name">Nama Bisnis / UMKM</Label>
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="umkm-name"
                                    name="name"
                                    placeholder="Contoh: Kopi Lokal Nusantara"
                                    className="h-11 pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="umkm-email">Email</Label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="umkm-email"
                                    type="email"
                                    name="email"
                                    placeholder="nama@email.com"
                                    className="h-11 pl-9"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="umkm-password">Kata Sandi</Label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="umkm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    className="h-11 px-9"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
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
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="umkm-password-confirmation">
                                Konfirmasi Kata Sandi
                            </Label>
                            <Input
                                id="umkm-password-confirmation"
                                type={showPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                placeholder="Ulangi kata sandi"
                                className="h-11"
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="business_name">Nama Usaha</Label>
                            <Input
                                id="business_name"
                                name="business_name"
                                className="h-11"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="business_type">Jenis Usaha</Label>
                            <Input
                                id="business_type"
                                name="business_type"
                                className="h-11"
                                required
                            />
                        </div>
                        <label className="flex items-start gap-3 pt-1 text-sm text-muted-foreground">
                            <Checkbox id="terms-umkm" required className="mt-0.5" />
                            <span>
                                Saya menyetujui syarat dan ketentuan Collabite.
                            </span>
                        </label>
                        <Button
                            type="submit"
                            className="mt-1 h-11 w-full text-base shadow-sm"
                        >
                            Daftar sebagai UMKM
                            <ArrowRight className="size-4" />
                        </Button>
                    </Form>
                ) : (
                    <Form
                        action="/register/creator"
                        method="post"
                        className="flex flex-col gap-5"
                    >
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="creator-name">Nama Lengkap</Label>
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="creator-name"
                                    name="name"
                                    placeholder="Nama lengkapmu"
                                    className="h-11 pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="creator-email">Email</Label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="creator-email"
                                    type="email"
                                    name="email"
                                    placeholder="nama@email.com"
                                    className="h-11 pl-9"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="creator-password">Kata Sandi</Label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="creator-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    className="h-11 px-9"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
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
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="creator-password-confirmation">
                                Konfirmasi Kata Sandi
                            </Label>
                            <Input
                                id="creator-password-confirmation"
                                type={showPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                placeholder="Ulangi kata sandi"
                                className="h-11"
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="city">Kota</Label>
                            <Input id="city" name="city" className="h-11" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="contact_phone">
                                Kontak (opsional)
                            </Label>
                            <Input
                                id="contact_phone"
                                name="contact_phone"
                                className="h-11"
                            />
                        </div>
                        <label className="flex items-start gap-3 pt-1 text-sm text-muted-foreground">
                            <Checkbox
                                id="terms-creator"
                                required
                                className="mt-0.5"
                            />
                            <span>
                                Saya menyetujui syarat dan ketentuan Collabite.
                            </span>
                        </label>
                        <Button
                            type="submit"
                            className="mt-1 h-11 w-full text-base shadow-sm"
                        >
                            Daftar sebagai Creator
                            <ArrowRight className="size-4" />
                        </Button>
                    </Form>
                )}

                <p className="pt-2 text-center text-sm text-muted-foreground">
                    Sudah punya akun?{' '}
                    <Link
                        href={login()}
                        className="font-medium text-[var(--brand-primary-hover)] hover:underline"
                    >
                        Masuk
                    </Link>
                </p>
            </div>
        </>
    );
}
