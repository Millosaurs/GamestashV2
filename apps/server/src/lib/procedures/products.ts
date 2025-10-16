// products.ts

import { randomUUID } from "crypto";
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
  ne,
  isNull,
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

const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().optional(),
  price: z.string().min(0, "Price must be positive"),
  originalPrice: z.string().min(0, "Original price must be positive"),
  discount: z.number().min(0).max(100).optional().default(0),
  platformId: z.string().min(1, "Platform is required"),
  categoryId: z.string().min(1, "Category is required"),
  author: z.string().min(1, "Author name is required"),
  authorId: z.string().min(1, "Author ID is required"),
  tags: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
});

// Update product schema (all fields optional except id)
const UpdateProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  content: z.string().optional(),
  price: z.string().optional(),
  originalPrice: z.string().optional(),
  discount: z.number().min(0).max(100).optional(),
  platformId: z.string().optional(),
  categoryId: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
});

// Create new product
export const createProduct = os
  .input(CreateProductSchema)
  .handler(async (opt) => {
    const input = opt.input;

    try {
      // Hardcoded placeholder image
      const image = "/placeholder.svg";

      // Insert the product
      const result = await db
        .insert(products)
        .values({
          id: randomUUID(),
          name: input.name,
          slug: input.slug,
          description: input.description,
          content: input.content || "",
          price: input.price,
          originalPrice: input.originalPrice,
          discount: input.discount,
          platformId: input.platformId,
          categoryId: input.categoryId,
          image: image,
          author: input.author,
          authorId: input.authorId,
          tags: input.tags,
          isFeatured: input.isFeatured,
          isNew: input.isNew,
          rating: 0,
          reviewCount: 0,
          sold: 0,
        })
        .returning();

      console.log("Product created successfully:", result[0].id);

      return {
        success: true,
        product: result[0],
        message: "Product created successfully",
      };
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  });

// Update existing product
export const updateProduct = os
  .input(UpdateProductSchema)
  .handler(async (opt) => {
    const { id, ...updateData } = opt.input;

    try {
      // Check if product exists and is not deleted
      const existingProduct = await db
        .select()
        .from(products)
        .where(and(eq(products.id, id), isNull(products.deletedAt)))
        .limit(1);

      if (existingProduct.length === 0) {
        throw new Error("Product not found or has been deleted");
      }

      // Build update object with only provided fields
      const updateFields: any = {
        ...updateData,
        updatedAt: new Date(),
      };

      // Remove undefined fields
      Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });

      // Update the product
      const result = await db
        .update(products)
        .set(updateFields)
        .where(eq(products.id, id))
        .returning();

      console.log("Product updated successfully:", result[0].id);

      return {
        success: true,
        product: result[0],
        message: "Product updated successfully",
      };
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        throw error;
      }
      throw new Error("Failed to update product");
    }
  });

// Soft delete product
export const deleteProduct = os
  .input(
    z.object({
      id: z.string().min(1, "Product ID is required"),
    })
  )
  .handler(async (opt) => {
    const { id } = opt.input;

    try {
      // Check if product exists and is not already deleted
      const existingProduct = await db
        .select()
        .from(products)
        .where(and(eq(products.id, id), isNull(products.deletedAt)))
        .limit(1);

      if (existingProduct.length === 0) {
        throw new Error("Product not found or already deleted");
      }

      // Soft delete by setting deletedAt timestamp
      const result = await db
        .update(products)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      console.log("Product soft deleted successfully:", result[0].id);

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        throw error;
      }
      throw new Error("Failed to delete product");
    }
  });

// Bulk soft delete products
export const bulkDeleteProducts = os
  .input(
    z.object({
      ids: z.array(z.string()).min(1, "At least one product ID is required"),
    })
  )
  .handler(async (opt) => {
    const { ids } = opt.input;

    try {
      // Soft delete multiple products
      const result = await db
        .update(products)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(inArray(products.id, ids), isNull(products.deletedAt)))
        .returning();

      console.log(`Bulk deleted ${result.length} products`);

      return {
        success: true,
        deletedCount: result.length,
        message: `${result.length} products deleted successfully`,
      };
    } catch (error) {
      console.error("Error bulk deleting products:", error);
      throw new Error("Failed to delete products");
    }
  });

// Restore soft deleted product
// export const restoreProduct = os
//   .input(
//     z.object({
//       id: z.string().min(1, "Product ID is required"),
//     })
//   )
//   .handler(async (opt) => {
//     const { id } = opt.input;

//     try {
//       // Restore by setting deletedAt to null
//       const result = await db
//         .update(products)
//         .set({
//           deletedAt: null,
//           updatedAt: new Date(),
//         })
//         .where(eq(products.id, id))
//         .returning();

//       if (result.length === 0) {
//         throw new Error("Product not found");
//       }

//       console.log("Product restored successfully:", result[0].id);

//       return {
//         success: true,
//         product: result[0],
//         message: "Product restored successfully",
//       };
//     } catch (error) {
//       console.error("Error restoring product:", error);
//       throw new Error("Failed to restore product");
//     }
//   });

// Get user's products (only non-deleted)
export const getUserProducts = os
  .input(
    z.object({
      userId: z.string().min(1, "User ID is required"),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
      sortBy: z
        .enum(["newest", "oldest", "price-low", "price-high", "rating"])
        .optional()
        .default("newest"),
    })
  )
  .handler(async (opt) => {
    const { userId, limit, offset, sortBy } = opt.input;

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
          authorId: products.authorId,
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
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.authorId, userId), isNull(products.deletedAt)));

      // Apply sorting
      let queryWithSort;
      switch (sortBy) {
        case "newest":
          queryWithSort = baseQuery.orderBy(desc(products.createdAt));
          break;
        case "oldest":
          queryWithSort = baseQuery.orderBy(asc(products.createdAt));
          break;
        case "price-low":
          queryWithSort = baseQuery.orderBy(
            asc(sql`CAST(${products.price} AS NUMERIC)`)
          );
          break;
        case "price-high":
          queryWithSort = baseQuery.orderBy(
            desc(sql`CAST(${products.price} AS NUMERIC)`)
          );
          break;
        case "rating":
          queryWithSort = baseQuery.orderBy(desc(products.rating));
          break;
        default:
          queryWithSort = baseQuery.orderBy(desc(products.createdAt));
      }

      const result = await queryWithSort.limit(limit).offset(offset);

      console.log(`Found ${result.length} products for user ${userId}`);

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
        authorId: product.authorId ?? null,
        tags: Array.isArray(product.tags) ? (product.tags as string[]) : [],
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        discount: product.discount || 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      return transformedProducts;
    } catch (error) {
      console.error("Error fetching user products:", error);
      throw new Error("Failed to fetch user products");
    }
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
          authorId: products.authorId,
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
        authorId: product.authorId ?? null,
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

// Get single product by ID
export const getProduct = os
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async (opt) => {
    const { id } = opt.input;

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
          authorId: products.authorId,
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

      // Build the where condition based on id (UUID string)
      const result = await baseQuery.where(eq(products.id, id)).limit(1);

      if (result.length === 0) {
        throw new Error("Product not found");
      }

      const product = result[0];

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
        authorId: product.authorId ?? null,
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
          authorId: products.authorId,
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

      // Exclude current product if provided (UUID string)
      if (excludeId) {
        conditions.push(ne(products.id, excludeId));
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
        authorId: product.authorId ?? null,
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
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  bulkDelete: bulkDeleteProducts,
  related: getRelatedProducts,
  tags: getProductTags,
  priceRange: getPriceRange,
  getUserProducts: getUserProducts,
};
