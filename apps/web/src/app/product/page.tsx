"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Download,
  Shield,
  Award,
  Calendar,
  Eye,
  Tag,
  Gamepad2,
  Globe,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  ExternalLink,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { orpc } from "@/utils/orpc";
import { Header } from "@/components/header";
import { OverlayCard } from "@/components/overlay-card";

interface ProductPageProps {
  productId?: string;
  productSlug?: string;
}

export default function ProductPage({
  productId = "1",
  productSlug,
}: ProductPageProps) {
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
        slug: productSlug,
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
            <div className="rounded-full bg-muted p-6 mx-auto w-fit">
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

  const handleAddToCart = () => {
    console.log("Added to cart:", product.id);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 py-12">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
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
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="size-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Image Gallery */}
              <div className="lg:col-span-7">
                <div className="space-y-6">
                  {/* Main Image */}
                  <Card className="overflow-hidden border-0 shadow-xl">
                    <div className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted relative overflow-hidden">
                      <img
                        src={mockImages[selectedImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <Button size="lg" className="rounded-full">
                          <Play className="size-6 fill-current" />
                        </Button>
                      </div>

                      {/* Badges Overlay */}
                      <div className="absolute top-4 left-4 flex gap-2">
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
                          <Badge variant="destructive">
                            -{product.discount}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Thumbnail Grid */}
                  {mockImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-4">
                      {mockImages.map((image, index) => (
                        <Card
                          key={index}
                          className={cn(
                            "cursor-pointer overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                            selectedImageIndex === index
                              ? "border-primary shadow-lg"
                              : "border-transparent hover:border-border"
                          )}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <div className="aspect-square">
                            <img
                              src={image}
                              alt={`${product.name} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="lg:col-span-5">
                <div className="space-y-8">
                  {/* Header */}
                  <div className="space-y-4">
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

                    <h1 className="text-4xl font-bold text-foreground leading-tight">
                      {product.name}
                    </h1>

                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src="/api/placeholder/40/40" />
                        <AvatarFallback className="text-xs">
                          {product.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">by</span>
                      <span className="font-medium">{product.author}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-4",
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{product.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({product.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="size-4" />
                      <span className="text-sm">{product.sold} sold</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-baseline gap-4">
                          <span className="text-4xl font-bold text-foreground">
                            {product.price === 0 ? "Free" : `$${product.price}`}
                          </span>
                          {product.originalPrice > product.price && (
                            <div className="flex flex-col">
                              <span className="text-lg text-muted-foreground line-through">
                                ${product.originalPrice}
                              </span>
                              <span className="text-sm text-green-600 font-medium">
                                Save ${discountedPrice.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
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
                              onClick={handleAddToCart}
                              size="lg"
                              className="w-full gap-2 text-base font-semibold"
                            >
                              <ShoppingCart className="size-5" />
                              Add to Cart
                            </Button>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="gap-2">
                              <Eye className="size-4" />
                              Preview
                            </Button>
                            <Button variant="outline" className="gap-2">
                              <ExternalLink className="size-4" />
                              Demo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
                      <Shield className="size-5 text-green-600" />
                      <span className="text-sm font-medium">
                        Secure Purchase Protected
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
                      <CheckCircle2 className="size-5 text-blue-600" />
                      <span className="text-sm font-medium">
                        Instant Access After Purchase
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container mx-auto px-4 py-16">
          <Tabs defaultValue="description" className="space-y-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="size-5" />
                    About This Product
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {product.description}
                  </p>
                </CardContent>
              </Card>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {product.platform === "websites" ? (
                            <Globe className="size-4 text-muted-foreground" />
                          ) : (
                            <Gamepad2 className="size-4 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            Platform
                          </span>
                        </div>
                        <p className="font-medium">{product.platformName}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="size-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Category
                          </span>
                        </div>
                        <p className="font-medium">{product.categoryName}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Last Updated
                          </span>
                        </div>
                        <p className="font-medium">
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="size-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Released
                          </span>
                        </div>
                        <p className="font-medium">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="size-12 mx-auto mb-4 opacity-50" />
                    <p>Reviews feature coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-accent/30 py-16">
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
                            : `$${relatedProduct.price}`
                        }
                        rating={relatedProduct.rating}
                        sold={relatedProduct.sold}
                        badges={badges}
                        href={`/products/${
                          relatedProduct.slug || relatedProduct.id
                        }`}
                        ctaText={
                          relatedProduct.price === 0
                            ? "Download"
                            : "Add to Cart"
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
