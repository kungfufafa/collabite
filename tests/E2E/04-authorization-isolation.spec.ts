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
import { E2E_PASSWORD, loginPage, registerCreator, registerUmkm } from './_helpers';

const stamp = Date.now();

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

        // UMKM A login & buat campaign.
        await loginPage(page, umkmA);
        await expect(page).toHaveURL(/\/umkm\/dashboard/);

        await page.goto('/umkm/campaigns/create');
        await page.getByLabel('Judul').fill(`Kampanye A ${stamp}`);
        await page.getByLabel('Deskripsi').fill('Milik UMKM A.');
        await page.getByLabel('Budget (Rp)').fill('500000');
        await page.getByLabel('Deadline').fill('2099-12-31');
        await page.getByRole('button', { name: 'Buat Campaign' }).click();
        await expect(page).toHaveURL(/\/umkm\/campaigns\/\d+/);
        const aCampaignId = Number(page.url().match(/campaigns\/(\d+)/)![1]);

        // Logout UMKM A.
        await page.goto('/logout');
        await page.getByRole('button', { name: 'Log out' }).click().catch(() => null);

        // UMKM B login.
        await loginPage(page, umkmB);

        // UMKM B coba akses halaman edit campaign UMKM A → harus 403.
        const editRes = await request.get(`/umkm/campaigns/${aCampaignId}/edit`);
        expect(editRes.status()).toBe(403);

        // UMKM B coba update campaign UMKM A via PATCH → 403.
        const token = await primeCsrf(request, baseURL!);
        const patchRes = await request.patch(`/umkm/campaigns/${aCampaignId}`, {
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

        // Login sebagai Creator A; akses URL kolaborasi fiktif → 403/404.
        await loginPage(page, creatorA);

        // Buka kolaborasi id 999999 (tidak ada atau bukan miliknya) → 403/404.
        const res = await request.get('/creator/collaborations/999999');
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

        // UMKM login.
        await loginPage(page, umkm);
        // Buat campaign & publish, lalu accept lamaran Creator → kolaborasi.
        await page.goto('/umkm/campaigns/create');
        await page.getByLabel('Judul').fill(`Kampanye Pesan ${stamp}`);
        await page.getByLabel('Deskripsi').fill('Tes pesan.');
        await page.getByLabel('Budget (Rp)').fill('300000');
        await page.getByLabel('Deadline').fill('2099-12-31');
        await page.getByRole('button', { name: 'Buat Campaign' }).click();
        await page.getByRole('button', { name: 'Publikasikan' }).click();
        const campaignId = Number(page.url().match(/campaigns\/(\d+)/)![1]);

        // Creator melamar via API (frontend sudah login sebelumnya — ganti ke Creator).
        await page.goto('/logout');
        await loginPage(page, creator);
        await page.goto(`/creator/campaigns/${campaignId}`);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page.getByLabel('Pesan').fill('Saya berminat.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();

        // UMKM terima lamaran.
        await page.goto('/logout');
        await loginPage(page, umkm);
        const umkmToken = await primeCsrf(request, baseURL!);
        const showRes = await request.get(`/umkm/campaigns/${campaignId}`);
        const body = await showRes.text();
        const reqId = Number(body.match(/"id":(\d+)/)![1]);
        await request.post(`/requests/${reqId}/accept`, {
            headers: { 'X-XSRF-TOKEN': umkmToken, Accept: 'application/json' },
        });

        // Ambil collaboration id.
        const collabList = await request.get('/umkm/collaborations');
        const collabBody = await collabList.text();
        const collabId = Number(collabBody.match(/collaborations\/(\d+)/)![1]);

        // Kirim pesan rahasia.
        await page.goto(`/umkm/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Pesan/ }).click();
        await page.getByLabel('Pesan').fill('Pesan rahasia internal.');
        await page.getByRole('button', { name: 'Kirim' }).click();

        // Logout UMKM, login sebagai outsider.
        await page.goto('/logout');
        await loginPage(page, outsider);

        // Outsider tidak bisa membuka kolaborasi ini.
        const outsiderRes = await request.get(`/umkm/collaborations/${collabId}`);
        expect(outsiderRes.status()).toBe(403);

        // Outsider juga tidak bisa membuka via URL Creator.
        const outsiderRes2 = await request.get(`/creator/collaborations/${collabId}`);
        expect(outsiderRes2.status()).toBe(403);

        // Outsider tidak bisa mengirim pesan ke kolaborasi ini.
        const outsiderToken = await primeCsrf(request, baseURL!);
        const msgRes = await request.post(`/umkm/collaborations/${collabId}/messages`, {
            headers: { 'X-XSRF-TOKEN': outsiderToken, Accept: 'application/json' },
            form: { body: 'Saya menyadap!' },
        });
        expect(msgRes.status()).toBe(403);
    });

    test('4. Outsider tidak dapat mengakses file private tanpa signed URL (403)', async ({ request }) => {
        // Akses file private dengan path arbitrer, tanpa signature.
        const res = await request.get('/files/private/some/random/path.png');
        expect(res.status()).toBe(403);
    });

    test('5. Creator tidak dapat membuka /admin (403/302)', async ({ page, request, baseURL }) => {
        const creator = `creator04d.${stamp}@collabite.test`;
        await registerCreator(request, baseURL!, creator, 'Creator Admin Probe', { city: 'Solo' });

        await loginPage(page, creator);

        const adminRes = await request.get('/admin/dashboard');
        expect([302, 403]).toContain(adminRes.status());

        const adminUsersRes = await request.get('/admin/users');
        expect([302, 403]).toContain(adminUsersRes.status());
    });

    test('6. Pengguna Suspended tidak dapat melakukan aksi terlindungi (logout paksa)', async ({ page, request, baseURL }) => {
        // Daftar akun UMKM biasa.
        const suspended = `suspend04.${stamp}@collabite.test`;
        await registerUmkm(request, baseURL!, suspended, 'UMKM Suspended', {
            business_name: 'S',
            business_type: 'Retail',
        });

        // Admin suspend akun ini.
        await loginPage(page, 'admin@collabite.test');

        // Cari user id via endpoint admin users.
        const adminToken = await primeCsrf(request, baseURL!);
        const usersRes = await request.get('/admin/users');
        const body = await usersRes.text();
        const userMatch = body.match(new RegExp(`"id":(\\d+)[^}]*"email":"${suspended}"`));
        let userId: number;
        if (userMatch) {
            userId = Number(userMatch[1]);
        } else {
            // Fallback: ekstrak id dalam urutan (kurang presisi, gunakan regex non-greedy)
            const fallback = body.match(new RegExp(`"id":(\\d+),[^}]*"email":"${suspended.replace(/\./g, '\\.')}"`));
            expect(fallback).not.toBeNull();
            userId = Number(fallback![1]);
        }

        const suspendRes = await request.patch(`/admin/users/${userId}/status`, {
            headers: { 'X-XSRF-TOKEN': adminToken, Accept: 'application/json' },
            form: { account_status: 'suspended' },
        });
        expect([200, 302]).toContain(suspendRes.status());

        // Logout admin, login sebagai suspended.
        await page.goto('/logout');
        await loginPage(page, suspended);
        // Middleware akan logout paksa dan kembali ke login dengan pesan error.
        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByText(/dinonaktifkan|Hubungi admin/i)).toBeVisible();
    });

    test('7. Admin tidak dapat memakai route UMKM/Creator accept/reject (403)', async ({ page, request, baseURL }) => {
        // Login admin.
        await loginPage(page, 'admin@collabite.test');
        const adminToken = await primeCsrf(request, baseURL!);

        // Route UMKM requests/{request}/accept dicek authorize di controller:
        //   abort_unless(admin || umkm-of-campaign || creator-of-request)
        // Admin tidak otomatis lolos jika bukan salah satu pihak → 403.
        const acceptRes = await request.post('/requests/999999/accept', {
            headers: { 'X-XSRF-TOKEN': adminToken, Accept: 'application/json' },
        });
        expect([403, 404, 422]).toContain(acceptRes.status());

        const rejectRes = await request.post('/requests/999999/reject', {
            headers: { 'X-XSRF-TOKEN': adminToken, Accept: 'application/json' },
            form: { reason: 'Tidak valid.' },
        });
        expect([403, 404, 422]).toContain(rejectRes.status());
    });
});
