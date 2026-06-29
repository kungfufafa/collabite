# Test Plan — Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai acuan implementasi M0–M7.

Test Plan ini menjadi acuan QA & engineer dalam menulis, mengeksekusi, dan mengevaluasi test untuk MVP Collabite. Setiap test case terkait dengan satu atau lebih Functional Requirement di [PRD.md](./PRD.md) dan use case di [USE_CASE.md](./USE_CASE.md).

---

## 1. Tujuan Testing

1. Menjamin setiap functional requirement MVP lulus acceptance criteria.
2. Menjamin lapisan authorization konsisten dengan policy.
3. Menjamin alur kolaborasi (request → kolaborasi → submission → approval → review) aman dari state invalid.
4. Menjamin kinerja minimal sesuai NFR (response time, pagination).
5. Menjadi dasar traceability requirement ↔ test case.

---

## 2. Scope

- Backend: Laravel (Pest v4).
- Frontend: React (Vitest + React Testing Library).
- E2E: Playwright.
- Static analysis: Larastan level 6.
- Formatter: Pint.

## 3. Out of Scope

- Performance/load test dengan banyak user.
- Penetration test profesional.
- Test pada browser lawas.
- Test pada device mobile native.

---

## 4. Test Levels

| Level | Alat | Cakupan |
| --- | --- | --- |
| Unit | Pest | Enum, Service, Action class, helper |
| Feature | Pest | HTTP endpoint + business flow + DB |
| Authorization | Pest | Policy per role, unauthorized access |
| Integration | Pest | Beberapa modul berkolaborasi (mis. kolaborasi + notifikasi + audit) |
| React component | Vitest + RTL | Komponen halaman & shared UI |
| End-to-end | Playwright | Happy path multi-aktor |
| Security smoke | Pest | Rate limit, signed URL, CSRF |
| Performance smoke | Pest | Query EXPLAIN + page size assertion |
| UAT | Manual script | Skenario bisnis end-to-end |

---

## 5. Test Environment

- **Local dev:** SQLite in-memory atau MySQL lokal; queue `sync`; mail `log`.
- **CI:** MySQL service container; queue `database`; mail `log`.
- **Staging (opsional):** sama dengan production, data dummy.
- **Production:** tidak untuk testing.

---

## 6. Test Data

- Factory untuk setiap model.
- States khusus pada factory: `unverified`, `verified`, `suspended`, `withPortfolio`, `withSkills`.
- Seeder untuk `categories`, `skills`, `admin user` di awal test (TestCase setUp).
- Fixture untuk file upload (storage fake via `Storage::fake()`).

---

## 7. Entry Criteria

1. Implementasi modul terkait sudah di-merge.
2. Migrasi sudah jalan di environment test.
3. Factory tersedia.
4. PRD & Use Case versi terbaru sudah disetujui.

---

## 8. Exit Criteria

1. Seluruh test case prioritas **High** lulus.
2. Coverage backend minimal 70% untuk modul yang diimplementasikan.
3. Coverage frontend minimal 60% untuk komponen halaman utama.
4. Smoke E2E happy path lulus.
5. Larastan level 6 tanpa error baru.
6. Pint bersih.
7. Tidak ada defect prioritas High terbuka.

---

## 9. Defect Severity

| Severity | Definisi |
| --- | --- |
| **Blocker** | Mencegah pengujian (build rusak, env tidak tersedia). |
| **Critical** | Fitur utama tidak berfungsi / data corruption / security hole. |
| **High** | Fitur utama tidak sesuai acceptance criteria. |
| **Medium** | Fitur minor tidak sesuai, ada workaround. |
| **Low** | Kosmetik/teks. |

> Defect severity di atas dipetakan ke log defect terpusat di `docs/DEFECTS.md` (klasifikasi H/M/L = High/Medium/Low; Blocker & Critical belum pernah muncul di RC.1).

---

## 10. Format Test Case

| Field | Keterangan |
| --- | --- |
| **Test ID** | TC-<Modul>-<Nomor> |
| **Requirement ID** | FR-/NFR- yang diuji |
| **Judul** | Ringkasan |
| **Precondition** | Syarat awal |
| **Steps** | Langkah |
| **Expected Result** | Hasil yang diharapkan |
| **Priority** | High/Medium/Low |
| **Test Type** | Unit/Feature/Authorization/Integration/Component/E2E/Security/Performance/UAT |

---

# 11. Test Cases

## 11.1 Authentication

### TC-AUTH-001 — Registrasi UMKM berhasil
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-001 |
| **Requirement ID** | FR-AUTH-001, FR-AUTH-007 |
| **Judul** | UMKM baru berhasil registrasi |
| **Precondition** | Email belum terdaftar |
| **Steps** | 1. Buka `/register?role=umkm`.<br>2. Isi form valid.<br>3. Submit. |
| **Expected Result** | User `umkm` tercipta; `umkm_profile` tercipta; email verifikasi dikirim (via Notification::fake()); redirect ke halaman "cek email". |
| **Priority** | High |
| **Test Type** | Feature |

### TC-AUTH-002 — Registrasi Creator berhasil
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-002 |
| **Requirement ID** | FR-AUTH-002 |
| **Judul** | Creator baru berhasil registrasi |
| **Precondition** | Email belum terdaftar |
| **Steps** | 1. Buka `/register?role=creator`.<br>2. Isi form valid.<br>3. Submit. |
| **Expected Result** | User `creator` tercipta; `creator_profile` tercipta dengan `verification_status=Unverified`; email verifikasi dikirim. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-AUTH-003 — Login dengan kredensial benar
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-003 |
| **Requirement ID** | FR-AUTH-003 |
| **Judul** | Login sukses |
| **Precondition** | User aktif dengan email terverifikasi |
| **Steps** | 1. Buka `/login`.<br>2. Isi email & password valid.<br>3. Submit. |
| **Expected Result** | Redirect ke dashboard sesuai role; session aktif. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-AUTH-004 — Login gagal (salah password)
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-004 |
| **Requirement ID** | FR-AUTH-003, NFR-SECURITY-006 |
| **Judul** | Login menampilkan pesan umum saat gagal |
| **Precondition** | User aktif |
| **Steps** | Isi password salah; submit. |
| **Expected Result** | Pesan umum "kredensial tidak cocok"; tidak bocorkan apakah email terdaftar. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-AUTH-005 — Akun suspended tidak bisa login
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-005 |
| **Requirement ID** | FR-AUTH-008 |
| **Judul** | Akun suspended ditolak saat login |
| **Precondition** | User dengan `account_status=Suspended` |
| **Steps** | Coba login. |
| **Expected Result** | Tolak dengan pesan "akun dinonaktifkan". |
| **Priority** | High |
| **Test Type** | Feature |

