/**
 * Skenario E2E-03: Creator mengajukan verifikasi → Admin menolak dengan alasan
 * → Creator melihat alasan penolakan → Creator mengganti dokumen →
 * Creator mengajukan ulang → Admin menyetujui verifikasi.
 *
 * Asumsi:
 * - Aplikasi berjalan di http://collabite.test (Laravel Herd).
 * - Akun admin@collabite.test / password sudah tersedia (AdminUserSeeder).
 */

import { expect, test } from '@playwright/test';
import {
    latestVerificationIdForCreator,
    loginPage,
    loginSeededUser,
    logoutSession,
    prepareCreatorProfileForVerification,
    registerCreator,
} from './_helpers';

const tinyPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
]);

const stamp = Date.now();
const creatorEmail = `creator03.e2e.${stamp}@collabite.test`;

async function prepareCreator(
    request: import('@playwright/test').APIRequestContext,
    baseURL: string,
): Promise<void> {
    await registerCreator(request, baseURL, creatorEmail, 'Creator Verify E2E', {
        city: 'Surabaya',
    });

    prepareCreatorProfileForVerification(creatorEmail);
}

test.describe.serial('E2E-03: Verifikasi Creator ditolak → resubmit → disetujui', () => {
    test('Alur verifikasi penuh dengan penolakan lalu persetujuan', async ({ page, baseURL }) => {
        test.setTimeout(120_000);

        await prepareCreator(page.request, baseURL!);

        // ====== Creator: ajukan verifikasi pertama ======
        await loginPage(page, creatorEmail);
        await expect(page).toHaveURL(/\/creator\/dashboard/);

        await page.goto('/creator/verification');
        await expect(page.getByRole('heading', { name: 'Verifikasi Creator' })).toBeVisible();

        // Upload dokumen (KTP).
        await page.locator('input[type="file"]').first().setInputFiles({
            name: 'ktp.png',
            mimeType: 'image/png',
            buffer: tinyPng,
        });
        await page.getByRole('button', { name: 'Kirim Pengajuan' }).click();
        await expect(page.getByText(/pending/i).first()).toBeVisible();

        const verificationId = latestVerificationIdForCreator(creatorEmail);

        await logoutSession(page);

        // ====== Admin: tolak verifikasi dengan alasan ======
        await loginSeededUser(page, 'admin@collabite.test');
        await expect(page).toHaveURL(/\/admin\/dashboard/);

        await page.goto(`/admin/verifications/${verificationId}`);
        await expect(page.getByRole('heading', { name: 'Tindakan' })).toBeVisible();

        await page.getByLabel('Alasan penolakan').fill('Foto KTP buram, mohon unggah ulang yang lebih jelas.');
        await page.getByRole('button', { name: 'Tolak verifikasi' }).click();
        await expect(page.getByText(/Ditolak|rejected/i).first()).toBeVisible();

        await logoutSession(page);

        // ====== Creator: lihat status rejected & resubmit ======
        await loginPage(page, creatorEmail);
        await page.goto('/creator/verification');
        await expect(page.getByText(/Status saat ini: rejected/i)).toBeVisible();

        await page.locator('input[type="file"]').first().setInputFiles({
            name: 'ktp-jernih.png',
            mimeType: 'image/png',
            buffer: tinyPng,
        });
        await page.getByRole('button', { name: 'Kirim Pengajuan' }).click();
        await expect(page.getByText(/pending/i).first()).toBeVisible();

        await logoutSession(page);

        // ====== Admin: setujui verifikasi (verifikasi ID baru) ======
        await loginSeededUser(page, 'admin@collabite.test');
        await page.goto('/admin/verifications');
        const row = page.getByRole('row').filter({ hasText: creatorEmail }).first();
        await row.getByRole('link', { name: 'Tinjau' }).click();
        await expect(page).toHaveURL(/\/admin\/verifications\/\d+/);
        page.once('dialog', (d) => d.accept());
        await page.getByRole('button', { name: 'Setujui verifikasi' }).click();
        await expect(page.getByText(/Disetujui|verified/i).first()).toBeVisible();
    });
});
