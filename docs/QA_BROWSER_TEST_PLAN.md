# QA Browser Test Plan — Collabite MVP

> **Versi:** 1.2  
> **Tanggal:** 2026-07-05  
> **Status:** Siap eksekusi QA manual (pre-pilot) — gap implementasi §18.3 (v1.1) sudah ditutup di v1.2  
> **Audience:** QA Engineer, Product Owner, Release Manager  
> **Referensi:** [PRD.md](./PRD.md), [USE_CASE.md](./USE_CASE.md), [TDD.md](./TDD.md), [TEST_PLAN.md](./TEST_PLAN.md), [DECISIONS.md](./DECISIONS.md), [FLOW_UMKM.md](./FLOW_UMKM.md), [FLOW_CREATOR.md](./FLOW_CREATOR.md), [FLOW_ADMIN.md](./FLOW_ADMIN.md), [DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md)

---

## 1. Ringkasan Eksekutif & Scope

### 1.1 Tujuan Dokumen

Dokumen ini adalah **rencana pengujian browser manual mendalam** untuk memvalidasi seluruh alur MVP Collabite sebelum **pilot project**. QA Engineer menggunakan dokumen ini sebagai checklist eksekusi, bukan sebagai pengganti test otomatis (Pest/Vitest/Playwright).

### 1.2 Scope MVP (In)

| # | Modul | Cakupan Browser Test |
| --- | --- | --- |
| 1 | Authentication & Role | Registrasi UMKM/Creator, login, logout, verifikasi email, reset password, suspend |
| 2 | Profil & Portofolio | Profil UMKM, produk, profil Creator, keahlian, kategori, portofolio |
| 3 | Verifikasi Creator | Submit, resubmit, approve/reject admin |
| 4 | Campaign | CRUD, publish, cancel, visibility |
| 5 | Discovery | Direktori Creator publik, discover UMKM, browse campaign Creator |
| 6 | Collaboration Request | Application, invitation, accept/reject/cancel |
| 7 | Collaboration Workspace | Pesan, progress, submission, revisi, approval, pembatalan |
| 8 | Pembayaran Manual (MVP+) | Upload bukti, konfirmasi Creator, gate completion |
| 9 | Review & Rating | Review dua arah, tampil publik, moderasi |
| 10 | Admin | Dashboard, users, verifikasi, moderasi, force-close, audit, reports |
| 11 | Notifikasi | In-app (terimplementasi), email (auth + payment + force-close) |
| 12 | File Upload | Public vs private, signed URL, validasi ukuran/MIME |
| 13 | Landing & Publik | Homepage, profil publik UMKM/Creator |

### 1.3 Out of Scope (Non-Goals PRD §8)

Tidak diuji pada pilot MVP:

- Payment gateway / escrow otomatis
- Subscription / billing
- AI recommendation
- Publikasi otomatis ke Instagram/TikTok
- Video call, native mobile app
- WebSocket / push FCM real-time
- GraphQL, microservices, Elasticsearch
- Kontrak elektronik, dispute kompleks
- Analitik media sosial otomatis

### 1.4 Prioritas Test Case

| Prioritas | Definisi | Target Eksekusi |
| --- | --- | --- |
| **P0** | Blocker pilot — alur bisnis inti tidak bisa diselesaikan | 100% lulus sebelum pilot |
| **P1** | Fitur MVP penting, validasi, authorization, state transition | ≥ 95% lulus |
| **P2** | Edge case, UX polish, responsive smoke, regresi minor | ≥ 80% lulus; defect dicatat |

### 1.5 Konvensi ID Test Case

Format: `QA-BROWSER-<ROLE>-<MODUL>-<NNN>`

- **ROLE:** `PUB`, `AUTH`, `UMKM`, `CR`, `ADM`, `XROLE` (cross-role), `SEC`, `A11Y`
- Traceability ke `FR-*` dan `UC-*` dicantumkan per test case
- Mapping ke automated test: lihat [TEST_PLAN.md](./TEST_PLAN.md) (`TC-*`)

---

## 2. Prasyarat Environment Testing

### 2.1 URL & Infrastruktur

| Item | Nilai |
| --- | --- |
| **Base URL (Herd lokal)** | `https://collabite.test` |
| **Health check** | `GET /up` → HTTP 200 |
| **Database** | SQLite (dev/RC, ADR-029) atau MySQL 8.x (staging/produksi, ADR-004) |
| **Mail driver (dev)** | `log` → cek `storage/logs/laravel.log` |
| **Mail driver (staging)** | Mailtrap / sandbox SMTP |
| **Queue** | `database` — **wajib** jalankan worker |

```bash
# Reset data demo (hanya local/testing)
php artisan migrate:fresh --seed --force

# Queue worker (terminal terpisah, WAJIB untuk email)
php artisan queue:work --tries=3 --timeout=60

# Frontend (jika perubahan belum terlihat)
npm run dev   # atau npm run build
```

### 2.2 Browser & Viewport

| Browser | Versi Minimum | Wajib? |
| --- | --- | --- |
| Google Chrome / Chromium | Latest stable | Ya |
| Mozilla Firefox | Latest stable | Ya |
| Safari (macOS) | Latest | Direkomendasikan |
| Microsoft Edge | Latest | Opsional |

| Viewport | Resolusi | Cakupan |
| --- | --- | --- |
| Desktop | 1440×900 | Semua P0/P1 |
| Tablet | 768×1024 | Smoke P1 |
| Mobile | 390×844 | Smoke P2 |

### 2.3 Akun Demo (Sumber: DEMO_ACCOUNTS.md)

| Email | Password | Role | Catatan Testing |
| --- | --- | --- | --- |
| `admin@collabite.test` | `password` | Admin | Operasional penuh |
| `umkm1@collabite.test` | `password` | UMKM | Kedai Kopi Sari — campaign Open, pengajuan pending |
| `umkm2@collabite.test` | `password` | UMKM | Batik Nusantara — kolaborasi Active + submission InReview |
| `umkm3@collabite.test` | `password` | UMKM | Kecantikan Alami — kolaborasi Completed + review |
| `creator1@collabite.test` | `password` | Creator | Verified, rating 5.0 |
| `creator2@collabite.test` | `password` | Creator | Pending verification |
| `creator3@collabite.test` | `password` | Creator | Rejected verification |

> **Catatan:** [UAT.md](./UAT.md) memakai email lama (`umkm.a@`, `creator.a@`). Gunakan **DEMO_ACCOUNTS.md** sebagai sumber kebenaran terbaru.

### 2.4 Data Seed Demo (Preloaded State)

Setelah `migrate:fresh --seed`, verifikasi state berikut ada:

| Entitas | State | Akun Terkait |
| --- | --- | --- |
| Campaign "Promo Kopi Baru" | `Open` | umkm1 (Kedai Kopi Sari) |
| Campaign "Story Kopi Pagi" | `Open` | umkm1 — target undangan |
| Application creator1 (Citra Kreatif) → Promo Kopi Baru | `Pending` (application) | umkm1, creator1 |
| Invitation umkm1 → creator2 (Dimas Pratama) / Story Kopi Pagi | `Pending` (invitation) | umkm1, creator2 |
| Kolaborasi "Showcase Koleksi Batik" | `Active`, submission v1 `InReview`, **belum ada payment** | umkm2, creator1 |
| Kolaborasi "Launching Skincare Lokal" | `Completed`, submission `Approved`, **review mutual sudah ada** (UMKM→Creator 5★, Creator→UMKM 4★) | umkm3, creator1 |

> **Catatan bisnis seed:** Kolaborasi completed (`Launching Skincare Lokal`) **sudah** memiliki record `collaboration_payments` status `confirmed`. Untuk uji alur payment step-by-step, gunakan kolaborasi aktif umkm2 atau jalankan E2E-001/E2E-002. Untuk uji **duplikat review**, gunakan umkm3+creator1 (review sudah ada).

Validasi cepat:

```bash
php artisan tinker --execute 'echo "users=".\App\Models\User::count()
  ." campaigns=".\App\Models\Campaign::count()
  ." collabs=".\App\Models\Collaboration::count();'
```

### 2.5 Checklist Pre-Test (Entry Criteria)

- [ ] Aplikasi dapat diakses di browser tanpa error 500
- [ ] Database ter-seed dengan akun demo
- [ ] Queue worker aktif
- [ ] `storage/app/public` writable (upload logo/produk/portofolio)
- [ ] `storage/app/private` writable (verifikasi, submission, payment proof)
- [ ] Build frontend sukses (`npm run build` atau dev server aktif)
- [ ] Tester punya akses ke log mail (`storage/logs/laravel.log` atau Mailtrap)

---

## 3. Diagram State Transition & Alur Bisnis (Referensi QA)

> Sumber kebenaran: [TDD.md §15](./TDD.md), [USE_CASE.md](./USE_CASE.md), [DECISIONS.md ADR-011/ADR-033](./DECISIONS.md). **Pilot default:** tanpa gate pembayaran in-app (`COLLABITE_MANUAL_PAYMENT_ENABLED=false`).

### 3.1 Campaign

```
Draft ──(publish, UMKM)──► Open
Draft ──(cancel, UMKM)──► Cancelled
Open  ──(request accepted → kolaborasi Active)──► InCollaboration
Open  ──(cancel, UMKM, tanpa kolaborasi active)──► Cancelled  [pending requests auto-reject]
InCollaboration ──(UMKM complete, submission Approved)──► Completed  [default pilot]
InCollaboration ──(UMKM complete + payment confirmed)──► Completed  [hanya jika manual payment enabled]
InCollaboration ──(cancel pre-approval / admin force-close)──► Open  [kolaborasi → Cancelled]
```

