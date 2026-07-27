import { expect } from '@playwright/test';

import { createUmkmCampaignViaPage, loginPage } from '../../_helpers';
import { demoGoto, narrate } from '../demo-helpers';
import type { DemoCtx } from './types';

/** BABAK 4 — Dashboard CTA + dua campaign (lamaran & undangan). */
export async function umkmCampaignsModule(ctx: DemoCtx): Promise<void> {
    const { page, context, umkmEmail } = ctx;

    await context.clearCookies();
    await loginPage(page, umkmEmail);
    await expect(page).toHaveURL(/\/umkm\/dashboard/);
    await narrate(page, {
        scene: 'BABAK 4 — UMKM',
        title: 'UMKM masuk ke dashboard',
        note: 'Kartu "Lamaran menunggu" mengarah ke campaign yang perlu ditinjau — bukan daftar kolaborasi kosong.',
    });

    // Navigasi langsung (lebih andal daripada klik tile saat headed/slowMo).
    await demoGoto(page, '/umkm/campaigns?pending=1');
    await expect(page).toHaveURL(/\/umkm\/campaigns/);
    await narrate(page, {
        scene: 'BABAK 4 — UMKM',
        title: 'Halaman tinjau lamaran',
        note: 'Dari sini UMKM membuka campaign untuk menerima atau menolak lamaran.',
    });

    await narrate(page, {
        scene: 'BABAK 4 — UMKM',
        title: 'UMKM membuat campaign untuk jalur LAMARAN',
        note: 'Creator nanti akan menemukan campaign ini dan mengirim lamaran.',
    });
    ctx.campaignApplyId = await createUmkmCampaignViaPage(
        page,
        ctx.campaignApplyTitle,
        'Butuh 1 video reels untuk promosi produk kopi baru kami.',
        true,
    );
    await narrate(page, {
        scene: 'BABAK 4 — UMKM',
        title: 'Campaign lamaran LIVE (status: Open)',
        note: ctx.campaignApplyTitle,
    });

    if (!ctx.skipInvite) {
        await narrate(page, {
            scene: 'BABAK 4 — UMKM',
            title: 'UMKM membuat campaign kedua untuk jalur UNDANGAN',
            note: 'Satu Creator bisa diundang ke campaign yang dipilih secara eksplisit.',
        });
        ctx.campaignInviteId = await createUmkmCampaignViaPage(
            page,
            ctx.campaignInviteTitle,
            'Campaign khusus undangan Creator dari halaman Cari Creator.',
            true,
        );
        await narrate(page, {
            scene: 'BABAK 4 — UMKM',
            title: 'Campaign undangan LIVE (status: Open)',
            note: ctx.campaignInviteTitle,
        });
    }
}
