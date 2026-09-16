# Database Security Baseline

**Scope:** Repository inspection only. No application, database, dependency, or configuration changes.

**Status:** Phase 0.5 complete. Exported from `scripts/supabase-hardening.sql` (not in repo) + code analysis.

---

## 1. Architecture Overview

The database uses a **split identity model** with three authentication-related tables:

| Table | Purpose | RLS Enabled |
|---|---|---|
| `public.profiles` | Core user profile (role, admin checks) | Yes |
| `public.user_profiles` | Gamification/stats data (xp, streak, goal) | Yes |
| `auth.users` | Supabase Auth (OAuth + magic link) | External |

Key observations:
- `profiles.id` references `auth.users`; used by admin RLS checks via `public.is_admin()`.
- `user_profiles.user_id references auth.users`; used for owner-scoped RLS on progress_entries, calculator_results, and user_profiles itself.
- No in-repo source of truth: `scripts/supabase-hardening.sql` is gitignored and missing from the repo.

---

## 2. Table-by-Table RLS Summary

### `public.posts`
- **Public:** Can select published posts (`status = 'published'`)
- **Admins:** All operations via `public.is_admin()`
- **Finding:** No policy restricts admin writes to owned resources; any authenticated admin can modify any post.

### `public.profiles`
- **Users:** Read/update own profile where `id = auth.uid()` or `is_admin()`
- **Admins:** All operations via `public.is_admin()`

### `public.user_profiles`
- **Users:** Manage own progress_entries and calculator_results; read/update own user_profile where `user_id = auth.uid()` or `is_admin()`
- **Admins:** All operations via `public.is_admin()`

### `public.plans`
- **Authenticated users:** Manage own plans via `supabase code .eq("user_id", user.id)` (no RLS policy in repo)
- **Finding:** No RLS policy defined in this repo; access controlled entirely by application code.

### `public.progress_entries`
- **Users:** All operations where `user_id = auth.uid()` or `is_admin()`
- **Admins:** All operations via `public.is_admin()`

### `public.contact_submissions`
- **Anon/Authenticated:** Insert via `with check(true)` (anyone can submit)
- **Admins:** Read via `is_admin()` check

### `public.post_views`
- **Anon/Authenticated:** Insert where post is published
- **Admins:** Read via `is_admin()` check

### `public.article_feedback`
- **Admins:** Read via `is_admin()` check
- **Insert:** Via RPC `record_article_feedback` (no direct RLS insert policy)

### `public.redirects`
- **Public:** Can read all redirects (select to anon, authenticated where true)
- **Admins:** All operations via `public.is_admin()`

### Storage buckets (`images`, `blog-images`)
- **Public:** Read access
- **Admins:** Upload, update, delete access via `public.is_admin()`

---

## 3. Security Findings (Baseline)

| Category | Finding | Severity |
|---|---|---|
| **Identity model** | Split across `profiles`, `user_profiles`, `auth.users`; no single source of truth | HIGH |
| **Admin RLS** | `public.is_admin()` used broadly; no resource-level admin restrictions | HIGH |
| **Client-side privileged writes** | Admin UI components (`r2/upload.js`) read `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` on client | CRITICAL |
| **No in-repo schema** | `scripts/supabase-hardening.sql` is gitignored; database source not checked in | HIGH |
| **Plan table RLS** | No RLS policy; access controlled by application code only | MEDIUM |
| **Article feedback insert** | Uses RPC without direct RLS policy; conflict handling in application code | MEDIUM |
| **Contact form** | Anon insert with `with check(true)` — publicly writable | LOW |
| **Storage keys in code** | `lib/r2/upload.js` references R2 credentials; exposure risk if committed | CRITICAL |

---

## 4. Baseline Recommendations

1. **Check in the Supabase schema** — export the live database schema and RLS policies into `supabase/` as the source of truth.
2. **Consolidate identity model** — decide whether `profiles` or `user_profiles` is the canonical user table and remove the split.
3. **Restrict admin RLS** — add resource-level checks so admins can only modify resources they own, unless explicitly broad access is required.
4. **Move R2 uploader to server-side function** — remove `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` from client components.
5. **Add RLS policy for `plans` table** — define policies for authenticated user ownership.
6. **Document RPC security** — add RLS policies or comments for RPCs that bypass direct table access (e.g., `record_article_feedback`).
7. **Rotate R2 credentials** — if the keys exist in the repo, rotate them and move to environment variables only.

---

## 5. References

- `supabase/01_tables.sql` — table documentation
- `supabase/02_rls-policies.sql` — RLS policy definitions
- `supabase/03_indexes.sql` — index definitions
- `docs/audit.md` — full architecture audit (944 lines)
- `scripts/supabase-hardening.sql` — original hardening script (gitignored, not in repo)