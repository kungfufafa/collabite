# Test Results — Collabite

> **Versi:** 1.4
> Tanggal: 2026-06-18 (post DEF-AUTH-001 fix)

## 2026-06-18 — Login flow blocker resolved (RC.2 evidence)

| Jam | Perintah | Hasil | Catatan |
| --- | --- | --- | --- |
| 2026-06-18 16:24 | `php artisan optimize:clear && php artisan wayfinder:generate --with-form` | OK | Cache bersih + binding Wayfinder untuk `POST /login.store` diregenerasi. |
| 2026-06-18 16:24 | `vendor/bin/pint --dirty --format agent` | OK | clean (EnvTest formatting) |
| 2026-06-18 16:24 | `vendor/bin/phpstan analyse` | OK | 0 errors (level 6) |
| 2026-06-18 16:24 | `php artisan test --compact` | 174/174 passed, 590 assertions | 8 kasus baru di `tests/Feature/Auth/AuthenticationTest.php`. |
| 2026-06-18 16:24 | `npm run lint` | clean | ESLint v9 + Prettier v3. |
| 2026-06-18 16:24 | `npm run types:check` | clean | tsc --noEmit |
| 2026-06-18 16:24 | `npm run test` | 59 passed (24 file) | Tambahan `tests/Frontend/Auth/Login.test.tsx` (5 kasus). |
| 2026-06-18 16:24 | `npm run build` | OK | Vite 5.45s |
| 2026-06-18 16:24 | `npx playwright test tests/E2E/00-login-flow.spec.ts` | 6/6 passed | Real browser (Chromium 149) against `http://collabite.test`. |

Ringkasan suite: 174 Pest (590 assertions), 59 Vitest (24 file), 6 Playwright (real Chromium). Backend + frontend + browser-gate hijau bersamaan.

---

## 2026-06-18 — Final Release Gate

- **Pest (Backend):** 139/139 passed, 452 assertions
- **Pint (Format):** Bersih
- **Larastan (Static Analysis):** 0 error (level 5)
- **Vite (Build):** Berhasil (built in 6.62s)
- **Catatan:** Backend test adalah acuan otoritatif. Vitest dan Playwright belum dijalankan di MVP pass.

---

## 2026-06-18 09:28–09:30 — RC pass (automated)

| Tanggal / Jam | Perintah | Suite | Hasil | Test | Fail | Skip | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-18 09:28 | `php artisan test` | Full Pest suite | Passed | 166 | 0 | 0 | All M4–M7 backfill green. |
| 2026-06-18 09:30 | `npm test` | Vitest component | Passed | 39 | 0 | 0 | 18 files (Button/Input/Badge/Textarea/Checkbox/Select/Dialog/DropdownMenu/PasswordInput/TextLink/Separator/Spinner/Avatar/Skeleton/Sonner/Tooltip/Label/InputError). |
| 2026-06-18 09:30 | `npm run lint:check` | ESLint | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 09:30 | `npm run types:check` | TypeScript | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 09:30 | `npm run build` | Vite production | Passed | n/a | n/a | n/a | built in ~6.8s |
| 2026-06-18 09:29 | `vendor/bin/pint --dirty` | Pint | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 09:29 | `vendor/bin/phpstan analyse` | Larastan level 6 | Passed | n/a | 0 | n/a | clean |

---

## 2026-06-18 — RC.1 verification gate (honest numbers)

| Tanggal / Jam | Perintah | Suite | Hasil | Test | Fail | Skip | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-18 | `php artisan test` | Pest SQLite (default) | Passed | 166 | 0 | 0 | Backend gate default. |
| 2026-06-18 | `php artisan test --configuration=phpunit.mysql.xml` | MySQL 9.6 `collabite_test` | Passed | 166 | 0 | 0 | Authoritative DB gate per ADR-029. |
| 2026-06-18 | `npm test` | Vitest (18 files) | Passed | 39 | 0 | 0 | Frontend unit gate. |
| 2026-06-18 | `npm run lint:check` | ESLint | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 | `npm run types:check` | TypeScript | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 | `npm run build` | Vite production | Passed | n/a | n/a | n/a | built in ~6.8s |
| 2026-06-18 | `vendor/bin/pint --dirty` | Pint | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 | `vendor/bin/phpstan analyse` | Larastan level 6 | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 | `npx playwright test` (terhadap `http://collabite.test`) | Playwright E2E | **In-progress** | 2 passed | 14 failed | 1 skipped | Kegagalan bersumber dari bug helper CSRF di `tests/E2E/_helpers.ts`, bukan perilaku produk. Spec fix berjalan paralel; baris ini akan diperbarui setelah fix mendarat. Tidak diklaim hijau. |

**MySQL gate row (dipisah agar tidak keliru dengan default SQLite):**

| Tanggal | Perintah | DB target | Hasil | Test | Fail | Skip | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-18 | `php artisan test --configuration=phpunit.mysql.xml` | MySQL 9.6 `collabite_test` | Passed | 166 | 0 | 0 | Authoritative DB gate per ADR-029 |

---

## Ringkasan per Area

| Area | Jumlah Test | Status |
| --- | --- | --- |
| Auth (registrasi, login, suspend, verifikasi) | 12 | ✅ |
| Profile UMKM (produk, profil) | 8 | ✅ |
| Profile Creator (portfolio, skills) | 4 | ✅ |
| Verification (admin review) | 3 | ✅ |
| Campaign (CRUD, publish, cancel) | 11 | ✅ |
| Discovery (search & filter) | 4 | ✅ |
| Collaboration (apply, invite, accept, reject, force close) | 25 | ✅ |
| Content (submission, revisi, approval) | 14 | ✅ |
| Review (store, duplicate) | 4 | ✅ |
| Authorization (policy, IDOR) | 4 | ✅ |
| Dashboard (role dispatch) | 4 | ✅ |
| Admin (collaborations, users, audit, moderation) | 23 | ✅ |
| Welcome (homepage) | 1 | ✅ |
| Files (signed URL) | 1 | ✅ |
| Notifications (collaboration force-closed) | 1 | ✅ |
| **Total** | **139** | **✅ 100%** |

## 2026-06-18 — Refactor layout shell per peran

| Tanggal / Jam | Perintah | Suite | Hasil | Test | Fail | Skip | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-18 11:50 | `npm test` | Vitest full | Passed | 54 | 0 | 0 | 23 file (termasuk 5 file layout baru + `navigation.test.ts`). |
| 2026-06-18 11:50 | `npm run lint:check` | ESLint | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 11:50 | `npm run types:check` | TypeScript | Passed | n/a | 0 | n/a | clean |
| 2026-06-18 11:50 | `npm run build` | Vite production | Passed | n/a | n/a | n/a | built in ~5.3s |

> **Catatan:** Tidak ada perubahan pada test backend (Pest) atau kode PHP. Frontend test bertambah dari 39 ke 54 untuk mengunci perilaku layout (sidebar Admin tidak muncul di UMKM/Creator; navigasi role-specific; mobile menu; primary action UMKM; workspace kolaborasi tidak menggunakan shell Admin).
