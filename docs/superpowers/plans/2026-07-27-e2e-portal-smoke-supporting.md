# E2E Portal Smoke + Supporting Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Playwright suite that smokes landing/public + each role shell and runs light supporting actions outside the full business collaboration demo.

**Architecture:** New serial spec `tests/E2E/08-portal-smoke-supporting.spec.ts` using seeded users and shared helpers; expand `full_browser_audit.spec.ts` path inventory for blank-page coverage only. No new npm dependencies.

**Tech Stack:** Playwright (`@playwright/test`), Laravel Herd `http://collabite.test`, existing `tests/E2E/_helpers.ts`, seed accounts from `migrate:fresh --seed` globalSetup.

## Global Constraints

- Depth = Opsi B only (smoke + 1–2 light actions per area); no full collab cycle.
- Do not mutate password/2FA in settings/security.
- Do not require CSV download in CI for admin reports.
- Reuse `loginSeededUser` / `clearLoginRateLimit`; accounts: `admin@collabite.test`, `umkm1@collabite.test`, `creator1@collabite.test`.
- Spec source: `docs/superpowers/specs/2026-07-27-e2e-portal-smoke-supporting-design.md`.

---

### Task 1: Smoke helpers + seeded public IDs

**Files:**
- Modify: `tests/E2E/_helpers.ts`
- Create: `tests/E2E/08-portal-smoke-supporting.spec.ts` (scaffold + public describe only)

**Interfaces:**
- Produces: `expectPageAlive(page)`, `visitOk(page, path)`, `seededPublicCreatorProfileId()`, `seededPublicUmkmProfileId()` (via `php artisan tinker --execute` or existing DB helper pattern in `_helpers.ts`)

- [ ] **Step 1:** Add helpers near other E2E utilities:

```ts
export async function visitOk(page: Page, path: string): Promise<void> {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(res?.status() ?? 0).toBeLessThan(400);
    await expectPageAlive(page);
}

export async function expectPageAlive(page: Page, minChars = 40): Promise<void> {
    await expect(page.locator('body')).toBeVisible();
    const text = (await page.locator('body').innerText()).trim();
    expect(text.length).toBeGreaterThanOrEqual(minChars);
}
```

- [ ] **Step 2:** Resolve one public creator profile id and one UMKM profile id from seed (query via tinker/execSync like other helpers).

- [ ] **Step 3:** Write `describe.serial('E2E-08 Public…')` covering `/`, `/creators`, show pages, legal, login, register, forgot-password generic submit.

- [ ] **Step 4:** Run  
  `npx playwright test tests/E2E/08-portal-smoke-supporting.spec.ts --grep Public`  
  Expected: PASS (or fix selectors to match Indonesian UI copy).

---

### Task 2: UMKM + Creator + Admin shell smoke + light actions

**Files:**
- Modify: `tests/E2E/08-portal-smoke-supporting.spec.ts`

**Interfaces:**
- Consumes: `visitOk`, `loginSeededUser`, `clearLoginRateLimit`, `tinyPngBuffer` / `pngFile` if product needs image

- [ ] **Step 1:** UMKM describe — visit all §5.2 paths; Discover filter; profile save one field; products create minimal if form allows.

- [ ] **Step 2:** Creator describe — visit §5.3 paths including `/creator/requests`; profile headline save; skills save if UI simple.

- [ ] **Step 3:** Admin describe — visit §5.4 paths; open one user/verification detail if link exists; reports page controls visible (no forced download).

- [ ] **Step 4:** Shared — `/notifications`, `/settings/profile` (save display name), `/settings/security` smoke only.

- [ ] **Step 5:** Guards — guest `/umkm/dashboard` → login; creator cannot get admin dashboard 200.

- [ ] **Step 6:** Run full file:  
  `npx playwright test tests/E2E/08-portal-smoke-supporting.spec.ts`  
  Expected: all PASS.

---

### Task 3: Expand blank-page audit + docs touch

**Files:**
- Modify: `tests/E2E/runtime/full_browser_audit.spec.ts`
- Modify: `docs/TEST_PLAN.md` (add TC-E2E-004 short row under §11.14)
- Modify: `package.json` (optional script `test:e2e:smoke`)
- Modify: `docs/superpowers/specs/2026-07-27-e2e-portal-smoke-supporting-design.md` status → Approved / Implemented

- [ ] **Step 1:** Add missing paths to audit list: requests, notifications, settings, legal, public shows (skip dynamic ID rows if awkward — document that 08 covers them).

- [ ] **Step 2:** Add npm script:  
  `"test:e2e:smoke": "playwright test tests/E2E/08-portal-smoke-supporting.spec.ts tests/E2E/runtime/full_browser_audit.spec.ts"`

- [ ] **Step 3:** Run `npm run test:e2e:smoke` Expected: PASS.

- [ ] **Step 4:** Commit only if user asks (do not commit unsolicited).

---

## Spec coverage check

| Spec section | Task |
|--------------|------|
| §5.1 Public | Task 1 |
| §5.2–5.4 portals | Task 2 |
| §5.5 Shared | Task 2 |
| §5.6 Guards | Task 2 |
| §10 Expand audit | Task 3 |
| §9 npm script | Task 3 |
| TC-E2E-004 docs | Task 3 |
