# Product Requirements Document (PRD) — Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai acuan implementasi M0–M7.

---

## 1. Identitas Produk

| Atribut | Nilai |
| --- | --- |
| Nama produk | **Collabite** |
| Tagline (sementara) | "Temukan Creator. Jalankan Campaign. Selesaikan Kolaborasi." |
| Tipe aplikasi | Web app (Laravel monolith + Inertia.js + React) |
| Pasar awal | UMKM lokal (Indonesia) dan Content Creator independen |
| Model monetisasi (pasca-MVP) | Subscription / take-rate (bukan bagian MVP) |

---

## 2. Ringkasan Produk

Collabite mempertemukan UMKM dengan Content Creator untuk menjalankan campaign promosi berbasis konten. Platform menyediakan dua fungsi utama:

1. **Marketplace** — direktori Creator dan campaign, lengkap dengan pencarian, filter, dan profil publik.
2. **Workspace** — tempat UMKM dan Creator berkolaborasi secara terstruktur dari invitas, pengerjaan, revisi, hingga penyelesaian dan review.

---

## 3. Latar Belakang Masalah

| Masalah | Dampak |
| --- | --- |
| UMKM kesulitan menemukan Creator yang relevan dan tepercaya. | UMKM sering bertransaksi via chat acak, rawan penipuan, sulit verifikasi portofolio. |
| Creator kesulitan menemukan UMKM dengan brief yang jelas. | Creator menerima tawaran informal tanpa kejelasan budget, deadline, dan deliverable. |
| Tidak ada alur kolaborasi yang terstruktur. | Proyek berantakan, revisi tidak terdokumentasi, pembayaran informal. |
| Tidak ada rekam jejak kolaborasi sebelumnya. | Sulit menilai reputasi Creator atau UMKM baru. |

---

## 4. Nilai Utama Collabite

1. **Discovery terstruktur** — pencarian Creator dan campaign dengan filter kategori, rating, portofolio.
2. **Brief yang jelas** — UMKM menulis campaign dengan judul, deskripsi, budget, deadline, dan deliverable.
3. **Alur kolaborasi yang terdokumentasi** — setiap perubahan status, progres, dan revisi tercatat.
4. **Reputasi terukur** — rating dan review dua arah setelah kolaborasi selesai.
5. **Verifikasi Creator** — admin memverifikasi identitas dan portofolio Creator sebelum muncul di marketplace.

---

## 5. Target Pengguna

Collabite melayani tiga aktor:

1. **UMKM** — pemilik usaha kecil/menengah yang ingin menjalankan promosi berbasis konten.
2. **Content Creator** — individu/kreator yang menawarkan jasa pembuatan konten (foto, video, copywriting).
3. **Admin** — tim internal Collabite yang mengelola verifikasi, moderasi, dan operasional platform.

---

## 6. Persona

### 6.1 Persona UMKM

| Atribut | Detail |
| --- | --- |
| Nama | **Bu Sari (Pemilik Kedai Kopi Lokal)** |
| Latar belakang | Mengelola usaha F&B dengan 2 cabang, promosi dilakukan secara organik via Instagram pribadi. |
| Tujuan | Menjalankan campaign konten untuk produk baru, menjangkau audiens lokal. |
| Frustrasi | Sulit menemukan Creator makanan/lifestyle yang kredibel di kotanya, sering tertipu Creator abal-abal. |
| Kebutuhan utama | Cari Creator, lihat portofolio, kelola brief, pantau progres, beri approval, beri rating. |

### 6.2 Persona Creator

| Atribut | Detail |
| --- | --- |
| Nama | **Andi (Freelance Content Creator)** |
| Latar belakang | Lulusan DKV, freelance 2 tahun, portofolio konten food & lifestyle di Instagram. |
| Tujuan | Mendapatkan proyek tetap dengan brief yang jelas dan bayaran yang layak. |
| Frustrasi | Brief UMKM tidak jelas, komunikasi berantakan, tidak ada rekam jejak portofolio resmi. |
| Kebutuhan utama | Profil yang menampilkan keahlian, portofolio, kategori; temukan campaign; ajukan kolaborasi; unggah konten; revisi; rating. |

### 6.3 Persona Admin

| Atribut | Detail |
| --- | --- |
| Nama | **Rina (Moderator Collabite)** |
| Latar belakang | Tim operasional internal Collabite. |
| Tujuan | Menjaga kualitas Creator, memoderasi konten/review, menanggapi laporan. |
| Kebutuhan utama | Dashboard operasional, antrian verifikasi, moderasi campaign/konten/review, statistik. |

---

## 7. Tujuan MVP

1. UMKM dapat membuat campaign, memilih Creator, menjalankan kolaborasi, dan memberi rating dalam satu platform.
2. Creator dapat mempublikasikan profil + portofolio, mengajukan atau menerima kolaborasi, mengunggah konten, dan menerima rating.
3. Admin dapat memverifikasi Creator serta memoderasi campaign/konten/review.
4. Alur kolaborasi memiliki jejak audit (status, progres, revisi) yang dapat ditelusuri.

---

## 8. Non-Goals (di luar MVP)

- Payment gateway / escrow.
- Subscription / billing.
- AI Creator recommendation.
- Publikasi otomatis ke Instagram / TikTok.
- Video call.
- Native mobile application.
- WebSocket real-time / push notification FCM.
- GraphQL.
- Microservices.
- Elasticsearch.
- Kontrak elektronik.
- Sistem dispute kompleks.
- Analitik media sosial otomatis.

Daftar di atas tidak boleh muncul di backlog MVP tanpa perubahan PRD.

---

