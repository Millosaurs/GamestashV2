import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // "all", "minecraft", "roblox", "fivem", "websites"
    name: varchar("name", { length: 128 }).notNull(),
    // optional: description or icon
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    nameIdx: uniqueIndex("platforms_name_uidx").on(table.name),
  })
);
