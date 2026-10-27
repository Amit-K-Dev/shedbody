# Phase 2E — Evidence Reconciliation Audit

## 1. Executive Summary
This audit provides evidence-level reconciliation of the Unified Tracking Engine's migration safety and architectural claims. Prior assertions have been systematically verified against the active source code, PostgreSQL system catalogs, and repository configurations using strict read-only methods.

## 2. Repository External Dependency Audit
A comprehensive grep search was conducted across the codebase (`!supabase/`, `!docs/`, `!scratch/`, `!tests/`) for legacy tables (`archive_progress_entries`, `progress_entries`, etc.).

*   **`lib/plans/adaptationService.test.js`**: Hardcoded mocks for `progress_entries` and `nutrition_logs`. (TEST/MOCK ONLY)
*   **`lib/habits/engine.js`, `lib/analytics/unified.js`, `lib/analytics/progress.js`**: Mentioned exclusively in JSDoc comments. (DOCUMENTATION ONLY)
*   **`app/api/progress/route.js`**: Mentioned exclusively in comments. (DOCUMENTATION ONLY)
*   **External Integrations/BI/Cron**: No `supabase/functions/` exist. No `.github/workflows/` exist. No scheduled external scripts discovered in the repository. (UNKNOWN)

**Conclusion:** Zero active production runtime dependencies exist within this repository.

## 3. PostgreSQL Dependency Audit
A Node.js script queried `pg_class`, `pg_depend`, `pg_constraint`, `pg_trigger`, and `pg_policy` directly.

*   **`archive_progress_entries`** (and related tables) physically exist (`relkind: 'r'`).
*   **Triggers:** Empty. All legacy triggers (e.g., `update_progress_updated_at`, `on_progress_entries_changed`) were confirmed successfully dropped.
*   **Constraints:** Primary keys, foreign keys (`progress_entries_user_id_fkey`), and check constraints remain active on the archive tables.
*   **Views/Functions:** `pg_depend` returned zero dependencies linking `archive_progress_entries` to any view (`pg_rewrite`) or function (`pg_proc`).
*   **Policies:** Six RLS policies remain bound to `archive_progress_entries`.

**Conclusion:** The archive tables are completely orphaned from the active database execution paths.

## 4. Rollback Evidence
*   **Mechanism:** Migration `20261005050304_gate6_legacy_deprecation.sql` executed `ALTER TABLE ... RENAME TO archive_...`.
*   **Reversibility:** Supabase does not automatically generate "down" migrations. Rolling back would require authoring a manual reverse migration.
*   **Post-Gate 7:** Once `DROP TABLE` is executed, rollback via migration is impossible.

**Conclusion:** Rollback is currently possible via schema mutation. Post-Gate 7 rollback is impossible without database backup restoration.

## 5. Backup/Recovery Evidence
*   **Repository Evidence:** Searched `package.json` for backup scripts. Searched for CI/CD workflows. Both yielded zero results.
*   **Supabase Config:** PITR (Point-in-Time Recovery) and physical backups are managed by the managed Supabase platform, which is opaque to the local repository filesystem.

**Status:** NOT OBSERVABLE FROM CURRENT READ-ONLY AUDIT.

## 6. Performance Evidence
*   **Claim Re-evaluation:** Previous reports casually mentioned "Index Only Scan".
*   **Actual Evidence:** `EXPLAIN ANALYZE` logs (from Day 0 to Day 4) prove the database executes an `Index Scan using idx_metric_entries_deterministic_sort`. It is **not** an Index Only Scan. 
*   **Stability:** The structural query plan remains identical across executions.

**Status:** PROVEN BY SOURCE (Index Scan).

## 7. Write-Path Evidence
*   **Repository Search:** Searched `.update(`, `.upsert(`, `.delete(` across `MetricWriteAdapter.js`. Searched `.from('metric_entries')` across the repository.
*   **Evidence:** `MetricWriteAdapter.js` exclusively uses `.insert(rows)`. No other file in `lib/` or `app/` mutates `metric_entries`.

