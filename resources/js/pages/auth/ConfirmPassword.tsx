import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmPassword(): ReactNode {
    return (
        <>
            <Head title="Konfirmasi Password" />
            <div className="text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Konfirmasi kata sandi
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Masukkan kata sandi Anda untuk melanjutkan.
                </p>
            </div>

            <Form
                action="/confirm-password"
                method="post"
                className="mt-5 space-y-4"
            >
                <div className="space-y-1.5">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            className="h-11 pl-9"
                            required
                            autoFocus
                        />
                    </div>
                </div>
                <Button type="submit" className="h-11 w-full">
                    Konfirmasi
                    <ArrowRight className="size-4" />
                </Button>
            </Form>
        </>
    );
}
