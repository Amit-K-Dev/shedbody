"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import { extractSessionToken, revokeD1Session } from "../auth/sessionValidator.js";
import { isD1Binding, getRuntimeD1Binding } from "../auth/betterAuthEngine.js";

export async function logout() {
  const headerList = await headers();
  const pathname = headerList.get("referer") || "/";

  // 1. Revoke and delete Better Auth session
  try {
    const cookieStore = await cookies();
    const token = extractSessionToken(cookieStore);

    if (token) {
      const d1 = getRuntimeD1Binding();
      if (isD1Binding(d1)) {
        try {
          await revokeD1Session(d1, token);
        } catch (d1Err) {
          // Direct D1 outage: clearing browser cookies terminates local access,
          // but does not prove the remote D1 session was destroyed.
          console.warn(
            `[Logout] Direct D1 session revocation unconfirmed due to database error: ${
              d1Err?.message || d1Err
            }. Client-side session terminated.`
          );
        }
      } else {
        // Server-to-Worker sign-out dispatch
        const workerBase =
          process.env?.AUTH_WORKER_URL ||
          process.env?.BETTER_AUTH_URL;

        let workerRes = null;
        if (workerBase) {
          const cookieHeader = cookieStore.get("__Secure-better-auth.session_token")
            ? `__Secure-better-auth.session_token=${encodeURIComponent(token)}`
            : `better-auth.session_token=${encodeURIComponent(token)}`;

          try {
            workerRes = await fetch(`${workerBase.replace(/\/$/, "")}/api/auth/sign-out`, {
              method: "POST",
              headers: {
                Cookie: cookieHeader,
                Accept: "application/json",
                Origin: process.env.NEXT_PUBLIC_APP_URL || "https://shedbody.com",
              },
              signal: AbortSignal.timeout(3000),
            });
          } catch {
            // Network timeout or connection refused
          }
        }

        if (!workerRes || !workerRes.ok) {
          // Architectural and Security Notice:
          // When the Worker is disabled (HTTP 503), timed out, unreachable, or unconfigured,
          // remote session revocation in Cloudflare D1 cannot be confirmed.
          // The UI does NOT claim server-side revocation succeeded.
          // Client cookies are cleared immediately below to reliably terminate local access.
          // Residual Risk: The D1 session record will remain active on the server
          // until its natural expiration unless revoked separately.
          console.warn(
            `[Logout] Server-side Better Auth session revocation unconfirmed (status: ${
              workerRes ? workerRes.status : "unconfigured or unreachable"
            }). Client-side session terminated.`
          );
        }
      }

      // Clear all Better Auth cookies
      cookieStore.delete("better-auth.session_token");
      cookieStore.delete("__Secure-better-auth.session_token");
      cookieStore.delete("better-auth.session_data");
      cookieStore.delete("__Secure-better-auth.session_data");
    }
  } catch (err) {
    console.error("Better Auth logout cleanup error:", err?.message || err);
  }
  revalidatePath("/", "layout");

  const isPrivatePage =
    pathname.includes("/dashboard") ||
    pathname.includes("/profile") ||
    pathname.includes("/plans") ||
    pathname.includes("/start") ||
    pathname.includes("/admin");

  if (isPrivatePage) {
    redirect("/login");
  } else {
    redirect(pathname);
  }
}
