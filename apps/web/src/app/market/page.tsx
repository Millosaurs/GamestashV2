"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Grid3X3,
  ChevronRight,
  X,
  SlidersHorizontal,
  Tag,
  Percent,
  DollarSign,
  Hash,
  Gamepad2,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { OverlayCard } from "@/components/overlay-card";
import { Button } from "@/components/ui/button";
import PriceSlider from "@/components/prce-slider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

// Platform and category structure
// const PLATFORMS = [
//   {
//     id: "all",
//     name: "All Platforms",
//     categories: [{ id: "all", name: "All Categories", count: 156 }],
//   },
//   {
//     id: "minecraft",
//     name: "Minecraft",
//     categories: [
//       { id: "all", name: "All Categories", count: 45 },
//       { id: "plugins", name: "Plugins", count: 18 },
//       { id: "mods", name: "Mods", count: 12 },
//       { id: "texturepacks", name: "Texture Packs", count: 8 },
//       { id: "shaders", name: "Shaders", count: 4 },
//       { id: "maps", name: "Maps", count: 3 },
//     ],
//   },
//   {
//     id: "roblox",
//     name: "Roblox",
//     categories: [
//       { id: "all", name: "All Categories", count: 38 },
//       { id: "scripts", name: "Scripts", count: 15 },
//       { id: "guis", name: "GUIs", count: 8 },
//       { id: "models", name: "Models", count: 7 },
//       { id: "animations", name: "Animations", count: 5 },
//       { id: "sounds", name: "Sounds", count: 3 },
//     ],
//   },
//   {
//     id: "fivem",
//     name: "FiveM",
//     categories: [
//       { id: "all", name: "All Categories", count: 32 },
//       { id: "mods", name: "Mods", count: 12 },
//       { id: "scripts", name: "Scripts", count: 8 },
//       { id: "vehicles", name: "Vehicles", count: 6 },
//       { id: "maps", name: "Maps", count: 4 },
//       { id: "packs", name: "Packs", count: 2 },
//     ],
//   },
//   {
//     id: "websites",
//     name: "Websites",
//     categories: [
//       { id: "all", name: "All Categories", count: 41 },
//       { id: "templates", name: "Templates", count: 15 },
//       { id: "themes", name: "Themes", count: 10 },
//       { id: "plugins", name: "Plugins", count: 8 },
//       { id: "components", name: "Components", count: 5 },
//       { id: "tools", name: "Tools", count: 3 },
//     ],
//   },
// ];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured First" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