### TC-AUTH-006 — Logout
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-006 |
| **Requirement ID** | FR-AUTH-004 |
| **Judul** | Logout mengakhiri sesi |
| **Precondition** | Login |
| **Steps** | Klik Logout. |
| **Expected Result** | Session invalidated; redirect ke `/`. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-AUTH-007 — Verifikasi email via link
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-007 |
| **Requirement ID** | FR-AUTH-005 |
| **Judul** | Klik link verifikasi email menandai verified |
| **Precondition** | User belum terverifikasi; dapatkan URL dari Notification::fake() |
| **Steps** | Buka URL verifikasi. |
| **Expected Result** | `email_verified_at` terisi; redirect ke dashboard. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-AUTH-008 — Reset password via email
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-008 |
| **Requirement ID** | FR-AUTH-006 |
| **Judul** | Reset password berhasil |
| **Precondition** | User aktif |
| **Steps** | 1. Buka `/forgot-password`.<br>2. Isi email.<br>3. Buka link dari email.<br>4. Isi password baru. |
| **Expected Result** | Password berubah; session sebelumnya invalidated. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-AUTH-009 — Rate limit login
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-009 |
| **Requirement ID** | NFR-SECURITY-006 |
| **Judul** | Login terkena rate limit setelah 6x gagal |
| **Precondition** | - |
| **Steps** | 6x percobaan gagal dalam 1 menit. |
| **Expected Result** | Percobaan ke-7 mengembalikan 429. |
| **Priority** | Medium |
| **Test Type** | Security |

### TC-AUTH-010 — User belum verifikasi tidak dapat membuat campaign
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUTH-010 |
| **Requirement ID** | FR-AUTH-005 |
| **Judul** | Middleware `verified` memblokir pembuatan campaign |
| **Precondition** | UMKM login tapi email belum diverifikasi |
| **Steps** | Buka `/umkm/campaigns/create`. |
| **Expected Result** | Redirect ke halaman verifikasi email. |
| **Priority** | High |
| **Test Type** | Feature |

## 11.2 Profile

### TC-PROF-001 — UMKM update profil
| Field | Isi |
| --- | --- |
| **Test ID** | TC-PROF-001 |
| **Requirement ID** | FR-PROFILE-001 |
| **Judul** | UMKM berhasil mengubah profil usaha |
| **Precondition** | Login UMKM |
| **Steps** | Update field; submit. |
| **Expected Result** | Data tersimpan; tampil di profil publik. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-PROF-002 — Kepemilikan profil
| Field | Isi |
| --- | --- |
| **Test ID** | TC-PROF-002 |
| **Requirement ID** | FR-PROFILE-001, NFR-SECURITY-003 |
| **Judul** | UMKM A tidak dapat mengedit profil UMKM B |
| **Precondition** | 2 UMKM |
| **Steps** | UMKM A mencoba edit profil UMKM B. |
| **Expected Result** | 403 Forbidden. |
| **Priority** | High |
| **Test Type** | Authorization |

### TC-PROF-003 — Tambah produk
| Field | Isi |
| --- | --- |
| **Test ID** | TC-PROF-003 |
| **Requirement ID** | FR-PROFILE-002 |
| **Judul** | UMKM berhasil menambah produk |
| **Precondition** | Login UMKM |
| **Steps** | Isi form produk; upload foto 1MB. |
| **Expected Result** | Produk tersimpan; tampil publik. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-PROF-004 — Upload produk lebih dari 2MB ditolak
| Field | Isi |
| --- | --- |
| **Test ID** | TC-PROF-004 |
| **Requirement ID** | NFR-SECURITY-004, NFR-MAINTAINABILITY-001 |
| **Judul** | Validasi ukuran file produk |
| **Precondition** | Login UMKM |
| **Steps** | Upload foto 3MB. |
| **Expected Result** | Validasi gagal dengan pesan "maks 2MB". |
| **Priority** | Medium |
| **Test Type** | Feature |

### TC-PROF-005 — Creator update keahlian & kategori
| Field | Isi |
| --- | --- |
| **Test ID** | TC-PROF-005 |
| **Requirement ID** | FR-PROFILE-004, FR-PROFILE-005 |
| **Judul** | Tambah/hapus keahlian dan kategori |
| **Precondition** | Login Creator |
| **Steps** | Pilih 2 keahlian & 1 kategori; simpan; hapus 1 keahlian. |
| **Expected Result** | Relasi `creator_skills` & `creator_categories` sesuai. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-PROF-006 — Tambah item portofolio
| Field | Isi |
| --- | --- |
| **Test ID** | TC-PROF-006 |
| **Requirement ID** | FR-PROFILE-006 |
| **Judul** | Creator menambah item portofolio |
| **Precondition** | Login Creator |
| **Steps** | Isi judul, deskripsi, upload gambar. |
| **Expected Result** | Item tersimpan; tampil di halaman publik. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-PROF-007 — Hapus portofolio (soft delete)
| Field | Isi |
| --- | --- |
| **Test ID** | TC-PROF-007 |
| **Requirement ID** | NFR-DATA-001 |
| **Judul** | Hapus portofolio melakukan soft delete |
| **Precondition** | Punya item portofolio |
| **Steps** | Klik hapus. |
| **Expected Result** | `deleted_at` terisi; tidak tampil publik. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.3 Verification

### TC-VERIF-001 — Ajukan verifikasi
| Field | Isi |
| --- | --- |
| **Test ID** | TC-VERIF-001 |
| **Requirement ID** | FR-PROFILE-007 |
| **Judul** | Creator mengajukan verifikasi |
| **Precondition** | Creator login; profil & portofolio ada |
| **Steps** | Unggah dokumen; submit. |
| **Expected Result** | `creator_verification` berstatus `Pending`; notifikasi terkirim ke admin. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-VERIF-002 — Penolakan verifikasi dengan alasan
| Field | Isi |
| --- | --- |
| **Test ID** | TC-VERIF-002 |
| **Requirement ID** | FR-PROFILE-008, FR-NOTIF-001 |
| **Judul** | Admin menolak verifikasi |
| **Precondition** | Verifikasi `Pending` |
| **Steps** | Admin reject dengan alasan "foto tidak jelas". |
| **Expected Result** | Status `Rejected`; alasan tersimpan; notifikasi ke Creator. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-VERIF-003 — Verifikasi disetujui
| Field | Isi |
| --- | --- |
| **Test ID** | TC-VERIF-003 |
| **Requirement ID** | FR-PROFILE-008 |
| **Judul** | Admin menyetujui verifikasi |
| **Precondition** | Verifikasi `Pending` |
| **Steps** | Admin approve. |
| **Expected Result** | `creator_profiles.verification_status` = `Verified`; notifikasi ke Creator. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-VERIF-004 — Dokumen verifikasi dilayani via signed URL
| Field | Isi |
| --- | --- |
| **Test ID** | TC-VERIF-004 |
| **Requirement ID** | NFR-SECURITY-004 |
| **Judul** | Akses dokumen butuh signed URL |
| **Precondition** | Verifikasi ada |
| **Steps** | 1. Buka signed URL valid → 200.<br>2. Buka URL tanpa signature → 403. |
| **Expected Result** | Hanya signed URL yang berhasil. |
| **Priority** | High |
| **Test Type** | Security |

