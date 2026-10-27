# Phase 2C Gate 6 Legacy Deprecation Audit Report

## 1. FULL LEGACY TABLE DEPENDENCY SCAN
**progress_entries, nutrition_logs, lifestyle_logs** were searched across the repository. 
- **Active READs:** None remaining in application logic (`MetricReadAdapter` fully bypasses legacy tables).
- **Active WRITEs:** None remaining (`MetricWriteAdapter` is exclusively active).
- **Trigger/Function Dependency:**
  - `progress_entries` is explicitly queried by the RPC `create_weight_goal` (in `supabase/migrations/20260918045243_goals_domain.sql`).
  - `sync_user_profile_weight` (retired trigger logic), `trigger_gamification_on_progress` (retired trigger logic).
- **Foreign Key Dependency:** None. (Legacy self-contained).
- **View Dependency:** None.
- **RPC Dependency:**
  - `upsert_nutrition_log` (exists in DB, inactive in app)
  - `upsert_lifestyle_log` (exists in DB, inactive in app)
  - `create_weight_goal` (exists in DB, ACTIVE in app)
- **Migration/History:** Heavily referenced in early migrations and documentation.
- **Test/Mock:** Multiple test mocks remain.
- **External/Unknown:** None identified.

## 2. DATABASE OBJECT DEPENDENCY GRAPH
Based on PostgreSQL catalog queries (`pg_class`, `pg_depend`, `pg_proc`):
- **progress_entries**:
  - Triggers: `update_progress_updated_at`, `on_progress_entries_changed`
  - Functions: `create_weight_goal` queries `progress_entries` to derive initial `start_value`. `sync_user_profile_weight` and `trigger_gamification_on_progress` reference it.
  - Views: None.
  - Foreign Keys: None.
- **nutrition_logs**:
  - Functions: `upsert_nutrition_log`.
  - Views/Triggers/FKs: None.
- **lifestyle_logs**:
  - Functions: `upsert_lifestyle_log`.
  - Views/Triggers/FKs: None.

## 3. APPLICATION DEPENDENCY
**Status:** Mostly Clear, One DB Exception.
- **Reads:** Clear.
- **Writes:** Clear.
- **RPCs:** The application still calls `create_weight_goal`, which inherently reads from `progress_entries` under the hood. Thus, the database layer for goal creation remains dependent on the legacy table.
- **IDs/Constraints:** Clear. The legacy auto-increment/UUID dependencies are completely bypassed by the EAV architecture.

## 4. EXTERNAL CONSUMERS
**Status:** Clear.
- No Supabase Edge Functions, BI tools, Cron jobs, or external webhooks are configured that consume `progress_entries`, `nutrition_logs`, or `lifestyle_logs`.

## 5. LEGACY DATA STATUS
- Row counts in legacy tables reflect only the rows existing prior to the Gate 5.3 deployment.
- New inserts are successfully flowing exclusively into `metric_entries`.
- Legacy tables are essentially "static historical archives" right now.

## 6. EAV COVERAGE
**Equivalent Verification:**
- **progress_entries**:
  - `weight` -> EAV `weight` (numeric)
  - `body_fat` -> EAV `body_fat` (numeric)
  - **`notes` -> NO EXPLICIT EAV EQUIVALENT DETECTED**. 
    *Analysis:* The new `metric_entries` schema relies on `value_numeric` (FLOAT8) and `metadata` (JSONB). If `notes` are to be retained, they must be stored within the `metadata` JSONB blob, but there is no specific schema guarantee or adapter logic explicitly handling `notes`.
- **nutrition_logs**:
  - `calories_consumed` -> EAV `calories`
  - `protein_consumed` -> EAV `protein`
  - `water_ml` -> EAV `water`
  - Target snapshots are correctly stored in `metadata`.
- **lifestyle_logs**:
  - `workout_completed` -> EAV `workout` (converted to 1/0)
  - `steps_count` -> EAV `steps`
  - `sleep_hours` -> EAV `sleep`

## 7. PROFILE / GAMIFICATION DEPENDENCIES
- **Profile Weight Sync:** The new trigger `on_metric_entries_weight_changed` natively synchronizes `user_profiles.weight` when EAV `weight` is logged. This successfully replaces the legacy `on_progress_entries_changed` trigger behavior.
- **Gamification:** Previous gamification triggers (`trigger_gamification_on_progress`) were retired and decoupled in Phase 1D/Slice 5.

## 8. DELETION / TOMBSTONE DEPENDENCIES
- **Status:** Clear.
- Applications currently clear state by issuing `MetricWriteAdapter.deleteProgressEntry`, which inserts a tombstone (`deleted_at`).
- No runtime path issues physical `DELETE` statements against the legacy tables.

## 9. ROLLBACK STRATEGY
If a rollback is required before or during destructive clean-up:
- **Strategy:** Do not physically drop the tables. Rename them to `archive_progress_entries`, `archive_nutrition_logs`, etc.
- To restore reads/writes, simply revert the `lib/repositories` adapters to their pre-Gate 5.3 versions, and re-enable the RPCs in `start/page.js`, `api/nutrition/route.js`, and `api/lifestyle/route.js`. 
- Data logged *during* the EAV window would need to be back-ported (INSERT INTO) the legacy tables to prevent data loss upon rollback.

## 10. COMPATIBILITY VIEW DECISION
**Decision:** UNNECESSARY.
Because the application strictly reads via `vw_metric_entries_latest` and writes via the Node.js `MetricWriteAdapter` layer, the application itself does not require PostgreSQL compatibility views. Compatibility views are generally intended for BI tools or external consumers, which this project lacks.

## 11. DROP ORDER
*For reference only. Do not execute.*
1. **Triggers:** Drop `update_progress_updated_at`, `on_progress_entries_changed`.
2. **Functions:** Drop `sync_user_profile_weight`, `trigger_gamification_on_progress`, `upsert_progress_entry`, `upsert_nutrition_log`, `upsert_lifestyle_log`.
3. **RPC Fix:** Update `create_weight_goal` to read from `vw_metric_entries_latest` instead of `progress_entries`.
4. **Tables:** Drop `progress_entries`, `nutrition_logs`, `lifestyle_logs`.

## 12. VALIDATION
- **Database Metadata:** Validation performed via direct PostgreSQL catalog queries (`pg_proc`, `pg_depend`, `information_schema`).
- **Source Code:** Full `git grep` scanning across `app/`, `lib/`, and `supabase/migrations/`.
- **Unit Tests & Build:** Validated in Gate 5.3.

## 13. FINAL DECISION
**CONDITIONAL GO**

The legacy tables are safe to retire **ONLY AFTER** the following prerequisites are met:
1. **Refactor `create_weight_goal` RPC:** The PostgreSQL function must be updated to query `vw_metric_entries_latest` instead of `progress_entries` to determine the user's starting weight.
2. **Resolve `notes` Data Loss:** Address the missing EAV equivalent for `progress_entries.notes`. We must determine if `notes` should be migrated into `metric_entries.metadata`, or explicitly discarded.
