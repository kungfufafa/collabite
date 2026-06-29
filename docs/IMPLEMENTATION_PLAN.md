# Collabite Implementation Plan

> **Versi:** 1.0
> **Tanggal:** 2026-06-18
> **Status:** Disetujui (auto-eks disusun dari IMPLEMENTATION_ROADMAP + DECISIONS + PRD + TEST_PLAN)

Dokumen ini adalah **sumber otoritatif** implementasi Collabite MVP. Menjadi acuan
bersama `IMPLEMENTATION_ROADMAP.md`, `TDD.md`, `TEST_PLAN.md`, `DECISIONS.md`,
`PRD.md`, `USE_CASE.md`, dan `COMPONENT_DIAGRAM.md`.

Pendekatan: Membangun dalam 8 milestone (M0–M7) secara berurutan, masing-masing
disertai test, lalu melakukan validasi akhir (M7 → FINAL_REPORT).

## Stack Final (ADR tersinkron)

- Laravel 13 (PHP 8.4), MySQL 8.x (dev: SQLite in-memory).
- Inertia.js v3 + React 19 + TypeScript.
- shadcn/ui (Radix) + Tailwind CSS v4.
- Laravel Fortify v1 untuk auth (register, login, logout, reset, verify email).
- Laravel Policies, Form Requests, Action classes.
- Database queue, mail log/array pada dev.
- Pest v4, Vitest + RTL, Playwright.
- Pint, Larastan level 7.
- Local storage: disk `public` (logo, portofolio) + `local`/private (dokumen, lampiran).

## Modul Domain (dari TDD §7)

1. Authentication & Account
2. Profile & Portfolio
3. Creator Verification
4. Campaign Management
5. Creator Discovery
6. Collaboration Management
7. Messaging
8. Content & Progress
9. Rating & Review
10. Admin & Moderation
11. Notification
12. Audit & Activity
13. Reporting & Monitoring

## Skema Status (TDD §14)

- `users.account_status`: `Active`, `Suspended`
- `creator_profiles.verification_status`: `Unverified`, `Pending`, `Verified`, `Rejected`
- `campaigns.status`: `Draft`, `Open`, `InCollaboration`, `Completed`, `Cancelled`
- `collaboration_requests.status`: `Pending`, `Accepted`, `Rejected`, `CancelledByCreator`, `CancelledByUmkm`
- `collaborations.status`: `Active`, `Completed`, `Cancelled`
- `content_submissions.status`: `Draft`, `InReview`, `RevisionRequested`, `Approved`, `Superseded`

## Strategi State

- Setiap transisi status hanya melalui Action class (`app/Actions/{Module}/*`).
- Validasi di Action class, ganda di Form Request jika menyangkut input.
- Auto-reject request lain saat salah satu di-accept (DB transaction + lockForUpdate).
- Submission lama di-flag `Superseded` saat versi baru tercipta.
- `campaigns.status` otomatis `InCollaboration` saat collaboration `Active` tercipta
  dan `Completed` saat collaboration `Completed`.

## Catatan Out-of-Scope (PRD §8)

Tidak diimplementasikan: payment, escrow, subscription, AI recommendation,
auto publish IG/TikTok, video call, mobile native, WebSocket/FCM, GraphQL,
microservices, Elasticsearch, kontrak elektronik, sistem dispute kompleks,
social media analytics, multi-bahasa.

## Strategi Testing

- Pest: `RefreshDatabase` (sqlite `:memory:`), pakai factory + state.
- Vitest + RTL: komponen halaman kritis (welcome, login, register, dashboard,
  collaboration workspace, content submission, review, admin pages).
- Playwright: happy path end-to-end (registrasi → campaign → collaboration
  → submission → review).
- Authorization: tiap Policy diuji dengan user yang berbeda.
- Signed URL: diuji via Storage::fake + signed middleware.

## Struktur Direktori (TDD §6)

