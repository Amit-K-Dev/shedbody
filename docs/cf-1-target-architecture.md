# CF-1 — Target Architecture

**Status:** ARCHITECTURE DESIGN (FROZEN)
**Objective:** Define the explicit target system architecture, boundaries, and responsibilities for the Cloudflare/Python migration before any infrastructure is created or code is modified.

---

## A. Target System Architecture
**[DESIGN DECISION]**
The system is a Personal Health Intelligence Platform divided into three decoupled layers:
1. **Frontend/UI Layer:** Next.js (JavaScript) for UI, routing, and product experience.
2. **Infrastructure/Data Layer:** Cloudflare Workers (orchestration/API gateway), Cloudflare D1 (relational data), and Cloudflare R2 (object storage).
3. **Intelligence/Backend Layer:** A first-class Python backend handling analytics, AI, and heavy background computation.

## B. Frontend Responsibilities
**[DESIGN DECISION]**
- Rendering the user interface (UI) and user experience (UX).
- Client-side interactions, forms, validation, and dashboards.
- Rendering React components and orchestrating client state.
- Calling the Cloudflare Edge API and Python backend (via API boundaries) for data.

## C. Next.js/JavaScript Responsibilities
**[DESIGN DECISION]**
- Server-side rendering (SSR) of initial application state where beneficial.
- Routing and product-level application logic.
- UI components and interactions.
- (JavaScript remains the strict language standard; TypeScript is **[NOT NEEDED]**).

## D. Cloudflare Workers Responsibilities
**[DESIGN DECISION]**
- Edge API gateway and orchestration.
- High-performance, low-latency CRUD operations accessing Cloudflare D1.
- Authorization boundary (validating tokens/sessions before accessing data).
- Interaction with Cloudflare R2 for media delivery and upload signing.

## E. Python Backend Responsibilities
**[DESIGN DECISION]**
- **[REQUIRED]** First-class intelligence service (not forced into Workers).
- Advanced analytics (daily/weekly/monthly trends, weight, workout frequency).
- Data processing, ETL, and batch computations.
- Deterministic Insight Engine (statistical analysis, rule-based logic).
- AI/ML features (AI Coach, adaptive recommendations).
- Long-running or memory-intensive background tasks.

## F. D1 Responsibilities
**[DESIGN DECISION]**
- **[REQUIRED]** Target authoritative relational database (replacing Supabase PostgreSQL).
- Stores all core domain models (users, goals, tracking, habits, nutrition, etc.).
- Strictly decoupled from business logic; accessed exclusively via a controlled Data Access / Repository Layer.

## G. R2 Responsibilities
**[DESIGN DECISION]**
- **[REQUIRED]** Target object/media storage (replacing Supabase Storage).
- Stores user uploads, profile pictures, generated assets, and static files.

## H. Authentication Strategy Options and Recommendation
**[PROVEN from repository evidence]** Current system is deeply coupled to Supabase Auth.
- **Option 1: Better Auth** - **[RECOMMENDED]** Cloudflare Worker-compatible, supports custom databases (D1), flexible session management. (Traces of `.env.better-auth.example` exist).
- **Option 2: Lucia Auth** - **[OPTIONAL]** Edge-compatible but requires more manual session wiring.
- **Option 3: Cloudflare Access** - **[NOT NEEDED]** Designed for internal Zero Trust, not consumer apps.
- **[UNKNOWN]** Final Auth provider decision is pending a proof-of-concept to ensure token/session persistence works seamlessly with D1.

## I. Email/Notification Strategy Options
**[PROVEN from repository evidence]** Currently using `nodemailer`, which relies on Node.js TCP sockets and is incompatible with Cloudflare Workers.
- **Option 1: Resend** - **[RECOMMENDED]** Edge-compatible HTTP API, modern SDK.
- **Option 2: SendGrid** - **[OPTIONAL]** Edge-compatible via HTTP API.
- **Option 3: Cloudflare Email Routing** - **[NOT NEEDED]** Lacks rich transactional API features.
- **[ASSUMPTION]** We will transition to an HTTP-based transactional email provider.

## J. Background Jobs/Queues Strategy
**[DESIGN DECISION]**
- Cloudflare Cron Triggers / Queues - **[RECOMMENDED]** for lightweight event triggering and message brokering.
- Python Backend Services - **[REQUIRED]** for executing heavy background jobs (e.g., daily rollups, AI batch jobs, plan adaptations).
- **[ASSUMPTION]** Heavy data processing will NOT be run on Cloudflare Workers due to CPU time limits.

## K. Analytics Architecture
**[DESIGN DECISION]**
- Cloudflare Workers capture raw events efficiently at the edge.
- Events are dispatched via Cloudflare Queues (or similar brokering) to the Python Backend.
- Python Backend ingests, validates, and calculates trends, storing aggregated metrics in D1 or a dedicated analytical store.

## L. AI/Insights Architecture
**[DESIGN DECISION]**
- Python backend acts as the sole Insight Engine.
- Pipeline: Raw Data -> Validated Metrics -> Statistical Rules -> AI Context Builder -> LLM API -> Structured Response.
- **[REQUIRED]** AI models must never be given direct, unfiltered access to the raw D1 database.

