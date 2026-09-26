# Phase 4.5: AI Readiness & Context Architecture Audit

## 1. Executive Summary

This document performs an architectural audit of the ShedBody codebase to evaluate its readiness for the future AI Context Engine and AI Coach. 

With Phase 4.4 closed and deployed to production (`de9509a`), the deterministic insight engine has been hardened with explicit `currentDate` temporal anchoring, strict Gregorian date validation, and robust numeric boundaries. In accordance with the **ShedBody Product & Engineering Master Plan (Sections 26–30)**, AI must **never** receive raw database dumps or unbounded history. Instead, an intermediary **Context Builder** must select, validate, and package only the minimal relevant data required to answer a user's question, grounded strictly by deterministic facts and guarded by rigorous safety filters.

This audit reviews existing AI artifacts, maps the end-to-end data pipeline, establishes data provenance categories, defines security/privacy boundaries, and delivers the blueprint for the Phase 5 Context Engine.

---

## 2. Current AI Inventory

An exhaustive inspection of the codebase for AI-related code, packages, configurations, and components was conducted:

| Location / Artifact | Type / Nature | Current Status | Master Plan Classification | Findings & Details |
|---|---|---|---|---|
| `lib/ai/generateInsights.jsx` | File | Dead / Unused | **REPLACE / DELETE LATER** | Static heuristic rules returning raw strings (`["🔥 You lost 0.5 kg...", ...]`). Accepts `{ weightData, goal, bmiLogs }`. Completely decoupled from `unifiedTimeline`. Zero imports across the repository. Zero LLM calls. |
| `package.json` | Dependencies | Clean | **KEEP AS-IS** | Zero AI client libraries installed (no `openai`, `@google/genai`, `ai`, `@langchain`, `anthropic`, `groq-sdk`). |
| `.env.local` | Configuration | Clean | **KEEP AS-IS** | Zero AI provider keys or endpoints present. |
| `app/api/*` | API Routes | Clean | **N/A** | No AI endpoints exist (`app/api/` contains only `admin`, `article-feedback`, `contact`, `lifestyle`, `nutrition`, `posts`, `progress`, `view`). |
| `app/(dashboard)/dashboard/page.js` | UI Comment | Active UI | **REFACTOR** | Line 232 contains `{/* AI COACH INSIGHTS */}` wrapping `<PremiumInsights insights={insights} />`. Currently renders deterministic insights from `lib/insights/engine.js`. |
| `components/dashboard/PremiumInsights.jsx` | UI Component | Active UI | **KEEP** | Renders structured deterministic insights natively (`observation`, `evidence`, `interpretation`, `recommendation`, `confidence`). |

### Key Inventory Findings:
1. **Zero LLM Providers Configured:** No active LLM provider SDK, API key, prompt template, or inference call exists in the repository.
2. **Single Legacy Heuristic File:** `lib/ai/generateInsights.jsx` is an obsolete pre-Phase-4 string generator that is completely unused.
3. **No Multiple/Competing AI Implementations:** The platform currently relies exclusively on the deterministic rule engine in `lib/insights/`.

---

## 3. Current Data → Analytics → Insights Pipeline

The complete end-to-end data flow currently operating on the dashboard is mapped below:

```text
               ┌────────────────────────────────────────────────────────┐
               │              Database (Supabase / Postgres)            │
               │  user_profiles  progress_entries  goals  plans         │
               │  nutrition_logs  lifestyle_logs                        │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼ (Server Loaders)
               ┌────────────────────────────────────────────────────────┐
               │  getProfileData()       -> profile                     │
               │  getBoundedProgress()   -> progress_entries (30-day)   │
               │  getActiveGoal()        -> activeWeightGoal            │
               │  getPlans()             -> plans (current & previous)  │
               │  getNutritionData()     -> nutrition_logs (30-day)     │
               │  getLifestyleData()     -> lifestyle_logs (30-day)     │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │  mergeDailyMetrics() [lib/analytics/unified.js]        │
               │  - Outer joins by date (YYYY-MM-DD)                    │
               │  - Standardizes null / safeNumber / safeBoolean        │
               │  - Produces unifiedTimeline:                           │
               │    [ { date, body, nutrition, lifestyle }, ... ]       │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │  Analytics Engine [lib/analytics/engine.js]            │
               │  - calculateTrend (current, previous, change, rate)    │
               │  - calculateBMI, getBmiCategory                        │
               │  - calculateGoalProgress [lib/goals.js]                │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │  Deterministic Insight Engine [lib/insights/engine.js] │
               │  - Accepts (timeline, profile, plan, goal, currentDate)│
               │  - Evaluates rules in lib/insights/rules.js            │
               │  - Filters out-of-window & invalid-date entries        │
               │  - Emits sorted StructuredInsight[]                    │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │  Dashboard Presentation [dashboard/page.js]            │
               │  - StatCards                                           │
               │  - PremiumChart / PremiumBMI                           │
               │  - PremiumAnalyticsCharts                              │
               │  - PremiumInsights (Deterministic Engine display)      │
               │  - Active Protocol Card                                │
               └────────────────────────────────────────────────────────┘
```

