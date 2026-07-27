# Design: E2E Portal Smoke + Supporting Actions (Opsi B)

**Tanggal:** 2026-07-27  
**Status:** Approved & implemented (2026-07-27)  
**Keputusan:** Pendekatan 1 — suite baru terpisah dari demo bisnis; audit blank-page tetap ada.  
**Kedalaman:** Opsi **B** — smoke semua halaman penting + 1–2 aksi ringan per area pendukung.

---

## 1. Masalah

Demo `npm run test:e2e:demo` dan E2E `01`–`07` fokus **alur bisnis** (matchmaking → workspace → review).  
Fitur di luar siklus itu (landing, legal, settings, notifikasi, profil/produk/portfolio/skills, nav shell) belum punya jaring pengaman E2E yang lengkap.

Sudah ada `tests/E2E/runtime/full_browser_audit.spec.ts`, tetapi:

- Hanya cek status 200 + panjang teks (blank-page).
- Belum mencakup: legal, settings, notifications, creator requests, public show pages, appearance, dll.
- Tidak menguji aksi ringan (simpan profil, filter, dll.).

---

## 2. Tujuan

Pastikan **di luar deal kolaborasi penuh**:

1. **Landing & public** bisa dibuka dan menampilkan konten inti.
2. **Shell tiap role** (UMKM / Creator / Admin) setelah login: nav utama bisa dikunjungi tanpa 500/blank.
3. **Fitur pendukung** punya minimal satu aksi ringan yang berhasil (simpan / filter / buka detail).

Bukan pengganti demo bisnis atau TC-E2E happy-path kolaborasi.

---

## 3. Non-goals

- Siklus kolaborasi penuh (pesan → konten → revisi → bayar → review dua arah).
- Payment gateway, AI, WebSocket, native app (PRD non-goals).
- Mengganti password / 2FA / passkey secara mutatif di CI (halaman security hanya **smoke buka**).
- Screenshot/DOCX panduan (sudah ada jalur `DEMO_CAPTURE_SCENES`).

---

## 4. Pendekatan yang dipilih

**Suite baru:** `tests/E2E/08-portal-smoke-supporting.spec.ts`  
(opsional split kemudian: `08a-public`, `08b-umkm`, … jika file > ~400 baris).

**Tetap pertahankan** `runtime/full_browser_audit.spec.ts` sebagai audit blank-page; **perluas daftar path**-nya agar selaras dengan inventory di §5 (tanpa aksi mutatif).

**Alasan:** memisahkan “halaman tidak blank” vs “aksi pendukung jalan” memudahkan triage CI.

---

## 5. Inventory halaman (smoke wajib)

### 5.1 Public / guest

| Path | Cek minimum |
|------|-------------|
| `/` | Brand/CTA terlihat |
| `/creators` | Directory list/heading |
| `/creators/{id}` | Profil publik (pakai seed creator) |
| `/umkm/{id}` | Profil publik UMKM (pakai seed) |
| `/syarat-dan-ketentuan` | Konten legal |
| `/kebijakan-privasi` | Konten legal |
| `/login` | Form email + password |
| `/register` | Form / pilihan role |
| `/forgot-password` | Form email; submit → respons generik (anti-enumerasi) |

### 5.2 UMKM (login `umkm1@collabite.test`)

| Path | Smoke | Aksi ringan |
|------|-------|-------------|
| `/umkm/dashboard` | ✓ | — |
| `/umkm/campaigns` | ✓ | — |
| `/umkm/campaigns/create` | ✓ form terbuka | — (create penuh sudah di E2E bisnis) |
| `/umkm/discover` | ✓ | Filter kata kunci + “Terapkan filter” |
| `/umkm/collaborations` | ✓ | — |
| `/umkm/profile` | ✓ | Ubah satu field (mis. deskripsi singkat) + simpan → flash/nilai tersimpan |
| `/umkm/products` | ✓ | Buka form tambah / buat produk minimal jika UI mengizinkan |
| `/umkm/reviews` | ✓ | — |

Nav shell: minimal klik beberapa item sidebar yang mengarah ke path di atas (URL berubah, tidak 500).

### 5.3 Creator (login `creator1@collabite.test`)

| Path | Smoke | Aksi ringan |
|------|-------|-------------|
| `/creator/dashboard` | ✓ | — |
| `/creator/campaigns` | ✓ | — |
| `/creator/collaborations` | ✓ | — |
| `/creator/requests` | ✓ | — |
| `/creator/profile` | ✓ | Ubah headline/bio singkat + simpan |
| `/creator/portfolio` | ✓ | Halaman terbuka; tambah item jika form sederhana tanpa file wajib besar |
| `/creator/skills` | ✓ | Toggle/simpan minimal 1 skill |
| `/creator/verification` | ✓ status page | — (submit dokumen penuh sudah di E2E 03/demo) |

### 5.4 Admin (login `admin@collabite.test`)

| Path | Smoke | Aksi ringan |
|------|-------|-------------|
| `/admin/dashboard` | ✓ | — |
| `/admin/users` | ✓ | Buka 1 baris detail jika ada link |
| `/admin/verifications` | ✓ | Buka 1 detail jika ada |
| `/admin/moderation/campaigns` | ✓ | — |
| `/admin/moderation/content` | ✓ | — |
| `/admin/moderation/reviews` | ✓ | — |
| `/admin/collaborations` | ✓ | — |
| `/admin/audit-logs` | ✓ | — |
| `/admin/reports` | ✓ | Pastikan kontrol ekspor/filter terlihat (jangan wajib download file di CI jika flaky) |

