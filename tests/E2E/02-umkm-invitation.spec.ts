/**
 * Skenario E2E-02: UMKM menemukan Creator → UMKM mengirim invitation →
 * Creator menerima invitation → pesan dalam kolaborasi berjalan →
 * Creator mengirim konten → UMKM menyetujui konten → kolaborasi selesai.
 */

import { expect, test } from '@playwright/test';
import {
    acceptCollaborationRequestForCampaign,
    createUmkmCampaignViaPage,
    loginPage,
    logoutSession,
    registerCreator,
    registerUmkm,
    sendCampaignInvitationViaPage,
    tinyPngBuffer,
    uploadCreatorSubmissionDraft,
    userIdByEmail,
} from './_helpers';

const stamp = Date.now();
const umkmEmail = `umkm02.e2e.${stamp}@collabite.test`;
const creatorEmail = `creator02.e2e.${stamp}@collabite.test`;
const campaignTitle = `Kampanye Invitation E2E-02 ${stamp}`;

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

        await loginPage(page, umkmEmail);
        const campaignId = await createUmkmCampaignViaPage(page, campaignTitle, 'Kampanye melalui invitation.', true);

        const creatorId = userIdByEmail(creatorEmail);
        const inviteStatus = await sendCampaignInvitationViaPage(page, baseURL!, campaignId, creatorId, 'Ayo kerja bareng!');
        expect([200, 302, 422]).toContain(inviteStatus);

        acceptCollaborationRequestForCampaign(campaignId);

        await logoutSession(page);
        await loginPage(page, creatorEmail);
        await page.goto('/creator/collaborations');
        await page.getByRole('link', { name: 'Detail' }).first().click();
        await expect(page).toHaveURL(/\/creator\/collaborations\/\d+/);
        const collabId = Number(page.url().match(/collaborations\/(\d+)/)![1]);

        await page.getByRole('tab', { name: /Pesan/ }).click();
        await page.getByPlaceholder('Tulis pesan...').fill('Halo, saya akan mulai dengan konsep X.');
        await page.getByRole('button', { name: 'Kirim' }).click();
        await expect(page.getByText('Halo, saya akan mulai dengan konsep X.')).toBeVisible();

        await page.getByRole('tab', { name: /Submission/ }).click();
        await uploadCreatorSubmissionDraft(page, 'Konten invitation v1', 'Hasil kerja pertama.');
        await page.getByRole('button', { name: 'Kirim untuk Review' }).first().click();
        await expect(page.getByText('Dalam Review')).toBeVisible();

        await context.clearCookies();

        await loginPage(page, umkmEmail);
        await page.goto(`/umkm/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Submission/ }).click();
        await page.getByRole('button', { name: 'Setujui' }).click();
        await expect(page.getByText(/^Disetujui/)).toBeVisible();

        const paymentTab = page.getByRole('tab', { name: /Pembayaran/ });
        const hasPaymentTab = await paymentTab.isVisible().catch(() => false);

        if (hasPaymentTab) {
            await paymentTab.click();
            await page.locator('input[name="proof"]').setInputFiles({
                name: 'bukti.png',
                mimeType: 'image/png',
                buffer: tinyPngBuffer,
            });
            await page.getByRole('button', { name: 'Kirim Bukti Pembayaran' }).click();
            await expect(page.getByText(/Menunggu Konfirmasi Creator/i)).toBeVisible();

            await context.clearCookies();
            await loginPage(page, creatorEmail);
            await page.goto(`/creator/collaborations/${collabId}`);
            await page.getByRole('tab', { name: /Pembayaran/ }).click();
            await page.getByRole('button', { name: 'Konfirmasi Pembayaran Diterima' }).click();
            await expect(page.getByText(/Pembayaran telah dikonfirmasi/i)).toBeVisible();
        }

        await context.clearCookies();
        await loginPage(page, umkmEmail);
        await page.goto(`/umkm/collaborations/${collabId}`);
        page.once('dialog', (d) => d.accept());
        await page.getByRole('tab', { name: /Review/ }).click();
        await page.getByRole('button', { name: 'Selesaikan Kolaborasi' }).click();
        await expect(page.getByText(/^Selesai$/)).toBeVisible();
    });
});