## M. API Boundary Between Next.js, Workers and Python
**[DESIGN DECISION]**
- **Next.js (Frontend):** Makes HTTP requests to Cloudflare Workers (Edge API).
- **Cloudflare Workers (Edge):** Validates authentication, executes D1 CRUD, and acts as a gateway.
- **Cloudflare Workers -> Python:** Workers make internal HTTP/RPC requests to the Python Backend for complex intelligence/analytics.
- **Python -> D1:** Python accesses data either via authenticated Edge APIs or a direct D1 HTTP driver.

## N. Data Ownership Boundaries
**[DESIGN DECISION]**
- **Cloudflare D1:** Owns the primary, transactional source of truth (CRUD, users, relationships).
- **Python Backend:** Owns derived state, analytics aggregates, and AI context/embeddings.

## O. Supabase Transitional Role
**[DESIGN DECISION]**
- **[REQUIRED]** Supabase remains the **read/write production source-of-truth** until final cutover.
- **[REQUIRED]** Do not destructively modify Supabase schemas or data during migration phases.
- Used strictly for read-only validation, data export, and behavioral parity checks.

## P. Final Cutover Architecture
**[DESIGN DECISION]**
- Supabase is completely retired and decommissioned.
- Vercel Next.js handles UI/Frontend.
- Cloudflare (Workers, D1, R2) handles infrastructure and data access.
- Python Backend handles intelligence and analytics.

## Q. Service-by-Service Mapping
**[PROVEN from repository evidence]**
- Database (Supabase PostgreSQL) -> Cloudflare D1 **[REQUIRED]**
- Authentication (Supabase Auth) -> Edge-compatible Auth (e.g., Better Auth) **[REQUIRED]**
- Object Storage (Supabase Storage) -> Cloudflare R2 **[REQUIRED]**
- Edge API (Next.js API Routes/Node.js) -> Cloudflare Workers / Next.js Edge **[RECOMMENDED]**
- Analytics/Cron (Node.js) -> Python Backend **[REQUIRED]**
- AI Logic (Node.js) -> Python Backend **[REQUIRED]**
- Legacy `pg` / `nodemailer` Node libraries -> HTTP/Edge Equivalents **[REQUIRED]**

## R. Security Model Replacing Supabase RLS
**[PROVEN from repository evidence]** Current app heavily uses Row Level Security (RLS) in Postgres.
**[DESIGN DECISION]**
- D1 does not support RLS.
- Security MUST be shifted to the **Application Layer**.
- The Data Access/Repository Layer will enforce tenant isolation (e.g., all queries strictly mandate a `user_id` context parameter).
- Edge APIs will validate the session token before passing the `user_id` to the repository.

## S. Migration Dependencies
**[DESIGN DECISION]**
- Authentication target MUST be proven before D1 schemas are finalized (user ID formats dictate foreign keys).
- R2 implementation MUST be proven before migrating user avatars and media.
- Cloudflare local development environment (Wrangler/Miniflare) MUST be stable before porting repositories.

## T. Risks and Rollback Boundaries
**[BLOCKER]** Potential D1 limits around complex queries, absence of stored procedures (RPCs), and SQLite nuances must be mitigated via application logic.
**[UNKNOWN]** The final hosting environment for the Python backend (e.g., Cloud Run, Render, VPS) is undefined but conceptually isolated.
**[DESIGN DECISION]** Rollback strategy: Because Supabase and Vercel remain untouched during the build phase (CF-1 to CF-11), a rollback is simply a matter of maintaining the existing Vercel deployment and DNS records. Cutover only happens via a deliberate DNS and traffic switch.

---

# Final Summary for Approval

1. **Target Architecture:** Next.js (UI) + Cloudflare Workers/D1/R2 (Infrastructure) + Python (Intelligence/Analytics).
2. **Service Matrix:** Supabase DB -> D1, Supabase Storage -> R2, Supabase Auth -> Better Auth (or similar edge auth). Node.js Cron/AI -> Python Backend.
3. **Python/JS Responsibility Boundary:** JS handles UI, forms, and basic Edge API CRUD. Python handles data processing, analytics rollups, AI context building, and scheduled heavy computation.
4. **Database/Data Ownership Model:** D1 owns transactional records. Python owns derived analytics/insights. D1 is accessed via an application-level Repository pattern enforcing security, replacing Supabase RLS.
5. **Authentication Decision:** Migrate to an Edge-compatible provider (e.g., Better Auth), pending a successful proof-of-concept.
6. **Background-Job Architecture:** Cloudflare Cron/Queues trigger events; Python services execute the heavy lifting.
7. **Migration Sequence:** CF-1 (Foundation) -> CF-2/CF-3 (D1 Schema & Repositories) -> CF-4 (Auth Decision) -> CF-7 (Incremental Domain Porting) -> CF-11 (Data Sync) -> CF-12 (Cutover).
8. **Blockers:** None currently block CF-1 foundation work, but D1 constraints (no RPCs/RLS) dictate that the Data Access Layer MUST be built carefully.
9. **Unknowns:** Final Auth provider selection, HTTP Email provider selection, and Python hosting platform.
10. **EXPLICIT APPROVAL POINT REQUIRED:** Do you approve this Target Architecture? If yes, we may proceed to CF-1 (Cloudflare Foundation) to initialize the Cloudflare staging infrastructure.
