import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  index,
  boolean, // ensure lowercase boolean is imported if you need it
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(), 
    title: varchar("title", { length: 256 }),
    body: text("body"),
    author: varchar("author", { length: 128 }),
    // If you had something like Boolean("is_verified") before, switch to:
    // isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    productIdx: index("reviews_product_idx").on(table.productId),
    ratingIdx: index("reviews_rating_idx").on(table.rating),
  })
);
