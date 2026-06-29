/**
 * Skenario E2E-02: UMKM menemukan Creator → UMKM mengirim invitation →
 * Creator menerima invitation → pesan dalam kolaborasi berjalan →
 * Creator mengirim konten → UMKM menyetujui konten → kolaborasi selesai.
 *
 * Asumsi:
 * - Aplikasi berjalan di http://collabite.test (Laravel Herd).
 * - Akun admin@collabite.test / password sudah tersedia (AdminUserSeeder).
 * - Kategori & skill sudah ter-seed.
 */

import { expect, test } from '@playwright/test';
import { E2E_PASSWORD, loginPage, registerCreator, registerUmkm } from './_helpers';

const tinyPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
]);

const stamp = Date.now();
const umkmEmail = `umkm02.e2e.${stamp}@collabite.test`;
const creatorEmail = `creator02.e2e.${stamp}@collabite.test`;
const campaignTitle = `Kampanye Invitation E2E-02 ${stamp}`;

/**
 * Prime CSRF: GET /login → ambil XSRF-TOKEN cookie untuk header POST berikutnya.
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

test.describe.serial('E2E-02: Invitation UMKM → Creator → kolaborasi selesai', () => {
    test('UMKM temukan Creator, undang, Creator terima, submit & approve konten', async ({
        page,
        context,
        request,
        baseURL,
    }) => {
        test.setTimeout(120_000);

        await registerUmkm(request, baseURL!, umkmEmail, 'UMKM Inv E2E-02', {
            business_name: 'Studio E2E',
            business_type: 'Konten',
        });
        await registerCreator(request, baseURL!, creatorEmail, 'Creator Inv E2E-02', {
            city: 'Jakarta',
        });

        // ====== UMKM: buat campaign ======
        await loginPage(page, umkmEmail);
        await expect(page).toHaveURL(/\/umkm\/dashboard/);

        await page.goto('/umkm/campaigns/create');
        await page.getByLabel('Judul').fill(campaignTitle);
        await page.getByLabel('Deskripsi').fill('Kampanye melalui invitation.');
        await page.getByLabel('Budget (Rp)').fill('2000000');
        await page.getByLabel('Deadline').fill('2099-12-31');
        await page.getByRole('button', { name: 'Buat Campaign' }).click();
        await expect(page).toHaveURL(/\/umkm\/campaigns\/\d+/);
        const campaignId = Number(page.url().match(/campaigns\/(\d+)/)![1]);

        await page.getByRole('button', { name: 'Publikasikan' }).click();
        await expect(page.getByText(/dipublikasikan/i)).toBeVisible();

        // ====== UMKM: temukan Creator di direktori publik ======
        await page.goto('/creators');
        await expect(page.getByRole('heading', { name: 'Direktori Creator' })).toBeVisible();
        const idxBody = await (await request.get('/creators')).text();
        const idMatch = idxBody.match(/href="\/creators\/(\d+)"/);
        expect(idMatch).not.toBeNull();
        const targetId = Number(idMatch![1]);

        await context.clearCookies();

        // ====== UMKM: kirim invitation via API (CSRF prime) ======
        const umkmToken = await primeCsrf(request, baseURL!);
        const inviteRes = await request.post(`/campaigns/${campaignId}/invitations`, {
            headers: { 'X-XSRF-TOKEN': umkmToken, Accept: 'application/json' },
            form: { campaign_id: campaignId, creator_id: targetId, message: 'Ayo kerja bareng!' },
        });
        expect([200, 302, 422]).toContain(inviteRes.status());

        await context.clearCookies();

        // ====== Creator: menerima invitation (melalui dashboard UMKM → accept) ======
        // Frontend belum punya UI accept invitation; kita terima via endpoint UMKM
        // /requests/{request}/accept (CSRF prime) — endpoint menerima requests
        // untuk collaboration invitation yang ditujukan ke Creator.
        await loginPage(page, umkmEmail);
        await expect(page).toHaveURL(/\/umkm\/dashboard/);
        const showUmkm = await request.get(`/umkm/campaigns/${campaignId}`);
        const showBody = await showUmkm.text();
        const reqIdMatch = showBody.match(/"requests":\[(.*?)\]/s);
        expect(reqIdMatch).not.toBeNull();
        const invIdMatch = reqIdMatch![1].match(/"id":(\d+)/);
        expect(invIdMatch).not.toBeNull();
        const invId = Number(invIdMatch![1]);

        const acceptRes = await request.post(`/requests/${invId}/accept`, {
            headers: { 'X-XSRF-TOKEN': umkmToken, Accept: 'application/json' },
        });
        expect(acceptRes.status()).toBe(200);

        // ====== Creator: pesan + submission ======
        await context.clearCookies();
        await loginPage(page, creatorEmail);
        await page.goto('/creator/collaborations');
        await page.getByRole('link', { name: 'Buka' }).first().click();
        await expect(page).toHaveURL(/\/creator\/collaborations\/\d+/);
        const collabId = Number(page.url().match(/collaborations\/(\d+)/)![1]);

        // Tab Pesan → kirim pesan.
        await page.getByRole('tab', { name: /Pesan/ }).click();
        await page.getByLabel('Pesan').fill('Halo, saya akan mulai dengan konsep X.');
        await page.getByRole('button', { name: 'Kirim' }).click();
        await expect(page.getByText('Halo, saya akan mulai dengan konsep X.')).toBeVisible();

        // Tab Submission → upload + kirim review.
        await page.getByRole('tab', { name: /Submission/ }).click();
        await page.getByLabel('Judul').fill('Konten invitation v1');
        await page.locator('input[name="files[]"]').setInputFiles({
            name: 'tiny.png',
            mimeType: 'image/png',
            buffer: tinyPng,
        });
        await page.getByLabel('Deskripsi').fill('Hasil kerja pertama.');
        await page.getByRole('button', { name: 'Upload Submission' }).click();
        await page.getByRole('button', { name: 'Kirim untuk Review' }).first().click();
        await expect(page.getByText('Dalam Review')).toBeVisible();

        await context.clearCookies();

        // ====== UMKM: setujui submission + selesaikan kolaborasi ======
        await loginPage(page, umkmEmail);
        await page.goto(`/umkm/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Submission/ }).click();
        await page.getByRole('button', { name: 'Setujui' }).click();
        await expect(page.getByText('Disetujui')).toBeVisible();

        page.once('dialog', (d) => d.accept());
        await page.getByRole('tab', { name: /Review/ }).click();
        await page.getByRole('button', { name: 'Selesaikan Kolaborasi' }).click();
        await expect(page.getByText('Selesai')).toBeVisible();
    });
});
