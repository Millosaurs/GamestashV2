-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"platform_id" varchar(64) NOT NULL,
	"cached_count" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"original_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"platform_id" varchar(64) NOT NULL,
	"category_id" varchar(64) NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"sold" integer DEFAULT 0 NOT NULL,
	"image" varchar(512),
	"author" varchar(128) NOT NULL,
	"author_id" varchar(64),
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"tags" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(256),
	"body" text,
	"author" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"product_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "product_tags_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "platforms_name_uidx" ON "platforms" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_uidx" ON "tags" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "categories_platform_name_uidx" ON "categories" USING btree ("platform_id" text_ops,"name" text_ops);--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating" int4_ops);
*/