## 9. Scope MVP

Lingkup MVP mencakup:

1. Authentication & role (UMKM, Creator, Admin).
2. Profil UMKM (usaha, produk/jasa).
3. Profil Creator (data diri, kontak, keahlian, kategori, portofolio).
4. Verifikasi Creator (admin review).
5. Category & skill (katalog, dikelola admin melalui seeder/MVP admin).
6. Campaign management (CRUD + publish + cancel).
7. Creator discovery (search, filter, detail, portofolio).
8. Campaign discovery untuk Creator.
9. Collaboration request: application (Creator → Campaign) & invitation (UMKM → Creator).
10. Collaboration management (status, peserta, timeline).
11. Messaging sederhana dalam kolaborasi.
12. Progress update dari Creator.
13. Content submission dengan versioning.
14. Revision workflow (request → re-submit).
15. Content approval & collaboration completion.
16. Rating & review dua arah.
17. Admin verification & moderation.
18. Notification in-app & email.
19. Audit log dasar.
20. Reporting dasar (statistik pengguna, campaign, kolaborasi).

---

## 10. User Journey Utama

### 10.1 UMKM: dari Campaign sampai Selesai

```
Registrasi → Verifikasi email → Lengkapi profil usaha & produk
  → Buat campaign (draft) → Publikasikan campaign
  → Terima pengajuan Creator ATAU undang Creator tertentu
  → Terima pengajuan / undangan → Kolaborasi dimulai
  → Komunikasi via pesan → Pantau progres Creator
  → Terima konten versi 1 → Minta revisi ATAU setujui
  → (jika revisi) Terima konten versi 2 → Setujui
  → (opsional) UMKM atau Creator membatalkan kolaborasi sebelum approval
  → UMKM selesaikan kolaborasi (setelah approval) → Beri rating & review
```

### 10.2 Creator: dari Pendaftaran sampai Pendapatan

```
Registrasi → Verifikasi email → Lengkapi profil, keahlian, kategori
  → Tambah portofolio → Ajukan verifikasi Creator
  → Admin menyetujui → Creator terverifikasi & muncul di discovery
  → Cari campaign atau terima undangan
  → Ajukan kolaborasi atau terima undangan → Kolaborasi dimulai
  → Kirim pesan → Update progres
  → Upload konten versi 1 → Kirim untuk review
  → (jika revisi) Iterasi → Setujui akhir
  → (opsional) Creator membatalkan kolaborasi selama submission belum approved
  → UMKM selesaikan kolaborasi → Beri rating & review ke UMKM
```

### 10.3 Admin: Operasional

```
Login admin → Dashboard ringkasan
  → Tinjau antrian verifikasi Creator → Setujui/tolak
  → Moderasi campaign (flag/klarifikasi)
  → Moderasi konten (flag/klarifikasi)
  → Moderasi review (hide)
  → Moderasi pesan (hide) bila diperlukan
  → Suspend/aktifkan akun pengguna
  → Lihat statistik & generate laporan
  → Lihat audit log
```

---

## 11. Functional Requirements (FR)

> Penomoran: `FR-<Modul>-<Nomor>`. Setiap FR akan ditelusuri ke Use Case (`UC-...`) dan Test Case (`TC-...`).

### 11.1 Authentication & Account

| ID | Deskripsi |
| --- | --- |
| **FR-AUTH-001** | Sistem menyediakan registrasi UMKM dengan field: nama, email, password, nama usaha, jenis usaha. |
| **FR-AUTH-002** | Sistem menyediakan registrasi Content Creator dengan field: nama, email, password, kontak, kategori, keahlian. |
| **FR-AUTH-003** | Sistem menyediakan login menggunakan email + password. |
| **FR-AUTH-004** | Sistem menyediakan logout dan invalidasi sesi. |
| **FR-AUTH-005** | Sistem menyediakan verifikasi email melalui tautan (link verification). |
| **FR-AUTH-006** | Sistem menyediakan reset password melalui tautan email. |
| **FR-AUTH-007** | Sistem membedakan tiga role: `umkm`, `creator`, `admin`. |
| **FR-AUTH-008** | Admin dapat mengaktifkan (`active`) atau menonaktifkan (`suspended`) akun pengguna. Akun `suspended` tidak dapat login. |

### 11.2 Profile

| ID | Deskripsi |
| --- | --- |
| **FR-PROFILE-001** | UMKM dapat mengelola profil usaha: nama usaha, deskripsi, alamat, logo, kontak. |
| **FR-PROFILE-002** | UMKM dapat mengelola daftar produk/jasa: nama, deskripsi, foto, harga (opsional). |
| **FR-PROFILE-003** | Creator dapat mengelola profil: bio, foto profil, kota, kontak publik. |
| **FR-PROFILE-004** | Creator dapat menambahkan banyak keahlian. |
| **FR-PROFILE-005** | Creator dapat memilih banyak kategori konten. |
| **FR-PROFILE-006** | Creator dapat mengelola portofolio: judul, deskripsi, tautan/file media (foto/video). |
| **FR-PROFILE-007** | Creator dapat mengajukan verifikasi dengan mengunggah identitas dan bukti portofolio. |
| **FR-PROFILE-008** | Admin dapat menyetujui, menolak (dengan catatan), atau meminta revisi verifikasi. |

### 11.3 Campaign

