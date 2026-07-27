/**
 * SKRIP DEMO COLLABITE — Opsi A (semua role kebagian)
 * ===================================================
 * Orkestrator modul:
 *   01–02  Register UMKM & Creator
 *   03     Admin setujui verifikasi
 *   04     UMKM dashboard CTA + 2 campaign (lamaran & undangan)
 *   05–06  Undangan Discover → Creator terima (skip: DEMO_SKIP_INVITE=1)
 *   07–08  Creator lamar → UMKM terima
 *   09     Workspace konten/revisi/bayar/review
 *   10     Admin oversight
 *
 * Jalankan: npm run test:e2e:demo
 * Tempo:    DEMO_STEP_MS=3000 DEMO_SLOWMO=700 npm run test:e2e:demo
 * Tanpa undangan: DEMO_SKIP_INVITE=1 npm run test:e2e:demo
 *
 * Spec: docs/superpowers/specs/2026-07-27-demo-ui-all-roles.md
 */

import { test } from '@playwright/test';

import { installDemoOverlay, narrate } from './demo-helpers';
import {
    creatorSubmitVerificationModule,
    registerCreatorModule,
    registerUmkmModule,
} from './modules/01-02-register';
import { adminApproveVerificationModule } from './modules/03-admin-verify';
import { umkmCampaignsModule } from './modules/04-umkm-campaigns';
import {
    creatorAcceptInviteModule,
    umkmInviteModule,
} from './modules/05-06-invite';
import { creatorApplyModule, umkmAcceptApplyModule } from './modules/07-08-apply';
import { workspaceDealModule } from './modules/09-workspace';
import { adminOversightModule } from './modules/10-admin-oversight';
import { createDemoCtx } from './modules/types';

test.describe.serial('DEMO Collabite — alur penuh UMKM, Creator, & Admin (Opsi A)', () => {
    test('Dari daftar akun hingga kolaborasi selesai & dimoderasi admin', async ({
        page,
        context,
    }) => {
        test.setTimeout(30 * 60_000);
        await installDemoOverlay(page);

        const ctx = createDemoCtx(page, context, Date.now());

        await page.goto('/');
        await narrate(
            page,
            {
                scene: 'PEMBUKA',
                title: 'Collabite: menghubungkan UMKM dengan Content Creator',
                note: 'Tiga peran setara — UMKM, Creator, Admin. Dua jalur matchmaking: undangan & lamaran.',
            },
            4000,
        );

        await registerUmkmModule(ctx);
        await registerCreatorModule(ctx);
        await creatorSubmitVerificationModule(ctx);
        await adminApproveVerificationModule(ctx);
        await umkmCampaignsModule(ctx);
        await umkmInviteModule(ctx);
        await creatorAcceptInviteModule(ctx);
        await creatorApplyModule(ctx);
        await umkmAcceptApplyModule(ctx);
        await workspaceDealModule(ctx);
        await adminOversightModule(ctx);
    });
});
