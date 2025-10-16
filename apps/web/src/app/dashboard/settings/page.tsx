import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, Clock } from "lucide-react";

/**
 * Example of a protected server component using Better-Auth
 * This page demonstrates server-side authentication checking
 */
export default async function SettingsPage() {
  // Get the current session - this runs on the server
  const sessionData = await getSession();

  // If no session exists, redirect to auth page with callback
  if (!sessionData) {
    redirect("/auth?callback=/dashboard/settings");
  }

  const { user, session } = sessionData;

  // Format dates
  const createdAt = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sessionExpiresAt = new Date(session.expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and session details
        </p>
      </div>

      {/* User Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
          <CardDescription>
            Your account details and profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Name
              </p>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              {user.emailVerified ? (
                <Badge variant="default" className="bg-green-500">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Not Verified
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </p>
              <p className="text-sm">{createdAt}</p>
            </div>
          </div>

          {user.image && (
            <>
              <Separator />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Profile Image</p>
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <p className="text-sm text-muted-foreground">Profile picture set</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Session Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Information
          </CardTitle>
          <CardDescription>
            Details about your current authentication session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Session ID</p>
              <p className="font-mono text-sm">{session.id}</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          </div>

          <Separator />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Expires
              </p>
              <p className="text-sm">{sessionExpiresAt}</p>
            </div>
          </div>

          {session.ipAddress && (
            <>
              <Separator />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="font-mono text-sm">{session.ipAddress}</p>
                </div>
              </div>
            </>
          )}

          {session.userAgent && (
            <>
              <Separator />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                  <p className="text-xs text-muted-foreground max-w-md break-all">
                    {session.userAgent}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>🔒 Server-Side Protected:</strong> This page is rendered on the server and
          automatically protected by Better-Auth middleware. Only authenticated users can access
          this page.
        </p>
      </div>
    </div>
  );
}
