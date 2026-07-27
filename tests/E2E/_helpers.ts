/**
 * Helper bersama untuk E2E spec — login/register harus menyertakan CSRF token
 * karena Laravel `web` middleware menolak POST tanpa token (HTTP 419).
 *
 * Playwright APIRequestContext otomatis menyimpan cookie laravel-session +
 * XSRF-TOKEN setelah GET /login, lalu kita teruskan token tersebut melalui
 * header `X-XSRF-TOKEN`.
 */
import type { APIRequestContext, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { execSync } from 'node:child_process';

const password = 'Password123!';
const seededPassword = 'password';

function phpBase64Json(data: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
}

async function ensureCsrf(request: APIRequestContext, baseURL: string): Promise<string> {
    await request.get('/login');
    const cookies = await request.storageState();
    const xsrf = cookies.cookies.find((c) => c.name === 'XSRF-TOKEN' && c.domain.includes(new URL(baseURL).hostname));

    if (!xsrf) {
        throw new Error('XSRF-TOKEN cookie not set after GET /login. Pastikan Herd menyajikan http://collabite.test.');
    }

    return decodeURIComponent(xsrf.value);
}

export async function registerUmkm(
    _request: APIRequestContext,
    _baseURL: string,
    email: string,
    name = 'UMKM E2E',
    extras: Record<string, string> = {},
): Promise<void> {
    const payload = phpBase64Json({
        name,
        email,
        password,
        password_confirmation: password,
        business_name: `${name} Biz`,
        business_type: 'Retail',
        ...extras,
    });

    execSync(
        `php artisan tinker --execute='\\Illuminate\\Support\\Facades\\Event::fake([\\Illuminate\\Auth\\Events\\Registered::class]); $data = json_decode(base64_decode("${payload}"), true); app(\\App\\Actions\\Auth\\RegisterUmkmAction::class)->execute($data);'`,
        { cwd: process.cwd(), encoding: 'utf-8' },
    );

    // Verify email using artisan
    execSync(`php artisan tinker --execute="App\\Models\\User::where('email', '${email}')->update(['email_verified_at' => now()]);"`);

    completeUmkmProfileForPublish(email);
}

/**
 * Fill required UMKM profile fields so PublishCampaignAction is allowed.
 */
export function completeUmkmProfileForPublish(email: string): void {
    const safeEmail = email.replace(/"/g, '\\"');

    execSync(
        `php artisan tinker --execute='$user = \\App\\Models\\User::where("email", "${safeEmail}")->first(); $user->umkmProfile->update(["city" => "Bandung", "description" => "Profil E2E lengkap", "contact_phone" => "081234567890", "contact_email" => "${safeEmail}"]);'`,
        { cwd: process.cwd(), encoding: 'utf-8' },
    );
}

export function latestCollaborationRequestId(campaignId: number): number {
    const id = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\CollaborationRequest::where("campaign_id", ${campaignId})->latest("id")->value("id");'`,
        { encoding: 'utf-8' },
    ).trim();

    const parsed = Number(id);

    if (!parsed) {
        throw new Error(`No collaboration request found for campaign ${campaignId}`);
    }

    return parsed;
}

/**
 * Accept a pending collaboration request via AcceptRequestAction (no HTTP/UI).
 */
export function acceptCollaborationRequestForCampaign(campaignId: number): number {
    const collabId = execSync(
        `php artisan tinker --execute='$req = \\App\\Models\\CollaborationRequest::where("campaign_id", ${campaignId})->where("status", \\App\\Enums\\CollaborationRequestStatus::Pending)->latest("id")->first(); if (!$req) { throw new \\RuntimeException("No pending request for campaign ${campaignId}"); } $collab = app(\\App\\Actions\\Collaboration\\AcceptRequestAction::class)->execute($req); echo (string) $collab->id;'`,
        { encoding: 'utf-8' },
    ).trim();

    const parsed = Number(collabId);

    if (!parsed) {
        throw new Error(`AcceptRequestAction did not create collaboration for campaign ${campaignId}`);
    }

    return parsed;
}

/**
 * Send a UMKM campaign invitation using the logged-in browser session.
 */
export async function sendCampaignInvitationViaPage(
    page: Page,
    baseURL: string,
    campaignId: number,
    creatorId: number,
    message: string,
): Promise<number> {
    await page.goto('/umkm/dashboard');
    const token = await csrfFromPage(page, baseURL);
    const res = await page.request.post(`/umkm/campaigns/${campaignId}/invitations`, {
        maxRedirects: 0,
        headers: {
            'X-XSRF-TOKEN': token,
            Accept: 'application/json',
        },
        form: {
            campaign_id: String(campaignId),
            creator_id: String(creatorId),
            message,
        },
    });

    return res.status();
}

export async function registerCreator(
    _request: APIRequestContext,
    _baseURL: string,
    email: string,
    name = 'Creator E2E',
    extras: Record<string, string | string[]> = {},
): Promise<void> {
    const skillId = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\Skill::query()->value("id");'`,
    )
        .toString()
        .trim();
    const categoryId = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\Category::query()->value("id");'`,
    )
        .toString()
        .trim();

    const payload = phpBase64Json({
        name,
        email,
        password,
        password_confirmation: password,
        skill_ids: skillId ? [skillId] : [],
        category_ids: categoryId ? [categoryId] : [],
        ...extras,
    });

    execSync(
        `php artisan tinker --execute='\\Illuminate\\Support\\Facades\\Event::fake([\\Illuminate\\Auth\\Events\\Registered::class]); $data = json_decode(base64_decode("${payload}"), true); app(\\App\\Actions\\Auth\\RegisterCreatorAction::class)->execute($data);'`,
        { cwd: process.cwd(), encoding: 'utf-8' },
    );

    const userExists = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\User::where("email", "${email.replace(/"/g, '\\"')}")->count();'`,
        { encoding: 'utf-8' },
    ).trim();

    expect(Number(userExists)).toBe(1);

    // Verify email using artisan
    execSync(`php artisan tinker --execute="App\\Models\\User::where('email', '${email}')->update(['email_verified_at' => now()]);"`);
}

