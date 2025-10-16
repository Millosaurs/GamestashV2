# Better-Auth Quick Reference Guide

Quick reference for common authentication patterns in GameStash.

## 🚀 Quick Start

### Environment Setup
```bash
# apps/web/.env.local
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

## 📖 Common Patterns

### 1. Client Component - Get Current User

```tsx
"use client";

import { useSession } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <h1>Welcome {session.user.name}!</h1>;
}
```

### 2. Client Component - Sign Out

```tsx
"use client";

import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

### 3. Server Component - Protected Page

```tsx
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect("/auth?callback=/protected");
  }

  return <h1>Hello {sessionData.user.name}</h1>;
}
```

### 4. Server Component - Optional Auth

```tsx
import { getSession } from "@/lib/get-session";

export default async function OptionalAuthPage() {
  const sessionData = await getSession();

  return (
    <div>
      {sessionData ? (
        <p>Welcome back, {sessionData.user.name}!</p>
      ) : (
        <p>You're browsing as a guest</p>
      )}
    </div>
  );
}
```

### 5. Server Action - Requires Auth

```tsx
"use server";

import { requireAuth } from "@/lib/get-session";

export async function updateProfile(name: string) {
  const { user } = await requireAuth();

  // Update user in database
  // await db.update(users).set({ name }).where(eq(users.id, user.id));

  return { success: true };
}
```

### 6. Sign In Form

```tsx
"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn.email({ email, password });
      // Success - user is now authenticated
    } catch (error) {
      console.error("Sign in failed:", error);
      alert("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

### 7. Sign Up Form

```tsx
"use client";

import { signUp } from "@/lib/auth-client";
import { useState } from "react";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      // Success - user is registered and authenticated
    } catch (error) {
      console.error("Sign up failed:", error);
      alert("Sign up failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### 8. Social Authentication

```tsx
"use client";

import { signIn } from "@/lib/auth-client";

export function SocialButtons() {
  return (
    <div>
      <button onClick={() => signIn.social({ provider: "google" })}>
        Continue with Google
      </button>
      <button onClick={() => signIn.social({ provider: "discord" })}>
        Continue with Discord
      </button>
    </div>
  );
}
```

### 9. Conditional Rendering Based on Auth

```tsx
"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export function Navigation() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  return (
    <nav>
      {session ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <span>{session.user.name}</span>
        </>
      ) : (
        <>
          <Link href="/auth">Sign In</Link>
        </>
      )}
    </nav>
  );
}
```

### 10. API Route with Auth

```tsx
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const authServer = process.env.NEXT_PUBLIC_SERVER_URL;
  const headersList = await headers();

  // Verify session
  const sessionRes = await fetch(`${authServer}/api/auth/get-session`, {
    headers: {
      cookie: headersList.get("cookie") || "",
    },
  });

  if (!sessionRes.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = await sessionRes.json();

  // Process authenticated request
  return NextResponse.json({ success: true, userId: user.id });
}
```

## 🔐 Session Data Structure

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

## 🛡️ Protected Routes

Routes protected by middleware:
- `/dashboard/*` - Automatically redirects to `/auth` if not authenticated

Add more protected routes in `middleware.ts`:
```typescript
export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",     // Add this
    "/settings/:path*",  // Add this
  ],
};
```

## 🎯 Best Practices

### ✅ DO:
- Use `useSession()` in client components
- Use `getSession()` in server components
- Use `requireAuth()` when auth is mandatory
- Handle loading states in client components
- Redirect after checking auth in server components

### ❌ DON'T:
- Don't use `getSession()` in client components
- Don't use `useSession()` in server components
- Don't forget to check for null session
- Don't skip loading states
- Don't expose sensitive data in client

## 🐛 Common Issues

### Session not persisting
**Solution**: Check that cookies are enabled and `NEXT_PUBLIC_SERVER_URL` is correct

### Middleware redirecting authenticated users
**Solution**: Verify the session endpoint returns `{ session, user }` structure

### Social login not working
**Solution**: Check redirect URIs in provider console match `{SERVER_URL}/api/auth/callback/{provider}`

### CORS errors
**Solution**: Add web URL to `trustedOrigins` in server auth config

## 📚 More Info

See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed documentation.