### Information Available at Each Layer:

1. **Database Layer:**
   - `user_profiles`: `weight`, `target_weight`, `height`, `xp`, `gamification_level`, `streak_count`, `user_id`.
   - `progress_entries`: `id`, `user_id`, `weight`, `body_fat`, `notes`, `entry_date`, `created_at`.
   - `goals`: `id`, `user_id`, `domain` ('weight'), `target_value`, `start_value`, `start_date`, `target_date`, `status` ('active'/'completed'/'abandoned').
   - `plans`: `id`, `user_id`, `goal`, `level`, `diet_type`, `calories`, `protein`, `workout` (JSONB protocol), `meals` (JSONB schedule), `is_active`.
   - `nutrition_logs`: `id`, `user_id`, `log_date`, `calories`, `protein`, `water_ml`.
   - `lifestyle_logs`: `id`, `user_id`, `log_date`, `workout_completed`, `steps_count`, `sleep_hours`.

2. **Unified Timeline Layer (`mergeDailyMetrics`):**
   - Chronologically ascending array of uniform day objects.
   - Exact schema:
     ```javascript
     {
       date: "YYYY-MM-DD",
       body: { weight: number | null, bodyFat: number | null },
       nutrition: { calories: number | null, protein: number | null, water: number | null },
       lifestyle: { workoutCompleted: boolean | null, steps: number | null, sleepHours: number | null }
     }
     ```
   - Deduplicated per date, strictly typed with `null` semantics.

3. **Analytics Engine Layer:**
   - Standardized delta, direction (`"up" | "down" | "flat"`), percentage change, daily rate of change, and valid chronological points.
   - Canonical BMI and BMI classification category.
   - Clamped goal completion percentage (0–100%).

4. **Deterministic Insight Layer:**
   - Array of `StructuredInsight` objects:
     ```javascript
     {
       id: string,               // e.g., "WEIGHT_TREND_CHANGE"
       category: string,         // "body" | "nutrition" | "lifestyle"
       priority: number,         // 5, 10, 20, 30, 35
       observation: string,      // Factual occurrence statement
       evidence: string,         // Exact mathematical baseline vs current numbers
       interpretation: string,   // Clinical/practical meaning
       recommendation: string,   // Actionable instruction
       confidence: string,       // "high" | "medium"
       timestamp: string,        // YYYY-MM-DD of latest valid datum
       type: string              // "info" | "positive" | "warning"
     }
     ```

---

## 4. Current Deterministic Insight Contract

As verified in Phase 4.4, the deterministic insight engine exposes:
```javascript
generateStructuredInsights(unifiedTimeline, profile, activePlan, activeWeightGoal, currentDate)
```

