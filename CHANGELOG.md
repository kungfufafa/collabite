# Changelog

Semua perubahan signifikan untuk Collabite MVP tercatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan SemVer.

## [1.0.0-rc.1] — 2026-06-18

### Ditambahkan
- Foundation Laravel 13 + Inertia v3 + React 19 + Tailwind v4 (M0).
- Authentication Fortify, role (umkm/creator/admin), account status, suspend flow (M1).
- Profil UMKM, profil Creator, produk, portofolio, verifikasi Creator dengan signed URL (M2).
- Campaign CRUD, publish/cancel, discovery Creator + campaign, paginasi 15/halaman (M3).
- Collaboration request (application + invitation), auto-reject pending, pembentukan kolaborasi (M4).
- Messaging dalam kolaborasi (immutable, read_at, attachment private), progress update, content submission dengan versioning, revision request, approval (M5).
- Penyelesaian kolaborasi, review dua arah (immutable, hidden moderation, rating aggregate), moderasi admin (M6).
- Admin collaboration namespace: list, detail, force-close dengan reason ≥10 char, audit log + notifikasi UMKM/Creator (ADR-022).
- Audit log append-only, statistik dashboard admin, ekspor CSV laporan (M7).
- Vitest + RTL + jsdom + Playwright (5 E2E specs siap dijalankan).
- Operations docs: DEPLOYMENT, ROLLBACK, BACKUP_RECOVERY, OPERATIONS.
- ADR-029: SQLite sebagai database validasi RC.

### Diperbaiki
- H-001: ResubmitSubmissionAction tidak memproteksi Approved submission dari supersede.
- M-001: Message attachment URL tidak diekspos ke Inertia props.
- M-002: StoreReviewRequest hilang sehingga endpoint review UMKM gagal autoload.
- L-001: ReviewsController::storeForUmkm memanggil method controller dengan tipe Request yang salah.
- Route name collision `password.confirm` dan `verification.notice/verify/send` dengan Fortify (duplikat saat `php artisan route:cache`); direname ke `auth.confirm-password` dan dihapus agar Fortify yang melayani.

### Dihapus
- delete-user.tsx orphan component yang merujuk ke action Settings/ProfileController yang tidak ada.
- Legacy reset-password route (sekarang dilayani oleh Fortify).
- Legacy verify-email routes (sekarang dilayani oleh Fortify).

### Cacat yang tersisa (lihat docs/DEFECTS.md)
- Tidak ada Blocker, Critical, atau main-flow High yang terbuka.

### Pending sebelum RC.1 LOCALLY VALIDATED
- Playwright CSRF wiring fix pada `tests/E2E/_helpers.ts` (helper token CSRF/XSRF). Suite berjalan terhadap `http://collabite.test` saat ini 2/17 hijau; setelah helper fix mendarat dan E2E hijau, status RC.1 berubah menjadi "LOCALLY VALIDATED — READY FOR STAGING".

### Catatan upgrade
- Production deploy: ikuti docs/DEPLOYMENT.md.
- Rollback: ikuti docs/ROLLBACK.md.
- Database produksi: MySQL 8.x; SQLite hanya untuk fast tests (ADR-029).