### 5.5 Shared (setelah login salah satu role)

| Path | Smoke | Aksi ringan |
|------|-------|-------------|
| `/notifications` | ✓ list | Jika ada item: buka 1; jika kosong: empty state OK |
| `/settings/profile` | ✓ | Ubah nama tampilan user + simpan |
| `/settings/security` | ✓ halaman terbuka | **Tidak** submit ganti password di suite ini |
| `/settings/appearance` (jika dirute) | ✓ | — |

### 5.6 Guard ringkas

- Guest → `/umkm/dashboard` redirect ke login.
- Creator session → `/admin/dashboard` ditolak/redirect (bukan 200 admin).

(Isolasi detail sudah di `04-authorization-isolation.spec.ts`; di sini cukup 2 smoke guard.)

---

## 6. Assertion standar

Untuk setiap navigasi smoke:

1. Response status `< 400` (prefer 200; redirect auth OK untuk guard).
2. `body` punya teks bermakna (threshold mirip audit, atau heading `getByRole('heading')` terlihat).
3. Tidak mengandalkan screenshot visual.

Untuk aksi ringan:

1. Submit berhasil (redirect/back atau flash/toast/status text).
2. Bukti efek: field tersimpan terlihat setelah reload **atau** pesan sukses eksplisit UI.

---

## 7. Data & setup

- Pakai **seed** yang sama dengan E2E lain (`AdminUserSeeder` / `DemoDataSeeder` / platform seed lewat `globalSetup` migrate:fresh --seed).
- Akun: `admin@collabite.test`, `umkm1@collabite.test`, `creator1@collabite.test`, password `password` (konvensi existing).
- `clearLoginRateLimit` sebelum login berulang.
- Jangan depend pada state hasil demo full-flow.

---

## 8. Organisasi test Playwright

```
tests/E2E/08-portal-smoke-supporting.spec.ts
  describe.serial Public landing & legal
  describe.serial UMKM shell + supporting
  describe.serial Creator shell + supporting
  describe.serial Admin shell + supporting
  describe.serial Shared settings & notifications
  describe.serial Auth guards smoke
```

Helpers: reuse `loginSeededUser`, `clearLoginRateLimit` dari `_helpers.ts`.  
Tambah helper kecil jika perlu: `expectPageAlive(page)`, `visitOk(page, path)`.

---

## 9. Integrasi npm / CI

- Tetap masuk `npm run test:e2e` (playwright.config default `tests/E2E` — pastikan tidak ter-exclude).
- **Tidak** masuk `playwright.demo.config.ts` (demo tetap terpisah).
- Dokumentasikan di komentar file + satu baris di `docs/TEST_PLAN.md` § E2E (TC-E2E-004) jika diizinkan update docs saat implementasi.

Script opsional (boleh ditunda):

```json
"test:e2e:smoke": "playwright test tests/E2E/08-portal-smoke-supporting.spec.ts tests/E2E/runtime/full_browser_audit.spec.ts"
```

---

## 10. Expand audit list (ikut implementasi)

Update `full_browser_audit.spec.ts` path list agar mencakup gap:  
`/creator/requests`, `/notifications`, `/settings/profile`, `/settings/security`, legal pages, public show (dengan ID dari seed/DB query di helper jika perlu).

Audit tetap **tanpa** aksi mutatif.

---

## 11. Definition of Done

1. Spec `08-…` hijau lokal: `npx playwright test tests/E2E/08-portal-smoke-supporting.spec.ts`.
2. Audit updated path list hijau.
3. Tidak merusak `01`–`07` / demo (jalankan smoke + satu file login sanity jika perlu).
4. Tidak menambah dependency.
5. Pint tidak wajib untuk TS-only; ikut konvensi Prettier/ESLint proyek jika menyentuh file yang di-lint.

---

## 12. Estimasi runtime

Target **3–6 menit** workers=default proyek.  
Jika flaky: turunkan aksi mutatif (products/portfolio) jadi smoke-only dan catat di defect/TODO test.

---

## 13. Traceability

| Item | Referensi |
|------|-----------|
| Melengkapi di luar TC-E2E-001..003 | `docs/TEST_PLAN.md` §11.14 |
| Portal independen | `AGENTS.md` §5, COMPONENT_DIAGRAM |
| Non-goals | `docs/PRD.md` §8 |
| Related existing | `00-login`, `04-authorization`, `runtime/full_browser_audit` |

Usulan ID baru: **TC-E2E-004** — Portal smoke + supporting actions (Opsi B).

---

## 14. Open questions (default jika tidak dijawab)

| # | Pertanyaan | Default |
|---|------------|---------|
| OQ-1 | Wajibkah download CSV reports di CI? | **Tidak** — cukup kontrol terlihat |
| OQ-2 | Buat produk wajib upload gambar? | Ikuti Form Request; jika wajib file, pakai buffer PNG kecil seperti demo |
| OQ-3 | Appearance settings ada di route? | Smoke hanya jika route GET terdaftar |

---

## 15. Persetujuan

- [ ] Desain disetujui (chat: “ya” 2026-07-27)
- [x] Spec file ini di-review user
- [x] Siap ke implementation plan (`writing-plans`)
- [x] Implemented: `tests/E2E/08-portal-smoke-supporting.spec.ts` + audit expand + `npm run test:e2e:smoke`
