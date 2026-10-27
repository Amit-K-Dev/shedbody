# Phase 2E — Operational Risk Review

## 1. Scope
This document outlines a read-only operational risk review for Phase 2E prior to Gate 7 execution. The review specifically investigates the integrity of the observation protocol, data-integrity edge cases within the EAV model, goal-creation edge cases, and performance boundaries. The intention is to identify any hidden risks that might invalidate the final Gate 7 destruction decision.

## 2. Evidence Examined
Strict read-only inspection was performed on:
- `scratch/phase2e_observation_baseline.mjs` (Observation Validator)
- `scratch/viewdef.mjs` (View Definition query)
- `lib/repositories/MetricWriteAdapter.js` (Write Path)
- `supabase/migrations/20261005044818_update_create_weight_goal.sql` (Goal RPC)
- `supabase/migrations/20261005000000_metric_entries_weight_sync.sql` (Weight Sync Trigger)

## 3. Proven-Safe Invariants
The following edge cases are strictly handled by the database schema, canonical views, and adapters:

### Data-Integrity Edge Cases
- **Duplicate Submissions & Multiple Same-Day Entries:** Handled by `vw_metric_entries_latest` using `DISTINCT ON (user_id, metric_id, log_date)`. Only the most recent entry per day (by `recorded_at DESC`) is exposed.
- **Tombstone Followed by Restoration:** A new valid insert will receive a newer `recorded_at`, displacing the tombstone for that `log_date`.
- **Tombstone as the Latest Entry:** The `DISTINCT ON` correctly resolves the tombstone as the latest row for the day. Application queries filtering by `deleted_at IS NULL` will safely omit the day entirely.
- **Historical Backfills:** The view properly orders by `log_date`, ensuring backfills correctly slot into historical timelines regardless of their execution time.
- **NULL Numeric Values:** Explicit `null` or `""` inputs sent to `MetricWriteAdapter` are securely translated into tombstone records (`isDeleted = true`, `deleted_at = now`).
- **Multi-Metric Transactions:** Handled atomically in a bulk insert within `MetricWriteAdapter.js`.
- **Historical Weight Syncing:** The trigger `sync_user_profile_weight_from_metrics` re-evaluates the absolute latest weight (`ORDER BY log_date DESC, recorded_at DESC`) across the user's entire history, ensuring that inserting a historical weight does not erroneously overwrite the profile with an outdated value.

### Goal Edge Cases (`create_weight_goal`)
- **No EAV Weight:** Safely falls back to `user_profiles.weight` as Priority 2.
- **Latest EAV Weight Deleted:** The query explicitly filters `WHERE deleted_at IS NULL`. If today's weight is tombstoned, it organically skips to the most recent non-deleted historical weight.
- **Profile Fallback & Same-Day/Backfill Weights:** Safely insulated by the deterministic `ORDER BY log_date DESC` limit constraint.

## 4. Partially-Proven Invariants
- **Goal Creation vs Weight Insertion Concurrency:** `create_weight_goal` utilizes an advisory lock (`pg_advisory_xact_lock`), but `MetricWriteAdapter` does not. While mostly safe, a microsecond race condition could result in the goal utilizing a slightly stale weight reading.
- **Performance Bounding:** `vw_metric_entries_latest` mandates an expensive sort for `DISTINCT ON`. Provided the application layer consistently filters by `user_id` and `log_date`, the bounding is constrained. Unbounded queries (like the one in the baseline validator) could trigger full index/table scans.

## 5. Unknowns
- **Observation Gap (Duplicates):** The validator script tests for duplicate rows by querying `vw_metric_entries_latest HAVING COUNT(*) > 1`. Because the view definition itself applies a strict `DISTINCT ON (user_id, metric_id, log_date)`, it is logically impossible for the view to return duplicates. Therefore, the validator is enforcing a tautology and **does not measure the actual occurrence rate of duplicate inserts in the underlying `metric_entries` table**.
- **Observation Gap (Out-of-Order/NULLs):** The validator does not measure or report occurrences of out-of-order `recorded_at` vs `log_date` anomalies, nor does it explicitly guard against non-deleted rows bearing `value_numeric IS NULL`.

## 6. Actual Blockers (Gate 7 Decision Gaps)
The following explicitly prevent the execution of Gate 7 (dropping legacy tables):
1. **Time Passage:** The 14-day calendar observation window remains conditionally pending. It organically concludes on **2026-10-19**.
2. **Database Backup Integrity:** A manual snapshot or point-in-time recovery export remains completely out-of-band and unverified.
3. **External BI Sign-Off:** Verification that zero external systems rely on `archive_*` tables remains administratively blocked.
4. **Rollback Playbook:** A post-Gate-7 rollback plan has not been formulated.

## 7. Non-Blocking Observations
- The gaps in the observation protocol validator (tautological duplicate check) do not threaten system stability. The view inherently resolves the duplicates safely. It simply means the *reporting* of these anomalies is silent.

## 8. Required Evidence Before Final Gate 7 Review
- Successful completion of the 14-day observation log without `NO-GO` events.
- Administrative confirmation of an offline database backup.

## 9. Gate Status Verdict
**Gate 7 remains completely LOCKED and UNAUTHORIZED.** Absolutely zero destructive operations or migrations may be performed on the legacy architecture at this time.
