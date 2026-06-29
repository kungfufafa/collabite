import { Form, Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { FlashBanner } from '@/components/app/flash-banner';
import { SectionPanel } from '@/components/app/section-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

type Props = {
    status?: string;
};

export default function Profile({ status }: Props): ReactNode {
    const user = usePage().props.auth.user as { name: string; email: string };

    return (
        <SettingsLayout>
            <Head title="Profil" />
            <div className="space-y-6">
                {status ? <FlashBanner message={status} /> : null}
                <SectionPanel title="Informasi Akun">
                    <Form action="/settings/profile" method="patch" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input id="name" name="name" defaultValue={user.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                defaultValue={user.email}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Simpan</Button>
                        </div>
                    </Form>
                </SectionPanel>
            </div>
        </SettingsLayout>
    );
}
