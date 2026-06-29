# Architecture Decision Records (ADR) — Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai acuan implementasi M0–M7.

Dokumen ini mencatat keputusan teknis dan produk untuk MVP. Format mengikuti pola ADR ringkas: **ID, Status, Context, Decision, Consequences, Alternatives Considered**.

---

## Daftar Keputusan

| ID | Keputusan | Status |
| --- | --- | --- |
| ADR-001 | Laravel monolith | Accepted |
| ADR-002 | Inertia.js sebagai bridge | Accepted |
| ADR-003 | React + TypeScript untuk UI | Accepted |
| ADR-004 | MySQL sebagai database | Accepted |
| ADR-005 | Session authentication | Accepted |
| ADR-006 | Tidak ada REST API internal | Accepted |
| ADR-007 | Laravel Policies untuk authorization | Accepted |
| ADR-008 | Database queue untuk MVP | Accepted |
| ADR-009 | Messaging menggunakan polling | Accepted |
| ADR-010 | Tidak menggunakan AI recommendation | Accepted |
| ADR-011 | Tidak menggunakan payment gateway | Accepted |
| ADR-012 | Tidak menggunakan mobile native | Accepted |
| ADR-013 | File sensitif disimpan private | Accepted |
| ADR-014 | Collaboration request: application & invitation | Accepted |
| ADR-015 | Content submission mendukung versioning | Accepted |
| ADR-016 | Single-role account (BR-001) | Accepted |
| ADR-017 | AGENTS.md = aturan Collabite, CLAUDE.md = Boost | Accepted |
| ADR-018 | Single-Creator campaign, auto-reject pending | Accepted |
| ADR-019 | Direct hire di luar MVP | Accepted |
| ADR-020 | Review opsional, immutable | Accepted |
| ADR-021 | Pembatalan kolaborasi (pre-approval) | Accepted |
| ADR-022 | Admin force-close pasca approval | Accepted |
| ADR-023 | Pesan immutable (no edit/delete) | Accepted |
| ADR-024 | File size policy (PRD §21) | Accepted |
| ADR-025 | File storage lokal + abstraction S3-ready | Accepted |
| ADR-026 | Suspend-only (no self-delete) | Accepted |
| ADR-027 | `read_at` per pesan (tanpa tabel `message_reads`) | Accepted |
| ADR-028 | Single-kategori per campaign | Accepted |
| ADR-029 | SQLite sebagai database validasi RC; MySQL compatibility ditunda | Accepted |

---

## ADR-001 — Laravel Monolith

- **Status:** Accepted
- **Context:** MVP harus cepat dirilis. Tim memiliki keahlian Laravel. Belum ada kebutuhan untuk memisahkan service karena domain masih kecil.
- **Decision:** Bangun Collabite sebagai Laravel monolith dengan module domain di dalam satu aplikasi.
- **Consequences:**
  - Onboarding cepat, satu repo, satu deploy.
  - Modul domain tetap terpisah di level kode (Controllers, Policies, Services).
  - Skalabilitas horizontal terbatas; akan dievaluasi pasca-MVP.
- **Alternatives Considered:**
  - **Microservices** → ditolak: biaya operasional tinggi untuk MVP.
  - **Laravel + modul terpisah sebagai package** → ditolak: menambah kompleksitas tooling.

## ADR-002 — Inertia.js sebagai Bridge

- **Status:** Accepted
- **Context:** Inertia memungkinkan SPA UX dengan server-side routing. Cocok untuk MVP tanpa REST API internal.
- **Decision:** Gunakan Inertia.js v3 sebagai bridge antara Laravel dan React.
- **Consequences:**
  - Tidak perlu membuat REST API internal.
  - Server tetap memegang otorisasi.
  - State UI dapat dikirim via props.
  - SSR opsional tanpa Node server terpisah (via Vite plugin).
