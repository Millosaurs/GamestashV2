// products.ts - Fixed version
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { platforms } from "@/db/schema/platforms";
import { categories } from "@/db/schema/categories";
import { os } from "@orpc/server";
import {
  eq,
  and,
  gte,
  lte,
  like,
  inArray,
  sql,
  desc,
  asc,
  or,
} from "drizzle-orm";
import { z } from "zod";

const ProductFilterSchema = z.object({
  search: z.string().optional(),
  platformId: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  showDiscounted: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z
    .enum([
      "featured",
      "newest",
      "oldest",
      "price-low",
      "price-high",
      "rating",
      "popular",
    ])
    .optional()
    .default("featured"),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

export const listProducts = os
  .input(ProductFilterSchema)
  .handler(async (opt) => {
    const {
      search,
      platformId,
      categoryId,
      minPrice,
      maxPrice,
      showDiscounted,
      tags,
      sortBy,
      limit,
      offset,
    } = opt.input;

    console.log("Starting products query with filters:", opt.input);

    try {
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            sql`LOWER(${products.name}) LIKE LOWER(${`%${search}%`})`,
            sql`LOWER(${products.description}) LIKE LOWER(${`%${search}%`})`,
            sql`LOWER(${products.author}) LIKE LOWER(${`%${search}%`})`
          )
        );
      }

      if (platformId && platformId !== "all") {
        conditions.push(eq(products.platformId, platformId));
      }

      if (categoryId && categoryId !== "all") {
        conditions.push(eq(products.categoryId, categoryId));
      }

      if (minPrice !== undefined) {
        conditions.push(gte(sql`CAST(${products.price} AS NUMERIC)`, minPrice));
      }

      if (maxPrice !== undefined) {
        conditions.push(lte(sql`CAST(${products.price} AS NUMERIC)`, maxPrice));
      }

      if (showDiscounted) {
        conditions.push(sql`${products.discount} > 0`);
      }

      if (tags && tags.length > 0) {
        const tagConditions = tags.map((tag) => sql`${products.tags} ? ${tag}`);
        conditions.push(or(...tagConditions));
      }

      // Build the base query - REMOVED selectDistinct, use regular select instead
      const baseQuery = db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          description: products.description,
          price: products.price,
          originalPrice: products.originalPrice,
          discount: products.discount,
          platformId: products.platformId,
          categoryId: products.categoryId,
          rating: products.rating,
          reviewCount: products.reviewCount,
          sold: products.sold,
          image: products.image,
          author: products.author,
          isFeatured: products.isFeatured,
          isNew: products.isNew,
          tags: products.tags,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          platformName: platforms.name,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(platforms, eq(products.platformId, platforms.id))
        .leftJoin(categories, eq(products.categoryId, categories.id));

      // Apply WHERE conditions
      const queryWithWhere =
        conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

      // Apply sorting - now this will work because we removed selectDistinct
      let queryWithSort;
      switch (sortBy) {
        case "featured":
          queryWithSort = queryWithWhere.orderBy(
            desc(products.isFeatured),
            desc(products.rating),
            desc(products.id)
          );
          break;
        case "newest":
          queryWithSort = queryWithWhere.orderBy(
            desc(products.createdAt),
            desc(products.id)
          );
          break;
        case "oldest":
          queryWithSort = queryWithWhere.orderBy(
            asc(products.createdAt),
            asc(products.id)
          );
          break;
        case "price-low":
          queryWithSort = queryWithWhere.orderBy(
            asc(sql`CAST(${products.price} AS NUMERIC)`),
            asc(products.id)
          );
          break;
        case "price-high":
          queryWithSort = queryWithWhere.orderBy(
            desc(sql`CAST(${products.price} AS NUMERIC)`),
            desc(products.id)
          );
          break;
        case "rating":
          queryWithSort = queryWithWhere.orderBy(
            desc(products.rating),
            desc(products.reviewCount),
            desc(products.id)
          );
          break;
        case "popular":
          queryWithSort = queryWithWhere.orderBy(
            desc(products.reviewCount),
            desc(products.rating),
            desc(products.id)
          );
          break;
        default:
          queryWithSort = queryWithWhere.orderBy(
            desc(products.isFeatured),
            desc(products.rating),
            desc(products.id)
          );
      }

      // Apply pagination
      const finalQuery = queryWithSort.limit(limit).offset(offset);

      const result = await finalQuery;

      console.log(
        "Products query successful:",
        result.length,
        "products found"
      );

      // If you still need to remove duplicates, do it in JavaScript
      // But typically, if your data model is correct, you shouldn't have duplicates
      const uniqueProducts = result.reduce((acc, product) => {
        if (!acc.find((p) => p.id === product.id)) {
          acc.push(product);
        }
        return acc;
      }, [] as typeof result);

      // Transform the result to match your frontend interface
      const transformedProducts = uniqueProducts.map((product) => ({
        id: product.id.toString(),
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        originalPrice: parseFloat(product.originalPrice),
        platform: product.platformId,
        category: product.categoryId,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        sold: product.sold || 0,
        image: product.image || "/placeholder.svg",
        author: product.author,
        tags: Array.isArray(product.tags) ? (product.tags as string[]) : [],
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        discount: product.discount || 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      return transformedProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  });

// Rest of your exports remain the same...
export const getProductTags = os
  .input(
    z.object({
      platformId: z.string().optional(),
    })
  )
  .handler(async (opt) => {
    const { platformId } = opt.input;

    try {
      const baseQuery = db
        .select({
          tags: products.tags,
        })
        .from(products);

      const query =
        platformId && platformId !== "all"
          ? baseQuery.where(eq(products.platformId, platformId))
          : baseQuery;

      const result = await query;

      const allTags = new Set<string>();
      result.forEach((row) => {
        if (Array.isArray(row.tags)) {
          (row.tags as string[]).forEach((tag: string) => allTags.add(tag));
        }
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error("Error fetching product tags:", error);
      throw new Error("Failed to fetch product tags");
    }
  });

export const getPriceRange = os.handler(async () => {
  try {
    const result = await db
      .select({
        minPrice: sql<number>`MIN(CAST(${products.price} AS NUMERIC))`.as(
          "minPrice"
        ),
        maxPrice: sql<number>`MAX(CAST(${products.price} AS NUMERIC))`.as(
          "maxPrice"
        ),
      })
      .from(products);

    return {
      min: result[0]?.minPrice || 0,
      max: result[0]?.maxPrice || 100,
    };
  } catch (error) {
    console.error("Error fetching price range:", error);
    return { min: 0, max: 100 };
  }
});

export const productsRoute = {
  list: listProducts,
  tags: getProductTags,
  priceRange: getPriceRange,
};
