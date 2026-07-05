import { Form, Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { FlashBanner } from '@/components/app/flash-banner';
import { FormErrorSummary } from '@/components/app/form-error-summary';
import { SectionPanel } from '@/components/app/section-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    canManageTwoFactor?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules?: string;
};

export default function Security({
    canManageTwoFactor = false,
    twoFactorEnabled = false,
}: Props): ReactNode {
    const flash = usePage().props.flash as
        | { toast?: { type?: string; message?: string } }
        | undefined;
    const toastMessage = flash?.toast?.message;

    return (
        <>
            <Head title="Keamanan" />
            <div className="space-y-6">
                {toastMessage ? <FlashBanner message={toastMessage} /> : null}

                <SectionPanel
                    title="Ubah Password"
                    description="Gunakan password yang kuat dan unik untuk melindungi akun Collabite Anda."
                >
                    <Form action="/settings/password" method="put" className="space-y-4">
                        {({ errors, processing }) => (
                            <>
                                <FormErrorSummary errors={errors} />
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">
                                        Password saat ini
                                    </Label>
                                    <Input
                                        id="current_password"
                                        name="current_password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        aria-invalid={Boolean(errors.current_password) || undefined}
                                    />
                                    <InputError message={errors.current_password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password baru</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        aria-invalid={Boolean(errors.password) || undefined}
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi password baru
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        aria-invalid={Boolean(errors.password_confirmation) || undefined}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                                <div className="flex justify-end">
                                    <Button disabled={processing} type="submit">
                                        {processing ? 'Menyimpan...' : 'Perbarui Password'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </SectionPanel>

                {canManageTwoFactor ? (
                    <SectionPanel
                        title="Autentikasi Dua Faktor"
                        description="Tambahkan lapisan keamanan ekstra pada akun Anda."
                    >
                        <p className="text-sm text-muted-foreground">
                            {twoFactorEnabled
                                ? 'Autentikasi dua faktor aktif untuk akun ini.'
                                : 'Autentikasi dua faktor belum diaktifkan.'}
                        </p>
                    </SectionPanel>
                ) : null}
            </div>
        </>
    );
}
