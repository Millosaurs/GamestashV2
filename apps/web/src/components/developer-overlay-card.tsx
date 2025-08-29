// components/ui/developer-overlay-card.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, ExternalLink, Verified } from "lucide-react";

interface DeveloperBadgeConfig {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

interface DeveloperOverlayCardProps {
  // Developer data
  developer: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    location?: string;
    joinedDate: string;
    rating: number;
    totalProjects: number;
    totalSales?: number;
    specialties: string[];
    isVerified?: boolean;
    isFeatured?: boolean;
  };

  // Background/Cover image
  coverImage?: string;
  coverImageAlt?: string;

  // Navigation
  href?: string;

  // Badges (for additional custom badges)
  badges?: DeveloperBadgeConfig[];

  // Overlay content override
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

  // Display options
  showStats?: boolean;
  showSpecialties?: boolean;
  maxSpecialties?: number;

  // Children for additional content
  children?: React.ReactNode;
}

export function DeveloperOverlayCard({
  developer,
  coverImage,
  coverImageAlt,
  href = `/developers/${developer.username}`,
  badges = [],
  overlayContent,
  className,
  overlayOffset = "-bottom-6",
  onClick,
  hoverEffect = true,
  ctaText = "View Profile",
  onCtaClick,
  showStats = true,
  showSpecialties = true,
  maxSpecialties = 3,
  children,
}: DeveloperOverlayCardProps) {
  const CardWrapper: any = href ? Link : "div";
  const wrapperProps = href ? { href } : onClick ? { onClick } : {};

  // Generate cover image if not provided (gradient based on name)
  const generateGradient = (name: string) => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-blue-600",
      "from-purple-500 to-pink-600",
      "from-orange-500 to-red-600",
      "from-teal-500 to-green-600",
      "from-indigo-500 to-purple-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const renderBadge = (badge: DeveloperBadgeConfig, index: number) => {
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

  // Get first sentence from bio
  const getFirstSentence = (text: string) => {
    if (!text) return "";
    const sentences = text.split(/[.!?]+/);
    return sentences[0].trim() + (sentences.length > 1 ? "." : "");
  };

  // Default overlay content for developers
  const defaultOverlayContent = (
    <div className="space-y-4">
      {/* Developer Header */}
      <div className="flex items-start gap-3">
        <Avatar className="size-12 border-2 border-background shadow-sm">
          <AvatarImage src={developer.avatar} alt={developer.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
            {developer.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{developer.name}</h3>
            {developer.isVerified && (
              <Verified className="size-3 text-blue-500 fill-current" />
            )}
            {developer.isFeatured && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                Featured
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            @{developer.username}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {getFirstSentence(developer.bio)}
          </p>
        </div>
      </div>

      {/* Specialties */}
      {showSpecialties && developer.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {developer.specialties.slice(0, maxSpecialties).map((specialty) => (
            <Badge
              key={specialty}
              variant="outline"
              className="text-xs px-2 py-0.5"
            >
              {specialty}
            </Badge>
          ))}
          {developer.specialties.length > maxSpecialties && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{developer.specialties.length - maxSpecialties}
            </Badge>
          )}
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="size-3 text-yellow-500 fill-current" />
              <span className="font-medium">{developer.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{developer.totalProjects}</span>
              <span className="text-muted-foreground">projects</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            {developer.location && (
              <div className="flex items-center gap-1">
                <MapPin className="size-3" />
                <span>{developer.location}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("relative pb-8", className)}>
      <CardWrapper
        {...wrapperProps}
        className={cn("group block", (href || onClick) && "cursor-pointer")}
      >
        {/* Cover Image/Background */}
        <div className="relative aspect-video rounded-lg overflow-hidden border">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={coverImageAlt || `${developer.name}'s cover`}
              fill
              className={cn(
                "object-cover transition-transform duration-500",
                hoverEffect && "group-hover:scale-105"
              )}
            />
          ) : (
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br transition-transform duration-500",
                generateGradient(developer.name),
                hoverEffect && "group-hover:scale-105"
              )}
            />
          )}

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div className="flex flex-wrap gap-2">
              {developer.isFeatured && (
                <Badge variant="default" className="shadow-sm">
                  Featured
                </Badge>
              )}
              {badges
                .filter((badge) => badge.variant !== "outline")
                .map(renderBadge)}
            </div>
            <div className="flex flex-wrap gap-2">
              {developer.isVerified && (
                <Badge
                  variant="outline"
                  className="shadow-sm bg-background/80 backdrop-blur-sm"
                >
                  <Verified className="size-3 mr-1" />
                  Verified
                </Badge>
              )}
              {badges
                .filter((badge) => badge.variant === "outline")
                .map(renderBadge)}
            </div>
          </div>

          {/* Join Date Overlay */}
          <div className="absolute bottom-4 right-4 z-10">
            <Badge
              variant="outline"
              className="shadow-sm bg-background/80 backdrop-blur-sm text-xs"
            >
              <Calendar className="size-3 mr-1" />
              Joined {developer.joinedDate}
            </Badge>
          </div>

          {/* Hover CTA Overlay */}
          {(href || onClick || onCtaClick) && hoverEffect && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
              <Button
                variant="secondary"
                className="shadow-lg"
                onClick={onCtaClick}
              >
                <ExternalLink className="size-4 mr-2" />
                {ctaText}
              </Button>
            </div>
          )}
        </div>

        {/* Pinned Overlay Card */}
        <div className={cn("absolute left-4 right-4 z-30", overlayOffset)}>
          <Card
            className={cn(
              "transition-all duration-300 shadow-lg",
              hoverEffect && "group-hover:shadow-xl group-hover:-translate-y-1"
            )}
          >
            <CardContent className="p-4">
              {overlayContent || defaultOverlayContent}
              {children}
            </CardContent>
          </Card>
        </div>
      </CardWrapper>
    </div>
  );
}
