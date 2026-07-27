/**
 * Skenario E2E-06: "Matchmaking" murni lewat UI — UMKM membuat & mempublikasikan
 * campaign → Creator menemukan campaign lalu melamar → UMKM menerima lamaran
 * melalui tombol "Terima Lamaran" di halaman campaign → kolaborasi aktif
 * terlihat di daftar kolaborasi KEDUA belah pihak.
 *
 * Catatan: spec E2E-01 menerima lamaran via AcceptRequestAction (backend).
 * Spec ini sengaja menempuh jalur UI penuh untuk memastikan alur accept
 * di antarmuka benar-benar berfungsi.
 */

import { expect, test } from '@playwright/test';
import { loginPage, registerCreator, registerUmkm } from './_helpers';

const stamp = Date.now();
const umkmEmail = `umkm06.e2e.${stamp}@collabite.test`;
const creatorEmail = `creator06.e2e.${stamp}@collabite.test`;
const creatorName = `Creator Match ${stamp}`;
const campaignTitle = `Kampanye Matchmaking ${stamp}`;

test.describe.serial('E2E-06: Matchmaking penuh via UI sampai kolaborasi aktif', () => {
    test('UMKM publish campaign → Creator melamar → UMKM terima via UI → deal aktif dua sisi', async ({
        page,
        context,
        request,
        baseURL,
    }) => {
        test.setTimeout(180_000);

        await registerUmkm(request, baseURL!, umkmEmail, 'UMKM E2E-06', {
            business_name: 'Kedai Match E2E',
            business_type: 'Kuliner',
        });
        await registerCreator(request, baseURL!, creatorEmail, creatorName, {
            city: 'Bandung',
        });

        // ====== UMKM: buat & publikasikan campaign (UI) ======
        await loginPage(page, umkmEmail);
        await expect(page).toHaveURL(/\/umkm\/dashboard/);

        await page.goto('/umkm/campaigns/create');
        await page.getByLabel('Judul', { exact: true }).fill(campaignTitle);
        await page
            .getByLabel('Deskripsi', { exact: true })
            .fill('Butuh satu video reels untuk promosi menu baru.');
        await page.getByLabel('Budget (Rp)').fill('1000000');
        await page.getByLabel('Deadline').fill('2099-12-31');
        await page.getByLabel('Judul Deliverable').fill('Video Reels 30 detik');
        await page.locator('input[name="deliverables[0][quantity]"]').fill('1');
        await page.getByRole('button', { name: 'Buat Campaign' }).click();
        await expect(page).toHaveURL(/\/umkm\/campaigns\/\d+/);
        const campaignId = Number(page.url().match(/campaigns\/(\d+)/)![1]);

        await page.getByRole('button', { name: 'Publikasikan' }).click();
        await expect(page.getByText(/dipublikasikan/i)).toBeVisible();

        await context.clearCookies();

        // ====== Creator: temukan campaign lalu melamar (UI) ======
        await loginPage(page, creatorEmail);
        await expect(page).toHaveURL(/\/creator\/dashboard/);

        await page.goto('/creator/campaigns');
        await expect(page.getByText(campaignTitle)).toBeVisible();

        await page.goto(`/creator/campaigns/${campaignId}`);
        await page.getByRole('button', { name: 'Lamar Campaign Ini' }).click();
        await page
            .getByLabel('Pesan')
            .fill('Halo, saya tertarik dan siap mengerjakan sesuai brief.');
        await page.getByRole('button', { name: 'Kirim Lamaran' }).click();
        await expect(
            page.getByText(/Anda sudah mengajukan lamaran/i),
        ).toBeVisible();

        await context.clearCookies();

        // ====== UMKM: terima lamaran lewat tombol UI "Terima Lamaran" ======
        await loginPage(page, umkmEmail);
        await page.goto(`/umkm/campaigns/${campaignId}`);

        // Lamaran Creator harus tampil di bagian Lamaran & Undangan.
        await expect(page.getByText(/Lamaran & Undangan \(\d+\)/)).toBeVisible();
        await expect(page.getByText(creatorName)).toBeVisible();

        const acceptButton = page.getByRole('button', { name: 'Terima Lamaran' });
        await expect(acceptButton).toBeDisabled();
        await page.getByRole('checkbox').check();
        await expect(acceptButton).toBeEnabled();
        await acceptButton.click();
        await expect(page.getByText(/Pengajuan diterima/i)).toBeVisible();

        // ====== UMKM: deal terlihat di daftar kolaborasi ======
        await page.goto('/umkm/collaborations');
        await expect(page.getByText(campaignTitle)).toBeVisible();
        await expect(page.getByText(/Aktif|active/i).first()).toBeVisible();

        // Buka detail workspace — tab utama harus tersedia.
        await page.getByRole('link', { name: 'Detail' }).first().click();
        await expect(page).toHaveURL(/\/umkm\/collaborations\/\d+/);
        await expect(page.getByRole('tab', { name: /Pesan/ })).toBeVisible();

        await context.clearCookies();

        // ====== Creator: deal juga terlihat di sisi Creator ======
        await loginPage(page, creatorEmail);
        await page.goto('/creator/collaborations');
        await expect(page.getByText(campaignTitle)).toBeVisible();
        await expect(page.getByText(/Aktif|active/i).first()).toBeVisible();
    });
});
