# Phase 2E — External Dependency & Recovery Readiness Audit

## 1. Executive Summary
This document outlines the findings of the Pre-Gate-7 audit focusing specifically on **External Dependency Surface** and **Backup/Recovery Readiness**. As part of Phase 2E hardening, we must ensure that the destruction of legacy `archive_*` tables (Gate 7) will not impact unseen external consumers (e.g., BI tools, cron jobs) and that recovery mechanisms are fully established.

**Status:** AUDIT COMPLETE. No external dependencies discovered. Backup/recovery relies on platform-managed capabilities which require manual verification immediately prior to Gate 7 execution.

## 2. External Dependency Surface

### 2.1 Database Catalog Forensics
To guarantee no internal database objects depend on the legacy tables, a full catalog query was executed against `pg_depend`, `pg_views`, and `pg_proc`.

- **Views:** 0 views reference any `archive_*` table.
- **Functions/Triggers:** 0 functions reference any `archive_*` table.
- **Foreign Keys/Dependencies:** `pg_depend` confirmed the only dependencies tied to `archive_*` tables are their own intrinsic `CHECK` constraints and Row Level Security (RLS) policies.

### 2.2 Repository Integration Audit
A comprehensive search of the repository structure was conducted to locate any potential off-platform consumers:
- **CI/CD (`.github/workflows`):** No GitHub Actions workflows exist that orchestrate ETL, cron-based exports, or data warehousing syncs.
- **Scripts (`scripts/`):** All repository scripts are test harnesses or development utilities. No data synchronization scripts exist.
- **Documentation (`docs/`):** No historical documentation mentions external BI tools (e.g., Metabase, Looker) or third-party replication services connected to the production database.

**Conclusion:** The legacy tables are entirely orphaned from both the internal application architecture and external organizational workflows.

## 3. Backup & Recovery Readiness

### 3.1 Orchestration State
The repository lacks custom `pg_dump` orchestration scripts or backup cron jobs. The project relies entirely on the underlying database provider (Supabase) for disaster recovery.

### 3.2 Platform-Managed Recovery (Supabase)
Supabase provides automated backups and Point-In-Time Recovery (PITR) depending on the project's tier (typically a 7-day to 30-day rolling window). 

### 3.3 Gate 7 Recovery Protocol Requirements
Because Gate 7 involves destructive `DROP TABLE` operations, relying solely on rolling PITR introduces a time-bound risk (if the data is needed after the PITR window expires).

**Mandatory Pre-Gate-7 Action:**
Immediately prior to unlocking Gate 7, the engineering team MUST execute one of the following:
1. **Manual Logical Backup:** Execute a manual `pg_dump` targeting the `archive_*` tables and store the artifact in cold storage (e.g., Cloudflare R2 / AWS S3).
2. **Platform Snapshot:** Trigger a manual, permanent backup snapshot in the Supabase Cloud console.

## 4. Final Verdict
The External Dependency surface is clear. The `archive_*` tables are verified orphans. 
Backup and recovery readiness is **CONDITIONALLY APPROVED**, pending the manual execution of a permanent pre-destruction backup immediately prior to Gate 7 execution.
