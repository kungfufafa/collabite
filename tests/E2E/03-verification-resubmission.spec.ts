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
import { loginPage, registerCreator } from './_helpers';

const tinyPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
]);

const stamp = Date.now();
const creatorEmail = `creator03.e2e.${stamp}@collabite.test`;

/**
 * Prime CSRF: GET /login → ambil XSRF-TOKEN cookie.
 */
async function primeCsrf(
    request: import('@playwright/test').APIRequestContext,
    baseURL: string,
): Promise<string> {
    await request.get('/login');
    const cookies = await request.storageState();
    const host = new URL(baseURL).hostname;
    const xsrf = cookies.cookies.find((c) => c.name === 'XSRF-TOKEN' && c.domain.includes(host));
    if (!xsrf) {
        throw new Error('XSRF-TOKEN cookie not set after GET /login.');
    }
    return decodeURIComponent(xsrf.value);
}

async function prepareCreator(
    request: import('@playwright/test').APIRequestContext,
    baseURL: string,
): Promise<void> {
    await registerCreator(request, baseURL, creatorEmail, 'Creator Verify E2E', {
        city: 'Surabaya',
    });

    const token = await primeCsrf(request, baseURL);

    // Update profile Creator (headline + bio) — diperlukan oleh SubmitVerification.
    const profile = await request.patch('/creator/profile', {
        headers: { 'X-XSRF-TOKEN': token, Accept: 'application/json' },
        form: {
            headline: 'Videographer & Editor',
            bio: 'Saya membuat konten video pendek yang menarik.',
            city: 'Surabaya',
        },
        maxRedirects: 0,
    });
    expect([200, 302]).toContain(profile.status());

    // Tambah 1 item portofolio — diperlukan oleh SubmitVerification.
    const portfolio = await request.post('/creator/portfolio', {
        headers: { 'X-XSRF-TOKEN': token, Accept: 'application/json' },
        form: {
            title: 'Proyek Demo E2E',
            description: 'Salah satu karya terbaru saya.',
            external_url: 'https://example.com/portfolio-1',
        },
        maxRedirects: 0,
    });
    expect([200, 302]).toContain(portfolio.status());
}

test.describe.serial('E2E-03: Verifikasi Creator ditolak → resubmit → disetujui', () => {
    test('Alur verifikasi penuh dengan penolakan lalu persetujuan', async ({
        page,
        context,
        request,
        baseURL,
    }) => {
        test.setTimeout(120_000);

        await prepareCreator(request, baseURL!);

        // ====== Creator: ajukan verifikasi pertama ======
        await loginPage(page, creatorEmail);
        await expect(page).toHaveURL(/\/creator\/dashboard/);

        await page.goto('/creator/verification');
        await expect(page.getByRole('heading', { name: 'Status Verifikasi' })).toBeVisible();

        // Upload dokumen (KTP).
        await page.getByLabel('Berkas').setInputFiles({
            name: 'ktp.png',
            mimeType: 'image/png',
            buffer: tinyPng,
        });
        await page.getByRole('button', { name: 'Kirim Pengajuan' }).click();
        // Server redirect ke /creator/verification dengan status "pending".
        await expect(page.getByText(/pending/)).toBeVisible();

        // Cari verification ID via API Inertia HTML.
        const verifyPage = await request.get('/creator/verification');
        expect(verifyPage.status()).toBe(200);
        const verifyBody = await verifyPage.text();
        const idMatch = verifyBody.match(/"id":(\d+)/);
        expect(idMatch).not.toBeNull();
        const verificationId = Number(idMatch![1]);

        await context.clearCookies();

        // ====== Admin: tolak verifikasi dengan alasan ======
        await loginPage(page, 'admin@collabite.test');
        await expect(page).toHaveURL(/\/admin\/dashboard/);

        await page.goto(`/admin/verifications/${verificationId}`);
        await expect(page.getByRole('heading', { name: 'Tindakan' })).toBeVisible();

        await page.getByLabel('Alasan Penolakan').fill('Foto KTP buram, mohon unggah ulang yang lebih jelas.');
        page.once('dialog', (d) => d.accept());
        await page.getByRole('button', { name: 'Tolak' }).click();
        await expect(page.getByText(/Ditolak|rejected/i)).toBeVisible();

        await context.clearCookies();

        // ====== Creator: lihat alasan & resubmit ======
        await loginPage(page, creatorEmail);
        await page.goto('/creator/verification');
        await expect(page.getByText(/Foto KTP buram/i)).toBeVisible();
        await expect(page.getByText('rejected', { exact: false })).toBeVisible();

        // Ganti dokumen: replace via input file.
        await page.getByLabel('Berkas').setInputFiles({
            name: 'ktp-jernih.png',
            mimeType: 'image/png',
            buffer: tinyPng,
        });
        await page.getByRole('button', { name: 'Kirim Pengajuan' }).click();
        await expect(page.getByText(/pending/)).toBeVisible();

        await context.clearCookies();

        // ====== Admin: setujui verifikasi (verifikasi ID baru) ======
        await loginPage(page, 'admin@collabite.test');
        await page.goto('/admin/verifications');
        const row = page.getByRole('row').filter({ hasText: creatorEmail }).first();
        await row.getByRole('link', { name: 'Tinjau' }).click();
        await expect(page).toHaveURL(/\/admin\/verifications\/\d+/);
        page.once('dialog', (d) => d.accept());
        await page.getByRole('button', { name: 'Setujui' }).click();
        await expect(page.getByText(/Disetujui|verified/i)).toBeVisible();
    });
});
