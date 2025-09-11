// categories.ts
import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import { products } from "@/db/schema/products";
import { os } from "@orpc/server";
import { eq, sql, count } from "drizzle-orm";
import { z } from "zod";

export const listCategories = os.handler(async () => {
  console.log("Starting categories query...");

  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        platformId: categories.platformId,
        description: categories.description,
        count: sql<number>`COALESCE(${count(products.id)}, 0)`.as("count"),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .where(sql`${categories.id} != 'all'`) // Exclude 'all' categories from DB
      .groupBy(
        categories.id,
        categories.name,
        categories.platformId,
        categories.description
      )
      .orderBy(categories.platformId, categories.name)
      .limit(50); // Add limit like platforms

    console.log(
      "Categories query successful:",
      result.length,
      "categories found"
    );
    return result;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
});

export const listCategoriesByPlatform = os
  .input(
    z.object({
      platformId: z.string(),
    })
  )
  .handler(async (opt) => {
    const { platformId } = opt.input;
    console.log("Starting categories query for platform:", platformId);

    try {
      const result = await db
        .select({
          id: categories.id,
          name: categories.name,
          platformId: categories.platformId,
          description: categories.description,
          count: sql<number>`COALESCE(${count(products.id)}, 0)`.as("count"),
        })
        .from(categories)
        .leftJoin(products, eq(categories.id, products.categoryId))
        .where(
          sql`${categories.platformId} = ${platformId} AND ${categories.id} != 'all'`
        ) // Exclude 'all' categories from DB
        .groupBy(
          categories.id,
          categories.name,
          categories.platformId,
          categories.description
        )
        .orderBy(categories.name)
        .limit(50); // Add limit like platforms

      console.log(
        `Categories query for ${platformId} successful:`,
        result.length,
        "categories found"
      );
      return result;
    } catch (error) {
      console.error(
        "Error fetching categories for platform:",
        platformId,
        error
      );
      throw new Error("Failed to fetch categories");
    }
  });

export const categoriesRoute = {
  list: listCategories,
  byPlatform: listCategoriesByPlatform,
};
