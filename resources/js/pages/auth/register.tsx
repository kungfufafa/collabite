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

import { terms } from '@/routes/public';
import { OptionChipGrid } from '@/components/auth/option-chip-grid';
import {
    RoleSelector,
    type AuthRole,
} from '@/components/auth/role-selector';
import { brutalBtnPrimary, brutalBtnSecondary } from '@/components/collabite/landing/brutal-styles';
import { FormErrorSummary } from '@/components/app/form-error-summary';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { type ValidationErrorValue } from '@/lib/form-errors';

type Props = {
    role: AuthRole | null;
    skills: { id: number; name: string }[];
    categories: { id: number; name: string }[];
};

function FieldGroup({
    label,
    htmlFor,
    error,
    children,
}: {
    label: string;
    htmlFor?: string;
    error?: ValidationErrorValue;
    children: ReactNode;
}): ReactNode {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={htmlFor} className="text-xs font-black uppercase tracking-wide">
                {label}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function PasswordFields({
    idPrefix,
    showPassword,
    onToggle,
    errors,
}: {
    idPrefix: string;
    showPassword: boolean;
    onToggle: () => void;
    errors: Record<string, string | undefined>;
}): ReactNode {
    return (
        <>
            <FieldGroup
                label="Kata Sandi"
                htmlFor={`${idPrefix}-password`}
                error={errors.password}
            >
                <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id={`${idPrefix}-password`}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Minimal 8 karakter"
                        className="h-11 px-9"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.password) || undefined}
                    />
                    <button
                        type="button"
                        onClick={onToggle}
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
            </FieldGroup>
            <FieldGroup
                label="Konfirmasi Kata Sandi"
                htmlFor={`${idPrefix}-password-confirmation`}
                error={errors.password_confirmation}
            >
                <Input
                    id={`${idPrefix}-password-confirmation`}
                    type={showPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    placeholder="Ulangi kata sandi"
                    className="h-11"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password_confirmation) || undefined}
                />
            </FieldGroup>
        </>
    );
}

