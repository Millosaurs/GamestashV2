# Vercel Deployment Guide - Cookie & Authentication Issues

## Problem Overview

Your middleware is not receiving cookies on Vercel because of cross-domain cookie issues between:
- Frontend: `dev.gamestash.net`
- API: `api.gamestash.net`

## Root Cause

When Better Auth sets cookies on `api.gamestash.net`, those cookies are **domain-specific** and won't be automatically sent to requests on `dev.gamestash.net`, even in server-side middleware.

## Solutions

### Option 1: Use Same Domain with Path Routing (RECOMMENDED)

Configure Vercel to route API requests through the same domain:

#### 1. Update `vercel.json` in the root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/server/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/server/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ]
}
```

#### 2. Update Environment Variables:

**Frontend (.env):**
```bash
# Use relative path instead of full domain
NEXT_PUBLIC_SERVER_URL=https://dev.gamestash.net

# OR use empty string to use same origin
NEXT_PUBLIC_SERVER_URL=
```

**Backend (.env):**
```bash
# Allow same domain
CORS_ORIGIN=https://dev.gamestash.net
```

#### 3. Update Auth Configuration:

In `apps/server/src/lib/auth.ts`:

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [
    process.env.CORS_ORIGIN || "",
    "https://dev.gamestash.net",
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // ... your social providers
  },
  advanced: {
    defaultCookieAttributes: {
      // Change sameSite for same-domain setup
      sameSite: "lax", // Changed from "none"
      secure: true,
      httpOnly: true,
      path: "/",
      // Domain should be the main domain
      domain: ".gamestash.net", // Note the leading dot
    },
  },
  plugins: [admin()],
});
```

---

### Option 2: Fix Cross-Domain Cookies (CURRENT SETUP)

If you want to keep separate domains, you need to ensure cookies work across domains:

#### 1. Verify Cookie Domain Settings

In `apps/server/src/lib/auth.ts`:

```typescript
advanced: {
  defaultCookieAttributes: {
    sameSite: "none", // Required for cross-domain
    secure: true,     // Required when sameSite is "none"
    httpOnly: true,
    path: "/",
    domain: ".gamestash.net", // IMPORTANT: Set parent domain with leading dot
  },
},
```

#### 2. Verify CORS Settings

Ensure your API returns proper CORS headers:

```typescript
// In your API middleware or next.config.ts
headers: async () => [
  {
    source: "/api/:path*",
    headers: [
      { key: "Access-Control-Allow-Credentials", value: "true" },
      { key: "Access-Control-Allow-Origin", value: "https://dev.gamestash.net" },
      { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Cookie" },
    ],
  },
],
```

#### 3. Update Client-Side Auth

In `apps/web/src/lib/auth-client.ts` (or wherever you initialize the auth client):

```typescript
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  credentials: "include", // IMPORTANT: Include credentials
});
```

#### 4. Update Middleware to Use Client-Side Cookie Check

Instead of checking cookies in middleware, use client-side session check:

```typescript
// apps/web/src/middleware.ts
export async function middleware(request: NextRequest) {
  // Skip middleware cookie check, let client-side handle it
  // Just pass through and let the client-side auth handle redirects
  return NextResponse.next();
}

// Then in your dashboard layout:
// apps/web/src/app/dashboard/layout.tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth?callback=/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

---

## Environment Variables Checklist

### Frontend (`apps/web/.env.production`)

```bash
NEXT_PUBLIC_SERVER_URL=https://api.gamestash.net
# OR for Option 1:
# NEXT_PUBLIC_SERVER_URL=https://dev.gamestash.net
```

### Backend (`apps/server/.env.production`)

```bash
CORS_ORIGIN=https://dev.gamestash.net
DATABASE_URL=postgresql://...
AWS_REGION=...
AWS_S3_BUCKET_NAME=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_PUBLIC_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
```

---

## Vercel Project Settings

### 1. Environment Variables

Go to: **Project Settings → Environment Variables**

Add all variables from above, make sure to select:
- ✅ Production
- ✅ Preview
- ✅ Development

### 2. Domains

Ensure both domains are configured:
- `dev.gamestash.net` → Frontend project
- `api.gamestash.net` → Backend project

### 3. Check DNS Settings

Both domains should have:
- Type: `CNAME`
- Name: `dev` or `api`
- Value: `cname.vercel-dns.com`

---

## Testing Steps

### 1. Test Cookie Setting

```bash
# Test if cookies are being set by the API
curl -i https://api.gamestash.net/api/auth/get-session \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

Should return `Set-Cookie` headers.

### 2. Test Cross-Domain

Open browser DevTools → Application → Cookies

Check:
- Is cookie present?
- What's the Domain? (should be `.gamestash.net`)
- Is Secure? (should be ✓)
- Is HttpOnly? (should be ✓)
- SameSite? (should be `None` for cross-domain or `Lax` for same-domain)

### 3. Test Middleware

Check Vercel Function Logs:
1. Go to Vercel Dashboard
2. Click on your frontend deployment
3. Go to "Functions" tab
4. Check logs for middleware execution

---

## Common Issues & Solutions

### Issue: "No cookies found"

**Solution:**
- Check cookie domain is set to `.gamestash.net` (with leading dot)
- Verify `sameSite: "none"` and `secure: true` for cross-domain
- Ensure CORS credentials are allowed

### Issue: "Session fetch returns 401"

**Solution:**
- Cookie might not be sent to API
- Check CORS settings allow credentials
- Verify cookie domain matches

### Issue: "Middleware always redirects"

**Solution:**
- Use client-side auth check instead of middleware
- Or implement Option 1 (same domain routing)

### Issue: "Works locally but not on Vercel"

**Solution:**
- Local uses `localhost` (different cookie rules)
- Vercel requires proper domain configuration
- Check all environment variables are set in Vercel dashboard

---

## Recommended Approach

**For production, use Option 1 (Same Domain Routing)**

Why?
- ✅ Simpler cookie management
- ✅ No CORS issues
- ✅ Better security
- ✅ Works with middleware
- ✅ Better for SEO
- ✅ Single SSL certificate

The only downside is slightly more complex Vercel routing configuration, but it's worth it for the benefits.

---

## Quick Fix (Immediate)

If you need auth working NOW:

1. Move middleware logic to client-side (shown in Option 2)
2. Create a `ProtectedRoute` component:

```typescript
// apps/web/src/components/protected-route.tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

3. Wrap dashboard pages:

```typescript
// apps/web/src/app/dashboard/page.tsx
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {/* Your dashboard content */}
    </ProtectedRoute>
  );
}
```

This will work immediately without any deployment changes!

---

## Support

If issues persist:
1. Check Vercel Function logs
2. Check browser DevTools → Network tab → Check request/response headers
3. Verify all environment variables in Vercel dashboard
4. Test cookies in browser DevTools → Application → Cookies
