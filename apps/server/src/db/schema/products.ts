import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  index,
  real,
  jsonb,
} from "drizzle-orm/pg-core";
import { platforms } from "./platforms";
import { categories } from "./categories";

// If you want strict enum for platform/category, you can use pgEnum;
// here we allow via FK relations.

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(), // Your UI uses string ids, but serial/int is better; you can expose slug separately
    slug: varchar("slug", { length: 128 }).notNull(), // for /product/:id or /product/:slug
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
    originalPrice: numeric("original_price", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    discount: integer("discount").notNull().default(0), // percentage integer (0..100)

    platformId: varchar("platform_id", { length: 64 })
      .references(() => platforms.id, { onDelete: "restrict" })
      .notNull(),
    categoryId: varchar("category_id", { length: 64 }).notNull(),

    rating: real("rating").notNull().default(0), // 4.5 etc.
    reviewCount: integer("review_count").notNull().default(0),
    sold: integer("sold").notNull().default(0),

    image: varchar("image", { length: 512 }),
    author: varchar("author", { length: 128 }).notNull(),

    isFeatured: boolean("is_featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),

    // Optional JSONB tags array if you want denormalized tags too (not recommended when using join table)
    tags: jsonb("tags"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index("products_slug_idx").on(table.slug),
    platformIdx: index("products_platform_idx").on(table.platformId),
    categoryIdx: index("products_category_idx").on(table.categoryId),
    priceIdx: index("products_price_idx").on(table.price),
    discountIdx: index("products_discount_idx").on(table.discount),
    featuredIdx: index("products_featured_idx").on(table.isFeatured),
    newIdx: index("products_new_idx").on(table.isNew),
    ratingIdx: index("products_rating_idx").on(table.rating),
    reviewCountIdx: index("products_review_count_idx").on(table.reviewCount),
    soldIdx: index("products_sold_idx").on(table.sold),
  })
);
