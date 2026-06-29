import { Form, Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { FlashBanner } from '@/components/app/flash-banner';
import { PageHeader } from '@/components/app/page-header';
import { SectionPanel } from '@/components/app/section-panel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { update } from '@/routes/umkm/profile';

type Profile = {
    id: number;
    business_name: string;
    business_type: string;
    description: string | null;
    address: string | null;
    city: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    website_url: string | null;
    logo_url: string | null;
};

export default function Edit({ profile }: { profile: Profile }): ReactNode {
    const flash = usePage().props.status as string | undefined;

    return (
        <>
            <Head title="Profil UMKM" />
            <div>
                <PageHeader
                    title="Profil UMKM"
                    description="Perbarui informasi usaha Anda. Logo akan ditampilkan di halaman publik UMKM."
                />

                {flash ? (
                    <div className="mt-6">
                        <FlashBanner message={flash} />
                    </div>
                ) : null}

                <div className="mt-8 max-w-3xl">
                    <Form {...update.form()} encType="multipart/form-data">
                        {({ errors, processing }) => (
                            <SectionPanel
                                title="Informasi Usaha"
                                description="Data ini akan terlihat oleh Creator saat Anda mempublikasikan campaign."
                                footer={
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                }
                            >
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="size-16">
                                            {profile.logo_url ? (
                                                <AvatarImage
                                                    src={profile.logo_url}
                                                    alt={profile.business_name}
                                                />
                                            ) : null}
                                            <AvatarFallback>
                                                {profile.business_name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <Label htmlFor="logo">Logo Usaha</Label>
                                            <Input
                                                id="logo"
                                                name="logo"
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                                className="mt-1"
                                            />
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                JPG/PNG/WebP, maksimal 2MB.
                                            </p>
                                            <InputError message={errors.logo} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="business_name">Nama Usaha</Label>
                                            <Input
                                                id="business_name"
                                                name="business_name"
                                                defaultValue={profile.business_name}
                                                required
                                                maxLength={160}
                                            />
                                            <InputError message={errors.business_name} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="business_type">Jenis Usaha</Label>
                                            <Input
                                                id="business_type"
                                                name="business_type"
                                                defaultValue={profile.business_type}
                                                required
                                                maxLength={80}
                                            />
                                            <InputError message={errors.business_type} className="mt-1" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            defaultValue={profile.description ?? ''}
                                            maxLength={2000}
                                            rows={4}
                                            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 mt-1 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <InputError message={errors.description} className="mt-1" />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="address">Alamat</Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                defaultValue={profile.address ?? ''}
                                                maxLength={255}
                                            />
                                            <InputError message={errors.address} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="city">Kota</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                defaultValue={profile.city ?? ''}
                                                maxLength={80}
                                            />
                                            <InputError message={errors.city} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="contact_phone">Telepon</Label>
                                            <Input
                                                id="contact_phone"
                                                name="contact_phone"
                                                defaultValue={profile.contact_phone ?? ''}
                                                maxLength={30}
                                            />
                                            <InputError message={errors.contact_phone} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="contact_email">Email Kontak</Label>
                                            <Input
                                                id="contact_email"
                                                name="contact_email"
                                                type="email"
                                                defaultValue={profile.contact_email ?? ''}
                                                maxLength={160}
                                            />
                                            <InputError message={errors.contact_email} className="mt-1" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="website_url">Website</Label>
                                        <Input
                                            id="website_url"
                                            name="website_url"
                                            type="url"
                                            defaultValue={profile.website_url ?? ''}
                                            maxLength={255}
                                            placeholder="https://"
                                        />
                                        <InputError message={errors.website_url} className="mt-1" />
                                    </div>
                                </div>
                            </SectionPanel>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}