export async function loginPage(
    page: Page,
    email: string,
    loginPassword: string = password,
): Promise<void> {
    // E2E sering ganti peran berkali-kali; bersihkan throttle login agar tidak kena 429.
    clearLoginRateLimit(email);

    await page.context().clearCookies();
    await page.goto('about:blank');
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(loginPassword);
    await Promise.all([
        page.waitForURL(/\/(admin|creator|umkm)\/dashboard/, { timeout: 30_000 }),
        page.getByRole('button', { name: 'Masuk' }).click(),
    ]);
}

/**
 * Hapus throttle login Fortify agar suite E2E panjang tidak kena HTTP 429.
 * `throttle:login` menghitung SEMUA percobaan login (sukses maupun gagal).
 */
export function clearLoginRateLimit(_email?: string): void {
    execSync('php artisan cache:clear', {
        cwd: process.cwd(),
        stdio: 'ignore',
    });
}

export async function loginSeededUser(page: Page, email: string): Promise<void> {
    await loginPage(page, email, seededPassword);
}

export async function logoutSession(page: Page): Promise<void> {
    await page.context().clearCookies();
}

export async function openCreatorCampaign(page: Page, campaignId: number): Promise<void> {
    await page.goto(`/creator/campaigns/${campaignId}`);
}

export async function openCollaboration(
    page: Page,
    role: 'umkm' | 'creator',
    collaborationId: number,
): Promise<void> {
    await page.goto(`/${role}/collaborations/${collaborationId}`);
}

/**
 * Fill and submit the UMKM campaign create form (includes required deliverable).
 */
