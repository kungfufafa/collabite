import type { BrowserContext, Page } from '@playwright/test';

import { tinyPngBuffer } from '../../_helpers';

export type DemoCtx = {
    page: Page;
    context: BrowserContext;
    umkmEmail: string;
    creatorEmail: string;
    creatorName: string;
    adminEmail: string;
    campaignApplyTitle: string;
    campaignInviteTitle: string;
    campaignApplyId: number | null;
    campaignInviteId: number | null;
    collabApplyId: number | null;
    collabInviteId: number | null;
    skipInvite: boolean;
};

export function pngFile(name: string): {
    name: string;
    mimeType: string;
    buffer: Buffer;
} {
    return {
        name,
        mimeType: 'image/png',
        buffer: tinyPngBuffer,
    };
}

export function createDemoCtx(
    page: Page,
    context: BrowserContext,
    stamp: number,
): DemoCtx {
    return {
        page,
        context,
        umkmEmail: `umkm.demo.${stamp}@collabite.test`,
        creatorEmail: `creator.demo.${stamp}@collabite.test`,
        creatorName: `Raka Videografer Demo ${stamp}`,
        adminEmail: 'admin@collabite.test',
        campaignApplyTitle: `Promo Kopi — Lamaran (${stamp})`,
        campaignInviteTitle: `Promo Merch — Undangan (${stamp})`,
        campaignApplyId: null,
        campaignInviteId: null,
        collabApplyId: null,
        collabInviteId: null,
        skipInvite: process.env.DEMO_SKIP_INVITE === '1',
    };
}
