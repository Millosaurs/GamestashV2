import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const authServer = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!authServer) {
    url.pathname = "/auth";
    url.searchParams.set("callback", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const sessionResp = await fetch(`${authServer}/api/auth/session`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (sessionResp.ok) {
      const data = await sessionResp.json().catch(() => null);
      if (data && data.user) return NextResponse.next();
    }
  } catch {}

  url.pathname = "/auth";
  url.searchParams.set("callback", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