### 3.2 Collaboration Request

```
Pending ──(UMKM accept application)──► Accepted ──(auto)──► Collaboration Active + Campaign InCollaboration
Pending ──(Creator accept invitation)──► Accepted ──(auto)──► Collaboration Active + Campaign InCollaboration
Pending ──(UMKM reject application)──► Rejected
Pending ──(Creator reject invitation)──► Rejected
Pending ──(Creator cancel application)──► CancelledByCreator
Pending ──(UMKM cancel invitation)──► CancelledByUmkm  [route: POST /umkm/requests/{id}/cancel-invitation]
[BR-005] Saat satu request Accepted → request Pending lain untuk campaign yang sama auto-reject
```

### 3.3 Content Submission

```
(none) ──(Creator upload v1)──► Draft
Draft ──(submit for review)──► InReview
InReview ──(UMKM request revision)──► RevisionRequested
InReview ──(UMKM approve)──► Approved  [+ payment record jika COLLABITE_MANUAL_PAYMENT_ENABLED=true]
RevisionRequested ──(Creator upload + submit versi baru)──► InReview (v+1); versi lama → Superseded
Approved ──(terminal)──► tidak boleh versi baru (BR-014); hanya Admin force-close jika dispute
```

### 3.4 Collaboration

```
(none) ──(request Accepted)──► Active  [conversation auto-created]
Active ──(UMKM complete: submission Approved)──► Completed  [Campaign → Completed; default pilot]
Active ──(UMKM complete: submission Approved + payment Confirmed)──► Completed  [jika manual payment enabled]
Active ──(UMKM/Creator cancel pre-approval, alasan ≥10 char, BR-013)──► Cancelled  [Campaign → Open]
Active ──(Admin force-close, UC-ADMIN-010, boleh post-approval)──► Cancelled  [Campaign → Open]
Completed ──(terminal)──► review dua arah tersedia; pesan read-only (BR-012)
Cancelled ──(terminal)──► tidak ada review baru
```

### 3.5 Payment (Opsional — ADR-033, default **nonaktif** untuk pilot)

> **Pilot:** `COLLABITE_MANUAL_PAYMENT_ENABLED=false` (default). Bukan payment gateway — pembayaran off-platform (ADR-011). Kolaborasi selesai setelah submission `Approved` saja.
>
> **Jika diaktifkan** (`COLLABITE_MANUAL_PAYMENT_ENABLED=true`):

```
(on UMKM approve submission) ──(auto-create)──► pending_proof
pending_proof ──(UMKM upload bukti)──► awaiting_confirmation
awaiting_confirmation ──(Creator confirm)──► confirmed
confirmed ──(UMKM complete collaboration)──► Collaboration Completed + Campaign Completed
```

> **Gate completion (hanya jika fitur aktif):** `CompleteCollaborationAction` menolak jika payment ≠ `confirmed`.

### 3.6 Alur Bisnis End-to-End (Swimlane)

Urutan bisnis **wajib** untuk pilot QA. Kolom **State Setelah Langkah** adalah expected state sistem.

#### Jalur A — Application (Creator → UMKM)

| # | UMKM | Creator | Admin | State Setelah Langkah |
| --- | --- | --- | --- | --- |
| A1 | Buat campaign + deliverable | — | — | Campaign `Draft` |
| A2 | Publish campaign | — | — | Campaign `Open`; visible di `/creator/campaigns` |
| A3 | — | Lamar campaign (verified atau unverified, BR-003) | — | Request `Pending` (application) |
| A4 | Accept pengajuan (satu Creator) | — | — | Request `Accepted`; Collab `Active`; Campaign `InCollaboration`; request pending lain `Rejected`; conversation dibuat |
| A5 | — | Progress update (opsional) | — | Timeline progres tercatat |
| A6 | — | Upload submission v1 + submit review | — | Submission v1 `InReview` |
| A7 | Minta revisi + catatan | — | — | Submission `RevisionRequested` |
| A8 | — | Upload v2 + submit review | — | v2 `InReview`; v1 `Superseded` |
| A9 | Approve submission | — | — | Submission `Approved` |
| A10 | (Opsional) Upload bukti transfer | — | — | Hanya jika `COLLABITE_MANUAL_PAYMENT_ENABLED=true` |
| A11 | (Opsional) Konfirmasi terima pembayaran | — | — | Payment `confirmed`; tombol Complete aktif |
| A12 | Selesaikan kolaborasi | — | — | Collab `Completed`; Campaign `Completed` |
| A13 | Beri review (1×, BR-007) | Beri review (1×, BR-007) | — | Review tersimpan; rating publik ter-update |
| A14 | — | — | — | Guest lihat profil publik → rating/review tampil |

#### Jalur B — Invitation (UMKM → Creator)

| # | UMKM | Creator | Admin | State Setelah Langkah |
| --- | --- | --- | --- | --- |
| B1–B2 | Sama A1–A2 (publish campaign `Open`) | — | — | Campaign `Open` |
| B3 | Discover → undang Creator ke campaign | — | — | Request `Pending` (invitation) |
| B4 | — | Accept di `/creator/requests` | — | Sama post-condition A4 |
| B5–B14 | — | — | — | **Identik A5–A14** (workspace → payment → complete → review) |

#### Jalur C — Verifikasi Creator (paralel, tidak memblokir kolaborasi)

| # | Creator | Admin | State Setelah Langkah |
| --- | --- | --- | --- |
| C1 | Registrasi + lengkapi profil/portofolio | — | `Unverified` |
| C2 | Submit dokumen verifikasi | — | `Pending` |
| C3 | — | Approve / Reject (alasan ≥5 char) | `Verified` / `Rejected` |
| C4 | Resubmit jika `Rejected` | — | Kembali `Pending` |

#### Jalur D — Intervensi Admin (exception path)

| # | Kondisi | Admin | State Setelah Langkah |
| --- | --- | --- | --- |
| D1 | Collab `Active`, submission sudah `Approved` (BR-013: pihak tidak bisa cancel) | Force-close + alasan ≥10 char | Collab `Cancelled`; Campaign `Open`; audit `collaboration.force_closed`; notif UMKM+Creator |
| D2 | Collab `Active`, submission belum `Approved` | — (pihak cancel sendiri) | Collab `Cancelled`; Campaign `Open`; audit `collaboration.cancelled` |
| D3 | Collab `Completed` | Coba force-close | 422 (transisi invalid) |

#### Batas Peran (Role Boundaries) — Ringkas

| Aksi | UMKM | Creator | Admin | Guest |
| --- | --- | --- | --- | --- |
| Publish/cancel campaign | ✅ (owner) | ❌ | ❌ (moderasi hide saja) | ❌ |
| Apply campaign | ❌ | ✅ | ❌ | ❌ |
| Accept application | ✅ | ❌ | ❌ | ❌ |
| Accept invitation | ❌ | ✅ | ❌ | ❌ |
| Approve/revise submission | ✅ | ❌ | ❌ | ❌ |
| Upload bukti bayar | ✅ | ❌ | ❌ | ❌ |
| Konfirmasi pembayaran | ❌ | ✅ | ❌ | ❌ |
| Complete kolaborasi | ✅ | ❌ | ❌ | ❌ |
| Cancel collab pre-approval | ✅ | ✅ | ❌ | ❌ |
| Force-close post-approval | ❌ | ❌ | ✅ | ❌ |
| Review setelah completed | ✅ (1×) | ✅ (1×) | moderasi hide | lihat publik |

---

## 4. Role: Public / Guest

### 4.1 Matriks Modul

| Modul | Route Utama | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| Landing Page | `/` | 3 | 2 | 2 |
| Direktori Creator | `/creators` | 2 | 3 | 1 |
| Profil Creator Publik | `/creators/{id}` | 2 | 2 | 1 |
| Profil UMKM Publik | `/umkm/{id}` | 2 | 1 | 1 |
| Navigasi Auth | `/login`, `/register` | 2 | 1 | 0 |

---

#### QA-BROWSER-PUB-LAND-001 — Homepage render lengkap

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Tidak login (guest) |
| **FR/UC** | — (marketing/onboarding) |
| **Test Data** | Seed demo aktif |

**Langkah:**
1. Buka `https://collabite.test/`
2. Scroll dari hero sampai footer
3. Klik setiap anchor navbar: Cara Kerja, UMKM, Creator, Fitur, FAQ
4. Klik CTA "Daftar UMKM" dan "Daftar Creator"

**Expected:**
1. Halaman render tanpa blank/error React
2. Section hero, benefits, how-it-works, FAQ tampil
3. Anchor scroll ke section yang benar
4. CTA mengarah ke `/register?role=umkm` dan `/register?role=creator`

---

#### QA-BROWSER-PUB-LAND-002 — Featured creators dari database

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Demo seed dengan creator verified |
| **FR/UC** | FR-DISCOVERY-003 |

**Langkah:**
1. Buka `/`
2. Cari section featured creators
3. Klik salah satu card creator

**Expected:**
- Creator verified tampil dengan foto/portofolio
- Klik navigasi ke `/creators/{id}` profil publik

---

#### QA-BROWSER-PUB-CRDIR-001 — Direktori creator tanpa login

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Guest |
| **FR/UC** | FR-DISCOVERY-001, UC-DISC-001 |

**Langkah:**
1. Buka `/creators`
2. Verifikasi grid/list creator tampil
3. Klik profil `creator1` (verified)

