import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Briefcase,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { ActivityTimeline } from '@/components/app/activity-timeline';
import { DashboardSection } from '@/components/app/dashboard-section';
import { MetricTile } from '@/components/app/metric-tile';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import type {
    DashboardActivityLogItem,
    DashboardHealth,
    DashboardQueueItem,
    DashboardStat,
} from '@/components/dashboard/types';
import { Button } from '@/components/ui/button';

type Props = {
    stats: DashboardStat[];
    summary?: {
        total_umkm: number;
        total_creators: number;
    };
    recent_activity?: DashboardActivityLogItem[];
    moderation_queues?: {
        verifications: DashboardQueueItem[];
        campaigns: DashboardQueueItem[];
        content: DashboardQueueItem[];
    };
    health: DashboardHealth;
};

function statValue(stats: DashboardStat[], label: string): string {
    return stats.find((item) => item.label === label)?.value ?? '0';
}

export default function Index({
    stats,
    summary,
    recent_activity = [],
    moderation_queues,
    health,
}: Props): ReactNode {
    const verifications = moderation_queues?.verifications ?? [];
    const campaigns = moderation_queues?.campaigns ?? [];
    const content = moderation_queues?.content ?? [];

    const activityItems = recent_activity.map((item) => ({
        title: [item.actor, item.action, item.subject].filter(Boolean).join(' · '),
        time: item.created_at,
    }));

    return (
        <>
            <Head title="Dashboard Admin" />
            <div data-testid="admin-dashboard">
                <PageHeader
                    description="Pantauan operasional Collabite."
                    title="Dashboard Admin"
                />

                <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <MetricTile
                        hint={
                            summary
                                ? `UMKM: ${summary.total_umkm} · Creator: ${summary.total_creators}`
                                : 'Seluruh pengguna terdaftar'
                        }
                        href="/admin/users"
                        icon={Users}
                        label="Total pengguna"
                        value={statValue(stats, 'Total pengguna')}
                    />
                    <MetricTile
                        emphasis={Number(statValue(stats, 'Verifikasi pending')) > 0}
                        hint="Pengajuan menunggu review"
                        href="/admin/verifications"
                        icon={AlertTriangle}
                        label="Verifikasi pending"
                        value={statValue(stats, 'Verifikasi pending')}
                    />
                    <MetricTile
                        hint="Sedang menerima creator"
                        href="/admin/moderation/campaigns"
                        icon={Briefcase}
                        label="Campaign terbuka"
                        value={statValue(stats, 'Campaign terbuka')}
                    />
                    <MetricTile
                        hint="On-progress lintas UMKM/Creator"
                        href="/admin/collaborations"
                        icon={Activity}
                        label="Kolaborasi aktif"
                        value={statValue(stats, 'Kolaborasi aktif')}
                    />
                </div>

                {!health.caught_up ? (
                    <div className="mt-8">
                        <ResourceCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-foreground">{health.message}</p>
                            <Button asChild className="shrink-0" variant="outline">
                                <Link href="/admin/verifications">
                                    Buka antrean
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </ResourceCard>
                    </div>
                ) : null}

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <DashboardSection
                            action={{
                                href: '/admin/verifications',
                                label: 'Lihat semua',
                            }}
                            description="Pengajuan Creator yang perlu ditinjau."
                            title="Antrean verifikasi"
                        >
                            <QueueList empty="Tidak ada pengajuan menunggu." items={verifications} />
                        </DashboardSection>

                        <DashboardSection
                            action={{
                                href: '/admin/moderation/campaigns',
                                label: 'Lihat semua',
                            }}
                            description="Campaign tersembunyi yang dapat dipulihkan."
                            title="Moderasi campaign"
                        >
                            <QueueList empty="Tidak ada campaign tersembunyi." items={campaigns} />
                        </DashboardSection>

                        <DashboardSection
                            action={{
                                href: '/admin/moderation/content',
                                label: 'Lihat semua',
                            }}
                            description="Submission tersembunyi yang dapat dipulihkan."
                            title="Moderasi konten"
                        >
                            <QueueList empty="Tidak ada submission tersembunyi." items={content} />
                        </DashboardSection>
                    </div>

                    <DashboardSection
                        action={{
                            href: '/admin/audit-logs',
                            label: 'Lihat audit log',
                        }}
                        description="Catatan append-only dari sistem."
                        title="Aktivitas terbaru"
                    >
                        <ActivityTimeline items={activityItems} />
                    </DashboardSection>
                </div>
            </div>
        </>
    );
}

function QueueList({
    items,
    empty,
}: {
    items: DashboardQueueItem[];
    empty: string;
}): ReactNode {
    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">{empty}</p>;
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map((item) => (
                <ResourceCard
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    key={item.id}
                >
                    <div className="min-w-0">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.meta}</p>
                    </div>
                    <Button asChild className="shrink-0" size="sm" variant="outline">
                        <Link href={item.href}>{item.cta}</Link>
                    </Button>
                </ResourceCard>
            ))}
        </div>
    );
}
