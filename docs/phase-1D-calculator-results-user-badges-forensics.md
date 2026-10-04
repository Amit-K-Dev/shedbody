# Phase 1D — Calculator Results and User Badges Forensics

## 1. Production Target Verification
- **Project Ref:** `libmchubiqdvhfqwfdwo` (ShedBodyDB)
- **Environment:** Remote Production

## 2. Current Row Counts
- `auth.users`: 7
- `calculator_results`: 14
- `user_badges`: 0

## 3. Orphan Counts
- `calculator_results` orphans: 0
- `user_badges` orphans: 0

## 4. Exact Orphan UUIDs
- N/A (No orphans found in either table).

## 5. Forensic Classification
- Because there are currently zero orphans in both tables on production, no complex data recovery, stubs, or hard deletions of production records are required to enforce referential integrity constraints. The tables are perfectly clean.

## 6. Application Dependency Analysis
- **`calculator_results`**: Queried/inserted by `CalculatorEngine.jsx`. It stores personal physical calculation results (BMR, TDEE, etc.) tightly coupled to the user's identity. There is no community or aggregated dependency that relies on keeping these records after a user deletes their account.
- **`user_badges`**: Queried/inserted by `checkBadges.jsx`. These are digital rewards earned by a user. They have no value or context if the user account is deleted.
- **Upstream Dependencies:** No other tables in the `public` schema have foreign keys referencing `calculator_results` or `user_badges`.

## 7. Recommended Deletion Semantics
- **`calculator_results`**: `ON DELETE CASCADE`. This is highly personal user data that must be purged when a user deletes their account to comply with data minimization and GDPR/CCPA.
- **`user_badges`**: `ON DELETE CASCADE`. Badges are strictly user-owned rewards.

## 8. Safety / Risk Assessment
- **Risk Level: LOW.**
- Adding `ON DELETE CASCADE` constraints will immediately succeed because there are no existing orphan records violating the constraints.
- No application code changes are required, as the code already operates under the assumption that these rows belong to valid users.

## 9. Next-Step Recommendation
Create and apply a migration (e.g. Phase 1E) to execute the following DDL:
```sql
ALTER TABLE public.calculator_results
  ADD CONSTRAINT calculator_results_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_badges
  ADD CONSTRAINT user_badges_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```
*(Optional but recommended: altering `user_badges.user_id` to be `NOT NULL` to match the data model intent, as it is currently `NULLABLE`.)*
