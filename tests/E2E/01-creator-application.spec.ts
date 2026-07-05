/**
 * Skenario E2E-01: UMKM membuat campaign → Creator melamar → UMKM menerima →
 * kolaborasi dimulai → Creator memperbarui progres → Creator mengirim
 * submission → UMKM meminta revisi → Creator mengirim ulang → UMKM menyetujui
 * submission → kolaborasi selesai → kedua pihak memberi review.
 */

import { expect, test } from '@playwright/test';
import {
    acceptCollaborationRequestForCampaign,
    loginPage,
    openCollaboration,
    openCreatorCampaign,
    registerCreator,
    registerUmkm,
} from './_helpers';

const stamp = Date.now();
const umkmEmail = `umkm01.e2e.${stamp}@collabite.test`;
const creatorEmail = `creator01.e2e.${stamp}@collabite.test`;
const campaignTitle = `Kampanye E2E-01 ${stamp}`;

test.describe.serial('E2E-01: Lamaran Creator hingga kolaborasi selesai & review', () => {
    test('UMKM membuat campaign, Creator melamar, kolaborasi penuh dengan review', async ({
        page,
        context,
        request,
        baseURL,
    }) => {
        test.setTimeout(120_000);
        await registerUmkm(request, baseURL!, umkmEmail, 'UMKM E2E-01', {
            business_name: 'Warung E2E',
            business_type: 'Kuliner',
        });
        await registerCreator(request, baseURL!, creatorEmail, 'Creator E2E-01', { city: 'Bandung' });        // ====== UMKM: buat campaign ======
        await loginPage(page, umkmEmail);
        await expect(page).toHaveURL(/\/umkm\/dashboard/);

        await page.goto('/umkm/campaigns/create');
        await page.getByLabel('Judul', { exact: true }).fill(campaignTitle);
        await page.getByLabel('Deskripsi', { exact: true }).fill('Kampanye uji end-to-end Playwright.');
        await page.getByLabel('Budget (Rp)').fill('1500000');
        await page.getByLabel('Deadline').fill('2099-12-31');
        await page.getByLabel('Judul Deliverable').fill('Video promosi 30 detik');
        await page.locator('input[name="deliverables[0][quantity]"]').fill('1');
        await page.getByRole('button', { name: 'Buat Campaign' }).click();
        await expect(page).toHaveURL(/\/umkm\/campaigns\/\d+/);
        const campaignUrl = page.url();
        const campaignId = Number(campaignUrl.match(/campaigns\/(\d+)/)![1]);

        // Publish.
        await page.getByRole('button', { name: 'Publikasikan' }).click();
        await expect(page.getByText(/dipublikasikan/i)).toBeVisible();

        await context.clearCookies();

        // ====== Creator: melamar ======
        await loginPage(page, creatorEmail);
        await expect(page).toHaveURL(/\/creator\/dashboard/);

        await page.goto('/creator/campaigns');
        await openCreatorCampaign(page, campaignId);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page.getByLabel('Pesan').fill('Saya tertarik dan siap mengerjakannya.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();
        await expect(page.getByText(/Anda sudah mengajukan lamaran/i)).toBeVisible();

        await context.clearCookies();

        // ====== UMKM: menerima lamaran via API + lihat halaman kolaborasi ======
        await loginPage(page, umkmEmail);
        await expect(page).toHaveURL(/\/umkm\/dashboard/);

        const collabId = acceptCollaborationRequestForCampaign(campaignId);

        await openCollaboration(page, 'umkm', collabId);
        await expect(page).toHaveURL(new RegExp(`/umkm/collaborations/${collabId}`));

        await context.clearCookies();

        // ====== Creator: progres + submission ======
        await loginPage(page, creatorEmail);
        await openCollaboration(page, 'creator', collabId);
        await expect(page).toHaveURL(new RegExp(`/creator/collaborations/${collabId}`));

        await page.getByRole('tab', { name: /Progres/ }).click();
        await page.getByLabel('Update progres...').fill('Mulai拍摄 konten hari ini.');
        await page.getByRole('button', { name: 'Posting Progres' }).click();
        await expect(page.getByText('Mulai拍摄 konten hari ini.')).toBeVisible();

        // Upload draft + submit for review.
        await page.getByRole('tab', { name: /Submission/ }).click();
        await page.getByLabel('Judul', { exact: true }).fill('Draft konten pertama');
        await page.locator('input[name="files[]"]').setInputFiles({
            name: 'tiny.png',
            mimeType: 'image/png',
            buffer: Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
                0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x00,
                0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
                0x42, 0x60, 0x82,
            ]),
        });
        await page.getByLabel('Deskripsi', { exact: true }).fill('Draft awal, mohon review.');
        await page.getByRole('button', { name: 'Upload Submission' }).click();
        await expect(page.getByText(/Submission v\d+ berhasil dibuat/i)).toBeVisible();
        await page.getByRole('tab', { name: /Submission/ }).click();
        await page.getByRole('button', { name: 'Kirim untuk Review' }).first().click();
        await expect(page.getByText('Dalam Review')).toBeVisible();

        await context.clearCookies();

        // ====== UMKM: minta revisi ======
        await loginPage(page, umkmEmail);
        await page.goto(`/umkm/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Submission/ }).click();
        await page.getByRole('button', { name: 'Minta Revisi' }).click();
        await expect(page.getByText('Revisi Diminta')).toBeVisible();

        await context.clearCookies();

        // ====== Creator: kirim ulang submission ======
        await loginPage(page, creatorEmail);
        await page.goto(`/creator/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Submission/ }).click();
        await page.getByLabel('Judul', { exact: true }).fill('Revisi konten v2');
        await page.locator('input[name="files[]"]').setInputFiles({
            name: 'tiny.png',
            mimeType: 'image/png',
            buffer: Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
                0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x00,
                0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
                0x42, 0x60, 0x82,
            ]),
        });
        await page.getByLabel('Deskripsi', { exact: true }).fill('Sudah disesuaikan dengan masukan.');
        await page.getByRole('button', { name: 'Upload Revisi' }).click();
        await page.getByRole('button', { name: 'Kirim untuk Review' }).first().click();
        await expect(page.getByText('Dalam Review').first()).toBeVisible();

        await context.clearCookies();

        // ====== UMKM: setujui submission, unggah bukti bayar, selesaikan kolaborasi ======
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
                buffer: Buffer.from([
                    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
                    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
                    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x00,
                    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
                    0x42, 0x60, 0x82,
                ]),
            });
            await page.getByRole('button', { name: 'Kirim Bukti Pembayaran' }).click();
            await expect(page.getByText(/Menunggu Konfirmasi Creator/i)).toBeVisible();

            await context.clearCookies();

            // ====== Creator: konfirmasi pembayaran ======
            await loginPage(page, creatorEmail);
            await page.goto(`/creator/collaborations/${collabId}`);
            await page.getByRole('tab', { name: /Pembayaran/ }).click();
            await page.getByRole('button', { name: 'Konfirmasi Pembayaran Diterima' }).click();
            await expect(page.getByText(/Pembayaran telah dikonfirmasi/i)).toBeVisible();
        }

        await context.clearCookies();

        // ====== UMKM: selesaikan kolaborasi ======
        await loginPage(page, umkmEmail);
        await page.goto(`/umkm/collaborations/${collabId}`);
        page.once('dialog', (d) => d.accept());
        await page.getByRole('tab', { name: /Review/ }).click();
        await page.getByRole('button', { name: 'Selesaikan Kolaborasi' }).click();
        await expect(page.getByText(/^Selesai$/)).toBeVisible();

        // Review oleh UMKM.
        await page.getByLabel('Ulasan').fill('Kolaborasi sangat memuaskan, hasil konten sesuai brief.');
        await page.getByRole('button', { name: 'Kirim Review' }).click();
        await expect(page.getByText('★5/5')).toBeVisible();

        await context.clearCookies();

        // ====== Creator: review untuk UMKM ======
        await loginPage(page, creatorEmail);
        await page.goto(`/creator/collaborations/${collabId}`);
        await page.getByRole('tab', { name: /Review/ }).click();
        await page.getByLabel('Ulasan').fill('Brief jelas, komunikasi lancar.');
        await page.getByRole('button', { name: 'Kirim Review' }).click();
        await expect(page.getByText('★5/5')).toBeVisible();
    });
});
