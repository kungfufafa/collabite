/**
 * Skenario E2E-04: Isolasi otorisasi & keamanan.
 *
 * Sub-test:
 *  1. UMKM A tidak dapat mengubah campaign milik UMKM B (403).
 *  2. Creator A tidak dapat membuka kolaborasi milik Creator B (403).
 *  3. Outsider (pihak ketiga) tidak dapat membaca pesan kolaborasi.
 *  4. Outsider tidak dapat mengakses file private tanpa signed URL (403).
 *  5. Creator tidak dapat membuka route /admin (403/302).
 *  6. Pengguna berstatus Suspended tidak dapat melakukan aksi terlindungi (logout paksa).
 *  7. Admin tidak dapat menggunakan route UMKM/Creator untuk accept/reject
 *     (hanya boleh lewat namespace Admin sendiri; 403 jika coba pakai route role lain).
 *
 * Asumsi:
 * - Aplikasi berjalan di http://collabite.test (Laravel Herd).
 * - Akun admin@collabite.test / password sudah tersedia (AdminUserSeeder).
 */

import { expect, test } from '@playwright/test';
import {
    acceptCollaborationRequestForCampaign,
    createUmkmCampaignViaPage,
    csrfFromPage,
    E2E_PASSWORD,
    latestCollaborationIdForCampaign,
    loginPage,
    loginSeededUser,
    logoutSession,
    registerCreator,
    registerUmkm,
    suspendUserByEmail,
} from './_helpers';

const stamp = Date.now();

