# Phase 4.8 AI Gateway Design

## 1. Architectural Boundary & Flow
The AI Gateway implements a strict, server-side pipeline. No raw provider responses or untrusted client contexts are permitted.

**Final Conceptual Flow:**
`Browser`
  → `authenticated POST /api/ai/coach`
  → `server authentication`
  → `server data fetch`
  → `Context Builder`
  → `Context Validator`
  → `AI Gateway`
  → `Provider Adapter`
  → `LLM`
  → `Structured Parser`
  → `Response Schema Validator`
  → `Grounding Validator`
  → `Safety Validator`
  → `Application Response`

*Invalid at any validation boundary:*
→ reject/fallback
→ never expose raw provider output

## 2. API Boundary (Next.js Endpoint)
- **Endpoint:** `POST /api/ai/coach`
- **Authentication:** Must use `supabase.auth.getUser()`. Returns `401` if unauthorized.
- **Request Shape:**
  ```json
  {
    "question": "Should I eat more protein today?",
    "intent": "NUTRITION_ADHERENCE"
  }
  ```
- **Validation:** 
  - Server-side maximum length is required (exact limit is an implementation decision).
  - Empty or whitespace-only questions must be rejected.
  - Browser cannot override the server limit.

## 3. Provider Abstraction & Configuration
- **Configuration:** Exactly one configured provider/model for the initial implementation. Provider and model choices MUST remain server-controlled (via environment variables). 
- **Restrictions:** The browser cannot select the provider, the model, or provide credentials.
- **Provider Fallback:** Explicitly future work.
- **Responsibilities:** Map internal context to the provider's specific prompt format, execute requests, and standardize errors.

## 4. Internal Request & Response Contracts
**Internal AI Request Contract:**
```javascript
{
  question: string,
  context: AiContextPayload, // Authenticated, server-derived, validator-approved context
  instructions: {
    systemSafety: string,
    taskInstruction: string
  }
}
```

**Structured AI Response Contract:**
Explicitly distinguish the Deterministic Insight type from the AI Coach Response type. The AI response type MUST NOT simply inherit the Phase 4 `("info" | "warning" | "positive")` enum. 
- The AI response type MUST be a closed enum. 
- *The exact final enum is marked as a Phase 4.9 contract decision that must be finalized before implementation.* It must not be left as an unrestricted string.

```javascript
{
  type: string, // CLOSED ENUM: Exact values to be finalized in Phase 4.9
  title: string,
  summary: string,
  evidence: EvidenceReference[], // Machine-verifiable structured references
  recommendations: string[],
  confidence: "high" | "medium", // Must explicitly document confidence contract
  safetyNote: string | null
}
```

## 5. Machine-Verifiable Grounding Contract
AI factual claims require evidence that can be deterministically matched against validator-approved context.
- **Structured Evidence Reference:** Must NOT expose UUIDs, user IDs, database IDs, or raw DB keys.
- **Safe Attributes:** Use safe context-level attributes derived from `AiContextPayload` (e.g., domain, date, metric, value, unit, calculation/window).
- **Match Requirement:** `AI claim` → `evidence reference` → `validated context item` → `MATCH / NO MATCH`.
- **Failure:** If the evidence cannot be matched to validated context, it is an unsupported claim. It must be rejected/withheld and NOT returned as a factual user-specific claim. If required evidence is unavailable, the AI must state that the information is unavailable rather than inventing it.

## 6. Distinguishing Validation Responsibilities

### A. Response Schema Validator
- Checks structure, required fields, allowed fields, types, enums, array/string bounds.
- Schema failure → provider response rejected.

### B. Grounding Validator
- Checks factual claims are supported by validated context.
- Checks evidence references correspond to available context.
- Grounding failure → unsupported user-specific factual claim rejected/withheld. Controlled response provided if required.

### C. Safety Validator
- Checks medical/health safety policy, dangerous dieting/exercise, medication/diagnosis issues, and unsupported medical claims.
- Safety failure → unsafe provider response discarded. Never return raw provider output. Return a controlled safe response or controlled failure. Never expose internal safety-rule details to the browser.

## 7. Explicit Failure Contract
- **Authentication failure:** → 401
- **Invalid request:** → controlled client error
- **Context Builder failure:** → no AI call
- **Context Validator failure:** → no AI call
- **Provider timeout/network failure:** → controlled gateway error (Provider requests require a hard timeout, only bounded transient failures may be retried, client/validation errors never retry. Exact retry policies are configuration decisions).
- **Provider malformed response:** → no raw provider response returned
- **Response schema failure:** → reject response
- **Grounding failure:** → reject unsupported claims / controlled fallback
- **Safety failure:** → no unsafe response returned / controlled safety response

## 8. Phase 4.9 Scope vs Deferred Features

### Phase 4.9: Implementation Foundation ONLY
Implement strictly the AI Gateway foundation:
- One configured provider
- One configured model
- Provider adapter abstraction
- Server-only provider credentials
- `POST /api/ai/coach`
- Authentication
- Server-side question validation
- Server-side context construction
- Context Validator integration
- Provider request
- Structured response parser
- Response Schema Validator
- Grounding Validator
- Safety Validator
- Controlled failure behavior

### Future / Explicitly Deferred
- AI chat UI
- Chat history
- Conversational memory
- Streaming (Initial implementation is non-streaming/blocking JSON)
- External tools
- Function calling
- Autonomous actions
- Multi-provider fallback
- Distributed rate limiting (gateway rate policy exists as a conceptual boundary only)
- Advanced telemetry
