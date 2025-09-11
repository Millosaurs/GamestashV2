// components/ui/overlay-card.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface BadgeConfig {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

interface OverlayCardProps {
  // Image props
  image: string;
  imageAlt: string;

  // Content props
  title: string;
  description?: string;
  author?: string;
  price?: string;
  rating?: number;
  sold?: number;

  // Navigation
  href?: string;

  // Badges
  badges?: BadgeConfig[];

  // Overlay content (if you want to override the default)
  overlayContent?: React.ReactNode;

  // Styling
  className?: string;
  overlayOffset?: string;

  // Interaction
  onClick?: () => void;
  hoverEffect?: boolean;

  // CTA
  ctaText?: string;
  onCtaClick?: () => void;

  // Children for additional content
  children?: React.ReactNode;
}

export function OverlayCard({
  image,
  imageAlt,
  title,
  description,
  author,
  price,
  rating,
  sold,
  href,
  badges = [],
  overlayContent,
  className,
  overlayOffset = "-bottom-4",
  onClick,
  hoverEffect = true,
  ctaText = "View Details",
  onCtaClick,
  children,
}: OverlayCardProps) {
  const CardWrapper: any = href ? Link : "div";
  const wrapperProps = href ? { href } : onClick ? { onClick } : {};

  // Extract first sentence from description
  const getFirstSentence = (text: string) => {
    if (!text) return "";
    // Split by sentence-ending punctuation and take the first sentence
    const sentences = text.split(/[.!?]+/);
    return sentences[0].trim() + (sentences.length > 1 ? "." : "");
  };

  const renderBadge = (badge: BadgeConfig, index: number) => {
    return (
      <Badge
        key={index}
        variant={badge.variant || "default"}
        className={cn("shadow-sm", badge.className)}
      >
        {badge.text}
      </Badge>
    );
  };

  // Default overlay content structure
  const defaultOverlayContent = (
    <div className="flex items-center justify-between gap-6">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate mb-1">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mb-1">
            {getFirstSentence(description)}
          </p>
        )}
        <div className="flex items-center gap-2">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
          )}
          {author && (
            <span className="text-xs text-muted-foreground">by {author}</span>
          )}
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1">
        {price && <div className="text-lg font-bold">{price}</div>}
        {sold !== undefined && (
          <div className="text-xs text-muted-foreground">Sold: {sold}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("relative pb-6", className)}>
      <CardWrapper
        {...wrapperProps}
        className={cn("group block", (href || onClick) && "cursor-pointer")}
      >
        {/* Main Image Container - 16:9 Aspect Ratio */}
        <div className="relative aspect-video rounded-lg overflow-hidden border">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className={cn(
              "object-cover transition-transform duration-500",
              hoverEffect && "group-hover:scale-105"
            )}
          />

          {/* Top Badges */}
          {badges.length > 0 && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
              <div className="flex flex-wrap gap-2">
                {badges
                  .filter((badge) => badge.variant !== "outline")
                  .map(renderBadge)}
              </div>
              <div className="flex flex-wrap gap-2">
                {badges
                  .filter((badge) => badge.variant === "outline")
                  .map(renderBadge)}
              </div>
            </div>
          )}

          {/* Hover CTA Overlay */}
          {(href || onClick || onCtaClick) && hoverEffect && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
              <Button
                variant="secondary"
                className="shadow-lg"
                onClick={onCtaClick}
              >
                {ctaText}
              </Button>
            </div>
          )}
        </div>

        {/* Pinned Overlay Card */}
        <div className={cn("absolute left-4 right-4 z-25", overlayOffset)}>
          <Card
            className={cn(
              "transition-all duration-300",
              hoverEffect && "group-hover:shadow-xl group-hover:-translate-y-1"
            )}
          >
            <CardContent className="">
              {overlayContent || defaultOverlayContent}
              {children}
            </CardContent>
          </Card>
        </div>
      </CardWrapper>
    </div>
  );
}
