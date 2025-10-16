import { createAuthClient } from "better-auth/react";

/**
 * Better-Auth client instance for client-side authentication
 * This client connects to the auth server API and provides
 * React hooks and methods for authentication operations.
 *
 * @example
 * ```tsx
 * import { useSession, signIn, signOut } from "@/lib/auth-client";
 *
 * function MyComponent() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (!session) return <button onClick={() => signIn.email(...)}>Sign In</button>;
 *
 *   return <button onClick={() => signOut()}>Sign Out</button>;
 * }
 * ```
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});

/**
 * Sign in methods for different authentication strategies
 *
 * @example Email/Password
 * ```tsx
 * await signIn.email({
 *   email: "user@example.com",
 *   password: "password123"
 * });
 * ```
 *
 * @example Social Login
 * ```tsx
 * await signIn.social({ provider: "google" });
 * await signIn.social({ provider: "discord" });
 * ```
 */
export const { signIn } = authClient;

/**
 * Sign out the current user and clear their session
 *
 * @example
 * ```tsx
 * <button onClick={() => signOut()}>
 *   Sign Out
 * </button>
 * ```
 */
export const { signOut } = authClient;

/**
 * Sign up methods for creating new user accounts
 *
 * @example
 * ```tsx
 * await signUp.email({
 *   email: "user@example.com",
 *   password: "password123",
 *   name: "John Doe"
 * });
 * ```
 */
export const { signUp } = authClient;

/**
 * React hook to get the current user session
 * Returns session data, loading state, and error state
 *
 * @returns Session query object with:
 * - `data`: Session data including user and session info (null if not authenticated)
 * - `isPending`: True while loading the session
 * - `error`: Error object if session fetch failed
 * - `refetch`: Function to manually refetch the session
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { data: session, isPending, error } = useSession();
 *
 *   if (isPending) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   if (error) {
 *     return <div>Error loading session</div>;
 *   }
 *
 *   if (!session) {
 *     return <div>Not authenticated</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome {session.user.name}!</h1>
 *       <p>Email: {session.user.email}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const { useSession } = authClient;

/**
 * Type definitions for TypeScript users
 */
export type Session = {
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
};

/**
 * Export the full client for advanced use cases
 */
export default authClient;
