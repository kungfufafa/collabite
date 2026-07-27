# Collaboration Terms Consent Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Require explicit Collabite Terms of Service consent before accepting a collaboration request (application or invitation), and record consent evidence in the audit log.

**Architecture:** Shared Form Request validates `terms_accepted` on all accept HTTP endpoints. UI shows a required checkbox + link to `/syarat-dan-ketentuan`. `AcceptRequestAction` records accepting actor and server-side `terms_version` in `collaboration.accepted` audit metadata.

**Tech Stack:** Laravel 13, Form Request, Inertia React, Pest, Playwright

**Spec:** `docs/superpowers/specs/2026-07-27-collaboration-terms-consent-design.md`

## Global Constraints

- No electronic contract / PDF / e-sign (PRD §8 Non-Goal)
- No new migration; use existing ActivityLog
- Indonesian validation messages
- terms_version from server config only

---

## Task 1: Backend validation + audit metadata

- [x] Add `terms_version` to `config/collabite.php`
- [x] Create `AcceptCollaborationTermsRequest`
- [x] Wire Form Request into UMKM/Creator accept controller methods
- [x] Update `AcceptRequestAction` audit actor + consent metadata
- [x] Feature tests: reject without consent; accept with consent + audit

## Task 2: Frontend checkbox on accept UIs

- [x] UMKM Campaigns Show — accept application form
- [x] Creator Requests Index — accept invitation form
- [x] Also cover nested accept forms if present on collaboration show pages

## Task 3: Update callers + E2E

- [x] Update Feature tests that POST accept without consent
- [x] Update E2E-06 / E2E-07 (and demo if needed)
- [x] Pint + run affected tests
