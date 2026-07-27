/**
 * Full browser audit — verifies every primary Inertia page renders content
 * via real Chromium. Detects blank pages from paginator shape mismatch,
 * layout binding errors, or missing shared props.
 *
 * Run:
 *   npx playwright test tests/E2E/runtime/full_browser_audit.spec.ts
 */
import { test } from '@playwright/test';
import { clearLoginRateLimit, loginSeededUser } from '../_helpers';

const baseURL = 'http://collabite.test';

const pages: Array<{ actor: string; label: string; path: string; loginAs?: 'umkm' | 'creator' | 'admin' }> = [
    { actor: 'public', label: 'Welcome', path: '/' },
    { actor: 'public', label: 'Creators directory', path: '/creators' },
    { actor: 'public', label: 'Login', path: '/login' },
    { actor: 'public', label: 'Register', path: '/register' },
    { actor: 'public', label: 'Forgot password', path: '/forgot-password' },
    { actor: 'public', label: 'Terms', path: '/syarat-dan-ketentuan' },
    { actor: 'public', label: 'Privacy', path: '/kebijakan-privasi' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin dashboard', path: '/admin/dashboard' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin users', path: '/admin/users' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin verifications', path: '/admin/verifications' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin audit-logs', path: '/admin/audit-logs' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin reports', path: '/admin/reports' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin collaborations', path: '/admin/collaborations' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin moderation campaigns', path: '/admin/moderation/campaigns' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin moderation content', path: '/admin/moderation/content' },
    { actor: 'admin', loginAs: 'admin', label: 'Admin moderation reviews', path: '/admin/moderation/reviews' },
    { actor: 'umkm', loginAs: 'umkm', label: 'UMKM dashboard', path: '/umkm/dashboard' },
    { actor: 'umkm', loginAs: 'umkm', label: 'UMKM profile', path: '/umkm/profile' },
    { actor: 'umkm', loginAs: 'umkm', label: 'UMKM products', path: '/umkm/products' },
    { actor: 'umkm', loginAs: 'umkm', label: 'UMKM campaigns', path: '/umkm/campaigns' },
    { actor: 'umkm', loginAs: 'umkm', label: 'UMKM campaigns create', path: '/umkm/campaigns/create' },
    { actor: 'umkm', loginAs: 'umkm', label: 'UMKM discover', path: '/umkm/discover' },
    { actor: 'umkm', loginAs: 'umkm', label: 'UMKM reviews', path: '/umkm/reviews' },
    { actor: 'umkm', loginAs: 'umkm', label: 'UMKM collaborations', path: '/umkm/collaborations' },
    { actor: 'umkm', loginAs: 'umkm', label: 'Notifications', path: '/notifications' },
    { actor: 'umkm', loginAs: 'umkm', label: 'Settings profile', path: '/settings/profile' },
    { actor: 'umkm', loginAs: 'umkm', label: 'Settings security', path: '/settings/security' },
    { actor: 'umkm', loginAs: 'umkm', label: 'Settings appearance', path: '/settings/appearance' },
    { actor: 'creator', loginAs: 'creator', label: 'Creator dashboard', path: '/creator/dashboard' },
    { actor: 'creator', loginAs: 'creator', label: 'Creator profile', path: '/creator/profile' },
    { actor: 'creator', loginAs: 'creator', label: 'Creator portfolio', path: '/creator/portfolio' },
    { actor: 'creator', loginAs: 'creator', label: 'Creator skills', path: '/creator/skills' },
    { actor: 'creator', loginAs: 'creator', label: 'Creator verification', path: '/creator/verification' },
    { actor: 'creator', loginAs: 'creator', label: 'Creator campaigns', path: '/creator/campaigns' },
    { actor: 'creator', loginAs: 'creator', label: 'Creator collaborations', path: '/creator/collaborations' },
    { actor: 'creator', loginAs: 'creator', label: 'Creator requests', path: '/creator/requests' },
];

const seededEmail: Record<'admin' | 'umkm' | 'creator', string> = {
    admin: 'admin@collabite.test',
    umkm: 'umkm1@collabite.test',
    creator: 'creator1@collabite.test',
};

const MIN_TEXT = 50;

for (const t of pages) {
    test(`Audit ${t.actor}/${t.label}`, async ({ page }) => {
        if (t.loginAs) {
            clearLoginRateLimit(seededEmail[t.loginAs]);
            await loginSeededUser(page, seededEmail[t.loginAs]);
        }
        const url = baseURL + t.path;
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        const status = response ? response.status() : 0;
        await page.waitForTimeout(1500);
        const text = (await page.locator('body').innerText()).trim();
        const ok = status === 200 && text.length >= MIN_TEXT;
        if (!ok) {
            throw new Error(
                'Blank page: ' + t.actor + ' ' + t.path + ' (status=' + status + ', text length=' + text.length + ')',
            );
        }
    });
}
