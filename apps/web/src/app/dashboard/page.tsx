/**
 * Dashboard Page - Role-based user interface
 *
 * Features:
 * - User Dashboard: Purchases, reviews, favorites
 * - Developer Dashboard: Products, revenue, customers, analytics
 * - Both: Tabbed interface for users with both roles
 *
 * TODO for Backend Integration:
 * 1. Create user profile procedure to fetch role from database
 * 2. Create procedures for user data (purchases, reviews, plans)
 * 3. Create procedures for developer data (products, customers, analytics)
 * 4. Replace mock data with real API calls using orpc
 * 5. Remove temporary role selector
 *
 * Current State: Frontend-only with mock data and role selector for testing
 */

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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { authClient, signOut } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { apiKey } from "better-auth/plugins";
import { auth } from "../../../../server/src/lib/auth";

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

// Mock data - will be replaced with real API calls later
const mockUserStats: UserStats = {
  totalPurchases: 12,
  totalSpent: 450.99,
  reviewsGiven: 8,
  favoriteProducts: 15,
};

const mockDeveloperStats: DeveloperStats = {
  totalProducts: 25,
  totalRevenue: 12450.5,
  totalCustomers: 340,
  totalReviews: 89,
  averageRating: 4.7,
  monthlyRevenue: 2340.75,
};

const mockPurchases: Purchase[] = [
  {
    id: "1",
    productName: "Minecraft Resource Pack - Medieval",
    productImage: "placeholder.svg",
    price: 12.99,
    purchaseDate: "2024-01-15",
    status: "completed",
  },
  {
    id: "2",
    productName: "Roblox Script - Auto Farm",
    productImage: "placeholder.svg",
    price: 25.0,
    purchaseDate: "2024-01-10",
    status: "completed",
  },
];

const mockReviews: Review[] = [
  {
    id: "1",
    productName: "Minecraft Resource Pack - Medieval",
    rating: 5,
    comment: "Amazing quality textures, exactly what I was looking for!",
    date: "2024-01-16",
  },
  {
    id: "2",
    productName: "Roblox Script - Auto Farm",
    rating: 4,
    comment: "Works great, but could use more configuration options.",
    date: "2024-01-12",
  },
];

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Advanced Minecraft Shaders",
    price: 19.99,
    sold: 245,
    rating: 4.8,
    reviews: 67,
    revenue: 4897.55,
    status: "active",
  },
  {
    id: "2",
    name: "FiveM Vehicle Pack",
    price: 35.0,
    sold: 89,
    rating: 4.6,
    reviews: 23,
    revenue: 3115.0,
    status: "active",
  },
];

// User Dashboard Component
function UserDashboard({
  userStats,
  purchases,
  reviews,
}: {
  userStats: UserStats;
  purchases: Purchase[];
  reviews: Review[];
}) {
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

      {/* Content Tabs */}
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchases">Recent Purchases</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>
                Your latest product acquisitions
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Reviews</CardTitle>
              <CardDescription>
                Reviews you've left for products
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Products</CardTitle>
              <CardDescription>Products you've saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your favorite products will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Developer Dashboard Component
function DeveloperDashboard({
  developerStats,
  products,
}: {
  developerStats: DeveloperStats;
  products: Product[];
}) {
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
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create New Product
            </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Temporary state for role selection (for testing purposes)
  const [selectedRole, setSelectedRole] = React.useState<
    "user" | "dev" | "both"
  >("user");

  // Fetch user data to get the role - this will need to be implemented with backend
  // For now, we'll use the selectedRole state for testing
  const userRole = React.useMemo(() => {
    // TODO: Replace with actual API call to get user role from database
    // Example implementation when backend is ready:
    // const { data: userProfile } = useQuery({
    //   ...orpc.user.profile.queryOptions({ input: { userId: session?.user.id } }),
    //   enabled: !!session?.user.id,
    // });
    // return userProfile?.role || 'user';

    return selectedRole; // Using state for testing, will be replaced with API call
  }, [selectedRole]);

  const isUser = userRole === "user" || userRole === "both";
  const isDeveloper = userRole === "dev" || userRole === "both";

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/auth");
    }
  }, [session, isPending]);

  if (isPending) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {session.user.name}!
            </h1>
            <Button
              onClick={async () => {
                await signOut();
              }}
            ></Button>
            <p className="text-muted-foreground mt-2">
              {userRole === "both"
                ? "Manage your purchases and products all in one place"
                : userRole === "dev"
                ? "Manage your products and track your sales"
                : "Track your purchases and manage your library"}
            </p>

            {/* Temporary Role Selector - Remove when backend is ready */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">
                🚧 Testing Mode - Select User Role:
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedRole === "user" ? "default" : "outline"}
                  onClick={() => setSelectedRole("user")}
                >
                  User
                </Button>
                <Button
                  size="sm"
                  variant={selectedRole === "dev" ? "default" : "outline"}
                  onClick={() => setSelectedRole("dev")}
                >
                  Developer
                </Button>
                <Button
                  size="sm"
                  variant={selectedRole === "both" ? "default" : "outline"}
                  onClick={() => setSelectedRole("both")}
                >
                  Both
                </Button>
              </div>
            </div>
          </div>

          {/* Role-based content */}
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

              <TabsContent value="user" className="mt-6">
                <UserDashboard
                  userStats={mockUserStats}
                  purchases={mockPurchases}
                  reviews={mockReviews}
                />
              </TabsContent>

              <TabsContent value="developer" className="mt-6">
                <DeveloperDashboard
                  developerStats={mockDeveloperStats}
                  products={mockProducts}
                />
              </TabsContent>
            </Tabs>
          ) : isDeveloper ? (
            <DeveloperDashboard
              developerStats={mockDeveloperStats}
              products={mockProducts}
            />
          ) : (
            <UserDashboard
              userStats={mockUserStats}
              purchases={mockPurchases}
              reviews={mockReviews}
            />
          )}
        </div>
      </div>
    </>
  );
}
