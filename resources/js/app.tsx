import { createInertiaApp, usePage } from '@inertiajs/react';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
    creatorPrimaryActions,
    umkmPrimaryAction,
} from '@/config/navigation';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminDashboardLayout from '@/layouts/admin-dashboard-layout';
import AuthLayout from '@/layouts/auth-layout';
import MarketplaceLayout from '@/layouts/marketplace-layout';
import type { MarketplaceLayoutProps } from '@/layouts/marketplace-layout';
import PublicLayout from '@/layouts/public-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { Auth } from '@/types/auth';

const appName = import.meta.env.VITE_APP_NAME || 'Collabite';

type UmkmLayoutProps = MarketplaceLayoutProps & { children?: ReactNode };
type LayoutComponent = ComponentType<{ children?: ReactNode }>;
type SharedProps = {
    auth: Auth;
};

function PassthroughLayout({ children }: { children?: ReactNode }): ReactElement {
    return <>{children}</>;
}

function UmkmLayout({ children }: UmkmLayoutProps): ReactElement {
    return (
        <MarketplaceLayout role="umkm" primaryAction={umkmPrimaryAction} showSearch>
            {children}
        </MarketplaceLayout>
    );
}

function CreatorLayout({ children }: UmkmLayoutProps): ReactElement {
    return (
        <MarketplaceLayout
            role="creator"
            primaryAction={creatorPrimaryActions[0]}
            showSearch
        >
            {children}
        </MarketplaceLayout>
    );
}

function LoginAuthLayout({ children }: { children?: ReactNode }): ReactElement {
    return <AuthLayout variant="login">{children}</AuthLayout>;
}

function RegisterAuthLayout({
    children,
}: {
    children?: ReactNode;
}): ReactElement {
    return <AuthLayout variant="register">{children}</AuthLayout>;
}

function RecoveryAuthLayout({
    children,
}: {
    children?: ReactNode;
}): ReactElement {
    return <AuthLayout variant="recovery">{children}</AuthLayout>;
}

function RoleAwareAppLayout({
    children,
}: {
    children?: ReactNode;
}): ReactElement {
    const page = usePage<SharedProps>();
    const user = page.props.auth.user;
    const role = user?.role;

    if (role === 'admin') {
        return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
    }

    if (role === 'creator') {
        return (
            <MarketplaceLayout
                role="creator"
                primaryAction={creatorPrimaryActions[0]}
                showSearch
            >
                {children}
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout role="umkm" primaryAction={umkmPrimaryAction} showSearch>
            {children}
        </MarketplaceLayout>
    );
}

function RoleAwareSettingsLayout({
    children,
}: {
    children?: ReactNode;
}): ReactElement {
    return (
        <RoleAwareAppLayout>
            <SettingsLayout>{children}</SettingsLayout>
        </RoleAwareAppLayout>
    );
}

const layoutBindings = {
    admin: AdminDashboardLayout as LayoutComponent,
    umkm: UmkmLayout as LayoutComponent,
    creator: CreatorLayout as LayoutComponent,
} as const;

function resolveAuthLayout(name: string): LayoutComponent {
    if (name === 'Auth/Login') {
        return LoginAuthLayout;
    }

    if (name === 'Auth/Register') {
        return RegisterAuthLayout;
    }

    if (name.startsWith('Auth/')) {
        return RecoveryAuthLayout;
    }

    return PublicLayout;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'Public/Welcome':
            case name === 'Public/CreatorDirectory':
            case name === 'Public/CreatorProfile':
            case name === 'Public/UmkmProfile':
            case name === 'Public/PrivacyPolicy':
            case name === 'Public/TermsOfService':
                return PublicLayout;
            case name.startsWith('Auth/'):
                return resolveAuthLayout(name);
            case name.startsWith('settings/'):
                return RoleAwareSettingsLayout;
            case name.startsWith('Notifications/'):
                return RoleAwareAppLayout;
            case name === 'Umkm/Collaborations/Show':
            case name === 'Creator/Collaborations/Show':
                return PassthroughLayout;
            case name.startsWith('Admin/'):
                return layoutBindings.admin;
            case name.startsWith('Umkm/'):
                return layoutBindings.umkm;
            case name.startsWith('Creator/'):
                return layoutBindings.creator;
            default:
                return PublicLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <div className="neo-brutal min-h-screen">
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </div>
        );
    },
    progress: {
        color: '#0063d1',
    },
});

initializeTheme();