- **Alternatives Considered:**
  - **REST API + SPA terpisah** → ditolak: menambah pekerjaan OAuth/sanctum, dua routing, duplikasi validasi.
  - **Livewire** → ditolak: tim memilih React untuk konsistensi skill.

## ADR-003 — React + TypeScript

- **Status:** Accepted
- **Context:** React adalah standar industri untuk SPA; TypeScript meningkatkan kualitas kode dan traceability.
- **Decision:** Gunakan React 19 + TypeScript untuk seluruh UI.
- **Consequences:**
  - Komponen reusable, type safety.
  - Cocok dengan shadcn/ui & Tailwind.
  - Memerlukan disiplin typing (PR review).
- **Alternatives Considered:**
  - **Vue 3** → ditagal: preferensi tim React.
  - **Tanpa TypeScript** → ditolak: menurunkan DX & traceability.

## ADR-004 — MySQL sebagai Database

- **Status:** Accepted
- **Context:** MySQL sudah umum, mendukung transaksi, indexing komposit, dan full-text (untuk future search).
- **Decision:** Gunakan MySQL 8.x sebagai basis data utama.
- **Consequences:**
  - Kompatibel dengan hosting murah (Laravel Cloud, shared VPS).
  - Indexing standar sudah cukup untuk MVP.
  - Eloquent + migration standar.
- **Alternatives Considered:**
  - **PostgreSQL** → layak; tidak dipilih agar tidak menambah variabel baru.
  - **SQLite** → hanya untuk testing lokal.

## ADR-005 — Session Authentication

- **Status:** Accepted
- **Context:** MVP berupa web app dengan tiga peran, tidak ada native mobile. Session auth sederhana dan aman.
- **Decision:** Gunakan Laravel session authentication (Web guard) dengan Fortify.
- **Consequences:**
  - CSRF bawaan aktif.
  - Tidak perlu token bearer.
  - Login dari banyak device tetap dalam satu sesi per device.
- **Alternatives Considered:**
  - **Sanctum (token)** → ditolak: tidak ada kebutuhan SPA mobile terpisah.
  - **OAuth/JWT** → ditolak: overkill untuk MVP.

## ADR-006 — Tidak Membuat REST API Internal Terpisah

- **Status:** Accepted
- **Context:** Frontend dan backend berada dalam satu product team. Inertia sudah cukup.
- **Decision:** Tidak membuat REST API terpisah untuk kebutuhan internal. Controller mengembalikan `Inertia::render` atau `redirect`.
- **Consequences:**
  - Satu sumber validasi.
  - Tidak ada duplikasi serializer.
  - Kontrak data di-handle oleh TypeScript types (bisa digenerate via Wayfinder).
- **Alternatives Considered:**
  - **REST API + Inertia** → ditolak: menambah pekerjaan dan inkonsistensi.
  - **GraphQL** → ditolak: kompleksitas tidak sebanding dengan kebutuhan MVP.

## ADR-007 — Laravel Policies untuk Authorization

- **Status:** Accepted
- **Context:** Laravel Policies adalah cara idiomatik mengatur aturan akses per resource.
- **Decision:** Setiap resource (Campaign, Collaboration, Submission, Review, dst.) memiliki Policy class.
- **Consequences:**
  - Otorisasi terpusat dan mudah diuji (Pest `actingAs` + policy assertion).
  - Kompatibel dengan Form Request `authorize()`.
- **Alternatives Considered:**
  - **Gate di Controller** → ditolak: sulit dipusatkan.
  - **Middleware khusus** → ditolak: kurang granular.

## ADR-008 — Database Queue untuk MVP

- **Status:** Accepted
- **Context:** MVP butuh antrian job (email, ekspor laporan) tanpa menambah infrastruktur.
- **Decision:** Gunakan `QUEUE_CONNECTION=database` dengan worker melalui `php artisan queue:work`.
- **Consequences:**
  - Tidak butuh Redis.
  - Throughput cukup untuk volume MVP.
  - Worker harus dijalankan sebagai service/supervisor.
