"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Check, AlertCircle, ImageUp } from "lucide-react";
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
import { Suspense } from "react";
import ImageUpload from "@/components/ImageUploader";
import { FileUpload } from "@/components/FileUpload";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";


interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  content: string;
  price: string;
  originalPrice: string;
  discount: number;
  platformId: string;
  categoryId: string;
  image: string;
  files: Array<{
    name: string;
    key: string;
    size: number;
    type: string;
  }>;
  isFeatured: boolean;
  isNew: boolean;
  tags: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ProductFormPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <ProductFormContent />
    </Suspense>
  );
}

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isEditMode = !!productId;
  const { data: session } = useSession();

  const [errors, setErrors] = React.useState<FormErrors>({});

  // Initialize form data
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    content: "",
    price: "",
    originalPrice: "",
    discount: 0,
    platformId: "",
    categoryId: "",
    image: "",
    files: [],
    isFeatured: false,
    isNew: false,
    tags: "",
  });

  // Fetch platforms
  const { data: platforms = [] } = useQuery({
    ...orpc.platforms.list.queryOptions(),
    staleTime: 300000, // Cache for 5 minutes
  });

  // Fetch all categories
  const { data: allCategories = [] } = useQuery({
    ...orpc.categories.list.queryOptions(),
    staleTime: 300000, // Cache for 5 minutes
  });

  // Fetch categories for selected platform
  const {
    data: selectedPlatformCategories = [],
    isLoading: selectedCategoriesLoading,
  } = useQuery({
    ...orpc.categories.byPlatform.queryOptions({
      input: { platformId: formData.platformId },
    }),
    enabled: !!formData.platformId,
    staleTime: 300000, // Cache for 5 minutes
  });

  // Get available categories based on selected platform
  const availableCategories = React.useMemo(() => {
    if (!formData.platformId) {
      return [];
    }
    return selectedPlatformCategories.filter((cat: any) => cat.id !== "all");
  }, [formData.platformId, selectedPlatformCategories]);

  // Fetch existing product if editing
  const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
    ...orpc.products.get.queryOptions({ input: { id: productId || "" } }),
    enabled: isEditMode && !!productId,
  });

  // Populate form when editing
  React.useEffect(() => {
    if (existingProduct && isEditMode) {
      setFormData({
        name: existingProduct.name || "",
        slug: existingProduct.slug || "",
        description: existingProduct.description || "",
        content: existingProduct.content || "",
        price: existingProduct.price?.toString() || "",
        originalPrice: existingProduct.originalPrice?.toString() || "",
        discount: existingProduct.discount || 0,
        platformId: existingProduct.platform || "",
        categoryId: existingProduct.category || "",
        image: existingProduct.image || "",
        files: [],
        isFeatured: existingProduct.isFeatured || false,
        isNew: existingProduct.isNew || false,
        tags: Array.isArray(existingProduct.tags) ? existingProduct.tags.join(", ") : "",
      });
    }
  }, [existingProduct, isEditMode]);

  // Create product mutation
  const createProductMutation = useMutation({
    ...orpc.products.create.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Product created successfully!", {
        description: `${data.product.name} has been added to your catalog.`,
      });
      setTimeout(() => {
        router.push("/dashboard/products");
      }, 1000);
    },
    onError: (error) => {
      toast.error("Failed to create product", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    ...orpc.products.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Product updated successfully!", {
        description: `${data.product.name} has been updated.`,
      });
      setTimeout(() => {
        router.push("/dashboard/products");
      }, 1000);
    },
    onError: (error) => {
      toast.error("Failed to update product", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

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

  // Reset category when platform changes
  React.useEffect(() => {
    if (formData.platformId) {
      setFormData((prev) => ({ ...prev, categoryId: "" }));
    }
  }, [formData.platformId]);

  // Auto-generate random slug
  React.useEffect(() => {
    if (!isEditMode && !formData.slug) {
      const randomString = Math.random().toString(36).substring(2, 15) +
                          Math.random().toString(36).substring(2, 15);
      const slug = `product-${randomString}`;
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [isEditMode, formData.slug]);

  // Calculate discount automatically
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

    if (!formData.slug?.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Short description is required";
    }

    if (!formData.content || formData.content.trim() === "" || formData.content === "<p></p>") {
      newErrors.content = "Detailed description is required";
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.originalPrice || parseFloat(formData.originalPrice) < 0) {
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

    if (!formData.image) {
      newErrors.image = "Product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Check if user is authenticated
    if (!session?.user) {
      toast.error("You must be logged in to create products");
      return;
    }

    // Get user info from Better Auth session
    const author = session.user.name || "Unknown User";
    const authorId = session.user.id;

    // Parse tags
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const productData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      content: formData.content || "",
      price: formData.price,
      originalPrice: formData.originalPrice,
      discount: formData.discount,
      platformId: formData.platformId,
      categoryId: formData.categoryId,
      image: formData.image,
      files: formData.files,
      author,
      authorId,
      tags,
      isFeatured: formData.isFeatured,
      isNew: formData.isNew,
    };

    if (isEditMode && productId) {
      updateProductMutation.mutate({
        id: productId,
        ...productData,
      });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  // Get selected platform/category name
  const getSelectedPlatformName = () => {
    const platform = platforms.find((p: any) => p.id === formData.platformId);
    return platform ? platform.name : "Select Platform";
  };

  const getSelectedCategoryName = () => {
    const category = availableCategories.find((c: any) => c.id === formData.categoryId);
    return category ? category.name : "Select Category";
  };

  // Show loading state while fetching data in edit mode
  if (isEditMode && isLoadingProduct) {
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
                        placeholder="e.g., Cyber Legends RPG Pack"
                        className={cn(
                          "mt-1.5",
                          errors.name && "border-destructive"
                        )}
                        disabled={isLoading}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Short Description */}
                    <div>
                      <Label htmlFor="description">
                        Short Description <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="e.g., A complete RPG pack with characters, items, and environments"
                        className={cn(
                          "mt-1.5",
                          errors.description && "border-destructive"
                        )}
                        disabled={isLoading}
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Brief summary of your product (max 200 characters)
                      </p>
                      {errors.description && (
                        <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Product Content - Rich Text Editor */}
                    <div>
                      <Label htmlFor="content">
                        Detailed Description{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <div className="mt-2">
                        <RichTextEditor
                          content={formData.content}
                          onChange={(content) =>
                            handleInputChange("content", content)
                          }
                          placeholder="Write a detailed description of your product..."
                          error={!!errors.content}
                        />
                      </div>
                      {errors.content && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.content}
                        </p>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div>
                      <Label htmlFor="image">
                        Product Image <span className="text-destructive">*</span>
                      </Label>
                      <div className="mt-1.5">
                        <ImageUpload
                          value={formData.image}
                          onChange={(url) => handleInputChange("image", url)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.image && (
                        <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.image}
                        </p>
                      )}
                    </div>

                    {/* File Upload */}
                    <div>
                      <Label htmlFor="files">
                        Product Files (Assets/Downloads)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload downloadable files for your product (optional)
                      </p>
                      <div className="mt-1.5">
                        <FileUpload
                          value={formData.files}
                          onChange={(files) => handleInputChange("files", files)}
                          disabled={isLoading}
                          maxFiles={5}
                        />
                      </div>
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
                            {platforms.map((platform: any) => (
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
                              disabled={!formData.platformId || selectedCategoriesLoading}
                              className={cn(
                                "w-full justify-start mt-2 rounded-xl",
                                errors.categoryId && "border-destructive"
                              )}
                            >
                              {selectedCategoriesLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Loading categories...
                                </>
                              ) : !formData.platformId ? (
                                "Select platform first"
                              ) : availableCategories.length === 0 ? (
                                "No categories available"
                              ) : (
                                getSelectedCategoryName()
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 rounded-xl">
                            <DropdownMenuLabel>
                              Select Category
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {availableCategories.length > 0 ? (
                              availableCategories.map((category: any) => (
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
                              ))
                            ) : (
                              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                No categories for this platform
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {!formData.platformId && (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Please select a platform first to see available categories
                          </p>
                        )}
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
              mockPlatforms={platforms}
              mockCategories={allCategories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