## 11.4 Campaign

### TC-CAMP-001 — Buat campaign
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CAMP-001 |
| **Requirement ID** | FR-CAMPAIGN-001 |
| **Judul** | UMKM berhasil buat campaign |
| **Precondition** | Login UMKM |
| **Steps** | Isi form campaign valid; submit. |
| **Expected Result** | Campaign `Draft` tercipta. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CAMP-002 — Edit campaign saat draft
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CAMP-002 |
| **Requirement ID** | FR-CAMPAIGN-002 |
| **Judul** | UMKM edit campaign draft |
| **Precondition** | Campaign `Draft` milik UMKM |
| **Steps** | Ubah judul; simpan. |
| **Expected Result** | Data berubah. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CAMP-003 — Edit campaign orang lain ditolak
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CAMP-003 |
| **Requirement ID** | NFR-SECURITY-003 |
| **Judul** | UMKM lain tidak bisa edit campaign |
| **Precondition** | Campaign milik UMKM A; UMKM B login |
| **Steps** | UMKM B akses endpoint edit. |
| **Expected Result** | 403. |
| **Priority** | High |
| **Test Type** | Authorization |

### TC-CAMP-004 — Publish campaign
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CAMP-004 |
| **Requirement ID** | FR-CAMPAIGN-004 |
| **Judul** | UMKM mempublikasikan campaign |
| **Precondition** | Campaign `Draft` lengkap |
| **Steps** | Klik "Publikasikan". |
| **Expected Result** | Status `Open`; tampil di pencarian Creator. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CAMP-005 — Batalkan campaign tanpa kolaborasi
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CAMP-005 |
| **Requirement ID** | FR-CAMPAIGN-003 |
| **Judul** | Batalkan campaign yang belum ada kolaborasi |
| **Precondition** | Campaign `Open` |
| **Steps** | Klik "Batalkan". |
| **Expected Result** | Status `Cancelled`; request yang masih `Pending` menjadi `Rejected`. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CAMP-006 — Batalkan campaign dengan kolaborasi aktif ditolak
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CAMP-006 |
| **Requirement ID** | FR-CAMPAIGN-003, BR-005 |
| **Judul** | Pembatalan ditolak jika kolaborasi aktif |
| **Precondition** | Campaign dengan kolaborasi `Active` |
| **Steps** | Coba batalkan. |
| **Expected Result** | 422 / pesan error; status tetap. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CAMP-007 — Status campaign
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CAMP-007 |
| **Requirement ID** | FR-CAMPAIGN-008 |
| **Judul** | Hanya campaign Open yang muncul di pencarian Creator |
| **Precondition** | 3 campaign (Draft, Open, Cancelled) |
| **Steps** | Creator login; buka halaman cari campaign. |
| **Expected Result** | Hanya `Open` yang muncul. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CAMP-008 — List campaign dengan pagination
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CAMP-008 |
| **Requirement ID** | NFR-PERFORMANCE-001 |
| **Judul** | Pagination ≤ 20 item |
| **Precondition** | 30 campaign |
| **Steps** | Buka halaman list. |
| **Expected Result** | Page 1 berisi 15 item; pagination muncul. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.5 Discovery

### TC-DISC-001 — Cari Creator berdasarkan kata kunci
| Field | Isi |
| --- | --- |
| **Test ID** | TC-DISC-001 |
| **Requirement ID** | FR-DISCOVERY-001 |
| **Judul** | Search Creator dengan kata kunci |
| **Precondition** | Ada Creator dengan nama "Andi" |
| **Steps** | Ketik "Andi" di search. |
| **Expected Result** | Hasil sesuai keyword. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-DISC-002 — Filter Creator
| Field | Isi |
| --- | --- |
| **Test ID** | TC-DISC-002 |
| **Requirement ID** | FR-DISCOVERY-002 |
| **Judul** | Filter Creator berdasarkan kategori & rating |
| **Precondition** | Multi Creator dengan kategori & rating berbeda |
| **Steps** | Pilih kategori Food, rating >= 4. |
| **Expected Result** | Hanya Creator yang cocok tampil. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-DISC-003 — Lihat profil publik Creator
| Field | Isi |
| --- | --- |
| **Test ID** | TC-DISC-003 |
| **Requirement ID** | FR-DISCOVERY-003 |
| **Judul** | UMKM melihat profil publik Creator |
| **Precondition** | Creator ada |
| **Steps** | Buka `/creators/{id}` (publik). |
| **Expected Result** | Bio, kategori, keahlian, portofolio, rating tampil. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-DISC-004 — Creator belum terverifikasi diberi label
| Field | Isi |
| --- | --- |
| **Test ID** | TC-DISC-004 |
| **Requirement ID** | FR-DISCOVERY-004 |
| **Judul** | Label "Belum terverifikasi" tampil |
| **Precondition** | Creator Unverified |
| **Steps** | Buka halaman discovery. |
| **Expected Result** | Label tampil. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.6 Collaboration

