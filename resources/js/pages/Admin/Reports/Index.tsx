import { Head, Link } from '@inertiajs/react';
import { Activity, Briefcase, Download, Star, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { MetricTile } from '@/components/app/metric-tile';
import { WorkspacePage } from '@/components/app/workspace-page';
import { Button } from '@/components/ui/button';

type Stats = {
    users_total: number;
    umkm_total: number;
    creator_total: number;
    campaigns_total: number;
    campaigns_open: number;
    campaigns_completed: number;
    collaborations_total: number;
    collaborations_active: number;
    reviews_total: number;
    avg_rating: number;
};

type Props = {
    stats: Stats;
};

export default function AdminReportsIndex({ stats }: Props): ReactNode {
    return (
        <>
            <Head title="Laporan" />
            <WorkspacePage
                actions={
                    <Button asChild variant="outline">
                        <Link href="/admin/reports/export">
                            <Download className="size-4" />
                            Ekspor CSV
                        </Link>
                    </Button>
                }
                description="Ringkasan metrik platform Collabite."
                title="Laporan & Statistik"
            >
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <MetricTile
                        hint="Seluruh akun"
                        href="/admin/users"
                        icon={Users}
                        label="Total pengguna"
                        value={stats.users_total}
                    />
                    <MetricTile
                        hint="Akun bisnis"
                        href="/admin/users"
                        icon={Users}
                        label="UMKM"
                        value={stats.umkm_total}
                    />
                    <MetricTile
                        hint="Akun creator"
                        href="/admin/users"
                        icon={Users}
                        label="Creator"
                        value={stats.creator_total}
                    />
                    <MetricTile
                        hint={`${stats.campaigns_open} terbuka`}
                        href="/admin/moderation/campaigns"
                        icon={Briefcase}
                        label="Total campaign"
                        value={stats.campaigns_total}
                    />
                    <MetricTile
                        hint={`${stats.collaborations_active} aktif`}
                        href="/admin/collaborations"
                        icon={Activity}
                        label="Kolaborasi"
                        value={stats.collaborations_total}
                    />
                    <MetricTile
                        hint="Campaign selesai"
                        href="/admin/moderation/campaigns"
                        icon={Briefcase}
                        label="Campaign selesai"
                        value={stats.campaigns_completed}
                    />
                    <MetricTile
                        hint="Ulasan platform"
                        href="/admin/moderation/reviews"
                        icon={Star}
                        label="Total review"
                        value={stats.reviews_total}
                    />
                    <MetricTile
                        hint="Rata-rata semua review"
                        href="/admin/moderation/reviews"
                        icon={Star}
                        label="Rating rata-rata"
                        value={stats.avg_rating.toFixed(1)}
                    />
                </div>
            </WorkspacePage>
        </>
    );
}
