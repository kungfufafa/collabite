# Flow Report — Creator

> **Versi:** 1.0
> **Tanggal:** 2026-06-19
> **Sumber:** `docs/FULL_BROWSER_AUDIT.md`

## Login & Landing

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Login creator1@collabite.test / password | Redirect `/creator/dashboard` | OK | PASS |
| 2 | Dashboard | Hero + stats (rating, portfolio, collabs) | 868 char | PASS |
| 3 | Logout | `/login` | OK | PASS |

## Profile

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/creator/profile` | Form profil | 246 char | PASS |
| 2 | Edit bio, kota, kontak | Update | OK | PASS |

## Skills & Categories

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/creator/skills` | Form skills+categories | 521 char | PASS |
| 2 | Pilih 2 skill, 1 kategori | Save | OK | PASS |
| 3 | Hapus skill | Relasi dilepas | OK | PASS |

## Portfolio

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/creator/portfolio` | Daftar + form tambah | 348 char | PASS |
| 2 | Tambah item (judul, deskripsi, gambar) | Item baru + gambar tampil | OK | PASS |
| 3 | Upload > 4MB | Validation error | OK | PASS |
| 4 | Hapus item | OK | OK | PASS |

## Verification

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/creator/verification` | Status pengajuan | 321 char | PASS |
| 2 | Submit (KTP + 1 bukti) | `Pending` | OK | PASS |
| 3 | Admin reject dengan alasan | `Rejected` di profil | OK | PASS |
| 4 | Resubmit dengan dokumen baru | `Pending` baru | OK | PASS |
| 5 | Admin approve | `Verified` | OK | PASS |
| 6 | Tombol "Ajukan" hilang setelah verified | OK | OK | PASS |

## Browse Campaigns

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/creator/campaigns` | Direktori campaign `Open` | 668 char | PASS |
| 2 | Search/filter | Filtered | OK | PASS |
| 3 | Klik campaign | Detail + form Lamar | OK | PASS |
| 4 | Klik "Lamar Campaign Ini" | Form tampil (Pesan field) | OK | PASS |
| 5 | Submit lamaran | Request `Pending` + notif UMKM | OK | PASS |
| 6 | Lamar duplikat | 422 | OK | PASS |
| 7 | "Anda sudah mengajukan" tampil | OK | OK | PASS |

## Collaborations

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/creator/collaborations` | Daftar | 293 char | PASS |
| 2 | Buka detail `Active` | Tabs | OK | PASS |
| 3 | Tambah progress update | Tercatat di timeline | OK | PASS |
| 4 | Upload submission v1 + submit review | `InReview` | OK | PASS |
| 5 | UMKM minta revisi → upload v2 → submit | v2 `InReview` | OK | PASS |
| 6 | UMKM approve → upload bukti bayar → Creator konfirmasi → UMKM complete | `Completed` | OK | PASS |
| 7 | Cancel application (pending) | `CancelledByCreator` | OK | PASS |
| 8 | Cancel kolaborasi pre-approval (alasan) | `Cancelled` + audit + notif | OK | PASS |
| 9 | Beri rating 5 + review ke UMKM | Review tersimpan | OK | PASS |
| 10 | Akses kolaborasi orang lain | 403 | OK | PASS |

## Permintaan Kolaborasi

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Buka `/creator/requests` | Daftar undangan & lamaran pending | OK | PASS |
| 2 | Terima undangan UMKM | Kolaborasi `Active` | OK | PASS |
| 3 | Tolak undangan | `Rejected` | OK | PASS |
| 4 | Batalkan lamaran pending | `CancelledByCreator` | OK | PASS |

## Pembayaran Manual (MVP+)

| # | Aksi | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 1 | Setelah konten disetujui | Tab Pembayaran + record `pending_proof` | OK | PASS |
| 2 | UMKM upload bukti transfer | `awaiting_confirmation` + notif Creator | OK | PASS |
| 3 | Creator konfirmasi terima | `confirmed` + UMKM bisa complete | OK | PASS |
| 4 | Dashboard pendapatan terkonfirmasi | Sum payment confirmed | OK | PASS |
