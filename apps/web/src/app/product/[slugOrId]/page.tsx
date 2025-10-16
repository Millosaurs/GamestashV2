// app/products/[slugOrId]/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  Download,
  Shield,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  ExternalLink,
  TrendingUp,
  Users,
  Zap,
  Globe,
  Gamepad2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { orpc } from "@/utils/orpc";
import { Header } from "@/components/header";
import { OverlayCard } from "@/components/overlay-card";

export default function ProductDetailPage() {
  const params = useParams();
  const slugOrId = params.slugOrId as string;

  // Treat route param as UUID id
  const productId = slugOrId;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product data
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    ...orpc.products.get.queryOptions({
      input: {
        id: productId,
      },
    }),
    staleTime: 15000,
  });

  // Fetch related products
  const { data: relatedProducts = [], isLoading: relatedLoading } = useQuery({
    ...orpc.products.related.queryOptions({
      input: {
        categoryId: product?.category || "",
        platformId: product?.platform || "",
        excludeId: product?.id,
        limit: 8,
      },
    }),
    enabled: !!product,
    staleTime: 15000,
  });

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center h-[70vh]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span>Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center h-[70vh]">
          <div className="text-center space-y-4">
            <div className="rounded-xl bg-muted p-6 mx-auto w-fit">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Product not found
            </h1>
            <p className="text-muted-foreground max-w-md">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="size-4" />
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mock images for gallery
  const mockImages = [
    product.image,
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
  ].filter(Boolean);

  const handleBuyNow = () => {
    console.log("Buy now:", product.id);
  };

  const handleDownload = () => {
    console.log("Download:", product.id);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const discountedPrice =
    product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  const mockRichContent =
    product.content ||
    `
    <h2>Product Overview</h2>
    <p>This is a comprehensive digital product designed to meet your needs. Built with modern standards and best practices in mind.</p>

    <h3>Key Features</h3>
    <ul>
      <li>Premium quality assets and components</li>
      <li>Easy to customize and implement</li>
      <li>Compatible with all modern browsers</li>
      <li>Comprehensive documentation included</li>
    </ul>

    <h3>What's Included</h3>
    <p>You'll receive everything you need to get started:</p>
    <ul>
      <li>Source files in multiple formats</li>
      <li>Complete documentation</li>
      <li>Example implementations</li>
      <li>Free updates for 1 year</li>
    </ul>

    <h3>System Requirements</h3>
    <p>Compatible with all modern development environments and platforms. No special requirements needed.</p>
  `;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20">
        {/* Navigation */}
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                Back to Market
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant={isWishlisted ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleWishlist}
                  className="gap-2"
                >
                  <Heart
                    className={`size-4 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Image Gallery Section */}
          <div className="mb-8 flex items-center">
            <Card className="overflow-hidden border-0 shadow-xl m-4  py-0">
              <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted relative overflow-hidden ">
                <img
                  src={mockImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button size="lg" className="rounded-full">
                    <Play className="size-6 fill-current" />
                  </Button>
                </div>

                {/* Badges Overlay */}
                <div className="absolute top-6 left-6 flex gap-2">
                  {product.isNew && (
                    <Badge
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      New
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                  {product.discount > 0 && (
                    <Badge variant="destructive">-{product.discount}%</Badge>
                  )}
                </div>
              </div>
            </Card>
            <div className="lg:col-span-1 w-1/3">
              <Card className="sticky top-24 py-0">
                <CardContent className="p-6 space-y-6">
                  {/* Platform & Category */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {product.platform === "websites" ? (
                      <Globe className="size-4" />
                    ) : (
                      <Gamepad2 className="size-4" />
                    )}
                    <span>{product.platformName}</span>
                    <span>•</span>
                    <span>{product.categoryName}</span>
                  </div>

                  {/* Title & Author */}
                  <div className="space-y-2 mb-2">
                    <h1 className="text-2xl font-bold text-foreground ">
                      {product.name}
                    </h1>

                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src="/api/placeholder/40/40" />
                        <AvatarFallback className="text-xs">
                          {product.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground text-sm">by</span>
                      <span className="font-medium text-sm">
                        {product.author}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3",
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-sm">
                        {product.rating}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({product.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="size-3" />
                      <span className="text-xs">{product.sold} sold</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-foreground">
                        {product.price === 0 ? "Free" : `${product.price}`}
                      </span>
                      {product.originalPrice > product.price && (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            Save ${discountedPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Buy Button */}
                    {product.price === 0 ? (
                      <Button
                        onClick={handleDownload}
                        size="lg"
                        className="w-full gap-2 text-base font-semibold"
                      >
                        <Download className="size-5" />
                        Download Now
                      </Button>
                    ) : (
                      <Button
                        onClick={handleBuyNow}
                        size="lg"
                        className="w-full gap-2 text-base font-semibold"
                      >
                        <Zap className="size-5" />
                        Buy Now
                      </Button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="size-3" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <ExternalLink className="size-3" />
                        Demo
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Product Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">
                      Product Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Updated
                        </span>
                        <span className="font-medium">
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Released</span>
                        <span className="font-medium">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="font-medium">25.4 MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground text-sm">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag, index) => (
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
          </div>

          {/* Product Info and Content */}
          <div className="gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="size-5" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Short Description */}
                  <div className="mb-6 p-4 rounded-xl bg-accent/30 border">
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Rich Text Content */}
                  <div
                    className="prose prose-slate max-w-none dark:prose-invert
                      prose-headings:text-foreground prose-headings:font-semibold
                      prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                      prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-muted-foreground prose-p:leading-relaxed
                      prose-ul:text-muted-foreground prose-li:text-muted-foreground
                      prose-strong:text-foreground prose-strong:font-semibold"
                    dangerouslySetInnerHTML={{
                      __html: mockRichContent,
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-accent/30 py-16 mt-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="size-6 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">
                  More Like This
                </h2>
              </div>

              {relatedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct, index) => {
                    const badges = [];
                    if (relatedProduct.isNew)
                      badges.push({
                        text: "New",
                        variant: "default" as const,
                        className: "bg-blue-600 text-white",
                      });
                    if (relatedProduct.isFeatured)
                      badges.push({
                        text: "Featured",
                        variant: "secondary" as const,
                      });
                    if (relatedProduct.discount > 0)
                      badges.push({
                        text: `-${relatedProduct.discount}%`,
                        variant: "destructive" as const,
                      });

                    return (
                      <OverlayCard
                        key={`${relatedProduct.id}-${index}`}
                        image={relatedProduct.image}
                        imageAlt={relatedProduct.name}
                        title={relatedProduct.name}
                        description={relatedProduct.description}
                        author={relatedProduct.author}
                        price={
                          relatedProduct.price === 0
                            ? "Free"
                            : `${relatedProduct.price}`
                        }
                        rating={relatedProduct.rating}
                        sold={relatedProduct.sold}
                        badges={badges}
                        href={`/products/${
                          relatedProduct.slug || relatedProduct.id
                        }`}
                        ctaText={
                          relatedProduct.price === 0 ? "Download" : "Buy Now"
                        }
                        className="h-fit"
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