### Active Rules Summary:
1. **`GOAL_PROGRESS` (Priority 5, Category: `body`):** Evaluates overall progress against `activeWeightGoal` using all valid historical weights. Anchored to latest observation date.
2. **`WEIGHT_TREND_CHANGE` (Priority 10, Category: `body`):** Evaluates 7-day current average (`currentDate - 6` to `currentDate`) vs 7-day previous average (`currentDate - 13` to `currentDate - 7`). Requires minimum 2 current and 1 previous entries. Triggers if delta ≥ 0.5 kg.
3. **`WORKOUT_CONSISTENCY` (Priority 20, Category: `lifestyle`):** Compares workout counts in current 7 days vs previous 7 days. Emits `WORKOUT_CONSISTENCY_DROP` (warning) or `WORKOUT_CONSISTENCY_IMPROVED` (positive).
4. **`NUTRITION_CALORIC_ADHERENCE` (Priority 30, Category: `nutrition`):** Compares current 7-day calorie average against `activePlan.calories`. Triggers positive adherence if deviation ≤ 10% with ≥ 3 logged days.
5. **`PROTEIN_CONSISTENCY` (Priority 35, Category: `nutrition`):** Compares current 7-day protein average against `activePlan.protein`. Triggers positive adherence if deviation ≤ 10% with ≥ 3 logged days.

---

## 5. AI Readiness Assessment

| Evaluation Dimension | Readiness Status | Analysis & Justification |
|---|---|---|
| **Deterministic Data Quality** | **READY** | Raw user logs are cleanly normalized, bounded, and typed into `unifiedTimeline`. |
| **Deterministic Analytics Foundation** | **READY** | Rates of change, BMI categories, and percentage trends are mathematically validated. |
| **Insight Grounding (Facts vs Hallucination)** | **READY** | The deterministic rules output clear, English observations and mathematical evidence ready to be fed as ground truth to an LLM. |
| **Temporal Consistency** | **READY** | Phase 4.4 parameterization via `currentDate` ensures the AI is never frozen in time when a user skips logging. |
| **Context Selection Engine** | **NOT READY (GAP)** | Currently no logic exists to filter data based on user question intent. |
| **Conversational Memory / Repetition State** | **NOT READY (GAP)** | Insights repeat on every evaluation because no acknowledgment or discussion persistence exists. |
| **Safety / Medical Guardrails** | **NOT READY (GAP)** | No structured post-processing exists to catch medical claims or dangerous dietary advice. |
| **Server-Only LLM Gateway** | **NOT READY (GAP)** | No server-side orchestration exists to call an LLM with bounded context. |

---

## 6. Future AI Context Boundary

The future AI must receive **only** curated, bounded health facts. Under no circumstances should raw database records or unvalidated payloads enter the prompt.

### Domain Boundary Analysis:

| Domain | Canonical Source | Derived or Observed | Window / Scope | Null Semantics | AI Suitability & Safety |
|---|---|---|---|---|---|
| **User Profile** | `user_profiles` | Canonical | Current State | Missing fields = `null` | Safe: Height, age, sex, activity level. Unsafe: `user_id`, email, auth metadata. |
| **Body (Weight)** | `progress_entries` | Observed | 14 to 30 days max | Unlogged days = `null` | Highly Safe: Trend, current weight, delta. Unsafe: Free-form `notes` (could contain private PII). |
| **Body (BMI)** | `calculateBMI` | Derived | Current & Trend | Requires height + weight | Safe: Numeric BMI and category (`Normal`, `Overweight`, etc.). |
| **Goals** | `goals` table | User Target | Active goal | `null` if no active goal | Safe: `domain`, `start_value`, `target_value`, `target_date`. |
| **Goal Progress** | `calculateGoalProgress` | Derived | Lifetime | 0% if invalid | Safe: Progress percentage (clamped 0–100%). |
| **Nutrition (Calories/Protein/Water)** | `nutrition_logs` | Observed | 7 to 14 days max | Unlogged days = `null` | Safe: Daily values, averages. Never send raw DB timestamps. |
| **Lifestyle (Workouts/Steps/Sleep)** | `lifestyle_logs` | Observed | 7 to 14 days max | Unlogged days = `null` | Safe: Completion booleans, step totals, sleep hours. |
| **Active Plan Targets** | `plans` table | Target Protocol | Active plan | `null` if no active plan | Safe: Target calories, target protein, diet type, protocol title. Unsafe: Raw internal JSON structure. |
| **Deterministic Insights** | `lib/insights/engine.js` | Deterministic Facts | Current evaluation | Empty array if none | Highly Safe: Pre-calculated facts and evidence serve as direct anchoring constraints for the LLM. |

---

## 7. Question-Driven Context Selection Matrix

