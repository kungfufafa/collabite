# Frontend Gap Analysis — Collabite RC

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Audit statis halaman Inertia React untuk Collabite RC.
> **Referensi:** routes/web.php, resources/js/pages/**, PRD §9, USE_CASE.md, TDD §7, DECISIONS.md, TEST_PLAN.md.

Dokumen ini memetakan setiap route aplikasi yang didefinisikan di `routes/web.php` ke halaman Inertia di `resources/js/pages/**` dan memberi status **Complete / Partial / Missing** beserta rekomendasi perbaikan. Audit dilakukan secara statis (tidak ada perubahan kode).

> **Cakupan:** Halaman React saja. Backend, Form Request, dan Policy berada di luar lingkup audit ini (lihat TEST_PLAN.md untuk cakupan uji).

---

## 1. Metodologi Audit

1. Baca `routes/web.php` untuk enumerasi route.
2. Baca setiap halaman di `resources/js/pages/**` untuk memverifikasi render, props, dan aksi yang dikirim ke backend.
3. Cari marker teknis di frontend: `TODO`, `FIXME`, `placeholder` (ekspor UI), `coming soon`, `not implemented`, `mock`, `dummy`, `any`, `@ts-ignore`, `console.log`, `console.debug`, `xtest`, `.skip(`.
4. Bandingkan ekspektasi PRD §9 (fitur MVP) dengan implementasi.
5. Klasifikasikan severity: **High** (fitur MVP utama tidak ada), **Medium** (alur parsial, edge case tidak tertangani), **Low** (UX polish atau copy).

### 1.1 Marker Teknis yang Ditemukan

| Marker | Lokasi | Severity |
| --- | --- | --- |
| `tabs-mock.tsx` (komponen Tabs ad-hoc) | `resources/js/components/ui/tabs-mock.tsx` | Low — digunakan pada halaman kolaborasi sebagai implementasi Tabs sederhana. |
| `console.warn` di `use-clipboard.ts` | `resources/js/hooks/use-clipboard.ts:13, 24` | Low — hanya fallback saat Clipboard API tidak tersedia. |
| `placeholder` di banyak form | `resources/js/pages/**` | Low — atribut HTML valid untuk UX, bukan marker kode. |

> **Catatan:** Tidak ditemukan `TODO`, `FIXME`, `coming soon`, `not implemented`, `@ts-ignore`, `xtest`, atau `console.log/console.debug` di luar yang disebutkan di atas.

---

## 2. Tabel Pemetaan Route → Halaman

| Actor | Route | Controller | Halaman Inertia | Status | Perilaku yang Hilang | Tes yang Diperlukan |
| --- | --- | --- | --- | --- | --- | --- |
| Publik | `GET /` | closure | `Public/Welcome.tsx` | Complete | — | Render-only smoke test. |
| Publik | `GET /creators` | `Public\CreatorDirectoryController@index` | `Public/CreatorDirectory.tsx` | Complete | — | Filter & search UAT-PUB-001. |
| Publik | `GET /creators/{creatorProfile}` | `Public\CreatorDirectoryController@show` | `Public/CreatorProfile.tsx` | Complete | — | UAT-PUB-002. |
| Publik | `GET /umkm/{umkmProfile}` | `Public\ProfileController@showUmkm` | `Public/UmkmProfile.tsx` | Complete | — | UAT-PUB-003. |
| Guest | `GET /login` | `Auth\AuthenticatedSessionController@create` | `Auth/Login.tsx` | Complete | — | UAT-AUTH-001. |
| Guest | `POST /login` | `Auth\AuthenticatedSessionController@store` | (form submission) | Complete | — | UAT-AUTH-001 (Pest). |
| Guest | `GET /register` | `Auth\RegisteredUserController@create` | `Auth/Register.tsx` | Complete | — | UAT-AUTH-002. |
| Guest | `POST /register/umkm` | `Auth\RegisteredUserController@storeUmkm` | (form submission) | Complete | — | UAT-AUTH-002 (Pest). |
| Guest | `POST /register/creator` | `Auth\RegisteredUserController@storeCreator` | (form submission) | Complete | — | UAT-AUTH-002 (Pest). |
| Guest | `GET /forgot-password` | `Auth\PasswordResetLinkController@create` | `Auth/ForgotPassword.tsx` | Complete | — | UAT-AUTH-003. |
| Guest | `POST /forgot-password` | `Auth\PasswordResetLinkController@store` | (form submission) | Complete | — | UAT-AUTH-003 (Pest). |
| Guest | `GET /reset-password/{token}` (Fortify) | Fortify | `Auth/ResetPassword.tsx` | Complete | — | UAT-AUTH-003 (Pest). |
| Auth | `GET /confirm-password` | `Auth\ConfirmablePasswordController@show` | `Auth/ConfirmPassword.tsx` | Complete | — | Pest. |
| Auth | `POST /confirm-password` | `Auth\ConfirmablePasswordController@store` | (form submission) | Complete | — | Pest. |
| Auth | `GET /verify-email` | `Auth\EmailVerificationPromptController` | `Auth/VerifyEmail.tsx` | Complete | — | UAT-AUTH-004. |
| Auth | `GET /verify-email/{id}/{hash}` | `Auth\VerifyEmailController` | (Fortify view) | Complete | — | Pest. |
| Auth | `POST /email/verification-notification` | `Auth\EmailVerificationNotificationController@store` | (form submission) | Complete | — | Pest throttling. |
| Auth | `POST /logout` | `Auth\AuthenticatedSessionController@destroy` | (form submission) | Complete | — | UAT-AUTH-005. |
| Auth | `GET /dashboard` | `DashboardController` | `Dashboard` (root) | Complete | Dispatcher ke portal sesuai role. | Pest dispatch. |
| UMKM | `GET /umkm/dashboard` | `Umkm\DashboardController@index` | `Umkm/Dashboard/Index.tsx` | Complete | — | UAT-UMKM-001. |
| UMKM | `GET /umkm/profile` | `Umkm\ProfileController@edit` | `Umkm/Profile/Edit.tsx` | Complete | — | UAT-UMKM-002. |
| UMKM | `PATCH /umkm/profile` | `Umkm\ProfileController@update` | (form submission) | Complete | — | Pest. |
| UMKM | `GET /umkm/products` | `Umkm\ProductsController@index` | `Umkm/Products/Index.tsx` | Complete | — | UAT-UMKM-003. |
| UMKM | `POST /umkm/products` | `Umkm\ProductsController@store` | (form submission) | Complete | — | Pest. |
| UMKM | `PATCH /umkm/products/{product}` | `Umkm\ProductsController@update` | (form submission) | Complete | — | Pest. |
| UMKM | `DELETE /umkm/products/{product}` | `Umkm\ProductsController@destroy` | (form submission) | Complete | — | Pest. |
| UMKM | `GET /umkm/campaigns` | `Umkm\CampaignsController@index` | `Umkm/Campaigns/Index.tsx` | Complete | — | UAT-UMKM-004. |
| UMKM | `GET /umkm/campaigns/create` | `Umkm\CampaignsController@create` | `Umkm/Campaigns/Form.tsx` | Complete | — | UAT-UMKM-005. |
| UMKM | `POST /umkm/campaigns` | `Umkm\CampaignsController@store` | (form submission) | Complete | — | Pest. |
| UMKM | `GET /umkm/campaigns/{campaign}` | `Umkm\CampaignsController@show` | `Umkm/Campaigns/Show.tsx` | Complete | — | UAT-UMKM-006. |
| UMKM | `GET /umkm/campaigns/{campaign}/edit` | `Umkm\CampaignsController@edit` | `Umkm/Campaigns/Form.tsx` | Complete | — | UAT-UMKM-005. |
| UMKM | `PATCH /umkm/campaigns/{campaign}` | `Umkm\CampaignsController@update` | (form submission) | Complete | — | Pest. |
| UMKM | `POST /umkm/campaigns/{campaign}/publish` | `Umkm\CampaignsController@publish` | (form submission) | Complete | — | UAT-UMKM-007. |
| UMKM | `POST /umkm/campaigns/{campaign}/cancel` | `Umkm\CampaignsController@cancel` | (form submission) | Complete | — | UAT-UMKM-008. |
| UMKM | `GET /umkm/discover` | `Umkm\DiscoverController@index` | `Umkm/Discover/Index.tsx` | Complete | Filter, search, kategori, verified_only. | UAT-UMKM-009. |
| UMKM | `GET /umkm/collaborations` | `Umkm\CollaborationsController@index` | `Umkm/Collaborations/Index.tsx` | Complete | — | UAT-UMKM-010. |
| UMKM | `GET /umkm/collaborations/{collaboration}` | `Umkm\CollaborationsController@show` | `Umkm/Collaborations/Show.tsx` | Partial | Tabs menggunakan `tabs-mock.tsx`; bukan shadcn/ui Tabs resmi. Polling pesan belum terimplementasi. | UAT-UMKM-011 + Vitest tab. |
| UMKM | `POST /umkm/collaborations/{collaboration}/messages` | `Umkm\CollaborationsController@sendMessage` | (form submission) | Complete | — | UAT-UMKM-011. |
| UMKM | `POST /umkm/collaborations/{collaboration}/requests/{request}/accept` | `Umkm\CollaborationsController@acceptRequest` | (form submission) | Complete | — | UAT-UMKM-012. |
| UMKM | `POST /umkm/collaborations/{collaboration}/requests/{request}/reject` | `Umkm\CollaborationsController@rejectRequest` | (form submission) | Complete | — | UAT-UMKM-012. |
| UMKM | `POST /umkm/collaborations/{collaboration}/submit-for-review/{submission}` | `Umkm\CollaborationsController@submitForReview` | (form submission) | Complete | — | UAT-UMKM-013. |
| UMKM | `POST /umkm/collaborations/{collaboration}/submissions/{submission}/request-revision` | `Umkm\CollaborationsController@requestRevision` | (form submission) | Complete | — | UAT-UMKM-014. |
| UMKM | `POST /umkm/collaborations/{collaboration}/submissions/{submission}/approve` | `Umkm\CollaborationsController@approveSubmission` | (form submission) | Complete | — | UAT-UMKM-015. |
| UMKM | `POST /umkm/collaborations/{collaboration}/submissions` | `Umkm\CollaborationsController@storeSubmission` | (form submission) | Complete | — | UAT-UMKM-016. |
| UMKM | `POST /umkm/collaborations/{collaboration}/progress` | `Umkm\CollaborationsController@storeProgress` | (form submission) | Complete | — | UAT-UMKM-017. |
| UMKM | `POST /umkm/collaborations/{collaboration}/complete` | `Umkm\CollaborationsController@complete` | (form submission) | Complete | — | UAT-UMKM-018. |
| UMKM | `POST /umkm/collaborations/{collaboration}/review` | `Umkm\ReviewsController@storeForUmkm` | (form submission) | Complete | — | UAT-UMKM-019. |
| UMKM | `POST /umkm/collaborations/{collaboration}/invitations` | `Umkm\CollaborationsController@invite` | (form submission) | Complete | — | UAT-UMKM-020. |
| UMKM | `POST /umkm/campaigns/{campaign}/invitations` | `Umkm\CollaborationsController@inviteByCampaign` | (form submission) | Complete | — | UAT-UMKM-020. |
| UMKM | `POST /umkm/requests/{request}/accept` | `Umkm\CollaborationsController@acceptByRequest` | (form submission) | Complete | — | UAT-UMKM-021. |
| UMKM | `POST /umkm/requests/{request}/reject` | `Umkm\CollaborationsController@rejectByRequest` | (form submission) | Complete | — | UAT-UMKM-021. |
| Creator | `GET /creator/dashboard` | `Creator\DashboardController@index` | `Creator/Dashboard/Index.tsx` | Complete | — | UAT-CREATOR-001. |
| Creator | `GET /creator/profile` | `Creator\ProfileController@edit` | `Creator/Profile/Edit.tsx` | Complete | — | UAT-CREATOR-002. |
| Creator | `PATCH /creator/profile` | `Creator\ProfileController@update` | (form submission) | Complete | — | Pest. |
| Creator | `GET /creator/portfolio` | `Creator\PortfolioController@index` | `Creator/Portfolio/Index.tsx` | Complete | — | UAT-CREATOR-003. |
| Creator | `POST /creator/portfolio` | `Creator\PortfolioController@store` | (form submission) | Complete | — | UAT-CREATOR-003. |
| Creator | `DELETE /creator/portfolio/{portfolioItem}` | `Creator\PortfolioController@destroy` | (form submission) | Complete | — | Pest. |
| Creator | `GET /creator/skills` | `Creator\SkillsController@edit` | `Creator/Skills/Edit.tsx` | Complete | — | UAT-CREATOR-004. |
| Creator | `PATCH /creator/skills` | `Creator\SkillsController@update` | (form submission) | Complete | — | Pest. |
| Creator | `GET /creator/verification` | `Creator\VerificationController@show` | `Creator/Verification/Show.tsx` | Complete | — | UAT-CREATOR-005. |
| Creator | `POST /creator/verification` | `Creator\VerificationController@submit` | (form submission) | Complete | — | UAT-CREATOR-005. |
| Creator | `GET /creator/campaigns` | `Creator\CampaignsController@index` | `Creator/Campaigns/Index.tsx` | Complete | — | UAT-CREATOR-006. |
| Creator | `GET /creator/campaigns/{campaign}` | `Creator\CampaignsController@show` | `Creator/Campaigns/Show.tsx` | Complete | — | UAT-CREATOR-007. |
| Creator | `POST /creator/campaigns/{campaign}/apply` | `Creator\CollaborationsController@apply` | (form submission) | Complete | — | UAT-CREATOR-008. |
| Creator | `GET /creator/collaborations` | `Creator\CollaborationsController@index` | `Creator/Collaborations/Index.tsx` | Complete | — | UAT-CREATOR-009. |
| Creator | `GET /creator/collaborations/{collaboration}` | `Creator\CollaborationsController@show` | `Creator/Collaborations/Show.tsx` | Partial | Sama dengan UMKM: `tabs-mock`; polling pesan belum diterapkan. | UAT-CREATOR-010 + Vitest tab. |
| Creator | `POST /creator/collaborations/{collaboration}/messages` | `Creator\CollaborationsController@sendMessage` | (form submission) | Complete | — | UAT-CREATOR-010. |
| Creator | `POST /creator/collaborations/{collaboration}/submissions` | `Creator\CollaborationsController@storeSubmission` | (form submission) | Complete | — | UAT-CREATOR-011. |
| Creator | `POST /creator/collaborations/{collaboration}/submissions/{submission}/submit-for-review` | `Creator\CollaborationsController@submitForReview` | (form submission) | Complete | — | UAT-CREATOR-011. |
| Creator | `POST /creator/collaborations/{collaboration}/submissions/{submission}/resubmit` | `Creator\CollaborationsController@resubmit` | (form submission) | Complete | — | UAT-CREATOR-012. |
| Creator | `POST /creator/collaborations/{collaboration}/progress` | `Creator\CollaborationsController@storeProgress` | (form submission) | Complete | — | UAT-CREATOR-013. |
| Creator | `POST /creator/collaborations/{collaboration}/requests/{request}/accept` | `Creator\CollaborationsController@acceptRequest` | (form submission) | Complete | — | UAT-CREATOR-014. |
| Creator | `POST /creator/collaborations/{collaboration}/requests/{request}/reject` | `Creator\CollaborationsController@rejectRequest` | (form submission) | Complete | — | UAT-CREATOR-014. |
| Creator | `POST /creator/collaborations/{collaboration}/requests/{request}/cancel` | `Creator\CollaborationsController@cancelRequest` | (form submission) | Complete | — | UAT-CREATOR-015. |
| Creator | `POST /creator/collaborations/{collaboration}/review` | `Creator\CollaborationsController@submitReview` | (form submission) | Complete | — | UAT-CREATOR-016. |
| Admin | `GET /admin/dashboard` | `Admin\DashboardController@index` | `Admin/Dashboard/Index.tsx` | Complete | — | UAT-ADMIN-001. |
| Admin | `GET /admin/users` | `Admin\UsersController@index` | `Admin/Users/Index.tsx` | Complete | Filter tersedia, suspend/aktifkan berfungsi. | UAT-ADMIN-002. |
| Admin | `PATCH /admin/users/{user}/status` | `Admin\UsersController@updateStatus` | (form submission) | Complete | — | Pest. |
| Admin | `GET /admin/verifications` | `Admin\VerificationsController@index` | `Admin/Verifications/Index.tsx` | Complete | — | UAT-ADMIN-003. |
| Admin | `GET /admin/verifications/{verification}` | `Admin\VerificationsController@show` | `Admin/Verifications/Show.tsx` | Complete | — | UAT-ADMIN-004. |
| Admin | `POST /admin/verifications/{verification}/approve` | `Admin\VerificationsController@approve` | (form submission) | Complete | — | Pest. |
| Admin | `POST /admin/verifications/{verification}/reject` | `Admin\VerificationsController@reject` | (form submission) | Complete | — | Pest. |
| Admin | `GET /admin/moderation/campaigns` | `Admin\ModerationController@campaigns` | `Admin/Campaigns/Index.tsx` | Complete | Hanya menampilkan campaign tersembunyi. | UAT-ADMIN-005. |
| Admin | `PATCH /admin/moderation/campaigns/{campaign}/hide` | `Admin\ModerationController@toggleCampaignHide` | (form submission) | Complete | — | Pest. |
| Admin | `GET /admin/moderation/content` | `Admin\ModerationController@content` | `Admin/Content/Index.tsx` | Complete | — | UAT-ADMIN-006. |
| Admin | `PATCH /admin/moderation/submissions/{submission}/hide` | `Admin\ModerationController@toggleSubmissionHide` | (form submission) | Complete | — | Pest. |
| Admin | `GET /admin/moderation/reviews` | `Admin\ModerationController@reviews` | (tidak ada halaman eksplisit) | Partial | Route terdaftar; halaman belum dibuat. Tabel review tersembunyi belum ada di `Admin/Reviews/Index.tsx`. | Buat halaman + UAT-ADMIN-007. |
| Admin | `PATCH /admin/moderation/reviews/{review}/hide` | `Admin\ModerationController@toggleReviewHide` | (form submission) | Complete | — | Pest. |
| Admin | `GET /admin/audit-logs` | `Admin\AuditLogController@index` | `Admin/AuditLogs/Index.tsx` | Complete | — | UAT-ADMIN-008. |
| Admin | `GET /admin/reports` | `Admin\ReportsController@index` | `Admin/Reports/Index.tsx` | Complete | Tiles metrik; tidak ada filter waktu. | UAT-ADMIN-009. |
| Admin | `GET /admin/reports/export` | `Admin\ReportsController@export` | (CSV download) | Complete | Endpoint di-ekspos; UI tidak menyediakan tautan eksplisit (lihat catatan di §3). | UAT-ADMIN-010 (curl). |
| Admin | `GET /admin/collaborations` | `Admin\CollaborationsController@index` | `Admin/Collaborations/Index.tsx` | Complete | — | UAT-ADMIN-011. |
| Admin | `GET /admin/collaborations/{collaboration}` | `Admin\CollaborationsController@show` | `Admin/Collaborations/Show.tsx` | Complete | Force-close action terlihat. | UAT-ADMIN-012. |
| Admin | `POST /admin/collaborations/{collaboration}/force-close` | `Admin\CollaborationsController@forceClose` | (form submission) | Complete | — | UAT-ADMIN-013. |
| Signed | `GET /files/private/{path}` | `FilesController@show` | (binary stream) | Complete | Signed URL TTL 30 menit. | Pest signed URL. |
| Settings | (legacy `settings/profile.tsx`) | — | `settings/profile.tsx` | Partial | Halaman ada tetapi tidak terdaftar di `web.php`; merupakan residu Fortify default. Aman untuk dihapus pasca-RC. | — |

---

## 3. Temuan Detail per Gap

### 3.1 `tabs-mock.tsx` — Tabs Ad-Hoc (Low)

- **Lokasi:** `resources/js/components/ui/tabs-mock.tsx`.
- **Dipakai di:** `Umkm/Collaborations/Show.tsx` dan `Creator/Collaborations/Show.tsx`.
- **Dampak:** Implementasi Tabs sederhana berbasis context; tidak ada animasi, tidak ada keyboard navigation penuh. Untuk RC ini dapat diterima; konsistensi UI dengan shadcn/ui dapat ditingkatkan pasca-RC.
- **Rekomendasi:** Ganti dengan shadcn/ui Tabs resmi setelah dependensi UI distabilkan; tambahkan Vitest snapshot test untuk kedua halaman.

### 3.2 Polling Pesan Belum Diterapkan (Medium)

- **Lokasi:** `Umkm/Collaborations/Show.tsx`, `Creator/Collaborations/Show.tsx`.
- **Dampak:** Pesan baru dari pihak lain hanya muncul setelah reload halaman penuh. ADR-009 mensyaratkan polling 15 detik.
- **Rekomendasi:** Tambahkan `useEffect` + `router.reload({ only: ['messages'] })` dengan interval 15 detik. Buat Vitest test yang memastikan reload hanya memuat partial props.

### 3.3 Halaman Moderasi Review Belum Ada (Medium)

- **Lokasi:** Route `GET /admin/moderation/reviews` terdaftar, controller tersedia, tetapi tidak ada file `resources/js/pages/Admin/Reviews/Index.tsx`.
- **Dampak:** Admin tidak dapat menyembunyikan/memulihkan review dari UI. Workflow moderasi review hanya tersedia via Pest.
- **Rekomendasi:** Buat `Admin/Reviews/Index.tsx` yang menampilkan daftar review tersembunyi dan tombol toggle hide.

### 3.4 CTA Ekspor Laporan (Low)

- **Lokasi:** `Admin/Reports/Index.tsx` tidak memiliki tautan eksplisit ke `/admin/reports/export`.
- **Dampak:** Admin harus menyalin URL secara manual untuk mengunduh CSV. Minor.
- **Rekomendasi:** Tambahkan tombol "Ekspor CSV" di header halaman Reports.

### 3.5 Halaman `settings/profile.tsx` Tidak Terdaftar (Low)

- **Lokasi:** `resources/js/pages/settings/profile.tsx` (residu Fortify default).
- **Dampak:** Tidak ada route yang merender halaman ini. Aman untuk dihapus pasca-RC.
- **Rekomendasi:** Hapus file atau pindahkan ke `_unused/` hingga Fortify settings UI diaktifkan kembali.

### 3.6 `console.warn` di `use-clipboard.ts` (Low)

- **Lokasi:** `resources/js/hooks/use-clipboard.ts:13, 24`.
- **Dampak:** Pesan warning di console saat Clipboard API tidak tersedia. Tidak memblokir fungsionalitas.
- **Rekomendasi:** Bungkus dengan `import.meta.env.DEV` agar tidak muncul di produksi.

---

## 4. Statistik Status Halaman

| Status | Jumlah Halaman | Persentase |
| --- | --- | --- |
| Complete | 41 | ~89% |
| Partial | 4 | ~9% |
| Missing | 1 (moderasi review) | ~2% |
| **Total** | **46** | 100% |

> **Catatan:** Statistik mencakup hanya halaman Inertia React (45) ditambah residu `settings/profile.tsx` (1).

### 4.1 Refactor Layout Shell per Peran (2026-06-18)

- **Status:** Resolved.
- **Tindakan:** Mengikuti [ADR-031](./DECISIONS.md#adr-031--role-specific-layout-shells-admin-dashboard-vs-marketplace), frontend dipisah menjadi `PublicLayout`, `AuthLayout`, `MarketplaceLayout` (UMKM/Creator), `AdminDashboardLayout`, dan `CollaborationWorkspaceLayout`. Konfigurasi navigasi dipusatkan di `resources/js/config/navigation.ts`; pemilihan layout terjadi di `resources/js/app.tsx` berdasarkan prefix nama page.
- **Dampak:** Tidak ada halaman UMKM/Creator yang lagi menampilkan sidebar Admin. Halaman beranda UMKM dan Creator didesain ulang sebagai landing-style personalized page (hero, statistik ringkas, kartu campaign/kolaborasi, empty-state, dan tips).
- **Komponen yang dihapus:** `app-header`, `app-shell`, `app-content`, `app-sidebar-header`, `app-sidebar-layout`, `app-header-layout`, `nav-user`, `user-menu-content`, `user-info`, `nav-footer` (semua tidak lagi dipakai).
- **Verifikasi:** Vitest baru di `tests/Frontend/Layouts/` (5 file) dan `tests/Frontend/navigation.test.ts` mengunci perilaku: UMKM/Creator tidak pernah merender `admin-sidebar`, Admin merender sidebar, role-specific navigation berisi URL yang benar, mobile menu terbuka/tertutup, primary action UMKM menunjuk ke `/umkm/campaigns/create`, dan collaboration workspace tidak mengandung shell Admin.
- **Test suite:** 54 Vitest cases / 23 files PASS. `npm run build` lulus. `tsc --noEmit` dan `eslint .` bersih.

---

## 5. Daftar Periksa Sisa Pekerjaan (Frontend)

1. [ ] Buat `resources/js/pages/Admin/Reviews/Index.tsx` untuk halaman moderasi review (Severity: Medium).
2. [ ] Ganti `tabs-mock.tsx` dengan shadcn/ui Tabs resmi di halaman kolaborasi UMKM & Creator (Severity: Low).
3. [ ] Implementasikan polling pesan 15 detik (ADR-009) di `Umkm/Collaborations/Show.tsx` dan `Creator/Collaborations/Show.tsx` (Severity: Medium).
4. [ ] Tambahkan tombol "Ekspor CSV" di `Admin/Reports/Index.tsx` (Severity: Low).
5. [ ] Bungkus `console.warn` di `use-clipboard.ts` dengan `import.meta.env.DEV` (Severity: Low).
6. [ ] Putuskan nasib `settings/profile.tsx` (hapus atau integrasikan) (Severity: Low).
7. [ ] Tambahkan Vitest component test untuk halaman dengan status Partial (kolaborasi, admin reviews, admin reports) (Severity: Medium — lihat TEST_PLAN.md §6).
8. [ ] Verifikasi render di mobile viewport (skill `adapt`) untuk halaman kolaborasi yang panjang (Severity: Low).

---

## 6. Referensi Silang

- routes/web.php — Definisi route.
- resources/js/pages/** — Halaman Inertia.
- PRD §9 — Fitur MVP.
- USE_CASE.md — Aktor & skenario.
- TDD §7 — Struktur frontend.
- TEST_PLAN.md — Cakupan uji.
- DECISIONS.md — ADR-009 (polling pesan).
- AGENTS.md §3, §4 — Scope MVP & stack.