### TC-COLLAB-001 — Creator mengajukan kolaborasi
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-001 |
| **Requirement ID** | FR-COLLAB-001 |
| **Judul** | Creator berhasil mengajukan kolaborasi ke campaign |
| **Precondition** | Creator login; campaign `Open` |
| **Steps** | Klik "Ajukan" di detail campaign; kirim pesan. |
| **Expected Result** | Request `Pending` tercipta; notifikasi ke UMKM. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COLLAB-002 — UMKM mengundang Creator
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-002 |
| **Requirement ID** | FR-COLLAB-002 |
| **Judul** | UMKM berhasil mengirim invitation |
| **Precondition** | UMKM login; Creator ada |
| **Steps** | Buka profil Creator; klik "Undang"; kirim pesan. |
| **Expected Result** | Invitation `Pending` tercipta; notifikasi ke Creator. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COLLAB-003 — Duplicate request prevention
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-003 |
| **Requirement ID** | FR-COLLAB-003, BR-005 |
| **Judul** | Pengajuan kedua untuk campaign yang sama ditolak |
| **Precondition** | Sudah ada request `Pending` |
| **Steps** | Creator mengajukan lagi. |
| **Expected Result** | 422 / pesan "Anda sudah memiliki pengajuan". |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COLLAB-004 — Accept request
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-004 |
| **Requirement ID** | FR-COLLAB-004, FR-COLLAB-007 |
| **Judul** | UMKM menerima pengajuan Creator |
| **Precondition** | Request `Pending` |
| **Steps** | UMKM klik "Terima". |
| **Expected Result** | Collaboration `Active` tercipta; request lain auto-reject; notifikasi. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COLLAB-005 — Accept invitation oleh Creator
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-005 |
| **Requirement ID** | FR-COLLAB-005, FR-COLLAB-007 |
| **Judul** | Creator menerima invitation |
| **Precondition** | Invitation `Pending` |
| **Steps** | Creator klik "Terima". |
| **Expected Result** | Collaboration `Active` tercipta. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COLLAB-006 — Reject request
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-006 |
| **Requirement ID** | FR-COLLAB-005 |
| **Judul** | Reject request mengubah status |
| **Precondition** | Request `Pending` |
| **Steps** | Tolak. |
| **Expected Result** | Status `Rejected`; notifikasi. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COLLAB-007 — Creator batalkan pengajuan
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-007 |
| **Requirement ID** | FR-COLLAB-006 |
| **Judul** | Creator membatalkan application |
| **Precondition** | Application `Pending` |
| **Steps** | Creator klik "Batalkan". |
| **Expected Result** | Status `CancelledByCreator`. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COLLAB-008 — Collaboration authorization
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-008 |
| **Requirement ID** | FR-COLLAB-010 |
| **Judul** | Akses kolaborasi oleh pihak ketiga ditolak |
| **Precondition** | Kolaborasi milik A & B; user C login |
| **Steps** | C akses endpoint kolaborasi. |
| **Expected Result** | 403. |
| **Priority** | High |
| **Test Type** | Authorization |

### TC-COLLAB-009 — Lihat status kolaborasi
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-009 |
| **Requirement ID** | FR-COLLAB-008 |
| **Judul** | UMKM & Creator dapat melihat status kolaborasi |
| **Precondition** | Kolaborasi `Active` |
| **Steps** | Buka halaman kolaborasi. |
| **Expected Result** | Status, progres, submission tampil. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COLLAB-010 — Lihat riwayat kolaborasi
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COLLAB-010 |
| **Requirement ID** | FR-COLLAB-009 |
| **Judul** | Daftar kolaborasi sebelumnya tampil |
| **Precondition** | Punya kolaborasi `Completed` |
| **Steps** | Buka halaman riwayat. |
| **Expected Result** | Kolaborasi tampil dengan status `Completed`. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.7 Messaging

### TC-COM-001 — Kirim pesan
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COM-001 |
| **Requirement ID** | FR-MSG-002 |
| **Judul** | UMKM/Creator mengirim pesan |
| **Precondition** | Kolaborasi `Active` |
| **Steps** | Ketik pesan; kirim. |
| **Expected Result** | Pesan tersimpan; tampil di sisi penerima. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COM-002 — Message authorization
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COM-002 |
| **Requirement ID** | FR-COLLAB-010, FR-MSG-002 |
| **Judul** | User lain tidak dapat mengirim pesan di kolaborasi bukan miliknya |
| **Precondition** | Kolaborasi A-B; user C login |
| **Steps** | C akses endpoint kirim pesan. |
| **Expected Result** | 403. |
| **Priority** | High |
| **Test Type** | Authorization |

### TC-COM-003 — Lampiran pesan
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COM-003 |
| **Requirement ID** | FR-MSG-003, NFR-SECURITY-004 |
| **Judul** | Lampiran file pada pesan |
| **Precondition** | Kolaborasi `Active` |
| **Steps** | Kirim pesan dengan lampiran 1MB. |
| **Expected Result** | Lampiran tersimpan di private disk; signed URL berfungsi. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-COM-004 — Tandai pesan dibaca
| Field | Isi |
| --- | --- |
| **Test ID** | TC-COM-004 |
| **Requirement ID** | FR-MSG-004 |
| **Judul** | Pesan ditandai read saat dibuka |
| **Precondition** | Ada pesan belum dibaca oleh penerima |
| **Steps** | Penerima membuka halaman. |
| **Expected Result** | `read_at` terisi. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.8 Content & Progress

### TC-CONT-001 — Update progres
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-001 |
| **Requirement ID** | FR-CONTENT-001 |
| **Judul** | Creator mengirim progress update |
| **Precondition** | Kolaborasi `Active` |
| **Steps** | Tulis progres; submit. |
| **Expected Result** | Update tercatat di timeline; notifikasi ke UMKM. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CONT-002 — Upload konten (versi 1)
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-002 |
| **Requirement ID** | FR-CONTENT-002, BR-006 |
| **Judul** | Creator membuat submission v1 |
| **Precondition** | Kolaborasi `Active` |
| **Steps** | Upload file; submit. |
| **Expected Result** | Submission `version=1`, status `Draft`. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CONT-003 — Kirim untuk review
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-003 |
| **Requirement ID** | FR-CONTENT-003 |
| **Judul** | Kirim submission untuk review |
| **Precondition** | Submission `Draft` |
| **Steps** | Klik "Kirim untuk Review". |
| **Expected Result** | Status `InReview`; notifikasi ke UMKM. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CONT-004 — Request revisi
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-004 |
| **Requirement ID** | FR-CONTENT-004 |
| **Judul** | UMKM meminta revisi |
| **Precondition** | Submission `InReview` |
| **Steps** | Isi catatan; klik "Minta Revisi". |
| **Expected Result** | Status `RevisionRequested`; catatan tersimpan; notifikasi ke Creator. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CONT-005 — Setujui konten
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-005 |
| **Requirement ID** | FR-CONTENT-005 |
| **Judul** | UMKM menyetujui submission |
| **Precondition** | Submission `InReview` |
| **Steps** | Klik "Setujui". |
| **Expected Result** | Status `Approved`; tombol "Selesaikan Kolaborasi" aktif. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CONT-006 — Re-submit (versi naik)
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-006 |
| **Requirement ID** | FR-CONTENT-006, BR-006 |
| **Judul** | Re-submit menaikkan versi otomatis |
| **Precondition** | Submission `RevisionRequested` |
| **Steps** | Upload file baru; submit. |
| **Expected Result** | Submission baru `version=2`, status `Draft`; submission lama `Superseded`. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CONT-007 — Selesaikan kolaborasi
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-007 |
| **Requirement ID** | FR-CONTENT-007 |
| **Judul** | UMKM menyelesaikan kolaborasi |
| **Precondition** | Submission `Approved` |
| **Steps** | Klik "Selesaikan Kolaborasi". |
| **Expected Result** | Status kolaborasi `Completed`; review dapat diberikan. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CONT-008 — Invalid state transition ditolak
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-008 |
| **Requirement ID** | FR-CONTENT-008 |
| **Judul** | Transisi invalid ditolak sistem |
| **Precondition** | Submission `Draft` |
| **Steps** | Coba paksa setujui (tanpa submit review). |
| **Expected Result** | 422 / ditolak. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-CONT-009 — Upload konten > 10MB ditolak
| Field | Isi |
| --- | --- |
| **Test ID** | TC-CONT-009 |
| **Requirement ID** | NFR-MAINTAINABILITY-001 |
| **Judul** | Ukuran file submission divalidasi |
| **Precondition** | Kolaborasi `Active` |
| **Steps** | Upload 15MB. |
| **Expected Result** | Ditolak dengan pesan validasi. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.9 Review

