# Implementation Roadmap — Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai acuan implementasi M0–M7.

Roadmap ini membagi implementasi MVP ke dalam 8 milestone kecil, masing-masing dengan deliverables, acceptance criteria, small-PR breakdown, dan Definition of Done. Setiap milestone harus self-contained dan diuji sebelum pindah ke milestone berikutnya.

---

## Ringkasan Milestone

| # | Milestone | Fokus |
| --- | --- | --- |
| M0 | Foundation | Repo, konfigurasi, scaffolding, observability dasar |
| M1 | Authentication & Role | Registrasi, login, role, akun status |
| M2 | Profile, Portfolio, Verification | Profil UMKM, profil Creator, portofolio, verifikasi |
| M3 | Campaign & Discovery | Campaign CRUD, pencarian Creator & campaign |
| M4 | Collaboration Request & Collaboration | Application, invitation, pembentukan kolaborasi |
| M5 | Messaging, Progress, Content Workflow | Pesan, progress update, submission, revisi, approval |
| M6 | Completion, Review, Moderation | Penyelesaian, review, moderasi admin, notifikasi email |
| M7 | Reporting, Hardening, UAT | Audit log, statistik, ekspor, hardening, UAT |

---

## Milestone 0 — Foundation

### Tujuan
Mempersiapkan fondasi teknis: struktur folder, konfigurasi, dependency utama, dan tooling agar pengembangan fitur dapat dimulai tanpa friksi.

### Scope
- Struktur folder Laravel (Controllers/Requests/Policies/Models/Actions/Services/Notifications).
- Konfigurasi Tailwind + shadcn/ui + Inertia v3.
- Konfigurasi Pest, Vitest, Playwright.
- Konfigurasi Pint & Larastan.
- Setup database MySQL lokal + file storage disk `public` & `private`.
- Setup mail (log driver) & queue (database).
- Seeder untuk kategori, skill, dan admin user.

### Out of Scope
- Implementasi fitur bisnis apa pun.

### Dependency
- Dokumentasi `docs/` (PRD, USE_CASE, TDD, COMPONENT_DIAGRAM, TEST_PLAN, DECISIONS) disetujui.
- `AGENTS.md` dibuat.

### Deliverables
1. Skeleton folder sesuai [TDD §6](./TDD.md).
2. `composer.json` & `package.json` memuat semua dependensi yang disetujui.
3. `phpstan.neon` level 6.
4. `.editorconfig`, `pint.json`, `eslint.config.js`, `.prettierrc` aktif di editor.
5. Seeder: `CategorySeeder`, `SkillSeeder`, `AdminUserSeeder`.
6. Disk konfigurasi `public` & `private` di `config/filesystems.php`.
7. Skrip CI minimal: `composer install`, `npm ci`, `npm run build`, `php artisan test --compact`, `vendor/bin/pint --test`, `vendor/bin/phpstan analyse`.

### Acceptance Criteria
- `php artisan test --compact` lulus (hanya test bawaan Laravel).
- `npm run build` sukses.
- `vendor/bin/pint --test` bersih.
- `vendor/bin/phpstan analyse` tanpa error.
- Login sebagai admin yang di-seed berhasil.

### Test Requirement
- Smoke test artisan & build pipeline.

### Risiko
- Ketergantungan awal salah versi (mitigasi: kunci versi di `composer.json`/`package.json`).

### Small-PR Breakdown
- PR-M0-1: Setup struktur folder & config filesystems.
- PR-M0-2: Install Tailwind v4 + shadcn/ui + Wayfinder.
- PR-M0-3: Konfigurasi Pest, Vitest, Playwright (scaffolding).
- PR-M0-4: Seeder admin/kategori/skill.
- PR-M0-5: CI workflow GitHub Actions.

### Definition of Done
- Folder siap pakai.
- Pipeline CI hijau.
- Dokumentasi singkat di `README.md` tentang cara menjalankan.

---

## Milestone 1 — Authentication & Role

### Tujuan
Mengimplementasikan pendaftaran, login, logout, verifikasi email, reset password, dan pengelolaan status akun oleh Admin.

