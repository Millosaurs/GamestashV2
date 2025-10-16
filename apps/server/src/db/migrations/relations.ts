import { relations } from "drizzle-orm/relations";
import { user, account, session, platforms, categories, products, reviews, tags, productTags } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const categoriesRelations = relations(categories, ({one}) => ({
	platform: one(platforms, {
		fields: [categories.platformId],
		references: [platforms.id]
	}),
}));

export const platformsRelations = relations(platforms, ({many}) => ({
	categories: many(categories),
	products: many(products),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	platform: one(platforms, {
		fields: [products.platformId],
		references: [platforms.id]
	}),
	reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	product: one(products, {
		fields: [reviews.productId],
		references: [products.id]
	}),
}));

export const productTagsRelations = relations(productTags, ({one}) => ({
	tag: one(tags, {
		fields: [productTags.tagId],
		references: [tags.id]
	}),
}));

export const tagsRelations = relations(tags, ({many}) => ({
	productTags: many(productTags),
}));