import { NextResponse } from 'next/server';

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  
  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  // Handle Better Auth API Protection for CF-4 and CF-9 tests
  if (pathname.startsWith('/api/protected') || pathname.startsWith('/api/analytics')) {
    const cookie = req.headers.get('cookie') || '';
    
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

  // --- Original Supabase Proxy logic follows (untouched except for returning early above) ---
  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res = NextResponse.next({ request: { headers: req.headers } });
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
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