To enforce the master plan's principle ("Do not dump the entire database into prompts"), the Context Builder must filter data domains based on the user's explicit question:

| User Question / Intent Category | Required Data Domains | Context Lookback Window | Included Insights | Excluded Data Domains |
|---|---|---|---|---|
| **Weight Trend Inquiry**<br>*(e.g., "Why did my weight go up this week?")* | Body, Nutrition, Lifestyle, Active Goal | Weight: 14 days<br>Nutrition: 7 days<br>Lifestyle: 7 days | `WEIGHT_TREND_CHANGE`, `NUTRITION_CALORIC_ADHERENCE`, `WORKOUT_CONSISTENCY` | Historical plans, full 365-day history, detailed meal recipes. |
| **Goal Progress Inquiry**<br>*(e.g., "Am I on track to hit my target weight?")* | Goals, Body (Current & Start), Goal Progress | Weight: Start date + last 14 days | `GOAL_PROGRESS_INFO`, `WEIGHT_TREND_CHANGE` | Daily water logs, detailed sleep breakdown, workout exercise sets. |
| **Nutrition Consistency Inquiry**<br>*(e.g., "How has my diet adherence been?")* | Nutrition, Active Plan Targets | Nutrition: 7 days<br>Plan: Current targets | `NUTRITION_CALORIC_ADHERENCE_POSITIVE`, `PROTEIN_CONSISTENCY_POSITIVE` | Step counts, sleep logs, body fat logs. |
| **Workout / Lifestyle Inquiry**<br>*(e.g., "Did I work out enough this week?")* | Lifestyle, Active Plan Protocol | Lifestyle: 7 days<br>Plan: Workout schedule | `WORKOUT_CONSISTENCY_DROP`, `WORKOUT_CONSISTENCY_IMPROVED` | Calorie counts, macro breakdowns, BMI history. |
| **General Weekly Coaching Review**<br>*(e.g., "Give me a summary of how I did this week.")* | Body, Nutrition, Lifestyle, Goals, Plan | All domains: 7 days | All active deterministic insights | Data older than 7 days, inactive plans. |

---

## 8. Proposed Context Builder Contract

The future Context Builder will produce a clean, normalized JavaScript object strictly adhering to this schema:

```javascript
/**
 * @typedef {Object} AiContextPayload
 * @property {string} generatedAt - ISO 8601 UTC timestamp of context generation
 * @property {string} currentDate - YYYY-MM-DD anchor date
 * @property {string} intent - Detected question intent category
 * @property {Object} profile - Minimal user health attributes (no PII)
 * @property {number|null} profile.heightCm
 * @property {number|null} profile.currentWeightKg
 * @property {number|null} profile.bmi
 * @property {string|null} profile.bmiCategory
 * @property {Object|null} goal - Active goal details
 * @property {string} goal.domain - e.g., "weight"
 * @property {number} goal.startValue
 * @property {number} goal.targetValue
 * @property {number} goal.progressPercent
 * @property {Object|null} planTargets - Active protocol targets
 * @property {number|null} planTargets.calories
 * @property {number|null} planTargets.proteinGrams
 * @property {string|null} planTargets.dietType
 * @property {string|null} planTargets.workoutProtocolName
 * @property {Array<Object>} timeline - Bounded daily observations
 * @property {string} timeline[].date - YYYY-MM-DD
 * @property {number|null} timeline[].weightKg
 * @property {number|null} timeline[].calories
 * @property {number|null} timeline[].proteinGrams
 * @property {number|null} timeline[].waterMl
 * @property {boolean|null} timeline[].workoutCompleted
 * @property {number|null} timeline[].steps
 * @property {number|null} timeline[].sleepHours
 * @property {Array<Object>} deterministicInsights - Verified factual insights
 * @property {string} deterministicInsights[].id
 * @property {string} deterministicInsights[].category
 * @property {string} deterministicInsights[].observation
 * @property {string} deterministicInsights[].evidence
 * @property {string} deterministicInsights[].interpretation
 * @property {string} deterministicInsights[].recommendation
 * @property {string} deterministicInsights[].confidence
 */
```