| ID | Deskripsi |
| --- | --- |
| **FR-CAMPAIGN-001** | UMKM dapat membuat campaign dengan field: judul, deskripsi, kategori, budget, deadline, daftar deliverable. |
| **FR-CAMPAIGN-002** | UMKM dapat mengedit campaign selama berstatus `draft` atau `open`. |
| **FR-CAMPAIGN-003** | UMKM dapat membatalkan campaign (status `cancelled`) selama belum ada kolaborasi aktif. |
| **FR-CAMPAIGN-004** | UMKM dapat mempublikasikan campaign (transisi `draft` → `open`). |
| **FR-CAMPAIGN-005** | UMKM dapat melihat daftar campaign miliknya beserta status. |
| **FR-CAMPAIGN-006** | Creator dapat mencari campaign berdasarkan kata kunci, kategori, dan range budget. |
| **FR-CAMPAIGN-007** | Creator dapat melihat detail campaign. |
| **FR-CAMPAIGN-008** | Campaign yang berstatus `open` dan `cancelled` ditampilkan/disingkirkan sesuai aturan visibility. |

### 11.4 Creator Discovery

| ID | Deskripsi |
| --- | --- |
| **FR-DISCOVERY-001** | UMKM dapat mencari Creator berdasarkan kata kunci (nama, keahlian). |
| **FR-DISCOVERY-002** | UMKM dapat memfilter Creator berdasarkan kategori, range rating, dan status verifikasi. |
| **FR-DISCOVERY-003** | UMKM dapat melihat profil publik Creator termasuk portofolio dan rating. |
| **FR-DISCOVERY-004** | Creator yang belum terverifikasi tetap muncul di discovery namun diberi label "Belum terverifikasi". |

### 11.5 Collaboration

| ID | Deskripsi |
| --- | --- |
| **FR-COLLAB-001** | Creator dapat mengajukan kolaborasi ke sebuah campaign (application). |
| **FR-COLLAB-002** | UMKM dapat mengirim undangan kolaborasi kepada Creator (invitation). |
| **FR-COLLAB-003** | Sistem mencegah duplikat request (Creator yang sama, campaign yang sama, masih open). |
| **FR-COLLAB-004** | UMKM dapat menerima atau menolak pengajuan Creator. |
| **FR-COLLAB-005** | Creator dapat menerima atau menolak undangan UMKM. |
| **FR-COLLAB-006** | Creator dapat membatalkan pengajuan selama belum diterima/ditolak. |
| **FR-COLLAB-007** | Setelah salah satu pihak menerima, sistem membentuk `collaboration` berstatus `active`. |
| **FR-COLLAB-008** | UMKM dapat melihat status dan riwayat kolaborasi. |
| **FR-COLLAB-009** | Creator dapat melihat status dan riwayat kolaborasi. |
| **FR-COLLAB-010** | Sistem mencegah akses/tindakan pada kolaborasi yang bukan milik参与者. |

### 11.6 Messaging

| ID | Deskripsi |
| --- | --- |
| **FR-MSG-001** | Setiap kolaborasi memiliki satu percakapan (conversation). |
| **FR-MSG-002** | UMKM dan Creator dapat mengirim pesan teks dalam kolaborasi. |
| **FR-MSG-003** | Pesan dapat menyertakan attachment (file). |
| **FR-MSG-004** | Pesan ditandai sudah dibaca (read) per-pengguna. |
| **FR-MSG-005** | Pesan baru memicu notifikasi in-app dan email. |

### 11.7 Content & Progress

| ID | Deskripsi |
| --- | --- |
| **FR-CONTENT-001** | Creator dapat mengunggah progress update (teks + opsional file) yang tercatat timeline. |
| **FR-CONTENT-002** | Creator dapat mengunggah konten submission dengan versioning (versi naik otomatis per re-submit). |
| **FR-CONTENT-003** | Creator dapat mengirim submission untuk direview (status `in_review`). |
| **FR-CONTENT-004** | UMKM dapat meminta revisi dengan catatan revisi. |
| **FR-CONTENT-005** | UMKM dapat menyetujui submission (status `approved`). |
| **FR-CONTENT-006** | Creator dapat mengirim ulang submission baru setelah revisi. |
| **FR-CONTENT-007** | UMKM dapat menyelesaikan kolaborasi (status `completed`) setelah konten disetujui. |
| **FR-CONTENT-008** | Sistem mencegah perpindahan status submission yang tidak valid. |

### 11.8 Review

| ID | Deskripsi |
| --- | --- |
| **FR-REVIEW-001** | UMKM dapat memberi rating (1–5) dan review kepada Creator setelah kolaborasi `completed`. |
| **FR-REVIEW-002** | Creator dapat memberi rating (1–5) dan review kepada UMKM setelah kolaborasi `completed`. |
| **FR-REVIEW-003** | Setiap kolaborasi hanya dapat memiliki satu review dari masing-masing pihak. |
| **FR-REVIEW-004** | Review ditampilkan di profil publik Creator/UMKM. |
| **FR-REVIEW-005** | Admin dapat menyembunyikan review yang melanggar aturan. |

### 11.9 Admin

| ID | Deskripsi |
| --- | --- |
| **FR-ADMIN-001** | Admin dapat melihat dashboard statistik dasar (pengguna, campaign, kolaborasi, verifikasi). |
| **FR-ADMIN-002** | Admin dapat melihat daftar UMKM dan Creator. |
| **FR-ADMIN-003** | Admin dapat mengaktifkan/menonaktifkan akun. |
| **FR-ADMIN-004** | Admin dapat meninjau antrian verifikasi Creator. |
| **FR-ADMIN-005** | Admin dapat memoderasi campaign (flag/hide). |
| **FR-ADMIN-006** | Admin dapat memoderasi konten submission (flag/hide). |
| **FR-ADMIN-007** | Admin dapat memoderasi review (hide). |
| **FR-ADMIN-008** | Admin dapat melihat audit log. |
| **FR-ADMIN-009** | Admin dapat mengekspor laporan aktivitas. |

