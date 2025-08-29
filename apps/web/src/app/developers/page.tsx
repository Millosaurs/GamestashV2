"use client";

import { Suspense, useMemo, useState } from "react";
import type { Metadata } from "next";
import {
  Search,
  Filter,
  SortAsc,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { DeveloperCard, type Developer } from "@/components/dev-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// export const metadata: Metadata = {
//   title: "Top Developers | GameStash",
//   description:
//     "Discover talented developers and creators on GameStash marketplace.",
// };

// Enhanced Developer interface that extends the base Developer
export interface DeveloperProfile extends Developer {
  totalDownloads: number;
  website?: string;
  github?: string;
  twitter?: string;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    downloads: number;
    rating: number;
    tags: string[];
    createdAt: string; // ISO date
  }>;
}

// 6 Example Developers with detailed data
export const mockDevelopers: DeveloperProfile[] = [
  {
    id: "1",
    name: "Alex Chen",
    username: "alexchen",
    avatar: "/placeholder.svg",
    bio: "Full-stack developer specializing in React, Node.js, and game development.",
    location: "San Francisco, CA",
    joinedDate: "2022",
    rating: 4.9,
    totalProjects: 24,
    totalSales: 45230,
    totalDownloads: 125400,
    specialties: [
      "React",
      "Node.js",
      "Game Development",
      "TypeScript",
      "Next.js",
    ],
    isVerified: true,
    isFeatured: true,
    website: "https://alexchen.dev",
    github: "alexchen",
    twitter: "alexchen_dev",
    projects: [
      {
        id: "p-1",
        title: "React Game Engine",
        description:
          "2D game engine using React and Canvas API for interactive web games.",
        image: "/placeholder.svg",
        price: 49.99,
        downloads: 1250,
        rating: 4.8,
        tags: ["React", "Game Engine", "Canvas", "TypeScript"],
        createdAt: "2024-01-15",
      },
      {
        id: "p-2",
        title: "E-commerce Dashboard",
        description:
          "Admin dashboard with analytics, user management, and real-time data.",
        image: "/placeholder.svg",
        price: 39.99,
        downloads: 890,
        rating: 4.7,
        tags: ["React", "Dashboard", "Analytics", "Charts"],
        createdAt: "2024-02-20",
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    username: "sarahj",
    avatar: "/placeholder.svg",
    bio: "UI/UX designer and frontend dev. Design systems enthusiast.",
    location: "New York, NY",
    joinedDate: "2021",
    rating: 4.8,
    totalProjects: 18,
    totalSales: 32100,
    totalDownloads: 89200,
    specialties: ["UI/UX Design", "React", "Figma", "CSS", "Design Systems"],
    isVerified: true,
    isFeatured: true,
    website: "https://sarahjohnson.design",
    github: "sarahj",
    twitter: "sarahj_design",
    projects: [
      {
        id: "p-3",
        title: "Design System Kit",
        description:
          "Components, tokens, and docs for modern web apps (Figma + React).",
        image: "/placeholder.svg",
        price: 79.99,
        downloads: 650,
        rating: 4.9,
        tags: ["Design System", "Figma", "React", "Storybook"],
        createdAt: "2024-01-10",
      },
      {
        id: "p-3b",
        title: "Accessible UI Pack",
        description:
          "A11y-first component library with WCAG-compliant patterns.",
        image: "/placeholder.svg",
        price: 59.0,
        downloads: 720,
        rating: 4.8,
        tags: ["Accessibility", "UI", "React"],
        createdAt: "2023-10-04",
      },
    ],
  },
  {
    id: "3",
    name: "Marcus Rodriguez",
    username: "marcusr",
    avatar: "/placeholder.svg",
    bio: "Backend architect and DevOps engineer for scalable systems.",
    location: "Austin, TX",
    joinedDate: "2020",
    rating: 4.7,
    totalProjects: 31,
    totalSales: 28900,
    totalDownloads: 67800,
    specialties: ["Node.js", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
    isVerified: true,
    isFeatured: false,
    website: "https://marcusdev.io",
    github: "marcusr",
    projects: [
      {
        id: "p-4",
        title: "Microservices Boilerplate",
        description:
          "Docker, Kubernetes, monitoring, and best practices included.",
        image: "/placeholder.svg",
        price: 99.99,
        downloads: 420,
        rating: 4.6,
        tags: ["Microservices", "Docker", "Kubernetes", "Node.js"],
        createdAt: "2023-12-05",
      },
      {
        id: "p-4b",
        title: "Observability Stack",
        description: "Prometheus, Grafana, OpenTelemetry templates.",
        image: "/placeholder.svg",
        price: 69.0,
        downloads: 510,
        rating: 4.5,
        tags: ["Observability", "Grafana", "Prometheus", "OTel"],
        createdAt: "2024-04-22",
      },
    ],
  },
  {
    id: "4",
    name: "Emily Zhang",
    username: "emilyzhang",
    avatar: "/placeholder.svg",
    bio: "Mobile app developer specializing in React Native and Flutter.",
    location: "Seattle, WA",
    joinedDate: "2023",
    rating: 4.6,
    totalProjects: 12,
    totalSales: 19500,
    totalDownloads: 45600,
    specialties: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    isVerified: false,
    isFeatured: false,
    projects: [
      {
        id: "p-5",
        title: "Chat App Template",
        description:
          "Real-time chat with React Native, Firebase, and push notifications.",
        image: "/placeholder.svg",
        price: 59.99,
        downloads: 380,
        rating: 4.5,
        tags: ["React Native", "Firebase", "Chat", "Real-time"],
        createdAt: "2024-03-01",
      },
      {
        id: "p-5b",
        title: "RN E-commerce Starter",
        description: "Stripe payments, auth, product catalog.",
        image: "/placeholder.svg",
        price: 79.0,
        downloads: 295,
        rating: 4.4,
        tags: ["React Native", "E-commerce", "Stripe"],
        createdAt: "2023-11-18",
      },
    ],
  },
  {
    id: "5",
    name: "David Kim",
    username: "davidkim",
    avatar: "/placeholder.svg",
    bio: "AI/ML engineer and Python developer.",
    location: "Toronto, ON",
    joinedDate: "2022",
    rating: 4.8,
    totalProjects: 16,
    totalSales: 35600,
    totalDownloads: 78900,
    specialties: [
      "Python",
      "Machine Learning",
      "TensorFlow",
      "Data Science",
      "FastAPI",
    ],
    isVerified: true,
    isFeatured: true,
    website: "https://davidkim.ai",
    github: "davidkim",
    projects: [
      {
        id: "p-6",
        title: "ML Model Deployment Kit",
        description: "Deploy ML models to production with FastAPI and Docker.",
        image: "/placeholder.svg",
        price: 89.99,
        downloads: 290,
        rating: 4.9,
        tags: ["Machine Learning", "FastAPI", "Docker", "Python"],
        createdAt: "2024-02-15",
      },
      {
        id: "p-6b",
        title: "Feature Store Starter",
        description: "Feast-based feature store scaffolding.",
        image: "/placeholder.svg",
        price: 69.0,
        downloads: 210,
        rating: 4.7,
        tags: ["Feature Store", "Feast", "Data"],
        createdAt: "2024-05-09",
      },
    ],
  },
  {
    id: "6",
    name: "Luna Martinez",
    username: "lunamartinez",
    avatar: "/placeholder.svg",
    bio: "Creative developer combining code with visual design.",
    location: "Barcelona, Spain",
    joinedDate: "2021",
    rating: 4.7,
    totalProjects: 22,
    totalSales: 27800,
    totalDownloads: 62300,
    specialties: [
      "Three.js",
      "WebGL",
      "Creative Coding",
      "Animation",
      "Vue.js",
    ],
    isVerified: true,
    isFeatured: false,
    website: "https://lunamartinez.art",
    github: "lunamartinez",
    twitter: "luna_creates",
    projects: [
      {
        id: "p-7",
        title: "3D Portfolio Template",
        description:
          "Interactive 3D portfolio with Three.js and modern web tech.",
        image: "/placeholder.svg",
        price: 69.99,
        downloads: 520,
        rating: 4.8,
        tags: ["Three.js", "WebGL", "3D", "Portfolio"],
        createdAt: "2024-01-25",
      },
      {
        id: "p-7b",
        title: "Shaders Playground",
        description: "GLSL shader packs and examples.",
        image: "/placeholder.svg",
        price: 39.0,
        downloads: 340,
        rating: 4.6,
        tags: ["GLSL", "Shaders", "WebGL"],
        createdAt: "2024-06-12",
      },
    ],
  },
  {
    id: "7",
    name: "Priya Nair",
    username: "priyanair",
    avatar: "/placeholder.svg",
    bio: "Full-stack engineer focusing on Next.js and Prisma.",
    location: "Bengaluru, India",
    joinedDate: "2024",
    rating: 4.5,
    totalProjects: 9,
    totalSales: 11200,
    totalDownloads: 18200,
    specialties: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    isVerified: false,
    isFeatured: false,
    website: "https://priyanair.dev",
    github: "priyanair",
    projects: [
      {
        id: "p-8",
        title: "SaaS Starter Kit",
        description: "Auth, billing, tenancy, and dashboard for SaaS.",
        image: "/placeholder.svg",
        price: 119.0,
        downloads: 140,
        rating: 4.5,
        tags: ["Next.js", "Stripe", "Prisma", "SaaS"],
        createdAt: "2025-01-08",
      },
    ],
  },
  {
    id: "8",
    name: "Tom Sullivan",
    username: "tsullivan",
    avatar: "/placeholder.svg",
    bio: "Go + Rust backend performance nut.",
    location: "Dublin, Ireland",
    joinedDate: "2019",
    rating: 4.4,
    totalProjects: 27,
    totalSales: 20450,
    totalDownloads: 40210,
    specialties: ["Go", "Rust", "gRPC", "PostgreSQL", "Redis"],
    isVerified: true,
    isFeatured: false,
    website: "https://sullivandev.io",
    github: "tommy-s",
    projects: [
      {
        id: "p-9",
        title: "gRPC Microservice Kit",
        description: "gRPC services with Go, auth, tracing, and CI.",
        image: "/placeholder.svg",
        price: 89.0,
        downloads: 330,
        rating: 4.4,
        tags: ["Go", "gRPC", "Auth", "Tracing"],
        createdAt: "2023-09-14",
      },
      {
        id: "p-9b",
        title: "Rust Web API Boilerplate",
        description: "Axum, SQLx, JWT auth, and observability.",
        image: "/placeholder.svg",
        price: 79.0,
        downloads: 280,
        rating: 4.3,
        tags: ["Rust", "Axum", "SQLx", "JWT"],
        createdAt: "2024-08-02",
      },
    ],
  },
];

const categories = [
  "All Categories",
  "Game Development",
  "Web Development",
  "Mobile Apps",
  "UI/UX Design",
  "Backend",
  "DevOps",
  "AI/ML",
  "Creative Coding",
];

function DeveloperStats() {
  const stats = [
    {
      icon: Users,
      label: "Total Developers",
      value: "2,500+",
      description: "Active creators",
    },
    {
      icon: TrendingUp,
      label: "Projects Created",
      value: "15,000+",
      description: "Digital products",
    },
    {
      icon: Award,
      label: "Success Rate",
      value: "94%",
      description: "Customer satisfaction",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {stats.map((stat) => (
        <Card key={stat.label} className="text-center">
          <CardContent className="p-6">
            <stat.icon className="size-8 text-primary mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </h3>
            <p className="font-medium text-foreground mb-1">{stat.label}</p>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Filters Component (controlled)
function DeveloperFilters(props: {
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  sortBy: "rating" | "projects" | "sales" | "newest";
  setSortBy: (v: "rating" | "projects" | "sales" | "newest") => void;
}) {
  const { search, setSearch, category, setCategory, sortBy, setSortBy } = props;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search developers by name, skills, or location..."
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Select value={category} onValueChange={(v) => setCategory(v)}>
          <SelectTrigger className="w-[200px]">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c.toLowerCase().replace(/\s+/g, "-")}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(v) =>
            setSortBy(v as "rating" | "projects" | "sales" | "newest")
          }
        >
          <SelectTrigger className="w-[160px]">
            <SortAsc className="size-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="projects">Most Projects</SelectItem>
            <SelectItem value="sales">Best Selling</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Featured Developers Section
function FeaturedDevelopersGrid({
  developers,
}: {
  developers: DeveloperProfile[];
}) {
  const featuredDevelopers = developers.filter((dev) => dev.isFeatured);

  if (featuredDevelopers.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-3xl font-bold text-foreground">
          Featured Developers
        </h2>
        <Badge variant="secondary">Top Picks</Badge>
      </div>

      <AnimatedGroup
        preset="blur-slide"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {featuredDevelopers.map((developer) => (
          <DeveloperCard
            key={developer.id}
            developer={developer}
            variant="featured"
            showStats={true}
          />
        ))}
      </AnimatedGroup>
    </section>
  );
}

// All Developers Section
function AllDevelopersGrid({ developers }: { developers: DeveloperProfile[] }) {
  const regularDevelopers = developers.filter((dev) => !dev.isFeatured);

  return (
    <section>
      <h2 className="text-3xl font-bold text-foreground mb-8">
        All Developers
      </h2>

      <AnimatedGroup
        preset="fade"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
      >
        {regularDevelopers.map((developer) => (
          <DeveloperCard
            key={developer.id}
            developer={developer}
            variant="default"
            showStats={true}
          />
        ))}
      </AnimatedGroup>
    </section>
  );
}

// Loading Skeleton
function DeveloperGridSkeleton() {
  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-background p-6 animate-pulse"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="size-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-4/5" />
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 bg-muted rounded w-16" />
              <div className="h-5 bg-muted rounded w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-background p-6 animate-pulse"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="size-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helpers
function normalizeCategoryLabelToValue(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function matchesSearch(dev: DeveloperProfile, q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return (
    dev.name.toLowerCase().includes(s) ||
    dev.username.toLowerCase().includes(s) ||
    dev.location?.toLowerCase().includes(s) ||
    dev.specialties?.some((sp) => sp.toLowerCase().includes(s))
  );
}

function belongsToCategory(dev: DeveloperProfile, categoryValue: string) {
  if (
    !categoryValue ||
    categoryValue === "all-categories" ||
    categoryValue === "all"
  ) {
    return true;
  }
  // Map categories to possible specialty keywords
  const map: Record<string, string[]> = {
    "game-development": ["game", "three.js", "webgl", "canvas"],
    "web-development": ["react", "next.js", "vue", "frontend", "dashboard"],
    "mobile-apps": ["react native", "flutter", "ios", "android", "mobile"],
    "ui/ux-design": ["design", "figma", "ui", "ux", "design system"],
    backend: ["node", "node.js", "postgres", "api", "backend"],
    devops: ["docker", "kubernetes", "aws", "devops", "infrastructure"],
    "ai/ml": ["ml", "machine learning", "ai", "tensorflow", "python"],
    "creative-coding": ["three.js", "webgl", "creative", "animation"],
  };

  const keywords = map[categoryValue] || [];
  const haystack = [
    ...(dev.specialties || []),
    dev.bio || "",
    ...(dev.projects?.flatMap((p) => [p.title, ...(p.tags || [])]) || []),
  ]
    .join(" ")
    .toLowerCase();

  return keywords.length === 0
    ? true
    : keywords.some((k) => haystack.includes(k));
}

function sortDevelopers(
  list: DeveloperProfile[],
  sortBy: "rating" | "projects" | "sales" | "newest"
) {
  const copy = [...list];
  switch (sortBy) {
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "projects":
      return copy.sort(
        (a, b) => (b.totalProjects ?? 0) - (a.totalProjects ?? 0)
      );
    case "sales":
      return copy.sort((a, b) => (b.totalSales ?? 0) - (a.totalSales ?? 0));
    case "newest":
      // Use most recent project creation date as proxy for recency
      const mostRecent = (dev: DeveloperProfile) =>
        Math.max(
          ...(dev.projects || [])
            .map((p) => new Date(p.createdAt).getTime())
            .filter((n) => !Number.isNaN(n)),
          // Fallback to joinedDate year
          dev.joinedDate ? new Date(`${dev.joinedDate}-01-01`).getTime() : 0
        );
      return copy.sort((a, b) => mostRecent(b) - mostRecent(a));
    default:
      return copy;
  }
}

// Main Page Component
export default function DevelopersPage() {
  // Wider layout: use max-w-screen-2xl and generous padding.
  // You can also go full-width with max-w-none if desired.
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    normalizeCategoryLabelToValue("All Categories")
  );
  const [sortBy, setSortBy] = useState<
    "rating" | "projects" | "sales" | "newest"
  >("rating");

  const filteredAndSorted = useMemo(() => {
    const filtered = mockDevelopers.filter(
      (d) => matchesSearch(d, search) && belongsToCategory(d, category)
    );
    return sortDevelopers(filtered, sortBy);
  }, [search, category, sortBy]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto px-6 md:px-10 lg:px-12 max-w-screen-2xl py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Top Developers
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover talented developers and creators building amazing digital
            experiences on GameStash marketplace. From game developers to AI
            engineers.
          </p>
        </div>

        {/* Stats */}
        <DeveloperStats />

        {/* Filters */}
        <DeveloperFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Developer Grids */}
        <Suspense fallback={<DeveloperGridSkeleton />}>
          <div className="space-y-16">
            <FeaturedDevelopersGrid developers={filteredAndSorted} />
            <AllDevelopersGrid developers={filteredAndSorted} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
