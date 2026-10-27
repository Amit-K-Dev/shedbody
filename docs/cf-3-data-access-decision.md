# CF-3: Data Access Layer Decision

## The Problem
CF-2 mapped our PostgreSQL schema to Cloudflare D1. We now need a Data Access Layer (DAL) to interact with D1 from our Next.js API Routes and Cloudflare Workers. We must decide between an ORM (Drizzle/Kysely) or a Raw SQL Adapter pattern.

## Constraints & Requirements
1. **Architecture Freeze:** We are strictly using JavaScript (no TypeScript migration).
2. **Tenant Isolation:** D1 lacks Supabase's native Row Level Security (RLS). Our DAL must forcefully inject `user_id` into every query to prevent cross-tenant data leaks.
3. **RPC Replacements:** Complex operations like `upsert_nutrition_log` and `create_weight_goal` require atomic transaction-like behavior. D1 handles this via `db.batch()`.
4. **Performance:** D1 runs at the Edge. We want zero-overhead query construction.

## Options Evaluated

### Option A: Drizzle ORM
**Pros:** Excellent D1 dialect support, auto-generated migrations, schema definitions in code.
**Cons:** Drizzle is heavily optimized for TypeScript. In a pure JavaScript environment, we lose the primary benefit (type-safe inferences). Migrations were already written in raw SQL during CF-2.

### Option B: Kysely
**Pros:** Lightweight, highly performant query builder for D1.
**Cons:** Like Drizzle, it is almost exclusively designed for TypeScript environments. 

### Option C: Extended D1Adapter + BaseRepository Pattern (Selected)
**Decision:** We will use the existing `D1Adapter` and build a `BaseRepository` class that all domain repositories inherit from.

**Why?**
- **Strict JavaScript Alignment:** It requires zero external dependencies and doesn't rely on TypeScript definitions.
- **Security-by-Design (RLS Replacement):** The `BaseRepository` will require `user_id` in its constructor or method signatures, enforcing tenant isolation programmatically.
- **RPC Translation:** We can cleanly implement complex multi-step D1 batches (like `createWeightGoal`) directly in JS using standard SQL syntax.
- **Simplicity:** We maintain full control over the exact SQL executed at the Edge.

## Architecture
- `lib/repositories/D1Adapter.js` (Already created in CF-1, executes queries)
- `lib/repositories/BaseRepository.js` (New: Provides baseline CRUD with forced `user_id` constraints)
- `lib/repositories/GoalRepository.js` (New: Replaces `create_weight_goal` RPC via D1 batches)
- `lib/repositories/NutritionRepository.js` (New: Replaces `upsert_nutrition_log` RPC)
