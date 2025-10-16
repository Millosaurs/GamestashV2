# Better-Auth Authentication Setup

This document explains how authentication is configured in the GameStash web application using Better-Auth.

## Architecture Overview

The authentication system uses a **client-server architecture**:

- **Auth Server** (`apps/server`): Hosts the Better-Auth instance and handles all authentication logic
- **Web Client** (`apps/web`): Consumes the auth API and protects routes using middleware

## Configuration Files

### Server-Side (apps/server)

#### `/apps/server/src/lib/auth.ts`
The main Better-Auth configuration with:
- Drizzle adapter for PostgreSQL
- Email/password authentication
- Social providers (Google, Discord)
- Admin plugin

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId: "...", clientSecret: "..." },
    discord: { clientId: "...", clientSecret: "..." },
  },
  plugins: [admin()],
});
```

#### `/apps/server/src/app/api/auth/[...all]/route.ts`
Exposes the Better-Auth API endpoints:
```typescript
export const { GET, POST } = toNextJsHandler(auth.handler);
```

### Client-Side (apps/web)

#### `/apps/web/src/lib/auth-client.ts`
Client-side authentication utilities for React components:
```typescript
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});

export const { signIn, signOut, signUp, useSession } = authClient;
```

#### `/apps/web/src/lib/get-session.ts`
Server-side session utilities for Server Components and Server Actions:
```typescript
// Get session in server components
const sessionData = await getSession();

// Require authentication (throws if not authenticated)
const sessionData = await requireAuth();
```

#### `/apps/web/middleware.ts`
Protects routes by checking session validity:
- Intercepts requests to `/dashboard/*`
- Validates session with auth server
- Redirects unauthenticated users to `/auth`

## Environment Variables

Required environment variables:

### Server (.env in apps/server)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gamestash"

# Auth Configuration
CORS_ORIGIN="http://localhost:3001"

# Social Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

### Web Client (.env.local in apps/web)
```bash
# Auth Server URL
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"

# Web App URL (optional)
NEXT_PUBLIC_WEB_URL="http://localhost:3001"
```

## Usage Examples

### 1. Client Component Authentication

```tsx
"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function UserProfile() {
  const { data: session, isPending, error } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error || !session) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}
```

### 2. Server Component Authentication

```tsx
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect("/auth?callback=/protected-page");
  }

  const { user, session } = sessionData;

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Hello, {user.name}!</p>
      <p>Your email: {user.email}</p>
      <p>Session ID: {session.id}</p>
    </div>
  );
}
```

### 3. Server Action with Authentication

```tsx
"use server";

import { requireAuth } from "@/lib/get-session";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  // Throws error if not authenticated
  const { user } = await requireAuth();

  const name = formData.get("name") as string;

  // Update user profile...
  // await db.update(users).set({ name }).where(eq(users.id, user.id));

  revalidatePath("/dashboard");

  return { success: true };
}
```

### 4. Sign In/Sign Up

```tsx
"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { useState } from "react";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      await signIn.email({ email, password });
      // User is now authenticated
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp.email({ email, password, name: "User Name" });
      // User is now registered and authenticated
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}
```

### 5. Social Sign In

```tsx
"use client";

import { signIn } from "@/lib/auth-client";

export function SocialAuth() {
  return (
    <div>
      <button onClick={() => signIn.social({ provider: "google" })}>
        Sign in with Google
      </button>
      <button onClick={() => signIn.social({ provider: "discord" })}>
        Sign in with Discord
      </button>
    </div>
  );
}
```

## Protected Routes

The middleware automatically protects the following routes:
- `/dashboard/*` - All dashboard routes

To add more protected routes, update the `matcher` in `middleware.ts`:

```typescript
export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",        // Add more protected routes
    "/settings/:path*",
  ],
};
```

## Session Structure

The session object returned by `getSession()` or `useSession()` has the following structure:

```typescript
{
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

## Security Features

1. **HTTP-Only Cookies**: Session tokens are stored in HTTP-only cookies, preventing XSS attacks
2. **CSRF Protection**: Better-Auth includes built-in CSRF protection
3. **Secure Cookies**: Enabled in production environments
4. **Session Validation**: Middleware validates every request to protected routes
5. **Same-Site Cookies**: Set to "none" for cross-origin requests (adjust as needed)

## Troubleshooting

### "NEXT_PUBLIC_SERVER_URL is not set"
Make sure you have `NEXT_PUBLIC_SERVER_URL` in your `.env.local` file in the web app.

### Middleware redirects even when authenticated
- Check that cookies are being set correctly (check browser DevTools)
- Ensure `CORS_ORIGIN` in the server includes your web app URL
- Verify `trustedOrigins` in the auth configuration

### Session not persisting across requests
- Check cookie settings in Better-Auth configuration
- Ensure `sameSite` and `secure` settings are appropriate for your environment
- In development, you might need `sameSite: "lax"` instead of `"none"`

### Social login redirects not working
- Verify callback URLs are correctly configured in Google/Discord console
- Check that redirect URIs match: `{SERVER_URL}/api/auth/callback/{provider}`

## Additional Resources

- [Better-Auth Documentation](https://better-auth.com)
- [Better-Auth Next.js Integration](https://better-auth.com/docs/integrations/next)
- [Better-Auth API Reference](https://better-auth.com/docs/api-reference)