- **Alternatives Considered:**
  - **Redis queue** → ditolak: menambah dependency.
  - **Sync queue** → ditolak: memblokir request HTTP.

## ADR-009 — Messaging dengan Polling (MVP)

- **Status:** Accepted
- **Context:** WebSocket real-time dan push notification berada di luar scope MVP.
- **Decision:** Halaman kolaborasi melakukan polling endpoint pesan setiap 15 detik (Inertia `defer`/`merge`).
- **Consequences:**
  - Implementasi sederhana, tidak butuh layanan tambahan.
  - Latensi pesan ±15 detik.
  - Beban server moderat; di-throttle.
- **Alternatives Considered:**
  - **WebSocket (Pusher / Laravel Reverb)** → ditolak: tidak dalam scope MVP.
  - **SSE** → ditolak: tidak dalam scope MVP.

## ADR-010 — Tidak Menggunakan AI Recommendation

- **Status:** Accepted
- **Context:** Rekomendasi Creator dengan AI berada di luar scope MVP (PRD §8).
- **Decision:** Discovery menggunakan filter & search sederhana (kategori, rating, kata kunci).
- **Consequences:**
  - Implementasi cepat, predictable.
  - Tidak ada biaya inference.
  - Bisa ditambah pasca-MVP.
- **Alternatives Considered:**
  - **Vector search + LLM** → ditolak: scope MVP.

## ADR-011 — Tidak Menggunakan Payment Gateway

- **Status:** Accepted
- **Context:** Pembayaran dan escrow berada di luar scope MVP (PRD §8).
- **Decision:** Tidak ada integrasi payment gateway. Transaksi (jika ada) terjadi di luar platform.
- **Consequences:**
  - MVP fokus pada kolaborasi & reputasi.
  - Field `budget` di campaign bersifat informasional.
- **Alternatives Considered:**
  - **Midtrans/Xendit** → ditolak: scope MVP.

## ADR-012 — Tidak Menggunakan Mobile Native

- **Status:** Accepted
- **Context:** Mobile native app berada di luar scope MVP (PRD §8).
- **Decision:** Hanya menyediakan web app responsif.
- **Consequences:**
  - Satu codebase.
  - UX harus adaptif (lihat skill `adapt`).
- **Alternatives Considered:**
  - **React Native / Flutter** → ditolak: scope MVP.

## ADR-013 — File Sensitif Disimpan Private

- **Status:** Accepted
- **Context:** Dokumen verifikasi, lampiran pesan, dan file submission adalah data sensitif.
- **Decision:** Simpan file di disk `private`; akses publik melalui signed URL dengan TTL singkat (30 menit).
- **Consequences:**
  - Tidak ada URL permanen untuk file sensitif.
  - Signed URL membatasi akses per sesi.
  - Perlu rotasi key jika key bocor.
- **Alternatives Considered:**
  - **Public disk + obfuscation** → ditolak: tidak aman.
  - **Object storage (S3) + IAM** → pasca-MVP.

## ADR-014 — Collaboration Request: Application & Invitation

- **Status:** Accepted
- **Context:** UMKM ingin mencari Creator (invite) dan Creator ingin melamar campaign (application). Keduanya adalah jalur utama.
- **Decision:** Tabel `collaboration_requests` mendukung tipe `application` & `invitation`. State yang sama (`Pending/Accepted/Rejected/Cancelled`).
- **Consequences:**
  - Satu pipeline request yang konsisten.
  - Auto-reject request lain saat salah satu di-accept.
  - UI berbeda berdasarkan peran.
- **Alternatives Considered:**
  - **Dua tabel berbeda** → ditolak: duplikasi state machine.
  - **Direct contract tanpa request** → ditolak: tidak ada jejak.

## ADR-015 — Content Submission Mendukung Versioning

