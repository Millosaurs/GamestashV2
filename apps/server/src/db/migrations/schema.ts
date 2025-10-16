import { pgTable, foreignKey, text, timestamp, unique, boolean, uniqueIndex, varchar, serial, integer, uuid, numeric, real, jsonb, index, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	role: text(),
	banned: boolean(),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { mode: 'string' }),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
	impersonatedBy: text("impersonated_by"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const platforms = pgTable("platforms", {
	id: varchar({ length: 64 }).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("platforms_name_uidx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const tags = pgTable("tags", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 64 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("tags_name_uidx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const categories = pgTable("categories", {
	id: varchar({ length: 64 }).notNull(),
	name: varchar({ length: 128 }).notNull(),
	platformId: varchar("platform_id", { length: 64 }).notNull(),
	cachedCount: integer("cached_count").default(0).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("categories_platform_name_uidx").using("btree", table.platformId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.platformId],
			foreignColumns: [platforms.id],
			name: "categories_platform_id_platforms_id_fk"
		}).onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: varchar({ length: 128 }).notNull(),
	name: varchar({ length: 256 }).notNull(),
	description: text().notNull(),
	content: text().notNull(),
	price: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }).default('0').notNull(),
	discount: integer().default(0).notNull(),
	platformId: varchar("platform_id", { length: 64 }).notNull(),
	categoryId: varchar("category_id", { length: 64 }).notNull(),
	rating: real().default(0).notNull(),
	reviewCount: integer("review_count").default(0).notNull(),
	sold: integer().default(0).notNull(),
	image: varchar({ length: 512 }),
	author: varchar({ length: 128 }).notNull(),
	authorId: varchar("author_id", { length: 64 }),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isNew: boolean("is_new").default(false).notNull(),
	tags: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.platformId],
			foreignColumns: [platforms.id],
			name: "products_platform_id_platforms_id_fk"
		}).onDelete("restrict"),
]);

export const reviews = pgTable("reviews", {
	id: serial().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	rating: integer().notNull(),
	title: varchar({ length: 256 }),
	body: text(),
	author: varchar({ length: 128 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("reviews_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("reviews_rating_idx").using("btree", table.rating.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "reviews_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const productTags = pgTable("product_tags", {
	productId: integer("product_id").notNull(),
	tagId: integer("tag_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "product_tags_tag_id_tags_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.productId, table.tagId], name: "product_tags_pk"}),
]);
