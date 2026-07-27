import { expect } from '@playwright/test';

import { loginSeededUser } from '../../_helpers';
import { narrate } from '../demo-helpers';
import type { DemoCtx } from './types';

/** BABAK 10 — Admin oversight (spotlight Admin #2). */
export async function adminOversightModule(ctx: DemoCtx): Promise<void> {
    const { page, context, adminEmail, campaignApplyTitle } = ctx;

    await context.clearCookies();
    await loginSeededUser(page, adminEmail);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await narrate(page, {
        scene: 'BABAK 10 — ADMIN',
        title: 'Admin menjaga kualitas platform',
        note: 'Admin bukan bagian transaksi — tugasnya memoderasi & mengawasi.',
    });

    await page.goto('/admin/moderation/campaigns');
    await narrate(page, {
        scene: 'BABAK 10 — ADMIN',
        title: 'Moderasi campaign',
        note: 'Admin dapat menyembunyikan campaign yang melanggar kebijakan.',
    });
    const campaignRow = page.getByRole('row').filter({ hasText: campaignApplyTitle }).first();
    if (await campaignRow.isVisible().catch(() => false)) {
        await narrate(
            page,
            {
                scene: 'BABAK 10 — ADMIN',
                title: 'Campaign demo terlihat di antrean moderasi',
                note: campaignApplyTitle,
            },
            2000,
        );
    }

    await page.goto('/admin/users');
    await narrate(page, {
        scene: 'BABAK 10 — ADMIN',
        title: 'Manajemen pengguna',
        note: 'Admin dapat menonaktifkan (suspend) akun bermasalah.',
    });

    await page.goto('/admin/collaborations');
    await narrate(page, {
        scene: 'BABAK 10 — ADMIN',
        title: 'Pemantauan seluruh kolaborasi lintas pengguna',
        note: 'Termasuk kolaborasi UMKM–Creator yang barusan selesai.',
    });

    await page.goto('/admin/audit-logs');
    await narrate(page, {
        scene: 'BABAK 10 — ADMIN',
        title: 'Audit log (catatan aktivitas, append-only)',
        note: 'Setiap tindakan penting terekam dan tidak bisa diubah.',
    });

    await page.goto('/admin/reports');
    await narrate(page, {
        scene: 'BABAK 10 — ADMIN',
        title: 'Laporan & ekspor data (CSV)',
    });

    await page.goto('/admin/dashboard');
    await narrate(
        page,
        {
            scene: 'PENUTUP',
            title: 'Itulah Collabite dari daftar hingga deal selesai',
            note: 'UMKM menjalankan campaign • Creator membuat konten • Admin menjaga kualitas. Dua jalur: undangan & lamaran.',
        },
        5000,
    );
}
