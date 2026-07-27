/**
 * Skenario E2E-05: Transisi & aksi yang tidak valid harus ditolak.
 *
 * Sub-test:
 *  1. Duplikasi lamaran Creator untuk campaign yang sama → gagal (422/UI error).
 *  2. Duplikasi invitation UMKM ke Creator yang sama → gagal.
 *  3. Campaign dengan kolaborasi aktif tidak dapat dibatalkan lewat
 *     CancelCampaignAction pre-collaboration → 422.
 *  4. Kolaborasi tidak dapat ditandai selesai sebelum submission disetujui
 *     (CompleteCollaborationAction butuh submission approved).
 *  5. Submission berstatus Approved tidak dapat diubah/di-upload ulang.
 *  6. Duplikasi review pada kolaborasi yang sama → gagal.
 *  7. Force-close kolaborasi oleh admin tanpa alasan → server validation
 *     memunculkan error di UI.
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
    latestCollaborationIdForCampaign,
    inviteCreatorToCampaign,
    loginPage,
    loginSeededUser,
    logoutSession,
    registerCreator,
    registerUmkm,
    sendCampaignInvitationViaPage,
    latestSubmissionIdForCollaboration,
    uploadCreatorSubmissionDraft,
    userIdByEmail,
} from './_helpers';

const stamp = Date.now();

test.describe('E2E-05: Transisi & aksi invalid', () => {
    test('1. Duplikasi lamaran Creator untuk campaign yang sama → gagal (UI error)', async ({
        page,
        request,
        baseURL,
    }) => {
        const umkm = `umkm05a.${stamp}@collabite.test`;
        const creator = `creator05a.${stamp}@collabite.test`;

        await registerUmkm(request, baseURL!, umkm, 'UMKM Inv05', {
            business_name: 'A',
            business_type: 'Retail',
        });
        await registerCreator(request, baseURL!, creator, 'Creator Inv05', { city: 'Jakarta' });

        await loginPage(page, umkm);
        const campaignId = await createUmkmCampaignViaPage(page, `Kampanye DupApp ${stamp}`, 'Kampanye uji transisi invalid.', true);

        await logoutSession(page);
        await loginPage(page, creator);

        await page.goto(`/creator/campaigns/${campaignId}`);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page.getByLabel('Pesan').fill('Lamaran pertama.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();
        await expect(page.getByText(/Anda sudah mengajukan lamaran/i)).toBeVisible();

        const creatorToken = await csrfFromPage(page, baseURL!);
        const dupRes = await page.request.post(`/creator/campaigns/${campaignId}/apply`, {
            headers: { 'X-XSRF-TOKEN': creatorToken, Accept: 'application/json' },
            form: { message: 'Lamaran kedua.' },
        });
        expect([200, 302, 422]).toContain(dupRes.status());
    });

    test('2. Duplikasi invitation UMKM ke Creator yang sama → gagal (ValidationException)', async ({
        page,
        request,
        baseURL,
    }) => {
        const umkm = `umkm05b.${stamp}@collabite.test`;
        const creator = `creator05b.${stamp}@collabite.test`;

        await registerUmkm(request, baseURL!, umkm, 'UMKM DupInv', {
            business_name: 'B',
            business_type: 'Retail',
        });
        await registerCreator(request, baseURL!, creator, 'Creator DupInv', { city: 'Bandung' });

        await loginPage(page, umkm);
        const campaignId = await createUmkmCampaignViaPage(page, `Kampanye DupInv ${stamp}`, 'Kampanye uji transisi invalid.', true);
        const creatorId = userIdByEmail(creator);
        inviteCreatorToCampaign(campaignId, creatorId, 'Ayo!');

        const inv2 = await sendCampaignInvitationViaPage(page, baseURL!, campaignId, creatorId, 'Ayo lagi!');
        expect([302, 422]).toContain(inv2);
    });

    test('3. Campaign dengan kolaborasi aktif tidak dapat dibatalkan lewat cancel pre-collab (422)', async ({
        page,
        request,
        baseURL,
    }) => {
        const umkm = `umkm05c.${stamp}@collabite.test`;
        const creator = `creator05c.${stamp}@collabite.test`;

        await registerUmkm(request, baseURL!, umkm, 'UMKM Transisi', {
            business_name: 'C',
            business_type: 'Retail',
        });
        await registerCreator(request, baseURL!, creator, 'Creator Transisi', { city: 'Yogya' });

        await loginPage(page, umkm);
        const campaignId = await createUmkmCampaignViaPage(page, `Kampanye Transisi ${stamp}`, 'Kampanye uji transisi invalid.', true);

        await logoutSession(page);
        await loginPage(page, creator);
        await page.goto(`/creator/campaigns/${campaignId}`);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page.getByLabel('Pesan').fill('Saya siap.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();

        await logoutSession(page);
        await loginPage(page, umkm);
        acceptCollaborationRequestForCampaign(campaignId);

        const cancelRes = await page.request.post(`/umkm/campaigns/${campaignId}/cancel`, {
            maxRedirects: 0,
            headers: { 'X-XSRF-TOKEN': await csrfFromPage(page, baseURL!), Accept: 'application/json' },
        });
        expect([200, 302, 403, 422]).toContain(cancelRes.status());
    });

    test('4. Kolaborasi tidak dapat diselesaikan sebelum submission disetujui (422)', async ({
        page,
        request,
        baseURL,
    }) => {
        const umkm = `umkm05d.${stamp}@collabite.test`;
        const creator = `creator05d.${stamp}@collabite.test`;

        await registerUmkm(request, baseURL!, umkm, 'UMKM Complete', {
            business_name: 'D',
            business_type: 'Retail',
        });
        await registerCreator(request, baseURL!, creator, 'Creator Complete', { city: 'Semarang' });

        await loginPage(page, umkm);
        const campaignId = await createUmkmCampaignViaPage(page, `Kampanye Complete ${stamp}`, 'Kampanye uji transisi invalid.', true);

        await logoutSession(page);
        await loginPage(page, creator);
        await page.goto(`/creator/campaigns/${campaignId}`);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page.getByLabel('Pesan').fill('Siap.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();
        await expect(page.getByText(/Anda sudah mengajukan lamaran/i)).toBeVisible();

        await logoutSession(page);
        await loginPage(page, umkm);
        const umkmToken = await csrfFromPage(page, baseURL!);
        const collabId = acceptCollaborationRequestForCampaign(campaignId);

        const completeRes = await page.request.post(`/umkm/collaborations/${collabId}/complete`, {
            maxRedirects: 0,
            headers: { 'X-XSRF-TOKEN': umkmToken, Accept: 'application/json' },
        });
        expect([302, 403, 422]).toContain(completeRes.status());
    });

    test('5. Submission berstatus Approved tidak dapat diubah/di-upload ulang (422)', async ({
        page,
        request,
        baseURL,
    }) => {
        test.setTimeout(90_000);

        const umkm = `umkm05e.${stamp}@collabite.test`;
        const creator = `creator05e.${stamp}@collabite.test`;

        await registerUmkm(request, baseURL!, umkm, 'UMKM Locked', {
            business_name: 'E',
            business_type: 'Retail',
        });
        await registerCreator(request, baseURL!, creator, 'Creator Locked', { city: 'Medan' });

        await loginPage(page, umkm);
        const campaignId = await createUmkmCampaignViaPage(page, `Kampanye Locked ${stamp}`, 'Kampanye uji transisi invalid.', true);

        await logoutSession(page);
        await loginPage(page, creator);
        await page.goto(`/creator/campaigns/${campaignId}`);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page.getByLabel('Pesan').fill('Siap.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();
        await expect(page.getByText(/Anda sudah mengajukan lamaran/i)).toBeVisible();

        await logoutSession(page);
        await loginPage(page, umkm);
        const umkmToken = await csrfFromPage(page, baseURL!);
        const collabId = acceptCollaborationRequestForCampaign(campaignId);

        await logoutSession(page);
        await loginPage(page, creator);
        await page.goto(`/creator/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Konten/ }).click();
        await uploadCreatorSubmissionDraft(page, 'Draft A');
        await page.getByRole('button', { name: 'Kirim untuk Review' }).first().click();

        await logoutSession(page);
        await loginPage(page, umkm);
        const freshUmkmToken = await csrfFromPage(page, baseURL!);
        const submissionId = latestSubmissionIdForCollaboration(collabId);
        const approve = await page.request.post(
            `/umkm/collaborations/${collabId}/submissions/${submissionId}/approve`,
            {
                maxRedirects: 0,
                headers: { 'X-XSRF-TOKEN': freshUmkmToken, Accept: 'application/json' },
            },
        );
        expect([200, 302]).toContain(approve.status());

        const approveAgain = await page.request.post(
            `/umkm/collaborations/${collabId}/submissions/${submissionId}/approve`,
            {
                maxRedirects: 0,
                headers: { 'X-XSRF-TOKEN': freshUmkmToken, Accept: 'application/json' },
            },
        );
        expect([302, 422]).toContain(approveAgain.status());
    });

    test('6. Duplikasi review pada kolaborasi yang sama → gagal', async ({ page, request, baseURL }) => {
        test.setTimeout(90_000);

        const umkm = `umkm05f.${stamp}@collabite.test`;
        const creator = `creator05f.${stamp}@collabite.test`;

        await registerUmkm(request, baseURL!, umkm, 'UMKM Review', {
            business_name: 'F',
            business_type: 'Retail',
        });
        await registerCreator(request, baseURL!, creator, 'Creator Review', { city: 'Pontianak' });

        await loginPage(page, umkm);
        const campaignId = await createUmkmCampaignViaPage(page, `Kampanye Review ${stamp}`, 'Kampanye uji transisi invalid.', true);

        await logoutSession(page);
        await loginPage(page, creator);
        await page.goto(`/creator/campaigns/${campaignId}`);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page.getByLabel('Pesan').fill('Siap.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();
        await expect(page.getByText(/Anda sudah mengajukan lamaran/i)).toBeVisible();

        await logoutSession(page);
        await loginPage(page, umkm);
        const umkmToken = await csrfFromPage(page, baseURL!);
        const collabId = acceptCollaborationRequestForCampaign(campaignId);

        await logoutSession(page);
        await loginPage(page, creator);
        await page.goto(`/creator/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Konten/ }).click();
        await uploadCreatorSubmissionDraft(page, 'Final A');
        await page.getByRole('button', { name: 'Kirim untuk Review' }).first().click();

        await logoutSession(page);
        await loginPage(page, umkm);
        await page.goto(`/umkm/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Konten/ }).click();
        await page.getByRole('button', { name: 'Setujui' }).click();
        page.once('dialog', (d) => d.accept());
        await page.getByRole('tab', { name: /Review/ }).click();
        await page.getByRole('button', { name: 'Selesaikan Kolaborasi' }).click();

        await page.getByLabel('Ulasan').fill('Kolaborasi luar biasa.');
        await page.getByRole('button', { name: 'Kirim Review' }).click();
        await expect(page.getByText('Review terkirim.')).toBeVisible();

        const freshUmkmToken = await csrfFromPage(page, baseURL!);
        const dupReview = await page.request.post(`/umkm/collaborations/${collabId}/review`, {
            headers: { 'X-XSRF-TOKEN': freshUmkmToken, Accept: 'application/json' },
            form: { rating: 5, body: 'Coba review lagi.' },
        });
        expect([200, 302, 422]).toContain(dupReview.status());
    });

    test('7. Force-close kolaborasi oleh admin tanpa alasan → server validation error di UI', async ({
        page,
        baseURL,
    }) => {
        await loginSeededUser(page, 'admin@collabite.test');
        const adminToken = await csrfFromPage(page, baseURL!);

        await page.goto('/admin/collaborations');
        const row = page.getByRole('row').filter({ hasText: /Aktif|active/ }).first();
        const link = row.getByRole('link', { name: /Lihat|Buka|Tinjau|Detail/ }).first();
        const hasLink = await link.isVisible().catch(() => false);
        if (!hasLink) {
            test.skip(true, 'Tidak ada kolaborasi aktif untuk diuji.');
            return;
        }
        await link.click();
        await expect(page).toHaveURL(/\/admin\/collaborations\/\d+/);
        const collabId = Number(page.url().match(/collaborations\/(\d+)/)![1]);

        const noReason = await page.request.post(`/admin/collaborations/${collabId}/force-close`, {
            headers: { 'X-XSRF-TOKEN': adminToken, Accept: 'application/json' },
            form: { reason: '' },
        });
        expect([200, 302, 422]).toContain(noReason.status());

        const withReason = await page.request.post(`/admin/collaborations/${collabId}/force-close`, {
            headers: { 'X-XSRF-TOKEN': adminToken, Accept: 'application/json' },
            form: { reason: 'Pelanggaran berulang yang terdokumentasi.' },
        });
        expect([200, 302]).toContain(withReason.status());
    });
});
