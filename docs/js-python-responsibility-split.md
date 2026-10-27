# JavaScript / Python Responsibility Split

**Status:** ARCHITECTURE DESIGN (FROZEN)

## 1. Philosophy
JavaScript (Next.js/Edge) builds the product experience. Python builds the intelligence.
Heavy analytics, data processing, machine learning, and AI generation belong in Python. UI rendering, forms, and basic CRUD belong in JavaScript.

## 2. Next.js / JavaScript (Frontend & Edge)
- **UI / UX:** Rendering components (React/Next.js).
- **Client State:** Managing forms, interactions, and local state.
- **Edge API Gateway:** Handling incoming requests, validating Auth (Better Auth or similar), rate limiting.
- **Transactional CRUD:** Inserting/updating/deleting raw records in D1 (via the Repository Layer).
- **Chart Rendering:** Receiving pre-aggregated, compact JSON from Python and rendering charts (e.g., via Recharts) on the client to save bandwidth and compute.

## 3. Python (Intelligence & Analytics)
- **Heavy Calculations:** Aggregating large datasets over time (e.g., rolling averages, progress curves, fitness adaptations).
- **AI/Insights Context Builder:** Compiling user history, stats, and behavior into structured contexts for LLMs.
- **Recommendation Engine:** Rule-based or ML-based workout/nutrition plan generation or adaptation.
- **Background Jobs:** Daily rollups, periodic cleanup, syncing state, executing complex triggers that were formerly PostgreSQL triggers/RPCs.
- **Analytics API:** Exposing clean endpoints (e.g., `/api/v1/analytics/weight-trends`) that return compact JSON to the Next.js edge.

## 4. Target Data Flow Pattern for Analytics
To minimize Edge computation and UI bottlenecks, analytical data follows this exact pipeline:
1. **Cloudflare D1** (Source of Truth)
2. **Python Backend** (Queries D1, performs heavy math, aggregates data)
3. **Compact JSON Response** (Returns pre-calculated data structure)
4. **Next.js Edge / Client** (Receives JSON, renders Recharts UI instantly)

## 5. Decision Rules for New Features
- Does this feature involve LLM interaction or context building? -> **Python**
- Does this feature involve aggregating thousands of tracking rows? -> **Python**
- Does this feature involve statistical analysis or scientific calculations? -> **Python**
- Is this a scheduled background cron job? -> **Python** (triggered by Cloudflare Cron)
- Is this a UI component, form, or simple data fetch? -> **JavaScript**
- Is this a straightforward INSERT/UPDATE of a single entity? -> **JavaScript (Edge via Repository)**
