# Phase 2B — Unified Tracking Engine Target Architecture Design

**Date:** 2026-10-04
**Phase:** 2B (Architecture Design)
**Target:** Unified Tracking Engine

---

## 1. DOMAIN CLASSIFICATION

[ARCHITECTURAL DECISION]
Not all data belongs in a single table. Tracking domains must be classified semantically to avoid forcing disjoint concepts into a generic EAV (Entity-Attribute-Value) model.

Classification Mapping:
- **weight:** Metric
- **body_fat:** Metric
- **calories:** Metric
- **protein:** Metric
- **water:** Metric
- **steps:** Metric
- **sleep:** Metric
- **workout_completed:** Event (Binary Metric)
- **habits:** Habit
- **goals:** Goal
- **calculator_results:** Derived/Calculated Data
- **plans:** Plan

*Rule:* Standard continuous/discrete quantitative data (weight, macros, steps) and simple binary events (workout completed) map to the Universal Tracking Engine. User-defined qualitative behavioral tracking (habits) and generated artifacts (plans, calculator results) remain in dedicated domains.

---

## 2. UNIVERSAL TRACKING MODEL

[RECOMMENDATION]
We recommend a canonical schema splitting the definition of a metric from the ledger of entries.

- **`metrics` (Definition):** A system-level catalog defining trackable domains.
  - Entities: `id` (e.g., 'weight', 'calories'), `name`, `data_type` ('numeric', 'boolean'), `unit` ('kg', 'kcal').
- **`metric_entries` (Ledger):** The atomic, canonical ledger for all user tracking.
  - Entities: `id`, `user_id`, `metric_id`, `log_date`, `recorded_at`, `value_numeric`, `source`.

*Why separate tables vs shared?*
Metrics and simple events share the `metric_entries` ledger because they follow identical chronological and aggregational patterns. Habits remain in `habit_entries` because their schema requires custom `habit_name` fields and streak calculations that pollute a universal metrics table.

---

## 3. TIME SEMANTICS

[ARCHITECTURAL DECISION]
The current inconsistency between `entry_date`, `log_date`, and `created_at` will be resolved by enforcing two strict, orthogonal time dimensions on every entry:

1. **`log_date` (DATE):** The "Effective Date". This is the logical calendar day (YYYY-MM-DD) the entry applies to in the user's local timezone. Used exclusively for daily grouping, streaks, and UI timelines.
2. **`recorded_at` (TIMESTAMPTZ):** The "Event Timestamp". The exact UTC point-in-time the event occurred or was logged. Used for deterministic sorting within a day and point-in-time chart plotting.
3. **`created_at` / `updated_at` (TIMESTAMPTZ):** System audit timestamps, strictly for debugging, not business logic.

*Rules:* Backdated and future-dated entries are allowed. The system will group by `log_date` and resolve conflicts using `recorded_at`.

---

## 4. VALUE MODEL

[ARCHITECTURAL DECISION]
A typed EAV model is adopted for values to maintain strong SQL compatibility.

- **`value_numeric` (FLOAT8):** The canonical value column for continuous (weight = 75.5) and discrete (steps = 10000) data.
- **Boolean mapping:** `workout_completed` will be stored as `1.0` (true) and `0.0` (false) in `value_numeric`.
- **`metadata` (JSONB):** An optional column to store context (e.g., notes, meal type for calories).

This avoids string-parsing overhead and ensures native PostgreSQL aggregate functions (SUM, AVG) work out-of-the-box.

---

## 5. SOURCE / PROVENANCE

[ARCHITECTURAL DECISION]
Source belongs to the **Entry**, not the Metric definition. A single metric (weight) can be sourced from a manual entry today and an API import tomorrow.

- **`source` (TEXT/ENUM):** Must be one of `['manual', 'device', 'import', 'ai', 'system']`.
- **`provenance` (JSONB):** Optional structured metadata detailing the exact origin (e.g., `{ "device_model": "Apple Watch", "sync_id": "12345" }`).

---

## 6. HISTORY / REVISION MODEL

[RECOMMENDATION]
**Current-state projections via Append-Only Ledger.**