export async function createUmkmCampaignViaPage(
    page: Page,
    title: string,
    description = 'Kampanye uji end-to-end.',
    publish = false,
): Promise<number> {
    await page.goto('/umkm/campaigns/create');
    await page.getByLabel('Judul', { exact: true }).fill(title);
    await page.getByLabel('Deskripsi', { exact: true }).fill(description);
    await page.getByLabel('Budget (Rp)').fill('500000');
    await page.getByLabel('Deadline').fill('2099-12-31');
    await page.getByLabel('Judul Deliverable').fill('Konten promosi');
    await page.locator('input[name="deliverables[0][quantity]"]').fill('1');
    const submit = page.getByRole('button', { name: 'Buat Campaign' });
    await submit.scrollIntoViewIfNeeded();
    await submit.click({ force: true });
    await expect(page).toHaveURL(/\/umkm\/campaigns\/\d+/);

    if (publish) {
        await page.getByRole('button', { name: 'Publikasikan' }).click();
        await expect(page.getByText(/dipublikasikan/i)).toBeVisible();
    }

    return Number(page.url().match(/campaigns\/(\d+)/)![1]);
}

/**
 * Re-fetch a fresh CSRF token using the current request context.
 * Use this AFTER `context.clearCookies()` (e.g. between role switches in a
 * scenario) so the new laravel-session has its own XSRF-TOKEN.
 */
export async function refreshCsrf(
    request: APIRequestContext,
    baseURL: string,
): Promise<string> {
    return ensureCsrf(request, baseURL);
}

/**
 * Read XSRF-TOKEN from the browser page context (shares session with loginPage).
 */
export async function csrfFromPage(page: Page, baseURL: string): Promise<string> {
    const cookies = await page.context().cookies();
    const host = new URL(baseURL).hostname;
    const xsrf = cookies.find((c) => c.name === 'XSRF-TOKEN' && c.domain.includes(host));

    if (!xsrf) {
        throw new Error('XSRF-TOKEN cookie not found on page context.');
    }

    return decodeURIComponent(xsrf.value);
}

/**
 * Authenticate an isolated APIRequestContext (does not share cookies with page).
 */
export async function loginRequest(
    request: APIRequestContext,
    baseURL: string,
    email: string,
    loginPassword: string = password,
): Promise<void> {
    const token = await ensureCsrf(request, baseURL);
    const res = await request.post('/login', {
        headers: {
            'X-XSRF-TOKEN': token,
            Accept: 'text/html,application/xhtml+xml',
        },
        form: { email, password: loginPassword },
        maxRedirects: 0,
    });

    expect([200, 302]).toContain(res.status());
}

export function userIdByEmail(email: string): number {
    const safeEmail = email.replace(/"/g, '\\"');
    const id = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\User::where("email", "${safeEmail}")->value("id");'`,
        { encoding: 'utf-8' },
    ).trim();

    const parsed = Number(id);

    if (!parsed) {
        throw new Error(`User not found for email ${email}`);
    }

    return parsed;
}

export function suspendUserByEmail(email: string): void {
    const safeEmail = email.replace(/"/g, '\\"');

    execSync(
        `php artisan tinker --execute='$user = \\App\\Models\\User::where("email", "${safeEmail}")->first(); $user->update(["account_status" => \\App\\Enums\\AccountStatus::Suspended]);'`,
        { encoding: 'utf-8' },
    );
}

export function latestCollaborationIdForCampaign(campaignId: number): number {
    const id = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\Collaboration::where("campaign_id", ${campaignId})->latest("id")->value("id");'`,
        { encoding: 'utf-8' },
    ).trim();

    const parsed = Number(id);

    if (!parsed) {
        throw new Error(`No collaboration found for campaign ${campaignId}`);
    }

    return parsed;
}

export function latestSubmissionIdForCollaboration(collaborationId: number): number {
    const id = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\ContentSubmission::where("collaboration_id", ${collaborationId})->latest("id")->value("id");'`,
        { encoding: 'utf-8' },
    ).trim();

    const parsed = Number(id);

    if (!parsed) {
        throw new Error(`No submission found for collaboration ${collaborationId}`);
    }

    return parsed;
}

