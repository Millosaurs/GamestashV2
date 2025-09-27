"use client";

import * as React from "react";
import {
  User,
  ShoppingBag,
  Star,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Settings,
  Calendar,
  Clock,
  Badge,
  Award,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
// Import animated tabs instead of regular tabs
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs";
import { Progress } from "@/components/ui/progress";
import { authClient, signOut } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/header";
import Link from "next/link";

// Types for dashboard data
interface UserStats {
  totalPurchases: number;
  totalSpent: number;
  reviewsGiven: number;
  favoriteProducts: number;
}

interface DeveloperStats {
  totalProducts: number;
  totalRevenue: number;
  totalCustomers: number;
  totalReviews: number;
  averageRating: number;
  monthlyRevenue: number;
}

interface Purchase {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  purchaseDate: string;
  status: "completed" | "pending" | "refunded";
}

interface Review {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  sold: number;
  rating: number;
  reviews: number;
  revenue: number;
  status: "active" | "draft" | "archived";
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}

// User Dashboard Component
function UserDashboard({ userId }: { userId: string }) {
  // Fetch user stats
  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    ...orpc.user.getStats.queryOptions({ input: { userId } }),
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch recent purchases
  const {
    data: purchases = [],
    isLoading: purchasesLoading,
    error: purchasesError,
  } = useQuery({
    ...orpc.user.getPurchases.queryOptions({ input: { userId, limit: 5 } }),
    staleTime: 30000,
  });

  // Fetch user reviews
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery({
    ...orpc.user.getReviews.queryOptions({ input: { userId, limit: 5 } }),
    staleTime: 30000,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (statsError || !userStats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="size-8 text-destructive mb-3" />
        <h3 className="text-lg font-semibold">Failed to load data</h3>
        <p className="text-sm text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">Products owned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${userStats.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.reviewsGiven}</div>
            <p className="text-xs text-muted-foreground">Products reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.favoriteProducts}
            </div>
            <p className="text-xs text-muted-foreground">Saved products</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs - Updated with animated tabs */}
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchases">Recent Purchases</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <Card className="shadow-none py-0">
          <TabsContents className="py-6">
            <TabsContent value="purchases" className="space-y-4">
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>
                  Your latest product acquisitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchasesLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading purchases...
                  </div>
                ) : purchasesError ? (
                  <p className="text-sm text-destructive">
                    Failed to load purchases
                  </p>
                ) : purchases.length > 0 ? (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center space-x-4"
                      >
                        <img
                          src={purchase.productImage}
                          alt={purchase.productName}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {purchase.productName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              purchase.purchaseDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          ${purchase.price.toFixed(2)}
                        </div>
                        <UIBadge
                          variant={
                            purchase.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {purchase.status}
                        </UIBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No purchases yet.
                  </p>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <CardHeader>
                <CardTitle>My Reviews</CardTitle>
                <CardDescription>
                  Reviews you've left for products
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading reviews...
                  </div>
                ) : reviewsError ? (
                  <p className="text-sm text-destructive">
                    Failed to load reviews
                  </p>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {review.productName}
                          </p>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No reviews yet.
                  </p>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <CardHeader>
                <CardTitle>Favorite Products</CardTitle>
                <CardDescription>
                  Products you've saved for later
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your favorite products will appear here.
                </p>
              </CardContent>
            </TabsContent>
          </TabsContents>
        </Card>
      </Tabs>
    </div>
  );
}

// Developer Dashboard Component
function DeveloperDashboard({ userId }: { userId: string }) {
  // Fetch developer stats
  const {
    data: developerStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    ...orpc.user.getDeveloperStats.queryOptions({ input: { userId } }),
    staleTime: 30000,
  });

  // Fetch developer products
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    ...orpc.user.getDeveloperProducts.queryOptions({
      input: { userId, limit: 10 },
    }),
    staleTime: 30000,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (statsError || !developerStats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="size-8 text-destructive mb-3" />
        <h3 className="text-lg font-semibold">Failed to load data</h3>
        <p className="text-sm text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {developerStats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">Published products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${developerStats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {developerStats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">Unique buyers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {developerStats.averageRating}
            </div>
            <p className="text-xs text-muted-foreground">
              From {developerStats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your earnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-2xl font-bold">
                  ${developerStats.monthlyRevenue}
                </span>
              </div>
              <Progress value={65} className="w-full" />
              <p className="text-xs text-muted-foreground">
                +15.2% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/products">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create New Product
              </Button>
            </Link>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Customers
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>Manage your published products</CardDescription>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading products...
            </div>
          ) : productsError ? (
            <p className="text-sm text-destructive">Failed to load products</p>
          ) : products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>${product.price}</span>
                      <span>{product.sold} sold</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>{product.rating}</span>
                        <span>({product.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UIBadge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                    >
                      {product.status}
                    </UIBadge>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No products yet. Create your first product!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Fetch user profile including role from database
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    ...orpc.user.getProfile.queryOptions({
      input: { userId: session?.user.id || "" },
    }),
    enabled: !!session?.user.id,
    staleTime: 60000, // Cache profile for 1 minute
    retry: 2,
  });

  // Determine user role based on database data
  const userRole = React.useMemo(() => {
    if (!userProfile?.role) return "user"; // Default to user if no role set

    // Map database role to dashboard role
    // Adjust these mappings based on your role schema
    switch (userProfile.role.toLowerCase()) {
      case "developer":
      case "dev":
        return "dev";
      case "user":
        return "user";
      case "both":
      case "user_and_developer":
      case "admin": // Admins can see both views
        return "both";
      default:
        return "user";
    }
  }, [userProfile]);

  const isUser = userRole === "user" || userRole === "both";
  const isDeveloper = userRole === "dev" || userRole === "both";
  const isLoading = sessionLoading || profileLoading;

  useEffect(() => {
    if (!session && !sessionLoading) {
      router.push("/auth");
    }
  }, [session, sessionLoading, router]);

  // Show loading state while fetching session or profile
  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  // Show error state if profile couldn't be loaded
  if (profileError) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <div>
              <h2 className="text-lg font-semibold">Failed to load profile</h2>
              <p className="text-sm text-muted-foreground">
                Please try refreshing the page
              </p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return null;
  }

  // Check if user is banned
  if (userProfile?.banned) {
    const banExpired =
      userProfile.banExpires && new Date(userProfile.banExpires) < new Date();

    if (banExpired) {
      // Ban has expired, but we should probably update the database
      // For now, show a message that they should contact support
    }

    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3 text-center max-w-md">
            <AlertCircle className="size-8 text-destructive" />
            <div>
              <h2 className="text-lg font-semibold">Account Suspended</h2>
              <p className="text-sm text-muted-foreground">
                {banExpired
                  ? "Your account suspension has expired. Please contact support to reactivate your account."
                  : userProfile.banReason
                  ? `Your account has been suspended: ${userProfile.banReason}`
                  : "Your account has been temporarily suspended. Please contact support for assistance."}
              </p>
              {userProfile.banExpires && !banExpired && (
                <p className="text-xs text-muted-foreground mt-2">
                  Expires:{" "}
                  {new Date(userProfile.banExpires).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              variant="outline"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <Link href="/market">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground -ml-2 "
              >
                <ArrowLeft className="size-4" />
                Back to Market
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {session.user.name}!
            </h1>
            <p className="text-muted-foreground mt-2">
              {userRole === "both"
                ? "Manage your purchases and products all in one place"
                : userRole === "dev"
                ? "Manage your products and track your sales"
                : "Track your purchases and manage your library"}
            </p>

            {/* User role badge and actions */}
            <div className="mt-3 flex items-center gap-2">
              <UIBadge variant="outline">
                {userRole === "both"
                  ? "User & Developer"
                  : userRole === "dev"
                  ? "Developer"
                  : "User"}
              </UIBadge>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Role-based content - Updated with animated tabs */}
          {userRole === "both" ? (
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="developer"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Developer Dashboard
                </TabsTrigger>
              </TabsList>

              <Card className="shadow-none py-0">
                <TabsContents className="p-6">
                  <TabsContent value="user" className="mt-6">
                    <UserDashboard userId={session.user.id} />
                  </TabsContent>

                  <TabsContent value="developer" className="mt-6">
                    <DeveloperDashboard userId={session.user.id} />
                  </TabsContent>
                </TabsContents>
              </Card>
            </Tabs>
          ) : isDeveloper ? (
            <DeveloperDashboard userId={session.user.id} />
          ) : (
            <UserDashboard userId={session.user.id} />
          )}
        </div>
      </div>
    </>
  );
}