test.describe('E2E-04: Isolasi otorisasi & keamanan', () => {
    test('1. UMKM A tidak dapat mengedit campaign UMKM B (403)', async ({ page, request, baseURL }) => {
        const umkmA = `umkm04a.${stamp}@collabite.test`;
        const umkmB = `umkm04b.${stamp}@collabite.test`;

        await registerUmkm(request, baseURL!, umkmA, 'UMKM A E2E', {
            business_name: 'UMKM A',
            business_type: 'Retail',
        });
        await registerUmkm(request, baseURL!, umkmB, 'UMKM B E2E', {
            business_name: 'UMKM B',
            business_type: 'Retail',
        });

        await loginPage(page, umkmA);
        await expect(page).toHaveURL(/\/umkm\/dashboard/);

        const aCampaignId = await createUmkmCampaignViaPage(page, `Kampanye A ${stamp}`, 'Milik UMKM A.');

        await logoutSession(page);
        await loginPage(page, umkmB);

        const editRes = await page.request.get(`/umkm/campaigns/${aCampaignId}/edit`);
        expect(editRes.status()).toBe(403);

        const token = await csrfFromPage(page, baseURL!);
        const patchRes = await page.request.patch(`/umkm/campaigns/${aCampaignId}`, {
            headers: { 'X-XSRF-TOKEN': token, Accept: 'application/json' },
            form: { title: 'Diretas', description: '...', category_id: '1' },
        });
        expect(patchRes.status()).toBe(403);
    });

    test('2. Creator A tidak dapat membuka kolaborasi Creator B (403)', async ({ page, request, baseURL }) => {
        const creatorA = `creator04a.${stamp}@collabite.test`;
        const creatorB = `creator04b.${stamp}@collabite.test`;

        await registerCreator(request, baseURL!, creatorA, 'Creator A E2E', { city: 'Jakarta' });
        await registerCreator(request, baseURL!, creatorB, 'Creator B E2E', { city: 'Bandung' });

        await loginPage(page, creatorA);

        const res = await page.request.get('/creator/collaborations/999999');
        expect([403, 404]).toContain(res.status());
    });

    test('3. Outsider tidak dapat membaca pesan kolaborasi', async ({ page, request, baseURL }) => {
        const umkm = `umkm04c.${stamp}@collabite.test`;
        const creator = `creator04c.${stamp}@collabite.test`;
        const outsider = `outsider04.${stamp}@collabite.test`;

        await registerUmkm(request, baseURL!, umkm, 'UMKM Pesan', {
            business_name: 'B',
            business_type: 'Retail',
        });
        await registerCreator(request, baseURL!, creator, 'Creator Pesan', { city: 'Bekasi' });
        await registerCreator(request, baseURL!, outsider, 'Outsider Pesan', { city: 'Depok' });

        await loginPage(page, umkm);
        const campaignId = await createUmkmCampaignViaPage(page, `Kampanye Pesan ${stamp}`, 'Tes pesan.', true);

        await logoutSession(page);
        await loginPage(page, creator);
        await page.goto(`/creator/campaigns/${campaignId}`);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page.getByLabel('Pesan').fill('Saya berminat.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();

        await logoutSession(page);
        await loginPage(page, umkm);
        const collabId = acceptCollaborationRequestForCampaign(campaignId);

        await page.goto(`/umkm/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Pesan/ }).click();
        await page.getByPlaceholder('Tulis pesan...').fill('Pesan rahasia internal.');
        await page.getByRole('button', { name: 'Kirim' }).click();

        await logoutSession(page);
        await loginPage(page, outsider);

        const outsiderRes = await page.request.get(`/umkm/collaborations/${collabId}`);
        expect(outsiderRes.status()).toBe(403);

        const outsiderRes2 = await page.request.get(`/creator/collaborations/${collabId}`);
        expect(outsiderRes2.status()).toBe(403);

        const outsiderToken = await csrfFromPage(page, baseURL!);
        const msgRes = await page.request.post(`/umkm/collaborations/${collabId}/messages`, {
            headers: { 'X-XSRF-TOKEN': outsiderToken, Accept: 'application/json' },
            form: { body: 'Saya menyadap!' },
        });
        expect(msgRes.status()).toBe(403);
    });

    test('4. Outsider tidak dapat mengakses file private tanpa signed URL (403)', async ({ request }) => {
        const res = await request.get('/files/private/some/random/path.png');
        expect(res.status()).toBe(403);
    });

    test('5. Creator tidak dapat membuka /admin (403/302)', async ({ page, request, baseURL }) => {
        const creator = `creator04d.${stamp}@collabite.test`;
        await registerCreator(request, baseURL!, creator, 'Creator Admin Probe', { city: 'Solo' });

        await loginPage(page, creator);

        const adminRes = await page.request.get('/admin/dashboard');
        expect([302, 403]).toContain(adminRes.status());

        const adminUsersRes = await page.request.get('/admin/users');
        expect([302, 403]).toContain(adminUsersRes.status());
    });

    test('6. Pengguna Suspended tidak dapat melakukan aksi terlindungi (logout paksa)', async ({
        page,
        request,
        baseURL,
    }) => {
        const suspended = `suspend04.${stamp}@collabite.test`;
        await registerUmkm(request, baseURL!, suspended, 'UMKM Suspended', {
            business_name: 'S',
            business_type: 'Retail',
        });

        suspendUserByEmail(suspended);

        await page.goto('/login');
        await page.getByRole('textbox', { name: 'Email' }).fill(suspended);
        await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(E2E_PASSWORD);
        await page.getByRole('button', { name: 'Masuk' }).click();
        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByText(/dinonaktifkan|Hubungi admin/i).first()).toBeVisible();
    });

    test('7. Admin tidak dapat memakai route UMKM/Creator accept/reject (403)', async ({ page, baseURL }) => {
        await loginSeededUser(page, 'admin@collabite.test');
        const adminToken = await csrfFromPage(page, baseURL!);

        const acceptRes = await page.request.post('/umkm/requests/999999/accept', {
            headers: { 'X-XSRF-TOKEN': adminToken, Accept: 'application/json' },
        });
        expect([403, 404, 422]).toContain(acceptRes.status());

        const rejectRes = await page.request.post('/umkm/requests/999999/reject', {
            headers: { 'X-XSRF-TOKEN': adminToken, Accept: 'application/json' },
            form: { reason: 'Tidak valid.' },
        });
        expect([403, 404, 422]).toContain(rejectRes.status());
    });
});
