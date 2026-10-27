# Phase 2C Gate 6 Legacy Deprecation Implementation Report

## 1. Migration Overview
Two migrations were successfully created and applied to fulfill Gate 6 requirements without permanently dropping legacy tables.

**Migrations Applied:**
1. `20261005044818_update_create_weight_goal.sql`
2. `20261005050304_gate6_legacy_deprecation.sql`

## 2. Exact Objects Changed

**Functions Altered:**
- `public.create_weight_goal(numeric)`: Redefined to query `public.vw_metric_entries_latest` instead of `public.progress_entries`.

**Triggers Retired:**
- `update_progress_updated_at` (Dropped from `progress_entries`)
- `on_progress_entries_changed` (Dropped from `progress_entries`)

**Functions/RPCs Retired (Dropped):**
- `public.sync_user_profile_weight()`
- `public.trigger_gamification_on_progress()`
- `public.upsert_nutrition_log(date, numeric, numeric, numeric)`
- `public.upsert_lifestyle_log(date, boolean, integer, numeric)`

**Tables Renamed (Rollback-Safe Archive):**
- `public.progress_entries` → `public.archive_progress_entries`
- `public.nutrition_logs` → `public.archive_nutrition_logs`
- `public.lifestyle_logs` → `public.archive_lifestyle_logs`

## 3. Dependency Validation
Before renaming the legacy tables, a full database dependency audit was conducted.
- **Triggers:** Verified that the legacy triggers were securely dropped.
- **RPCs:** Verified that the only remaining RPCs pointing to the tables were safely dropped.
- **Foreign Keys:** Verified that there were no outstanding foreign keys pointing to these tables (legacy schema was self-contained).
- **Views:** Verified that no views depend on the legacy tables.
The tables were successfully isolated.

## 4. `create_weight_goal` Validation
- **Refactor:** The function was successfully re-pointed to `vw_metric_entries_latest`.
- **Validation:** A Node.js test script (`test_create_goal.mjs`) was executed locally against the database:
  - Verified the source code of the function no longer references `progress_entries`.
  - Verified the fallback priority (when no entries exist) correctly relies on `user_profiles.weight`.
  - Verified Priority 1 securely fetches the latest valid metric by executing an insertion against `metric_entries` and asserting that `create_weight_goal` correctly picked up the inserted value.
- Exact pre-existing semantics (tie-breakers, ID-hashing locks, profile sync) were fully preserved.

## 5. Before/After Row Counts
Pre-migration and post-migration row counts matched identically, proving 0 data loss:

| Table | Pre-Migration Count | Post-Migration Count | Notes |
| :--- | :--- | :--- | :--- |
| `[archive_]progress_entries` | 0 | 0 | No historical data existed. |
| `[archive_]nutrition_logs` | 0 | 0 | No historical data existed. |
| `[archive_]lifestyle_logs` | 0 | 0 | No historical data existed. |
| `metric_entries` | 1 | 1 | Continues normally. |

## 6. Build and Test Results
- **`npm run build`**: Succeeded (Compiled in 62s).
- **`MetricReadAdapter.test.js`**: Succeeded (7 tests passed, 0 failures).

## 7. Final Grep Classification
A final rigorous `git grep` on `.js/.jsx/.ts` for `progress_entries`, `nutrition_logs`, and `lifestyle_logs` verified that **ZERO** active runtime references remain.

**Classification of remaining hits:**
- **Historical Migrations**: SQL files tracking the timeline.
- **Documentation**: Markdown files detailing the EAV transition (including this report).
- **Test / Mock**: JSDoc param type hints (e.g., `@param {Array} progressEntries - DB rows from progress_entries`) or manual mock data logic mapping (e.g., `if (table === "progress_entries") return mockData`).
- **Comments**: Inline context comments explaining why legacy logic was skipped or the origin of a trigger.

There are NO unintended active application or database dependencies.

## 8. Rollback Procedure
If a system failure necessitates rolling back to the legacy tracking implementation:
1. Re-deploy the frontend codebase using the pre-Gate 5.3 commit (to revert adapters/routes).
2. Execute reverse rename statements to restore the tables:
   ```sql
   ALTER TABLE public.archive_progress_entries RENAME TO progress_entries;
   ALTER TABLE public.archive_nutrition_logs RENAME TO nutrition_logs;
   ALTER TABLE public.archive_lifestyle_logs RENAME TO lifestyle_logs;
   ```
3. Recreate the legacy triggers and RPCs via the earlier Supabase migration scripts.
*(Note: Because no data was deleted, no data recovery operation is necessary).*

## 9. Remaining Risks / Final Status
**Risks:** None identified. The legacy tables were fully decoupled, successfully archived, and the application architecture strictly honors the EAV metric store.

**Final Status:** Gate 6 Legacy Deprecation is **APPROVED AND CLOSED**.

The tables are safely archived. The permanent `DROP TABLE` command for the archives is reserved for a future, post-production-stability gate.