### TC-REV-001 — UMKM memberi review
| Field | Isi |
| --- | --- |
| **Test ID** | TC-REV-001 |
| **Requirement ID** | FR-REVIEW-001 |
| **Judul** | UMKM berhasil memberi rating & review |
| **Precondition** | Kolaborasi `Completed`; UMKM belum review |
| **Steps** | Beri rating 5 & teks; submit. |
| **Expected Result** | Review tersimpan; rating Creator ter-update. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-REV-002 — Creator memberi review
| Field | Isi |
| --- | --- |
| **Test ID** | TC-REV-002 |
| **Requirement ID** | FR-REVIEW-002 |
| **Judul** | Creator berhasil memberi rating & review |
| **Precondition** | Kolaborasi `Completed`; Creator belum review |
| **Steps** | Beri rating 4; submit. |
| **Expected Result** | Review tersimpan. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-REV-003 — Duplicate review prevention
| Field | Isi |
| --- | --- |
| **Test ID** | TC-REV-003 |
| **Requirement ID** | FR-REVIEW-003, BR-007 |
| **Judul** | Review kedua dari pihak yang sama ditolak |
| **Precondition** | Sudah ada review |
| **Steps** | Submit review lagi. |
| **Expected Result** | 409 / pesan "sudah memberi review". |
| **Priority** | High |
| **Test Type** | Feature |

### TC-REV-004 — Review tampil di profil publik
| Field | Isi |
| --- | --- |
| **Test ID** | TC-REV-004 |
| **Requirement ID** | FR-REVIEW-004 |
| **Judul** | Review tampil di halaman publik |
| **Precondition** | Ada review |
| **Steps** | Buka halaman profil publik. |
| **Expected Result** | Review tampil (jika tidak hidden). |
| **Priority** | Medium |
| **Test Type** | Feature |

### TC-REV-005 — Admin menyembunyikan review
| Field | Isi |
| --- | --- |
| **Test ID** | TC-REV-005 |
| **Requirement ID** | FR-REVIEW-005 |
| **Judul** | Admin menyembunyikan review |
| **Precondition** | Ada review |
| **Steps** | Admin klik "Sembunyikan". |
| **Expected Result** | `is_hidden=true`; tidak tampil publik. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.10 Admin

### TC-ADMIN-001 — Admin suspend akun
| Field | Isi |
| --- | --- |
| **Test ID** | TC-ADMIN-001 |
| **Requirement ID** | FR-AUTH-008 |
| **Judul** | Admin menonaktifkan akun |
| **Precondition** | User aktif |
| **Steps** | Admin suspend dengan alasan. |
| **Expected Result** | Status `Suspended`; user tidak bisa login. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-ADMIN-002 — Admin melihat dashboard
| Field | Isi |
| --- | --- |
| **Test ID** | TC-ADMIN-002 |
| **Requirement ID** | FR-ADMIN-001 |
| **Judul** | Dashboard menampilkan ringkasan |
| **Precondition** | Data tersedia |
| **Steps** | Login admin; buka dashboard. |
| **Expected Result** | Statistik tampil. |
| **Priority** | Medium |
| **Test Type** | Feature |

### TC-ADMIN-003 — Admin melihat data pengguna
| Field | Isi |
| --- | --- |
| **Test ID** | TC-ADMIN-003 |
| **Requirement ID** | FR-ADMIN-002 |
| **Judul** | Daftar pengguna tampil |
| **Precondition** | Multi user |
| **Steps** | Buka `/admin/users`. |
| **Expected Result** | Daftar tampil dengan filter. |
| **Priority** | Medium |
| **Test Type** | Feature |

### TC-ADMIN-004 — Admin moderasi campaign
| Field | Isi |
| --- | --- |
| **Test ID** | TC-ADMIN-004 |
| **Requirement ID** | FR-ADMIN-005 |
| **Judul** | Admin menyembunyikan campaign |
| **Precondition** | Campaign `Open` |
| **Steps** | Admin hide. |
| **Expected Result** | Campaign tidak muncul di pencarian Creator. |
| **Priority** | Medium |
| **Test Type** | Feature |

### TC-ADMIN-005 — Admin moderasi konten
| Field | Isi |
| --- | --- |
| **Test ID** | TC-ADMIN-005 |
| **Requirement ID** | FR-ADMIN-006 |
| **Judul** | Admin menyembunyikan submission |
| **Precondition** | Submission ada |
| **Steps** | Admin hide. |
| **Expected Result** | Submission tidak tampil publik. |
| **Priority** | Medium |
| **Test Type** | Feature |

### TC-ADMIN-006 — Audit log tercatat saat suspend
| Field | Isi |
| --- | --- |
| **Test ID** | TC-ADMIN-006 |
| **Requirement ID** | FR-AUDIT-001 |
| **Judul** | Audit log muncul saat suspend |
| **Precondition** | User aktif |
| **Steps** | Admin suspend user. |
| **Expected Result** | Baris audit log `actor=admin, action=user.suspended`. |
| **Priority** | High |
| **Test Type** | Integration |