- **Status:** Accepted
- **Context:** UMKM dapat meminta revisi; Creator mengirim ulang. Setiap versi harus tercatat.
- **Decision:** Submission memiliki `version` (auto-increment per kolaborasi). Submission lama ditandai `Superseded`.
- **Consequences:**
  - Jejak revisi jelas.
  - Approval hanya untuk versi terakhir.
  - Tabel `content_revisions` menyimpan catatan revisi per submission.
- **Alternatives Considered:**
  - **Timpa file** → ditolak: kehilangan jejak.
  - **Snapshot lengkap** → pasca-MVP jika dibutuhkan.

## ADR-016 — Single-Role Account (BR-001)

- **Status:** Accepted
- **Context:** Ingin menyederhanakan data model dan UI.
- **Decision:** Satu akun hanya memiliki satu role utama: `umkm`, `creator`, atau `admin`. UMKM tidak dapat menjadi Creator pada akun yang sama. Admin hanya dibuat via Seeder/CLI.
- **Consequences:**
  - Tabel `users.role` sebagai satu-satunya sumber kebenaran.
  - Tidak ada UI ganti peran.
  - Migrasi role di masa depan memerlukan pemisahan akun.
- **Alternatives Considered:**
  - **Multi-role** → ditolak untuk MVP: menambah kompleksitas UI & autorisasi.

## ADR-017 — AGENTS.md vs CLAUDE.md

- **Status:** Accepted
- **Context:** Repositori menyertakan AGENTS.md yang awalnya duplikat CLAUDE.md (Laravel Boost).
- **Decision:** AGENTS.md berisi aturan khusus Collabite (source of truth, scope, format laporan, business rules). CLAUDE.md tetap memuat panduan Laravel Boost. AGENTS.md menginstruksikan agent untuk membaca CLAUDE.md untuk detail Laravel.
- **Consequences:**
  - Tidak ada duplikasi.
  - Agent menerima dua sumber yang saling melengkapi.
- **Alternatives Considered:**
  - **Pertahankan duplikat** → ditolak: menimbulkan konflik saat salah satu diupdate.
  - **Pindahkan Boost ke AGENTS.md** → ditolak: merusak Boost tooling.

## ADR-018 — Single-Creator Campaign, Auto-Reject Pending

- **Status:** Accepted
- **Context:** MVP fokus pada alur sederhana.
- **Decision:** Satu campaign hanya untuk satu Creator. Setelah request `accepted`, request pending lain otomatis `rejected`. Campaign berpindah ke `in_collaboration`. Pembatalan kolaborasi (pre-approval) mengembalikan campaign ke `open` (request lain tidak dipulihkan).
- **Consequences:**
  - UI Creator tidak melihat campaign yang sudah terikat.
  - Model data: `collaborations.campaign_id` UNIQUE.
- **Alternatives Considered:**
  - **Multi-Creator parallel** → pasca-MVP.

## ADR-019 — Direct Hire di Luar MVP

- **Status:** Accepted
- **Context:** Direct hire tanpa campaign akan menambah tabel & alur di luar marketplace.
- **Decision:** Semua kolaborasi harus lewat campaign. UMKM harus membuat campaign sebelum mengundang Creator.
- **Consequences:**
  - Semua kolaborasi tercatat sebagai bagian dari campaign.
  - Tidak ada short-circuit alur.
- **Alternatives Considered:**
  - **Direct hire** → pasca-MVP.

## ADR-020 — Review Opsional, Immutable

- **Status:** Accepted
- **Context:** Ingin memvalidasi kebutuhan review tanpa memaksakan.
- **Decision:** Review opsional. Setelah diberikan, tidak dapat diedit atau dihapus. Admin hanya dapat menyembunyikan.
- **Consequences:**
  - UI menampilkan CTA review yang jelas.
  - Tidak ada endpoint edit/delete review.
- **Alternatives Considered:**
  - **Review wajib** → ditolak: menurunkan conversion.
  - **Edit window** → ditolak: menambah kompleksitas.

