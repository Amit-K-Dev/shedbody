# Phase 1C — User-Owned Data Referential Integrity Audit

## 1. Executive Summary
This report concludes a comprehensive, read-only audit of the production database (`libmchubiqdvhfqwfdwo`) to assess the referential integrity of all user-owned data.

**Key Findings:**
- The vast majority of user-owned tables (11 tables) correctly reference `auth.users(id)` with `ON DELETE CASCADE`.
- One table (`posts`) correctly references `auth.users(id)` with `ON DELETE SET NULL` for `author_id`, preserving community content even if the author deletes their account.
- Two tracking tables (`article_feedback` and `post_views`) intentionally use a text-based `user_hash` for anonymous tracking without a foreign key.
- **VULNERABILITY IDENTIFIED:** Two tables (`calculator_results` and `user_badges`) contain a `user_id` `uuid` column but completely lack foreign key constraints. This creates a risk of orphaned records when users are deleted.

## 2. Identity Taxonomy
User identity across the application is mapped in three distinct ways:
1. **Domain Ownership (`user_id`):** Used in core domain logic (e.g., `user_profiles`, `plans`, `goals`, `progress_entries`). Expected to enforce strict deletion cascades.
2. **Authorship (`author_id`):** Used for public/community artifacts (e.g., `posts`). Expected to preserve content via `SET NULL` or `SET DEFAULT`.
3. **Anonymous Tracking (`user_hash`):** Used for non-authenticated tracking metrics to prevent sybil/spam (e.g., `post_views`). Text-based hash, deliberately devoid of FKs.

## 3. Comprehensive Inventory of User-Owned Tables

| Table | Column | Type | Target | ON DELETE | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_profiles` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `progress_entries` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `plans` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `goals` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `nutrition_logs` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `lifestyle_logs` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `adaptation_events` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `notification_preferences` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `notifications` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `habit_entries` | `user_id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `profiles` (RBAC) | `id` | `uuid` | `auth.users(id)` | `CASCADE` | Verified |
| `posts` | `author_id` | `uuid` | `auth.users(id)` | `SET NULL` | Verified |
| `pages` | None | N/A | N/A | N/A | Global Table |
| `calculators` | None | N/A | N/A | N/A | Global Table |
| `calculator_results` | `user_id` | `uuid` | N/A | N/A | **Missing FK** |
| `user_badges` | `user_id` | `uuid` | N/A | N/A | **Missing FK** |
| `article_feedback` | `user_hash` | `text` | N/A | N/A | Intentional (No FK) |
| `post_views` | `user_hash` | `text` | N/A | N/A | Intentional (No FK) |

## 4. Semantic Relationship Analysis
All domain-level tables in the application correctly point to `auth.users(id)` rather than chaining through `user_profiles`. This implies that `auth.users` acts as the definitive anchor for identity, which is the correct architecture for Supabase applications. The `profiles` table is strictly an RBAC table for admin/dashboard access, completely separate from the core `user_profiles` health/fitness domain entity.

## 5. Schema vs. Code Drift Analysis
The codebase explicitly references both tables lacking FKs:
- `components/calculator/CalculatorEngine.jsx:1457` inserts into `calculator_results`.
- `lib/gamification/checkBadges.jsx:27` and `35` query and insert into `user_badges`.

Because the schema lacks database-level constraints, if a user deletes their account (or is deleted from Supabase Auth), their corresponding calculator results and badges will remain in the database indefinitely, continuing to consume storage and violating strict GDPR deletion expectations.

## 6. Orphan Risk Assessment
- **Orphan Risk:** HIGH for `calculator_results` and `user_badges`.
- **System Impact:** LOW. These tables are generally queried with an explicit `auth.uid()` filter (or equivalent local context), so the orphaned data won't crash the application, but it will cause data leakage.

## 7. Next Steps & Recommendations
1. **Formulate Phase 1D:** Prepare a clean migration to add `ON DELETE CASCADE` foreign keys to `calculator_results(user_id)` and `user_badges(user_id)` referencing `auth.users(id)`.
2. **Preflight Orphan Cleanup:** The migration must include a preflight query to delete any existing orphans in these two tables to avoid constraint violation errors.
3. No further application code modifications are required for this constraint enforcement.

---
**Audit Date:** 2026-10-04
**Auditor:** AI Agent (Antigravity)
**Target Database:** libmchubiqdvhfqwfdwo (Production)
