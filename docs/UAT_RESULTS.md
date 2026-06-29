# UAT Results — Collabite (Internal Acceptance Test, Automated)

> **Status:** Internal acceptance test (automated) — bukan UAT eksternal.
> **Tester:** Coding agent menjalankan Pest + Vitest pada lingkungan lokal Laravel Herd (PHP 8.4 / SQLite `:memory:`).
> **Catatan:** Pengujian user eksternal belum dilakukan. Hasil di bawah ini adalah verifikasi otomatis terhadap setiap skenario yang didefinisikan di `TEST_PLAN §13` dan `AGENTS.md §3`. **Pengujian user eksternal belum dilakukan.**

## 1. Lingkungan

| Item | Nilai |
| --- | --- |
| Backend | Laravel 13 + PHP 8.4 |
| Frontend | React 19 + Inertia v3 + Vite 8 |
| DB pengujian | SQLite `:memory:` (lihat ADR-029) |
| Mail driver | `array` (Notification::fake) |
| Queue | `sync` |
| Storage | `Storage::fake('local'/'public')` |
| Tanggal eksekusi | 2026-06-18 |
| Total Pest tests | 166 (562 assertions) |
| Total Vitest tests | 39 (18 files) |
| Failures | 0 |

## 2. Ringkasan Hasil Skenario

| Scenario ID | Aktor | Test artefak | Hasil | Catatan |
| --- | --- | --- | --- | --- |
| UAT-UMKM-001 | UMKM | `tests/Feature/Content/ContentTest.php` + `tests/Feature/Review/ReviewTest.php` | PASS | Revisi + approval + review end-to-end hijau. |
| UAT-CREATOR-001 | Creator | `tests/Feature/Verification/SubmissionTest.php` + `AdminReviewTest.php` + `Content/ContentTest.php` | PASS | Submit verifikasi → approve → submission flow. |
| UAT-ADMIN-001 | Admin | `tests/Feature/Admin/ModerationTest.php` | PASS | Hide campaign/submission/review, suspend, audit, verifikasi. |
| UAT-APP-001 | Creator | `tests/Feature/Collaboration/ApplicationTest.php` | PASS | Apply, accept, auto-reject pending lain. |
| UAT-INV-001 | UMKM | `tests/Feature/Collaboration/ApplicationTest.php` | PASS | Invite, duplikat invitation ditolak, creator accept invitation. |
| UAT-REV-001 | UMKM/Creator | `tests/Feature/Content/ContentTest.php` | PASS | `InReview → RevisionRequested → Draft (v+1)`. |
| UAT-REVIEW-001 | UMKM/Creator | `tests/Feature/Review/ReviewTest.php` | PASS | Review after Completed, aggregate update profil. |
| UAT-SUSP-001 | UMKM/Creator | `tests/Feature/Messaging/MessagingTest.php` | PASS | Suspended UMKM/Creator ditolak middleware. |
| UAT-PRIV-001 | Authorized party | `tests/Feature/Content/ContentTest.php` + `tests/Feature/Messaging/MessagingTest.php` | PASS | Signed URL submission + attachment pesan. |
| UAT-FORCE-001 | Admin | `tests/Feature/Admin/CollaborationsTest.php` | PASS | 11 cases (list, show, role 403, force-close, reason validation, audit, notifikasi). |

**Semua skenario LULUS via test otomatis. Belum ada validasi user eksternal. Pengujian user eksternal belum dilakukan.**

## 3. Detail per skenario

