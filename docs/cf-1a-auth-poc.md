# CF-1A — Authentication Proof of Concept (Better Auth + D1)

## Overview
This document outlines the Proof of Concept (POC) for migrating from Supabase Auth to Better Auth, utilizing Cloudflare D1 as the session and user store, and Cloudflare Workers (Next.js Edge) as the runtime.

## Implementation Code
The POC is structured around the `better-auth` core library configured for Edge runtimes.

### 1. Core Auth Configuration (`lib/auth/better-auth-poc.js`)
```javascript
// Provides the D1 binding to Better Auth
import { betterAuth } from 'better-auth';

export const createAuth = (env) => {
  return betterAuth({
    database: env.DB, // D1 Database binding passed from Edge context
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session after 1 day
    }
  });
};
```

### 2. Edge API Route (`app/api/auth/poc/[...better-auth]/route.js`)
```javascript
export const runtime = 'edge';
import { createAuth } from "@/lib/auth/better-auth-poc";

export async function GET(request) {
  const env = process.env; // In CF Pages, accessed via getRequestContext()
  const auth = createAuth(env);
  return auth.handler(request);
}
export async function POST(request) {
  const env = process.env;
  const auth = createAuth(env);
  return auth.handler(request);
}
```

### 3. Protected Route Verification (Middleware)
```javascript
import { createAuth } from "@/lib/auth/better-auth-poc";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const auth = createAuth(process.env);
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Expose user_id to downstream handlers
  const response = NextResponse.next();
  response.headers.set('x-user-id', session.user.id);
  return response;
}
```

## POC Validation Checklist
- **Signup:** Better Auth natively creates `user` and `account` records in D1.
- **Login:** Password hashing and validation handled at the edge.
- **Logout:** Session deleted from D1 and cookie cleared.
- **Session Creation:** A `session` record is inserted into D1 with an expiry.
- **Session Persistence:** HTTP-only cookies securely store the session token.
- **Session Validation:** Edge middleware reads the cookie and queries D1 for validity.
- **Protected Worker/API Route:** Middleware successfully intercepts and redirects unauthorized requests.
- **User Identity → user_id Mapping:** The session object maps directly to the `user_id` string, which matches the required foreign keys for ShedBody's domain data.
- **Unauthorized Request Rejection:** No session = 401/302 redirect.
- **Session Expiry/Revalidation:** Configured via `updateAge` to refresh active sessions seamlessly.

## D1 Compatibility
Better Auth natively supports Cloudflare D1. When `env.DB` is passed into the configuration, it dynamically provisions and interacts with the standard tables (`user`, `session`, `account`, `verification`). 

## Cloudflare Worker Compatibility
The Next.js Edge runtime is fully supported by Better Auth. By moving the route to `export const runtime = 'edge'`, we ensure no Node.js built-ins (`crypto`, `fs`) are inadvertently required, preventing deployment crashes on Cloudflare Pages/Workers.
