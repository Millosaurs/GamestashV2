import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log("\n=== MIDDLEWARE TRIGGERED ===");
  console.log("[Middleware] Pathname:", pathname);
  console.log("[Middleware] Full URL:", request.url);
  console.log("[Middleware] Environment:", process.env.NODE_ENV);

  // Debug: Log all cookies
  const allCookies = request.cookies.getAll();
  console.log("[Middleware] Total cookies:", allCookies.length);
  console.log("[Middleware] Cookie names:", allCookies.map(c => c.name).join(", "));

  // Check for Better Auth session token specifically
  const betterAuthToken = request.cookies.get("better-auth.session_token");
  console.log("[Middleware] better-auth.session_token present:", !!betterAuthToken);
  console.log("[Middleware] better-auth.session_token value:", betterAuthToken?.value?.substring(0, 20) + "...");

  // Use Better Auth's built-in cookie checker
  // This checks for the session cookie existence
  const sessionCookie = getSessionCookie(request);

  console.log("[Middleware] getSessionCookie result:", !!sessionCookie);
  console.log("[Middleware] Session cookie value:", sessionCookie ? "exists" : "missing");

  if (!sessionCookie) {
    console.log("[Middleware] ❌ No session cookie found, redirecting to auth");

    // Redirect to auth page with callback
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("callback", pathname);

    console.log("[Middleware] 🔒 Redirecting to:", url.toString());
    console.log("=== MIDDLEWARE END ===\n");

    return NextResponse.redirect(url);
  }

  console.log("[Middleware] ✅ Session cookie found, allowing access");
  console.log("=== MIDDLEWARE END ===\n");

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all dashboard routes including:
     * - /dashboard
     * - /dashboard/products
     * - /dashboard/products/create
     * - /dashboard/settings
     * - etc.
     */
    "/dashboard",
    "/dashboard/:path*",
  ],
};