### UAT-UMKM-001 — UMKM selesaikan kolaborasi dengan revisi

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, queue `sync` |
| Preconditions | UMKM & Creator terdaftar, campaign `Open`, kolaborasi `Active` |
| Steps | Creator upload v1 → submit for review → UMKM request revision → Creator upload v2 → UMKM approve → Collaboration complete → Review tersimpan |
| Expected | Submission v1 `InReview` → `RevisionRequested` → v2 `Draft → InReview` → `Approved`; satu review per direction |
| Actual | PASS (test artefak `tests/Feature/Content/ContentTest.php::creator can upload a content submission v1`, `creator can submit for review (Draft -> InReview)`, `UMKM can request revision (InReview -> RevisionRequested)`, `creator can resubmit a new version (RevisionRequested -> Draft, version+1)`, `UMKM can approve a submission (InReview -> Approved)`; `tests/Feature/Review/ReviewTest.php::one review per direction per collaboration: duplicate returns validation error`) |
| Defect ID | none (defect historis `H-001` ditutup oleh `tests/Feature/Content/ContentTest.php::re-submission cannot supersede an already approved submission`) |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-CREATOR-001 — Creator ajukan verifikasi & kerjakan kolaborasi

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, queue `sync` |
| Preconditions | Creator unverified, profil + portofolio ada, campaign `Open` |
| Steps | Submit verifikasi (KTP + bukti) → Admin approve → Creator apply campaign → UMKM accept → submission flow (lihat UAT-UMKM-001) |
| Expected | Verifikasi `Pending → Verified`; kolaborasi `Active`; submission cycle lengkap |
| Actual | PASS (test artefak `tests/Feature/Verification/SubmissionTest.php::creator can submit verification when profile and portfolio exist`; `tests/Feature/Verification/AdminReviewTest.php::admin can approve a pending verification`; `tests/Feature/Collaboration/ApplicationTest.php::UMKM can accept an application and form a collaboration`; `tests/Feature/Content/ContentTest.php::creator can submit for review (Draft -> InReview)`) |
| Defect ID | none |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-ADMIN-001 — Admin verifikasi & moderasi

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, queue `sync` |
| Preconditions | Admin login, ada campaign/submission/review/akun target |
| Steps | Approve verifikasi → hide campaign → hide submission → hide review → suspend akun UMKM → re-enable → audit log dicatat |
| Expected | Verifikasi `Verified`; entitas tersembunyi tidak tampil publik; akun suspended tidak bisa kirim pesan; audit log append-only |
| Actual | PASS (test artefak `tests/Feature/Admin/ModerationTest.php::admin can approve a creator verification`, `admin can hide a campaign and unhide it`, `admin can hide a content submission and unhide it`, `admin can suspend a user account and an audit log entry is created`, `admin can re-enable a suspended user`, `audit log is append-only: no PATCH/PUT/DELETE routes on activity_logs`) |
| Defect ID | none |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-APP-001 — Creator application journey

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, queue `sync` |
| Preconditions | Campaign `Open`, Creator verified |
| Steps | Creator apply → UMKM accept → kolaborasi `Active`; aplikasiCreator lain pada campaign sama di-auto-reject |
| Expected | `CollaborationRequest` `Pending → Accepted`; kolaborasi baru tercipta; pending requests lain berubah ke `rejected` |
| Actual | PASS (test artefak `tests/Feature/Collaboration/ApplicationTest.php::creator can apply to an open campaign`, `UMKM can accept an application and form a collaboration`, `accepting auto-rejects other pending requests on the same campaign`, `duplicate application is rejected`, `only campaign owner can accept an application`, `creator cannot apply to a closed campaign`) |
| Defect ID | none |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-INV-001 — UMKM invitation journey

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, queue `sync` |
| Preconditions | UMKM punya campaign `Open`, Creator target ada |
| Steps | UMKM invite → Creator accept invitation → kolaborasi `Active`; invitation duplikat ditolak |
| Expected | `Invitation` `Pending → Accepted`; duplikat invitation → 422 |
| Actual | PASS (test artefak `tests/Feature/Collaboration/ApplicationTest.php::UMKM can invite a creator to a campaign`, `creator can accept an invitation`, `duplicate invitation is rejected with 422`, `UMKM cannot invite creator to a non-owned campaign`, `re-accepting an already-responded request throws validation`) |
| Defect ID | none |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-REV-001 — Revision journey (InReview → RevisionRequested → resubmit)

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, queue `sync` |
| Preconditions | Submission `InReview`, collaboration `Active` |
| Steps | UMKM request revision dengan catatan → Creator buat submission baru `Draft` (version+1) → submit for review lagi |
| Expected | `InReview → RevisionRequested`; v baru `Draft`; tidak boleh resubmit jika sudah ada `Approved` |
| Actual | PASS (test artefak `tests/Feature/Content/ContentTest.php::UMKM can request revision (InReview -> RevisionRequested)`, `creator can resubmit a new version (RevisionRequested -> Draft, version+1)`, `re-submission cannot supersede an already approved submission`) |
| Defect ID | none (regresi `H-001` dijaga oleh test `re-submission cannot supersede an already approved submission`) |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-REVIEW-001 — Review journey (Completed → review → aggregate update)

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, queue `sync` |
| Preconditions | Collaboration `Completed` |
| Steps | UMKM/Creator submit review 1–5 + body → `rating_avg` & `rating_count` agregat ter-update pada profil reviewee; duplikat review ditolak; review `is_hidden` tidak tampil publik |
| Expected | Review tersimpan; aggregate profil update; review ke-2 pada kolaborasi sama → 422 |
| Actual | PASS (test artefak `tests/Feature/Review/ReviewTest.php::review is rejected when collaboration is not Completed (422)`, `one review per direction per collaboration: duplicate returns validation error`, `database-level uniqueness throws integrity exception on duplicate insert`, `no self-review: UMKM cannot review themselves`, `third party cannot review a collaboration (rejected)`, `rating aggregate updates creator profile (rating_avg, rating_count)`, `admin can hide a review (is_hidden=true) and hidden review is excluded from public profile`, `reviews are immutable: no PATCH/PUT/DELETE routes for reviews`) |
| Defect ID | none (defect historis `M-002` & `L-001` ditutup oleh test `review is rejected when collaboration is not Completed (422)`) |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-SUSP-001 — Suspended account journey

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, queue `sync` |
| Preconditions | User `suspended` (UMKM atau Creator) |
| Steps | Coba kirim pesan ke kolaborasi → middleware menolak |
| Expected | Request ditolak; `EnsureAccountIsActive` mengembalikan 403/forbidden |
| Actual | PASS (test artefak `tests/Feature/Messaging/MessagingTest.php::suspended UMKM cannot send messages (middleware rejects)`, `suspended Creator cannot send messages (middleware rejects)`; `tests/Feature/Admin/ModerationTest.php::admin can suspend a user account and an audit log entry is created`) |
| Defect ID | none |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-PRIV-001 — Private file authorization journey

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, `Storage::fake('local'/'public')` |
| Preconditions | Submission file / message attachment tersimpan di disk private |
| Steps | Request file URL tanpa signature → 403/expired; signed URL berfungsi untuk pemilik; attachment pesan menggunakan signed URL `/files/private/...` |
| Expected | Signed URL berlaku; unsigned/unauthorized ditolak; URL terlampir ke message payload |
| Actual | PASS (test artefak `tests/Feature/Content/ContentTest.php::content submission file is private and requires a signed URL`; `tests/Feature/Messaging/MessagingTest.php::message attachment URLs are signed and begin with /files/private/`) |
| Defect ID | none (defect historis `M-001` ditutup oleh test `message attachment URLs are signed and begin with /files/private/`) |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

