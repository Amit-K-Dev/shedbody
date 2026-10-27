# CF-9 Python Analytics Architecture

## 1. Domain Boundaries

In the ShedBody architecture, responsibilities are strictly separated by language and domain:

- **D1 (Cloudflare)**: Transactional source of truth for all application data.
- **Python**: Primary intelligence and analytics engine. Responsible for deterministic calculations, statistical aggregations, rolling averages, trends, and derived health metrics.
- **Next.js (JavaScript)**: Presentation layer, user interface, authentication boundary, simple transactional CRUD operations, and lightweight chart rendering.

## 2. Request Flow

The analytics flow strictly enforces user isolation and security at the Edge before reaching Python.

```text
User (Browser)
      ↓
Next.js UI (Chart Component)
      ↓
Next.js Authenticated API Route (Edge)
      ↓ (Extracts user_id, verifies session)
Internal Python API Request (HTTP, Internal Network)
      ↓ (Provides verified user_id + internal secret)
Python Analytics Service
      ↓ (Requests raw data)
Internal Next.js/CF Worker Data API
      ↓ (Executes D1 Query)
D1 Database
      ↓ (Returns raw data)
Python Analytics Service
      ↓ (Applies deterministic analytics logic)
Compact JSON Result
      ↓
Next.js API
      ↓
Next.js UI (Renders Chart)
```

## 3. Data Access Architecture

**Chosen Approach:** `Python → authenticated Cloudflare Worker/API → D1`

**Reasoning:** 
Currently, the JavaScript `D1Adapter` securely manages D1 database interactions. Python does not and should not have direct, unrestricted network access or raw credentials to the D1 database. 
Instead, Python acts as a privileged internal microservice. When Python needs data to perform an analysis, it requests that data from an internal Next.js/CF Worker endpoint (e.g., `/api/internal/metrics`). 

**Security Boundary:**
1. Next.js validates the external user session.
2. Next.js calls Python, supplying the securely extracted `user_id` and a `Bearer` internal service token.
3. Python validates the internal service token.
4. Python requests data from the Next.js internal data API, passing back the `user_id` and the internal service token.
5. The Next.js internal data API validates the token and queries D1 explicitly for that `user_id` only, guaranteeing tenant isolation.

## 4. Current State (Domain 9 Analytics Foundation)

- Domain 10 (AI/Insights) is **NOT STARTED**.
- The current focus is purely on **Deterministic Analytics** (e.g., trends, moving averages, standard derivations based on existing schema fields like `weight`).
- Python will process lists of raw metric objects and return processed, chart-ready datasets.
