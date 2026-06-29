import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    Megaphone,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { ActivityTimeline } from '@/components/app/activity-timeline';
import { DashboardSection } from '@/components/app/dashboard-section';
import { InitialsAvatar } from '@/components/app/initials-avatar';
import { MetricTile } from '@/components/app/metric-tile';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import type {
    DashboardActivityItem,
    DashboardHealth,
    DashboardStat,
    DashboardTableRow,
} from '@/components/dashboard/types';
import { Button } from '@/components/ui/button';
import { create as umkmCampaignsCreate, index as umkmCampaignsIndex } from '@/routes/umkm/campaigns';
import { index as umkmCollaborationsIndex } from '@/routes/umkm/collaborations';
import { index as umkmDiscoverIndex } from '@/routes/umkm/discover';

type Props = {
    stats: DashboardStat[];
    profile: { business_name: string; city: string | null } | null;
    recent_collaborations: DashboardTableRow[];
    activity: DashboardActivityItem[];
    health: DashboardHealth;
};

function statValue(stats: DashboardStat[], label: string): string {
    return stats.find((item) => item.label === label)?.value ?? '0';
}

export default function UmkmDashboard({
    stats,
    profile,
    recent_collaborations,
    activity,
    health,
}: Props): ReactNode {
    const businessName = profile?.business_name ?? 'UMKM';

    return (
        <>
            <Head title="Dashboard UMKM" />
            <div data-testid="umkm-home">
                <PageHeader
                    title="Dashboard"
                    description="Pantau campaign, tinjau lamaran, dan ambil keputusan konten dari satu tempat."
                    meta={
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                            <InitialsAvatar
                                name={businessName}
                                size="sm"
                                tone="secondary"
                            />
                            {businessName}
                            {profile?.city ? ` · ${profile.city}` : ''}
                        </span>
                    }
                    actions={
                        <Button asChild>
                            <Link href={umkmCampaignsCreate().url}>
                                <Plus className="size-4" />
                                Buat Campaign
                            </Link>
                        </Button>
                    }
                />

                <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <MetricTile
                        emphasis
                        hint="Perlu ditinjau"
                        href={umkmCollaborationsIndex().url}
                        icon={ClipboardList}
                        label="Lamaran menunggu"
                        value={statValue(stats, 'Lamaran menunggu')}
                    />
                    <MetricTile
                        hint="Sedang berjalan"
                        href={umkmCollaborationsIndex().url}
                        icon={Users}
                        label="Kolaborasi aktif"
                        value={statValue(stats, 'Kolaborasi aktif')}
                    />
                    <MetricTile
                        hint="Menerima creator"
                        href={umkmCampaignsIndex().url}
                        icon={Megaphone}
                        label="Campaign terbuka"
                        value={statValue(stats, 'Campaign terbuka')}
                    />
                    <MetricTile
                        hint="Cari mitra konten"
                        href={umkmDiscoverIndex().url}
                        icon={Search}
                        label="Cari creator"
                        value="→"
                    />
                </div>

                {!health.caught_up ? (
                    <div className="mt-8">
                        <DashboardSection
                            description="Lamaran dan konten yang perlu keputusanmu."
                            title="Perlu keputusanmu"
                        >
                            <ResourceCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <StatusBadge
                                        label="Menunggu tindakan"
                                        tone="warning"
                                    />
                                    <p className="mt-2 text-sm text-foreground">
                                        {health.message}
                                    </p>
                                </div>
                                <Button asChild className="shrink-0" variant="outline">
                                    <Link href={umkmCollaborationsIndex().url}>
                                        Tinjau sekarang
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            </ResourceCard>
                        </DashboardSection>
                    </div>
                ) : null}

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <DashboardSection
                            action={{
                                href: umkmCollaborationsIndex().url,
                                label: 'Lihat semua',
                            }}
                            title="Kolaborasi terbaru"
                        >
                            {recent_collaborations.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada kolaborasi aktif.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {recent_collaborations.map((row) => (
                                        <ResourceCard
                                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                            key={row.id}
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-foreground">
                                                    {row.title}
                                                </p>
                                                {row.meta ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        {row.meta}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                {row.status ? (
                                                    <StatusBadge
                                                        label={row.status}
                                                        tone="info"
                                                    />
                                                ) : null}
                                                <Button asChild size="sm" variant="ghost">
                                                    <Link href={row.href}>
                                                        Lihat
                                                    </Link>
                                                </Button>
                                            </div>
                                        </ResourceCard>
                                    ))}
                                </div>
                            )}
                        </DashboardSection>
                    </div>

                    <DashboardSection title="Aktivitas operasional">
                        <ActivityTimeline items={activity} />
                    </DashboardSection>
                </div>
            </div>
        </>
    );
}