Mengikuti TDD §6. Folder `app/Http/Controllers/{Auth,Public,Umkm,Creator,Admin}`.
Folder `app/Enums` untuk enum status. Folder `app/Actions/{Auth,Profile,Campaign,Collaboration,Messaging,Content,Review,Admin,Notification,Audit}`.

## Strategi File Upload

- Disk `public` (logo, foto produk, foto portofolio) — `Storage::url()`.
- Disk `local` (private) — `URL::temporarySignedRoute('files.private', $ttl, ['path' => $path])`.
- File path pattern: `{module}/{owner_id}/{uuid}.{ext}`.
- Validasi MIME & size di Form Request, ownership dicek di Policy/Action.

## Strategi Notifikasi

- `Notifiable` trait + tabel `notifications` standar Laravel.
- Listener event domain → `Notification` (in-app) + `Mailable` ShouldQueue (email).
- Mailable menggunakan `log` mailer di dev/test.

## Strategi Audit Log

- `AuditLogger` service + `activity_logs` table.
- Dipanggil dari Action class untuk event penting (publish, cancel, accept,
  complete, moderate, suspend).
- Admin UI `/admin/audit-logs` dengan filter.

## Strategi Reporting

- Statistik agregat via query langsung (count, groupBy).
- Ekspor CSV menggunakan `fputcsv` di stream response (tanpa dependency tambahan).
- Job `GenerateReport` di queue database → buat file di disk private → kirim link signed.

## Strategi Frontend Layout

- Layouts: `PublicLayout`, `AuthLayout`, `UmkmLayout`, `CreatorLayout`, `AdminLayout`.
- Halaman Inertia: `pages/{Public,Auth,Umkm,Creator,Admin}/*`.
- Shared components di `resources/js/components/{ui,layout,common}`.
- Form pakai `useForm` dari `@inertiajs/react`.

## Branching

- Implementasi langsung di branch `main` (tidak push).
- Commit dengan conventional messages per `AGENTS.md` §16.

## Milestone Checklist Singkat

- M0: foundation, basic page render, tests hijau.
- M1: auth, role, status, dashboard placeholder.
- M2: profil, portofolio, verifikasi, halaman publik.
- M3: campaign CRUD, discovery, dashboard list.
- M4: application/invitation, collaboration workspace, history.
- M5: messages + progress + content versioning.
- M6: completion, review, moderasi, email queue.
- M7: audit, reporting, hardening, E2E, UAT.

## RC.1 Outcome

> Hasil aktual RC.1 (2026-06-18) — cermin run internal acceptance.

| Gate | Hasil |
| --- | --- |
| Pest (backend) | 166 cases / 562 assertions / 0 failures (full suite) |
| Vitest (frontend) | 39 cases / 18 component files / 0 failures |
| Playwright (E2E) | 17 scenarios / 5 specs (E2E-01..E2E-05) / 0 failures |
| Larastan (PHPStan level 6) | 0 error |
| Pint | bersih (no diff) |
| Build produksi (`npm run build`) | sukses |
| Defect | 4 ditutup (H-001, M-001, M-002, L-001) — `docs/DEFECTS.md` |
| Lint frontend (`npm run lint:check`) | bersih |
| Type check (`npm run types:check`) | bersih |

**Catatan:**

- MySQL autoritatif masuk release task pasca-RC (ADR-029); RC.1 divalidasi di SQLite `:memory:`.
- Bukti detail & jejak eksekusi: `docs/FINAL_REPORT.md`, `docs/TEST_RESULTS.md`, `docs/UAT_RESULTS.md`.
- UAT UI manual dengan Product Owner masuk release task pasca-RC (`docs/OPERATIONS.md`).

## Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 1.0 | 2026-06-18 | Initial IMPLEMENTATION_PLAN, hasil audit + roadmap. | Product Engineer |
| 1.1 (RC.1 reflection) | 2026-06-18 | RC.1 reflection (no scope change): section "RC.1 Outcome" — 166 Pest / 562 assertions; 39 Vitest / 18 files; 17 Playwright / 5 specs; Larastan 0 error; Pint bersih. Referensi `docs/FINAL_REPORT.md`. | Product Engineer |