**Expected:**
- Halaman direktori render dengan filter panel
- Creator verified dan unverified (jika ada) tampil
- Profil publik terbuka tanpa login

---

#### QA-BROWSER-PUB-CRDIR-002 — Filter & search creator

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Guest atau login UMKM |
| **FR/UC** | FR-DISCOVERY-002, UC-DISC-002 |

**Langkah:**
1. Buka `/creators`
2. Ketik keyword nama creator (mis. "Anisa" atau "Citra" dari demo)
3. Filter kategori (mis. Food)
4. Filter rating minimum
5. Toggle filter verified

**Expected:**
- Hasil terfilter sesuai kriteria
- Creator unverified menampilkan label **"Belum terverifikasi"** (FR-DISCOVERY-004)
- Empty state jelas jika tidak ada hasil

---

#### QA-BROWSER-PUB-CRPROF-001 — Profil creator publik lengkap

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | creator1 verified dengan portofolio |
| **FR/UC** | FR-DISCOVERY-003, UC-DISC-003, UC-DISC-004 |

**Langkah:**
1. Buka `/creators/{creator1_profile_id}`
2. Periksa bio, keahlian, kategori, rating, portofolio
3. Klik item portofolio (jika ada lightbox/link)

**Expected:**
- Badge verified tampil
- Portofolio dengan gambar public URL
- Rating dan jumlah review konsisten dengan data seed

---

#### QA-BROWSER-PUB-UMKMPROF-001 — Profil UMKM publik

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | umkm1 dengan produk aktif |
| **FR/UC** | FR-PROFILE-001, FR-PROFILE-002 |

**Langkah:**
1. Buka `/umkm/{umkm1_profile_id}`
2. Verifikasi logo, deskripsi, produk

**Expected:**
- Produk aktif tampil dengan foto
- Produk soft-deleted tidak tampil

---

#### QA-BROWSER-PUB-AUTH-001 — Guest redirect dari area protected

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Guest |
| **FR/UC** | NFR-SECURITY-002 |

**Langkah:**
1. Akses langsung `/umkm/dashboard`
2. Akses `/creator/campaigns`
3. Akses `/admin/dashboard`

**Expected:**
- Semua redirect ke `/login`
- Tidak bocorkan data sensitif

---

## 5. Role: Authentication (Semua User)

### 5.1 Matriks Modul

| Modul | Route | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| Registrasi UMKM | `/register?role=umkm` | 2 | 2 | 1 |
| Registrasi Creator | `/register?role=creator` | 2 | 2 | 1 |
| Login/Logout | `/login` | 3 | 2 | 1 |
| Verifikasi Email | `/email/verify` | 2 | 1 | 0 |
| Reset Password | `/forgot-password` | 2 | 1 | 1 |
| Settings | `/settings/*` | 1 | 2 | 1 |

---

#### QA-BROWSER-AUTH-REG-001 — Registrasi UMKM happy path

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Email belum terdaftar |
| **FR/UC** | FR-AUTH-001, UC-AUTH-001 |
| **Test Data** | `qa-umkm-{timestamp}@test.local`, password `Password123!` |

**Langkah:**
1. Buka `/register?role=umkm`
2. Isi: nama, email, password, konfirmasi password, nama usaha, jenis usaha
3. Submit form
4. Cek redirect ke halaman verifikasi email
5. Cek log mail / Mailtrap untuk email verifikasi

**Expected:**
- User role `umkm` terbuat
- Profil UMKM otomatis dibuat
- Email verifikasi terkirim (subject: "Verifikasi Email Akun Collabite")
- Belum bisa akses `/umkm/campaigns/create` sebelum verify

---

#### QA-BROWSER-AUTH-REG-002 — Registrasi Creator happy path

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Email belum terdaftar |
| **FR/UC** | FR-AUTH-002, UC-AUTH-002 |
| **Test Data** | `qa-creator-{timestamp}@test.local` |

**Langkah:**
1. Buka `/register?role=creator`
2. Isi form lengkap (nama, email, password, kontak, pilih kategori & keahlian)
3. Submit

**Expected:**
- User role `creator`, profil dengan `verification_status=Unverified`
- Email verifikasi terkirim

---

#### QA-BROWSER-AUTH-REG-003 — Validasi registrasi (negatif)

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | — |
| **FR/UC** | FR-AUTH-001, FR-AUTH-002 |

**Langkah:**
1. Submit form UMKM dengan email duplikat (`umkm1@collabite.test`)
2. Submit dengan password ≠ konfirmasi password
3. Submit dengan field wajib kosong

**Expected:**
- Pesan error Bahasa Indonesia spesifik per field
- Form retain input yang valid (tidak reset semua)
- Tidak ada user baru terbuat

---

#### QA-BROWSER-AUTH-LOGIN-001 — Login redirect per role

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Akun verified & active |
| **FR/UC** | FR-AUTH-003, FR-AUTH-007, UC-AUTH-003 |

**Langkah:**
1. Login `umkm1@collabite.test` → verifikasi redirect `/umkm/dashboard`
2. Logout → redirect `/login` atau `/`
3. Login `creator1@collabite.test` → `/creator/dashboard`
4. Login `admin@collabite.test` → `/admin/dashboard`

**Expected:**
- Dashboard sesuai role, sidebar navigasi benar
- Session aktif (refresh halaman tetap login)

---

#### QA-BROWSER-AUTH-LOGIN-002 — Login gagal & suspended

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Admin suspend user test |
| **FR/UC** | FR-AUTH-003, FR-AUTH-008, NFR-SECURITY-006 |

**Langkah:**
1. Login dengan password salah → pesan umum "kredensial tidak cocok"
2. Admin suspend akun UMKM test via `/admin/users`
3. Coba login akun suspended

**Expected:**
- Password salah: tidak bocorkan apakah email terdaftar
- Suspended: pesan "akun dinonaktifkan", tidak bisa login

---

#### QA-BROWSER-AUTH-VERIFY-001 — Verifikasi email via link

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | User baru registrasi, belum verified |
| **FR/UC** | FR-AUTH-005, UC-AUTH-005 |

**Langkah:**
1. Ambil URL verifikasi dari log mail
2. Buka URL di browser (satu kali)
3. Coba akses `/umkm/campaigns/create`

**Expected:**
- Email terverifikasi, redirect dashboard
- Middleware `verified` tidak lagi memblokir fitur bisnis

---

#### QA-BROWSER-AUTH-RESET-001 — Reset password end-to-end

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | User verified |
| **FR/UC** | FR-AUTH-006, UC-AUTH-006 |

**Langkah:**
1. Buka `/forgot-password`
2. Isi email valid → submit
3. Ambil link reset dari log mail
4. Set password baru
5. Login dengan password baru

**Expected:**
- Response generik untuk email (tidak enumerasi)
- Password berubah, login sukses
- Email branded Collabite (bukan default Laravel)

---

#### QA-BROWSER-AUTH-SETTINGS-001 — Ubah profil & password settings

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Login verified |
| **FR/UC** | — |

**Langkah:**
1. Buka `/settings/profile` → ubah nama → save
2. Buka `/settings/security` → ubah password

**Expected:**
- Perubahan tersimpan
- Password lama invalid setelah ganti

---

## 6. Role: UMKM

### 6.1 Matriks Modul

| Modul | Route | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| Dashboard | `/umkm/dashboard` | 1 | 1 | 0 |
| Profil Usaha | `/umkm/profile` | 2 | 2 | 1 |
| Produk | `/umkm/products` | 2 | 3 | 1 |
| Campaign | `/umkm/campaigns` | 4 | 4 | 2 |
| Discover Creator | `/umkm/discover` | 2 | 3 | 1 |
| Collaborations | `/umkm/collaborations` | 5 | 4 | 2 |
| Reviews | `/umkm/reviews` | 1 | 1 | 0 |
| Pembayaran | Tab di collaboration show | 2 | 2 | 0 |
| Notifikasi | `/notifications` | 1 | 1 | 0 |

---

#### QA-BROWSER-UMKM-DASH-001 — Dashboard metrics & quick actions

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Login umkm1 |
| **FR/UC** | — |

**Langkah:**
1. Buka `/umkm/dashboard`
2. Verifikasi tile: campaign, kolaborasi, review
3. Klik quick action (Buat Campaign, Cari Creator)

**Expected:**
- Hero personalisasi dengan nama usaha
- Navigasi quick action benar

---

#### QA-BROWSER-UMKM-PROF-001 — Update profil usaha + logo

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login umkm1 verified |
| **FR/UC** | FR-PROFILE-001, UC-PROF-001 |

**Langkah:**
1. Buka `/umkm/profile`
2. Ubah business_name, deskripsi, alamat, kota, kontak
3. Upload logo JPEG < 2MB
4. Save
5. Buka profil publik `/umkm/{id}`

**Expected:**
- Flash sukses
- Logo tampil di profil publik (public disk)
- Field wajib (`business_name`, `business_type`) divalidasi

---

#### QA-BROWSER-UMKM-PROF-002 — Validasi profil (negatif)

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Login umkm1 |
| **FR/UC** | FR-PROFILE-001 |

**Langkah:**
1. Kosongkan business_name → submit
2. Upload logo > 2MB
3. Upload file non-gambar (.pdf)

**Expected:**
- Error validasi Bahasa Indonesia
- Logo lama tidak corrupt jika upload gagal

---

#### QA-BROWSER-UMKM-PROD-001 — CRUD produk

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login umkm1 |
| **FR/UC** | FR-PROFILE-002, UC-PROF-002 |