### 11.10 Notification

| ID | Deskripsi |
| --- | --- |
| **FR-NOTIF-001** | Sistem mengirim notifikasi in-app untuk peristiwa kolaborasi (request, accept, message, submission, revision, approval, completion, review). |
| **FR-NOTIF-002** | Sistem mengirim email untuk peristiwa kritis (registrasi, reset password, request/accept, submission untuk review, completion). |
| **FR-NOTIF-003** | Pengguna dapat melihat daftar notifikasi di menu notifikasi dan menandainya sebagai sudah dibaca. |

### 11.11 Audit & Reporting

| ID | Deskripsi |
| --- | --- |
| **FR-AUDIT-001** | Sistem mencatat audit log untuk aksi-aksi utama (status berubah, verifikasi, moderasi, suspend). |
| **FR-AUDIT-002** | Audit log dapat dilihat oleh Admin. |
| **FR-AUDIT-003** | Admin dapat melihat statistik pengguna, campaign, kolaborasi, verifikasi. |
| **FR-AUDIT-004** | Admin dapat mengekspor laporan CSV sederhana. |

---

## 12. Non-Functional Requirements (NFR)

| ID | Kategori | Deskripsi |
| --- | --- | --- |
| **NFR-SECURITY-001** | Security | Password disimpan menggunakan hashing standar Laravel (bcrypt/argon). |
| **NFR-SECURITY-002** | Security | Semua endpoint yang membutuhkan autentikasi dilindungi middleware `auth`. |
| **NFR-SECURITY-003** | Security | Authorization dilakukan melalui Laravel Policies per resource. |
| **NFR-SECURITY-004** | Security | File sensitif (dokumen verifikasi, attachment pesan) disimpan pada storage privat. Akses publik hanya melalui signed URL dengan kadaluarsa. |
| **NFR-SECURITY-005** | Security | CSRF protection aktif untuk seluruh form. |
| **NFR-SECURITY-006** | Security | Rate limiting pada endpoint login, register, dan reset password. |
| **NFR-PERFORMANCE-001** | Performance | Halaman list (campaign, creator, collaboration) memiliki pagination ≤ 20 item. |
| **NFR-PERFORMANCE-002** | Performance | Response time rata-rata halaman utama ≤ 2 detik pada koneksi broadband. |
| **NFR-AVAILABILITY-001** | Availability | Sistem mampu beroperasi pada 1 instance Laravel + 1 MySQL dengan queue worker tunggal pada MVP. |
| **NFR-MAINTAINABILITY-001** | Maintainability | Kode mengikuti konvensi Laravel + Laravel Pint. |
| **NFR-MAINTAINABILITY-002** | Maintainability | Statis analisis: Larastan level >= 6 tanpa error baru. |
| **NFR-OBSERVABILITY-001** | Observability | Error dan aksi penting tercatat di log aplikasi. |
| **NFR-ACCESSIBILITY-001** | Accessibility | Komponen UI mengikuti standar shadcn/ui (sudah aksesibel secara default). Form input memiliki label. |
| **NFR-COMPATIBILITY-001** | Compatibility | Aplikasi berjalan pada PHP 8.4, MySQL 8.x, Node.js LTS. |
| **NFR-DATA-001** | Data | Soft delete diaktifkan untuk entitas: campaign, collaboration, content submission, review, message. |
| **NFR-INT-001** | Internationalization | Antarmuka MVP menggunakan Bahasa Indonesia; struktur siap i18n (filament/JSON). |

---

## 13. User Stories

> Format: *Sebagai <aktor>, saya ingin <tujuan>, sehingga <manfaat>.*

### 13.1 UMKM

- US-UMKM-001 — Sebagai UMKM, saya ingin mendaftarkan usaha saya dengan jelas, sehingga Creator dapat mengenal usaha saya.
- US-UMKM-002 — Sebagai UMKM, saya ingin membuat campaign dengan brief lengkap (budget, deadline, deliverable), sehingga Creator memahami ekspektasi.
- US-UMKM-003 — Sebagai UMKM, saya ingin mencari Creator berdasarkan kategori dan rating, sehingga saya dapat memilih Creator yang relevan.
- US-UMKM-004 — Sebagai UMKM, saya ingin mengirim undangan ke Creator tertentu, sehingga kolaborasi dapat dimulai.
- US-UMKM-005 — Sebagai UMKM, saya ingin menerima atau menolak pengajuan Creator, sehingga saya dapat menyeleksi kandidat.
- US-UMKM-006 — Sebagai UMKM, saya ingin memantau progres dan menerima konten untuk direview, sehingga saya dapat memberi umpan balik.
- US-UMKM-007 — Sebagai UMKM, saya ingin meminta revisi dengan catatan jelas, sehingga Creator dapat memperbaiki.
- US-UMKM-008 — Sebagai UMKM, saya ingin menyetujui konten akhir dan menutup kolaborasi, sehingga proses berakhir rapi.
- US-UMKM-009 — Sebagai UMKM, saya ingin memberi rating & review, sehingga Creator lain tahu reputasi saya.
- US-UMKM-010 — Sebagai UMKM, saya ingin melihat riwayat kolaborasi, sehingga saya punya arsip.

### 13.2 Creator

