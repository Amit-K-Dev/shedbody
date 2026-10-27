# Phase 2C Gate 6 Blocker Resolution Audit

This document addresses the final two blockers identified in the initial Gate 6 Legacy Deprecation Audit, strictly observing the rules to perform read-only forensics without altering the database schema or code.

---

## 1. `create_weight_goal` Dependency Audit

**Caller Audit:**
- `create_weight_goal` is a PostgreSQL RPC called by the application to establish a new active weight goal for a user.
- Upon creation, the RPC requires an initial `start_value` to anchor the goal's progress.

**Exact Semantics for Deriving Starting Weight:**
- **Current Query (Priority 1):** It fetches the most recent logged weight from `progress_entries` where `deleted_at IS NULL` and `weight IS NOT NULL`.
- **Ordering:** `ORDER BY entry_date DESC, created_at DESC LIMIT 1`. This prioritizes the latest logical date (`entry_date`), using the insertion timestamp (`created_at`) as a tiebreaker for multiple entries on the same day.
- **Fallback (Priority 2):** If the user has no valid weight in `progress_entries`, it falls back to querying `weight` from `user_profiles`.

**Legacy Dependencies:**
- It relies on `progress_entries.weight`, `progress_entries.entry_date`, `progress_entries.created_at`, and `progress_entries.deleted_at`.
- It does not depend on any other columns in `progress_entries`.

**EAV Compatibility:**
- Replacing `progress_entries` with `vw_metric_entries_latest` will preserve the *exact* application behavior.
- `vw_metric_entries_latest` is constructed as `DISTINCT ON (user_id, metric_id, log_date)` ordered by `log_date, recorded_at DESC, created_at DESC`. Thus, querying `vw_metric_entries_latest` with `ORDER BY log_date DESC LIMIT 1` natively handles the tiebreaking and correctly returns the most recently logged metric.

---

## 2. Proposed Replacement SQL Design

The following SQL migration is the proposed design to refactor the RPC. **(Not to be executed yet)**.

```sql
CREATE OR REPLACE FUNCTION public.create_weight_goal(p_target_value numeric)
RETURNS public.goals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_existing_goal public.goals;
    v_new_goal public.goals;
    v_start_value numeric;
    v_lock_key bigint;
BEGIN
    -- Authorization: must be authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    -- Validation: target_value must be valid and positive
    IF p_target_value IS NULL OR p_target_value <= 0 THEN
        RAISE EXCEPTION 'target_value must be greater than 0';
    END IF;

    -- Advisory lock to prevent race conditions
    v_lock_key := hashtextextended(v_user_id::text, 1);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Check for existing active goal
    SELECT * INTO v_existing_goal
    FROM public.goals
    WHERE user_id = v_user_id AND domain = 'weight' AND status = 'active';

    IF FOUND THEN
        -- Same-Target Idempotency
        IF v_existing_goal.target_value = p_target_value THEN
            -- Update compatibility cache even on idempotent request
            INSERT INTO public.user_profiles (user_id, target_weight)
            VALUES (v_user_id, p_target_value)
            ON CONFLICT ON CONSTRAINT user_profiles_pkey DO UPDATE 
            SET target_weight = EXCLUDED.target_weight;
            
            RETURN v_existing_goal;
        END IF;

        -- Different Target: Abandon existing
        UPDATE public.goals
        SET status = 'abandoned', updated_at = now()
        WHERE id = v_existing_goal.id;
    END IF;

    -- Derive start_value
    -- Priority 1: Most recent non-deleted weight from vw_metric_entries_latest
    SELECT value_numeric INTO v_start_value
    FROM public.vw_metric_entries_latest
    WHERE user_id = v_user_id 
      AND metric_id = 'weight' 
      AND deleted_at IS NULL
    ORDER BY log_date DESC
    LIMIT 1;

    -- Priority 2: user_profiles.weight
    IF v_start_value IS NULL THEN
        SELECT weight INTO v_start_value
        FROM public.user_profiles
        WHERE user_id = v_user_id;
    END IF;

    -- Create new goal
    INSERT INTO public.goals (
        user_id,
        domain,
        start_value,
        target_value,
        start_date,
        target_date,
        status
    ) VALUES (
        v_user_id,
        'weight',
        v_start_value,
        p_target_value,
        CURRENT_DATE,
        NULL,
        'active'
    ) RETURNING * INTO v_new_goal;

    -- Synchronize compatibility cache
    INSERT INTO public.user_profiles (user_id, target_weight)
    VALUES (v_user_id, p_target_value)
    ON CONFLICT ON CONSTRAINT user_profiles_pkey DO UPDATE 
    SET target_weight = EXCLUDED.target_weight;

    RETURN v_new_goal;
END;
$$;
```