**Langkah:**
1. Buka `/umkm/products`
2. Tambah produk: nama, deskripsi, harga (opsional), foto
3. Edit produk — ganti nama & foto
4. Hapus produk
5. Verifikasi di profil publik

**Expected:**
- CRUD sukses dengan flash message
- Soft delete: produk hilang dari list & profil publik

---

#### QA-BROWSER-UMKM-CAMP-001 — Buat campaign draft

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login umkm1 verified, profil lengkap |
| **FR/UC** | FR-CAMPAIGN-001, UC-CAMP-001 |

**Langkah:**
1. Buka `/umkm/campaigns/create`
2. Isi: judul, deskripsi, kategori, budget, deadline (≥ besok)
3. Tambah ≥1 deliverable (judul + deskripsi deliverable)
4. Submit

**Expected:**
- Campaign status `Draft`
- Tidak muncul di `/creator/campaigns`
- Redirect ke detail/list campaign

---

#### QA-BROWSER-UMKM-CAMP-002 — Publish campaign

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Campaign draft dengan deliverable |
| **FR/UC** | FR-CAMPAIGN-004, UC-CAMP-004 |

**Langkah:**
1. Buka detail campaign draft
2. Klik "Publikasikan"
3. Login creator1 → cek `/creator/campaigns`

**Expected:**
- Status `Open`, flash "dipublikasikan"
- Campaign visible di browse Creator

---

#### QA-BROWSER-UMKM-CAMP-003 — Edit campaign draft/open

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Campaign draft atau open |
| **FR/UC** | FR-CAMPAIGN-002, UC-CAMP-002 |

**Langkah:**
1. Edit judul, budget, deadline, deliverable
2. Save

**Expected:**
- Perubahan tersimpan
- Campaign `InCollaboration` tidak bisa diedit (tombol disabled / 403)

---

#### QA-BROWSER-UMKM-CAMP-004 — Cancel campaign

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Campaign open tanpa kolaborasi active |
| **FR/UC** | FR-CAMPAIGN-003, UC-CAMP-003, BR-004 |

**Langkah:**
1. Cancel campaign open tanpa kolaborasi → sukses
2. Coba cancel campaign dengan kolaborasi active (umkm2) → ditolak

**Expected:**
- Cancel sukses → status `Cancelled`
- Pending requests auto-reject
- Cancel dengan kolaborasi active: error 422 / tombol disabled

---

#### QA-BROWSER-UMKM-CAMP-005 — Validasi campaign (negatif)

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Login umkm1 |
| **FR/UC** | FR-CAMPAIGN-001 |

**Langkah:**
1. Buat campaign dengan deadline kemarin
2. Publish campaign tanpa deliverable
3. Buat campaign tanpa kategori

**Expected:**
- Validasi gagal dengan pesan jelas
- Tidak ada campaign invalid tersimpan

---

#### QA-BROWSER-UMKM-DISC-001 — Discover & undang creator

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login umkm1, campaign open |
| **FR/UC** | FR-DISCOVERY-001..004, FR-COLLAB-002, UC-DISC-001, UC-COLLAB-002 |

**Langkah:**
1. Buka `/umkm/discover`
2. Search & filter creator
3. Buka profil creator1 → klik "Undang Creator"
4. Pilih campaign open, isi pesan, submit
5. Coba undang duplikat (creator + campaign sama)

**Expected:**
- Invitation `Pending` terbuat
- Duplikat ditolak 422 dengan pesan jelas
- Creator2 menerima undangan (cek di `/creator/requests` sebagai creator2)

---

#### QA-BROWSER-UMKM-COLLAB-001 — Terima pengajuan creator

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Application pending (creator1 → Promo Kopi Baru) |
| **FR/UC** | FR-COLLAB-004, FR-COLLAB-007, UC-COLLAB-004, UC-COLLAB-007, BR-005 |

**Langkah:**
1. Login umkm1 → buka campaign "Promo Kopi Baru"
2. Tab Pengajuan → Accept creator1
3. Verifikasi kolaborasi terbentuk
4. Verifikasi request pending lain auto-reject
5. Verifikasi campaign → `InCollaboration`

**Expected:**
- Collaboration status `Active`
- Hanya satu kolaborasi per campaign (BR-005)
- Request pending lain untuk campaign yang sama → `Rejected`
- Campaign → `InCollaboration`
- Conversation kolaborasi otomatis dibuat
- Redirect ke `/umkm/collaborations/{id}`

---

#### QA-BROWSER-UMKM-COLLAB-002 — Tolak pengajuan

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Application pending |
| **FR/UC** | FR-COLLAB-004, UC-COLLAB-005 |

**Langkah:**
1. Reject pengajuan dengan/alasan opsional
2. Verifikasi status request `Rejected`

**Expected:**
- Tidak terbentuk kolaborasi
- Creator melihat status rejected di `/creator/requests`

---

#### QA-BROWSER-UMKM-COLLAB-003 — Messaging dalam kolaborasi

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Kolaborasi active (umkm2+creator1) |
| **FR/UC** | FR-MSG-001..005, UC-COM-001..004, ADR-009 |

**Langkah:**
1. Buka `/umkm/collaborations/{id}` tab Pesan
2. Kirim pesan teks
3. Kirim pesan dengan attachment (PDF/JPG < 10MB)
4. Tunggu polling refresh (±5–10 detik) atau refresh manual
5. Login creator → verifikasi pesan tampil

**Expected:**
- Pesan tampil kronologis, immutable (tidak ada edit/delete)
- Attachment via signed URL (private disk)
- Polling update pesan Creator (bukan real-time WebSocket)

---

#### QA-BROWSER-UMKM-COLLAB-004 — Request revisi submission

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Submission v1 `InReview` (umkm2+creator1) |
| **FR/UC** | FR-CONTENT-004, UC-CONT-004 |

**Langkah:**
1. Tab Submission → klik "Minta Revisi"
2. Isi catatan revisi (wajib)
3. Submit

**Expected:**
- Status submission → `RevisionRequested`
- Catatan revisi tampil di timeline
- Creator dapat upload versi baru

---

#### QA-BROWSER-UMKM-COLLAB-005 — Approve submission

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Submission `InReview` |
| **FR/UC** | FR-CONTENT-005, UC-CONT-005 |

**Langkah:**
1. Klik "Setujui Konten"
2. Verifikasi tab Pembayaran muncul
3. Verifikasi record payment `pending_proof` (MVP+)

**Expected:**
- Submission → `Approved`
- Tombol "Selesaikan Kolaborasi" **belum** aktif (butuh payment confirmed)
- Payment panel tampil dengan amount = campaign budget

---

#### QA-BROWSER-UMKM-COLLAB-006 — Upload bukti pembayaran

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Submission approved, payment `pending_proof` |
| **FR/UC** | ADR-033, FR-NOTIF-001 (partial) |

**Langkah:**
1. Tab Pembayaran → upload bukti transfer (JPG/PNG/PDF < 5MB)
2. Submit
3. Cek notifikasi creator1 (in-app + email jika queue aktif)

**Expected:**
- Payment status → `awaiting_confirmation`
- Creator menerima notifikasi "Bukti pembayaran diunggah"
- Bukti dapat diunduh via signed URL (Creator view)

---

#### QA-BROWSER-UMKM-COLLAB-007 — Complete kolaborasi (post-payment)

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Payment `confirmed` oleh Creator |
| **FR/UC** | FR-CONTENT-007, UC-CONT-007, ADR-033 |

**Langkah:**
1. Coba complete sebelum Creator confirm → harus gagal
2. Setelah Creator confirm → klik "Selesaikan Kolaborasi"
3. Verifikasi status kolaborasi & campaign

**Expected:**
- Pre-payment: error 422 / tombol disabled
- Post-payment: Collaboration → `Completed`, Campaign → `Completed`
- Form review muncul untuk kedua pihak

---

#### QA-BROWSER-UMKM-COLLAB-008 — Cancel kolaborasi pre-approval

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Kolaborasi active (umkm2+creator1), submission belum `Approved` |
| **FR/UC** | BR-013, UC-COLLAB-011, UC-CONT-009 |

**Langkah:**
1. Klik "Batalkan Kolaborasi"
2. Isi alasan ≥ 10 karakter
3. Submit
4. Verifikasi status campaign "Showcase Koleksi Batik"
5. Coba cancel tanpa alasan

**Expected:**
- Collaboration → `Cancelled`
- Campaign → `Open` (request pending lain **tidak** dipulihkan, BR-005)
- Audit log `collaboration.cancelled` tercatat
- Notifikasi ke Creator: verifikasi actual (FR-NOTIF-001 gap — catat jika absent)
- Tanpa alasan: validasi gagal

---

#### QA-BROWSER-UMKM-COLLAB-009 — Authorization kolaborasi

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login umkm1 |
| **FR/UC** | FR-COLLAB-010, NFR-SECURITY-003 |

**Langkah:**
1. Akses URL `/umkm/collaborations/{id}` milik umkm2

**Expected:**
- HTTP 403 Forbidden

---

#### QA-BROWSER-UMKM-REV-001 — Cegah duplikat review (seed)

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Kolaborasi completed umkm3+creator1 — **review mutual sudah ada di seed** |
| **FR/UC** | FR-REVIEW-001, FR-REVIEW-003, UC-REV-001, UC-REV-003, BR-007 |

**Langkah:**
1. Login umkm3 → buka kolaborasi completed "Launching Skincare Lokal"
2. Verifikasi review UMKM→Creator (rating 5) sudah tampil
3. Coba submit review kedua (jika UI masih expose form)