### Strict Omissions:
- **No `user_id` or `auth.users` references.**
- **No email addresses, usernames, real names, or profile avatars.**
- **No database row IDs (`progress_entries.id`, `goals.id`, etc.).**
- **No free-text user notes** (which may contain sensitive personal reflections or medical details).
- **No database error messages or internal schema metadata.**

---

## 9. Data Provenance Model

The AI prompt template must explicitly instruct the LLM on data provenance so it never confuses targets with actual measurements:

```text
[OBSERVED]
Factual data logged directly by the user on a specific date.
Example: "2026-09-18: Weight 74.2 kg, Calories 2,150 kcal"

[DERIVED]
Mathematical aggregations computed deterministically over a bounded window.
Must explicitly include metric, value, unit, and calculation (method/window).
Example: `{ metric: "weightChange", value: -0.15, unit: "kg/day", calculation: { method: "linearRegression", window: "7d" } }`

[DETERMINISTIC INSIGHT]
Verified algorithmic conclusion generated by rule engine.
Example: "Observation: Caloric adherence within 10% of target. Evidence: 7-day average 2,150 kcal vs 2,200 kcal target."

[TARGET]
The target value prescribed by the active protocol.
Example: "Plan Caloric Target: 2,200 kcal/day"

[USER GOAL]
The user's declared objective.
Example: "Goal Target: 70.0 kg (Starting from 78.0 kg)"
```

**Rule for LLM Reasoning:**
- The LLM may cite an `[OBSERVED]` datum as evidence.
- The LLM must compare `[OBSERVED]` or `[DERIVED]` against `[TARGET]` or `[USER GOAL]`.
- The LLM must **never** treat a `[TARGET]` as an `[OBSERVED]` reality (e.g., cannot say "Since you ate 2,200 calories..." unless `[OBSERVED]` confirms it).

---

## 10. AI Safety & Health Boundaries

ShedBody is a fitness, wellness, and preventive lifestyle platform. The AI Coach must operate under strict non-negotiable boundaries:

### Prohibited AI Behaviors:
1. **No Medical Diagnosis:** Never state or imply that the user has a disease, endocrine disorder, metabolic condition, or clinical illness.
2. **No Prescription or Medication Guidance:** Never recommend, adjust, or comment on pharmaceutical drugs, peptide therapies, or prescription doses.
3. **No Dangerous Caloric Restriction:** Never recommend unsafe deficits. Note: The Context Builder itself does not enforce hardcoded safety thresholds (e.g., 1200/1500 kcal or deficit limits); these belong to the future safety layer.
4. **No Eating Disorder Reinforcement:** Never encourage compensatory behavior (purging, fasting after overeating, excessive exercise to burn off meals).
5. **No Unsafe Training Advice:** Never advise exercising through sharp joint pain, severe exhaustion, or acute injuries.
6. **Association is Not Causation:** The AI must never convert correlations into causal claims (e.g., "your weight increased because you ate more" is disallowed unless a future validated causal model exists).
7. **No Future Target-Date Predictions:** The current system does not support predicting when a user will hit a specific target (e.g., "you will hit X kg in Y weeks").

### Post-Generation Safety Validation:
Explicitly reject regex-based safety validation for AI output. The system must rely on future structured schema, evidence, and policy validation layers rather than brittle string matching.

---

## 11. AI Response Contract

In accordance with Master Plan Section 29, the AI Coach must return a structured JSON response to guarantee reliable UI rendering:

```javascript
/**
 * @typedef {Object} AiCoachResponse
 * @property {"coaching_insight"|"answer"|"recommendation"} type
 * @property {string} title - Concise headline (max 80 chars)
 * @property {string} summary - 2-3 sentence conversational explanation
 * @property {Array<string>} evidence - Bulleted points grounded in [OBSERVED] or [DETERMINISTIC INSIGHT]
 * @property {Array<string>} recommendations - 1 to 3 actionable next steps
 * @property {"high"|"medium"|"low"} confidence - Confidence assessment
 * @property {string|null} safetyNote - Medical disclaimer or boundary note if applicable
 */
```

### Deterministic vs Generated Separation:
- **Title, Summary, Recommendations:** Generated by LLM based on context.
- **Evidence:** Must be verbatim or paraphrased citations of `OBSERVED` or `DETERMINISTIC INSIGHT` evidence.
- **Safety Note:** Injected or validated deterministically by the server post-processor.

