# CF-0 — Cloudflare Migration Audit

**Status:** COMPLETED
**Objective:** Systematically audit dependencies, current architecture, and PostgreSQL-specific features to prepare for the Cloudflare/Python migration without modifying any production code or infrastructure.

---

## 1. Current Architecture

ShedBody currently operates on a Next.js (JavaScript) full-stack application hosted on Vercel, relying heavily on Supabase for its backend infrastructure.

- **Frontend/UI:** Next.js (React), Tailwind CSS, Framer Motion, Tiptap.
- **Backend/API:** Next.js Route Handlers (`app/api/`) and Server Actions (`lib/actions/`).
- **Database:** Supabase PostgreSQL (Major Version 17).
- **Authentication:** Supabase Auth (`@supabase/ssr`).
- **Data Access Layer:** Mixed. Some structured repositories (`lib/repositories/` e.g., `ProgressRepository`, `GamificationRepository`) and raw database queries in components/actions.

## 2. Supabase Dependencies

The codebase relies on the following Supabase client libraries:
- `@supabase/supabase-js` (v2.99.1)
- `@supabase/ssr` (v0.10.0)

Wrapped extensively in `lib/supabase/` (`client.js`, `server.js`, `admin.js`, `upload.js`).

## 3. Database Inventory

The PostgreSQL schema (`public` and `graphql_public`) spans multiple domains, managed via migrations in `supabase/migrations/`:
- `user_profiles`, `public_profiles`
- `goals`, `progress`, `tracking`
- `nutrition_logs`, `lifestyle_logs`, `metric_entries`
- `habits`, `notifications`, `gamification`, `adaptation_events`

## 4. PostgreSQL-Specific Features

The current application leverages several PostgreSQL-specific constructs that do not natively map 1:1 to SQLite (D1):
- Row Level Security (RLS) policies.
- Triggers (e.g., `slice1_upsert_and_trigger.sql`).
- Remote Procedure Calls (RPCs) / Stored Procedures.
- JSONB columns and operators.
- `auth.uid()` function calls.

## 5. RPC Inventory

Custom functions are heavily utilized for operations that require transactions or bypass client-side limitations.
- `save_user_profile`
- `upsert_progress` (recently marked for retirement)
- Various hardening RPCs related to execution and search paths (`slice3_rpc_execute_hardening.sql`).

*Decision:* These must be refactored into application-level transaction logic (D1 batching or backend APIs) since D1 does not support PL/pgSQL RPCs.

## 6. Trigger Inventory

Database triggers have been used for side effects, such as updating gamification state or adaptation events.
- `slice1_upsert_and_trigger.sql`
- Note: Gamification trigger recently marked as retired (`20261003184000_retire_gamification_trigger.sql`).

*Decision:* Side effects must be moved to the application layer (e.g., using the repository pattern or Cloudflare queues).

## 7. RLS Inventory

RLS is foundational to the current security model. Migrations reveal deep reliance on RLS:
- `harden_user_profiles_privileges.sql`
- `harden_public_profiles.sql`

*Decision:* In D1, security and tenant isolation must be enforced at the application level (in the Repository or API layer).

## 8. Auth Inventory

Authentication is currently coupled to Supabase Auth (`lib/auth/`, `app/api/auth/`).
- Needs replacement before final cutover.
- An experimental `.env.better-auth.example` and `better-auth-dev.sqlite` indicate a possible direction towards Better Auth, which is compatible with Cloudflare Workers.

## 9. Storage Inventory

File uploads are handled by Supabase Storage, wrapped in `lib/supabase/upload.js`.

## 10. R2 Inventory

A `lib/r2/` directory and `@aws-sdk/client-s3` dependency in `package.json` indicate that Cloudflare R2 integration has already begun. R2 will replace Supabase Storage for object/media storage.

## 11. Environment Variables

Core variables bound to Supabase that will need replacement:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 12. API/Server Dependencies

`app/api/` contains several domains:
- `/api/admin`, `/api/ai`, `/api/cron`, `/api/habits`, `/api/nutrition`, `/api/plans`, `/api/progress`, etc.

## 13. Node-Only Dependencies

Dependencies in `package.json` that rely on Node.js built-ins and will crash on Cloudflare Workers without polyfills:
- `pg` (Requires `pg-cloudflare` or switching to D1).
- `nodemailer` (SMTP cannot be used directly in Workers via raw TCP; needs HTTP-based API like Resend, SendGrid, or Cloudflare Email Routing).

## 14. Worker Compatibility

The Next.js application logic needs to migrate to the Edge (Cloudflare Pages/Workers).
- Repositories (`lib/repositories/`) need to be injected with a D1 database driver instead of the Supabase client.
- Node.js specific libraries (`nodemailer`, `pg`) must be removed or replaced with edge-compatible equivalents.

## 15. Python/Backend Opportunities

In alignment with the target architecture, Python is the long-term primary backend/analytics language. The following areas from the API inventory are prime candidates for Python migration:
- **AI/Insights:** `/api/ai`, `lib/ai/`, `lib/insights/`
- **Analytics & Calculations:** `lib/analytics/`, `lib/calculations/`, `/api/progress`
- **Background Jobs:** `/api/cron` (e.g., notifications, plan adaptations, daily rollups).

## 16. Migration Blockers

1. **Authentication Replacement:** A definitive decision on the Auth provider (e.g., Better Auth) must be finalized and integrated.
2. **RLS to App-Level Security:** Replicating complex RLS logic in the Data Access Layer without introducing security vulnerabilities.
3. **Node.js APIs:** Email sending (`nodemailer`) and raw postgres (`pg`) must be refactored.

## 17. Recommended Migration Order

Strictly following CF-7 from the Master Plan:
1. `profile/foundation`
2. `goals`
3. `tracking`
4. `nutrition`
5. `workout`
6. `habits`
7. `sleep/recovery`
8. `progress`
9. `analytics` (Python target)
10. `AI context/insights` (Python target)
11. `notifications` (Python target)
12. `admin/security`

---

**Audit Sign-off:**
- No destructive actions were performed during this audit.
- No production database schema or Cloudflare configurations were modified.
- READ-ONLY constraint verified.