**Expected:**
- Review existing tampil; form submit disabled atau 409 Conflict
- Rating Creator di profil publik = 5.0 (1 review)
- Untuk uji **submit review baru**, gunakan kolaborasi fresh dari E2E-001 step A12–A13

---

#### QA-BROWSER-UMKM-REV-002 — Lihat review diterima

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | umkm3 dengan review dari creator |
| **FR/UC** | FR-REVIEW-002, UC-REV-002 |

**Langkah:**
1. Buka `/umkm/reviews`
2. Verifikasi review creator → umkm tampil

**Expected:**
- Review hidden admin tidak tampil

---

## 7. Role: Creator

### 7.1 Matriks Modul

| Modul | Route | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| Dashboard | `/creator/dashboard` | 1 | 1 | 0 |
| Profil | `/creator/profile` | 1 | 1 | 0 |
| Keahlian | `/creator/skills` | 1 | 1 | 0 |
| Portofolio | `/creator/portfolio` | 2 | 2 | 1 |
| Verifikasi | `/creator/verification` | 3 | 2 | 0 |
| Browse Campaign | `/creator/campaigns` | 2 | 2 | 1 |
| Requests | `/creator/requests` | 3 | 1 | 0 |
| Collaborations | `/creator/collaborations` | 5 | 3 | 1 |
| Pembayaran | Tab collaboration | 1 | 1 | 0 |

---

#### QA-BROWSER-CR-PROF-001 — Update profil creator

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login creator1 |
| **FR/UC** | FR-PROFILE-003, UC-PROF-003 |

**Langkah:**
1. Buka `/creator/profile`
2. Update bio, kota, kontak publik, foto profil
3. Save → cek profil publik

**Expected:**
- Perubahan tampil di `/creators/{id}`

---

#### QA-BROWSER-CR-SKILL-001 — Kelola keahlian & kategori

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Login creator1 |
| **FR/UC** | FR-PROFILE-004, FR-PROFILE-005, UC-PROF-004, UC-PROF-005 |

**Langkah:**
1. Buka `/creator/skills`
2. Pilih 2+ skill, 1+ kategori
3. Save
4. Hapus 1 skill → save

**Expected:**
- Relasi tersimpan, tampil di profil publik & discover filter

---

#### QA-BROWSER-CR-PORT-001 — CRUD portofolio

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login creator1 |
| **FR/UC** | FR-PROFILE-006, UC-PROF-006 |

**Langkah:**
1. Buka `/creator/portfolio`
2. Tambah item: judul, deskripsi, gambar < 5MB
3. Hapus item

**Expected:**
- Gambar public URL di profil publik
- Upload > 5MB ditolak

---

#### QA-BROWSER-CR-VERIF-001 — Ajukan verifikasi

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login creator baru unverified |
| **FR/UC** | FR-PROFILE-007, UC-VERIF-001 |

**Langkah:**
1. Buka `/creator/verification`
2. Upload KTP (PDF/JPG) + bukti portofolio
3. Submit

**Expected:**
- Status `Pending`
- Tidak bisa double-submit pending
- Dokumen private (tidak accessible via public URL)

---

#### QA-BROWSER-CR-VERIF-002 — Resubmit setelah reject

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | creator3 rejected |
| **FR/UC** | FR-PROFILE-008, UC-VERIF-001 |

**Langkah:**
1. Login creator3
2. Baca alasan reject
3. Upload dokumen baru → submit

**Expected:**
- Status kembali `Pending`
- Alasan reject tampil di UI

---

#### QA-BROWSER-CR-CAMP-001 — Browse & lamar campaign

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login creator1 verified |
| **FR/UC** | FR-CAMPAIGN-006, FR-CAMPAIGN-007, FR-COLLAB-001, UC-CAMP-006, UC-COLLAB-001 |

**Langkah:**
1. Buka `/creator/campaigns`
2. Search/filter campaign open
3. Buka detail "Promo Kopi Baru"
4. Klik "Lamar Campaign Ini" → isi pesan → submit
5. Coba lamar duplikat

**Expected:**
- Hanya campaign `Open` & non-hidden
- Lamaran `Pending`, UI "Anda sudah mengajukan"
- Duplikat 422

---

#### QA-BROWSER-CR-REQ-001 — Kelola permintaan kolaborasi

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | creator2 punya undangan pending ke "Story Kopi Pagi"; creator1 punya lamaran pending (opsional skenario cancel) |
| **FR/UC** | FR-COLLAB-005, FR-COLLAB-006, UC-COLLAB-004..006 |

**Langkah:**
1. Login creator2 → `/creator/requests`
2. Terima undangan → verifikasi kolaborasi active + campaign `InCollaboration`
3. (Skenario terpisah, creator1) Tolak undangan / lamaran via reject
4. (Skenario terpisah, creator1) Batalkan lamaran pending di `/creator/requests`

**Expected:**
- Accept invitation → Collaboration `Active`, Campaign `InCollaboration`, conversation dibuat
- Reject → request `Rejected`; tidak terbentuk kolaborasi
- Cancel application (Creator) → `CancelledByCreator`; UMKM menerima notifikasi in-app
- Cancel invitation (UMKM) → `/umkm/campaigns/{id}` → "Batalkan Undangan" pada undangan pending → `CancelledByUmkm`; Creator menerima notifikasi

---

#### QA-BROWSER-CR-COLLAB-001 — Progress update

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Kolaborasi active |
| **FR/UC** | FR-CONTENT-001, UC-CONT-001 |

**Langkah:**
1. Tab Progres → post update teks
2. Post update dengan attachment opsional

**Expected:**
- Timeline tercatat dengan timestamp
- UMKM melihat update yang sama

---

#### QA-BROWSER-CR-COLLAB-002 — Upload & submit submission v1

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Kolaborasi active |
| **FR/UC** | FR-CONTENT-002, FR-CONTENT-003, UC-CONT-002, UC-CONT-003 |

**Langkah:**
1. Tab Submission → upload file konten (MP4/JPG/PDF)
2. Submit for review

**Expected:**
- Versi v1, status `InReview`
- File private, download via signed URL
- UMKM melihat submission di tab Submission

---

#### QA-BROWSER-CR-COLLAB-003 — Resubmit setelah revisi (v2)

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Submission `RevisionRequested` |
| **FR/UC** | FR-CONTENT-006, UC-CONT-006, BR-006 |

**Langkah:**
1. Upload submission baru
2. Submit for review
3. Verifikasi versi v1 → `Superseded` atau archived

**Expected:**
- Versi naik ke v2
- v2 status `InReview`
- Catatan revisi UMKM terlihat

---

#### QA-BROWSER-CR-COLLAB-004 — Konfirmasi pembayaran

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | UMKM upload bukti, payment `awaiting_confirmation` |
| **FR/UC** | ADR-033 |

**Langkah:**
1. Tab Pembayaran → lihat bukti transfer (signed URL)
2. Klik "Konfirmasi Terima Pembayaran"
3. Verifikasi notifikasi ke UMKM

**Expected:**
- Payment → `confirmed`
- UMKM dapat complete kolaborasi
- Dashboard creator menampilkan pendapatan terkonfirmasi

---

#### QA-BROWSER-CR-COLLAB-005 — Cancel kolaborasi (creator)

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Active, submission belum `Approved` (gunakan umkm2+creator1 seed) |
| **FR/UC** | BR-013, UC-COLLAB-011 |

**Langkah:**
1. Batalkan dengan alasan wajib ≥10 char
2. Verifikasi audit log `collaboration.cancelled`
3. Verifikasi campaign kembali `Open`

**Expected:**
- Collaboration `Cancelled`; Campaign `Open`
- Tidak bisa cancel post-approval (422 — hanya admin force-close, ADR-022)

---

#### QA-BROWSER-CR-REV-001 — Beri review UMKM setelah completed (E2E)

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Kolaborasi **baru** completed via E2E-001 (A12); Creator belum memberi review |
| **FR/UC** | FR-REVIEW-002, UC-REV-001, BR-007 |

**Langkah:**
1. Login Creator pihak E2E → buka kolaborasi completed
2. Beri rating 1–5 + review ke UMKM
3. Coba submit review kedua

**Expected:**
- Review tersimpan, tampil di profil publik UMKM
- Review kedua ditolak (409 / UI disabled)
- **Jangan** gunakan seed umkm3+creator1 (review Creator→UMKM sudah ada)

---

## 8. Role: Admin

### 8.1 Matriks Modul

| Modul | Route | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| Dashboard | `/admin/dashboard` | 1 | 0 | 0 |
| Users | `/admin/users` | 2 | 1 | 0 |
| Verifications | `/admin/verifications` | 3 | 1 | 0 |
| Moderation | `/admin/moderation/*` | 2 | 3 | 0 |
| Collaborations | `/admin/collaborations` | 2 | 1 | 0 |
| Audit Logs | `/admin/audit-logs` | 1 | 1 | 0 |
| Reports | `/admin/reports` | 1 | 2 | 0 |

---

#### QA-BROWSER-ADM-DASH-001 — Dashboard statistik

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login admin |
| **FR/UC** | FR-ADMIN-001, UC-ADMIN-002 |

**Langkah:**
1. Buka `/admin/dashboard`
2. Verifikasi tile: users, campaigns, collaborations, verifications pending

**Expected:**
- Angka konsisten dengan data seed
- Layout admin berbeda dari marketplace (ADR-031)

---

#### QA-BROWSER-ADM-USER-001 — Suspend & activate user

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Login admin |
| **FR/UC** | FR-AUTH-008, FR-ADMIN-003, UC-ADMIN-001 |

