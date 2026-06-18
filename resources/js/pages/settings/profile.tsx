import { Head, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
};

export default function Profile({ mustVerifyEmail, status }: Props) {
    const user = usePage().props.auth.user as { name: string; email: string };

    return (
        <SettingsLayout>
            <Head title="Profile" />
            <div className="space-y-6">
                <h1 className="text-xl font-semibold">Profil</h1>
                {status ? <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-sm">{status}</div> : null}
                <Form action="/settings/profile" method="patch" className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nama</Label>
                        <Input id="name" name="name" defaultValue={user.name} required />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" name="email" defaultValue={user.email} required />
                    </div>
                    <Button type="submit">Simpan</Button>
                </Form>
            </div>
        </SettingsLayout>
    );
}