### Scope
- Migration tabel `users` (extend dengan `role`, `account_status`).
- Model `User` + Enum `UserRole`, `AccountStatus`.
- Form Request untuk registrasi UMKM/Creator, login, reset password.
- Controller `Auth/*` (register, login, logout, verify, forgot/reset).
- Policies `UserPolicy`.
- Halaman Inertia: register, login, forgot/reset password, verify notice.
- Middleware `role:{umkm|creator|admin}`.
- Rate limit login & reset.
- Audit log untuk login/logout.
- Akun suspended tidak bisa login (UC-AUTH-003, UC-AUTH-004, UC-AUTH-005).

### Out of Scope
- Profil bisnis UMKM/Creator (M2).
- Halaman dashboard spesifik peran (M2+).

### Dependency
- M0 selesai.

### Deliverables
1. Migration baru untuk kolom `role` & `account_status`.
2. Routes `routes/auth.php` (atau bagian dari `web.php`).
3. Email notifikasi verifikasi & reset.
4. Policy `UserPolicy`.
5. UI: halaman `Register`, `Login`, `ForgotPassword`, `ResetPassword`, `VerifyEmail`.
6. Middleware `RoleMiddleware`.
7. Test: TC-AUTH-001 s/d TC-AUTH-010.

### Acceptance Criteria
- Seluruh TC-AUTH-001..010 lulus.
- Akun suspended tidak dapat login.
- Email verifikasi & reset terkirim via queue.
- Rate limit aktif.

### Test Requirement
- Feature test per use case Auth.
- Authorization test pada suspend.

### Risiko
- Konflik dengan Fortify default (mitigasi: review scaffold Fortify; sesuaikan tanpa menghapus flow inti).

### Small-PR Breakdown
- PR-M1-1: Migration `users` + Enum.
- PR-M1-2: Register UMKM/Creator + Form Request.
- PR-M1-3: Login + Logout + Rate limit.
- PR-M1-4: Verifikasi email.
- PR-M1-5: Reset password.
- PR-M1-6: Middleware `role:*` + suspend oleh admin.
- PR-M1-7: UI Halaman Auth (Inertia + shadcn).

### Definition of Done
- Lint, statis analisis, dan test lulus.
- Tidak ada perubahan di luar scope M1.

---

## Milestone 2 — Profile, Portfolio, Verification

### Tujuan
Memungkinkan UMKM dan Creator melengkapi profil, serta admin memverifikasi Creator.

### Scope
- Migration & model `UmkmProfile`, `Product`, `CreatorProfile`, `Category`, `Skill`, `creator_categories`, `creator_skills`, `PortfolioItem`, `CreatorVerification`, `CreatorVerificationDocument`.
- Enum `VerificationStatus`.
- Form Request, Controller, Policy untuk tiap resource.
- File upload logo, foto produk, foto portofolio, dokumen verifikasi.
- Halaman Inertia: profil UMKM, daftar produk, profil Creator, keahlian, kategori, portofolio, pengajuan verifikasi, antrian verifikasi admin.
- Halaman publik UMKM & Creator.
- Notifikasi hasil verifikasi ke Creator.
- Audit log pengajuan & keputusan verifikasi.

### Out of Scope
- Campaign, kolaborasi, dan alur M3+.

### Dependency
- M1 selesai (auth, role, middleware).

### Deliverables
1. Migration seluruh tabel M2.
2. Factory + state.
3. Service `FileUrlService` untuk signed URL private.
4. Halaman Inertia UMKM & Creator.
5. Test: TC-PROF-001..007, TC-VERIF-001..004.

### Acceptance Criteria
- UMKM dapat menyimpan profil & produk.
- Creator dapat menyimpan profil, keahlian, kategori, portofolio.
- Creator dapat mengajukan verifikasi.
- Admin dapat approve/reject dengan alasan.
- File pribadi hanya dapat diakses lewat signed URL.
- TC-PROF & TC-VERIF lulus.

### Test Requirement
- Feature, authorization, security (signed URL).

### Risiko
- Upload ukuran besar (mitigasi: validasi di Form Request & policy).

