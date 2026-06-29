# Flow Report — Admin

> **Versi:** 1.0
> **Tanggal:** 2026-06-19
> **Sumber:** `docs/FULL_BROWSER_AUDIT.md`

## Login & Landing

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | `GET /login` | Form login | Form login render | PASS |
| 2 | Login admin@collabite.test / password | Redirect ke `/admin/dashboard` | Redirect ke `/admin/dashboard` | PASS |
| 3 | Visit `/admin/dashboard` | Pantauan operasional, tile statistik | Hero, tiles, navigasi sidebar render (871 char text) | PASS |
| 4 | Refresh | Tetap di `/admin/dashboard` | Tetap | PASS |
| 5 | Logout via user menu | Kembali ke `/login` | Kembali | PASS |

## Verifikasi

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/admin/verifications` | Antrian verifikasi | Daftar tampil (487 char) | PASS |
| 2 | Buka detail verifikasi | Data Creator + dokumen | Render | PASS |
| 3 | Klik "Setujui" | Status `Verified`, notif Creator | `Verified` di profil Creator | PASS |
| 4 | Klik "Tolak" dengan alasan ≥ 5 char | Status `Rejected` | `Rejected`, Creator bisa resubmit | PASS |
| 5 | Verifikasi dengan pending | Pending di antrian | Muncul | PASS |
| 6 | Resubmit verifikasi | Buat verifikasi baru | OK | PASS |

## Moderasi

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/admin/moderation/campaigns` | Daftar campaign hidden | 330 char (kosong, no hidden) | PASS |
| 2 | Toggle hide campaign | `is_hidden` flipped, redirect back | OK | PASS |
| 3 | Buka `/admin/moderation/content` | Daftar submission hidden | 328 char | PASS |
| 4 | Buka `/admin/moderation/reviews` | Daftar review hidden | 350 char | PASS |
| 5 | Hide/unhide | Status toggled | OK | PASS |

## Users

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/admin/users` | Daftar semua user | 814 char, ada user table | PASS |
| 2 | Suspend UMKM | Status jadi `Suspended` | OK | PASS |
| 3 | Aktifkan kembali | Status jadi `Active` | OK | PASS |
| 4 | Coba suspend diri sendiri | Error "tidak dapat mengubah akun sendiri" | OK | PASS |
| 5 | Suspended user coba login | Tolak "akun dinonaktifkan" | Ditolak | PASS |

## Collaborations

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- | 
| 1 | Buka `/admin/collaborations` | Daftar kolaborasi lintas UMKM/Creator | 474 char | PASS |
| 2 | Buka detail kolaborasi | Tabs (Message, Progres, Submission, Review) + audit log | Render | PASS |
| 3 | Force-close (admin) | Kolaborasi `Cancelled` + audit `collaboration.force_closed` + notif kedua pihak | OK | PASS |
| 4 | Force-close tanpa alasan | 422 (validasi) | OK | PASS |
| 5 | Force-close kolaborasi `Completed` | 422 (transisi invalid) | OK | PASS |
| 6 | Admin coba pakai route UMKM `/umkm/requests/{id}/accept` | 403 | OK | PASS |

## Audit Log

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/admin/audit-logs` | Daftar append-only | 895 char | PASS |
| 2 | Filter by action/actor | Filter applied | OK | PASS |
| 3 | Tidak ada form edit/delete di UI | Append-only | OK | PASS |

## Reports

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/admin/reports` | Tiles statistik | 488 char | PASS |
| 2 | `GET /admin/reports/export?type=users` | CSV download | `text/csv`, filename `collabite_users_YYYYMMDD_HHMMSS.csv` | PASS |
| 3 | `?type=campaigns` | CSV | OK | PASS |
| 4 | `?type=collaborations` | CSV | OK | PASS |
| 5 | `?type=reviews` | CSV | OK | PASS |