## ADR-021 — Pembatalan Kolaborasi (Pre-Approval)

- **Status:** Accepted
- **Context:** Keperluan keluar dari kolaborasi yang tidak sehat.
- **Decision:** UMKM atau Creator dapat membatalkan kolaborasi selama submission belum `approved`. Wajib menyertakan alasan (min 10 karakter). Dicatat di audit log. Notifikasi ke pihak lain.
- **Consequences:**
  - Kolaborasi `cancelled` dengan `cancelled_by`, `cancelled_at`, `cancelled_reason`.
  - Campaign kembali ke `open`.
- **Alternatives Considered:**
  - **Hanya Admin** → ditolak: menghalangi keluar alami.
  - **Tanpa alasan** → ditolak: menurunkan akuntabilitas.

## ADR-022 — Admin Force-Close Pasca Approval

- **Status:** Accepted
- **Context:** Setelah submission `approved`, pihak tidak boleh menutup seenaknya.
- **Decision:** Hanya Admin yang dapat menutup kolaborasi yang submission-nya sudah `approved`. Wajib alasan. Dicatat di audit log.
- **Consequences:**
  - Tambah endpoint `admin.collaborations.force-close`.
  - Audit log: `collaboration.force_closed`.
- **Alternatives Considered:**
  - **Izinkan pihak menutup** → ditolak: risiko dispute.

## ADR-023 — Pesan Immutable

- **Status:** Accepted
- **Context:** Ingin menjaga jejak komunikasi.
- **Decision:** Pesan tidak dapat diedit atau dihapus oleh user. Admin hanya dapat `is_hidden`. Riwayat asli selalu ada untuk audit.
- **Consequences:**
  - Tidak ada endpoint edit/delete pesan.
  - Polling lebih sederhana.
- **Alternatives Considered:**
  - **Edit window 5 menit** → ditolak: menambah state.

## ADR-024 — File Size Policy (PRD §21)

- **Status:** Accepted
- **Context:** Batas upload perlu eksplisit untuk UX & keamanan.
- **Decision:** Tabel ukuran & format di PRD §21. Validasi MIME & extension di Form Request. Automated test tidak boleh upload file sebesar batas maksimum.
- **Consequences:**
  - Konfigurasi production minimum didefinisikan.
  - Test menggunakan fake upload ≤ 50 KB.
- **Alternatives Considered:**
  - **Validasi client-side only** → ditolak: bypassable.

## ADR-025 — File Storage Lokal + Abstraction S3-Ready

- **Status:** Accepted
- **Context:** MVP tanpa object storage, namun desain harus siap migrasi.
- **Decision:** Pakai Laravel Filesystem abstraction. Disk `public` & `private` terpisah. Tidak ada hard-coded absolute path. `Storage::disk(...)` digunakan di seluruh business logic.
- **Consequences:**
  - Migrasi ke S3 cukup dengan mengubah `config/filesystems.php` & env.
  - File signature URL berfungsi di kedua backend.
- **Alternatives Considered:**
  - **S3 sejak awal** → ditolak: menambah biaya MVP.

## ADR-026 — Suspend-Only (Tanpa Self-Delete)

- **Status:** Accepted
- **Context:** Ingin menjaga data historis kolaborasi, submission, review, audit.
- **Decision:** Pengguna tidak dapat menghapus akun. Admin dapat `suspend`. Pengguna dapat meminta penonaktifan (request).
- **Consequences:**
  - Endpoint `profile.request_deactivation` tersedia.
  - Profil publik tetap tampil dengan label "nonaktif".
- **Alternatives Considered:**
  - **Self-delete** → ditolak: melanggar BR-010.

## ADR-027 — `read_at` per Pesan (Tanpa `message_reads`)

- **Status:** Accepted
- **Context:** Percakapan MVP bersifat 1-1.
- **Decision:** Kolom `read_at` di `messages`. Tabel `message_reads` tidak dibuat. Migrasi pasca-MVP jika group chat ditambahkan.
- **Consequences:**
  - Query read status sederhana.
  - Polling cukup untuk MVP.