### Small-PR Breakdown
- PR-M2-1: Migration + Model Profile UMKM/Creator.
- PR-M2-2: Controller + Form Request + UI Profil UMKM.
- PR-M2-3: Controller + UI Produk UMKM.
- PR-M2-4: Controller + UI Profil Creator.
- PR-M2-5: Kategori & Keahlian (CRUD read-only untuk Creator).
- PR-M2-6: Portofolio + upload.
- PR-M2-7: Pengajuan Verifikasi.
- PR-M2-8: Antrian Admin Verifikasi.
- PR-M2-9: Halaman publik profil.

### Definition of Done
- Profil publik dapat dilihat tanpa login.
- Notifikasi verifikasi terkirim.

---

## Milestone 3 — Campaign & Creator Discovery

### Tujuan
Memungkinkan UMKM membuat & mempublikasikan campaign, dan Creator menemukan campaign/UMKM.

### Scope
- Migration & model `Campaign`, `CampaignDeliverable`.
- Enum `CampaignStatus`.
- CRUD campaign (create, edit, publish, cancel, list, detail).
- Search & filter campaign untuk Creator.
- Search & filter Creator untuk UMKM.
- Halaman publik campaign.
- Halaman Inertia: dashboard UMKM, dashboard Creator, list campaign, list Creator, detail.
- Audit log untuk publish & cancel.

### Out of Scope
- Collaboration (M4), submission (M5).

### Dependency
- M2 selesai (profil & kategori tersedia).

### Deliverables
1. Migration `campaigns`, `campaign_deliverables`.
2. Controller & Form Request campaign (UMKM).
3. Controller & view search campaign (Creator).
4. Controller & view search Creator (UMKM).
5. Test: TC-CAMP-001..008, TC-DISC-001..004, TC-PAGE-001, TC-SEARCH-001.

### Acceptance Criteria
- UMKM dapat membuat, mengedit, mempublikasikan, dan membatalkan campaign.
- Campaign `Open` muncul di pencarian Creator.
- Creator dapat mencari & memfilter Creator lain.
- Pagination ≤ 20.
- Audit log untuk publish & cancel.

### Test Requirement
- Feature, authorization (TC-CAMP-003), performance smoke (TC-SEARCH-001).

### Risiko
- Index query (mitigasi: tambahkan index komposit diawal).

### Small-PR Breakdown
- PR-M3-1: Migration & Enum Campaign.
- PR-M3-2: Form buat campaign + validasi.
- PR-M3-3: Edit & publish.
- PR-M3-4: Batalkan campaign.
- PR-M3-5: Dashboard UMKM (list).
- PR-M3-6: Discovery Creator (search + filter).
- PR-M3-7: Discovery Campaign (Creator).
- PR-M3-8: Halaman publik campaign.

### Definition of Done
- TC-CAMP & TC-DISC lulus.
- Tidak ada full table scan di pencarian.

---

## Milestone 4 — Collaboration Request & Collaboration

### Tujuan
Memungkinkan Creator mengajukan kolaborasi dan UMKM mengundang Creator, dengan pembentukan kolaborasi aktif.

### Scope
- Migration & model `CollaborationRequest`, `Collaboration`, `Conversation`.
- Enum `CollaborationRequestType`, `CollaborationRequestStatus`, `CollaborationStatus`.
- Controller application (Creator) & invitation (UMKM).
- Controller accept/reject/cancel.
- Pembentukan `collaboration` saat accept (auto-reject request lain untuk campaign yang sama).
- Halaman Inertia: daftar request, detail request, status kolaborasi.
- Notifikasi ke pihak terkait.
- Audit log untuk semua perubahan status request/kolaborasi.

### Out of Scope
- Pesan & submission konten (M5).

### Dependency
- M3 selesai (campaign & profil tersedia).

### Deliverables
1. Migration `collaboration_requests`, `collaborations`, `conversations`.
2. Controller & Form Request collaboration.
3. UI daftar request & detail kolaborasi.
4. Test: TC-COLLAB-001..010.