---

## 12. Repetition & Memory Strategy

### Problem Identified in Phase 4:
Deterministic insights are stateless and evaluated on every page load. While this is appropriate for passive dashboard stat cards, an interactive AI Coach that repeats identical advice daily feels robotic and unhelpful.

### Recommended Architectural Solution:
1. **Conversation History vs Insight Acknowledgments:**
   - **Conversation State (`ai_conversations` table):** Stores user prompt, context snapshot ID, and structured response. Used for multi-turn chat memory.
   - **Insight Acknowledgment State (`insight_acknowledgments` table):** Stores `(user_id, insight_id, acknowledged_at, suppressed_until)`.
2. **Recommendation:**
   - Do **NOT** store acknowledgment state inside the chat table or inside the deterministic engine.
   - The deterministic engine must remain **pure and stateless**.
   - The Context Builder queries `insight_acknowledgments` and flags insights as `new: true` or `previously_discussed: true`. The LLM can then reference them naturally ("As we noted earlier this week...") without repeating them as breaking news.

---

## 13. Privacy & Security Boundary

1. **Zero Client-Side AI Calls:** The client browser must never call OpenAI/Gemini/OpenRouter directly. All AI interactions must occur via Next.js Server Actions or protected Route Handlers (`app/api/ai/coach/route.js`).
2. **Authentication Enforcement:** Auth context must be validated via `supabase.auth.getUser()`. Anonymous or unauthenticated requests are strictly rejected.
3. **No Service-Role Escalation:** The Context Builder must read user data using the authenticated user's session client, honoring Supabase Row-Level Security (RLS).
4. **Secrets Isolation:** Provider API keys (`OPENROUTER_API_KEY`, `GEMINI_API_KEY`, etc.) must remain private server environment variables, never prefixed with `NEXT_PUBLIC_`.

---

## 14. Performance & Context Size Budgeting

| Window Size | Estimated Records | Raw JSON Payload Size | Estimated Token Consumption | Recommendation |
|---|---|---|---|---|
| **7 Days** | 7 unified timeline items + profile + goal + 2 insights | ~1.5 KB | ~350 – 500 tokens | **Optimal for Daily & Lifestyle Queries** |
| **14 Days** | 14 unified timeline items + profile + goal + 3 insights | ~2.8 KB | ~650 – 850 tokens | **Optimal for Weight Trends & Bi-weekly Reviews** |
| **30 Days** | 30 unified timeline items + profile + goal + 5 insights | ~5.5 KB | ~1,200 – 1,500 tokens | **Maximum Bounded Ceiling for Monthly Summaries** |
| **365 Days** | 365 entries | ~65 KB | ~15,000+ tokens | **PROHIBITED** (Exceeds budget, causes hallucinations) |

**Conclusion:** Strict 7-day to 14-day bounded windows keep token costs negligible (<$0.001 per turn) and guarantee rapid response times (<1.5s).

---

## 15. Legacy AI Cleanup Plan

| Artifact | Classification | Action Plan |
|---|---|---|
| `lib/ai/generateInsights.jsx` | **REPLACE / DELETE LATER** | Keep dormant during Phase 4.5. Remove in Phase 5 when the new `lib/ai/contextBuilder.js` is introduced. |
| Dashboard comment `{/* AI COACH INSIGHTS */}` | **REFACTOR** | Update in Phase 5 to reflect deterministic insights vs AI conversational widget. |

---

## 16. Audit Conclusion & Next Implementation Slice

### Final Result:
**ARCHITECTURALLY READY FOR CONTEXT ENGINE DESIGN.**
The deterministic layer is hardened, reliable, and mathematically sound. No architectural blockers prevent designing and implementing the pure JavaScript Context Builder.

### Recommended Next Implementation Slice (Phase 4.6):
**Deterministic Context Builder Implementation (No LLM Calls Yet):**
- Create `lib/ai/contextBuilder.js` (Pure JS, zero AI dependencies).
- Implement question-intent routing and domain selection.
- Implement provenance tagging (`OBSERVED`, `DERIVED`, `TARGET`, `INSIGHT`).
- Add comprehensive test suite in `scripts/test-ai-context.js`.
