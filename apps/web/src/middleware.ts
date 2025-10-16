import { betterFetch } from "@better-fetch/fetch";
import { NextRequest, NextResponse } from "next/server";

type Session = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log("\n=== MIDDLEWARE TRIGGERED ===");
  console.log("[Middleware] Pathname:", pathname);
  console.log("[Middleware] Full URL:", request.url);

  // Only protect dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    console.log("[Middleware] Not a dashboard route, allowing access");
    return NextResponse.next();
  }

  console.log("[Middleware] Dashboard route detected, checking authentication...");

  const authServer = process.env.NEXT_PUBLIC_SERVER_URL;
  console.log("[Middleware] Auth server URL:", authServer);

  if (!authServer) {
    console.error("[Middleware] CRITICAL: NEXT_PUBLIC_SERVER_URL is not set!");
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("callback", pathname);
    console.log("[Middleware] Redirecting to:", url.toString());
    return NextResponse.redirect(url);
  }

  const cookie = request.headers.get("cookie") || "";
  console.log("[Middleware] Cookie present:", !!cookie);
  console.log("[Middleware] Cookie value:", cookie.substring(0, 50) + "...");

  try {
    console.log("[Middleware] Fetching session from:", `${authServer}/api/auth/get-session`);

    // Use better-fetch to get session
    const { data: session, error } = await betterFetch<Session>(
      "/api/auth/get-session",
      {
        baseURL: authServer,
        headers: {
          cookie: cookie,
        },
      }
    );

    console.log("[Middleware] Session response:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasSessionData: !!session?.session,
      error: error,
    });

    // Check if session exists and is valid
    if (session?.user && session?.session) {
      console.log("[Middleware] ✅ Valid session found, allowing access");
      console.log("[Middleware] User:", session.user.email);
      return NextResponse.next();
    }

    // Log error if present
    if (error) {
      console.error("[Middleware] ❌ Session fetch error:", error);
    } else {
      console.log("[Middleware] ❌ No valid session found");
    }
  } catch (error) {
    console.error("[Middleware] ❌ EXCEPTION in session validation:", error);
  }

  // No valid session, redirect to auth page
  const url = request.nextUrl.clone();
  url.pathname = "/auth";
  url.searchParams.set("callback", pathname);
  console.log("[Middleware] 🔒 Redirecting to auth:", url.toString());
  console.log("=== MIDDLEWARE END ===\n");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