- US-CREATOR-001 — Sebagai Creator, saya ingin menampilkan profil, keahlian, kategori, dan portofolio, sehingga UMKM dapat menemukan saya.
- US-CREATOR-002 — Sebagai Creator, saya ingin mengajukan verifikasi, sehingga akun saya dipercaya.
- US-CREATOR-003 — Sebagai Creator, saya ingin mencari campaign, sehingga saya dapat menemukan peluang.
- US-CREATOR-004 — Sebagai Creator, saya ingin mengajukan kolaborasi ke campaign, sehingga UMKM dapat mempertimbangkan saya.
- US-CREATOR-005 — Sebagai Creator, saya ingin menerima/menolak undangan UMKM, sehingga saya dapat mengelola komitmen.
- US-CREATOR-006 — Sebagai Creator, saya ingin mengirim progress update, sehingga UMKM tidak bertanya-tanya.
- US-CREATOR-007 — Sebagai Creator, saya ingin mengunggah konten dengan versioning, sehingga setiap revisi terdokumentasi.
- US-CREATOR-008 — Sebagai Creator, saya ingin mengirim konten untuk review, sehingga UMKM dapat menilai.
- US-CREATOR-009 — Sebagai Creator, saya ingin memberi rating & review, sehingga UMKM lain tahu reputasi saya.
- US-CREATOR-010 — Sebagai Creator, saya ingin melihat riwayat kolaborasi, sehingga saya punya portofolio kerja.

### 13.3 Admin

- US-ADMIN-001 — Sebagai Admin, saya ingin masuk ke dashboard operasional, sehingga saya dapat memantau platform.
- US-ADMIN-002 — Sebagai Admin, saya ingin meninjau & menyetujui verifikasi Creator, sehingga Creator tepercaya muncul di marketplace.
- US-ADMIN-003 — Sebagai Admin, saya ingin memoderasi campaign/konten/review, sehingga platform tetap berkualitas.
- US-ADMIN-004 — Sebagai Admin, saya ingin mengaktifkan/menonaktifkan akun, sehingga saya dapat menangani pelanggaran.
- US-ADMIN-005 — Sebagai Admin, saya ingin melihat statistik & mengekspor laporan, sehingga saya dapat mengambil keputusan.

---

## 14. Acceptance Criteria (AC)

> Setiap AC terkait dengan satu FR. Detail TC terdapat di `TEST_PLAN.md`.

### 14.1 AC untuk FR utama

| FR | AC |
| --- | --- |
| FR-AUTH-001 | UMKM terdaftar dengan email unik, password ter-hash, dan profil usaha otomatis dibuat dalam status `draft`. |
| FR-AUTH-002 | Creator terdaftar dengan email unik dan profil Creator otomatis dibuat. |
| FR-AUTH-003 | Login gagal menampilkan pesan umum (tidak membocorkan apakah email terdaftar). Login berhasil membuat sesi. |
| FR-AUTH-005 | Email verifikasi dikirim; pengguna belum terverifikasi tidak dapat membuat campaign atau mengajukan kolaborasi. |
| FR-AUTH-008 | Akun `suspended` tidak dapat login dan menerima pesan "akun dinonaktifkan". |
| FR-PROFILE-007 | Pengajuan verifikasi berstatus `pending` setelah disubmit; Creator tidak dapat mengajukan dua kali bersamaan. |
| FR-PROFILE-008 | Admin dapat menolak verifikasi dengan alasan; Creator menerima notifikasi dan dapat mengajukan ulang. |
| FR-CAMPAIGN-001 | Campaign baru berstatus `draft` dan belum tampil di pencarian Creator. |
| FR-CAMPAIGN-004 | Campaign `open` muncul di pencarian Creator dan dapat menerima pengajuan/undangan. |
| FR-CAMPAIGN-003 | Campaign yang sudah memiliki kolaborasi aktif tidak dapat dibatalkan (UI disable, endpoint menolak). |
| FR-COLLAB-003 | Duplikat request (Creator + campaign sama, status open) ditolak dengan pesan jelas. |
| FR-COLLAB-007 | Setelah `accepted`, sistem membentuk `collaboration` dan menolak request/undangan lain untuk campaign yang sama. |
| FR-CONTENT-002 | Setiap re-submit menghasilkan nomor versi naik (v1, v2, …). |
| FR-CONTENT-004 | Permintaan revisi mengunci submission pada status `revision_requested`. |
| FR-CONTENT-005 | Approval mengunci submission pada status `approved` dan mengaktifkan tombol "Selesaikan Kolaborasi" di UMKM. |
| FR-REVIEW-003 | Upaya review kedua dari pihak yang sama ditolak dengan 409 Conflict. |
| FR-NOTIF-001 | Notifikasi in-app tercatat di tabel `notifications`; event email masuk ke queue. |

---

## 15. Business Rules (BR)

