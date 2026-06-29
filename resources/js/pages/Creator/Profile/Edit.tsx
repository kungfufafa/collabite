import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler, ReactNode } from 'react';

import InputError from '@/components/input-error';
import { PageHeader } from '@/components/app/page-header';
import { SectionPanel } from '@/components/app/section-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
            <div>
                <PageHeader
                    title="Profil Creator"
                    description={`Perbarui bio, lokasi, dan kontak. Status verifikasi: ${profile.verification_status}.`}
                />

                <div className="mt-8 max-w-3xl">
                    <SectionPanel title="Informasi Profil">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="headline">Headline</Label>
                                <Input
                                    id="headline"
                                    value={form.data.headline}
                                    onChange={(e) => form.setData('headline', e.target.value)}
                                    maxLength={160}
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
                                    />
                                    <InputError message={form.errors.city} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Telepon</Label>
                                    <Input
                                        id="contact_phone"
                                        value={form.data.contact_phone}
                                        onChange={(e) => form.setData('contact_phone', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_email">Email Kontak</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={form.data.contact_email}
                                    onChange={(e) => form.setData('contact_email', e.target.value)}
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
            </div>
        </>
    );
}
