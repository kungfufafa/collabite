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

export default function Welcome(): ReactNode {
    return (
        <>
            <Head title="Collabite" />
            <Hero />
            <TrustStrip />
            <ProblemSection />
            <HowItWorks />
            <CreatorDiscovery />
            <CampaignManagement />
            <FeatureGrid />
            <Benefits />
            <SafetyVerification />
            <FaqSection />
            <FinalCta />
        </>
    );
}