| ID | Aturan |
| --- | --- |
| BR-001 | Satu akun = satu peran utama (`umkm`, `creator`, atau `admin`). UMKM tidak dapat menjadi Creator di akun yang sama. Admin hanya dibuat via Seeder/CLI. |
| BR-002 | Email harus unik lintas semua role. |
| BR-003 | Creator wajib terverifikasi agar hasil kolaborasi dihitung dalam rating/ranking. Creator belum terverifikasi tetap dapat ditemukan dengan label. |
| BR-004 | Campaign hanya dapat menerima pengajuan/undangan selama berstatus `open`. |
| BR-005 | **Satu campaign hanya menghasilkan satu kolaborasi yang diterima.** Setelah salah satu request `accepted`, request `pending` lain auto-reject dan campaign berpindah ke `in_collaboration`. |
| BR-006 | Versioning konten naik otomatis per re-submit dan tidak dapat diedit setelah disetujui. |
| BR-007 | Review hanya dapat diberikan satu kali per kolaborasi per pihak dan tidak dapat diedit. |
| BR-008 | Notifikasi email dikirim via queue (database queue pada MVP). |
| BR-009 | Audit log hanya append-only; tidak ada edit/hapus melalui antarmuka. Audit log mencakup pembatalan kolaborasi dengan alasan. |
| BR-010 | Akun yang suspended tetap menampilkan profil publik namun tidak dapat beraksi. Pengguna dapat meminta penonaktifan namun tidak dapat menghapus akun. Data historis tidak boleh hilang. |
| BR-011 | Pesan bersifat immutable (tidak dapat diedit/dihapus). Admin hanya dapat menyembunyikan untuk moderasi. |
| BR-012 | Pesan tidak dapat dikirim setelah kolaborasi `completed` atau `cancelled`. |
| BR-013 | Kolaborasi dapat dibatalkan oleh UMKM atau Creator selama submission belum `approved`, dengan alasan wajib. Setelah `approved`, hanya Admin yang dapat menutup. |
| BR-014 | File publik dan private disimpan pada disk terpisah (Laravel Filesystem). File identitas, lampiran pesan, dan submission wajib private. |
| BR-015 | Nama file di-storage selalu acak (UUIDv4); metadata asli disimpan di kolom DB. |

---

## 16. Product Metrics

| ID | Metrik | Definisi | Target MVP |
| --- | --- | --- | --- |
| PM-001 | UMKM aktif mingguan | Jumlah UMKM yang login & melakukan aksi dalam 7 hari | Tren naik (baseline) |
| PM-002 | Creator aktif mingguan | Jumlah Creator yang login & melakukan aksi dalam 7 hari | Tren naik |
| PM-003 | Campaign terpublikasi | Jumlah campaign berstatus `open` per minggu | Tren naik |
| PM-004 | Tingkat konversi pengajuan → kolaborasi | Rasio pengajuan diterima | ≥ 25% |
| PM-005 | Rata-rata waktu kolaborasi | Dari kolaborasi `active` → `completed` | ≤ 21 hari |
| PM-006 | Tingkat revisi | Rasio submission yang direvisi ≥ 1 kali | ≤ 60% |
| PM-007 | Rating rata-rata Creator | Rata-rata rating dari UMKM | ≥ 4.0 / 5.0 |
| PM-008 | Verifikasi Creator | Jumlah Creator terverifikasi kumulatif | ≥ 50 pada 30 hari |
| PM-009 | Laporan moderasi | Jumlah konten/campaign/review yang dimoderasi per minggu | Tercatat |

---

## 17. MVP Release Criteria

MVP dianggap siap rilis internal/internal-staging jika:

1. Seluruh functional requirement MVP lulus acceptance criteria.
2. Coverage test backend minimal 70% (Pest) untuk modul yang diimplementasikan.
3. Coverage test frontend minimal 60% (Vitest) untuk komponen utama.
4. Smoke test end-to-end (Playwright) lulus untuk happy path: registrasi → buat campaign → invitation → submission → revisi → approval → completion → review.
5. Larastan level 6 tanpa error baru.
6. Pint bersih.
7. Audit log dan notifikasi email berfungsi.
8. UAT scenario pada `TEST_PLAN.md` ditinjau oleh Product Owner.

---

## 18. Risiko Produk

| ID | Risiko | Dampak | Mitigasi |
| --- | --- | --- | --- |
| R-PROD-001 | Creator abal-abal lolos verifikasi | Reputasi platform turun | Verifikasi admin + laporan + suspend cepat |
| R-PROD-002 | Brief UMKM tidak jelas | Revisi berulang, kepuasan turun | Wajib field minimum; template brief di MVP |
| R-PROD-003 | Creator menunda progres | UMKM kecewa | Notifikasi progres + SLA reminder |
| R-PROD-004 | Review palsu / spam | Distorsi rating | Rate limit, moderasi admin |
| R-PROD-005 | Lonjakan traffic | Sistem tidak stabil | Optimasi pagination, indexing, monitoring |

---

## 19. Asumsi

1. Pengguna memiliki koneksi internet stabil; tidak ada mode offline.
2. Pembayaran terjadi di luar Collabite pada MVP (transfer manual). Tidak ada escrow.
3. Satu akun = satu peran (UMKM atau Creator atau Admin). UMKM tidak dapat menjadi Creator di akun yang sama.
4. Notifikasi email sudah cukup untuk MVP; tidak ada push FCM.
5. Admin disediakan via seeding/CLI; tidak ada self-service registrasi admin.
6. Verifikasi Creator bersifat manual oleh admin (tidak otomatis).
7. File media dibatasi ukurannya sesuai §21.
8. Bahasa antarmuka utama adalah Bahasa Indonesia.
9. Storage MVP lokal (`storage/app`); file publik dan private menggunakan disk terpisah. Abstraction siap migrasi ke S3.
10. Multi-Creator campaign, direct hire, payment, dan dispute kompleks adalah fitur pasca-MVP.

---

## 20. Open Questions

> Semua open question di bawah telah diputuskan. Ringkasan keputusan final:

