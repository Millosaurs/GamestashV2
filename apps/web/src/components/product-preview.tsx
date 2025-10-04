// components/product-preview.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Download,
  Zap,
  Globe,
  Gamepad2,
  Users,
  Award,
  Eye,
} from "lucide-react";

interface ProductPreviewProps {
  formData: {
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
  };
  mockPlatforms: Array<{ id: string; name: string }>;
  mockCategories: Array<{ id: string; name: string }>;
  className?: string;
}

export function ProductPreview({
  formData,
  mockPlatforms,
  mockCategories,
  className,
}: ProductPreviewProps) {
  // Helper functions to get names from IDs
  const getPlatformName = () => {
    const platform = mockPlatforms.find((p) => p.id === formData.platformId);
    return platform ? platform.name : "Select Platform";
  };

  const getCategoryName = () => {
    const category = mockCategories.find((c) => c.id === formData.categoryId);
    return category ? category.name : "Select Category";
  };

  // Calculate derived values
  const currentPrice = parseFloat(formData.price) || 0;
  const originalPrice = parseFloat(formData.originalPrice) || 0;
  const discountedPrice =
    originalPrice > currentPrice ? originalPrice - currentPrice : 0;
  const isFree = currentPrice === 0;

  // Parse tags
  const tags = formData.tags
    ? formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
    : [];

  // Check if image URL is valid
  const isValidImage = formData.image && formData.image.startsWith("http");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Preview Header */}
      {/* <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Live Preview</h2>
        <p className="text-sm text-muted-foreground">
          See how your product will appear to users
        </p>
      </div> */}

      {/* Main Preview Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Image Section */}
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="aspect-video bg-muted/50 relative overflow-hidden ">
              {isValidImage ? (
                <img
                  src={formData.image}
                  alt={formData.name || "Product preview"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                      <Eye className="size-6" />
                    </div>
                    <p className="text-sm">Add an image URL to see preview</p>
                  </div>
                </div>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex gap-2">
                {formData.isNew && (
                  <Badge
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    New
                  </Badge>
                )}
                {formData.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
                {formData.discount > 0 && (
                  <Badge variant="destructive">-{formData.discount}%</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Info Sidebar */}
        <Card>
          <CardContent className="py-0 space-y-6">
            {/* Platform & Category */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {formData.platformId === "websites" ? (
                <Globe className="size-4" />
              ) : (
                <Gamepad2 className="size-4" />
              )}
              <span>{getPlatformName()}</span>
              <span>•</span>
              <span>{getCategoryName()}</span>
            </div>

            {/* Title & Author */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {formData.name || "Your Product Name"}
              </h1>
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                    Y
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">by</span>
                <span className="text-sm font-medium">You</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3",
                        i < 4 // Default 4-star rating for preview
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">4.0</span>
                <span className="text-xs text-muted-foreground">
                  (0 reviews)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="size-3" />
                <span>0 sold</span>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {isFree ? "Free" : `$${currentPrice.toFixed(2)}`}
                </span>
                {originalPrice > currentPrice && currentPrice > 0 && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      Save ${discountedPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button size="lg" className="w-full gap-2 font-semibold">
                {isFree ? (
                  <>
                    <Download className="size-4" />
                    Download Now
                  </>
                ) : (
                  <>
                    <Zap className="size-4" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Product Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">
                Product Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">Just now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Released</span>
                  <span className="font-medium">Just now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium">{getPlatformName()}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Short Description */}
          {formData.description && formData.description !== "<p></p>" ? (
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: formData.description,
              }}
            />
          ) : (
            <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
              <p className="text-sm text-muted-foreground text-center">
                Product description will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
