import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Calendar } from "lucide-react";

const developerCardVariants = cva("relative pb-6", {
  variants: {
    variant: {
      default: "",
      featured: "",
    },
    size: {
      default: "",
      compact: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface Developer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location?: string;
  banner: string;
  joinedDate: string;
  rating: number;
  totalProjects: number;
  totalSales: number;
  specialties: string[];
  isVerified?: boolean;
  isFeatured?: boolean;
}

interface DeveloperCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof developerCardVariants> {
  developer: Developer;
  showStats?: boolean;
  hoverEffect?: boolean;
}

export function DeveloperCard({
  developer,
  variant,
  size,
  showStats = true,
  hoverEffect = true,
  className,
  ...props
}: DeveloperCardProps) {
  // Get first sentence from bio
  const getFirstSentence = (text: string) => {
    if (!text) return "";
    const sentences = text.split(/[.!?]+/);
    const first = sentences[0].trim() + (sentences.length > 1 ? "." : "");
    return first.length > 50 ? first.slice(0, 50).trimEnd() + "…" : first;
  };

  // Create badges array from specialties and status
  const badges = [
    // Status badges (top-left)
    ...(developer.isFeatured
      ? [{ text: "Featured", variant: "default" as const }]
      : []),
    ...(developer.isVerified
      ? [{ text: "Verified", variant: "secondary" as const }]
      : []),
    // Specialty badges (top-right)
    ...developer.specialties.slice(0, 2).map((specialty) => ({
      text: specialty,
      variant: "outline" as const,
    })),
  ];

  return (
    <div
      className={cn(developerCardVariants({ variant, size, className }))}
      {...props}
    >
      <Link
        href={`/developers/${developer.username}`}
        className="group block cursor-pointer"
      >
        {/* Main Image Container - 16:9 Aspect Ratio */}
        <div className="relative aspect-video rounded-lg overflow-hidden border">
          {/* Banner Image */}
          <Image
            src={developer.banner}
            alt={`${developer.name} banner`}
            fill
            className="object-cover"
          />

          {/* Large Avatar in Center */}
          <div className="absolute inset-0 flex items-center justify-center bottom-36">
            <div className="relative">
              {developer.avatar && developer.avatar !== "/placeholder.svg" ? (
                <Image
                  src={developer.avatar}
                  alt={developer.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-background shadow-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {developer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}

              {/* Verification badge on avatar */}
              {developer.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Top Badges */}
          {badges.length > 0 && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
              <div className="flex flex-wrap gap-2">
                {badges
                  .filter((badge) => badge.variant !== "outline")
                  .map((badge, index) => (
                    <Badge
                      key={index}
                      variant={badge.variant}
                      className="shadow-sm text-xs"
                    >
                      {badge.text}
                    </Badge>
                  ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {badges
                  .filter((badge) => badge.variant === "outline")
                  .map((badge, index) => (
                    <Badge
                      key={index}
                      variant={badge.variant}
                      className="shadow-sm text-xs"
                    >
                      {badge.text}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          {hoverEffect && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
              <div className="text-white text-center">
                <div className="text-lg font-semibold mb-1">View Profile</div>
                <div className="text-sm opacity-90">@{developer.username}</div>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Overlay Card */}
        <div className="absolute left-4 right-4 -bottom-20 z-30 ">
          <Card
            className={cn(
              "transition-all duration-300",
              hoverEffect && "group-hover:shadow-xl group-hover:-translate-y-1"
            )}
          >
            <CardContent className="">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate mb-1">
                    {developer.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 truncate">
                    {developer.bio}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-3 text-xs">
                    {showStats && (
                      <>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {developer.rating}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {developer.totalProjects} projects
                        </div>
                      </>
                    )}
                    {developer.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{developer.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-lg font-bold">
                    ${(developer.totalSales / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Sales
                  </div>
                </div>
              </div>

              {/* Additional specialties */}
              {developer.specialties.length > 2 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/50">
                  {developer.specialties.slice(2, 5).map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                  {developer.specialties.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{developer.specialties.length - 5}
                    </Badge>
                  )}
                </div>
              )}

              {/* Join date */}
              <div className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Joined {developer.joinedDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Link>
    </div>
  );
}