### Acceptance Criteria
- Creator dapat mengajukan; UMKM dapat mengundang.
- Duplikat request ditolak.
- Accept membentuk collaboration; request lain auto-reject.
- Cancel application oleh Creator berfungsi.
- Hanya pihak kolaborasi yang dapat akses.
- TC-COLLAB lulus.

### Test Requirement
- Feature + authorization (TC-COLLAB-008).

### Risiko
- Concurrency saat dua user accept bersamaan (mitigasi: unique constraint + DB transaction).

### Small-PR Breakdown
- PR-M4-1: Migration & Enum.
- PR-M4-2: Application oleh Creator.
- PR-M4-3: Invitation oleh UMKM.
- PR-M4-4: Accept/Reject + auto-reject.
- PR-M4-5: Cancel application.
- PR-M4-6: UI status kolaborasi.

### Definition of Done
- Alur request → kolaborasi berjalan di E2E.
- Audit log tercatat.

---

## Milestone 5 — Messaging, Progress, Content Workflow

### Tujuan
Menyediakan alur pesan, progress update, upload konten, revisi, approval, dan completion.

### Scope
- Migration & model `Message`, `MessageAttachment`, `CollaborationProgressUpdate`, `ContentSubmission`, `ContentSubmissionFile`, `ContentRevision`.
- Enum `ContentSubmissionStatus`.
- Controller pesan, progress, submission, revisi, approval.
- Versioning submission.
- Validasi state transition.
- Notifikasi event konten.
- UI: composer pesan, timeline progress, daftar submission, form revisi, approval.
- Signed URL untuk lampiran & file submission.

### Out of Scope
- Review (M6).

### Dependency
- M4 selesai (kolaborasi ada).

### Deliverables
1. Migration seluruh tabel M5.
2. Controller `Message`, `Progress`, `ContentSubmission`, `ContentRevision`.
3. UI pesan (polling), progress, submission.
4. Test: TC-COM-001..004, TC-CONT-001..009.

### Acceptance Criteria
- Pesan terkirim & tampil dengan polling.
- Lampiran pesan via signed URL.
- Submission v1, v2, dst.
- Status transisi valid; invalid ditolak.
- Approval mengaktifkan tombol "Selesaikan Kolaborasi".

### Test Requirement
- Feature, security (signed URL), integration (notifikasi).

### Risiko
- Polling membebani server (mitigasi: interval 15 detik, throttle endpoint).

### Small-PR Breakdown
- PR-M5-1: Migration & Enum.
- PR-M5-2: Kirim & tampil pesan.
- PR-M5-3: Lampiran pesan.
- PR-M5-4: Progress update.
- PR-M5-5: Upload submission v1.
- PR-M5-6: Kirim untuk review & revisi.
- PR-M5-7: Re-submit (versioning).
- PR-M5-8: Approval konten.

### Definition of Done
- TC-COM & TC-CONT lulus.
- Notifikasi event terkirim.

---

## Milestone 6 — Completion, Review, Moderation

### Tujuan
Menyelesaikan kolaborasi, memberi review dua arah, dan kemampuan moderasi admin.

### Scope
- Migration & model `Review`.
- Enum tidak ada tambahan.
- Controller selesaikan kolaborasi.
- Controller review.
- Controller admin: suspend/activate akun, moderasi campaign, moderasi konten, moderasi review.
- Update agregat rating Creator.
- Notifikasi completion & review.
- Audit log untuk completion, review, moderasi.

### Out of Scope
- Laporan, audit log publik (M7).

### Dependency
- M5 selesai (submission approved tersedia).

### Deliverables
1. Migration `reviews`.
2. Controller UMKM/Creator untuk review.
3. Controller Admin untuk moderasi.
4. UI review & moderasi.
5. Test: TC-REV-001..005, TC-ADMIN-001..007, TC-NOTIF-001..003.

### Acceptance Criteria
- Kolaborasi dapat diselesaikan UMKM.
- Masing-masing pihak memberi review 1x; duplikat ditolak.
- Admin dapat suspend/activate & memoderasi.
- Rating Creator ter-update.
- Notifikasi email untuk event kritis.

