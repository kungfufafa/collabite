export type DashboardStat = {
    label: string;
    value: string;
    delta?: number;
};

export type DashboardDailyPoint = {
    label: string;
    value: number;
};

export type DashboardDualPoint = {
    label: string;
    date?: string;
    [key: string]: string | number | undefined;
};

export type DashboardTableRow = {
    id: number | string;
    title: string;
    meta?: string;
    status?: string;
    href: string;
};

export type DashboardActivityItem = {
    title: string;
    time: string;
};

export type DashboardQueueItem = {
    id: number;
    title: string;
    meta: string;
    href: string;
    cta: string;
};

export type DashboardHealth = {
    caught_up: boolean;
    message: string;
    percent?: number;
};

export type DashboardCharts = {
    requests_daily?: DashboardDailyPoint[];
    collaborations_daily?: DashboardDualPoint[];
    applications_daily?: DashboardDailyPoint[];
    outcomes_daily?: DashboardDualPoint[];
    registrations_daily?: DashboardDailyPoint[];
    moderation_daily?: DashboardDualPoint[];
};

export type DashboardActivityLogItem = {
    id: number;
    actor: string | null;
    action: string;
    subject: string | null;
    created_at: string;
};