### TC-ADMIN-007 — Unauthorized access ke admin ditolak
| Field | Isi |
| --- | --- |
| **Test ID** | TC-ADMIN-007 |
| **Requirement ID** | NFR-SECURITY-003 |
| **Judul** | UMKM/Creator tidak dapat akses endpoint admin |
| **Precondition** | User UMKM login |
| **Steps** | Akses `/admin/users`. |
| **Expected Result** | 403. |
| **Priority** | High |
| **Test Type** | Authorization |

### TC-ADMIN-008 — Ekspor laporan CSV
| Field | Isi |
| --- | --- |
| **Test ID** | TC-ADMIN-008 |
| **Requirement ID** | FR-ADMIN-009 |
| **Judul** | Admin mengekspor laporan |
| **Precondition** | Data tersedia |
| **Steps** | Pilih laporan; klik "Ekspor". |
| **Expected Result** | File CSV terdownload dengan data. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.11 Notification

### TC-NOTIF-001 — Notifikasi in-app tercatat
| Field | Isi |
| --- | --- |
| **Test ID** | TC-NOTIF-001 |
| **Requirement ID** | FR-NOTIF-001 |
| **Judul** | Event kolaborasi memicu notifikasi |
| **Precondition** | Kolaborasi `Active` |
| **Steps** | Creator upload submission; kirim untuk review. |
| **Expected Result** | UMKM memiliki unread notification. |
| **Priority** | High |
| **Test Type** | Feature |

### TC-NOTIF-002 — Email via queue
| Field | Isi |
| --- | --- |
| **Test ID** | TC-NOTIF-002 |
| **Requirement ID** | FR-NOTIF-002, BR-008 |
| **Judul** | Email notifikasi masuk queue |
| **Precondition** | Event verifikasi approved |
| **Steps** | Approve verifikasi. |
| **Expected Result** | Job `SendVerificationApprovedEmail` di queue; email terkirim setelah worker jalan. |
| **Priority** | High |
| **Test Type** | Integration |

### TC-NOTIF-003 — Tandai notifikasi dibaca
| Field | Isi |
| --- | --- |
| **Test ID** | TC-NOTIF-003 |
| **Requirement ID** | FR-NOTIF-003 |
| **Judul** | Klik notifikasi menandai read |
| **Precondition** | Ada notifikasi belum dibaca |
| **Steps** | Buka menu notifikasi; klik salah satu. |
| **Expected Result** | `read_at` terisi. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.12 Audit

### TC-AUDIT-001 — Event kolaborasi tercatat di log
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUDIT-001 |
| **Requirement ID** | FR-AUDIT-001 |
| **Judul** | Perubahan status kolaborasi tercatat |
| **Precondition** | Kolaborasi `Active` |
| **Steps** | UMKM selesaikan kolaborasi. |
| **Expected Result** | Audit log `collaboration.completed`. |
| **Priority** | High |
| **Test Type** | Integration |

### TC-AUDIT-002 — Admin dapat melihat audit log
| Field | Isi |
| --- | --- |
| **Test ID** | TC-AUDIT-002 |
| **Requirement ID** | FR-AUDIT-002 |
| **Judul** | Halaman audit log dapat diakses admin |
| **Precondition** | Admin login; ada log |
| **Steps** | Buka `/admin/audit-logs`. |
| **Expected Result** | Daftar tampil dengan filter. |
| **Priority** | Medium |
| **Test Type** | Feature |

## 11.13 Pagination & Search (umum)

### TC-PAGE-001 — Pagination pada list Creator
| Field | Isi |
| --- | --- |
| **Test ID** | TC-PAGE-001 |
| **Requirement ID** | NFR-PERFORMANCE-001 |
| **Judul** | List Creator pagination ≤ 20 |
| **Precondition** | 50 Creator |
| **Steps** | Buka halaman discovery Creator. |
| **Expected Result** | Page 1 ≤ 15 item (default). |
| **Priority** | Medium |
| **Test Type** | Feature |

### TC-SEARCH-001 — Query EXPLAIN tidak full scan
| Field | Isi |
| --- | --- |
| **Test ID** | TC-SEARCH-001 |
| **Requirement ID** | NFR-PERFORMANCE-002 |
| **Judul** | Query pencarian Creator menggunakan index |
| **Precondition** | - |
| **Steps** | Jalankan EXPLAIN pada query search. |
| **Expected Result** | Tidak ada full table scan. |
| **Priority** | Low |
| **Test Type** | Performance smoke |

## 11.14 E2E Happy Path

### TC-E2E-001 — Alur UMKM: registrasi → campaign → collaboration → review
| Field | Isi |
| --- | --- |
| **Test ID** | TC-E2E-001 |
| **Requirement ID** | FR-AUTH-001, FR-CAMPAIGN-001, FR-COLLAB-002, FR-CONTENT-005, FR-CONTENT-007, FR-REVIEW-001 |
| **Judul** | Happy path UMKM |
| **Precondition** | - |
| **Steps** | 1. Registrasi UMKM.<br>2. Verifikasi email.<br>3. Buat produk.<br>4. Buat campaign; publikasikan.<br>5. Undang Creator A.<br>6. (lihat TC-E2E-002 untuk Creator).<br>7. UMKM setujui submission.<br>8. UMKM selesaikan kolaborasi.<br>9. UMKM beri rating 5 + review. |
| **Expected Result** | Semua langkah berhasil. |
| **Priority** | High |
| **Test Type** | E2E |

### TC-E2E-002 — Alur Creator: profil → verifikasi → submission → review
| Field | Isi |
| --- | --- |
| **Test ID** | TC-E2E-002 |
| **Requirement ID** | FR-PROFILE-003, FR-PROFILE-006, FR-PROFILE-007, FR-COLLAB-005, FR-CONTENT-002, FR-REVIEW-002 |
| **Judul** | Happy path Creator |
| **Precondition** | TC-E2E-001 sudah invite Creator A |
| **Steps** | 1. Registrasi Creator.<br>2. Lengkapi profil + portofolio.<br>3. Ajukan verifikasi; admin approve.<br>4. Terima undangan UMKM.<br>5. Update progres.<br>6. Upload submission v1; kirim review.<br>7. UMKM revisi → upload v2.<br>8. UMKM setujui.<br>9. Beri rating & review ke UMKM. |
| **Expected Result** | Semua langkah berhasil. |
| **Priority** | High |
| **Test Type** | E2E |

