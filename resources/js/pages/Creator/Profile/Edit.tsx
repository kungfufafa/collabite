import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function Edit({ profile }: Props) {
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
        form.post(`/creator/profile`, { forceFormData: true });
    };

    return (
        <>
            <Head title="Profil Creator" />
            <main className="container mx-auto max-w-3xl px-6 py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Creator</CardTitle>
                        <CardDescription>
                            Perbarui bio singkat, lokasi, dan kontak. Status verifikasi saat ini:{' '}
                            <strong>{profile.verification_status}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="headline">Headline</Label>
                                <Input
                                    id="headline"
                                    value={form.data.headline}
                                    onChange={(e) => form.setData('headline', e.target.value)}
                                    maxLength={160}
                                />
                                {form.errors.headline && (
                                    <p className="text-sm text-red-600">{form.errors.headline}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    rows={5}
                                    value={form.data.bio}
                                    onChange={(e) => form.setData('bio', e.target.value)}
                                />
                                {form.errors.bio && (
                                    <p className="text-sm text-red-600">{form.errors.bio}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Kota</Label>
                                    <Input
                                        id="city"
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                    />
                                    {form.errors.city && (
                                        <p className="text-sm text-red-600">{form.errors.city}</p>
                                    )}
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
                                {form.errors.contact_email && (
                                    <p className="text-sm text-red-600">{form.errors.contact_email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profile_photo">Foto Profil</Label>
                                {profile.profile_photo_url && (
                                    <img
                                        src={profile.profile_photo_url}
                                        alt="Foto saat ini"
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                )}
                                <Input
                                    id="profile_photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => form.setData('profile_photo', e.target.files?.[0] ?? null)}
                                />
                                {form.errors.profile_photo && (
                                    <p className="text-sm text-red-600">{form.errors.profile_photo}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Button type="submit" disabled={form.processing}>
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
