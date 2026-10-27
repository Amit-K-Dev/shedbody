# Phase 2B Gate 5.3 Write-Path Design & Safety Audit

## 1. Executive Summary & Broken State Confirmation
**Status:** **DISJOINTED (Broken)**
The Phase 2B architecture is currently in a fragmented state.
- **Read Path (Gate 5.2-B):** The application successfully reads from the canonical EAV ledger (`vw_metric_entries_latest`).
- **Write Path:** The application continues to write *exclusively* to the legacy physical tables (`progress_entries`, `nutrition_logs`, `lifestyle_logs`).
- **Synchronization:** **NO TRIGGERS EXIST** to synchronize writes from the legacy tables to the canonical EAV ledger (`metric_entries`).
- **Result:** Any new application writes are physically saved to legacy tables but are completely invisible to the user interface, which now strictly consumes the EAV read adapter.

## 2. Legacy Write Inventory

The application currently issues writes through the following vectors:

### A. Progress Entries
- **Function:** `ProgressRepository.upsertProgressEntry`
  - Uses read-modify-write pattern: reads `progress_entries`, then executes `.update()` or `.insert()`.
  - **Atomicity:** Vulnerable to race conditions.
  - **Fields:** `weight`, `body_fat`, `notes` (notes are no longer used).
- **Function:** `storage.addProgressEntry`
  - Uses `supabase.from("progress_entries").insert([...])`.
- **Bug/Drift:** `app/(dashboard)/start/page.js` still calls the RPC `upsert_progress_entry` which was dropped in migration `20261003132210_retire_upsert_progress_rpc.sql`.

### B. Nutrition Logs
- **Function:** `app/api/nutrition/route.js`
  - Maps to RPC: `upsert_nutrition_log(log_date, calories, protein, water)`
  - **Mechanics:** The RPC implicitly binds the active plan's targets (`target_calories_snapshot`, `target_protein_snapshot`) into the nutrition log at insertion time to preserve historical targets.
  - **Atomicity:** Fully atomic inside PostgreSQL.

### C. Lifestyle Logs
- **Function:** `app/api/lifestyle/route.js`
  - Maps to RPC: `upsert_lifestyle_log(log_date, workout, steps, sleep)`
  - **Atomicity:** Fully atomic inside PostgreSQL.

## 3. Trigger / Synchronization Audit

### A. Missing Forward-Sync Triggers
There are **zero** triggers moving data from `progress_entries`, `nutrition_logs`, or `lifestyle_logs` into `metric_entries`.

### B. Legacy Gamification & Profile Dependencies
- **Trigger:** `on_progress_entries_changed` attached to `progress_entries`.
- **Function:** `sync_user_profile_weight()`
- **Mechanics:** Whenever a row is inserted, updated, or deleted in `progress_entries`, this function calculates the user's latest weight (`ORDER BY entry_date DESC LIMIT 1`) and hardcodes it into `user_profiles.weight`.
- **Impact:** Deprecating `progress_entries` writes will **break** this synchronization unless the logic is rewritten to listen to `metric_entries` where `metric_id = 'weight'`, or handled at the application tier.

## 4. Deletion Semantics Definition

Our audit of the codebase (`git grep -i '\.delete('`) revealed that the application currently **does not support hard deletions** of metrics anywhere in the codebase. However, "clearing" a field by passing `null` is supported (e.g., in `app/api/nutrition/route.js`).

**Canonical EAV Semantics:**
- **Setting a Value:** `INSERT` into `metric_entries` with `value_numeric = [number]`.
- **Clearing a Value / Deleting a Metric:** `INSERT` a tombstone row into `metric_entries` with `value_numeric = null` AND `deleted_at = now()`. The `MetricReadAdapter` guarantees filtering via `.is('deleted_at', null)`, effectively removing it from the daily pivot.

## 5. Metric -> EAV Mapping

| Legacy Source Table | Legacy Column | `metric_id` | `data_type` | Special Handling (Metadata/Values) |
| :--- | :--- | :--- | :--- | :--- |
| `progress_entries` | `weight` | `weight` | numeric | Source for `sync_user_profile_weight()` |
| `progress_entries` | `body_fat` | `body_fat` | numeric | |
| `nutrition_logs` | `calories_consumed` | `calories` | numeric | Requires `target_calories` snapshot in metadata |
| `nutrition_logs` | `protein_consumed` | `protein` | numeric | Requires `target_protein` snapshot in metadata |
| `nutrition_logs` | `water_ml` | `water` | numeric | |
| `lifestyle_logs` | `workout_completed` | `workout` | boolean | Boolean mapped to 1.0 (true) or 0.0 (false) |
| `lifestyle_logs` | `steps_count` | `steps` | numeric | |
| `lifestyle_logs` | `sleep_hours` | `sleep` | numeric | |

## 6. Transaction & Atomicity Requirements

Because a single user action (e.g., submitting the nutrition form) logs calories, protein, and water simultaneously, the system must guarantee atomic insertion.

**Implementation Fact:** Passing an array of objects to the Supabase client `supabase.from('metric_entries').insert([{...}, {...}])` translates to a single PostgREST HTTP `POST` request, which executes inside a **single, strict database transaction**. If any row fails constraints, the entire batch fails. Therefore, we do not require a dedicated PostgreSQL RPC purely for transactionality.

## 7. Strategy Evaluation & Recommendation

### Option A: Proxy RPC (PostgreSQL-side EAV mapping)
- Create new RPCs (`record_nutrition`, `record_progress`) that accept flat arguments and internally execute the `INSERT INTO metric_entries` loops.
- *Pros:* Keeps legacy API routes untouched. Keeps target snapshot logic inside PostgreSQL.
- *Cons:* Hides the EAV architecture from the application. Prevents the application from fully transitioning to dynamic metrics.

### Option B: Direct EAV Writes (Application-side mapping)
- The Next.js API Routes (`app/api/*/route.js`) and Repositories construct the exact EAV rows (`metric_id`, `value_numeric`, `metadata`) and call `supabase.from('metric_entries').insert(array)`.
- The API Route queries the active `plans` table to capture the `target_calories` snapshot, storing it in the `metadata` JSONB column.
- The Next.js Backend synchronously patches `user_profiles.weight` if a `weight` metric is recorded.
- *Pros:* The application becomes natively EAV-aware. Extreme flexibility for partial updates (we only construct and insert array items for metrics actually provided, avoiding null overwrites). Deprecates heavy PostgreSQL RPCs.
- *Cons:* Requires re-implementing `target_snapshot` fetching and `user_profiles.weight` syncing in application code.

### **RECOMMENDATION:** Option B (Direct EAV Writes)
Option B achieves true architectural modernization. EAV's greatest strength is dynamic, sparse writes (e.g., user only logs water). By bringing the write logic into the application layer, we can seamlessly construct an array of *only the metrics that changed* and insert them atomically.

## Next Steps for Gate 5.3 Implementation
1. **Approval:** Await explicit authorization to proceed with implementation.
2. **Phase 1 (Progress):** Refactor `ProgressRepository.upsertProgressEntry` to array-insert into `metric_entries`, and manually update `user_profiles.weight`.
3. **Phase 2 (Nutrition):** Refactor `app/api/nutrition/route.js` to fetch target snapshots, construct the EAV array, and insert.
4. **Phase 3 (Lifestyle):** Refactor `app/api/lifestyle/route.js` to convert booleans to 1.0/0.0 and execute the array insert.
5. **Phase 4 (Legacy Deprecation):** Cease writes to legacy tables and document them as officially retired.
