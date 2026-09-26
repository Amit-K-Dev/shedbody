# Phase 4.8 AI Gateway Architecture Audit

## 1. AI Provider Abstraction Audit
The ShedBody architecture must not be tightly coupled to a single AI provider. Future business or cost requirements may necessitate switching between emerging LLM providers.

**Audit Findings:**
- The application layer (Next.js Dashboard, API routes) must be completely unaware of which underlying model or provider is answering the question.
- Provider-specific request structures must be encapsulated within a server-side **Provider Adapter**.
- Provider-specific response handling must be handled by this adapter.
- The system must standardise timeout, retry, and rate-limit handling, abstracting away provider-specific HTTP status codes.
- For the initial implementation, exactly one configured provider and model will be supported. Provider fallback is future work.

## 2. Server-Only Security Audit
**Audit Findings:**
- The future AI provider API key MUST NOT have the `NEXT_PUBLIC_` prefix in Next.js environment variables.
- API keys, raw provider payloads, and error traces containing keys must never be exposed to the client.
- The AI Gateway itself must be restricted to server environments.
- API keys must not be stored in the database.
- The browser cannot select the provider, the model, or provide credentials.

## 3. Authentication Boundary Audit
**Audit Findings:**
- Existing API routes use `@supabase/ssr` `createClient().auth.getUser()`.
- The AI Gateway must strictly follow this pattern. The browser MUST NOT supply a `user_id`. The server must derive the user identity entirely from the secure HTTP-only session cookie.
- Unauthenticated requests must immediately fail with a `401 Unauthorized`.
- Service-role access is unnecessary for this feature and should not be used.

## 4. Context Trust Boundary Audit
**Audit Findings:**
- The AI Gateway MUST NOT accept context data provided by the client (browser).
- The client should only send the user's explicit question (or intent).
- The server will autonomously:
  1. Authenticate the user.
  2. Fetch recent metrics, profile, and goals from the database.
  3. Pass data through the `Context Builder`.
  4. Pass the result through the `Context Validator`.
  5. Inject the validated context into the AI Gateway.
- This creates an absolute trust boundary: the AI reasons solely over authenticated, server-derived, validator-approved context.

## 5. User Question Security Audit
**Audit Findings:**
- The user's question is fundamentally untrusted input.
- Empty or whitespace-only questions must be rejected at the API boundary before invoking the LLM.
- A server-side maximum length is required. The exact production limit is an implementation/configuration decision.
- The browser cannot override the server limit.

## 6. Prompt Injection / Instruction Hierarchy
**Audit Findings:**
- Validating the context does not prevent prompt injection from the user's question.
- The internal prompt assembly must follow a strict hierarchy:
  1. **System Safety/Instructions:** High-level boundaries.
  2. **Application Instructions:** Specific task definitions.
  3. **Validated Context:** The deterministic data payload.
  4. **User Question:** The untrusted input, clearly demarcated.
- The user question must never override higher-level application safety requirements.

## 7. Medical / Health Safety Boundary Audit
**Audit Findings:**
- ShedBody operates in a sensitive domain (health and fitness).
- The AI must explicitly avoid diagnosing diseases, prescribing medication, encouraging dangerous caloric deficits, or fabricating medical evidence.
- Safety cannot rely solely on the LLM prompt. The architecture demands layered safety (System safety instructions -> Structured response validation -> Grounding validation -> Deterministic safety policy validation -> Controlled safe response).
- If the Safety Validator fails, the unsafe provider response is completely discarded and NEVER returned. A controlled safe response or failure is returned instead, never exposing internal rules.

## 8. Logging / Privacy Audit
**Audit Findings:**
- Severe privacy constraints apply to health data.
- The system MUST NEVER log: raw health metrics, database UUIDs, full LLM prompts, or full LLM responses to external observability tools.
- Logging should be restricted to operational metadata: request IDs (if not exposing user identity), latencies, model names, and success/failure status.

## 9. Performance Audit
**Audit Findings:**
- The critical path involves DB reads -> Context Building -> Validation -> AI API Request.
- AI request latency will dominate the response time.
- The AI gateway should reuse already-fetched server data rather than re-querying the database unnecessarily.