| ID | Pertanyaan | Keputusan Final |
| --- | --- | --- |
| OQ-001 | Multi-collab pada satu campaign? | **TIDAK di MVP.** Satu campaign = satu Creator. Setelah salah satu request diterima, request pending lain auto-reject. |
| OQ-002 | Direct hire tanpa campaign? | **TIDAK di MVP.** Semua kolaborasi harus lewat campaign. |
| OQ-003 | Review wajib atau opsional? | **Opsional**, namun jika diberikan hanya 1× per pihak per kolaborasi, immutable. |
| OQ-004 | UMKM menutup campaign tanpa kolaborasi? | **Boleh** selama campaign `draft`/`submitted`/`published` dan belum ada kolaborasi `accepted`/`active`. |
| OQ-005 | Creator membatalkan kolaborasi aktif? | **Boleh** selama submission belum `approved`. Setelah `approved`, hanya Admin yang dapat menutup (alasan kuat). Pembatalan wajib alasan, dicatat di audit log, dan notifikasi. |
| OQ-006 | Pesan dapat diedit/dihapus? | **TIDAK.** Pesan immutable; hanya Admin yang dapat menyembunyikan untuk moderasi. |
| OQ-007 | Batas ukuran file? | Avatar/logo/produk 2MB; portofolio gambar 5MB; video portofolio 50MB; dokumen verifikasi 5MB; lampiran pesan 10MB; file submission 100MB. Lihat §21. |
| OQ-008 | Pengguna menghapus akun sendiri? | **TIDAK.** Hanya Admin yang dapat suspend; data historis tetap dipertahankan. Pengguna dapat meminta penonaktifan. |
| OQ-009 | Tabel `message_reads` sejak MVP? | **TIDAK.** Gunakan kolom `read_at` per pesan (percakapan 1-1). |
| OQ-010 | Multi-kategori per campaign? | **TIDAK di MVP.** Satu kategori utama per campaign. Creator tetap multi-kategori. |
| OQ-011 | Object storage sejak MVP? | **TIDAK di MVP.** Pakai local Laravel storage dengan disk `public` & `private` terpisah. Desain abstraction siap migrasi ke S3-compatible. |

---

## 21. Kebijakan Upload File (Final)

| Jenis File | Ukuran Maks | Format | Disk |
| --- | --- | --- | --- |
| Avatar / Logo usaha | 2 MB | JPEG, PNG, WebP | public |
| Gambar produk | 2 MB | JPEG, PNG, WebP | public |
| Gambar portofolio | 5 MB | JPEG, PNG, WebP | public |
| Video portofolio | 50 MB | MP4, MOV, WebM | public |
| Dokumen verifikasi Creator | 5 MB | PDF, JPEG, PNG | private |
| Lampiran pesan | 10 MB | JPEG, PNG, WebP, PDF, ZIP | private |
| File content submission | 100 MB / file | MP4, MOV, WebM, JPEG, PNG, PDF | private |

Aturan tambahan:

- Nama file di-storage = UUIDv4; nama asli disimpan di kolom `original_name`.
- Path pattern: `{module}/{owner_id}/{uuid}.{ext}`.
- Validasi MIME dan extension di Form Request.
- Batas jumlah file per request didefinisikan per endpoint.
- Akses file private melalui signed URL dengan TTL ≤ 30 menit.
- File submission tidak dipublikasikan di halaman publik UMKM/Creator tanpa auth.
- Automated test tidak boleh mengunggah file sebesar batas maksimum. Gunakan fixture kecil (≤ 50 KB) dan uji aturan batas dengan metadata atau file dummy yang ukurannya dimodifikasi.
- Konfigurasi production minimum (server): `upload_max_filesize=110M`, `post_max_size=120M`, web server `client_max_body_size=120M` (nginx) atau setara.

---

## Lampiran A. Traceability Matrix (FR ↔ Use Case ↔ Test Case ↔ Milestone)

> Pemetaan singkat. Detail di `USE_CASE.md`, `TEST_PLAN.md`, dan `IMPLEMENTATION_ROADMAP.md`.