const PRODUCTS = [
  // Minecraft Products
  {
    id: "1",
    name: "EssentialsX Plugin",
    description:
      "Complete server management plugin with economy and permissions",
    price: 0,
    originalPrice: 0,
    platform: "minecraft",
    category: "plugins",
    rating: 4.8,
    reviewCount: 1240,
    sold: 15670,
    image: "/placeholder.svg",
    author: "EssentialsTeam",
    tags: ["Server", "Management", "Economy", "Spigot"],
    isFeatured: true,
    isNew: false,
    discount: 0,
  },
  {
    id: "2",
    name: "Medieval Texture Pack",
    description:
      "High-resolution medieval themed texture pack with custom models",
    price: 4.99,
    originalPrice: 7.99,
    platform: "minecraft",
    category: "texturepacks",
    rating: 4.6,
    reviewCount: 890,
    sold: 3450,
    image: "/placeholder.svg",
    author: "MedievalCraft",
    tags: ["Medieval", "HD", "Custom Models", "16x"],
    isFeatured: true,
    isNew: true,
    discount: 38,
  },
  {
    id: "3",
    name: "JEI Recipe Viewer",
    description:
      "Just Enough Items - Recipe and item viewing mod for modded Minecraft",
    price: 0,
    originalPrice: 0,
    platform: "minecraft",
    category: "mods",
    rating: 4.9,
    reviewCount: 2340,
    sold: 45670,
    image: "/placeholder.svg",
    author: "mezz",
    tags: ["Recipe", "JEI", "Utility", "Forge"],
    isFeatured: false,
    isNew: false,
    discount: 0,
  },
  {
    id: "4",
    name: "SEUS PTGI Shaders",
    description: "Photorealistic ray-traced global illumination shaders",
    price: 12.99,
    originalPrice: 12.99,
    platform: "minecraft",
    category: "shaders",
    rating: 4.7,
    reviewCount: 567,
    sold: 2890,
    image: "/placeholder.svg",
    author: "Sonic Ether",
    tags: ["Ray Tracing", "PTGI", "Realistic", "OptiFine"],
    isFeatured: true,
    isNew: false,
    discount: 0,
  },
  {
    id: "5",
    name: "Skyblock Island Map",
    description: "Custom skyblock map with unique challenges and progression",
    price: 2.99,
    originalPrice: 4.99,
    platform: "minecraft",
    category: "maps",
    rating: 4.5,
    reviewCount: 234,
    sold: 1230,
    image: "/placeholder.svg",
    author: "SkyBuilder",
    tags: ["Skyblock", "Challenge", "Survival", "Adventure"],
    isFeatured: false,
    isNew: false,
    discount: 40,
  },

  // Roblox Products
  {
    id: "6",
    name: "Admin Commands Script",
    description: "Comprehensive admin commands system for Roblox games",
    price: 0,
    originalPrice: 0,
    platform: "roblox",
    category: "scripts",
    rating: 4.8,
    reviewCount: 890,
    sold: 12340,
    image: "/placeholder.svg",
    author: "AdminDev",
    tags: ["Admin", "Commands", "Moderation", "Free"],
    isFeatured: true,
    isNew: false,
    discount: 0,
  },
  {
    id: "7",
    name: "Modern UI Library",
    description: "Beautiful and responsive UI components for Roblox games",
    price: 8.99,
    originalPrice: 14.99,
    platform: "roblox",
    category: "guis",
    rating: 4.6,
    reviewCount: 456,
    sold: 2340,
    image: "/placeholder.svg",
    author: "UIDesigner",
    tags: ["UI", "Modern", "Responsive", "Components"],
    isFeatured: true,
    isNew: true,
    discount: 40,
  },
  {
    id: "8",
    name: "Weapon Models Pack",
    description: "50+ high-quality weapon models with animations",
    price: 15.99,
    originalPrice: 24.99,
    platform: "roblox",
    category: "models",
    rating: 4.7,
    reviewCount: 234,
    sold: 1890,
    image: "/placeholder.svg",
    author: "ModelMaker",
    tags: ["Weapons", "Models", "Animations", "Pack"],
    isFeatured: false,
    isNew: false,
    discount: 36,
  },
  {
    id: "9",
    name: "Character Animations",
    description: "Smooth character animations for various actions and emotes",
    price: 6.99,
    originalPrice: 9.99,
    platform: "roblox",
    category: "animations",
    rating: 4.5,
    reviewCount: 345,
    sold: 1567,
    image: "/placeholder.svg",
    author: "AnimStudio",
    tags: ["Animations", "Character", "Emotes", "Smooth"],
    isFeatured: false,
    isNew: true,
    discount: 30,
  },
  {
    id: "10",
    name: "Ambient Sound Pack",
    description: "High-quality ambient sounds for immersive game environments",
    price: 4.99,
    originalPrice: 4.99,
    platform: "roblox",
    category: "sounds",
    rating: 4.4,
    reviewCount: 123,
    sold: 890,
    image: "/placeholder.svg",
    author: "SoundDesign",
    tags: ["Ambient", "Sounds", "Environment", "Immersive"],
    isFeatured: false,
    isNew: false,
    discount: 0,
  },

  // FiveM Products
  {
    id: "11",
    name: "ESX Police Job",
    description:
      "Advanced police job system with arrest, fine, and patrol features",
    price: 19.99,
    originalPrice: 29.99,
    platform: "fivem",
    category: "scripts",
    rating: 4.8,
    reviewCount: 567,
    sold: 3450,
    image: "/placeholder.svg",
    author: "RPScripts",
    tags: ["Police", "Job", "ESX", "Roleplay"],
    isFeatured: true,
    isNew: false,
    discount: 33,
  },
  {
    id: "12",
    name: "Realistic Vehicle Pack",
    description: "50+ high-quality realistic vehicles with custom handling",
    price: 35.99,
    originalPrice: 49.99,
    platform: "fivem",
    category: "vehicles",
    rating: 4.7,
    reviewCount: 234,
    sold: 1890,
    image: "/placeholder.svg",
    author: "VehicleMods",
    tags: ["Vehicles", "Realistic", "Pack", "Custom"],
    isFeatured: true,
    isNew: true,
    discount: 28,
  },
  {
    id: "13",
    name: "Custom Map Pack",
    description: "10 custom maps including interiors and MLOs",
    price: 24.99,
    originalPrice: 39.99,
    platform: "fivem",
    category: "maps",
    rating: 4.6,
    reviewCount: 189,
    sold: 1234,
    image: "/placeholder.svg",
    author: "MapBuilder",
    tags: ["Maps", "MLO", "Interiors", "Custom"],
    isFeatured: false,
    isNew: false,
    discount: 38,
  },
  {
    id: "14",
    name: "Drug System Mod",
    description: "Complete drug dealing system with locations and effects",
    price: 12.99,
    originalPrice: 18.99,
    platform: "fivem",
    category: "mods",
    rating: 4.5,
    reviewCount: 345,
    sold: 2340,
    image: "/placeholder.svg",
    author: "CrimeMods",
    tags: ["Drugs", "System", "Roleplay", "Crime"],
    isFeatured: false,
    isNew: true,
    discount: 32,
  },
  {
    id: "15",
    name: "Server Resource Pack",
    description: "Essential server resources and utilities bundle",
    price: 29.99,
    originalPrice: 44.99,
    platform: "fivem",
    category: "packs",
    rating: 4.7,
    reviewCount: 123,
    sold: 890,
    image: "/placeholder.svg",
    author: "ServerUtils",
    tags: ["Resources", "Utilities", "Bundle", "Server"],
    isFeatured: false,
    isNew: false,
    discount: 33,
  },

  // Website Products
  {
    id: "16",
    name: "Modern Dashboard Template",
    description: "Responsive admin dashboard with dark/light themes",
    price: 39.99,
    originalPrice: 59.99,
    platform: "websites",
    category: "templates",
    rating: 4.8,
    reviewCount: 890,
    sold: 5670,
    image: "/placeholder.svg",
    author: "WebCrafters",
    tags: ["Dashboard", "Admin", "React", "Responsive"],
    isFeatured: true,
    isNew: false,
    discount: 33,
  },
  {
    id: "17",
    name: "E-commerce Theme",
    description:
      "Complete e-commerce theme with shopping cart and payment integration",
    price: 49.99,
    originalPrice: 79.99,
    platform: "websites",
    category: "themes",
    rating: 4.7,
    reviewCount: 456,
    sold: 3450,
    image: "/placeholder.svg",
    author: "ShopDesign",
    tags: ["E-commerce", "Shopping", "Payment", "WooCommerce"],
    isFeatured: true,
    isNew: true,
    discount: 38,
  },
  {
    id: "18",
    name: "SEO Optimization Plugin",
    description: "Advanced SEO plugin with analytics and optimization tools",
    price: 24.99,
    originalPrice: 34.99,
    platform: "websites",
    category: "plugins",
    rating: 4.6,
    reviewCount: 234,
    sold: 2890,
    image: "/placeholder.svg",
    author: "SEOPro",
    tags: ["SEO", "Analytics", "Optimization", "WordPress"],
    isFeatured: false,
    isNew: false,
    discount: 29,
  },
  {
    id: "19",
    name: "React Component Library",
    description: "50+ reusable React components with TypeScript support",
    price: 19.99,
    originalPrice: 29.99,
    platform: "websites",
    category: "components",
    rating: 4.9,
    reviewCount: 567,
    sold: 4560,
    image: "/placeholder.svg",
    author: "ReactDev",
    tags: ["React", "Components", "TypeScript", "Library"],
    isFeatured: true,
    isNew: false,
    discount: 33,
  },
  {
    id: "20",
    name: "Website Builder Tool",
    description: "Drag-and-drop website builder with hosting integration",
    price: 99.99,
    originalPrice: 149.99,
    platform: "websites",
    category: "tools",
    rating: 4.5,
    reviewCount: 123,
    sold: 1890,
    image: "/placeholder.svg",
    author: "BuilderPro",
    tags: ["Builder", "Drag-Drop", "Hosting", "Tool"],
    isFeatured: false,
    isNew: true,
    discount: 33,
  },

  // Add more products for better demo
  ...Array.from({ length: 10 }, (_, i) => {
    type Platform = "minecraft" | "roblox" | "fivem" | "websites";
    const platforms: Platform[] = ["minecraft", "roblox", "fivem", "websites"];

    const platformCategories: Record<Platform, string[]> = {
      minecraft: ["plugins", "mods", "texturepacks", "shaders", "maps"],
      roblox: ["scripts", "guis", "models", "animations", "sounds"],
      fivem: ["mods", "scripts", "vehicles", "maps", "packs"],
      websites: ["templates", "themes", "plugins", "components", "tools"],
    };

    const platformTags: Record<Platform, string[]> = {
      minecraft: ["Spigot", "Forge", "Fabric", "OptiFine", "Bukkit"],
      roblox: ["Studio", "Scripting", "Building", "Animation", "UI"],
      fivem: ["ESX", "QBCore", "Roleplay", "MLO", "Custom"],
      websites: ["React", "WordPress", "Bootstrap", "JavaScript", "CSS"],
    };

    const platform: Platform =
      platforms[Math.floor(Math.random() * platforms.length)];
    const categories = platformCategories[platform];
    const tags = platformTags[platform];

    return {
      id: `${i + 21}`,
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Product ${
        i + 1
      }`,
      description: `High-quality ${platform} product with premium features and excellent support`,
      price: Math.floor(Math.random() * 50) + 5,
      originalPrice: Math.floor(Math.random() * 80) + 30,
      platform,
      category: categories[Math.floor(Math.random() * categories.length)],
      rating: Math.round((4 + Math.random()) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 500) + 50,
      sold: Math.floor(Math.random() * 2000) + 100,
      image: "/placeholder.svg",
      author: `Creator${i + 21}`,
      tags: tags.slice(0, 3),
      isFeatured: Math.random() > 0.7,
      isNew: Math.random() > 0.8,
      discount: Math.random() > 0.6 ? Math.floor(Math.random() * 40) + 10 : 0,
    };
  }),
];

// Price range derived from data
const MIN_PRICE = 0;
const MAX_PRICE = Math.max(...PRODUCTS.map((p) => p.price));

// Input Component
function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Platform {
  id: string;
  name: string;
  categories: Category[];
}

// Filter Sidebar Component
function FilterSidebar({
  platforms = [],
  platformsLoading = false,
  platformsError = null,
  categoriesLoading = false,
  categoriesError = null,
  selectedPlatform,
  setSelectedPlatform,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  showDiscounted,
  setShowDiscounted,
  selectedTags,
  setSelectedTags,
  onClose,
}: {
  platforms?: Platform[];
  platformsLoading?: boolean;
  platformsError?: any;
  categoriesLoading?: boolean;
  categoriesError?: any;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  showDiscounted: boolean;
  setShowDiscounted: (show: boolean) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  onClose?: () => void;
}) {
  const handleTagChange = (tag: string, checked: boolean) => {
    setSelectedTags((prev) =>
      checked ? [...prev, tag] : prev.filter((t) => t !== tag)
    );
  };

  const clearAllFilters = () => {
    setSelectedPlatform("all");
    setSelectedCategory("all");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setShowDiscounted(false);
    setSelectedTags([]);
  };

  const hasActiveFilters =
    selectedPlatform !== "all" ||
    selectedCategory !== "all" ||
    priceRange[0] !== MIN_PRICE ||
    priceRange[1] !== MAX_PRICE ||
    showDiscounted ||
    selectedTags.length > 0;

  // Get current platform's categories
  const currentPlatform = platforms.find((p) => p.id === selectedPlatform);
  const availableCategories = currentPlatform?.categories || [];

  // Get all unique tags from products for the selected platform
  const filteredProducts = React.useMemo(() => {
    return selectedPlatform === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.platform === selectedPlatform);
  }, [selectedPlatform]);

  const allTags = React.useMemo(() => {
    return Array.from(new Set(filteredProducts.flatMap((p) => p.tags))).sort();
  }, [filteredProducts]);

  // Reset category when platform changes
  React.useEffect(() => {
    setSelectedCategory("all");
  }, [selectedPlatform, setSelectedCategory]);

  React.useEffect(() => {
    setSelectedCategory("all");
  }, [selectedPlatform, setSelectedCategory]);

  // Add this helper function inside the FilterSidebar component

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 lg:hidden"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-3">
        <Collapsible defaultOpen>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Gamepad2 className="size-3" />
              Platforms
            </h4>
            <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">
              Toggle
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-1 mt-2">
            {platformsLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Loading platforms...
              </div>
            ) : platformsError ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-3" />
                Error loading platforms
              </div>
            ) : (
              platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                    selectedPlatform === platform.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {platform.id === "websites" && <Globe className="size-3" />}
                    {platform.id !== "websites" && platform.id !== "all" && (
                      <Gamepad2 className="size-3" />
                    )}
                    {platform.name}
                  </span>
                  <span className="text-xs opacity-60">
                    {platform.categories?.[0]?.count || 0}
                  </span>
                </button>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Collapsible defaultOpen>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="size-3" />
              Categories
            </h4>
            <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">
              Toggle
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-1 mt-2">
            {categoriesLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Loading categories...
              </div>
            ) : categoriesError ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-3" />
                Error loading categories
              </div>
            ) : availableCategories.length > 0 ? (
              availableCategories.map((category) => (
                <button
                  key={`${selectedPlatform}-${category.id}`} // Fix: Make keys unique
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                    selectedCategory === category.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{category.name}</span> {/* Removed icon */}
                  <span className="text-xs opacity-60">{category.count}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No categories available
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
      {/* Special Filters */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Percent className="size-3" />
          Special Offers
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showDiscounted}
              onChange={(e) => setShowDiscounted(e.target.checked)}
              className="rounded border-input accent-primary"
            />
            Discounted Items Only
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <DollarSign className="size-3" />
          Price Range
        </h4>
        <PriceSlider
          min={MIN_PRICE}
          max={MAX_PRICE}
          value={priceRange}
          onValueChange={(next) => setPriceRange(next)}
        />
      </div>

      {/* Tags */}
      {!platformsLoading && !categoriesLoading && allTags.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Hash className="size-3" />
            Tags
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {allTags.map((tag) => (
              <label
                key={`${selectedPlatform}-${tag}`}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={(e) => handleTagChange(tag, e.target.checked)}
                  className="rounded border-input accent-primary"
                />
                {tag}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Market Page Component
export default function MarketPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPlatform, setSelectedPlatform] = React.useState("all");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    MIN_PRICE,
    MAX_PRICE,
  ]);
  const [showDiscounted, setShowDiscounted] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState("featured");
  const [showFilters, setShowFilters] = React.useState(false);

  const currentSortLabel = React.useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort",
    [sortBy]
  );
  //orpc procedures

  const {
    data: platforms = [],
    isLoading: platformsLoading,
    error: platformsError,
  } = useQuery(orpc.platforms.list.queryOptions());

  const {
    data: allCategories = [],
    isLoading: allCategoriesLoading,
    error: allCategoriesError,
  } = useQuery(orpc.categories.list.queryOptions());

  const {
    data: selectedPlatformCategories = [],
    isLoading: selectedCategoriesLoading,
  } = useQuery({
    ...orpc.categories.byPlatform.queryOptions({
      input: { platformId: selectedPlatform },
    }),
    enabled: selectedPlatform !== "all" && selectedPlatform !== "",
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const PLATFORMS = React.useMemo(() => {
    if (platformsLoading || allCategoriesLoading || !platforms) {
      return [];
    }

    const allPlatformsOption = {
      id: "all",
      name: "All Platforms",
      categories: [
        { id: "all", name: "All Categories", count: PRODUCTS.length },
      ],
    };

    const transformedPlatforms = platforms
      .filter((platform) => platform.id !== "all")
      .map((platform) => {
        const categoriesToUse =
          platform.id === selectedPlatform &&
          selectedPlatformCategories.length > 0
            ? selectedPlatformCategories.filter((cat) => cat.id !== "all") // Filter out 'all' categories from DB
            : allCategories.filter((cat) => cat.platformId === platform.id && cat.id !== "all"); // Filter out 'all' categories from DB

        const allCategoriesOption = {
          id: "all",
          name: "All Categories",
          count: PRODUCTS.filter((p) => p.platform === platform.id).length,
        };

        const categoryOptions = categoriesToUse.map((cat) => ({
          id: cat.id,
          name: cat.name,
          count:
            cat.count ||
            PRODUCTS.filter(
              (p) => p.platform === platform.id && p.category === cat.id
            ).length,
        }));

        return {
          id: platform.id,
          name: platform.name,
          categories: [allCategoriesOption, ...categoryOptions],
        };
      });

    return [allPlatformsOption, ...transformedPlatforms];
  }, [
    platforms,
    allCategories,
    selectedPlatform,
    selectedPlatformCategories,
    platformsLoading,
    allCategoriesLoading,
  ]);

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = PRODUCTS.filter((product) => {
      // Search filter
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !product.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ) {
        return false;
      }

      // Platform filter
      if (selectedPlatform !== "all" && product.platform !== selectedPlatform) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Discounted filter
      if (showDiscounted && product.discount === 0) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some((tag) =>
          product.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      if (sortBy === "featured") {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return parseInt(b.id) - parseInt(a.id);
      }

      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "popular":
          return b.reviewCount - a.reviewCount;
        case "oldest":
          return parseInt(a.id) - parseInt(b.id);
        case "newest":
        default:
          return parseInt(b.id) - parseInt(a.id);
      }
    });

    return filtered;
  }, [
    searchQuery,
    selectedPlatform,
    selectedCategory,
    priceRange,
    showDiscounted,
    selectedTags,
    sortBy,
  ]);

  return (
    <div className="flex h-screen bg-background pt-20">
      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-background border-r p-6 overflow-y-auto">
            <FilterSidebar
              platforms={PLATFORMS}
              platformsLoading={platformsLoading}
              platformsError={platformsError}
              categoriesLoading={
                allCategoriesLoading || selectedCategoriesLoading
              }
              categoriesError={allCategoriesError}
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              showDiscounted={showDiscounted}
              setShowDiscounted={setShowDiscounted}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r bg-background">
        {/* Header */}
        <div className="border-0 p-6 pt-10">
          <h1 className="text-2xl font-bold text-foreground">Market</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover premium digital products
          </p>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-6">
         
          <FilterSidebar
            platforms={PLATFORMS}
            platformsLoading={platformsLoading}
            platformsError={platformsError}
            categoriesLoading={
              allCategoriesLoading || selectedCategoriesLoading
            }
            categoriesError={allCategoriesError}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            showDiscounted={showDiscounted}
            setShowDiscounted={setShowDiscounted}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            onClose={() => setShowFilters(false)}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background p-4 lg:p-6">
          <div className="flex flex-col gap-4 lg:hidden mb-4">
            <h1 className="text-2xl font-bold text-foreground">Market</h1>
            <p className="text-sm text-muted-foreground">
              Discover premium digital products
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="gap-2 lg:hidden"
              >
                <Filter className="size-4" />
                Filters
              </Button>

              {/* Grid View Button */}
              <Button variant="default" size="sm" className="px-3">
                <Grid3X3 className="size-4" />
              </Button>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-40 justify-between"
                  >
                    {currentSortLabel}
                    <ChevronRight className="size-4 -rotate-90 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => setSortBy(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products found
              {selectedPlatform !== "all" && (
                <span className="ml-1">
                  in {PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="ml-1">
                  •{" "}
                  {
                    PLATFORMS.find(
                      (p) => p.id === selectedPlatform
                    )?.categories.find((c) => c.id === selectedCategory)?.name
                  }
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Products Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const badges = [];
                if (product.isNew)
                  badges.push({
                    text: "New",
                    variant: "default" as const,
                    className: "bg-blue-600 text-white",
                  });
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
                    key={product.id}
                    image={product.image}
                    imageAlt={product.name}
                    title={product.name}
                    description={product.description}
                    author={product.author}
                    price={product.price === 0 ? "Free" : `$${product.price}`}
                    rating={product.rating}
                    sold={product.sold}
                    badges={badges}
                    href={`/product/${product.id}`}
                    ctaText={product.price === 0 ? "Download" : "Add to Cart"}
                    className="h-fit"
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No products found
              </h3>
              <p className="mt-2 text-muted-foreground max-w-md">
                Try adjusting your search or filter criteria to find what you're
                looking for.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPlatform("all");
                  setSelectedCategory("all");
                  setPriceRange([MIN_PRICE, MAX_PRICE]);
                  setShowDiscounted(false);
                  setSelectedTags([]);
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