### TC-E2E-003 — Alur Admin: verifikasi → moderasi → laporan
| Field | Isi |
| --- | --- |
| **Test ID** | TC-E2E-003 |
| **Requirement ID** | FR-PROFILE-008, FR-ADMIN-001, FR-ADMIN-005, FR-ADMIN-009 |
| **Judul** | Happy path Admin |
| **Precondition** | Ada pengajuan verifikasi & campaign |
| **Steps** | 1. Admin login.<br>2. Review verifikasi → approve.<br>3. Buka dashboard.<br>4. Moderasi campaign (hide satu).<br>5. Ekspor laporan. |
| **Expected Result** | Semua langkah berhasil; CSV terdownload. |
| **Priority** | High |
| **Test Type** | E2E |

---

# 12. Requirement Traceability Matrix

| Requirement | Test Case | Modul | Milestone |
| --- | --- | --- | --- |
| FR-AUTH-001 | TC-AUTH-001 | Auth | M1 |
| FR-AUTH-002 | TC-AUTH-002 | Auth | M1 |
| FR-AUTH-003 | TC-AUTH-003, TC-AUTH-004 | Auth | M1 |
| FR-AUTH-004 | TC-AUTH-006 | Auth | M1 |
| FR-AUTH-005 | TC-AUTH-007, TC-AUTH-010 | Auth | M1 |
| FR-AUTH-006 | TC-AUTH-008 | Auth | M1 |
| FR-AUTH-007 | TC-AUTH-001, TC-AUTH-002 | Auth | M1 |
| FR-AUTH-008 | TC-AUTH-005, TC-ADMIN-001 | Auth/Admin | M1/M6 |
| FR-PROFILE-001 | TC-PROF-001, TC-PROF-002 | Profile | M2 |
| FR-PROFILE-002 | TC-PROF-003, TC-PROF-004 | Profile | M2 |
| FR-PROFILE-003 | TC-E2E-002 | Profile | M2 |
| FR-PROFILE-004 | TC-PROF-005 | Profile | M2 |
| FR-PROFILE-005 | TC-PROF-005 | Profile | M2 |
| FR-PROFILE-006 | TC-PROF-006, TC-PROF-007 | Profile | M2 |
| FR-PROFILE-007 | TC-VERIF-001 | Verification | M2 |
| FR-PROFILE-008 | TC-VERIF-002, TC-VERIF-003 | Verification | M2 |
| FR-CAMPAIGN-001 | TC-CAMP-001, TC-E2E-001 | Campaign | M3 |
| FR-CAMPAIGN-002 | TC-CAMP-002, TC-CAMP-003 | Campaign | M3 |
| FR-CAMPAIGN-003 | TC-CAMP-005, TC-CAMP-006 | Campaign | M3 |
| FR-CAMPAIGN-004 | TC-CAMP-004 | Campaign | M3 |
| FR-CAMPAIGN-005 | TC-CAMP-008 | Campaign | M3 |
| FR-CAMPAIGN-006 | TC-CAMP-007 | Campaign | M3 |
| FR-CAMPAIGN-007 | TC-CAMP-007 | Campaign | M3 |
| FR-CAMPAIGN-008 | TC-CAMP-007 | Campaign | M3 |
| FR-DISCOVERY-001 | TC-DISC-001 | Discovery | M3 |
| FR-DISCOVERY-002 | TC-DISC-002 | Discovery | M3 |
| FR-DISCOVERY-003 | TC-DISC-003 | Discovery | M3 |
| FR-DISCOVERY-004 | TC-DISC-004 | Discovery | M3 |
| FR-COLLAB-001 | TC-COLLAB-001, TC-E2E-002 | Collaboration | M4 |
| FR-COLLAB-002 | TC-COLLAB-002, TC-E2E-001 | Collaboration | M4 |
| FR-COLLAB-003 | TC-COLLAB-003 | Collaboration | M4 |
| FR-COLLAB-004 | TC-COLLAB-004 | Collaboration | M4 |
| FR-COLLAB-005 | TC-COLLAB-005, TC-COLLAB-006 | Collaboration | M4 |
| FR-COLLAB-006 | TC-COLLAB-007 | Collaboration | M4 |
| FR-COLLAB-007 | TC-COLLAB-004, TC-COLLAB-005 | Collaboration | M4 |
| FR-COLLAB-008 | TC-COLLAB-009 | Collaboration | M4 |
| FR-COLLAB-009 | TC-COLLAB-010 | Collaboration | M4 |
| FR-COLLAB-010 | TC-COLLAB-008, TC-COM-002 | Collaboration | M4 |
| FR-COLLAB-011 | TC-ADMIN-FORCE-001..010, TC-CANC-COLLAB-001..003 | Admin/Collaboration | M6 |
| FR-MSG-001 | TC-COM-001, TC-MSG-IMMUTABLE-001..007 | Messaging | M5 |
| FR-MSG-002 | TC-COM-001, TC-COM-002 | Messaging | M5 |
| FR-MSG-003 | TC-COM-003 | Messaging | M5 |
| FR-MSG-004 | TC-COM-004 | Messaging | M5 |
| FR-MSG-005 | TC-NOTIF-001 | Messaging | M5 |
| FR-CONTENT-001 | TC-CONT-001 | Content | M5 |
| FR-CONTENT-002 | TC-CONT-002, TC-CONT-006 | Content | M5 |
| FR-CONTENT-003 | TC-CONT-003 | Content | M5 |
| FR-CONTENT-004 | TC-CONT-004 | Content | M5 |
| FR-CONTENT-005 | TC-CONT-005 | Content | M5 |
| FR-CONTENT-006 | TC-CONT-006 | Content | M5 |
| FR-CONTENT-007 | TC-CONT-007 | Content | M5 |
| FR-CONTENT-008 | TC-CONT-008, TC-CONT-IMMUTABLE-001..004 | Content | M5 |
| FR-REVIEW-001 | TC-REV-001, TC-E2E-001 | Review | M6 |
| FR-REVIEW-002 | TC-REV-002, TC-E2E-002 | Review | M6 |
| FR-REVIEW-003 | TC-REV-003 | Review | M6 |
| FR-REVIEW-004 | TC-REV-004 | Review | M6 |
| FR-REVIEW-005 | TC-REV-005, TC-REV-AGG-001..008 | Review | M6 |
| FR-ADMIN-001 | TC-ADMIN-002 | Admin | M6 |
| FR-ADMIN-002 | TC-ADMIN-003 | Admin | M6 |
| FR-ADMIN-003 | TC-ADMIN-001 | Admin | M6 |
| FR-ADMIN-004 | TC-VERIF-003, TC-VERIF-002 | Admin | M6 |
| FR-ADMIN-005 | TC-ADMIN-004 | Admin | M6 |
| FR-ADMIN-006 | TC-ADMIN-005 | Admin | M6 |
| FR-ADMIN-007 | TC-REV-005, TC-MOD-001..008 | Admin | M6 |
| FR-ADMIN-008 | TC-AUDIT-002 | Admin | M7 |
| FR-ADMIN-009 | TC-ADMIN-008, TC-E2E-003 | Admin | M7 |
| FR-NOTIF-001 | TC-NOTIF-001 | Notification | M5/M6 |
| FR-NOTIF-002 | TC-NOTIF-002 | Notification | M5/M6 |
| FR-NOTIF-003 | TC-NOTIF-003 | Notification | M5/M6 |
| FR-AUDIT-001 | TC-AUDIT-001, TC-ADMIN-006 | Audit | M7 |
| FR-AUDIT-002 | TC-AUDIT-002 | Audit | M7 |
| FR-AUDIT-003 | TC-ADMIN-002 | Reporting | M7 |
| FR-AUDIT-004 | TC-ADMIN-008 | Reporting | M7 |
| NFR-SECURITY-001 | TC-AUTH-003 | Security | M1 |
| NFR-SECURITY-002 | TC-AUTH-010, TC-ADMIN-007 | Security | M1 |
| NFR-SECURITY-003 | TC-PROF-002, TC-CAMP-003, TC-COLLAB-008, TC-ADMIN-007 | Security | M1+ |
| NFR-SECURITY-004 | TC-VERIF-004, TC-COM-003 | Security | M2/M5 |
| NFR-SECURITY-005 | TC-AUTH-006 | Security | M1 |
| NFR-SECURITY-006 | TC-AUTH-009 | Security | M1 |
| NFR-PERFORMANCE-001 | TC-CAMP-008, TC-PAGE-001 | Performance | M3+ |
| NFR-PERFORMANCE-002 | TC-SEARCH-001 | Performance | M3+ |
| NFR-DATA-001 | TC-PROF-007 | Data | M2+ |

