import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { PageBackButton, WorkspacePage } from '@/components/app/workspace-page';
import { Button } from '@/components/ui/button';
import { toUrl } from '@/lib/utils';
import { index } from '@/routes/notifications';

type NotificationDetail = {
    id: string;
    title: string;
    body: string;
    href: string | null;
    read_at: string | null;
    created_at: string | null;
    is_read: boolean;
    type: string;
    data: Record<string, unknown>;
};

type Props = {
    notification: NotificationDetail;
};

export default function NotificationsShow({ notification }: Props): ReactNode {
    return (
        <>
            <Head title={notification.title} />
            <WorkspacePage
                actions={<PageBackButton href={toUrl(index())} label="Semua notifikasi" />}
                description={notification.created_at ?? undefined}
                meta={
                    <StatusBadge
                        label={notification.is_read ? 'Sudah dibaca' : 'Belum dibaca'}
                        tone={notification.is_read ? 'neutral' : 'info'}
                    />
                }
                title={notification.title}
            >
                <div className="max-w-3xl space-y-6">
                    <SectionPanel title="Ringkasan">
                        <p className="text-sm leading-relaxed text-foreground">
                            {notification.body}
                        </p>
                    </SectionPanel>

                    {notification.href ? (
                        <SectionPanel title="Tindakan terkait">
                            <Button asChild>
                                <Link href={notification.href} prefetch>
                                    Buka halaman terkait
                                </Link>
                            </Button>
                        </SectionPanel>
                    ) : null}
                </div>
            </WorkspacePage>
        </>
    );
}
