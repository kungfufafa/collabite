# Flow Report — UMKM

> **Versi:** 1.0
> **Tanggal:** 2026-06-19
> **Sumber:** `docs/FULL_BROWSER_AUDIT.md`

## Login & Landing

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Login umkm1@collabite.test / password | Redirect `/umkm/dashboard` | OK | PASS |
| 2 | Dashboard | Hero "Halo, [business]" + stats | 1068 char | PASS |
| 3 | Logout via user menu | `/login` | OK | PASS |

## Profile

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/umkm/profile` | Form profil | 400 char | PASS |
| 2 | Edit business name + kota + bio | Update + flash | OK | PASS |
| 3 | Edit dengan field kosong | Validation error | OK | PASS |

## Products

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/umkm/products` | Daftar produk | 547 char | PASS |
| 2 | Create produk + upload gambar | Produk baru + gambar tampil | OK | PASS |
| 3 | Upload gambar > 2MB | Validation error | OK | PASS |
| 4 | Edit produk | Update + replace image | OK | PASS |
| 5 | Hapus produk | Soft delete | OK | PASS |

## Campaigns

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/umkm/campaigns` | Daftar campaign | 358 char | PASS |
| 2 | Create campaign (judul, kategori, budget, deadline, deliverable) | Status `Draft` | OK | PASS |
| 3 | Create dengan deadline lampau | Validation error | OK | PASS |
| 4 | Edit campaign `Draft` | Update | OK | PASS |
| 5 | Klik "Publikasikan" | Status `Open` + flash "dipublikasikan" | OK | PASS |
| 6 | Cancel campaign `Open` tanpa kolaborasi | Status `Cancelled` | OK | PASS |
| 7 | Cancel campaign dengan kolaborasi aktif | 422 | OK | PASS |
| 8 | Lihat detail campaign | Tabs: Pesan, Pengajuan, Aksi | OK | PASS |

## Discover Creator

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/umkm/discover` | Direktori Creator | 727 char | PASS |
| 2 | Search "Citra" | Filtered results | OK | PASS |
| 3 | Filter kategori, rating, verified | Filtered | OK | PASS |
| 4 | Klik profil Creator | `/creators/{id}` | OK | PASS |
| 5 | "Undang Creator" | Invitation dibuat, notif Creator | OK | PASS |
| 6 | Invite duplikat | 422 | OK | PASS |

## Collaborations

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/umkm/collaborations` | Daftar kolaborasi | 174 char | PASS |
| 2 | Buka detail kolaborasi `Active` | Tabs (Pesan, Progres, Submission, Review) | OK | PASS |
| 3 | Kirim pesan | Pesan tampil | OK | PASS |
| 4 | Approve submission | Status `Approved` | OK | PASS |
| 5 | Request revisi | Status `RevisionRequested` + notes | OK | PASS |
| 6 | Selesaikan kolaborasi dengan approved | Status `Completed` | OK | PASS |
| 7 | Selesaikan tanpa approved | 422 | OK | PASS |
| 8 | Beri rating 5 + review | Review tersimpan | OK | PASS |
| 9 | Cancel kolaborasi pre-approval (alasan ≥ 10 char) | Status `Cancelled` + audit + notif | OK | PASS |
| 10 | Cancel tanpa alasan | 422 | OK | PASS |
| 11 | Akses kolaborasi orang lain via direct URL | 403 | OK | PASS |

## Reviews

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/umkm/reviews` | Daftar review diterima | 162 char | PASS |
| 2 | Filter hidden/sembunyi | Hidden review dikecualikan | OK | PASS |
