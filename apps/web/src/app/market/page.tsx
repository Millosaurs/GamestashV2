// MarketPage.tsx - With Caching Added

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
import PriceSlider from "@/components/price-slider";
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

const SORT_OPTIONS = [
  { value: "featured" as const, label: "Featured First" },
  { value: "newest" as const, label: "Newest First" },
  { value: "oldest" as const, label: "Oldest First" },
  { value: "price-low" as const, label: "Price: Low to High" },
  { value: "price-high" as const, label: "Price: High to Low" },
  { value: "rating" as const, label: "Highest Rated" },
  { value: "popular" as const, label: "Most Popular" },
];

// Input Component (no changes)
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

// Interfaces (no changes)
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

// Filter Sidebar Component (no changes)
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
  minPrice = 0,
  maxPrice = 100,
  showDiscounted,
  setShowDiscounted,
  selectedTags,
  setSelectedTags,
  availableTags = [],
  tagsLoading = false,
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
  minPrice?: number;
  maxPrice?: number;
  showDiscounted: boolean;
  setShowDiscounted: (show: boolean) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  availableTags?: string[];
  tagsLoading?: boolean;
  onClose?: () => void;
}) {
  const handleTagChange = (tag: string, checked: boolean) => {
    setSelectedTags((prev) =>
      checked ? [...prev, tag] : prev.filter((t) => t !== tag)
    );
  };

  const PRICE_MIN = 0;
  const PRICE_MAX = 500;

  const clearAllFilters = () => {
    setSelectedPlatform("all");
    setSelectedCategory("all");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setShowDiscounted(false);
    setSelectedTags([]);
  };

  const hasActiveFilters =
    selectedPlatform !== "all" ||
    selectedCategory !== "all" ||
    priceRange[0] !== minPrice ||
    priceRange[1] !== maxPrice ||
    showDiscounted ||
    selectedTags.length > 0;

  const currentPlatform = platforms.find((p) => p.id === selectedPlatform);
  const availableCategories = currentPlatform?.categories || [];

  React.useEffect(() => {
    setSelectedCategory("all");
  }, [selectedPlatform, setSelectedCategory]);

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
                  key={`${selectedPlatform}-${category.id}`}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                    selectedCategory === category.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{category.name}</span>
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
          min={minPrice}
          max={maxPrice}
          value={priceRange}
          onValueChange={(next) => {
            const clampedMin = Math.max(minPrice, Math.min(maxPrice, next[0]));
            const clampedMax = Math.max(minPrice, Math.min(maxPrice, next[1]));
            setPriceRange([clampedMin, clampedMax]);
          }}
          onApply={undefined}
        />

        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>${priceRange[0].toLocaleString()}</span>
          <span>${priceRange[1].toLocaleString()}+</span>
        </div>
      </div>

      {/* Tags */}
      {!platformsLoading && !categoriesLoading && availableTags.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Hash className="size-3" />
            Tags
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {tagsLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Loading tags...
              </div>
            ) : (
              availableTags.map((tag) => (
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
              ))
            )}
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
    0, 100,
  ]);
  const [showDiscounted, setShowDiscounted] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<
    | "featured"
    | "newest"
    | "oldest"
    | "price-low"
    | "price-high"
    | "rating"
    | "popular"
  >("featured");
  const [showFilters, setShowFilters] = React.useState(false);

  const currentSortLabel = React.useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort",
    [sortBy]
  );

  const PRICE_MIN = 0;
  const PRICE_MAX = 500;

  // Fetch platforms
  const {
    data: platforms = [],
    isLoading: platformsLoading,
    error: platformsError,
  } = useQuery({
    ...orpc.platforms.list.queryOptions(),
    staleTime: 15000, // ⭐ Cache for 15 seconds
  });

  // Fetch all categories
  const {
    data: allCategories = [],
    isLoading: allCategoriesLoading,
    error: allCategoriesError,
  } = useQuery({
    ...orpc.categories.list.queryOptions(),
    staleTime: 15000, // ⭐ Cache for 15 seconds
  });

  // Fetch categories for selected platform
  const {
    data: selectedPlatformCategories = [],
    isLoading: selectedCategoriesLoading,
  } = useQuery({
    ...orpc.categories.byPlatform.queryOptions({
      input: { platformId: selectedPlatform },
    }),
    enabled: selectedPlatform !== "all" && selectedPlatform !== "",
    staleTime: 15000, // ⭐ Cache for 15 seconds
  });

  // Fetch available tags
  const { data: availableTags = [], isLoading: tagsLoading } = useQuery({
    ...orpc.products.tags.queryOptions({
      input: {
        platformId: selectedPlatform !== "all" ? selectedPlatform : undefined,
      },
    }),
    staleTime: 15000, // ⭐ Cache for 15 seconds
  });

  // Fetch products with filters
  const productsInput = React.useMemo(
    () => ({
      search: searchQuery || undefined,
      platformId: selectedPlatform !== "all" ? selectedPlatform : undefined,
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      minPrice: priceRange[0] > PRICE_MIN ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < PRICE_MAX ? priceRange[1] : undefined,
      showDiscounted: showDiscounted ? true : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy,
      limit: 100,
    }),
    [
      searchQuery,
      selectedPlatform,
      selectedCategory,
      priceRange,
      showDiscounted,
      selectedTags,
      sortBy,
    ]
  );

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    ...orpc.products.list.queryOptions({
      input: productsInput,
    }),
    staleTime: 15000, // ⭐ Cache for 15 seconds
  });

  // Build platforms structure for FilterSidebar
  const PLATFORMS = React.useMemo(() => {
    if (platformsLoading || allCategoriesLoading || !platforms) {
      return [];
    }

    const allPlatformsOption = {
      id: "all",
      name: "All Platforms",
      categories: [
        { id: "all", name: "All Categories", count: products.length },
      ],
    };

    const transformedPlatforms = platforms
      .filter((platform) => platform.id !== "all")
      .map((platform) => {
        const categoriesToUse =
          platform.id === selectedPlatform &&
          selectedPlatformCategories.length > 0
            ? selectedPlatformCategories.filter((cat) => cat.id !== "all")
            : allCategories.filter(
                (cat) => cat.platformId === platform.id && cat.id !== "all"
              );

        const allCategoriesOption = {
          id: "all",
          name: "All Categories",
          count: products.filter((p) => p.platform === platform.id).length,
        };

        const categoryOptions = categoriesToUse.map((cat) => ({
          id: cat.id,
          name: cat.name,
          count:
            cat.count ||
            products.filter(
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
    products,
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
              minPrice={PRICE_MIN}
              maxPrice={PRICE_MAX}
              showDiscounted={showDiscounted}
              setShowDiscounted={setShowDiscounted}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              availableTags={availableTags}
              tagsLoading={tagsLoading}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r bg-background">
        <div className="border-0 p-6 pt-10">
          <h1 className="text-2xl font-bold text-foreground">Market</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover premium digital products
          </p>
        </div>

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
            minPrice={PRICE_MIN}
            maxPrice={PRICE_MAX}
            showDiscounted={showDiscounted}
            setShowDiscounted={setShowDiscounted}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            availableTags={availableTags}
            tagsLoading={tagsLoading}
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

              <Button variant="default" size="sm" className="px-3">
                <Grid3X3 className="size-4" />
              </Button>

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
              {productsLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-3 animate-spin" />
                  Loading products...
                </span>
              ) : (
                <>
                  {products.length} products found
                  {selectedPlatform !== "all" && (
                    <span className="ml-1">
                      in{" "}
                      {PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="ml-1">
                      •{" "}
                      {
                        PLATFORMS.find(
                          (p) => p.id === selectedPlatform
                        )?.categories.find((c) => c.id === selectedCategory)
                          ?.name
                      }
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Products Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                <span>Loading products...</span>
              </div>
            </div>
          ) : productsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6">
                <AlertCircle className="size-8 text-destructive" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Error loading products
              </h3>
              <p className="mt-2 text-muted-foreground max-w-md">
                There was an error loading the products. Please try again.
              </p>
              <pre className="mt-2 text-xs text-destructive bg-muted p-2 rounded">
                {JSON.stringify(productsError, null, 2)}
              </pre>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {products.map((product, index) => {
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

                const uniqueKey = product.id
                  ? `${product.id}-${index}`
                  : `product-${index}`;

                return (
                  <OverlayCard
                    key={uniqueKey}
                    image={product.image}
                    imageAlt={product.name}
                    title={product.name}
                    description={product.description}
                    author={product.author}
                    price={product.price === 0 ? "Free" : `$${product.price}`}
                    rating={product.rating}
                    sold={product.sold}
                    badges={badges}
                    href={`/product/${product.slug || product.id}`}
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
                  const min = PRICE_MIN || 0;
                  const max = PRICE_MAX || 100;
                  setPriceRange([min, max]);
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
