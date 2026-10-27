# Phase 2B Gate 5.3: Write-Path Implementation & Validation Report

## Overview
This report finalizes **Gate 5.3: Write-Path Redesign** for the Shedbody EAV Migration. We have successfully pivoted all application writes away from the legacy `progress_entries`, `nutrition_logs`, and `lifestyle_logs` physical tables. All new writes are now inserted into the canonical `metric_entries` append-only EAV ledger.

## Validation of Implementation Requirements

### 1. Direct EAV Write Path
All application write endpoints have been refactored to use the newly created `MetricWriteAdapter`:
- `lib/repositories/ProgressRepository.js` (`upsertProgressEntry`)
- `app/api/nutrition/route.js`
- `app/api/lifestyle/route.js`

**Legacy Writes Halted:** Application logic no longer targets the legacy tables directly. The legacy tables will naturally cease to receive new rows from the application.

### 2. Append-Only Rule (No Updates)
- `MetricWriteAdapter.commit()` exclusively performs bulk `INSERT` statements to `metric_entries`.
- It relies on the view layer (`MetricReadAdapter`) to perform the `DISTINCT ON (user_id, metric_id, log_date)` collapse based on `recorded_at DESC`. No `UPDATE` statements are ever executed against the ledger.

### 3. Exact Metric Mapping & Type Safety
The constraint definitions mapped out during the audit have been strictly implemented in `MetricWriteAdapter.js`:
- `weight`, `body_fat`, `water`, `steps`, `sleep` -> Mapped directly to `value_numeric`.
- `workout` (Boolean) -> Mapped as `1.0` (true) and `0.0` (false).
- `calories`, `protein` -> Values mapped to `value_numeric`, and `target_calories_snapshot` / `target_protein_snapshot` are retrieved from active plans and stamped into the JSONB `metadata` column for that specific row entry.

### 4. Sparse Updates & Atomic Batches
- **Sparse Execution:** The API routes have been refactored to parse payloads safely and preserve `undefined` values. `MetricWriteAdapter` gracefully ignores `undefined` payload keys, ensuring that if a user only updates `{ water: 2500 }`, we do not falsely insert unchanged versions of calories/protein.
- **Atomicity:** Supabase/PostgREST naturally treats an array of objects passed to `.insert([...rows])` as a single atomic transaction.

### 5. Tombstone Deletion Semantics
- When a user explicitly clears a value (sending `""` or `null` from the frontend), the respective API parses it as `null`.
- The `MetricWriteAdapter` intercepts this and writes a tombstone row: `value_numeric: null` and `deleted_at: now()`.
- This ensures downstream consumers using `deleted_at IS NULL` filters will filter out the tombstone, hiding it from views without violating the append-only rule.

### 6. Profile Weight Synchronization
- Handled gracefully via the new trigger (`on_metric_entries_weight_changed`) that was deployed in Stage A (`supabase/migrations/20261005000000_metric_entries_weight_sync.sql`).
- Upon any `INSERT` to `metric_entries` where `metric_id = 'weight'`, the database trigger queries the `metric_entries` ledger for the newest weight for that user and synchronizes it backwards to `user_profiles.weight_kg`, preserving historical application behavior correctly.

### 7. Legacy Write Reference Audit
- Search confirmed **0 remaining active application references** to legacy endpoints (`upsert_progress_entry`, `upsert_nutrition_log`, `upsert_lifestyle_log`) across the frontend `/app` directory, `/components`, `/lib`, and `/data` folders.

## CI/CD Validation
- Local test suite (`test_metric_write_adapter.js`) **passed**.
- `npm run build` execution **successful**.

## Next Steps / Readiness
Gate 5.3 is fundamentally **COMPLETE**. 

**Phase 2B is now complete.**
We are officially ready to proceed to **Phase 2C (Gate 6): Read/Write Disconnect & Cleanup**, where we can safely drop the physical legacy tables (`progress_entries`, `nutrition_logs`, `lifestyle_logs`) entirely and replace them with backwards-compatible SQL views if required by direct BI consumers.