export function latestVerificationIdForCreator(email: string): number {
    const safeEmail = email.replace(/"/g, '\\"');
    const id = execSync(
        `php artisan tinker --execute='$userId = \\App\\Models\\User::where("email", "${safeEmail}")->value("id"); echo (string) \\App\\Models\\CreatorVerification::whereHas("creatorProfile", fn ($q) => $q->where("user_id", $userId))->latest("id")->value("id");'`,
        { encoding: 'utf-8' },
    ).trim();

    const parsed = Number(id);

    if (!parsed) {
        throw new Error(`No verification found for creator ${email}`);
    }

    return parsed;
}

/**
 * Set headline/bio/city and at least one portfolio item for SubmitVerification.
 */
export function prepareCreatorProfileForVerification(email: string): void {
    const safeEmail = email.replace(/"/g, '\\"');

    execSync(
        `php artisan tinker --execute='$user = \\App\\Models\\User::where("email", "${safeEmail}")->first(); $profile = $user->creatorProfile; $profile->update(["headline" => "Videographer & Editor", "bio" => "Saya membuat konten video pendek yang menarik.", "city" => "Surabaya"]); if ($profile->portfolioItems()->count() === 0) { \\App\\Models\\PortfolioItem::create(["creator_profile_id" => $profile->id, "title" => "Proyek Demo E2E", "description" => "Salah satu karya terbaru saya.", "external_url" => "https://example.com/portfolio-1", "display_order" => 0]); }'`,
        { encoding: 'utf-8' },
    );
}

export { password as E2E_PASSWORD, seededPassword as E2E_SEEDED_PASSWORD };

export const tinyPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
]);

export function inviteCreatorToCampaign(campaignId: number, creatorUserId: number, message: string): void {
    const safeMessage = message.replace(/"/g, '\\"');

    execSync(
        `php artisan tinker --execute='$profile = \\App\\Models\\Campaign::find(${campaignId})->umkmProfile; app(\\App\\Actions\\Collaboration\\InviteCreatorAction::class)->execute($profile, ["campaign_id" => ${campaignId}, "creator_id" => ${creatorUserId}, "message" => "${safeMessage}"]);'`,
        { encoding: 'utf-8' },
    );
}

export async function uploadCreatorSubmissionDraft(
    page: Page,
    title: string,
    description = 'Draft E2E.',
): Promise<void> {
    await page.locator('input[name="files[]"]').setInputFiles({
        name: 'tiny.png',
        mimeType: 'image/png',
        buffer: tinyPngBuffer,
    });
    await page.getByLabel('Judul', { exact: true }).fill(title);
    await page.getByLabel('Deskripsi', { exact: true }).fill(description);
    await page.getByRole('button', { name: 'Upload Submission' }).click();
    await expect(page.getByText(/Submission v\d+ berhasil dibuat/i)).toBeVisible();
    await page.getByRole('tab', { name: /Konten/ }).click();
}

/** Assert halaman Inertia tidak blank / error kosong. */
export async function expectPageAlive(page: Page, minChars = 40): Promise<void> {
    await expect(page.locator('body')).toBeVisible();
    const text = (await page.locator('body').innerText()).trim();
    expect(text.length).toBeGreaterThanOrEqual(minChars);
}

/** Goto path dan pastikan status < 400 + konten hidup. */
export async function visitOk(page: Page, path: string): Promise<void> {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 0).toBeLessThan(400);
    await expectPageAlive(page);
}

/** ID CreatorProfile pertama dari seed (untuk halaman publik). */
export function seededPublicCreatorProfileId(): number {
    const id = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\CreatorProfile::query()->value("id");'`,
        { encoding: 'utf-8' },
    ).trim();
    const parsed = Number(id);
    if (!parsed) {
        throw new Error('No CreatorProfile in database for public smoke.');
    }
    return parsed;
}

/** ID UmkmProfile pertama dari seed (untuk halaman publik). */
export function seededPublicUmkmProfileId(): number {
    const id = execSync(
        `php artisan tinker --execute='echo (string) \\App\\Models\\UmkmProfile::query()->value("id");'`,
        { encoding: 'utf-8' },
    ).trim();
    const parsed = Number(id);
    if (!parsed) {
        throw new Error('No UmkmProfile in database for public smoke.');
    }
    return parsed;
}

