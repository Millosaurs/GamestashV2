import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Calendar,
  ExternalLink,
  Globe,
  Github,
  Twitter,
  ArrowLeft,
  Download,
  TrendingUp,
  Award,
} from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { OverlayCard } from "@/components/overlay-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { mockDevelopers, type DeveloperProfile } from "../page";

// Get developer by username
async function getDeveloper(
  username: string
): Promise<DeveloperProfile | null> {
  // In a real app, this would be an API call
  return (
    mockDevelopers.find((dev: DeveloperProfile) => dev.username === username) ||
    null
  );
}

// Developer Stats Component
function DeveloperProfileStats({ developer }: { developer: DeveloperProfile }) {
  const stats = [
    {
      label: "Total Projects",
      value: developer.totalProjects,
      icon: Award,
      color: "text-blue-500",
    },
    {
      label: "Total Sales",
      value: `$${developer.totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Downloads",
      value: developer.totalDownloads.toLocaleString(),
      icon: Download,
      color: "text-purple-500",
    },
    {
      label: "Rating",
      value: developer.rating,
      icon: Star,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Profile Header Component
function DeveloperProfileHeader({
  developer,
}: {
  developer: DeveloperProfile;
}) {
  return (
    <div className="mb-8">
      {/* Profile Info */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row gap-6 lg:flex-col lg:w-80">
          <Avatar className="size-32 border-4 border-background shadow-lg mx-auto sm:mx-0">
            <AvatarImage src={developer.avatar} alt={developer.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {developer.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left lg:text-center">
            <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {developer.name}
              </h1>
              {developer.isVerified && (
                <Badge variant="secondary">Verified</Badge>
              )}
              {developer.isFeatured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>

            <p className="text-lg text-muted-foreground mb-4">
              @{developer.username}
            </p>

            {/* Contact Links */}
            <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-2 mb-4 flex-wrap">
              {developer.website && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={developer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="size-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {developer.github && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://github.com/${developer.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="size-4" />
                  </a>
                </Button>
              )}
              {developer.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://twitter.com/${developer.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="size-4" />
                  </a>
                </Button>
              )}
            </div>

            {/* Meta Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              {developer.location && (
                <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-1">
                  <MapPin className="size-4" />
                  <span>{developer.location}</span>
                </div>
              )}
              <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-1">
                <Calendar className="size-4" />
                <span>Joined {developer.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio and Details */}
        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              About
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {developer.bio}
            </p>
          </div>

          {/* Specialties */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {developer.specialties.map((specialty: string) => (
                <Badge key={specialty} variant="secondary" className="text-sm">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <DeveloperProfileStats developer={developer} />
        </div>
      </div>
    </div>
  );
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const developer = await getDeveloper(params.username);

  if (!developer) {
    return {
      title: "Developer Not Found | GameStash",
    };
  }

  return {
    title: `${developer.name} (@${developer.username}) | GameStash`,
    description: developer.bio,
  };
}

// Main Profile Page
export default async function DeveloperProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const developer = await getDeveloper(params.username);

  if (!developer) {
    notFound();
  }

  const recentProjects = developer.projects.slice(0, 6);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/developers">
            <ArrowLeft className="size-4 mr-2" />
            Back to Developers
          </Link>
        </Button>

        {/* Profile Header */}
        <DeveloperProfileHeader developer={developer} />

        <Separator className="mb-8" />

        {/* Projects Section */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="recent">Recent Projects</TabsTrigger>
            <TabsTrigger value="all">
              All Projects ({developer.projects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Recent Projects
              </h2>
              <p className="text-muted-foreground">
                Latest work from {developer.name}
              </p>
            </div>

            <AnimatedGroup
              preset="blur-slide"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {recentProjects.map((project) => (
                <OverlayCard
                  key={project.id}
                  image={project.image}
                  imageAlt={project.title}
                  title={project.title}
                  description={project.description}
                  author={developer.name}
                  price={`$${project.price}`}
                  rating={project.rating}
                  sold={project.downloads}
                  badges={project.tags
                    .slice(0, 2)
                    .map((tag) => ({ text: tag, variant: "outline" as const }))}
                  href={`/projects/${project.id}`}
                />
              ))}
            </AnimatedGroup>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                All Projects
              </h2>
              <p className="text-muted-foreground">
                Complete portfolio of {developer.name}
              </p>
            </div>

            <AnimatedGroup
              preset="fade"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {developer.projects.map((project) => (
                <OverlayCard
                  key={project.id}
                  image={project.image}
                  imageAlt={project.title}
                  title={project.title}
                  description={project.description}
                  author={developer.name}
                  price={`$${project.price}`}
                  rating={project.rating}
                  sold={project.downloads}
                  badges={project.tags
                    .slice(0, 2)
                    .map((tag) => ({ text: tag, variant: "outline" as const }))}
                  href={`/projects/${project.id}`}
                />
              ))}
            </AnimatedGroup>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