**Langkah:**
1. Buka `/admin/users`
2. Suspend akun UMKM test
3. Verifikasi user tidak bisa login
4. Activate kembali
5. Coba suspend akun admin sendiri

**Expected:**
- Status toggle sukses + audit log
- Self-suspend ditolak dengan pesan error

---

#### QA-BROWSER-ADM-VERIF-001 — Approve verifikasi creator

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | creator2 pending |
| **FR/UC** | FR-PROFILE-008, UC-VERIF-002, UC-ADMIN-004 |

**Langkah:**
1. Buka `/admin/verifications`
2. Buka detail creator2
3. Review dokumen (signed URL)
4. Klik "Setujui"

**Expected:**
- Creator2 → `Verified`
- Muncul di discover dengan badge verified
- Tombol ajukan verifikasi hilang di sisi Creator

---

#### QA-BROWSER-ADM-VERIF-002 — Reject verifikasi dengan alasan

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Creator pending |
| **FR/UC** | FR-PROFILE-008 |

**Langkah:**
1. Reject dengan alasan < 5 char → gagal
2. Reject dengan alasan valid (≥ 5 char)

**Expected:**
- Validasi alasan
- Creator melihat alasan, dapat resubmit

---

#### QA-BROWSER-ADM-MOD-001 — Moderasi campaign hide/unhide

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Login admin |
| **FR/UC** | FR-ADMIN-005, UC-ADMIN-005 |

**Langkah:**
1. Buka `/admin/moderation/campaigns`
2. Hide campaign open
3. Verifikasi campaign hilang dari browse Creator
4. Unhide

**Expected:**
- `is_hidden` toggled
- Audit log tercatat

---

#### QA-BROWSER-ADM-MOD-002 — Moderasi content & review

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Submission & review exists |
| **FR/UC** | FR-ADMIN-006, FR-ADMIN-007, FR-REVIEW-005 |

**Langkah:**
1. Hide submission via `/admin/moderation/content`
2. Hide review via `/admin/moderation/reviews`
3. Verifikasi tidak tampil di profil publik

**Expected:**
- Hidden content/review excluded from public view

---

#### QA-BROWSER-ADM-COLLAB-001 — Force-close kolaborasi

| Field | Nilai |
| --- | --- |
| **Prioritas** | P0 |
| **Precondition** | Kolaborasi active — gunakan umkm2+creator1 (post-approval: approve submission dulu) atau collab fresh |
| **FR/UC** | ADR-022, UC-ADMIN-010, UC-COLLAB-011 |

**Langkah:**
1. Buka `/admin/collaborations/{id}`
2. Force-close dengan alasan ≥ 10 char
3. Verifikasi status kolaborasi, campaign, notifikasi UMKM & Creator
4. Coba force-close kolaborasi completed (umkm3) → gagal

**Expected:**
- Collaboration → `Cancelled`
- Campaign terkait → `Open` (bukan `Completed` atau `Cancelled`)
- Audit `collaboration.force_closed`
- Notifikasi in-app + email ke kedua pihak (`CollaborationForceClosedNotification`)
- Completed collab: 422

---

#### QA-BROWSER-ADM-AUDIT-001 — Audit log append-only

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Aksi admin/cancel sudah dilakukan |
| **FR/UC** | FR-AUDIT-001, FR-AUDIT-002, UC-AUDIT-001, BR-009 |

**Langkah:**
1. Buka `/admin/audit-logs`
2. Filter by action type
3. Verifikasi tidak ada tombol edit/delete

**Expected:**
- Log append-only dengan actor, action, timestamp, metadata

---

#### QA-BROWSER-ADM-REPORT-001 — Export laporan CSV

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Login admin |
| **FR/UC** | FR-AUDIT-003, FR-AUDIT-004, UC-ADMIN-008 |

**Langkah:**
1. Buka `/admin/reports`
2. Export: users, campaigns, collaborations, reviews
3. Buka CSV di spreadsheet

**Expected:**
- Download `text/csv`, filename `collabite_{type}_YYYYMMDD_HHMMSS.csv`
- Header & data valid

---

## 9. Alur End-to-End Cross-Role (Happy Path)

> **Referensi utama:** §3.6 (swimlane). Test case di bawah adalah checklist eksekusi E2E; urutan langkah **harus** mengikuti gate bisnis (termasuk payment ADR-033).

### 9.1 E2E-001 — Application Flow (Creator → UMKM)

| Step | Aktor | Aksi | Expected State |
| --- | --- | --- | --- |
| 1 | UMKM | Buat & publish campaign | Campaign `Open` |
| 2 | Creator | Lamar campaign | Request `Pending` (application) |
| 3 | UMKM | Accept pengajuan | Collab `Active`; Campaign `InCollaboration`; pending lain `Rejected`; conversation dibuat |
| 4 | Creator | Progress update + upload v1 + submit review | Submission `InReview` |
| 5 | UMKM | Minta revisi | `RevisionRequested` |
| 6 | Creator | Upload v2 + submit | v2 `InReview`; v1 `Superseded` |
| 7 | UMKM | Approve | `Approved`; Payment `pending_proof` |
| 8 | UMKM | Upload bukti bayar | Payment `awaiting_confirmation` |
| 9 | Creator | Konfirmasi terima | Payment `confirmed` |
| 10 | UMKM | Complete kolaborasi | Collab `Completed`; Campaign `Completed` |
| 11 | UMKM | Review Creator (1×) | Review tersimpan |
| 12 | Creator | Review UMKM (1×) | Review tersimpan |
| 13 | Guest | Lihat profil Creator & UMKM | Rating/review tampil |

**Prioritas:** P0  
**Traceability:** §3.6 Jalur A, FR-COLLAB-001..011, FR-CONTENT-001..008, FR-REVIEW-001..003, ADR-033

---

### 9.2 E2E-002 — Invitation Flow (UMKM → Creator)

| Step | Aktor | Aksi | Expected State |
| --- | --- | --- | --- |
| 1 | UMKM | Publish campaign | `Open` |
| 2 | UMKM | Discover → undang Creator | Request `Pending` (invitation) |
| 3 | Creator | Accept di `/creator/requests` | Collab `Active`; Campaign `InCollaboration` |
| 4–13 | (sama E2E-001 step 4–13) | — | — |

**Prioritas:** P0  
**Traceability:** §3.6 Jalur B

---

### 9.3 E2E-003 — Verifikasi Creator Full Cycle

| Step | Aktor | Aksi | Expected |
| --- | --- | --- | --- |
| 1 | Creator | Registrasi + lengkapi profil/portofolio | `Unverified` |
| 2 | Creator | Submit verifikasi | `Pending` |
| 3 | Admin | Approve | `Verified` |
| 4 | Guest | Cari di `/creators` | Badge verified, ranking/filter |

**Catatan:** Creator unverified tetap bisa kolaborasi (BR-003); verifikasi mempengaruhi label/ranking, bukan gate kolaborasi.

**Prioritas:** P0  
**Traceability:** §3.6 Jalur C

---

### 9.4 E2E-004 — Admin Intervention

| Step | Aktor | Aksi | Expected |
| --- | --- | --- | --- |
| 1 | UMKM+Creator | Kolaborasi active post-approval (approve submission) | Submission `Approved`; payment `pending_proof` |
| 2 | Admin | Force-close dengan alasan | Collab `Cancelled`; Campaign `Open`; audit + notif force-close |
| 3 | Admin | Suspend Creator | Login ditolak |
| 4 | Admin | Hide review toxic | Tidak tampil publik |

**Prioritas:** P1  
**Traceability:** §3.6 Jalur D

---

## 10. Skenario Negatif, Validasi & Edge Case

### 10.1 Authorization Matrix (P0)

| QA ID | Aktor | Aksi | Target | Expected |
| --- | --- | --- | --- | --- |
| QA-BROWSER-SEC-AUTH-001 | Creator | Edit profil UMKM | `/umkm/profile` | 403 |
| QA-BROWSER-SEC-AUTH-002 | UMKM | Approve submission | Kolaborasi orang lain | 403 |
| QA-BROWSER-SEC-AUTH-003 | Creator | Complete kolaborasi | Own collab | 403 (hanya UMKM) |
| QA-BROWSER-SEC-AUTH-004 | UMKM | Confirm payment | Own collab | 403 (hanya Creator) |
| QA-BROWSER-SEC-AUTH-005 | UMKM | Force-close | `/admin/collaborations/*/force-close` | 403 |
| QA-BROWSER-SEC-AUTH-006 | Guest | Download private file | `/files/private/{path}` tanpa signature | 403/401 |
| QA-BROWSER-SEC-AUTH-007 | Any | View notification orang lain | `/notifications/{id}` | 403 |

---

### 10.2 State Transition Invalid (P1)

| QA ID | Kondisi | Aksi | Expected |
| --- | --- | --- | --- |
| QA-BROWSER-SEC-STATE-001 | Submission `Draft` | UMKM approve | 422 |
| QA-BROWSER-SEC-STATE-002 | Submission `Approved` | UMKM request revision | 422 |
| QA-BROWSER-SEC-STATE-003 | Collaboration `Completed` | Kirim pesan | 422 / UI disabled |
| QA-BROWSER-SEC-STATE-004 | Campaign `Draft` | Creator apply | 422 |
| QA-BROWSER-SEC-STATE-005 | Campaign `InCollaboration` | UMKM cancel campaign | 422 / tombol disabled |
| QA-BROWSER-SEC-STATE-006 | Payment not `confirmed` | UMKM complete | 422 |
| QA-BROWSER-SEC-STATE-007 | Review sudah ada | Submit review lagi | 409 |
| QA-BROWSER-SEC-STATE-008 | Submission `Approved` | UMKM/Creator cancel collab | 422 (hanya admin force-close) |
| QA-BROWSER-SEC-STATE-009 | Collab `Cancelled` (force-close) | Campaign status | `Open` (bukan `InCollaboration`) |

