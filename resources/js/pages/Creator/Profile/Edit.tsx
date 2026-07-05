import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler, ReactNode } from 'react';

import { FormErrorSummary } from '@/components/app/form-error-summary';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { WorkspacePage } from '@/components/app/workspace-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fieldErrorProps } from '@/lib/form-errors';

type Profile = {
    id: number;
    headline: string | null;
    bio: string | null;
    city: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    verification_status: string;
    profile_photo_url: string | null;
};

type Props = { profile: Profile };

export default function Edit({ profile }: Props): ReactNode {
    const form = useForm({
        headline: profile.headline ?? '',
        bio: profile.bio ?? '',
        city: profile.city ?? '',
        contact_phone: profile.contact_phone ?? '',
        contact_email: profile.contact_email ?? '',
        profile_photo: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/creator/profile', { forceFormData: true });
    };

    return (
        <>
            <Head title="Profil Creator" />
            <WorkspacePage
                description="Perbarui bio, lokasi, dan kontak agar profil lebih menarik di mata UMKM."
                meta={
                    <StatusBadge
                        label={`Verifikasi: ${profile.verification_status}`}
                        tone={
                            profile.verification_status === 'verified'
                                ? 'success'
                                : profile.verification_status === 'pending'
                                  ? 'warning'
                                  : 'neutral'
                        }
                    />
                }
                title="Profil Creator"
            >
                <div className="max-w-3xl">
                    <SectionPanel title="Informasi Profil">
                        <form onSubmit={submit} className="space-y-4">
                            <FormErrorSummary errors={form.errors} />

                            <div className="space-y-2">
                                <Label htmlFor="headline">Headline</Label>
                                <Input
                                    id="headline"
                                    value={form.data.headline}
                                    onChange={(e) => form.setData('headline', e.target.value)}
                                    maxLength={160}
                                    {...fieldErrorProps(form.errors.headline)}
                                />
                                <InputError message={form.errors.headline} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    rows={5}
                                    value={form.data.bio}
                                    onChange={(e) => form.setData('bio', e.target.value)}
                                    {...fieldErrorProps(form.errors.bio)}
                                />
                                <InputError message={form.errors.bio} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Kota</Label>
                                    <Input
                                        id="city"
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                        {...fieldErrorProps(form.errors.city)}
                                    />
                                    <InputError message={form.errors.city} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Telepon</Label>
                                    <Input
                                        id="contact_phone"
                                        value={form.data.contact_phone}
                                        onChange={(e) =>
                                            form.setData('contact_phone', e.target.value)
                                        }
                                        {...fieldErrorProps(form.errors.contact_phone)}
                                    />
                                    <InputError message={form.errors.contact_phone} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_email">Email Kontak</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={form.data.contact_email}
                                    onChange={(e) => form.setData('contact_email', e.target.value)}
                                    {...fieldErrorProps(form.errors.contact_email)}
                                />
                                <InputError message={form.errors.contact_email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profile_photo">Foto Profil</Label>
                                {profile.profile_photo_url ? (
                                    <img
                                        src={profile.profile_photo_url}
                                        alt="Foto saat ini"
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                ) : null}
                                <Input
                                    id="profile_photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        form.setData('profile_photo', e.target.files?.[0] ?? null)
                                    }
                                    {...fieldErrorProps(form.errors.profile_photo)}
                                />
                                <InputError message={form.errors.profile_photo} />
                            </div>

                            <div className="flex items-center justify-end">
                                <Button type="submit" disabled={form.processing}>
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </SectionPanel>
                </div>
            </WorkspacePage>
        </>
    );
}