### UAT-FORCE-001 — Admin force-close journey

| Field | Isi |
| --- | --- |
| Tester | Coding agent (automated) |
| Environment | Local Laravel Herd, SQLite `:memory:`, `Notification::fake` |
| Preconditions | Admin login, kolaborasi `Active` |
| Steps | Admin panggil force-close dengan reason ≥ 10 char; cek audit log, notifikasi ke kedua pihak; cek role middleware menolak UMKM/Creator; cek force-close ditolak untuk kolaborasi `Completed` / `Cancelled` |
| Expected | Kolaborasi `ForceClosed`; audit `activity_log` menulis `previous_status` + `reason`; notifikasi `CollaborationForceClosedNotification` terkirim; preservasi data historis (messages, submissions, progress, reviews) |
| Actual | PASS (test artefak `tests/Feature/Admin/CollaborationsTest.php::admin can list collaborations via admin namespace`, `admin can view a specific collaboration via admin namespace`, `admin can force-close an active collaboration with a reason`, `force-close requires a non-empty reason of at least 10 characters`, `force-close cannot apply to an already-cancelled collaboration`, `force-close cannot apply to a completed collaboration`, `non-admin users cannot call force-close`, `force-close preserves messages, submissions, progress, and reviews`, `admin cannot use UMKM accept/reject routes (403 via role middleware)`, `admin cannot use Creator accept/reject routes (403 via role middleware)`) |
| Defect ID | none |
| Evidence | Output `php artisan test` 2026-06-18 09:28 — 166 passed |
| Retest | n/a |