- **Alternatives Considered:**
  - **Tabel `message_reads`** → ditolak: overhead untuk MVP.

## ADR-028 — Single-Kategori per Campaign

- **Status:** Accepted
- **Context:** Mempermudah filter dan reporting.
- **Decision:** `campaigns.category_id` adalah FK langsung ke `categories.id`. Multi-kategori pasca-MVP.
- **Consequences:**
  - Tidak ada tabel pivot `campaign_categories`.
  - Creator tetap multi-kategori (tabel `creator_categories`).
- **Alternatives Considered:**
  - **Multi-kategori sejak MVP** → ditolak: menambah UI & query.

## ADR-029 — SQLite sebagai Database Validasi RC; MySQL Compatibility Ditunda

- **Status:** Accepted
- **Context:** AGENTS.md §4 melarang menambah dependency tanpa persetujuan, dan lingkungan lokal RC saat ini tidak memiliki kredensial MySQL siap pakai. Pengujian Pest yang berjalan di `tests/` telah memakai `sqlite :memory:` untuk kecepatan. Namun validasi runtime RC (server lokal, demo, dan smoke test) membutuhkan database persisten di luar `phpunit.xml`.
- **Decision:** SQLite (default konfigurasi `.env` Laravel) digunakan sebagai database validasi untuk release candidate ini. MySQL 8.x tetap merupakan database produksi resmi sesuai ADR-004. Kompatibilitas MySQL diverifikasi secara eksplisit sebagai release task pasca-RC, dengan checklist eksekusi terhadap instance MySQL 8.x sebelum deploy produksi.
- **Consequences:**
  - Pipeline CI dan perintah `php artisan migrate:fresh --seed` RC memakai SQLite; demo seeder tetap kompatibel dengan kedua engine.
  - Risiko minor ketidakcocokan tipe data (presisi `DECIMAL`, perilaku kolom `JSON`, dan penyimpanan enum sebagai string di SQLite) dimitigasi dengan tes validasi ulang terhadap MySQL sebelum production deploy.
  - Konfigurasi produksi (`env.production`) tetap merujuk ke `mysql` sesuai ADR-004. SQLite tidak menggantikan target produksi, hanya menggantikan engine validasi RC.
- **Alternatives Considered:**
  - **Block RC sampai MySQL siap** → ditolak: tidak menambah nilai untuk QA fungsional inti; validasi runtime sudah cukup dengan SQLite.
  - **Pakai Docker MySQL on-the-fly** → ditolak: menambah kompleksitas tooling tanpa persetujuan sesuai AGENTS.md §4.

## ADR-030 — Admin Collaboration Namespace Separation

- **Status:** Accepted
- **Context:** Sebelum RC, Admin mengakses halaman kolaborasi UMKM/Creator dengan role override. Setelah OQ-005 dan UC-ADMIN-010 diformalkan, Admin membutuhkan halaman oversight sendiri (`/admin/collaborations`) yang:
  1. Menampilkan seluruh kolaborasi lintas UMKM/Creator (bukan scoped ke satu akun).
  2. Mengekspos aksi force-close (UC-ADMIN-010) yang tidak tersedia untuk pihak.
  3. Menegakkan isolasi akses: Admin tidak boleh menggunakan route `/umkm/collaborations/*` atau `/creator/collaborations/*` (akan mengembalikan 403).
