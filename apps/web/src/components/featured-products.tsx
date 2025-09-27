// components/sections/featured-products.tsx
"use client";

import React from "react";
import { OverlayCard } from "@/components/overlay-card";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";

export function FeaturedProducts() {
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    ...orpc.products.list.queryOptions({
      input: {
        limit: 6,
        sortBy: "featured",
      },
    }),
    staleTime: 15000,
  });

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Featured Products
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our most popular digital products and services trusted by
            thousands of customers
          </p>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader2 className="animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading products...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6">
              <AlertCircle className="text-destructive" />
            </div>
            <p className="mt-4 text-destructive">Failed to load products</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const badges = [];
              if (product.isNew)
                badges.push({ text: "New", variant: "default" as const });
              if (product.isFeatured)
                badges.push({
                  text: "Featured",
                  variant: "secondary" as const,
                });
              if (product.discount > 0)
                badges.push({
                  text: `-${product.discount}%`,
                  variant: "destructive" as const,
                });

              return (
                <OverlayCard
                  key={`${product.id}-${index}`}
                  image={product.image || "/placeholder.svg"}
                  imageAlt={product.name}
                  title={product.name}
                  description={product.description}
                  author={product.author}
                  price={product.price === 0 ? "Free" : `$${product.price}`}
                  rating={product.rating}
                  sold={product.sold}
                  href={`/product/${product.slug || product.id}`}
                  badges={badges}
                />
              );
            })}
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <p className="text-center text-muted-foreground">
            No featured products found
          </p>
        )}
      </div>
    </section>
  );
}