**Status:** PROVEN BY SOURCE. The write path is strictly append-only.

## 8. Read-Path Evidence
*   **Repository Search:** Searched `vw_metric_entries_latest` across the repository.
*   **Evidence:** Exclusively used by `MetricReadAdapter.js`, database RPC `create_weight_goal`, and observation/verification scripts. `metric_entries` is never read directly by the application.

**Status:** PROVEN BY SOURCE. Canonical reads exclusively use the projection view.

## 9. Weight Sync Evidence
*   **Mechanism:** `on_metric_entries_weight_changed` fires `AFTER INSERT`.
*   **Evidence:** Because it triggers inside the exact same PostgreSQL transaction as the bulk `INSERT`, ACID transaction semantics guarantee it sees its own uncommitted inserts. The internal `ORDER BY log_date DESC, recorded_at DESC LIMIT 1` deterministically enforces the "latest" value.
*   **Limitations:** While structurally race-condition safe at the Postgres kernel level, the performance impact of firing this trigger `N` times for `N` rows in a bulk payload has not been load-tested.

**Status:** PROVEN BY SOURCE (Data Integrity). REQUIRES MANUAL VERIFICATION (Performance under heavy bulk load).

## 10. Goal Integration Evidence
*   **Mechanism:** `create_weight_goal` queries `vw_metric_entries_latest` with `deleted_at IS NULL ORDER BY log_date DESC LIMIT 1`.
*   **Tombstone Evidence:** If the latest row is tombstoned, the view exposes `deleted_at`, which the RPC filters out. It correctly selects the next valid historical weight.
*   **Fallback Evidence:** If the user has zero metrics, it gracefully falls back to `user_profiles.weight`.

**Status:** PROVEN BY SOURCE.

## 11. Previous Audit Claims — Reconciled

| Claim | Previous Status | Reconciled Status | Reason |
| :--- | :--- | :--- | :--- |
| Legacy dependencies completely isolated | PROVEN | **PARTIALLY PROVEN** | Proven for codebase/DB. External BI tools remain UNKNOWN. |
| Duplicate writes are safe | PROVEN | **PROVEN BY SOURCE** | `DISTINCT ON` in the view handles duplicates deterministically. |
| Tombstones are flawlessly handled | PROVEN | **PROVEN BY SOURCE** | RPC and ReadAdapter both actively filter them. |
| Weight sync race-condition risk is zero | PROVEN | **PROVEN BY SOURCE** | Guaranteed by PG transaction isolation. |
| Migration rollback is highly recoverable | PROVEN | **DOWNGRADED** | Impossible post-Gate 7 without unverified backups. |
| Canonical reads exclusively use view | PROVEN | **PROVEN BY SOURCE** | Confirmed via exhaustive codebase grep. |
| Performance is PROVEN SAFE | PROVEN | **PARTIALLY PROVEN** | Index Scan verified, but load-testing for scale is absent. |

## 12. Proven Facts
1. The application write-path is completely append-only.
2. Legacy `archive_*` tables have zero inbound database dependencies (views/functions).
3. Legacy `archive_*` tables are unreferenced by application runtime code.

## 13. Inferences
1. We infer that no external Metabase/BI tools are querying the database directly, as no configuration files exist in the repository to suggest this.

## 14. Unknowns
1. The existence and validity of a point-in-time database backup (`pg_dump` or Supabase PITR).
2. External systems querying the database outside the Next.js API.

## 15. Blockers
1. The inability to verify backup integrity from the codebase blocks Gate 7.

## 16. Gate 7 Preconditions
1. Explicit manual verification of a secure, restorable database backup.
2. Successful conclusion of the 14-day observation window (2026-10-19).

## 17. Final Verdict
The system architecture matches the documented specifications precisely. However, due to the irrecoverable nature of Gate 7 and the unobservable status of database backups, physical destruction cannot be authorized.

***
Gate 7 remains LOCKED and UNAUTHORIZED. No destructive operation is authorized by this audit.
