import {
  pgTable,
  serial,
  varchar,
  timestamp,
  primaryKey,
  uniqueIndex,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    nameUidx: uniqueIndex("tags_name_uidx").on(table.name),
  })
);

export const productTags = pgTable(
  "product_tags",
  {
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    tagId: integer("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.productId, table.tagId],
      name: "product_tags_pk",
    }),
  })
);