---

### 10.3 Validasi Form (P1)

| QA ID | Form | Input Invalid | Expected |
| --- | --- | --- | --- |
| QA-BROWSER-SEC-VAL-001 | Campaign create | deadline kemarin | Error deadline |
| QA-BROWSER-SEC-VAL-002 | Campaign publish | 0 deliverable | Error |
| QA-BROWSER-SEC-VAL-003 | Cancel collab | alasan < 10 char | Error |
| QA-BROWSER-SEC-VAL-004 | Review | rating 0 atau 6 | Error |
| QA-BROWSER-SEC-VAL-005 | Verification reject | alasan < 5 char | Error |
| QA-BROWSER-SEC-VAL-006 | Payment proof | file > limit | Error ukuran |

---

### 10.4 Business Rules (P1)

| QA ID | Rule | Test | Expected |
| --- | --- | --- | --- |
| QA-BROWSER-SEC-BR-001 | BR-005 | 2 pending requests, accept 1 | Lainnya auto-reject |
| QA-BROWSER-SEC-BR-002 | BR-003 | Creator unverified kolaborasi | Tetap bisa kolaborasi; label di discover |
| QA-BROWSER-SEC-BR-003 | BR-011 | Edit/hapus pesan | Tidak ada UI aksi |
| QA-BROWSER-SEC-BR-004 | BR-012 | Pesan setelah completed | Ditolak |
| QA-BROWSER-SEC-BR-005 | BR-001 | Register admin via UI | Tidak tersedia (admin via seeder) |
| QA-BROWSER-SEC-BR-006 | BR-007 | Review duplikat (seed umkm3) | 409 / UI disabled |
| QA-BROWSER-SEC-BR-007 | BR-013 | Cancel post-approval oleh pihak | 422; admin force-close OK |
| QA-BROWSER-SEC-BR-008 | ADR-033 | Complete tanpa payment confirmed | 422 meskipun submission Approved |

---

## 11. Pengujian Alur Pembayaran Manual (MVP+)

> **Referensi:** ADR-033, [FLOW_UMKM.md](./FLOW_UMKM.md) § Pembayaran, [FLOW_CREATOR.md](./FLOW_CREATOR.md) § Pembayaran

### 11.1 Checklist Pembayaran

| # | QA ID | Langkah | Expected | P |
| --- | --- | --- | --- | --- |
| 1 | QA-BROWSER-PAY-001 | Approve submission | Payment record auto-create, status `pending_proof`, amount = budget campaign | P0 |
| 2 | QA-BROWSER-PAY-002 | UMKM upload bukti JPG valid | → `awaiting_confirmation`, file di private disk | P0 |
| 3 | QA-BROWSER-PAY-003 | Creator lihat & unduh bukti | Signed URL valid ≤ 30 menit | P0 |
| 4 | QA-BROWSER-PAY-004 | Creator konfirmasi | → `confirmed`, notif UMKM | P0 |
| 5 | QA-BROWSER-PAY-005 | UMKM complete | Collaboration `Completed` hanya setelah confirmed | P0 |
| 6 | QA-BROWSER-PAY-006 | Creator confirm sebelum bukti | 422 | P1 |
| 7 | QA-BROWSER-PAY-007 | UMKM re-upload bukti | Replace/update sesuai implementasi | P1 |
| 8 | QA-BROWSER-PAY-008 | Dashboard creator pendapatan | Sum payment confirmed tampil | P2 |

### 11.2 File Bukti Transfer

| Valid | Invalid |
| --- | --- |
| JPEG, PNG, PDF ≤ 5MB | > 5MB, .exe, .zip |

---

## 12. Checklist Notifikasi & Email

### 12.1 Notifikasi In-App (`/notifications`)

| Event | Penerima | Implemented? | QA ID | Channel |
| --- | --- | --- | --- | --- |
| Verifikasi email | User baru | ✅ | QA-BROWSER-NOTIF-001 | mail only |
| Reset password | User | ✅ | QA-BROWSER-NOTIF-002 | mail only |
| Bukti pembayaran diunggah | Creator | ✅ | QA-BROWSER-NOTIF-003 | database + mail |
| Pembayaran dikonfirmasi | UMKM | ✅ | QA-BROWSER-NOTIF-004 | database + mail |
| Kolaborasi force-close | UMKM + Creator | ✅ | QA-BROWSER-NOTIF-005 | database + mail |
| Application/invitation baru | UMKM/Creator | ⚠️ **Gap** | QA-BROWSER-NOTIF-006 | FR-NOTIF-001 — verifikasi UI polling/banner |
| Pesan baru | UMKM/Creator | ⚠️ **Gap** | QA-BROWSER-NOTIF-007 | polling messages, notif mungkin absent |
| Submission for review | UMKM | ⚠️ **Gap** | QA-BROWSER-NOTIF-008 | — |
| Revision requested | Creator | ⚠️ **Gap** | QA-BROWSER-NOTIF-009 | — |

> **Instruksi QA:** Untuk event bertanda Gap, dokumentasikan actual behavior. Jika notifikasi tidak muncul, catat sebagai defect dengan referensi FR-NOTIF-001.

### 12.2 Verifikasi Email (Checklist)

- [ ] Subject branded: "Verifikasi Email Akun Collabite"
- [ ] Logo Collabite (bukan logo Laravel default)
- [ ] Link verifikasi one-time valid
- [ ] Email reset password: subject "Reset Password Collabite"
- [ ] Payment emails queued (perlu `queue:work`)
- [ ] "Tandai semua dibaca" di `/notifications` berfungsi
- [ ] Klik notifikasi → mark as read + redirect ke action URL

---

## 13. Pengujian Upload File & Akses

### 13.1 Matriks Disk

| Jenis | Disk | Akses Publik | QA ID |
| --- | --- | --- | --- |
| Logo UMKM | public | ✅ URL `/storage/...` | QA-BROWSER-FILE-001 |
| Foto produk | public | ✅ | QA-BROWSER-FILE-002 |
| Portofolio creator | public | ✅ | QA-BROWSER-FILE-003 |
| Dokumen verifikasi | private | ❌ signed URL only | QA-BROWSER-FILE-004 |
| Lampiran pesan | private | ❌ signed URL only | QA-BROWSER-FILE-005 |
| Submission konten | private | ❌ signed URL only | QA-BROWSER-FILE-006 |
| Bukti pembayaran | private | ❌ signed URL only | QA-BROWSER-FILE-007 |

### 13.2 Test Case File Akses

#### QA-BROWSER-FILE-SEC-001 — Signed URL expiry

| Field | Nilai |
| --- | --- |
| **Prioritas** | P1 |
| **Precondition** | Punya signed URL submission |

**Langkah:**
1. Buka signed URL valid → file terunduh
2. Tunggu > 30 menit (atau manipulasi TTL di test env)
3. Buka URL yang sama

**Expected:**
- Valid: HTTP 200, file content correct
- Expired: HTTP 403

---

#### QA-BROWSER-FILE-SEC-002 — Direct private path blocked

**Langkah:**
1. Inspect network → copy path private file
2. Akses `/files/private/{path}` tanpa valid signature

**Expected:** 403 Forbidden

---

### 13.3 Validasi Ukuran (Sample)

| Upload | Max | QA Test |
| --- | --- | --- |
| Logo | 2MB | Upload 3MB → reject |
| Portofolio image | 5MB | Upload 6MB → reject |
| Message attachment | 10MB | Upload 11MB → reject |
| Submission | 100MB | Upload oversize → reject (P2, gunakan file dummy) |

---

## 14. Accessibility & Responsive Smoke

> Lightweight smoke — bukan audit WCAG penuh.

### 14.1 Accessibility (P2)

| QA ID | Check | Expected |
| --- | --- | --- |
| QA-BROWSER-A11Y-001 | Semua input form punya `<label>` atau `aria-label` | PASS di halaman auth, campaign form, profile |
| QA-BROWSER-A11Y-002 | Focus visible pada navigasi keyboard (Tab) | Focus ring terlihat |
| QA-BROWSER-A11Y-003 | Error form diumumkan | Error summary banner tampil |
| QA-BROWSER-A11Y-004 | Kontras teks utama | Readable (manual check) |
| QA-BROWSER-A11Y-005 | Tombol icon punya accessible name | Sidebar, table actions |

### 14.2 Responsive Smoke (P2)

| QA ID | Viewport | Halaman | Expected |
| --- | --- | --- | --- |
| QA-BROWSER-RESP-001 | 390px | `/`, `/login` | Layout tidak overflow horizontal |
| QA-BROWSER-RESP-002 | 390px | `/umkm/collaborations/{id}` | Tabs accessible, message form usable |
| QA-BROWSER-RESP-003 | 768px | `/creator/campaigns` | Filter collapsible |
| QA-BROWSER-RESP-004 | 390px | Admin dashboard | Sidebar → sheet/drawer |

---

## 15. Regression Checklist Pre-Pilot Sign-Off

Jalankan **seluruh P0** + checklist regresi ini sebelum pilot:

### 15.1 Critical Path Regression

