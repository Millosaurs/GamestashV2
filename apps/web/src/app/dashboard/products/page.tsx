"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Image as ImageIcon,
  Save,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  Check,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

// Types based on your schema
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  platform: string;
  platformName?: string;
  category: string;
  categoryName?: string;
  rating: number;
  reviewCount: number;
  sold: number;
  image?: string;
  author: string;
  authorId?: string;
  isFeatured: boolean;
  isNew: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: number;
  platformId: string;
  categoryId: string;
  image?: string;
  isFeatured: boolean;
  isNew: boolean;
  tags?: string[];
}

type SortField = "name" | "price" | "rating" | "sold" | "createdAt";
type SortDirection = "asc" | "desc";

export default function DeveloperProductsDashboard() {
  const { data: session } = authClient.useSession();
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterPlatform, setFilterPlatform] = React.useState<string>("all");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("desc");
  const [deleteProductId, setDeleteProductId] = React.useState<string | null>(null);
  const [deleteProductIds, setDeleteProductIds] = React.useState<string[]>([]);
  const [deleteTimer, setDeleteTimer] = React.useState<number>(5);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) =>
      (orpc as any).products.delete.call({ id: productId }),
    onMutate: (productId) => {
      // Optimistically remove the product from the cache
      queryClient.setQueryData(
        ["products", "getUserProducts", { userId: session?.user.id || "", limit: 100, sortBy: "newest" }],
        (oldData: any) => oldData?.filter((product: any) => product.id !== productId) || []
      );
    },
    onSuccess: () => {
      refetchProducts(); // Refetch to ensure consistency
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
      setDeleteProductIds([]);
      setDeleteTimer(5);
    },
    onError: (error, productId) => {
      console.error("Failed to delete product:", error);
      // Revert optimistic update on error
      refetchProducts();
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (productIds: string[]) =>
      (orpc as any).products.bulkDelete.call({ ids: productIds }),
    onMutate: (productIds) => {
      // Optimistically remove the products from the cache
      queryClient.setQueryData(
        ["products", "getUserProducts", { userId: session?.user.id || "", limit: 100, sortBy: "newest" }],
        (oldData: any) => oldData?.filter((product: any) => !productIds.includes(product.id)) || []
      );
    },
    onSuccess: () => {
      refetchProducts(); // Refetch to ensure consistency
      setIsDeleteDialogOpen(false);
      setSelectedProducts([]);
      setDeleteProductId(null);
      setDeleteProductIds([]);
      setDeleteTimer(5);
    },
    onError: (error, productIds) => {
      console.error("Failed to bulk delete products:", error);
      // Revert optimistic update on error
      refetchProducts();
    },
  });



  // Fetch user's products
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    ...orpc.products.getUserProducts.queryOptions({
      input: {
        userId: session?.user.id || "",
        limit: 100,
        sortBy: "newest",
      },
    }),
    enabled: !!session?.user.id,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch all categories
  const {
    data: allCategories = [],
    isLoading: allCategoriesLoading,
    error: allCategoriesError,
  } = useQuery({
    ...orpc.categories.list.queryOptions(),
    staleTime: 300000, // Cache for 5 minutes
  });

  // Fetch categories for selected platform
  const {
    data: selectedPlatformCategories = [],
    isLoading: selectedCategoriesLoading,
  } = useQuery({
    ...orpc.categories.byPlatform.queryOptions({
      input: { platformId: filterPlatform },
    }),
    enabled: filterPlatform !== "all" && !!filterPlatform,
    staleTime: 300000, // Cache for 5 minutes
  });

  // Fetch platforms
  const {
    data: platforms = [],
    isLoading: platformsLoading,
    error: platformsError,
  } = useQuery({
    ...orpc.platforms.list.queryOptions(),
    staleTime: 300000, // Cache for 5 minutes
  });

  // Get available categories based on selected platform
  const availableCategories = React.useMemo(() => {
    if (filterPlatform === "all" || !filterPlatform) {
      return allCategories.filter((cat) => cat.id !== "all");
    }
    return selectedPlatformCategories.filter((cat) => cat.id !== "all");
  }, [filterPlatform, allCategories, selectedPlatformCategories]);

  // Reset category when platform changes
  React.useEffect(() => {
    setFilterCategory("all");
  }, [filterPlatform]);

  // Delete timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDeleteDialogOpen && deleteTimer > 0) {
      interval = setInterval(() => {
        setDeleteTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDeleteDialogOpen, deleteTimer]);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform =
        filterPlatform === "all" || product.platform === filterPlatform;
      const matchesCategory =
        filterCategory === "all" || product.category === filterCategory;

      return matchesSearch && matchesPlatform && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "price") {
        aVal = a.price;
        bVal = b.price;
      } else if (sortField === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    products,
    searchTerm,
    filterPlatform,
    filterCategory,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteProductId(productId);
    setDeleteTimer(5);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    setDeleteProductIds(selectedProducts);
    setDeleteTimer(5);
    setIsDeleteDialogOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === filteredAndSortedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredAndSortedProducts.map((p) => p.id));
    }
  };

  // Calculate stats
  const totalRevenue = products.reduce(
    (sum, product) => sum + product.price * product.sold,
    0
  );
  const totalSold = products.reduce((sum, product) => sum + product.sold, 0);
  const averageRating =
    products.length > 0
      ? products.reduce((sum, product) => sum + product.rating, 0) /
        products.length
      : 0;

  // Show loading overlay if any data is loading
  const isAnyLoading = productsLoading || allCategoriesLoading || platformsLoading;

  // Show error state
  if (productsError || allCategoriesError || platformsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="size-8 text-destructive mb-3" />
            <h3 className="text-lg font-semibold">Failed to load data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {productsError && "Failed to load products"}
              {allCategoriesError && "Failed to load categories"}
              {platformsError && "Failed to load platforms"}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="lg"
            className="gap-2 text-muted-foreground hover:text-foreground -ml-4 text-sm my-4 rounded-xl "
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        </Link>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Your Products
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your product catalog and track performance
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/products/create")}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

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
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                Active products in catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">From all products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSold.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Units sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-48 justify-start rounded-xl"
                    disabled={platformsLoading}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {platformsLoading
                      ? "Loading..."
                      : filterPlatform === "all"
                      ? "All Platforms"
                      : platforms.find((p) => p.id === filterPlatform)?.name ||
                        "Select Platform"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl">
                  <DropdownMenuLabel>Platforms</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilterPlatform("all")}
                    className={filterPlatform === "all" ? "bg-accent " : ""}
                  >
                    {filterPlatform === "all" && (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    All Platforms
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {platforms
                    .filter((platform) => platform.id !== "all")
                    .map((platform) => (
                      <DropdownMenuItem
                        key={platform.id}
                        onClick={() => setFilterPlatform(platform.id)}
                        className={
                          filterPlatform === platform.id ? "bg-accent" : ""
                        }
                      >
                        {filterPlatform === platform.id && (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        {platform.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-48 justify-start rounded-xl"
                    disabled={
                      allCategoriesLoading ||
                      selectedCategoriesLoading ||
                      filterPlatform === "all"
                    }
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {allCategoriesLoading || selectedCategoriesLoading
                      ? "Loading..."
                      : filterPlatform === "all"
                      ? "Select a platform "
                      : filterCategory === "all"
                      ? "All Categories"
                      : availableCategories.find((c) => c.id === filterCategory)
                          ?.name || "Select Category"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilterCategory("all")}
                    className={filterCategory === "all" ? "bg-accent" : ""}
                    disabled={filterPlatform === "all"}
                  >
                    {filterCategory === "all" && (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {availableCategories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => setFilterCategory(category.id)}
                      className={
                        filterCategory === category.id ? "bg-accent" : ""
                      }
                    >
                      {filterCategory === category.id && (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedProducts.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={productsLoading}
                >
                  {productsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 " />
                  )}
                  Delete {selectedProducts.length} items
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Products ({filteredAndSortedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedProducts.length ===
                          filteredAndSortedProducts.length &&
                        filteredAndSortedProducts.length > 0
                      }
                      onCheckedChange={toggleAllProducts}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center gap-1">
                      Price {getSortIcon("price")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("rating")}
                  >
                    <div className="flex items-center gap-1">
                      Rating {getSortIcon("rating")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("sold")}
                  >
                    <div className="flex items-center gap-1">
                      Sold {getSortIcon("sold")}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Created {getSortIcon("createdAt")}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
               <TableBody>
                 {productsLoading ? (
                   // Show skeleton rows while loading/refetching
                   Array.from({ length: 5 }).map((_, index) => (
                     <TableRow key={`skeleton-${index}`}>
                       <TableCell>
                         <Skeleton className="h-4 w-4" />
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center space-x-3">
                           <Skeleton className="h-10 w-10 rounded-xl" />
                           <div className="space-y-2">
                             <Skeleton className="h-4 w-32" />
                             <Skeleton className="h-3 w-48" />
                           </div>
                         </div>
                       </TableCell>
                       <TableCell>
                         <Skeleton className="h-4 w-16" />
                       </TableCell>
                       <TableCell>
                         <Skeleton className="h-4 w-12" />
                       </TableCell>
                       <TableCell>
                         <Skeleton className="h-4 w-14" />
                       </TableCell>
                       <TableCell>
                         <Skeleton className="h-5 w-16" />
                       </TableCell>
                       <TableCell>
                         <Skeleton className="h-4 w-20" />
                       </TableCell>
                       <TableCell>
                         <Skeleton className="h-8 w-8 rounded" />
                       </TableCell>
                     </TableRow>
                   ))
                 ) : (
                   filteredAndSortedProducts.map((product) => (
                     <TableRow key={product.id}>
                       <TableCell>
                         <Checkbox
                           checked={selectedProducts.includes(product.id)}
                           onCheckedChange={() =>
                             toggleProductSelection(product.id)
                           }
                         />
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center space-x-3">
                           <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                             {product.image ? (
                               <img
                                 src={product.image}
                                 alt={product.name}
                                 className="h-full w-full object-cover"
                               />
                             ) : (
                               <ImageIcon className="h-5 w-5 text-muted-foreground" />
                             )}
                           </div>
                           <div>
                             <p className="font-medium">{product.name}</p>
                             <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                               {product.description}
                             </p>
                           </div>
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-1">
                           <span className="font-medium">
                             ${product.price.toFixed(2)}
                           </span>
                           {product.discount > 0 && (
                             <>
                               <span className="text-sm text-muted-foreground line-through">
                                 ${product.originalPrice.toFixed(2)}
                               </span>
                               <Badge variant="secondary" className="text-xs">
                                 -{product.discount}%
                               </Badge>
                             </>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center space-x-1">
                           <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                           <span className="font-medium">{product.rating}</span>
                           <span className="text-sm text-muted-foreground">
                             ({product.reviewCount})
                           </span>
                         </div>
                       </TableCell>
                       <TableCell>
                         <span className="font-medium">
                           {product.sold.toLocaleString()}
                         </span>
                       </TableCell>
                       <TableCell>
                         <div className="flex gap-1">
                           {product.isFeatured && (
                             <Badge variant="default">Featured</Badge>
                           )}
                           {product.isNew && (
                             <Badge variant="secondary">New</Badge>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>
                         <span className="text-sm text-muted-foreground">
                           {new Date(product.createdAt).toLocaleDateString(
                             "en-US"
                           )}
                         </span>
                       </TableCell>
                       <TableCell>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button
                               variant="ghost"
                               size="sm"
                               className="rounded-xl"
                             >
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="rounded-xl">
                             <DropdownMenuItem
                               onClick={() =>
                                 router.push(
                                   `/dashboard/products/create?id={product.id}`
                                 )
                               }
                             >
                               <Edit className="h-4 w-4 mr-2" />
                               Edit
                             </DropdownMenuItem>
                             <DropdownMenuItem>
                               <Eye className="h-4 w-4 mr-2" />
                               View
                             </DropdownMenuItem>
                             <DropdownMenuItem
                               className="text-destructive"
                               onClick={() => handleDeleteProduct(product.id)}
                               disabled={productsLoading}
                             >
                               <Trash2 className="h-4 w-4 mr-2" />
                               Delete
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </TableCell>
                     </TableRow>
                   ))
                 )}
               </TableBody>
            </Table>

             {filteredAndSortedProducts.length === 0 && !productsLoading && (
               <div className="text-center py-12">
                 <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                 <h3 className="text-lg font-medium">No products found</h3>
                 <p className="text-muted-foreground mb-4">
                   {searchTerm ||
                   filterPlatform !== "all" ||
                   filterCategory !== "all"
                     ? "Try adjusting your search or filters"
                     : "Create your first product to get started"}
                 </p>
                 {!searchTerm &&
                   filterPlatform === "all" &&
                   filterCategory === "all" && (
                     <Button
                       onClick={() => router.push("/dashboard/products/create")}
                       className="gap-2 rounded-xl"
                     >
                       <Plus className="h-4 w-4" />
                       Add Product
                     </Button>
                   )}
               </div>
             )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {deleteProductId ? "Product" : `${deleteProductIds.length} Products`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteProductId ? "this product" : `these ${deleteProductIds.length} products`}? This action cannot be undone.
                {deleteProductId ? "The product" : "The products"} will be soft deleted and can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteTimer(5);
                  setDeleteProductId(null);
                  setDeleteProductIds([]);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteProductId) {
                    deleteProductMutation.mutate(deleteProductId);
                  } else if (deleteProductIds.length > 0) {
                    bulkDeleteMutation.mutate(deleteProductIds);
                  }
                }}
                disabled={deleteTimer > 0 || deleteProductMutation.isPending || bulkDeleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {(deleteProductMutation.isPending || bulkDeleteMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete {deleteTimer > 0 ? `(${deleteTimer}s)` : ""}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
