import { headers } from "next/headers";

/**
 * Get the current user session in a server component or server action
 * @returns Session data with user information or null if not authenticated
 */
export async function getSession() {
  const authServer = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!authServer) {
    console.error("NEXT_PUBLIC_SERVER_URL is not set");
    return null;
  }

  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const response = await fetch(`${authServer}/api/auth/get-session`, {
      method: "GET",
      headers: {
        cookie,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Validate session structure
    if (data && data.session && data.user) {
      return {
        session: data.session,
        user: data.user,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

/**
 * Get the current user or redirect if not authenticated
 * Useful for protected server components
 */
export async function requireAuth() {
  const sessionData = await getSession();

  if (!sessionData) {
    throw new Error("Unauthorized - Please sign in to access this page");
  }

  return sessionData;
}

/**
 * Type definitions for session data
 */
export type SessionData = {
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
