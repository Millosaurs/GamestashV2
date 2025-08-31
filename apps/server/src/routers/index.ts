import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { z } from "zod";
import { db } from "../db";
import { products, platforms, categories } from "../db";
import { eq, desc, asc, like, and, or, gte, lte, inArray } from "drizzle-orm";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }: any) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),

  // Platform procedures
  getPlatforms: publicProcedure.handler(async () => {
    const result = await db.select().from(platforms).orderBy(asc(platforms.name));
    return result;
  }),

  // Category procedures
  getCategories: publicProcedure
    .input(z.object({
      platformId: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const query = input.platformId 
        ? db.select().from(categories).where(eq(categories.platformId, input.platformId))
        : db.select().from(categories);
      
      const result = await query.orderBy(asc(categories.name));
      return result;
    }),

  // Product procedures
  getProducts: publicProcedure
    .input(z.object({
      platformId: z.string().optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
      sortBy: z.enum(["featured", "newest", "oldest", "price-low", "price-high", "rating", "popular"]).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .handler(async ({ input }) => {
      const conditions = [];

      if (input.platformId && input.platformId !== "all") {
        conditions.push(eq(products.platformId, input.platformId));
      }

      if (input.categoryId && input.categoryId !== "all") {
        conditions.push(eq(products.categoryId, input.categoryId));
      }

      if (input.search) {
        conditions.push(
          or(
            like(products.name, `%${input.search}%`),
            like(products.description, `%${input.search}%`),
            like(products.author, `%${input.search}%`)
          )
        );
      }

      if (input.minPrice !== undefined) {
        conditions.push(gte(products.price, input.minPrice.toString()));
      }

      if (input.maxPrice !== undefined) {
        conditions.push(lte(products.price, input.maxPrice.toString()));
      }

      let baseQuery = db.select().from(products);

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      // Apply sorting
      let result;
      switch (input.sortBy) {
        case "featured":
          result = await baseQuery.orderBy(desc(products.isFeatured), desc(products.rating)).limit(input.limit).offset(input.offset);
          break;
        case "newest":
          result = await baseQuery.orderBy(desc(products.createdAt)).limit(input.limit).offset(input.offset);
          break;
        case "oldest":
          result = await baseQuery.orderBy(asc(products.createdAt)).limit(input.limit).offset(input.offset);
          break;
        case "price-low":
          result = await baseQuery.orderBy(asc(products.price)).limit(input.limit).offset(input.offset);
          break;
        case "price-high":
          result = await baseQuery.orderBy(desc(products.price)).limit(input.limit).offset(input.offset);
          break;
        case "rating":
          result = await baseQuery.orderBy(desc(products.rating)).limit(input.limit).offset(input.offset);
          break;
        case "popular":
          result = await baseQuery.orderBy(desc(products.sold)).limit(input.limit).offset(input.offset);
          break;
        default:
          result = await baseQuery.orderBy(desc(products.isFeatured), desc(products.createdAt)).limit(input.limit).offset(input.offset);
      }

      return result;
    }),

  getProduct: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .handler(async ({ input }) => {
      const result = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      return result[0] || null;
    }),

  getProductBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .handler(async ({ input }) => {
      const result = await db.select().from(products).where(eq(products.slug, input.slug)).limit(1);
      return result[0] || null;
    }),

  getFeaturedProducts: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .handler(async ({ input }) => {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.isFeatured, true))
        .orderBy(desc(products.rating))
        .limit(input.limit);
      return result;
    }),

  getNewProducts: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .handler(async ({ input }) => {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.isNew, true))
        .orderBy(desc(products.createdAt))
        .limit(input.limit);
      return result;
    }),

  getProductsByPlatform: publicProcedure
    .input(z.object({
      platformId: z.string(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .handler(async ({ input }) => {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.platformId, input.platformId))
        .orderBy(desc(products.rating))
        .limit(input.limit);
      return result;
    }),

  getProductsByCategory: publicProcedure
    .input(z.object({
      platformId: z.string(),
      categoryId: z.string(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .handler(async ({ input }) => {
      const result = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.platformId, input.platformId),
            eq(products.categoryId, input.categoryId)
          )
        )
        .orderBy(desc(products.rating))
        .limit(input.limit);
      return result;
    }),

  searchProducts: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .handler(async ({ input }) => {
      const result = await db
        .select()
        .from(products)
        .where(
          or(
            like(products.name, `%${input.query}%`),
            like(products.description, `%${input.query}%`),
            like(products.author, `%${input.query}%`)
          )
        )
        .orderBy(desc(products.rating))
        .limit(input.limit);
      return result;
    }),
} as any;

export type AppRouter = typeof appRouter;
