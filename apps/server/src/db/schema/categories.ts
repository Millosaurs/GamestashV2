import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { platforms } from "./platforms";

export const categories = pgTable(
  "categories",
  {
    id: varchar("id", { length: 64 }).notNull(), // "plugins", "mods", etc. Also allow "all" if you plan to keep it.
    name: varchar("name", { length: 128 }).notNull(),
    platformId: varchar("platform_id", { length: 64 })
      .references(() => platforms.id, { onDelete: "cascade" })
      .notNull(),
    // optional: count is better derived via query, but keep if you want a cached denormalized field
    cachedCount: integer("cached_count").default(0).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.platformId, table.id],
      name: "categories_pk",
    }),
    uniqNamePerPlatform: uniqueIndex("categories_platform_name_uidx").on(
      table.platformId,
      table.name
    ),
  })
);