export default function Register({ role: initialRole, skills, categories }: Props): ReactNode {
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

    const togglePassword = (): void => setShowPassword((v) => !v);

    return (
        <>
            <Head title="Daftar Collabite" />

            <div className="flex flex-col gap-5 sm:gap-6">
                <div className="brutal-card bg-white p-4 sm:p-5">
                    <RoleSelector value={role} onChange={selectRole} />
                </div>

                {role === 'umkm' ? (
                    <Form
                        action="/register/umkm"
                        method="post"
                        className="flex flex-col gap-5"
                    >
                        {({ errors }) => (
                            <>
                                <FormErrorSummary errors={errors} />

                                <AuthFormSection
                                    eyebrow="Langkah 1"
                                    title="Data Akun"
                                    description="Informasi login untuk masuk ke dashboard UMKM."
                                >
                                    <FieldGroup
                                        label="Nama Bisnis / UMKM"
                                        htmlFor="umkm-name"
                                        error={errors.name}
                                    >
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="umkm-name"
                                                name="name"
                                                placeholder="Contoh: Kopi Lokal Nusantara"
                                                className="h-11 pl-9"
                                                required
                                                aria-invalid={Boolean(errors.name) || undefined}
                                            />
                                        </div>
                                    </FieldGroup>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FieldGroup
                                            label="Email"
                                            htmlFor="umkm-email"
                                            error={errors.email}
                                        >
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
                                                    aria-invalid={Boolean(errors.email) || undefined}
                                                />
                                            </div>
                                        </FieldGroup>
                                        <div className="hidden sm:block" />
                                        <PasswordFields
                                            idPrefix="umkm"
                                            showPassword={showPassword}
                                            onToggle={togglePassword}
                                            errors={errors}
                                        />
                                    </div>
                                </AuthFormSection>

                                <AuthFormSection
                                    eyebrow="Langkah 2"
                                    title="Profil Usaha"
                                    description="Data bisnis yang ditampilkan ke creator."
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FieldGroup
                                            label="Nama Usaha"
                                            htmlFor="business_name"
                                            error={errors.business_name}
                                        >
                                            <Input
                                                id="business_name"
                                                name="business_name"
                                                className="h-11"
                                                required
                                                aria-invalid={Boolean(errors.business_name) || undefined}
                                            />
                                        </FieldGroup>
                                        <FieldGroup
                                            label="Jenis Usaha"
                                            htmlFor="business_type"
                                            error={errors.business_type}
                                        >
                                            <Input
                                                id="business_type"
                                                name="business_type"
                                                placeholder="F&B, Fashion, dll."
                                                className="h-11"
                                                required
                                                aria-invalid={Boolean(errors.business_type) || undefined}
                                            />
                                        </FieldGroup>
                                    </div>
                                </AuthFormSection>

                                <div className="brutal-card bg-white p-4 sm:p-5">
                                    <label className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                                        <Checkbox id="terms-umkm" required className="mt-0.5" />
                                        <span>
                                            Saya menyetujui{' '}
                                            <Link
                                                href={terms()}
                                                className="font-bold text-foreground underline underline-offset-4 hover:text-primary"
                                                target="_blank"
                                            >
                                                syarat dan ketentuan
                                            </Link>{' '}
                                            Collabite.
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        className={`${brutalBtnPrimary} mt-4 h-12 w-full text-sm`}
                                    >
                                        Daftar sebagai UMKM
                                        <ArrowRight className="size-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                ) : (
                    <Form
                        action="/register/creator"
                        method="post"
                        className="flex flex-col gap-5"
                    >
                        {({ errors }) => (
                            <>
                                <FormErrorSummary errors={errors} />

                                <AuthFormSection
                                    eyebrow="Langkah 1"
                                    title="Data Akun"
                                    description="Email dan kata sandi untuk akses portal creator."
                                >
                                    <FieldGroup
                                        label="Nama Lengkap"
                                        htmlFor="creator-name"
                                        error={errors.name}
                                    >
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="creator-name"
                                                name="name"
                                                placeholder="Nama lengkapmu"
                                                className="h-11 pl-9"
                                                required
                                                aria-invalid={Boolean(errors.name) || undefined}
                                            />
                                        </div>
                                    </FieldGroup>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FieldGroup
                                            label="Email"
                                            htmlFor="creator-email"
                                            error={errors.email}
                                        >
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
                                                    aria-invalid={Boolean(errors.email) || undefined}
                                                />
                                            </div>
                                        </FieldGroup>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <PasswordFields
                                            idPrefix="creator"
                                            showPassword={showPassword}
                                            onToggle={togglePassword}
                                            errors={errors}
                                        />
                                    </div>
                                </AuthFormSection>

                                <AuthFormSection
                                    eyebrow="Langkah 2"
                                    title="Profil Creator"
                                    description="Informasi dasar yang membantu UMKM menemukanmu."
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FieldGroup
                                            label="Kota"
                                            htmlFor="city"
                                            error={errors.city}
                                        >
                                            <Input
                                                id="city"
                                                name="city"
                                                placeholder="Jakarta, Bandung, dll."
                                                className="h-11"
                                                aria-invalid={Boolean(errors.city) || undefined}
                                            />
                                        </FieldGroup>
                                        <FieldGroup
                                            label="Kontak (opsional)"
                                            htmlFor="contact_phone"
                                            error={errors.contact_phone}
                                        >
                                            <Input
                                                id="contact_phone"
                                                name="contact_phone"
                                                placeholder="08xx xxxx xxxx"
                                                className="h-11"
                                                aria-invalid={Boolean(errors.contact_phone) || undefined}
                                            />
                                        </FieldGroup>
                                    </div>
                                </AuthFormSection>

                                <AuthFormSection
                                    eyebrow="Langkah 3"
                                    title="Kategori & Keahlian"
                                    description="Pilih area konten yang kamu kuasai. Bisa lebih dari satu."
                                >
                                    <FieldGroup
                                        label="Kategori Konten"
                                        error={errors.category_ids}
                                    >
                                        <OptionChipGrid
                                            name="category_ids"
                                            options={categories}
                                            columns={3}
                                        />
                                    </FieldGroup>
                                    <FieldGroup label="Keahlian" error={errors.skill_ids}>
                                        <OptionChipGrid
                                            name="skill_ids"
                                            options={skills}
                                            columns={3}
                                        />
                                    </FieldGroup>
                                </AuthFormSection>

                                <div className="brutal-card bg-white p-4 sm:p-5">
                                    <label className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                                        <Checkbox
                                            id="terms-creator"
                                            required
                                            className="mt-0.5"
                                        />
                                        <span>
                                            Saya menyetujui{' '}
                                            <Link
                                                href={terms()}
                                                className="font-bold text-foreground underline underline-offset-4 hover:text-primary"
                                                target="_blank"
                                            >
                                                syarat dan ketentuan
                                            </Link>{' '}
                                            Collabite.
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        className={`${brutalBtnSecondary} mt-4 h-12 w-full text-sm`}
                                    >
                                        Daftar sebagai Creator
                                        <ArrowRight className="size-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                )}

                <p className="text-center text-sm font-medium text-muted-foreground">
                    Sudah punya akun?{' '}
                    <Link
                        href={login()}
                        className="font-black text-[var(--brand-primary-hover)] hover:underline"
                    >
                        Masuk
                    </Link>
                </p>
            </div>
        </>
    );
}
