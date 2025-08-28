// components/ui/category-card.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategoryCardProps {
  // Image props
  image: string;
  imageAlt: string;

  // Content props
  title: string;
  description?: string;
  itemCount?: number;

  // Navigation
  href?: string;

  // Styling
  className?: string;

  // Interaction
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function CategoryCard({
  image,
  imageAlt,
  title,
  description,
  itemCount,
  href,
  className,
  onClick,
  hoverEffect = true,
}: CategoryCardProps) {
  const CardWrapper: any = href ? Link : "div";
  const wrapperProps = href ? { href } : onClick ? { onClick } : {};

  return (
    <CardWrapper
      {...wrapperProps}
      className={cn(
        "group block",
        (href || onClick) && "cursor-pointer",
        className
      )}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/50 py-0",
          hoverEffect &&
            "transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2"
        )}
      >
        {/* Background Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className={cn(
              "object-cover transition-transform duration-700",
              hoverEffect && "group-hover:scale-110"
            )}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Item Count Badge */}
          {itemCount !== undefined && (
            <div className="absolute top-4 right-4 z-10">
              <Badge
                variant="secondary"
                className="bg-white/90 text-gray-900 font-semibold"
              >
                {itemCount}+ items
              </Badge>
            </div>
          )}

          {/* Overlayed Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
            <div
              className={cn(
                "transform transition-all duration-500",
                hoverEffect && "group-hover:translate-y-0 translate-y-2"
              )}
            >
              <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">
                {title}
              </h3>
              {description && (
                <p className="text-white/90 text-sm leading-relaxed drop-shadow-md">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Hover Effect Overlay */}
          {hoverEffect && (
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-5" />
          )}
        </div>
      </Card>
    </CardWrapper>
  );
}