> Pemetaan test case di atas ↔ file test aktual:
>
> | Test Case Range | File Test |
> | --- | --- |
> | TC-ADMIN-FORCE-001..010 | `tests/Feature/Admin/CollaborationsTest.php` |
> | TC-MSG-IMMUTABLE-001..007 | `tests/Feature/Messaging/MessagingTest.php` |
> | TC-CONT-IMMUTABLE-001..004 | `tests/Feature/Content/ContentTest.php` |
> | TC-REV-AGG-001..008 | `tests/Feature/Review/ReviewTest.php` |
> | TC-MOD-001..008 | `tests/Feature/Admin/ModerationTest.php` |
>
> Lihat juga `docs/TEST_RESULTS.md` untuk ringkasan eksekusi aktual (166 Pest cases / 562 assertions, 39 Vitest, 17 Playwright).

---

# 13. UAT Scenarios

## UAT-UMKM-001 — UMKM Selesaikan Kolaborasi dengan Revisi

| Langkah | Aksi | Expected |
| --- | --- | --- |
| 1 | Login sebagai UMKM. | Masuk dashboard. |
| 2 | Buka kolaborasi aktif. | Halaman kolaborasi tampil. |
| 3 | Buka submission v1 `InReview`. | Detail tampil. |
| 4 | Klik "Minta Revisi" dengan catatan "tolong perbaiki pencahayaan". | Status `RevisionRequested`. |
| 5 | (Creator upload v2). | Submission v2 muncul. |
| 6 | UMKM setujui v2. | Status `Approved`. |
| 7 | Klik "Selesaikan Kolaborasi". | Status `Completed`; review terbuka. |
| 8 | Beri rating 5 & review. | Review tersimpan. |

## UAT-CREATOR-001 — Creator Ajukan Verifikasi & Kerjakan Kolaborasi

| Langkah | Aksi | Expected |
| --- | --- | --- |
| 1 | Login Creator. | Dashboard tampil. |
| 2 | Buka "Ajukan Verifikasi". | Form tampil. |
| 3 | Unggah KTP & 2 bukti portofolio; submit. | Status `Pending`; notifikasi ke admin. |
| 4 | Admin approve (lihat UAT-ADMIN-001). | Status `Verified`. |
| 5 | Buka undangan dari UMKM; klik "Terima". | Kolaborasi `Active`. |
| 6 | Kirim progress update. | Tercatat di timeline. |
| 7 | Upload submission v1; kirim review. | Status `InReview`. |
| 8 | UMKM minta revisi; upload v2. | Submission v2 `Draft`. |
| 9 | UMKM setujui → UMKM selesaikan. | Status `Completed`. |
| 10 | Creator beri review ke UMKM. | Review tersimpan. |

## UAT-ADMIN-001 — Admin Verifikasi & Moderasi

| Langkah | Aksi | Expected |
| --- | --- | --- |
| 1 | Login Admin. | Dashboard tampil. |
| 2 | Buka antrian verifikasi. | Pengajuan muncul. |
| 3 | Klik pengajuan; lihat dokumen; approve. | Verifikasi `Verified`; notifikasi ke Creator. |
| 4 | Buka daftar campaign. | Daftar tampil. |
| 5 | Pilih campaign; klik "Hide". | Campaign tersembunyi dari pencarian Creator. |
| 6 | Buka laporan; ekspor CSV. | File CSV terdownload. |

> Catatan RC.1: Seluruh skenario UAT utama (UMKM, Creator, Admin, App, Inv, Rev, Review, Susp, Priv, Force) telah dijalankan sebagai **automated internal acceptance** lewat test artefak. Hasil & bukti: lihat `docs/UAT_RESULTS.md`. UAT UI manual dengan Product Owner masuk release task pasca-RC.

---

## Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 0.1 (Draft) | 2026-06-18 | Initial draft: 9 test level, traceability matrix, UAT scenarios. | Product Engineer |
| 1.0 (Approved) | 2026-06-18 | Tambah TC-CANC-CAMP-001, TC-CANC-CAMP-002, TC-CANC-COLLAB-001, TC-CANC-COLLAB-002, TC-CANC-COLLAB-003, TC-MSG-HIDE-001, TC-FILE-LIM-001, TC-FILE-LIM-002, TC-FILE-LIM-003. | Product Engineer |
| 1.1 (RC.1 reflection) | 2026-06-18 | RC.1 reflection (no scope change): §9 petakan severity ke `docs/DEFECTS.md`; §12 tambah baris FR-COLLAB-011 + 4 traceability test (TC-MSG-IMMUTABLE/CONT-IMMUTABLE/REV-AGG/MOD) + tabel pemetaan ke file test aktual; §13 cross-reference ke `docs/UAT_RESULTS.md`. | Product Engineer |
