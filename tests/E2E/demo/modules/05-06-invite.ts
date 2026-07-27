import { expect } from '@playwright/test';

import { latestCollaborationIdForCampaign, loginPage } from '../../_helpers';
import { narrate } from '../demo-helpers';
import type { DemoCtx } from './types';

/** BABAK 5 — UMKM Discover: pilih campaign lalu undang Creator. */
export async function umkmInviteModule(ctx: DemoCtx): Promise<void> {
    if (ctx.skipInvite) {
        return;
    }

    const { page, context, umkmEmail, creatorName, campaignInviteTitle } = ctx;

    await context.clearCookies();
    await loginPage(page, umkmEmail);
    await page.goto('/umkm/discover');
    await narrate(page, {
        scene: 'BABAK 5 — UMKM UNDANG',
        title: 'UMKM mencari Creator di Discover',
        note: 'Undangan selalu ke SATU campaign yang dipilih — tidak otomatis ke semua campaign.',
    });

    await page.getByLabel('Kata kunci').fill(creatorName);
    await page.getByRole('button', { name: 'Terapkan filter' }).click();
    await expect(page.getByText(creatorName)).toBeVisible({ timeout: 15_000 });

    const card = page
        .locator('div')
        .filter({ hasText: creatorName })
        .filter({ has: page.getByRole('button', { name: /Undang Creator/ }) })
        .first();
    await card.getByRole('button', { name: /Undang Creator/ }).click();

    await narrate(page, {
        scene: 'BABAK 5 — UMKM UNDANG',
        title: 'UMKM memilih campaign tujuan undangan',
        note: `Dropdown "Undang ke campaign mana?" → ${campaignInviteTitle}`,
    });

    // Jangan pakai getByRole('combobox').first() — itu filter Kategori di atas.
    const campaignCombo = page.getByLabel(/Undang ke campaign mana/i);
    await expect(campaignCombo).toBeVisible({ timeout: 10_000 });
    await campaignCombo.click();
    await page.getByRole('option', { name: campaignInviteTitle }).click();

    await expect(page.getByText(/Undangan akan dikirim untuk/i)).toBeVisible({
        timeout: 10_000,
    });
    await page.getByLabel('Pesan undangan').fill(
        'Halo, kami ingin mengajak Anda berkolaborasi di campaign merchandise ini.',
    );
    await narrate(
        page,
        {
            scene: 'BABAK 5 — UMKM UNDANG',
            title: 'Konfirmasi campaign di tombol kirim',
            note: 'Tombol menyebut nama campaign secara eksplisit.',
        },
        1800,
    );
    await page.getByRole('button', { name: /Kirim undangan ke/i }).click();
    await expect(page.getByText(/Undangan terkirim/i)).toBeVisible();
    await narrate(page, {
        scene: 'BABAK 5 — UMKM UNDANG',
        title: 'Undangan terkirim',
        note: 'Creator akan melihatnya di halaman Permintaan.',
    });
}

/** BABAK 6 — Creator terima undangan (+ T&C). */
export async function creatorAcceptInviteModule(ctx: DemoCtx): Promise<void> {
    if (ctx.skipInvite) {
        return;
    }

    const { page, context, creatorEmail, campaignInviteTitle, campaignInviteId } = ctx;

    await context.clearCookies();
    await loginPage(page, creatorEmail);
    await page.goto('/creator/requests');
    await narrate(page, {
        scene: 'BABAK 6 — CREATOR',
        title: 'Creator membuka inbox Permintaan',
        note: 'Undangan dari UMKM tampil di sini, terpisah dari kolaborasi aktif.',
    });

    await expect(page.getByText(campaignInviteTitle)).toBeVisible();
    await page.getByRole('checkbox').check();
    await narrate(
        page,
        {
            scene: 'BABAK 6 — CREATOR',
            title: 'Creator menyetujui Syarat dan Ketentuan',
            note: 'Lalu klik Terima Undangan (sejajar dengan Tolak).',
        },
        1800,
    );
    await page.getByRole('button', { name: 'Terima Undangan' }).click();
    await expect(page.getByText(/Undangan diterima|Kolaborasi dimulai/i)).toBeVisible();

    if (campaignInviteId) {
        ctx.collabInviteId = latestCollaborationIdForCampaign(campaignInviteId);
        await page.goto(`/creator/collaborations/${ctx.collabInviteId}`);
        await narrate(
            page,
            {
                scene: 'BABAK 6 — CREATOR',
                title: 'Deal via UNDANGAN terbentuk',
                note: 'Workspace undangan siap. Demo berikutnya fokus ke jalur lamaran untuk siklus konten lengkap.',
            },
            2800,
        );
    }
}