- **Decision:** Pisahkan namespace Admin untuk kolaborasi dengan komponen:
  - Route: `GET /admin/collaborations`, `GET /admin/collaborations/{collaboration}`, `POST /admin/collaborations/{collaboration}/force-close`.
  - Controller: `app/Http/Controllers/Admin/CollaborationsController.php`.
  - Action: `app/Actions/Admin/ForceCloseCollaborationAction.php` (admin-only, menulis audit `collaboration.force_closed`).
  - Request: `app/Http/Requests/Admin/ForceCloseCollaborationRequest.php`.
  - Notifikasi: `app/Notifications/CollaborationForceClosedNotification.php`.
  - Frontend: `resources/js/pages/Admin/Collaborations/Index.tsx`, `Show.tsx`.
  - Policy: `app/Policies/CollaborationPolicy.php` mengembalikan 403 untuk Admin di luar namespace admin.
  - Tests: `tests/Feature/Admin/CollaborationsTest.php` (11 cases termasuk validasi reason, audit, notifikasi, dan policy 403).
- **Consequences:**
  - Audit trail jelas: `collaboration.force_closed` hanya bisa ditrigger Admin, sehingga dapat dibedakan dari `collaboration.cancelled` (pihak).
  - Memperkuat authorization boundary: Admin tidak bisa lewat celah UMKM/Creator route.
  - Penambahan tabel `notifications` (Laravel default) + kolom `collaborations.cancelled_by` & `cancelled_reason` (sudah ada sejak v1.0; dikonfirmasi final di RC.1).
- **Alternatives Considered:**
  - **Reuse route UMKM/Creator dengan policy khusus Admin** → ditolak: sulit ditegakkan konsisten dan mempersulit audit.
  - **Admin hanya akses via menu Force-Close pada halaman UMKM** → ditolak: tidak memberikan visibility lintas kolaborasi.

---

## Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 0.1 (Draft) | 2026-06-18 | Initial draft: 15 keputusan MVP. | Product Engineer |
| 1.0 (Approved) | 2026-06-18 | Tambah ADR-016..ADR-028: single-role, AGENTS/CLAUDE split, single-Creator campaign, direct-hire out, review opsional, cancel-collab, admin force-close, message immutable, file size policy, storage abstraction, suspend-only, read_at, single-kategori. | Product Engineer |
| 1.1 (RC.1 reflection) | 2026-06-18 | Tambah ADR-029 (SQLite sebagai DB validasi RC; MySQL compatibility ditunda) & ADR-030 (Admin collaboration namespace separation). | Product Engineer |

## ADR-031 — Role-Specific Layout Shells (Admin Dashboard vs Marketplace)

- **Status:** Accepted
- **Context:** Sebelum refactor ini, halaman UMKM dan Creator mewarisi shell dashboard/sidebar yang sama dengan Admin (`AppSidebar` + `AppHeader`) sehingga tampilan Admin bocor ke UMKM dan Creator. Hasil audit menunjukkan pengalaman Admin yang padat (tabel ringkas, filter, breadcrumb, sidebar persisten) tidak sesuai untuk UMKM dan Creator, yang lebih tepat dilayani sebagai marketplace modern (top navigation, kartu, pencarian, mobile bottom-nav).
- **Decision:** Pisahkan shell layout berdasarkan peran dengan struktur di bawah `resources/js/layouts/`:
  - `PublicLayout` — landing, direktori publik, dan halaman marketing.
  - `AuthLayout` — login, register, lupa password, verifikasi email.
  - `MarketplaceLayout` — semua halaman UMKM dan Creator yang terautentikasi; menyediakan top navbar, role-specific navigation, search opsional, user menu, mobile sheet, dan bottom navigation.
  - `AdminDashboardLayout` — Admin saja, mempertahankan sidebar persisten + breadcrumb + tabel ringkas.
  - `CollaborationWorkspaceLayout` — UMKM dan Creator di dalam kolaborasi aktif; berisi header kolaborasi, badge status, dan tab Pesan/Progres/Submission/Review.
  - Sumber kebenaran navigasi dipusatkan di `resources/js/config/navigation.ts` (role-specific `NavigationItem[]` plus `PrimaryAction`).
  - `app.tsx` memilih layout berdasarkan prefix nama page (`Admin/`, `Umkm/`, `Creator/`, `auth/`, `Public/`, `settings/`).