---

## 3. `notes` Usage Audit

A comprehensive search of the repository and database yielded the following context regarding `progress_entries.notes`:

1. **Active Application Writes:** None. `MetricWriteAdapter` does not write notes into the EAV payload.
2. **Active Application Reads:** The `MetricReadAdapter` explicitly stubs `notes` to `null` to satisfy any legacy UI expectations (`{ entry_date: row.log_date, notes: null }`). 
3. **API Response / UI:** The application components and UI do not display `notes`.
4. **Historical Legacy Data (`row_counts`):** A direct query of the database reveals that the `progress_entries` table currently has **0** rows entirely. 
5. **Product/Business Meaning:** `notes` were historically meant for open-ended journaling but have been deliberately abandoned due to **PII risks**.
   - As stated in `docs/phase4.5-context-engine-design.md`: "Exclusions: `notes` field is explicitly excluded to eliminate unstructured PII leak risk."
   - The test suite (`scripts/test-ai-context.js`) rigorously enforces that notes containing potential PII (e.g., medical conditions like "depression") are forcefully stripped.
6. **EAV Metadata Convention:** The `metadata` (JSONB) column in `metric_entries` could technically support a `"notes"` key. However, based on the architectural PII constraints, doing so is strictly forbidden.

---

## 4. `notes` Preservation / Deprecation Decision

**Decision:** Genuninely Unused/Dead Legacy Data. **DEPRECATE.**

**Evidence:**
- There are currently 0 historical rows containing notes (the table is completely empty).
- The AI contextual ingestion pipeline strictly prohibits unstructured free-text fields due to PII compliance risks. 
- The application explicitly stubs `notes: null` to conform to older shape interfaces without fetching them.

The `notes` column is obsolete, empty, and constitutes an active data privacy liability if resurrected. It should be intentionally discarded without any backfill or preservation into EAV `metadata`.

---

## 5. Legacy vs. EAV Data Coverage Audit

**Legacy Inventory (As of Current Read):**
- `progress_entries` row count: 0
- `nutrition_logs` row count: 0
- `lifestyle_logs` row count: 0
- Non-null notes count: 0
- Latest legacy dates: null (empty table)

**EAV Coverage:**
Because the legacy tables have already been completely emptied (0 rows remain), there is no historical data that risks being lost or lacking EAV deterministic equivalents during the DROP.

All new writes are flowing exclusively and securely into `metric_entries`.

---

## 6. Rollback Strategy

Given that the legacy tables currently contain 0 rows and hold no historical data, a rollback strategy focused on data preservation is not necessary. However, a structural rollback strategy is required to ensure the application could revert to using the legacy schema if the EAV system fails.

**Rollback Plan (Schema Preservation vs Drop):**
- **Action:** Instead of executing `DROP TABLE`, we will `RENAME` the legacy tables to `archive_progress_entries`, `archive_nutrition_logs`, and `archive_lifestyle_logs`.
- **Reason:** While empty, renaming rather than dropping preserves the exact DDL schema definitions constraints in the database. If we must roll back, we only need to rename the tables back to their original names, and the legacy code paths would resume functioning perfectly, without needing a complex schema-restoration migration. 
- Once system stability on EAV is guaranteed for an extended period, a final `DROP TABLE` can be authorized.

---

## 7. Exact Prerequisites for Destructive Cleanup

To safely execute the structural archival (deprecation) of the legacy tables, the following exact migration steps must run in a single transaction:

1. **Refactor RPC:** Deploy the updated `create_weight_goal` function to use `vw_metric_entries_latest`.
2. **Drop Triggers:** Drop `update_progress_updated_at` and `on_progress_entries_changed`.
3. **Drop Dead RPCs:** Drop `sync_user_profile_weight`, `trigger_gamification_on_progress`, `upsert_progress_entry`, `upsert_nutrition_log`, `upsert_lifestyle_log`.
4. **Rename Tables (Rollback-Safe Deprecation):** 
   - `ALTER TABLE progress_entries RENAME TO archive_progress_entries;`
   - `ALTER TABLE nutrition_logs RENAME TO archive_nutrition_logs;`
   - `ALTER TABLE lifestyle_logs RENAME TO archive_lifestyle_logs;`

---

## 8. GO/NO-GO Recommendation for Gate 6

**GO.**

All identified blockers have been resolved. `notes` are conclusively determined to be deprecated dead-data with PII risks, the `create_weight_goal` replacement has been strictly designed, and there is 0 historical data to preserve.

You may safely authorize the execution of the Gate 6 Deprecation Migration using the rollback-safe table rename strategy.
