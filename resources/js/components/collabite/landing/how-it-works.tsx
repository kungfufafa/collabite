import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    Award,
    Compass,
    FilePlus2,
    IdCard,
    Send,
    ThumbsUp,
    UserSearch,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { SectionHeading } from '@/components/collabite/section-heading';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs-mock';

type Step = { icon: LucideIcon; title: string };

const UMKM_STEPS: Step[] = [
    { icon: FilePlus2, title: 'Buat Campaign' },
    { icon: UserSearch, title: 'Temukan atau Undang Creator' },
    { icon: Activity, title: 'Pantau Pengerjaan Konten' },
    { icon: ThumbsUp, title: 'Setujui Hasil dan Beri Review' },
];

const CREATOR_STEPS: Step[] = [
    { icon: IdCard, title: 'Buat Profil dan Portofolio' },
    { icon: Compass, title: 'Temukan Campaign' },
    { icon: Send, title: 'Kerjakan dan Kirim Konten' },
    { icon: Award, title: 'Bangun Reputasi dari Review' },
];

function Steps({ steps }: { steps: Step[] }): ReactNode {
    return (
        <div className="relative mt-10 grid gap-5 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-[2.1rem] hidden h-px bg-border md:block" />
            {steps.map(({ icon: Icon, title }, i) => (
                <div
                    key={title}
                    className="relative rounded-xl border border-border bg-card p-5 text-center md:text-left"
                >
                    <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] md:mx-0">
                        <Icon className="size-5" />
                    </div>
                    <span className="mt-3 inline-block text-xs font-semibold text-[var(--brand-primary)]">
                        Langkah {i + 1}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">
                        {title}
                    </h3>
                </div>
            ))}
        </div>
    );
}

export function HowItWorks(): ReactNode {
    const [tab, setTab] = useState('umkm');

    return (
        <section
            id="cara-kerja"
            className="border-y border-border bg-card py-16 lg:py-24"
        >
            <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
                <SectionHeading
                    eyebrow="Cara Kerja"
                    title="Satu Platform, Dua Cara Memulai Kolaborasi"
                />

                <Tabs
                    value={tab}
                    onValueChange={setTab}
                    className="mt-10 items-center"
                >
                    <TabsList className="h-11 rounded-xl bg-muted p-1">
                        <TabsTrigger value="umkm">Untuk UMKM</TabsTrigger>
                        <TabsTrigger value="creator">Untuk Creator</TabsTrigger>
                    </TabsList>

                    <TabsContent value="umkm">
                        <Steps steps={UMKM_STEPS} />
                    </TabsContent>
                    <TabsContent value="creator">
                        <Steps steps={CREATOR_STEPS} />
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}