- **Consequences:**
  - UMKM dan Creator tidak lagi melihat sidebar Admin; Admin tetap mempertahankan dashboard operasional.
  - Penambahan peran baru cukup mendaftarkan `NavigationItem[]` di konfigurasi navigasi tanpa duplikasi layout.
  - Komponen lama (`app-header`, `app-shell`, `app-content`, `app-sidebar-header`, `app-sidebar-layout`, `app-header-layout`, `nav-user`, `user-menu-content`, `user-info`, `nav-footer`) dihapus untuk mencegah regresi.
  - Marketplace home untuk UMKM dan Creator didesain ulang sebagai landing-style personalized page (hero, statistik ringkas, kartu campaign/kolaborasi, empty-state, dan tips) sehingga tidak lagi terasa seperti dashboard Admin.
- **Alternatives Considered:**
  - **Satu layout universal dengan flag peran** → ditolak: sulit mempertahankan konsistensi visual, dan risiko kebocoran navigasi Admin ke UMKM/Creator masih ada.
  - **Pakai template dashboard eksternal** → ditolak: menambah dependency UI besar di luar shadcn/ui dan kontradiksi dengan AGENTS.md §4.
| 1.2 (Refactor) | 2026-06-18 | Tambah ADR-031: role-specific layout shells (MarketplaceLayout untuk UMKM/Creator, AdminDashboardLayout untuk Admin). | Product Engineer |
## ADR-032 — Login Form Action Binding (POST /login)

- **Status:** Accepted
- **Context:** RC.1 audit menemukan `DEF-AUTH-001` (Blocker): submit form login jatuh ke `GET /login?email=…&password=…` (form submit native) karena Wayfinder hanya menghasilkan binding `login.get`/`login.head` untuk `GET /login`. `POST /login` di `routes/web.php` tidak memiliki route name, sehingga helper `login()` di `@/routes` selalu `RouteDefinition<'get'>`. Form React `<Form action={login()} method="post">` membuat Inertia mengikuti `method: 'get'`, sehingga Inertia tidak melakukan XHR fetch; form submit native yang terjadi. Tangkapan browser menunjukkan URL akhir berisi `?email=…&password=…` (kredensial di query string) dan `auth.user: null`.
- **Decision:** Tiga perubahan minimum:
  1. `routes/web.php`: `POST /login` di-`->name('login.store')` agar Wayfinder dapat membuat binding untuk `store` action.
  2. `resources/js/pages/Auth/Login.tsx`: pakai `store as loginStore` dari `@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController` lalu render `<Form action={loginStore.url()} method="post">`. Tree-shakeable dan jelas menunjukkan `POST /login`.
  3. Sambungkan `usePage().props.errors` ke `<InputError>` agar pesan kesalahan dari server (kredensial salah, akun suspended) tampil.
- **Consequences:**
  - Submit login sekarang memanggil `AuthenticatedSessionController@store` via Inertia XHR `POST /login` dengan CSRF token yang valid.
  - Redirect role-aware: admin → `/admin/dashboard`, umkm → `/umkm/dashboard`, creator → `/creator/dashboard`, suspended → tetap di `/login` dengan pesan kesalahan.
  - Validasi regresi: 12 kasus Pest, 5 kasus Vitest, 6 skenario Playwright real browser (`tests/E2E/00-login-flow.spec.ts`).
- **Alternatives Considered:**
  - **Buat route dummy `POST /login` di `routes/web.php` terpisah** → ditolak: duplikasi, rentan inkonsistensi.
  - **Disable CSRF di `/login`** → ditolak: menurunkan keamanan.
  - **Gunakan `<form method="post">` native + Blade** → ditolak: Inertia adalah satu-satunya pipeline rendering.


| 1.3 (RC.2) | 2026-06-18 | Tambah ADR-032: login form action binding via Wayfinder action helper + `usePage().props.errors` untuk error display. | Product Engineer |
