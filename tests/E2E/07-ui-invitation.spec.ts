/**
 * Skenario E2E-07: Matchmaking dua arah via UI — UMKM mencari Creator di Discover,
 * mengirim undangan ke campaign terbuka, lalu Creator menerima undangan di halaman
 * Permintaan → kolaborasi aktif terlihat di kedua portal.
 *
 * Catatan: E2E-02 menerima undangan lewat AcceptRequestAction (backend).
 * Spec ini menempuh jalur UI penuh (tombol "Undang" → "Kirim Undangan" →
 * "Terima Undangan") agar alur undangan di antarmuka tetap terjaga.
 */

import { expect, test } from '@playwright/test';
import {
    createUmkmCampaignViaPage,
    loginPage,
    registerCreator,
    registerUmkm,
} from './_helpers';

const stamp = Date.now();
const umkmEmail = `umkm07.e2e.${stamp}@collabite.test`;
const creatorEmail = `creator07.e2e.${stamp}@collabite.test`;
const creatorName = `Creator Invite ${stamp}`;
const campaignTitle = `Kampanye Undangan ${stamp}`;

test.describe.serial('E2E-07: UMKM undang Creator via UI sampai kolaborasi aktif', () => {
    test('UMKM Discover → Undang → Creator Terima Undangan → deal aktif dua sisi', async ({
        page,
        context,
        request,
        baseURL,
    }) => {
        test.setTimeout(180_000);

        await registerUmkm(request, baseURL!, umkmEmail, 'UMKM E2E-07', {
            business_name: 'Studio Undangan E2E',
            business_type: 'Kuliner',
        });
        await registerCreator(request, baseURL!, creatorEmail, creatorName, {
            city: 'Bandung',
        });

        // ====== UMKM: buat & publikasikan campaign (prasyarat undangan) ======
        await loginPage(page, umkmEmail);
        await createUmkmCampaignViaPage(
            page,
            campaignTitle,
            'Campaign untuk undangan Creator via Discover.',
            true,
        );

        // ====== UMKM: cari Creator di Discover lalu undang (UI) ======
        await page.goto('/umkm/discover');
        await page.getByLabel('Kata kunci').fill(creatorName);
        await page.getByRole('button', { name: 'Terapkan filter' }).click();
        await expect(page.getByText(creatorName)).toBeVisible({ timeout: 15_000 });

        // Buka form undangan pada kartu Creator yang cocok.
        const card = page
            .locator('div')
            .filter({ hasText: creatorName })
            .filter({ has: page.getByRole('button', { name: /Undang Creator/ }) })
            .first();
        await card.getByRole('button', { name: /Undang Creator/ }).click();

        // Satu campaign terbuka: otomatis terpilih; pastikan label konfirmasi terlihat.
        await expect(page.getByText(/Undangan akan dikirim untuk/i)).toBeVisible();
        await page.getByLabel('Pesan undangan').fill(
            'Halo, kami ingin mengajak Anda berkolaborasi di campaign ini.',
        );
        await expect(
            page.getByRole('button', { name: /Kirim undangan ke/i }),
        ).toBeEnabled();
        await page.getByRole('button', { name: /Kirim undangan ke/i }).click();
        await expect(page.getByText(/Undangan terkirim/i)).toBeVisible();

        // UMKM melihat undangan pending di detail campaign.
        await page.goto('/umkm/campaigns');
        await page.getByRole('row').filter({ hasText: campaignTitle }).getByRole('link', { name: 'Detail' }).click();
        await expect(page).toHaveURL(/\/umkm\/campaigns\/\d+/);
        await expect(page.getByText(/Lamaran & Undangan \(\d+\)/)).toBeVisible();
        await expect(page.getByText(/Undangan · pending/i)).toBeVisible();

        await context.clearCookies();

        // ====== Creator: terima undangan lewat UI ======
        await loginPage(page, creatorEmail);
        await page.goto('/creator/requests');
        await expect(page.getByText(campaignTitle)).toBeVisible();
        await expect(page.getByText(/Undangan UMKM/i)).toBeVisible();

        const acceptButton = page.getByRole('button', { name: 'Terima Undangan' });
        await expect(acceptButton).toBeDisabled();
        await page.getByRole('checkbox').check();
        await expect(acceptButton).toBeEnabled();

        // Terima undangan → redirect ke daftar kolaborasi + flash.
        await Promise.all([
            page.waitForURL(/\/creator\/collaborations/, { timeout: 15_000 }),
            acceptButton.click(),
        ]);
        await expect(page.getByText(/Undangan diterima|Kolaborasi dimulai/i)).toBeVisible();

        // ====== Creator: deal aktif di daftar kolaborasi ======
        await expect(page.getByText(campaignTitle)).toBeVisible();
        await expect(page.getByText(/Aktif/i).first()).toBeVisible();

        await context.clearCookies();

        // ====== UMKM: deal aktif juga di sisi UMKM ======
        await loginPage(page, umkmEmail);
        await page.goto('/umkm/collaborations');
        await expect(page.getByText(campaignTitle)).toBeVisible();
        await expect(page.getByText(/Aktif|active/i).first()).toBeVisible();

        await page.getByRole('link', { name: 'Detail' }).first().click();
        await expect(page).toHaveURL(/\/umkm\/collaborations\/\d+/);
        await expect(page.getByRole('tab', { name: /Pesan/ })).toBeVisible();
    });
});
