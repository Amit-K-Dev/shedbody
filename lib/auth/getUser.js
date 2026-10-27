/**
 * lib/auth/getUser.js
 *
 * Core Next.js Server-Side User Identity Resolver.
 *
 * Native Better Auth + Cloudflare D1 Architecture:
 * 1. Reads and validates the session cookie via `resolveServerSession()`.
 * 2. Directly accesses D1 if binding exists, or queries Auth Worker via /api/auth/get-session.
 * 3. Fail-Closed: Returns null if unauthenticated, expired, or invalid.
 * 4. Zero Secrets Leaked: Returns sanitized user identity.
 */

import { resolveServerSession } from './sessionResolver.js';
import { extractSessionToken } from './sessionValidator.js';

export async function getUser() {
  let token = null;
  let cookieStore = null;

  try {
    const { cookies } = await import('next/headers');
    cookieStore = await cookies();
    token = extractSessionToken(cookieStore);
  } catch {
    // Outside active Next.js request context
  }

  if (!token) {
    return null;
  }

  try {
    const sessionResult = await resolveServerSession({ cookieStore });
    if (sessionResult?.user) {
      return sessionResult.user;
    }
    return null;
  } catch {
    return null;
  }
}
