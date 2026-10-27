import { NextResponse } from 'next/server';

export const runtime = 'experimental-edge';

export async function middleware(req) {
  const rawHost = req.headers.get('host') || req.nextUrl.hostname || '';
  const host = rawHost.split(':')[0].toLowerCase();
  if (host === 'shedbody.com') {
    const url = req.nextUrl.clone();
    url.hostname = 'www.shedbody.com';
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = req.nextUrl;
  
  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  const cookie = req.headers.get('cookie') || '';

  // Handle Better Auth API Protection for CF-4 and CF-9 tests
  if (pathname.startsWith('/api/protected') || pathname.startsWith('/api/analytics')) {
    try {
      const authRes = await fetch(new URL('/api/auth/get-session', req.url), {
        headers: { cookie }
      });
      const session = await authRes.json();

      if (!session || !session.session) {
        return NextResponse.redirect(new URL('/cf4-test', req.url));
      }
      
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', session.session.userId);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (e) {
      console.error("Proxy Auth Error:", e);
      return NextResponse.redirect(new URL('/cf4-test', req.url));
    }
  }

  // Check Better Auth session for protected frontend routes
  let authenticatedUser = null;
  const hasBetterAuthCookie = cookie.includes('better-auth.session_token');

  if (hasBetterAuthCookie) {
    try {
      const authRes = await fetch(new URL('/api/auth/get-session', req.url), {
        headers: { cookie },
        signal: AbortSignal.timeout(3000),
      });
      if (authRes.ok) {
        const session = await authRes.json().catch(() => null);
        if (session && session.user && session.session) {
          authenticatedUser = session.user;
        }
      }
    } catch {}
    // FAIL-CLOSED INVARIANT: Better Auth session cookie is validated strictly.
    // If unauthenticated or Worker is unavailable, authenticatedUser remains null,
    // which cleanly redirects unauthorized requests to /login.
  }

  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/plans",
    "/start",
    "/admin",
  ];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !authenticatedUser) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && authenticatedUser) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/plans/:path*",
    "/start/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/api/protected/:path*",
    "/api/analytics/:path*"
  ],
};
