"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ProductPreview } from "@/components/product-preview";
import { cn } from "@/lib/utils";

// Mock data - would come from API in production
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

// Mock product for editing (in production, fetch from API using productId)
const mockProduct = {
  id: "1",
  name: "Cyber Legends",
  description:
    "<p>A futuristic RPG set in a cyberpunk world with immersive storytelling.</p>",
  price: "29.99",
  originalPrice: "39.99",
  discount: 25,
  platformId: "steam",
  categoryId: "rpg",
  image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
  isFeatured: true,
  isNew: false,
  tags: "cyberpunk, rpg, story-rich",
};

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: number;
  platformId: string;
  categoryId: string;
  image: string;
  isFeatured: boolean;
  isNew: boolean;
  tags: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ProductFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id"); // Get product ID from URL for editing
  const isEditMode = !!productId;

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isDataLoading, setIsDataLoading] = React.useState(isEditMode);

  // Initialize form data - empty for create, populated for edit
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: 0,
    platformId: "",
    categoryId: "",
    image: "",
    isFeatured: false,
    isNew: false,
    tags: "",
  });

  // Load product data if in edit mode
  React.useEffect(() => {
    if (isEditMode && productId) {
      // Simulate API call to fetch product data
      setIsDataLoading(true);
      setTimeout(() => {
        // In production: const data = await fetch(`/api/products/${productId}`)
        setFormData(mockProduct);
        setIsDataLoading(false);
      }, 500);
    }
  }, [isEditMode, productId]);

  // Handle input changes
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Calculate discount automatically when prices change
  React.useEffect(() => {
    if (formData.price && formData.originalPrice) {
      const price = parseFloat(formData.price);
      const originalPrice = parseFloat(formData.originalPrice);
      if (price > 0 && originalPrice > 0 && originalPrice > price) {
        const calculatedDiscount = Math.round(
          ((originalPrice - price) / originalPrice) * 100
        );
        setFormData((prev) => ({ ...prev, discount: calculatedDiscount }));
      } else if (price >= originalPrice) {
        setFormData((prev) => ({ ...prev, discount: 0 }));
      }
    }
  }, [formData.price, formData.originalPrice]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim() || formData.description === "<p></p>") {
      newErrors.description = "Product description is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      newErrors.originalPrice = "Valid original price is required";
    }

    if (formData.price && formData.originalPrice) {
      const price = parseFloat(formData.price);
      const originalPrice = parseFloat(formData.originalPrice);
      if (price > originalPrice) {
        newErrors.price = "Price cannot be greater than original price";
      }
    }

    if (!formData.platformId) {
      newErrors.platformId = "Platform selection is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category selection is required";
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = "Please enter a valid image URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production, you would make an actual API call:
      // if (isEditMode) {
      //   await fetch(`/api/products/${productId}`, {
      //     method: 'PUT',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(formData),
      //   });
      // } else {
      //   await fetch('/api/products', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(formData),
      //   });
      // }

      setIsSaved(true);

      // Redirect to products page after a short delay
      setTimeout(() => {
        router.push("/dashboard/products");
      }, 1500);
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} product:`,
        error
      );
      setErrors({
        submit: `Failed to ${
          isEditMode ? "update" : "create"
        } product. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected platform/category name
  const getSelectedPlatformName = () => {
    const platform = mockPlatforms.find((p) => p.id === formData.platformId);
    return platform ? platform.name : "Select Platform";
  };

  const getSelectedCategoryName = () => {
    const category = mockCategories.find((c) => c.id === formData.categoryId);
    return category ? category.name : "Select Category";
  };

  // Show loading state while fetching data in edit mode
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-9xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/products">
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-muted-foreground hover:text-foreground -ml-4 rounded-xl mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? "Edit Product" : "Create New Product"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditMode
                  ? "Update your product details"
                  : "Add a new product to your catalog"}
              </p>
            </div>

            {isSaved && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                Product {isEditMode ? "updated" : "created"} successfully!
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Essential details about your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Name */}
                    <div>
                      <Label htmlFor="name">
                        Product Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter product name"
                        className={cn(
                          "rounded-xl mt-2",
                          errors.name && "border-destructive"
                        )}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Product Description - Rich Text Editor */}
                    <div>
                      <Label htmlFor="description">
                        Product Description{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <div className="mt-2">
                        <RichTextEditor
                          content={formData.description}
                          onChange={(content) =>
                            handleInputChange("description", content)
                          }
                          placeholder="Write a detailed description of your product..."
                          error={!!errors.description}
                        />
                      </div>
                      {errors.description && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Image URL */}
                    <div>
                      <Label htmlFor="image">Product Image URL</Label>
                      <Input
                        id="image"
                        type="url"
                        value={formData.image}
                        onChange={(e) =>
                          handleInputChange("image", e.target.value)
                        }
                        placeholder="https://example.com/image.jpg"
                        className={cn(
                          "rounded-xl mt-2",
                          errors.image && "border-destructive"
                        )}
                      />
                      {errors.image && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.image}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                    <CardDescription>
                      Set your product pricing and discounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Price */}
                      <div>
                        <Label htmlFor="price">
                          Current Price ($){" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          placeholder="0.00"
                          className={cn(
                            "rounded-xl mt-2",
                            errors.price && "border-destructive"
                          )}
                        />
                        {errors.price && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.price}
                          </p>
                        )}
                      </div>

                      {/* Original Price */}
                      <div>
                        <Label htmlFor="originalPrice">
                          Original Price ($){" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.originalPrice}
                          onChange={(e) =>
                            handleInputChange("originalPrice", e.target.value)
                          }
                          placeholder="0.00"
                          className={cn(
                            "rounded-xl mt-2",
                            errors.originalPrice && "border-destructive"
                          )}
                        />
                        {errors.originalPrice && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.originalPrice}
                          </p>
                        )}
                      </div>

                      {/* Discount (Auto-calculated) */}
                      <div>
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={formData.discount}
                          readOnly
                          className="rounded-xl mt-2 bg-muted"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Auto-calculated from prices
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Classification */}
                <Card>
                  <CardHeader>
                    <CardTitle>Classification</CardTitle>
                    <CardDescription>
                      Categorize your product for better discovery
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Platform */}
                      <div>
                        <Label htmlFor="platformId">
                          Platform <span className="text-destructive">*</span>
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start mt-2 rounded-xl",
                                errors.platformId && "border-destructive"
                              )}
                            >
                              {getSelectedPlatformName()}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 rounded-xl">
                            <DropdownMenuLabel>
                              Select Platform
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {mockPlatforms.map((platform) => (
                              <DropdownMenuItem
                                key={platform.id}
                                onClick={() =>
                                  handleInputChange("platformId", platform.id)
                                }
                                className={
                                  formData.platformId === platform.id
                                    ? "bg-accent"
                                    : ""
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
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.platformId}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <Label htmlFor="categoryId">
                          Category <span className="text-destructive">*</span>
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start mt-2 rounded-xl",
                                errors.categoryId && "border-destructive"
                              )}
                            >
                              {getSelectedCategoryName()}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 rounded-xl">
                            <DropdownMenuLabel>
                              Select Category
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {mockCategories.map((category) => (
                              <DropdownMenuItem
                                key={category.id}
                                onClick={() =>
                                  handleInputChange("categoryId", category.id)
                                }
                                className={
                                  formData.categoryId === category.id
                                    ? "bg-accent"
                                    : ""
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
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.categoryId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) =>
                          handleInputChange("tags", e.target.value)
                        }
                        placeholder="action, adventure, multiplayer"
                        className="rounded-xl mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate tags with commas for better searchability
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Options */}
                {/* <Card>
                  <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                    <CardDescription>
                      Set visibility and promotional options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) =>
                          handleInputChange("isFeatured", checked === true)
                        }
                      />
                      <Label
                        htmlFor="isFeatured"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Featured Product
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Display this product prominently on the homepage
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isNew"
                        checked={formData.isNew}
                        onCheckedChange={(checked) =>
                          handleInputChange("isNew", checked === true)
                        }
                      />
                      <Label
                        htmlFor="isNew"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        New Product
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Mark this product with a "New" badge
                    </p>
                  </CardContent>
                </Card> */}

                {/* Submit Error */}
                {errors.submit && (
                  <Card className="border-destructive">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <p>{errors.submit}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card className="bg-background border-0 ">
                  <CardContent className="py-0 ">
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/products")}
                        disabled={isLoading}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-xl"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {isEditMode ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? "Update Product" : "Create Product"}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="xl:sticky xl:top-6 xl:h-fit">
            <ProductPreview
              formData={formData}
              mockPlatforms={mockPlatforms}
              mockCategories={mockCategories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
