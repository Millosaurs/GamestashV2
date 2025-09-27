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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import Link from "next/link";

// Types based on your schema
interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: number;
  platformId: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  sold: number;
  image?: string;
  author: string;
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

// Mock data
const mockPlatforms = [
  { id: "steam", name: "Steam" },
  { id: "epic", name: "Epic Games" },
  { id: "gog", name: "GOG" },
  { id: "itch", name: "itch.io" },
  { id: "origin", name: "Origin" },
];

const mockCategories = [
  { id: "action", name: "Action" },
  { id: "adventure", name: "Adventure" },
  { id: "rpg", name: "RPG" },
  { id: "strategy", name: "Strategy" },
  { id: "simulation", name: "Simulation" },
  { id: "puzzle", name: "Puzzle" },
  { id: "racing", name: "Racing" },
  { id: "sports", name: "Sports" },
];

const mockProducts: Product[] = [
  {
    id: 1,
    slug: "cyber-legends",
    name: "Cyber Legends",
    description:
      "A futuristic RPG set in a cyberpunk world with immersive storytelling.",
    price: "29.99",
    originalPrice: "39.99",
    discount: 25,
    platformId: "steam",
    categoryId: "rpg",
    rating: 4.5,
    reviewCount: 1250,
    sold: 5420,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
    author: "John Developer",
    isFeatured: true,
    isNew: false,
    tags: ["cyberpunk", "rpg", "story-rich"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-09-20T14:30:00Z",
  },
  {
    id: 2,
    slug: "space-explorer",
    name: "Space Explorer",
    description: "Explore vast galaxies and build your own space empire.",
    price: "19.99",
    originalPrice: "19.99",
    discount: 0,
    platformId: "steam",
    categoryId: "strategy",
    rating: 4.2,
    reviewCount: 890,
    sold: 3210,
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400",
    author: "John Developer",
    isFeatured: false,
    isNew: true,
    tags: ["space", "strategy", "building"],
    createdAt: "2024-08-20T10:00:00Z",
    updatedAt: "2024-09-25T16:45:00Z",
  },
  {
    id: 3,
    slug: "puzzle-master",
    name: "Puzzle Master",
    description: "Challenge your mind with hundreds of unique puzzles.",
    price: "9.99",
    originalPrice: "14.99",
    discount: 33,
    platformId: "mobile",
    categoryId: "puzzle",
    rating: 4.7,
    reviewCount: 2340,
    sold: 8750,
    image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400",
    author: "John Developer",
    isFeatured: false,
    isNew: false,
    tags: ["puzzle", "brain-teaser", "casual"],
    createdAt: "2023-12-10T10:00:00Z",
    updatedAt: "2024-09-15T12:20:00Z",
  },
];

type SortField = "name" | "price" | "rating" | "sold" | "createdAt";
type SortDirection = "asc" | "desc";

export default function DeveloperProductsDashboard() {
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterPlatform, setFilterPlatform] = React.useState<string>("all");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = React.useState(false);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform =
        filterPlatform === "all" || product.platformId === filterPlatform;
      const matchesCategory =
        filterCategory === "all" || product.categoryId === filterCategory;

      return matchesSearch && matchesPlatform && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "price") {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
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

  const handleCreateProduct = async (formData: ProductFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newProduct: Product = {
      id: Math.max(...products.map((p) => p.id)) + 1,
      slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
      author: "John Developer", // This would come from the authenticated user
      rating: 0,
      reviewCount: 0,
      sold: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...formData,
    };

    setProducts([...products, newProduct]);
    setIsCreateModalOpen(false);
    setIsLoading(false);
  };

  const handleEditProduct = async (formData: ProductFormData) => {
    if (!editingProduct) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedProducts = products.map((product) =>
      product.id === editingProduct.id
        ? { ...product, ...formData, updatedAt: new Date().toISOString() }
        : product
    );

    setProducts(updatedProducts);
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setIsLoading(false);
  };

  const handleDeleteProduct = async (productId: number) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setProducts(products.filter((p) => p.id !== productId));
    setIsLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProducts(products.filter((p) => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
    setIsLoading(false);
  };

  const toggleProductSelection = (productId: number) => {
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
    (sum, product) => sum + parseFloat(product.price) * product.sold,
    0
  );
  const totalSold = products.reduce((sum, product) => sum + product.sold, 0);
  const averageRating =
    products.length > 0
      ? products.reduce((sum, product) => sum + product.rating, 0) /
        products.length
      : 0;

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
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
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
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {filterPlatform === "all"
                      ? "All Platforms"
                      : mockPlatforms.find((p) => p.id === filterPlatform)
                          ?.name || "Select Platform"}
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
                  {mockPlatforms.map((platform) => (
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
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {filterCategory === "all"
                      ? "All Categories"
                      : mockCategories.find((c) => c.id === filterCategory)
                          ?.name || "Select Category"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilterCategory("all")}
                    className={filterCategory === "all" ? "bg-accent" : ""}
                  >
                    {filterCategory === "all" && (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {mockCategories.map((category) => (
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete ({selectedProducts.length})
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
                {filteredAndSortedProducts.map((product) => (
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
                        <span className="font-medium">${product.price}</span>
                        {product.discount > 0 && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
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
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditModalOpen(true);
                            }}
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
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAndSortedProducts.length === 0 && (
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
                      onClick={() => setIsCreateModalOpen(true)}
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Product Modal */}
        <ProductModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProduct}
          title="Create New Product"
          isLoading={isLoading}
        />

        {/* Edit Product Modal */}
        {editingProduct && (
          <ProductModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingProduct(null);
            }}
            onSubmit={handleEditProduct}
            title="Edit Product"
            initialData={editingProduct}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

// Product Modal Component
function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  title: string;
  initialData?: Product;
  isLoading?: boolean;
}) {
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    originalPrice: initialData?.originalPrice || "",
    discount: initialData?.discount || 0,
    platformId: initialData?.platformId || "none",
    categoryId: initialData?.categoryId || "none",
    image: initialData?.image || "",
    isFeatured: initialData?.isFeatured || false,
    isNew: initialData?.isNew || false,
    tags: initialData?.tags || [],
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0)
      newErrors.originalPrice = "Valid original price is required";
    if (!formData.platformId || formData.platformId === "none")
      newErrors.platformId = "Platform selection is required";
    if (!formData.categoryId || formData.categoryId === "none")
      newErrors.categoryId = "Category selection is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill in the details for your product. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                className={
                  errors.name ? "border-destructive" : "rounded-xl my-2"
                }
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your product"
                rows={3}
                className={
                  errors.description ? "border-destructive" : "rounded-xl my-2"
                }
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                className={
                  errors.price ? "border-destructive" : "rounded-xl my-2"
                }
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="originalPrice">Original Price ($) *</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) =>
                  handleInputChange("originalPrice", e.target.value)
                }
                placeholder="0.00"
                className={
                  errors.originalPrice
                    ? "border-destructive"
                    : "rounded-xl my-2"
                }
              />
              {errors.originalPrice && (
                <p className="text-sm text-destructive mt-1">
                  {errors.originalPrice}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) =>
                  handleInputChange("discount", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className="rounded-xl my-2"
              />
            </div>

            <div>
              <Label htmlFor="platformId">Platform *</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${
                      errors.platformId
                        ? "border-destructive"
                        : "rounded-xl my-2"
                    }`}
                  >
                    {formData.platformId
                      ? mockPlatforms.find((p) => p.id === formData.platformId)
                          ?.name || "Select Platform"
                      : "Select Platform"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl">
                  <DropdownMenuLabel>Select Platform</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {mockPlatforms.map((platform) => (
                    <DropdownMenuItem
                      key={platform.id}
                      onClick={() =>
                        handleInputChange("platformId", platform.id)
                      }
                      className={
                        formData.platformId === platform.id ? "bg-accent" : ""
                      }
                    >
                      {formData.platformId === platform.id && (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {platform.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.platformId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.platformId}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${
                      errors.categoryId
                        ? "border-destructive"
                        : "rounded-xl my-2"
                    }`}
                  >
                    {formData.categoryId
                      ? mockCategories.find((c) => c.id === formData.categoryId)
                          ?.name || "Select Category"
                      : "Select Category"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl">
                  <DropdownMenuLabel>Select Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {mockCategories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() =>
                        handleInputChange("categoryId", category.id)
                      }
                      className={
                        formData.categoryId === category.id ? "bg-accent" : ""
                      }
                    >
                      {formData.categoryId === category.id && (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.categoryId}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="image">Product Image URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="rounded-xl my-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) =>
                  handleInputChange(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="action, adventure, multiplayer"
                className="rounded-xl mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl "
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl ">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {initialData ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
