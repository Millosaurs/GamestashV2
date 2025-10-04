// products.ts - Complete version with all procedures
// NOTE: Add this field to your products schema:
// content: text("content"), // Rich text content from editor

import { db } from "../../db";
import { products } from "../../db/schema/products";
import { platforms } from "../../db/schema/platforms";
import { categories } from "../../db/schema/categories";
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

// List products with filters
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

      // Build the base query
      const baseQuery = db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          description: products.description,
          content: products.content,
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

      // Apply sorting
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

      // Remove duplicates if needed
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
        content: product.content,
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

// Get single product by ID or slug
export const getProduct = os
  .input(
    z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
    })
  )
  .handler(async (opt) => {
    const { id, slug } = opt.input;

    if (!id && !slug) {
      throw new Error("Either id or slug must be provided");
    }

    console.log("Fetching single product:", { id, slug });

    try {
      const baseQuery = db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          description: products.description,
          content: products.content,
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

      // Build the where condition based on id or slug
      const condition = id
        ? eq(products.id, parseInt(id))
        : eq(products.slug, slug!);

      const result = await baseQuery.where(condition).limit(1);

      if (result.length === 0) {
        throw new Error("Product not found");
      }

      const product = result[0];

      console.log("Product found:", product.name);

      // Transform to match frontend interface
      return {
        id: product.id.toString(),
        slug: product.slug,
        name: product.name,
        description: product.description,
        content: product.content,
        price: parseFloat(product.price),
        originalPrice: parseFloat(product.originalPrice),
        platform: product.platformId,
        platformName: product.platformName,
        category: product.categoryId,
        categoryName: product.categoryName,
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
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      if (error instanceof Error && error.message === "Product not found") {
        throw error;
      }
      throw new Error("Failed to fetch product");
    }
  });

// Get related products by category and platform
export const getRelatedProducts = os
  .input(
    z.object({
      categoryId: z.string(),
      platformId: z.string(),
      excludeId: z.string().optional(), // Exclude the current product
      limit: z.number().min(1).max(20).optional().default(8),
    })
  )
  .handler(async (opt) => {
    const { categoryId, platformId, excludeId, limit } = opt.input;

    console.log("Fetching related products:", {
      categoryId,
      platformId,
      excludeId,
    });

    try {
      const baseQuery = db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          description: products.description,
          content: products.content,
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

      // Build conditions for related products
      const conditions = [
        or(
          eq(products.categoryId, categoryId),
          eq(products.platformId, platformId)
        ),
      ];

      // Exclude current product if provided
      if (excludeId) {
        conditions.push(sql`${products.id} != ${parseInt(excludeId)}`);
      }

      const result = await baseQuery
        .where(and(...conditions))
        .orderBy(
          desc(products.isFeatured),
          desc(products.rating),
          desc(products.reviewCount)
        )
        .limit(limit);

      console.log("Related products found:", result.length);

      // Transform results
      const transformedProducts = result.map((product) => ({
        id: product.id.toString(),
        slug: product.slug,
        name: product.name,
        description: product.description,
        content: product.content,
        price: parseFloat(product.price),
        originalPrice: parseFloat(product.originalPrice),
        platform: product.platformId,
        platformName: product.platformName,
        category: product.categoryId,
        categoryName: product.categoryName,
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
      console.error("Error fetching related products:", error);
      throw new Error("Failed to fetch related products");
    }
  });

// Get product tags
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

// Get price range
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

// Export all procedures
export const productsRoute = {
  list: listProducts,
  get: getProduct,
  related: getRelatedProducts,
  tags: getProductTags,
  priceRange: getPriceRange,
};
