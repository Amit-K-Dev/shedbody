# CF-5 — Authorization & Security Model

**Status:** APPROVED FOR LOCAL/STAGING
**Objective:** Replace Supabase Row Level Security (RLS) with an explicitly designed, application-level authorization model for Cloudflare D1.

---

## 1. Core Principles

Because Cloudflare D1 does not support Row Level Security (RLS) or complex `auth.uid()` injection at the database level, all security boundaries **MUST** shift to the Application Layer (Next.js Edge / Workers).

### Security Flow
```
User Request (Cookie/Token)
    ↓
Better Auth Session Validation (Edge/Proxy)
    ↓
Role / Permission Extraction (user_id, is_admin, etc.)
    ↓
Repository Initialization (Injected with user_id)
    ↓
Database Execution (Hardcoded tenant filters)
```

## 2. Authentication & API Protection (Server-Side)

**Implemented via:** Better Auth & Next.js Middleware/Proxy
- Every protected route (e.g., `/api/protected/*`) requires a valid Better Auth session.
- Unauthenticated requests are intercepted and rejected with `401 Unauthorized` before reaching the repository layer.
- Python internal API routes are protected by a shared secret (`Bearer <internal_secret>`).

## 3. Tenant Isolation & Repository Scoping

**Implemented via:** Repository Pattern (`BaseRepository.js`)
- All repositories extending `BaseRepository` MUST be instantiated with a verified `userId`.
- The repository layer acts as the absolute boundary. The underlying D1/SQLite adapter cannot be accessed directly by API handlers for tenant-specific data.
- **Enforcement:** `BaseRepository._validateUser(userId)` throws a strict error if `userId` is missing or invalid.
- **SQL Hardcoding:** Tenant-specific queries must explicitly include `WHERE user_id = ?` to prevent cross-tenant leakage.

## 4. Admin Access Model

**Implementation Strategy:**
- Unlike Supabase's `is_admin()` PostgreSQL function, admin status will be stored in the Better Auth `user` metadata or a dedicated `roles` table in D1.
- Admin-specific APIs (e.g., `/api/admin/*`) will enforce a `requireAdmin` check at the Next.js API boundary.
- **Admin Repositories:** Will bypass the standard `BaseRepository._validateUser` lock ONLY if explicitly instantiated as an `AdminRepository` which performs an admin role verification.

## 5. Privacy Controls (Public vs. Private)

**Implementation Strategy:**
- **Private Data:** Handled by standard repositories (e.g., `ProgressRepository`, `GoalsRepository`). Requires `userId`.
- **Public Data:** Handled by specific read-only repositories (e.g., `PublicProfileRepository`, `BlogRepository`). These repositories do NOT extend `BaseRepository`'s strict `userId` lock for reads, but will enforce it for writes.
- Privacy toggles (e.g., "make profile public") are evaluated in the application layer before returning data.

## 6. Secrets Management

**Strategy:**
- **Local/Staging:** Managed via `.env.local` (Next.js) and `.dev.vars` (Wrangler/D1).
- **Production:** Managed via Cloudflare Secrets (`wrangler secret put`) and Vercel Environment Variables.
- No secrets will be hardcoded. The Python boundary shared secret is managed strictly through environment injection.

## 7. Abuse Protection

**Strategy:**
- **Rate Limiting:** To be implemented using Cloudflare Workers Rate Limiting for edge endpoints.
- **Bot Protection:** Cloudflare Turnstile will be integrated on unauthenticated forms (e.g., signup, login, contact).

---

## Validation Status

- [x] User Isolation (Validated in CF-3/CF-4 via `BaseRepository`)
- [x] Server-side Authorization (Validated in CF-4 via `proxy.js`)
- [x] Repository-level Scoping (Validated in CF-3 tests)
- [x] API Protection (Validated in CF-4 integration tests)
- [x] Python Boundary Protection (Validated in CF-4)
- [ ] Admin Access (To be implemented upon admin domain migration)
- [ ] Abuse Protection / Turnstile (To be implemented at UI edge deployment)
