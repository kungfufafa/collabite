import { expect } from '@playwright/test';

import { latestCollaborationIdForCampaign, loginPage } from '../../_helpers';
import { demoClick, demoGoto, narrate } from '../demo-helpers';
import type { DemoCtx } from './types';

/** BABAK 7 — Creator lamar campaign (jalur lamaran). */
export async function creatorApplyModule(ctx: DemoCtx): Promise<void> {
    const { page, context, creatorEmail, campaignApplyId } = ctx;
    if (!campaignApplyId) {
        throw new Error('campaignApplyId belum di-set');
    }

    await context.clearCookies();
    await loginPage(page, creatorEmail);
    await demoGoto(page, '/creator/campaigns');
    await narrate(page, {
        scene: 'BABAK 7 — CREATOR',
        title: 'Creator menjelajah campaign yang tersedia',
        note: 'Menemukan campaign UMKM untuk dilamar.',
    });
    await demoGoto(page, `/creator/campaigns/${campaignApplyId}`);
    await demoClick(
        page.getByRole('button', { name: 'Lamar Campaign Ini' }),
        'Membuka formulir lamaran',
    );
    await page
        .getByLabel('Pesan')
        .fill(
            'Halo, saya tertarik dan siap mengerjakan video ini sesuai brief.',
        );
    await narrate(
        page,
        {
            scene: 'BABAK 7 — CREATOR',
            title: 'Creator menulis pesan lamaran',
            note: 'Klik "Kirim Lamaran".',
        },
        1500,
    );
    await demoClick(
        page.getByRole('button', { name: 'Kirim Lamaran' }),
        'Mengirim lamaran Creator',
    );
    await expect(
        page.getByText(/Anda sudah mengajukan lamaran/i),
    ).toBeVisible();
    await narrate(page, {
        scene: 'BABAK 7 — CREATOR',
        title: 'Lamaran terkirim (status: pending)',
        note: 'Menunggu keputusan UMKM.',
    });
}

/** BABAK 8 — UMKM terima lamaran (+ T&C). */
export async function umkmAcceptApplyModule(ctx: DemoCtx): Promise<void> {
    const { page, context, umkmEmail, campaignApplyId } = ctx;
    if (!campaignApplyId) {
        throw new Error('campaignApplyId belum di-set');
    }

    await context.clearCookies();
    await loginPage(page, umkmEmail);
    await demoGoto(page, `/umkm/campaigns/${campaignApplyId}`);
    await narrate(page, {
        scene: 'BABAK 8 — DEAL LAMARAN',
        title: 'UMKM meninjau lamaran yang masuk',
        note: 'Tombol Terima dan Tolak sejajar; setujui Syarat dan Ketentuan dulu.',
    });
    await page.getByRole('checkbox').check();
    await narrate(
        page,
        {
            scene: 'BABAK 8 — DEAL LAMARAN',
            title: 'UMKM menyetujui Syarat dan Ketentuan',
            note: 'Persetujuan dicatat sebelum kolaborasi dimulai.',
        },
        1800,
    );
    await demoClick(
        page.getByRole('button', { name: 'Terima Lamaran' }).first(),
        'Menerima lamaran Creator',
    );
    ctx.collabApplyId = latestCollaborationIdForCampaign(campaignApplyId);
    await demoGoto(page, `/umkm/collaborations/${ctx.collabApplyId}`);
    await expect(page).toHaveURL(
        new RegExp(`/umkm/collaborations/${ctx.collabApplyId}`),
    );
    await narrate(
        page,
        {
            scene: 'BABAK 8 — DEAL LAMARAN',
            title: 'DEAL! Kolaborasi via lamaran dimulai',
            note: 'Banner next-step mengarahkan ke tab yang relevan (mis. Konten).',
        },
        3200,
    );
}