### Test Requirement
- Feature, authorization, integration (audit + notifikasi).

### Risiko
- Race condition rating update (mitigasi: lockForUpdate atau recompute aggregate on save).

### Small-PR Breakdown
- PR-M6-1: Migration `reviews`.
- PR-M6-2: Selesaikan kolaborasi.
- PR-M6-3: Beri & tampil review.
- PR-M6-4: Aggregat rating Creator.
- PR-M6-5: Suspend/activate oleh admin.
- PR-M6-6: Moderasi campaign.
- PR-M6-7: Moderasi konten & review.

### Definition of Done
- TC-REV & TC-ADMIN lulus.
- Email notifikasi terkirim via queue.

---

## Milestone 7 — Reporting, Hardening, UAT

### Tujuan
Menyelesaikan audit log, statistik, ekspor laporan, hardening, dan UAT.

### Scope
- Migration `activity_logs` (jika belum).
- Service `AuditLogger`.
- Controller `Admin/AuditLog/*`, `Admin/Report/*`.
- Job `GenerateReport`.
- Hardening: rate limit tambahan, header keamanan, validasi CSRF, error page.
- E2E Playwright happy path.
- UAT manual dengan script di TEST_PLAN.

### Out of Scope
- Performa skala besar.

### Dependency
- M6 selesai.

### Deliverables
1. Migration `activity_logs`.
2. Service AuditLogger + integrasi ke seluruh event.
3. UI audit log.
4. UI statistik + ekspor CSV.
5. Hardening (CSP, X-Frame-Options, dsb.).
6. Playwright tests untuk happy path (TC-E2E-001..003).
7. Laporan UAT.

### Acceptance Criteria
- Audit log muncul untuk semua event utama.
- Admin dapat mengekspor CSV.
- E2E Playwright happy path lulus.
- Larastan level 6 tanpa error baru.
- Pint bersih.
- UAT skenario UAT-UMKM-001, UAT-CREATOR-001, UAT-ADMIN-001 lulus.

### Test Requirement
- Integration, E2E, UAT.

### Risiko
- Performa query audit (mitigasi: index pada `action`, `created_at`).

### Small-PR Breakdown
- PR-M7-1: Migration `activity_logs` + AuditLogger.
- PR-M7-2: Pasang AuditLogger di seluruh event.
- PR-M7-3: UI Audit Log + filter.
- PR-M7-4: Statistik & chart.
- PR-M7-5: Ekspor CSV.
- PR-M7-6: Hardening (header & rate limit).
- PR-M7-7: Playwright E2E happy path.
- PR-M7-8: UAT & bugfix.

### Definition of Done
- Exit criteria MVP (PRD §17) terpenuhi.

---

## Lampiran: Traceability Milestone ↔ FR

| Milestone | FR Terkait |
| --- | --- |
| M0 | (fondasi) |
| M1 | FR-AUTH-001..008, NFR-SECURITY-001, NFR-SECURITY-002, NFR-SECURITY-005, NFR-SECURITY-006 |
| M2 | FR-PROFILE-001..008, NFR-SECURITY-004, NFR-ACCESSIBILITY-001 |
| M3 | FR-CAMPAIGN-001..008, FR-DISCOVERY-001..004, NFR-PERFORMANCE-001..002 |
| M4 | FR-COLLAB-001..010 |
| M5 | FR-MSG-001..005, FR-CONTENT-001..008, FR-NOTIF-001..003 (in-app) |
| M6 | FR-REVIEW-001..005, FR-ADMIN-001..007, FR-NOTIF-002 (email) |
| M7 | FR-ADMIN-008..009, FR-AUDIT-001..004, FR-NOTIF-002 (laporan), NFR-OBSERVABILITY-001, NFR-MAINTAINABILITY-002 |

---

## Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 0.1 (Draft) | 2026-06-18 | Initial draft: 8 milestone dengan small-PR breakdown & DoD. | Product Engineer |
| 1.0 (Approved) | 2026-06-18 | Tutup OQ-001..OQ-011: tambah cancel-collab (pre-approval), admin force-close, message hide, file size policy, signed URL. | Product Engineer |