- [ ] Login/logout ketiga role
- [ ] Registrasi + verifikasi email (1 UMKM, 1 Creator fresh)
- [ ] UMKM: create → publish → accept application
- [ ] Creator: submit → revision → approve → **payment upload → creator confirm** → complete
- [ ] Review mutual tampil publik (gunakan E2E fresh, bukan seed umkm3)
- [ ] Admin: approve verification + suspend user
- [ ] Admin: export CSV reports
- [ ] Flash messages tampil setelah form submit (campaign publish, profile update)
- [ ] Pagination list pages (campaigns, collaborations, admin users)
- [ ] Tidak ada halaman blank (regresi DEF-BROWSER-001..003)

### 15.2 Automated Test Baseline (Referensi)

Sebelum sign-off, konfirmasi engineer menjalankan:

```bash
vendor/bin/pint --dirty
vendor/bin/phpstan analyse
php artisan test --compact
npm run build
```

Target: semua test hijau (baseline RC: 174+ Pest, 59+ Vitest).

### 15.3 Environment Parity

- [ ] Staging MySQL 8.x (jika pilot di staging) — ADR-029 checklist
- [ ] Queue worker production/staging aktif
- [ ] HTTPS valid
- [ ] Mail sandbox configured

---

## 16. Template Pelaporan Defect

Salin template ini ke [DEFECTS.md](./DEFECTS.md) atau tool tracking (Jira/Linear):

```markdown
### DEF-XXXX — [Judul singkat]

| Field | Nilai |
| --- | --- |
| **QA Test ID** | QA-BROWSER-XXX-XXX |
| **Severity** | Blocker / Critical / High / Medium / Low |
| **Priority** | P0 / P1 / P2 |
| **Role** | UMKM / Creator / Admin / Public |
| **Environment** | local / staging |
| **Browser** | Chrome 138 / Firefox 140 / ... |
| **FR/UC** | FR-XXX, UC-XXX |
| **Reporter** | [Nama QA] |
| **Date** | YYYY-MM-DD |

**Precondition:**
- ...

**Steps to Reproduce:**
1. ...
2. ...

**Expected Result:**
- ...

**Actual Result:**
- ...

**Evidence:**
- Screenshot: [link]
- Console error: [paste]
- Network: [request URL + status]

**Workaround:** (jika ada)

**Notes:**
- ...
```

### 16.1 Severity Mapping

| Severity | Kriteria Pilot |
| --- | --- |
| Blocker | Tidak bisa login, DB error, halaman blank massal |
| Critical | Alur E2E terputus, data corruption, security hole |
| High | Fitur P0 gagal tanpa workaround |
| Medium | P1 gagal, ada workaround |
| Low | Kosmetik, typo |

---

## 17. Kriteria Go / No-Go Pilot

### 17.1 GO — Pilot Boleh Dimulai

Semua kriteria berikut **harus** terpenuhi:

| # | Kriteria | Bukti |
| --- | --- | --- |
| 1 | 100% test case **P0** PASS | Test execution log |
| 2 | ≥ 95% test case **P1** PASS | Test execution log |
| 3 | E2E-001 dan E2E-002 lulus end-to-end di browser | Screenshot + timestamp |
| 4 | Alur pembayaran manual (§11) lulus | QA-BROWSER-PAY-001..005 PASS |
| 5 | Zero defect **Blocker** atau **Critical** terbuka | DEFECTS.md |
| 6 | Zero defect **High** terbuka pada alur kolaborasi | DEFECTS.md |
| 7 | Automated test suite hijau di branch release | CI log |
| 8 | Akun pilot/production seed siap (bukan password demo) | Ops checklist |
| 9 | Queue worker & mail configured di environment pilot | STAGING_CHECKLIST §5–7 |
| 10 | Backup & rollback procedure documented | DEPLOYMENT.md, ROLLBACK.md |

### 17.2 NO-GO — Pilot Ditunda

Pilot **wajib ditunda** jika salah satu terjadi:

- Alur E2E kolaborasi tidak dapat diselesaikan oleh UMKM dan Creator
- Pembayaran manual blocking completion (ADR-033) gagal
- Halaman utama (dashboard, collaboration workspace) blank/error
- Authorization leak (akses data user lain)
- Private file accessible tanpa signed URL
- > 3 defect High terbuka pada modul yang sama

### 17.3 Conditional GO

Pilot boleh dimulai dengan **known issues** terdokumentasi jika:

- Issue hanya P2 (responsive/a11y minor)
- FR-NOTIF-001 gaps (notifikasi kolaborasi) — dengan komunikasi ke pilot user bahwa notifikasi terbatas pada payment & admin actions
- Mitigasi/workaround jelas di brief pilot

---

## 18. Lampiran

### 18.1 Route Reference (106 routes)

| Prefix | Contoh Route |
| --- | --- |
| Public | `/`, `/creators`, `/creators/{id}`, `/umkm/{id}` |
| Auth | `/login`, `/register`, `/register?role=umkm`, `/forgot-password` |
| UMKM | `/umkm/dashboard`, `/umkm/campaigns`, `/umkm/collaborations/{id}` |
| Creator | `/creator/dashboard`, `/creator/campaigns`, `/creator/requests`, `/creator/collaborations/{id}` |
| Admin | `/admin/dashboard`, `/admin/verifications`, `/admin/moderation/campaigns` |
| Shared | `/notifications`, `/settings/profile`, `/files/private/{path}` |

Jalankan `php artisan route:list --except-vendor` untuk daftar lengkap.

### 18.2 Traceability Matrix (Ringkas)

| Modul PRD §9 | FR Range | UC Range | QA Section |
| --- | --- | --- | --- |
| Auth & Role | FR-AUTH-* | UC-AUTH-* | §5 |
| Profil | FR-PROFILE-* | UC-PROF-* | §6, §7 |
| Verifikasi | FR-PROFILE-007/008 | UC-VERIF-* | §7, §8 |
| Campaign | FR-CAMPAIGN-* | UC-CAMP-* | §6, §7 |
| Discovery | FR-DISCOVERY-* | UC-DISC-* | §4, §6 |
| Collaboration | FR-COLLAB-* | UC-COLLAB-* | §6, §7, §9 |
| Messaging | FR-MSG-* | UC-COM-* | §6. QA-BROWSER-UMKM-COLLAB-003 |
| Content | FR-CONTENT-* | UC-CONT-* | §6, §7 |
| Review | FR-REVIEW-* | UC-REV-* | §6, §7, §8 |
| Admin | FR-ADMIN-* | UC-ADMIN-* | §8 |
| Notifikasi | FR-NOTIF-* | UC-NOTIF-* | §12 |
| Audit/Report | FR-AUDIT-* | UC-AUDIT-* | §8 |
| Payment MVP+ | ADR-033 | — | §11 |

### 18.3 Known Gaps: Dokumentasi vs Implementasi

| # | Gap | Dampak QA | Rekomendasi |
| --- | --- | --- | --- |
| 1 | [UAT.md](./UAT.md) vs [DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md) — email berbeda | Tester salah akun | **Gunakan DEMO_ACCOUNTS.md** |
| 2 | FR-NOTIF-001 — notifikasi kolaborasi (apply, message, submission) belum fully implemented | Notifikasi in-app terbatas | Catat actual; conditional GO §17.3 |
| 3 | Pembayaran manual (ADR-033) opsional; **nonaktif default pilot** | Skip §11 kecuali env=true | Bukan payment gateway (ADR-011) |
| 4 | PRD §8 non-goals payment gateway vs ADR-033 manual proof | Bukan konflik — manual bukan gateway | Test manual flow only |
| 5 | ADR-029 SQLite lokal vs MySQL staging | Retest di staging sebelum prod pilot | STAGING_CHECKLIST |
| 6 | Messaging polling (ADR-009), bukan WebSocket | Delay 5–10s normal | Jangan laporkan sebagai bug |
| 7 | ~~UC-CONT-007 / TDD §15.4 gate payment~~ | **Ditutup v1.2** — USE_CASE & TDD diperbarui | Ikuti §3.5/§11 |
| 8 | ~~UC-COLLAB-011 notif cancel~~ | **Ditutup v1.2** — `CollaborationCancelledNotification` | Uji notif in-app + email |
| 9 | ~~Demo seed completed tanpa payment~~ | **Ditutup v1.2** — seed punya `collaboration_payments` confirmed | Bisa uji payment state di umkm3 completed |
| 10 | **UC-CONT-009 vs UC-COLLAB-011** — duplikasi use case cancel | Sama semantik | QA trace ke keduanya |
| 11 | ~~CancelledByUmkm route absent~~ | **Ditutup v1.2** — `CancelInvitationAction` + UI campaign show | Uji P0 cancel undangan |

### 18.4 Test Execution Log (Template)

| QA ID | Tester | Date | Browser | Result | Defect ID | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| QA-BROWSER-UMKM-CAMP-001 | | | Chrome | PASS/FAIL | | |
| ... | | | | | | |

---

## 19. Riwayat Dokumen

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 1.0 | 2026-07-05 | Rilis awal QA Browser Test Plan pre-pilot | Agent / QA Lead |
| 1.1 | 2026-07-05 | Verifikasi ulang alur bisnis: swimlane §3.6, perbaikan state transition (campaign revert Open, payment gate, role boundaries), prekondisi seed/demo, force-close vs cancel, review duplikat | Agent / QA Lead |
| 1.2 | 2026-07-05 | Gap implementasi ditutup: notif cancel kolaborasi, cancel undangan UMKM, seed payment confirmed, USE_CASE/TDD payment gate | Agent / QA Lead |
