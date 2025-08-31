import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL || "");

export * from "./schema/platforms";
export * from "./schema/categories";
export * from "./schema/products";
export * from "./schema/tags";
export * from "./schema/reviews";
