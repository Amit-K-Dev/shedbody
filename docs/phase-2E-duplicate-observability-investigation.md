# Phase 2E — Duplicate Observability Investigation

## 1. Physical Ledger Semantics
In the `metric_entries` physical ledger, the canonical identity of a record is defined by the composite key `(user_id, metric_id, log_date)`.
- **Multiple physical rows allowed:** Yes. The table has no `UNIQUE` constraint on this composite key because it is designed as an append-only event ledger.
- **Expected behavior:** Multiple physical rows for the same identity are fully expected. If a user logs a weight of 150 lbs, and later that day updates it to 148 lbs, a second physical row is appended rather than updating the first.
- **Canonical winner resolution:** The winner is determined by the `ORDER BY` clause: `recorded_at DESC, created_at DESC, id DESC`. The most recent client timestamp (`recorded_at`) wins. If identical, the most recent server timestamp (`created_at`) wins, followed by the highest auto-incrementing `id`.
- **Impact on application state:** Multiple physical rows cannot cause incorrect application state, because the application strictly consumes data through `vw_metric_entries_latest`, which enforces canonical singularity.

## 2. Canonical View Semantics
The canonical projection `vw_metric_entries_latest` uses a `DISTINCT ON (user_id, metric_id, log_date)` clause coupled with the strict `ORDER BY` resolution described above. 
By definition within the PostgreSQL engine, it is structurally impossible for this view to output more than one row per `(user_id, metric_id, log_date)` combination. It effectively collapses all physical duplicates into a single, deterministic canonical state.

## 3. Current Validator Capability
- **Physical ledger (`metric_entries`):** The baseline script (`phase2e_observation_baseline.mjs`) can only prove the total physical row count, tombstone count, and distributions by metric/source. It **cannot prove** the number of duplicates or appends existing in the physical ledger.
- **Canonical projection (`vw_metric_entries_latest`):** The validator queries this view for `HAVING COUNT(*) > 1`. Because the view already enforces `DISTINCT ON`, this check is a tautology (it will always be 0). Therefore, the validator proves nothing about underlying row duplication.

## 4. Evidence Currently Available
A review of existing Phase 2E evidence (the baseline observation log and the final evidence matrix) reveals that there is **no direct measurement** of physical `metric_entries` duplicates. The only metric captured (`canonicalDuplicates = 0`) is derived from the tautological view query.

## 5. Evidence Currently Missing
We are entirely blind to the "append velocity" or the physical duplication rate in the system. We do not know:
- How many physical rows share the same `(user_id, metric_id, log_date)`.
- The ratio of total physical rows to actual canonical rows.
- Whether any client is stuck in an infinite loop, spamming identical writes (which would silently accumulate in the physical ledger while being perfectly collapsed by the view).

## 6. Risk Classification
This finding is strictly a **NON-BLOCKING OBSERVABILITY GAP**. 
It is not a data-integrity risk because the append-only architecture natively relies on "duplicates" to function as a history log, and the read-path correctly projects the final state. The risk is limited to storage bloat or lack of engineering insight into client behavior, neither of which impacts correctness.

## 7. Future Validator Enhancement Recommendation
A future enhancement to the observation protocol WOULD be highly useful to measure EAV append health. If implemented in the future, it should query the physical `metric_entries` table directly to measure:
- **Total Canonical Identities:** `SELECT COUNT(*) FROM (SELECT DISTINCT ON (user_id, metric_id, log_date) 1 FROM metric_entries) sub;`
- **Total Excess Physical Rows:** `(Total physical rows) - (Total Canonical Identities)`
- **Duplicate Occurrence Rate:** Number of identities where `COUNT(*) > 1` grouped by `(user_id, metric_id, log_date)`.
- **Max Appends Per Identity:** To detect potential runaway clients spamming updates.
*(Note: Per instructions, this is a documented concept only and has not been added to the validator).*

## 8. Gate-7 Impact
This finding is a **NON-BLOCKING OBSERVABILITY GAP**. The lack of physical duplicate tracking does not destabilize the system or present a risk to the legacy architecture destruction.

**Reassessment of Previous Operational Recommendations (Rollback Playbook / Backups):**
A strict review of the Phase 2E Production Observation Protocol (`docs/phase-2E-production-observation-protocol.md`, Section 14) reveals that a "Rollback Playbook", "External BI Sign-off", and "Database Backups" are **not** explicitly listed as Gate-7 prerequisites. 
Therefore, they are reclassified as operational recommendations. They do not constitute formal protocol blockers.

## 9. Confirmed Actual Blockers Only
According strictly to the Phase 2E Protocol (Section 14), the ONLY remaining blockers preventing Gate 7 authorization are:
1. **Time Passage:** The 14-day calendar observation window must conclude organically (2026-10-19) with no NO-GO incidents.
2. **Product-Owner Authorization:** Explicit administrative authorization must be provided to execute the destructive DROP.

## 10. Explicit Statement
Gate 7 remains **LOCKED / UNAUTHORIZED**.