Instead of updating historical rows (which destroys auditability) or creating a complex temporal table, the `metric_entries` table acts as an append-only ledger.
- If a user edits a past entry (e.g., fixing yesterday's weight), a *new* row is inserted with yesterday's `log_date` but a newer `recorded_at`.
- Daily aggregation queries will use `DISTINCT ON (user_id, metric_id, log_date) ORDER BY recorded_at DESC` to project the current state.
- *Idempotency:* Soft deletions (`deleted_at`) will be used if a user completely removes a record.

---

## 7. HABIT MODEL

[ARCHITECTURAL DECISION]
**Habits remain a dedicated domain.**

Custom habits ("Read 10 pages", "Meditate") are subjective, user-defined strings that do not map to universal system metrics. Forcing them into the universal tracking engine breaks unit tracking and aggregation constraints. `habits` and `habit_entries` will remain isolated tables.

---

## 8. GOAL MODEL

[ARCHITECTURAL DECISION]
Goals dictate targets for a specific metric or habit.
- A goal referencing a standard metric (e.g., weight <= 65kg) will store a Foreign Key to the `metrics` catalog (`metric_id`), a `target_value`, and a `target_date`.
- Goal progress is evaluated dynamically by querying the latest `metric_entries` against the `target_value`.

---

## 9. DERIVED DATA

[ARCHITECTURAL DECISION]
Calculated data (`calculator_results`), TDEE, streaks, and AI-generated insights are artifacts derived from core metrics, not metrics themselves.
- They will remain in their dedicated tables (or computed on-the-fly).
- We will NOT store daily streak counts or historical TDEE snapshots inside `metric_entries`.

---

## 10. API ARCHITECTURE

[RECOMMENDATION]
**Target API Contract:** Transition from siloed routes (`/api/progress`, `/api/nutrition`) to a unified tracking route.

**`/api/tracking/entries` (POST)**
```javascript
// Request Shape
{
  "metric_id": "weight",
  "log_date": "2026-10-04",
  "recorded_at": "2026-10-04T08:30:00Z", // optional, defaults to now()
  "value": 75.5,
  "source": "manual",
  "metadata": { "notes": "Morning weigh-in" }
}
```

Habits and Goals retain their specific domain endpoints (`/api/habits`, `/api/goals`) to respect Domain Classification (Section 1).

---

## 11. SECURITY / RLS

[ARCHITECTURAL DECISION]
**Strict RLS Enforcement. No Admin Client Bypasses.**

[VERIFIED CURRENT]: `/api/progress` uses the Supabase Admin Client to bypass RLS because the `authenticated` role lacks INSERT/UPDATE grants.
[ARCHITECTURAL DECISION]: This pattern is abolished.
- The new `metric_entries` table will explicitly grant `INSERT, SELECT, UPDATE` to the `authenticated` role.
- Standard RLS policy: `(auth.uid() = user_id)`.
- Server-side routes will use the standard `createClient` (which respects the user's JWT) for all mutations. Service-role boundaries are strictly reserved for background jobs/webhooks.

---

## 12. ANALYTICS

[RECOMMENDATION]
Shift aggregation from Client-Side JS to **PostgreSQL RPC / Views**.

The current `unified.js` executes heavy N+1 fetches and JS memory sorting.
We will create a PostgreSQL RPC: `get_daily_timeline(p_user_id UUID, p_start_date DATE, p_end_date DATE)` that handles the `DISTINCT ON` deduplication and returns a single, flat, JSON-aggregated timeline array natively.

---

## 13. LEGACY COMPATIBILITY

[RECOMMENDATION]
**Incremental Domain Migration (Backfill + Dual-Write).**

1. Deploy the new schema.
2. Backfill historical data from legacy tables to `metric_entries`.
3. Update APIs to **Dual-Write** to both the old table (e.g., `progress_entries`) and the new table (`metric_entries`).
4. Switch Dashboard reads to the new RPC.
5. Decommission dual-write and drop legacy tables.

---

## 14. DATA MIGRATION

[ARCHITECTURAL DECISION]
Mapping Rules:

- **Source:** `progress_entries`
  - Destination: `metric_entries`
  - Mapping: `weight` -> metric_id: 'weight', value_numeric: `weight`. `body_fat` -> metric_id: 'body_fat'. `entry_date` -> `log_date`.
- **Source:** `nutrition_logs`
  - Destination: `metric_entries`
  - Mapping: `calories_consumed` -> 'calories'. `protein_consumed` -> 'protein'. `water_ml` -> 'water'. `log_date` -> `log_date`.
- **Source:** `lifestyle_logs`
  - Destination: `metric_entries`
  - Mapping: `workout_completed` -> 'workout' (1.0 or 0.0). `steps_count` -> 'steps'. `sleep_hours` -> 'sleep'. `log_date` -> `log_date`.

*Transformation:* All historical entries map `source` to `'manual'` by default.

---

## 15. ZERO-DOWNTIME STRATEGY

[RECOMMENDATION]
Transition execution:
1. **Schema phase:** Run non-breaking migrations (create new tables).
2. **Backfill phase:** Execute SQL job to copy data. Existing app continues using legacy tables.
3. **Application release:** Deploy API changes handling dual-writes and UI changes pointing to new read paths. If issues occur, the UI can be rolled back without data loss because legacy tables are still receiving writes.
4. **Cleanup phase:** Drop legacy tables (weeks later).

---

## 16. OBSERVABILITY / VALIDATION

[ARCHITECTURAL DECISION]
- **Row-count reconciliation:** Post-backfill, `SELECT COUNT(*)` for `metric_entries` where `metric_id = 'weight'` MUST exactly match `SELECT COUNT(weight) FROM progress_entries WHERE weight IS NOT NULL`.
- **Invariants:** `log_date` must not be null. `user_id` must match `auth.uid()`. Check constraint on `value_numeric >= 0`.

---

## 17. FINAL TARGET ARCHITECTURE

### Database Table Proposal

**Table: `metrics` (Reference)**
- `id` (VARCHAR, PK) - e.g., 'weight', 'calories'
- `name` (VARCHAR)
- `unit` (VARCHAR)
- `data_type` (VARCHAR) - 'numeric', 'boolean'

**Table: `metric_entries` (Ledger)**
- `id` (UUID, PK)
- `user_id` (UUID, FK -> auth.users)
- `metric_id` (VARCHAR, FK -> metrics)
- `log_date` (DATE)
- `recorded_at` (TIMESTAMPTZ)
- `value_numeric` (FLOAT8)
- `source` (VARCHAR)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `deleted_at` (TIMESTAMPTZ)

### Relationship Rules
- `metric_entries` cascade on user deletion.
- Unique constraint for upsert/deduplication logic (if enforcing distinct logic): Not required due to append-only ledger model, rely on `DISTINCT ON` queries instead.

---

## 18. IMPLEMENTATION GATES

[RECOMMENDATION]
Safe sequential execution plan:

- **Gate 1:** Architecture approval (This document).
- **Gate 2:** Schema design (Create `metrics` and `metric_entries` migration).
- **Gate 3:** Backfill migration (SQL translation of existing logs).
- **Gate 4:** Analytics refactor (Create PostgreSQL `get_daily_timeline` RPC).
- **Gate 5:** Dual-write API refactor (Update POST routes).
- **Gate 6:** Dashboard UI read migration (Replace `unified.js`).
- **Gate 7:** Legacy retirement (Drop old tables).

*(Do not execute these gates yet).*

---

## 19. OPEN QUESTIONS

[OPEN QUESTION]
- Timezone context: Does the client need to explicitly pass a timezone offset to `/api/tracking` to ensure `log_date` strictly aligns with the user's midnight boundary, or does the client generate `log_date` explicitly? (Recommendation: Client generates and passes `log_date` as a literal string 'YYYY-MM-DD').

---

## 20. FINAL DECISION

- **Approved architectural principles:** Separation of metric definition and entry ledger. Strict append-only ledger utilizing `log_date` and `recorded_at` for exact temporal mapping. Complete elimination of Admin Client RLS bypasses.
- **Rejected approaches:** Merging user-defined habits into the numeric tracking engine. Using monolithic EAV tables for complex derived artifacts (Plans/Calculators).
- **Recommended architecture:** Typed numeric tracking engine (`metric_entries`) with JSONB metadata extensibility, backed by PostgreSQL RPCs for dashboard analytics.
- **Migration strategy:** Dual-write and backfill.
- **Risks:** ETL scripts must correctly map sparse nulls in legacy tables (e.g., a `lifestyle_log` with steps but no sleep must only generate ONE metric entry for steps).
- **Exact next implementation step:** Await explicit approval of Gate 1, then proceed to Gate 2 (Schema design migration).

---
*End of Phase 2B Architecture Specification.*
