# E2E Flow Audit — Collabite

> **Versi:** 1.1
> **Tanggal:** 2026-06-18
> **Tujuan:** Memetakan seluruh Use Case MVP ke route, controller, action, model, notifikasi, dan test otomatis. Dokumen ini menjadi acuan audit E2E.
> **Status:** Read-only audit (RC.2). Hasil eksekusi per-flow tercantum di `docs/E2E_FLOW_RESULT.md`.

---

## 1. Source-of-Truth

| Dokumen | Versi | Acuan |
| --- | --- | --- |
| PRD | 1.1 | Behavior produk, FR/NFR, business rules, state produk |
| USE_CASE | 1.1 | Skenario aktor, langkah-langkah, kondisi |
| TDD | 1.2 | Arsitektur, ERD, state transition, struktur folder |
| TEST_PLAN | 1.1 | Traceability test case |
| DECISIONS | 1.2 | ADR, termasuk ADR-030 (admin collaboration namespace) & ADR-031 (layout shell) |
| AGENTS.md | 1.0 | Aturan kerja agent |
| LOGIN_FLOW_DEBUG | 1.0 | Reproduksi + fix untuk `DEF-AUTH-001` |

---

## 2. State Transition Tables

### 2.1 Campaign

| Source | Target | Actor | Trigger | Policy | Action / Service | Notifikasi | Audit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Draft` | `Open` | UMKM | Publish | `CampaignPolicy@update` | `PublishCampaignAction` | none | none |
| `Draft` | `Cancelled` | UMKM | Cancel | `CampaignPolicy@update` | `CancelCampaignAction` (jika tidak ada kolaborasi) | none | none |
| `Open` | `InCollaboration` | System | Accept request | n/a (via `CollaborationPolicy@view`) | `AcceptRequestAction` | none | `collaboration.accepted` |
| `Open` | `Cancelled` | UMKM | Cancel | `CampaignPolicy@update` | `CancelCampaignAction` (jika tidak ada kolaborasi, auto-reject pending) | none | none |
| `InCollaboration` | `Open` | System | Cancel collaboration pre-approval | `CollaborationPolicy@view` | `CancelCollaborationAction` (kembalikan campaign ke `Open`) | none | `collaboration.cancelled` |
| `InCollaboration` | `Completed` | System | UMKM complete | `CollaborationPolicy@view` + `CompleteCollaborationAction` (cek `approved` submission) | `CompleteCollaborationAction` | none | none |
| `InCollaboration` | `Open` | System | Admin force-close | `EnsureUserHasRole:admin` | `ForceCloseCollaborationAction` (hapus `completed_at`, set `cancelled_*`, campaign kembali `Open`) | `CollaborationForceClosedNotification` ke UMKM + Creator | `collaboration.force_closed` |

### 2.2 Collaboration Request

| Source | Target | Actor | Trigger | Policy | Action | Constraint |
| --- | --- | --- | --- | --- | --- | --- |
| (none) | `Pending` (application) | Creator | Apply | `CampaignPolicy@view` (Creator dapat melihat `Open`) | `Creator\CollaborationsController@apply` | Status `Open`; tidak ada duplikat `(creator_id, campaign_id)` dengan status `pending/accepted` |
| (none) | `Pending` (invitation) | UMKM | Invite | `CampaignPolicy@update` (pemilik) | `InviteCreatorAction` | Status `Open`; tidak ada duplikat; Creator role=creator |
| `Pending` (application) | `Accepted` | UMKM | Accept | `CollaborationPolicy@view` (UMKM via collaboration) **ATAU** `acceptByRequest` (cek `umkmProfile.user_id`) | `AcceptRequestAction` | Auto-reject pending lain untuk campaign yang sama; bentuk `Collaboration` `Active`; conversation `firstOrCreate`; campaign → `InCollaboration` |
| `Pending` (invitation) | `Accepted` | Creator | Accept | `CollaborationPolicy@view` | `AcceptRequestAction` | Sama seperti di atas |
| `Pending` | `Rejected` | UMKM/Creator | Reject | `CollaborationRequestPolicy@respond` atau `acceptByRequest/rejectByRequest` | `RejectRequestAction` | Sumber `Pending`; reason optional |
| `Pending` (application) | `CancelledByCreator` | Creator | Cancel | `CollaborationRequestPolicy@cancel` | `CancelApplicationAction` | Hanya `application`; hanya Creator pemilik |
| `Pending` (invitation) | `CancelledByUmkm` | UMKM | Cancel | belum di-route (Use Case tidak eksplisit mensyaratkan) | n/a | n/a |

### 2.3 Content Submission

| Source | Target | Actor | Trigger | Action | Constraint |
| --- | --- | --- | --- | --- | --- |
| (none) | `Draft` | Creator | Upload v1 | `Creator\CollaborationsController@storeSubmission` | Kolaborasi `Active`; auto-version = max+1 |
| `Draft` | `InReview` | Creator | Submit for review | `SubmitForReviewAction` | status `Draft` atau `RevisionRequested` |
| `InReview` | `RevisionRequested` | UMKM | Request revision | `RequestRevisionAction` | status `InReview`; catat `content_revisions` |
| `RevisionRequested` | `Draft` (v+1) | Creator | Resubmit | `ResubmitSubmissionAction` | status `RevisionRequested`; tolak jika `Approved` sudah ada (BR-014) |
| `InReview` | `Approved` | UMKM | Approve | `ApproveSubmissionAction` | status `InReview`; set `approved_at`; izinkan complete |
| `Approved` | `Superseded` | System | Resubmit membuat v baru | `ResubmitSubmissionAction` | hanya jika v lama `RevisionRequested`; tolak jika `Approved` sudah ada |

### 2.4 Collaboration

| Source | Target | Actor | Trigger | Action | Constraint |
| --- | --- | --- | --- | --- | --- |
| (none) | `Active` | System | `AcceptRequestAction` | `AcceptRequestAction` | `started_at = now`; campaign `InCollaboration` |
| `Active` | `Completed` | UMKM | Complete | `CompleteCollaborationAction` | Ada submission `Approved`; hanya UMKM; set `completed_at`; campaign `Completed` |
| `Active` | `Cancelled` | UMKM/Creator | Cancel pre-approval | `CancelCollaborationAction` | alasan ≥10 char; tolak jika ada `Approved` (kecuali admin force) |
| `Active` | `Cancelled` | Admin | Force close | `ForceCloseCollaborationAction` | alasan ≥10 char; izinkan walau `Approved`; notif + audit |
| `Completed` | (terminal) | — | — | — | Reviews available; tidak ada transisi lain |
| `Cancelled` | (terminal) | — | — | — | Notif sudah dikirim saat cancel; reviews tidak dibuat |

### 2.5 Creator Verification

| Source | Target | Actor | Trigger | Service | Constraint |
| --- | --- | --- | --- | --- | --- |
| `Unverified` | `Pending` | Creator | Submit documents | `Creator\VerificationController@submit` | Profil headline/bio + minimal 1 portfolio |
| `Pending` | `Verified` | Admin | Approve | `Admin\VerificationsController@approve` | Set `creator_profiles.verification_status = Verified` |
| `Pending` | `Rejected` | Admin | Reject | `Admin\VerificationsController@reject` | Alasan ≥5 char; profil `Rejected`; Creator bisa ajukan ulang |
| `Rejected` | `Pending` | Creator | Resubmit | `Creator\VerificationController@submit` | Membuat baris `creator_verifications` baru |
| `Verified` | (terminal) | — | — | — | Tombol ajukan verifikasi tidak tampil |

### 2.6 User Account Status

| Source | Target | Actor | Trigger | Constraint |
| --- | --- | --- | --- | --- |
| `Active` | `Suspended` | Admin | Suspend | `Admin\UsersController@updateStatus`; user tidak dapat login (cek di `AuthenticatedSessionController@store`) |
| `Suspended` | `Active` | Admin | Re-enable | Sama |
| `Suspended` | (terminal-mid) | — | — | Middleware `active` menolak akses ke portal (BR-010) |

---

## 3. Route Map per Use Case

| Use Case | Route (Method) | Controller | Form Request / Action | Expected DB State | Notification | Test |
| --- | --- | --- | --- | --- | --- | --- |
| UC-AUTH-001 Register UMKM | `POST /register/umkm` | `Auth\RegisteredUserController@storeUmkm` | `RegisterUmkmRequest` → `RegisterUmkmAction` | `users` + `umkm_profiles` baru; `email_verified_at=null` | none | `tests/Feature/Auth/*` |
| UC-AUTH-002 Register Creator | `POST /register/creator` | `Auth\RegisteredUserController@storeCreator` | `RegisterCreatorRequest` → `RegisterCreatorAction` | `users` + `creator_profiles` baru | none | `tests/Feature/Auth/*` |
| UC-AUTH-003 Login | `POST /login` | `Auth\AuthenticatedSessionController@store` | inline validation | session di-rebuild; tolak suspended | none | `tests/Feature/Auth/*` |
| UC-AUTH-004 Logout | `POST /logout` | `Auth\AuthenticatedSessionController@destroy` | n/a | session invalidated | none | `tests/Feature/Auth/*` |
| UC-PROF-001 UMKM profile | `GET/PATCH /umkm/profile` | `Umkm\ProfileController` | `UpdateUmkmProfileRequest` | `umkm_profiles` updated | none | `tests/Feature/Profile/*` |
| UC-PROF-002 Produk | `GET/POST /umkm/products` | `Umkm\ProductsController` | `ProductRequest` | `products` baru/update | none | `tests/Feature/Profile/ProductTest.php` |
| UC-PROF-003 Creator profile | `GET/PATCH /creator/profile` | `Creator\ProfileController` | `UpdateCreatorProfileRequest` | `creator_profiles` updated | none | `tests/Feature/Profile/*` |
| UC-PROF-004 Skills | `GET/PATCH /creator/skills` | `Creator\SkillsController` | `UpdateCreatorSkillsRequest` | `creator_skills` pivot | none | `tests/Feature/Portfolio/*` |
| UC-PROF-005 Categories | `POST /creator/profile` (sync) | same | same | `creator_categories` pivot | none | `tests/Feature/Profile/*` |
| UC-PROF-006 Portfolio | `GET/POST/DELETE /creator/portfolio` | `Creator\PortfolioController` | `PortfolioItemRequest` | `portfolio_items` | none | `tests/Feature/Portfolio/*` |
| UC-VERIF-001 Submit | `POST /creator/verification` | `Creator\VerificationController@submit` | `SubmitVerificationRequest` | `creator_verifications` (Pending) + documents | none | `tests/Feature/Verification/SubmissionTest.php` |
| UC-VERIF-002 Admin review | `POST /admin/verifications/{v}/approve`/`reject` | `Admin\VerificationsController` | inline | `verifications` + `creator_profiles.verification_status` | none | `tests/Feature/Verification/AdminReviewTest.php` |
| UC-CAMP-001 Create | `POST /umkm/campaigns` | `Umkm\CampaignsController@store` | `StoreCampaignRequest` + `CreateCampaignAction` | `campaigns` (Draft) + `campaign_deliverables` | none | `tests/Feature/Campaign/*` |
| UC-CAMP-002 Edit | `PATCH /umkm/campaigns/{campaign}` | `Umkm\CampaignsController@update` | `UpdateCampaignRequest` | updated | none | `tests/Feature/Campaign/*` |
| UC-CAMP-003 Cancel | `POST /umkm/campaigns/{campaign}/cancel` | `Umkm\CampaignsController@cancel` | `CancelCampaignAction` | `campaigns.cancelled`; auto-reject pending requests | none | `tests/Feature/Campaign/*` |
| UC-CAMP-004 Publish | `POST /umkm/campaigns/{campaign}/publish` | `Umkm\CampaignsController@publish` | `PublishCampaignAction` | `campaigns.published_at`; status `Open` | none | `tests/Feature/Campaign/*` |
| UC-CAMP-005 List UMKM | `GET /umkm/campaigns` | `Umkm\CampaignsController@index` | n/a | read | none | `tests/Feature/Campaign/*` |
| UC-CAMP-006 Browse Creator | `GET /creator/campaigns` | `Creator\CampaignsController@index` | n/a | read | none | `tests/Feature/Campaign/*` |
| UC-CAMP-007 Detail Creator | `GET /creator/campaigns/{campaign}` | `Creator\CampaignsController@show` | `CampaignPolicy@view` | read | none | `tests/Feature/Campaign/*` |
| UC-DISC-001 Search | `GET /umkm/discover` | `Umkm\DiscoverController@index` | n/a | read | none | `tests/Feature/Discovery/*` |
| UC-DISC-002 Filter | same | same | n/a | read | none | `tests/Feature/Discovery/*` |
| UC-DISC-003 Profile publik | `GET /creators/{creatorProfile}` | `Public\CreatorDirectoryController@show` | n/a | read | none | `tests/Feature/Discovery/*` |
| UC-COLLAB-001 Apply | `POST /creator/campaigns/{campaign}/apply` | `Creator\CollaborationsController@apply` | `ApplyCampaignRequest` | `collaboration_requests` (Pending, Application) | none | `tests/Feature/Collaboration/ApplicationTest.php` |
| UC-COLLAB-002 Invite | `POST /umkm/campaigns/{campaign}/invitations` (atau `/umkm/collaborations/{c}/invitations`) | `Umkm\CollaborationsController@invite`/`inviteByCampaign` | `InviteCreatorRequest` + `InviteCreatorAction` | `collaboration_requests` (Pending, Invitation) | none | `tests/Feature/Collaboration/ApplicationTest.php` |
| UC-COLLAB-003 Duplicate prevention | enforced in `apply` (controller-level) and `InviteCreatorAction` (action-level) | — | — | unique constraint `unique_active_request_per_creator_campaign` | none | `tests/Feature/Collaboration/ApplicationTest.php::duplicate application is rejected` |
| UC-COLLAB-004 Accept application | `POST /umkm/requests/{request}/accept` atau `POST /umkm/collaborations/{c}/requests/{r}/accept` | `Umkm\CollaborationsController@acceptRequest/acceptByRequest` | `AcceptRequestAction` | request `Accepted`; pending lain `Rejected`; `collaborations` baru `Active`; `conversations` baru; `campaigns.status = InCollaboration` | none | `tests/Feature/Collaboration/ApplicationTest.php` |
| UC-COLLAB-005 Accept invitation | `POST /creator/collaborations/{c}/requests/{r}/accept` | `Creator\CollaborationsController@acceptRequest` | `AcceptRequestAction` | sama | none | `tests/Feature/Collaboration/ApplicationTest.php` |
| UC-COLLAB-006 Cancel application | `POST /creator/collaborations/{c}/requests/{r}/cancel` | `Creator\CollaborationsController@cancelRequest` | `CancelApplicationAction` | request `CancelledByCreator` | none | `tests/Feature/Collaboration/*` |
| UC-COLLAB-007 Collaboration created | via `AcceptRequestAction` | — | — | collaborations + conversation | — | `tests/Feature/Collaboration/*` |
| UC-COLLAB-008 UMKM list | `GET /umkm/collaborations` | `Umkm\CollaborationsController@index` | n/a | read | — | `tests/Feature/Collaboration/*` |
| UC-COLLAB-009 Creator list | `GET /creator/collaborations` | `Creator\CollaborationsController@index` | n/a | read | — | `tests/Feature/Collaboration/*` |
| UC-COLLAB-010 Participant-only access | `CollaborationPolicy@view` | — | — | 403 untuk non-peserta | — | `tests/Feature/Authorization/*` |
| UC-COLLAB-011 Admin force close | `POST /admin/collaborations/{c}/force-close` | `Admin\CollaborationsController@forceClose` | `ForceCloseCollaborationRequest` + `ForceCloseCollaborationAction` | collaborations `Cancelled`; campaign `Open`; audit; notif | `CollaborationForceClosedNotification` (database channel) | `tests/Feature/Admin/CollaborationsTest.php` |
| UC-COM-001..004 Messaging | `POST /{role}/collaborations/{c}/messages` | `Umkm\CollaborationsController@sendMessage` & `Creator\CollaborationsController@sendMessage` | `SendMessageRequest` | `messages`; `read_at` di-update; tolak jika status bukan `Active` | none | `tests/Feature/Messaging/MessagingTest.php` |
| UC-CONT-001 Progress | `POST /creator/collaborations/{c}/progress` | `Creator\CollaborationsController@storeProgress` | `StoreProgressRequest` | `collaboration_progress_updates` | none | `tests/Feature/Content/*` |
| UC-CONT-002 Upload submission | `POST /creator/collaborations/{c}/submissions` | `Creator\CollaborationsController@storeSubmission` | `StoreSubmissionRequest` | `content_submissions` (Draft v1) + files | none | `tests/Feature/Content/ContentTest.php` |
| UC-CONT-003 Submit for review | `POST /creator/collaborations/{c}/submissions/{s}/submit-for-review` | `Creator\CollaborationsController@submitForReview` | `SubmitForReviewRequest` + `SubmitForReviewAction` | status `InReview` | none | `tests/Feature/Content/ContentTest.php` |
| UC-CONT-004 Request revision | `POST /umkm/collaborations/{c}/submissions/{s}/request-revision` | `Umkm\CollaborationsController@requestRevision` | `RequestRevisionAction` | status `RevisionRequested` + `content_revisions` row | none | `tests/Feature/Content/ContentTest.php` |
| UC-CONT-005 Approve | `POST /umkm/collaborations/{c}/submissions/{s}/approve` | `Umkm\CollaborationsController@approveSubmission` | `ApproveSubmissionAction` | status `Approved`; `approved_at` | none | `tests/Feature/Content/ContentTest.php` |
| UC-CONT-006 Resubmit | `POST /creator/collaborations/{c}/submissions/{s}/resubmit` | `Creator\CollaborationsController@resubmit` | `ResubmitSubmissionRequest` + `ResubmitSubmissionAction` | v lama `Superseded`; v baru `Draft` | none | `tests/Feature/Content/ContentTest.php` |
| UC-CONT-007 Complete | `POST /umkm/collaborations/{c}/complete` | `Umkm\CollaborationsController@complete` | `CompleteCollaborationAction` | collaborations `Completed`; campaign `Completed`; harus ada `Approved` | none | `tests/Feature/Content/ContentTest.php` + `tests/Feature/Review/*` |
| UC-CONT-008 Invalid transition | enforced in action classes | — | — | ValidationException | — | `tests/Feature/Content/ContentTest.php` |
| UC-REV-001..004 Reviews | `POST /{role}/collaborations/{c}/review` | `Umkm\ReviewsController::storeForUmkm` + `Umkm\CollaborationsController::storeReviewStatic` + `Creator\CollaborationsController::submitReview` | `StoreReviewAction` (rating 1-5; max 2000) | `reviews`; aggregate `creator_profile.rating_avg/count` | none | `tests/Feature/Review/ReviewTest.php` |
| UC-ADMIN-001 Suspend | `PATCH /admin/users/{user}/status` | `Admin\UsersController@updateStatus` | inline | `users.account_status` | none | `tests/Feature/Admin/ModerationTest.php` |
| UC-ADMIN-002 Dashboard | `GET /admin/dashboard` | `Admin\DashboardController@index` | n/a | read | none | n/a (read) |
| UC-ADMIN-003 List users | `GET /admin/users` | `Admin\UsersController@index` | n/a | read | none | `tests/Feature/Admin/*` |
| UC-ADMIN-004 Verifications | `GET /admin/verifications[/{v}]` | `Admin\VerificationsController` | n/a | read | none | `tests/Feature/Verification/AdminReviewTest.php` |
| UC-ADMIN-005 Campaign moderation | `GET /admin/moderation/campaigns` | `Admin\ModerationController@campaigns` | n/a | read hidden | none | `tests/Feature/Admin/ModerationTest.php` |
| UC-ADMIN-006 Content moderation | `GET /admin/moderation/content` | `Admin\ModerationController@content` | n/a | read hidden | none | `tests/Feature/Admin/ModerationTest.php` |
| UC-ADMIN-007 Review moderation | `GET /admin/moderation/reviews` | `Admin\ModerationController@reviews` | n/a | read hidden; **page not implemented (FRONTEND_GAP_ANALYSIS §3.3)** | none | `tests/Feature/Admin/ModerationTest.php` |
| UC-ADMIN-008 Audit log | `GET /admin/audit-logs` | `Admin\AuditLogController@index` | n/a | read | none | `tests/Feature/Audit/*` |
| UC-ADMIN-009 Reports | `GET /admin/reports` | `Admin\ReportsController@index` | n/a | read | none | `tests/Feature/Admin/*` |
| UC-ADMIN-010 Force close | `POST /admin/collaborations/{c}/force-close` | `Admin\CollaborationsController@forceClose` | `ForceCloseCollaborationRequest` + `ForceCloseCollaborationAction` | `cancelled_*` set; campaign `Open`; audit; notif | DB notif ke UMKM + Creator | `tests/Feature/Admin/CollaborationsTest.php` |
| UC-NOTIF-001..003 | notifications delivered via `Illuminate\Notifications\Notifiable` (Laravel bawaan). In-app: `database` channel. Email: Mailable + queue. | — | — | `notifications` table | — | `tests/Feature/Notification/*` + `tests/Feature/Admin/CollaborationsTest.php` |
| UC-AUDIT-001 | `AuditLogger::log()` di Action | — | — | `activity_logs` | — | `tests/Feature/Audit/AuditLoggerTest.php` |
| UC-AUDIT-002 | `Admin\AuditLogController@index` | n/a | read | — | n/a |

---

## 4. Cross-Module Concerns

### 4.1 Policies & Authorization

| Resource | Policy | Methods exposed | Used at |
| --- | --- | --- | --- |
| User | `UserPolicy` | minimal | `Admin\UsersController@updateStatus` checks `isAdmin` |
| UmkmProfile | `UmkmProfilePolicy` | — | not directly used in current routes (controller inline) |
| CreatorProfile | `CreatorProfilePolicy` | — | not directly used (public read) |
| Campaign | `CampaignPolicy` | `view`, `update`, `delete` | UMKM `show/edit/update/publish/cancel`; Creator `show` |
| CollaborationRequest | `CollaborationRequestPolicy` | `view`, `cancel`, `respond` | (tidak di-`$this->authorize` di controller; manual guard di `acceptByRequest/rejectByRequest`) |
| Collaboration | `CollaborationPolicy` | `view`, `sendMessage`, `complete` | UMKM/Creator `show/sendMessage/storeProgress/storeSubmission/.../complete`; **Admin tidak boleh masuk route UMKM/Creator** (lihat note) |
| ContentSubmission | `ContentSubmissionPolicy` | — | not used (logic in action classes) |
| Review | `ReviewPolicy` | — | inline check in `StoreReviewAction` |
| Verification | `VerificationPolicy` | — | inline check in `Admin\VerificationsController` (admin only) |
| ActivityLog | `ActivityLogPolicy` | — | admin only via route group `role:admin` |

> **Catatan:** `CollaborationPolicy@view` di `app/Policies/CollaborationPolicy.php:16-22` eksplisit menolak Admin; admin hanya boleh akses via `/admin/collaborations/{collaboration}` (namespace terpisah, ADR-030). Test `tests/Feature/Admin/CollaborationsTest.php::admin cannot use UMKM accept/reject routes (403 via role middleware)` memverifikasi role middleware.

### 4.2 Form Requests

| Form Request | Authorize | Rules | Cross-field | Custom Error |
| --- | --- | --- | --- | --- |
| `RegisterUmkmRequest` | `isUmkm` (default `true`) | name, email unique, password, business_name, business_type | — | — |
| `RegisterCreatorRequest` | `isCreator` | name, email, password, kategori/keahlian optional | — | — |
| `UpdateUmkmProfileRequest` | `isUmkm` | business_name required, logo image ≤ 2MB | — | — |
| `UpdateCreatorProfileRequest` | `isCreator` | photo image ≤ 2MB | — | — |
| `StoreCampaignRequest` | `isUmkm` | title, description, category, budget, deadline, deliverables | `deadline > today` (Laravel `after:today`) | — |
| `UpdateCampaignRequest` | `isUmkm` | same | — | — |
| `StoreReviewRequest` (UMKM) | `user !== null` | rating 1-5, body ≤ 2000 | — | — |
| `ReviewRequest` (collaboration) | `user !== null` | sama | — | — |
| `SendMessageRequest` | `user !== null` | body required ≤ 5000 | — | — |
| `StoreProgressRequest` | `isCreator` | message required ≤ 2000 | — | — |
| `CancelCollaborationRequest` | `user !== null` | reason ≥10 char | — | — |
| `StoreSubmissionRequest` | `isCreator` | title, description, files ≤5 each | `files.*` mimes, max 102400KB | — |
| `ResubmitSubmissionRequest` | `isCreator` | same as Store | — | — |
| `SubmitForReviewRequest` | `user !== null` | (no rules; controller enforces via Action) | — | — |
| `InviteCreatorRequest` | `isUmkm` | campaign_id, creator_id, message ≤ 2000 | custom: cek `umkm_profile_id == campaign.umkm_profile_id` | "Campaign tidak ditemukan atau bukan milik Anda" |
| `ApplyCampaignRequest` | `isCreator` | message ≤ 2000 | — | — |
| `PortfolioItemRequest` | `isCreator` | title required, media image ≤ 4MB (PRD §21: ≤ 5MB; lihat M-A01) | — | — |
| `SubmitVerificationRequest` | `isCreator` | documents[].type (enum), documents[].file (mimes, ≤5MB) | — | — |
| `UpdateCreatorSkillsRequest` | `isCreator` | skills, categories IDs | — | — |
| `ForceCloseCollaborationRequest` | `isAdmin` | reason ≥10 char ≤1000 | — | message: "Alasan wajib diisi.", "Alasan minimal 10 karakter." |

### 4.3 Audit Coverage (read-only)

Action classes yang menulis `activity_logs`:

| Action | Event | Subject | Metadata |
| --- | --- | --- | --- |
| `AcceptRequestAction` | `collaboration.accepted` | `Collaboration` | `campaign_id`, `request_id`, `creator_id` |
| `CancelCollaborationAction::execute` | `collaboration.cancelled` | `Collaboration` | `reason` |
| `CancelCollaborationAction::forceClose` (legacy path) | `collaboration.force_closed` | `Collaboration` | `reason` |
| `ForceCloseCollaborationAction` (current Admin path) | `collaboration.force_closed` | `Collaboration` | `reason`, `previous_status`, `new_status` |
| `DemoDataSeeder` | `demo.creator.verified`, `demo.verification.submitted`, `demo.verification.rejected` | various | various |

> **Gap (M-A03 in DEFECTS.md, medium, accepted):** 11 event mutatif lain tidak menulis audit (account.suspend/activate, verification.approved/rejected, campaign.published/cancelled/hidden/unhidden, submission.hidden/unhidden, content.approved, collaboration.completed, review.hidden/unhidden). Backlog post-RC.

### 4.4 Notification Coverage

| Event | Class | Channels | Recipients |
| --- | --- | --- | --- |
| Force close | `CollaborationForceClosedNotification` | `database` (in-app) | UMKM + Creator |

> **Gap (NFR §3):** Spec PRD mensyaratkan notifikasi in-app + email untuk banyak event (request, accept, message, submission, revision, approval, completion, review). Saat ini hanya force-close yang mengirim notifikasi. Backlog post-MVP.

---

## 5. Layout & Frontend Shell

- `resources/js/layouts/PublicLayout.tsx` — landing, direktori publik.
- `resources/js/layouts/AuthLayout.tsx` — login, register, lupa password, verifikasi.
- `resources/js/layouts/MarketplaceLayout.tsx` — UMKM & Creator portal (top navbar, role-specific menu).
- `resources/js/layouts/AdminDashboardLayout.tsx` — Admin (sidebar + breadcrumb).
- `resources/js/layouts/CollaborationWorkspaceLayout.tsx` — workspace kolaborasi UMKM/Creator (tab Pesan/Progres/Submission/Review).

Pemilihan layout terjadi di `resources/js/app.tsx` berdasarkan prefix nama page (lihat ADR-031). Navigasi terpusat di `resources/js/config/navigation.ts`.

> **Gap (FRONTEND_GAP_ANALYSIS §3.3):** Halaman `Admin/Reviews/Index.tsx` (moderasi review) belum dibuat, route sudah ada.

---

## 6. Page-to-Backend Mapping (Inertia)

| Halaman | Backend Controller Method | Status UI |
| --- | --- | --- |
| `Umkm/Dashboard/Index` | `Umkm\DashboardController@index` | Complete |
| `Umkm/Profile/Edit` | `Umkm\ProfileController@edit/update` | Complete |
| `Umkm/Products/Index` | `Umkm\ProductsController@index` | Complete |
| `Umkm/Campaigns/Index` | `Umkm\CampaignsController@index` | Complete |
| `Umkm/Campaigns/Form` | `Umkm\CampaignsController@create/edit` | Complete |
| `Umkm/Campaigns/Show` | `Umkm\CampaignsController@show` | Complete |
| `Umkm/Discover/Index` | `Umkm\DiscoverController@index` | Complete |
| `Umkm/Collaborations/Index` | `Umkm\CollaborationsController@index` | Complete |
| `Umkm/Collaborations/Show` | `Umkm\CollaborationsController@show` | Partial (`tabs-mock` + no 15s polling) |
| `Umkm/Reviews/Index` | `Umkm\ReviewsController@index` | Complete |
| `Creator/Dashboard/Index` | `Creator\DashboardController@index` | Complete |
| `Creator/Profile/Edit` | `Creator\ProfileController@edit/update` | Complete |
| `Creator/Portfolio/Index` | `Creator\PortfolioController@index` | Complete |
| `Creator/Skills/Edit` | `Creator\SkillsController@edit/update` | Complete |
| `Creator/Verification/Show` | `Creator\VerificationController@show/submit` | Complete |
| `Creator/Campaigns/Index` | `Creator\CampaignsController@index` | Complete |
| `Creator/Campaigns/Show` | `Creator\CampaignsController@show` | Complete |
| `Creator/Collaborations/Index` | `Creator\CollaborationsController@index` | Complete |
| `Creator/Collaborations/Show` | `Creator\CollaborationsController@show` | Partial (`tabs-mock` + no polling) |
| `Admin/Dashboard/Index` | `Admin\DashboardController@index` | Complete |
| `Admin/Users/Index` | `Admin\UsersController@index` | Complete |
| `Admin/Verifications/Index` | `Admin\VerificationsController@index` | Complete |
| `Admin/Verifications/Show` | `Admin\VerificationsController@show` | Complete |
| `Admin/Campaigns/Index` | `Admin\ModerationController@campaigns` | Complete |
| `Admin/Content/Index` | `Admin\ModerationController@content` | Complete |
| `Admin/Reviews/Index` | `Admin\ModerationController@reviews` | **Missing** (route 500 di FE) |
| `Admin/AuditLogs/Index` | `Admin\AuditLogController@index` | Complete |
| `Admin/Reports/Index` | `Admin\ReportsController@index` | Complete (no CSV CTA) |
| `Admin/Collaborations/Index` | `Admin\CollaborationsController@index` | Complete |
| `Admin/Collaborations/Show` | `Admin\CollaborationsController@show` | Complete |

---

## 7. State-Change Coverage Map (per tombol di FE)

| Tombol di FE | Route | Method | Action | Resulting state |
| --- | --- | --- | --- | --- |
| `Buat Campaign` (UMKM form) | `POST /umkm/campaigns` | store | `CreateCampaignAction` | `Draft` |
| `Simpan Perubahan` (UMKM form edit) | `PATCH /umkm/campaigns/{id}` | update | inline | `Draft`/`Open` |
| `Publikasikan` | `POST /umkm/campaigns/{id}/publish` | publish | `PublishCampaignAction` | `Open` |
| `Batalkan` (campaign) | `POST /umkm/campaigns/{id}/cancel` | cancel | `CancelCampaignAction` | `Cancelled` (jika tidak ada kolaborasi) |
| `Lamar Campaign Ini` (Creator) | `POST /creator/campaigns/{id}/apply` | apply | inline | `Pending` request (application) |
| `Kirim Lamaran` | same | same | same | same |
| `Edit` (UMKM review) | `GET /umkm/collaborations/{c}/review` (tidak ada — review via tab di Show) | — | — | — |
| Accept (UMKM) di tab campaign detail / list request | `POST /umkm/requests/{r}/accept` | acceptByRequest | `AcceptRequestAction` | request `Accepted`; collab `Active`; campaign `InCollaboration` |
| Reject (UMKM) | `POST /umkm/requests/{r}/reject` | rejectByRequest | `RejectRequestAction` | request `Rejected` |
| Accept (UMKM) di tab collaboration | `POST /umkm/collaborations/{c}/requests/{r}/accept` | acceptRequest | `AcceptRequestAction` | same |
| Reject (UMKM) di tab collaboration | `POST /umkm/collaborations/{c}/requests/{r}/reject` | rejectRequest | `RejectRequestAction` | same |
| `Kirim` (message) | `POST /{role}/collaborations/{c}/messages` | sendMessage | inline | new `messages` row; `read_at` di sisi penerima |
| `Posting Progres` (Creator) | `POST /creator/collaborations/{c}/progress` | storeProgress | inline | `collaboration_progress_updates` |
| `Upload Submission` | `POST /creator/collaborations/{c}/submissions` | storeSubmission | inline | `Draft` v1 |
| `Kirim untuk Review` (Creator) | `POST /creator/collaborations/{c}/submissions/{s}/submit-for-review` | submitForReview | `SubmitForReviewAction` | `InReview` |
| `Setujui` (UMKM) | `POST /umkm/collaborations/{c}/submissions/{s}/approve` | approveSubmission | `ApproveSubmissionAction` | `Approved`; `approved_at` |
| `Minta Revisi` (UMKM) | `POST /umkm/collaborations/{c}/submissions/{s}/request-revision` | requestRevision | `RequestRevisionAction` | `RevisionRequested`; `content_revisions` row |
| `Kirim untuk Review` (Creator, resubmit) | `POST /creator/collaborations/{c}/submissions/{s}/resubmit` | resubmit | `ResubmitSubmissionAction` | v lama `Superseded`; v baru `Draft` |
| `Selesaikan Kolaborasi` (UMKM) | `POST /umkm/collaborations/{c}/complete` | complete | `CompleteCollaborationAction` | collab `Completed`; campaign `Completed` |
| `Kirim Review` | `POST /{role}/collaborations/{c}/review` | storeReview / submitReview | `StoreReviewAction` | new `reviews`; aggregate update |
| `Tambah Portofolio` | `POST /creator/portfolio` | store | `PortfolioController@store` | new `portfolio_items` |
| `Hapus` portfolio | `DELETE /creator/portfolio/{id}` | destroy | same | soft-deleted |
| `Kirim Pengajuan` (verifikasi) | `POST /creator/verification` | submit | `VerificationController@submit` | new `creator_verifications` (Pending) |
| `Setujui` (Admin verifikasi) | `POST /admin/verifications/{v}/approve` | approve | `Admin\VerificationsController@approve` | `Verified`; profil `Verified` |
| `Tolak` (Admin verifikasi) | `POST /admin/verifications/{v}/reject` | reject | `Admin\VerificationsController@reject` | `Rejected`; profil `Rejected` |
| `Suspend/Activate` (Admin) | `PATCH /admin/users/{u}/status` | updateStatus | inline | `account_status` |
| `Force Close` (Admin) | `POST /admin/collaborations/{c}/force-close` | forceClose | `ForceCloseCollaborationAction` | collab `Cancelled`; campaign `Open`; audit + notif |
| `Hide/Unhide` (Admin moderation) | `PATCH /admin/moderation/{...}/{id}/hide` | toggle*Hide | inline | `is_hidden` toggle |

---

## 8. Ringkasan Temuan (high-level, lihat detail per-task di §9-§16)

| ID | Severity | Ringkasan | Lokasi |
| --- | --- | --- | --- |
| FND-1 | High | Halaman `Admin/Reviews/Index.tsx` tidak ada → klik menu moderasi review menampilkan 404 / blank page. Route & controller siap. | `resources/js/pages/Admin/Reviews/Index.tsx` (kosong) |
| FND-2 | Medium | `tabs-mock.tsx` digunakan di workspace kolaborasi UMKM/Creator; bukan shadcn/ui resmi. Animasi/keyboard nav terbatas. | `resources/js/components/ui/tabs-mock.tsx` |
| FND-3 | Medium | Polling pesan 15 detik (ADR-009) belum diimplementasikan. Pesan baru dari lawan bicara baru muncul setelah reload manual. | `Umkm/Collaborations/Show.tsx`, `Creator/Collaborations/Show.tsx` |
| FND-4 | Low | Tidak ada tombol "Ekspor CSV" eksplisit di halaman Reports; admin harus copy URL `/admin/reports/export`. | `Admin/Reports/Index.tsx` |
| FND-5 | Low | `use-clipboard.ts` menulis `console.warn` yang tampil di produksi. | `resources/js/hooks/use-clipboard.ts:13, 24` |
| FND-6 | Low | `settings/profile.tsx` adalah residu Fortify; tidak dirender. Aman untuk dihapus. | `resources/js/pages/settings/profile.tsx` |
| GAP-1 | High | `tests/E2E/01-creator-application.spec.ts` line 81 mengirim `POST /requests/{reqId}/accept` (route `umkm.requests.accept`). Namun E2E helper CSRF menyimpan cookie dari `GET /login` saja; cookie harus di-refresh setelah `clearCookies()` agar token baru. Riwayat: 2 passed / 14 failed per `docs/TEST_RESULTS.md`. | `tests/E2E/_helpers.ts`, `01..05 specs` |
| GAP-2 | Medium | Notifikasi in-app & email hanya dikirim untuk `collaboration.force_closed`. 8+ event lain (request, accept, message, submission, revision, approval, completion, review) belum punya notification. PRD FR-NOTIF-001/002 terlanggar parsial. | App-wide |
| GAP-3 | Medium | Audit log hanya menulis 5 event (collaboration.accepted, collaboration.cancelled, collaboration.force_closed, demo.*). 11 event mutatif lain tidak di-log (DEFECTS §M-A03). | App-wide |
| GAP-4 | Medium | Tidak ada endpoint upload lampiran pesan. Tabel `message_attachments` ada, view merender lampiran, tapi `SendMessageRequest` tidak menerima file. | `Collaboration\SendMessageRequest`, `app/Models/MessageAttachment.php` |
| GAP-5 | Medium | `PortfolioItemRequest` membatasi gambar 4MB (PRD §21: 5MB). Strict mode tidak menyebabkan masalah saat ini (test tidak menggunggah >4MB), tapi inconsistent dengan spec. | `app/Http/Requests/Creator/PortfolioItemRequest.php` |
| GAP-6 | Low | Inline `Request->validate()` di `Admin\VerificationsController` (reject) & `Admin\UsersController` (updateStatus). Konsistensi Form Request. | `Admin/VerificationsController.php:79-81`, `Admin/UsersController.php:58-61` |
| GAP-7 | Low | `Umkm\DashboardController@index` melakukan 3 query terpisah (campaigns_count, open_campaigns, collaborations). Bisa di-consolidate via `withCount`. | `Umkm/DashboardController.php:19-23` |
| GAP-8 | Low | Eager-load `VerificationController@show`: `$current->documents` lazy load. N=1 aman per request, tapi best practice eager. | `Creator/VerificationController.php:30-35` |

---

## 9. Audit Status (per flow)

Status flow saat ini **PASS di automated tests** (`php artisan test` 166/166, 562 assertions). Validasi browser E2E Playwright memiliki CSRF helper bug (GAP-1) yang menghambat eksekusi. Detail retest per flow lihat `docs/E2E_FLOW_RESULT.md`.

| Flow | Automated Test | Browser E2E | Catatan |
| --- | --- | --- | --- |
| Creator application | PASS | BLOCKED on CSRF helper | `01-creator-application.spec.ts` |
| UMKM invitation | PASS | n/a | covered by ApplicationTest |
| Creator verification | PASS | BLOCKED on CSRF helper | `03-verification-resubmission.spec.ts` |
| Revision / resubmit | PASS | BLOCKED on CSRF helper | covered in 01 |
| Completion + review | PASS | BLOCKED on CSRF helper | covered in 01 |
| Admin force-close | PASS | n/a | `tests/Feature/Admin/CollaborationsTest.php` (11 cases) |
| Authorization isolation | PASS | BLOCKED on CSRF helper | `04-authorization-isolation.spec.ts` |
| Invalid transitions | PASS | BLOCKED on CSRF helper | `05-invalid-transitions.spec.ts` |

---

## 10. Lampiran: Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 1.0 | 2026-06-18 | Initial traceability matrix: state tables (5 enums), route map per UC, audit & notification coverage, page-to-backend mapping, state-change map per tombol FE, summary temuan FND/GAP. | Senior QA Engineer (audit agent) |