## 4. Defect Linkage

Referensi `docs/DEFECTS.md`. Semua defect yang ditemukan selama UAT otomatis sudah:

- diperbaiki di kode (`H-001`, `M-001`, `M-002`, `L-001`),
- ditutup oleh test regresi pada file-file yang sama,
- tidak ada Blocker / Critical / main-flow High yang tersisa.

Ringkasan defect:

| ID | Severity | Test regresi | Status |
| --- | --- | --- | --- |
| H-001 | High | `tests/Feature/Content/ContentTest.php::re-submission cannot supersede an already approved submission` | FIXED |
| M-001 | Medium | `tests/Feature/Messaging/MessagingTest.php::message attachment URLs are signed and begin with /files/private/` | FIXED |
| M-002 | Medium | `tests/Feature/Review/ReviewTest.php::review is rejected when collaboration is not Completed (422)` (membuka jalur `App\Http\Requests\Umkm\StoreReviewRequest`) | FIXED |
| L-001 | Low | `tests/Feature/Review/ReviewTest.php` (signature `storeReviewStatic()` helper) | FIXED |

## 5. Limitasi

Catat secara eksplisit:

- **Tidak ada human tester eksternal.** Semua verifikasi dilakukan oleh coding agent via Pest + Vitest.
- **Tidak ada validasi UI manual end-to-end di browser** — Playwright ter-install dan siap, namun tidak dieksekusi dalam run UAT otomatis ini (terjadwal sebagai release task terpisah pasca-RC).
- **Database autoritatif MySQL 8.x divalidasi sebagai release task pasca-RC**; lihat ADR-029 di `docs/DECISIONS.md` (UAT otomatis menggunakan SQLite `:memory:` untuk kecepatan & isolasi).
- **File ukuran maksimum (PRD §21)** hanya divalidasi via fake metadata (`tests/Feature/Content/ContentTest.php::uploaded file has mime and size`), bukan upload sungguhan, sesuai aturan testing di `AGENTS.md §15`.
- **Notifikasi & mail driver** menggunakan `Notification::fake()` & `array`; tidak ada bukti SMTP/queue worker di run otomatis.
- **Concurrency / race condition** tidak diuji eksplisit — Pest suite ini sequential; penjadwalan ulang di test produksi (MySQL + queue worker) masuk release task.

## 6. Sign-off Internal

| Peran | Nama | Tanda tangan | Tanggal |
| --- | --- | --- | --- |
| Coding agent | Claude (Sonnet 4.6) | (automated execution) | 2026-06-18 |
| Reviewer manusia | TBD | — | — |

## Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 1.0 | 2026-06-18 | Initial automated UAT pass | Coding agent |