| FR | Use Case | Test Case | Milestone |
| --- | --- | --- | --- |
| FR-AUTH-001 | UC-AUTH-001 | TC-AUTH-001 | M1 |
| FR-AUTH-002 | UC-AUTH-002 | TC-AUTH-002 | M1 |
| FR-AUTH-003 | UC-AUTH-003 | TC-AUTH-003 | M1 |
| FR-AUTH-004 | UC-AUTH-004 | TC-AUTH-004 | M1 |
| FR-AUTH-005 | UC-AUTH-005 | TC-AUTH-005 | M1 |
| FR-AUTH-006 | UC-AUTH-006 | TC-AUTH-006 | M1 |
| FR-AUTH-007 | UC-AUTH-007 | TC-AUTH-007 | M1 |
| FR-AUTH-008 | UC-ADMIN-001 | TC-ADMIN-001 | M1, M6 |
| FR-PROFILE-001 | UC-PROF-001 | TC-PROF-001 | M2 |
| FR-PROFILE-002 | UC-PROF-002 | TC-PROF-002 | M2 |
| FR-PROFILE-003 | UC-PROF-003 | TC-PROF-003 | M2 |
| FR-PROFILE-004 | UC-PROF-004 | TC-PROF-004 | M2 |
| FR-PROFILE-005 | UC-PROF-005 | TC-PROF-005 | M2 |
| FR-PROFILE-006 | UC-PROF-006 | TC-PROF-006 | M2 |
| FR-PROFILE-007 | UC-VERIF-001 | TC-VERIF-001 | M2 |
| FR-PROFILE-008 | UC-VERIF-002 | TC-VERIF-002 | M2 |
| FR-CAMPAIGN-001 | UC-CAMP-001 | TC-CAMP-001 | M3 |
| FR-CAMPAIGN-002 | UC-CAMP-002 | TC-CAMP-002 | M3 |
| FR-CAMPAIGN-003 | UC-CAMP-003 | TC-CAMP-003 | M3 |
| FR-CAMPAIGN-004 | UC-CAMP-004 | TC-CAMP-004 | M3 |
| FR-CAMPAIGN-005 | UC-CAMP-005 | TC-CAMP-005 | M3 |
| FR-CAMPAIGN-006 | UC-CAMP-006 | TC-CAMP-006 | M3 |
| FR-CAMPAIGN-007 | UC-CAMP-007 | TC-CAMP-007 | M3 |
| FR-CAMPAIGN-008 | UC-CAMP-008 | TC-CAMP-008 | M3 |
| FR-DISCOVERY-001 | UC-DISC-001 | TC-DISC-001 | M3 |
| FR-DISCOVERY-002 | UC-DISC-002 | TC-DISC-002 | M3 |
| FR-DISCOVERY-003 | UC-DISC-003 | TC-DISC-003 | M3 |
| FR-DISCOVERY-004 | UC-DISC-004 | TC-DISC-004 | M3 |
| FR-COLLAB-001 | UC-COLLAB-001 | TC-COLLAB-001 | M4 |
| FR-COLLAB-002 | UC-COLLAB-002 | TC-COLLAB-002 | M4 |
| FR-COLLAB-003 | UC-COLLAB-003 | TC-COLLAB-003 | M4 |
| FR-COLLAB-004 | UC-COLLAB-004 | TC-COLLAB-004 | M4 |
| FR-COLLAB-005 | UC-COLLAB-005 | TC-COLLAB-005 | M4 |
| FR-COLLAB-006 | UC-COLLAB-006 | TC-COLLAB-006 | M4 |
| FR-COLLAB-007 | UC-COLLAB-007 | TC-COLLAB-007 | M4 |
| FR-COLLAB-008 | UC-COLLAB-008 | TC-COLLAB-008 | M4 |
| FR-COLLAB-009 | UC-COLLAB-009 | TC-COLLAB-009 | M4 |
| FR-COLLAB-010 | UC-COLLAB-010 | TC-COLLAB-010 | M4 |
| FR-MSG-001 | UC-COM-001 | TC-COM-001 | M5 |
| FR-MSG-002 | UC-COM-002 | TC-COM-002 | M5 |
| FR-MSG-003 | UC-COM-003 | TC-COM-003 | M5 |
| FR-MSG-004 | UC-COM-004 | TC-COM-004 | M5 |
| FR-MSG-005 | UC-COM-005 | TC-COM-005 | M5 |
| FR-CONTENT-001 | UC-CONT-001 | TC-CONT-001 | M5 |
| FR-CONTENT-002 | UC-CONT-002 | TC-CONT-002 | M5 |
| FR-CONTENT-003 | UC-CONT-003 | TC-CONT-003 | M5 |
| FR-CONTENT-004 | UC-CONT-004 | TC-CONT-004 | M5 |
| FR-CONTENT-005 | UC-CONT-005 | TC-CONT-005 | M5 |
| FR-CONTENT-006 | UC-CONT-006 | TC-CONT-006 | M5 |
| FR-CONTENT-007 | UC-CONT-007 | TC-CONT-007 | M5 |
| FR-CONTENT-008 | UC-CONTENT-008 | TC-CONT-008 | M5 |
| FR-REVIEW-001 | UC-REV-001 | TC-REV-001 | M6 |
| FR-REVIEW-002 | UC-REV-002 | TC-REV-002 | M6 |
| FR-REVIEW-003 | UC-REV-003 | TC-REV-003 | M6 |
| FR-REVIEW-004 | UC-REV-004 | TC-REV-004 | M6 |
| FR-REVIEW-005 | UC-REV-005 | TC-REV-005 | M6 |
| FR-ADMIN-001 | UC-ADMIN-002 | TC-ADMIN-002 | M6 |
| FR-ADMIN-002 | UC-ADMIN-003 | TC-ADMIN-003 | M6 |
| FR-ADMIN-003 | UC-ADMIN-001 | TC-ADMIN-001 | M6 |
| FR-ADMIN-004 | UC-ADMIN-004 | TC-ADMIN-004 | M6 |
| FR-ADMIN-005 | UC-ADMIN-005 | TC-ADMIN-005 | M6 |
| FR-ADMIN-006 | UC-ADMIN-006 | TC-ADMIN-006 | M6 |
| FR-ADMIN-007 | UC-ADMIN-007 | TC-ADMIN-007 | M6 |
| FR-ADMIN-008 | UC-ADMIN-008 | TC-ADMIN-008 | M7 |
| FR-ADMIN-009 | UC-ADMIN-009 | TC-ADMIN-009 | M7 |
| FR-NOTIF-001 | UC-NOTIF-001 | TC-NOTIF-001 | M5, M6 |
| FR-NOTIF-002 | UC-NOTIF-002 | TC-NOTIF-002 | M5, M6 |
| FR-NOTIF-003 | UC-NOTIF-003 | TC-NOTIF-003 | M5, M6 |
| FR-AUDIT-001 | UC-AUDIT-001 | TC-AUDIT-001 | M7 |
| FR-AUDIT-002 | UC-AUDIT-002 | TC-AUDIT-002 | M7 |
| FR-AUDIT-003 | UC-ADMIN-002 | TC-ADMIN-002 | M7 |
| FR-AUDIT-004 | UC-ADMIN-009 | TC-ADMIN-009 | M7 |

---

## Lampiran B. Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 0.1 (Draft) | 2026-06-18 | Initial draft: identitas, persona, FR/NFR, user stories, business rules, traceability. | Product Engineer |
| 1.0 (Approved) | 2026-06-18 | Tutup OQ-001..OQ-011; tetapkan single-role account, single-Creator campaign, single-kategori, polling messaging, immutable messages, versi upload, file storage policy, suspend vs cancel rules, audit retention. | Product Engineer |
