import { expect } from '@playwright/test';

import { loginSeededUser } from '../../_helpers';
import { narrate } from '../demo-helpers';
import type { DemoCtx } from './types';

/** BABAK 3b — Admin setujui verifikasi (spotlight Admin #1). */
export async function adminApproveVerificationModule(ctx: DemoCtx): Promise<void> {
    const { page, context, adminEmail, creatorEmail } = ctx;

    await context.clearCookies();
    await loginSeededUser(page, adminEmail);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await narrate(page, {
        scene: 'BABAK 3 — ADMIN',
        title: 'Admin masuk sebagai moderator',
        note: 'Membuka antrian verifikasi Creator.',
    });

    await page.goto('/admin/verifications');
    const row = page.getByRole('row').filter({ hasText: creatorEmail }).first();
    await row.getByRole('link', { name: 'Tinjau' }).click();
    await expect(page).toHaveURL(/\/admin\/verifications\/\d+/);
    await narrate(page, {
        scene: 'BABAK 3 — ADMIN',
        title: 'Admin memeriksa dokumen Creator',
        note: 'Dokumen valid → Admin menyetujui.',
    });
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Setujui verifikasi' }).click();
    await expect(page.getByText(/Disetujui|verified/i).first()).toBeVisible();
    await narrate(page, {
        scene: 'BABAK 3 — ADMIN',
        title: 'Creator kini TERVERIFIKASI',
        note: 'Creator tepercaya dan siap tampil di marketplace.',
    });
}
