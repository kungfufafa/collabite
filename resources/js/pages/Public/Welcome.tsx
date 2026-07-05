import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Benefits } from '@/components/collabite/landing/benefits';
import { CampaignManagement } from '@/components/collabite/landing/campaign-management';
import { CreatorDiscovery } from '@/components/collabite/landing/creator-discovery';
import { FaqSection } from '@/components/collabite/landing/faq-section';
import { FeatureGrid } from '@/components/collabite/landing/feature-grid';
import { FinalCta } from '@/components/collabite/landing/final-cta';
import { Hero } from '@/components/collabite/landing/hero';
import { HowItWorks } from '@/components/collabite/landing/how-it-works';
import { ProblemSection } from '@/components/collabite/landing/problem-section';
import { SafetyVerification } from '@/components/collabite/landing/safety-verification';
import { TrustStrip } from '@/components/collabite/landing/trust-strip';

export type LandingFeaturedCreator = {
    id: number;
    name: string;
    headline: string | null;
    city: string | null;
    rating_avg: number;
    rating_count: number;
    verification_status: string;
    profile_photo_url: string | null;
    portfolio_urls: string[];
    categories: string[];
    collaboration_count: number;
};

export type LandingHeroSpotlight = {
    campaign_title: string;
    campaign_status: string;
    campaign_status_label: string;
    creator_name: string;
    creator_headline: string | null;
    creator_profile_photo_url: string | null;
    creator_rating_avg: number;
    progress_percent: number;
    deadline: string | null;
    submission_title: string | null;
    submission_file_label: string | null;
};

export type LandingFeaturedCampaign = {
    id: number;
    title: string;
    status: string;
    status_label: string;
    budget: string | null;
    deliverable_count: number;
    deadline: string | null;
    timeline: { label: string; state: 'done' | 'current' | 'todo' }[];
};

export type LandingCategory = {
    id: number;
    name: string;
};

type WelcomeProps = {
    featuredCreators: LandingFeaturedCreator[];
    heroSpotlight: LandingHeroSpotlight | null;
    featuredCampaign: LandingFeaturedCampaign | null;
    categories: LandingCategory[];
};

export default function Welcome({
    featuredCreators,
    heroSpotlight,
    featuredCampaign,
    categories,
}: WelcomeProps): ReactNode {
    return (
        <>
            <Head title="Collabite" />
            {/* Section order matches PUBLIC_NAV_LINKS anchor scroll: cara-kerja → umkm → creator → fitur → faq */}
            <Hero spotlight={heroSpotlight} />
            <TrustStrip />
            <ProblemSection />
            <HowItWorks />
            <CreatorDiscovery
                creators={featuredCreators}
                categories={categories}
            />
            <Benefits />
            <FeatureGrid />
            <CampaignManagement campaign={featuredCampaign} />
            <SafetyVerification />
            <FaqSection />
            <FinalCta />
        </>
    );
}
