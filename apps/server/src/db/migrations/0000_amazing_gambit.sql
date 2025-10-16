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
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"platform_id" varchar(64) NOT NULL,
	"cached_count" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"product_id" uuid NOT NULL,
	"purchase_id" uuid,
	"file_id" uuid NOT NULL,
	"file_version" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_key" varchar(512) NOT NULL,
	"download_url" text,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"ip_address" varchar(45),
	"user_agent" text,
	"download_source" varchar(50) DEFAULT 'web' NOT NULL,
	"download_status" varchar(50) DEFAULT 'initiated' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "product_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_key" varchar(512) NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_latest" boolean DEFAULT true NOT NULL,
	"previous_version_id" uuid,
	"uploaded_by" varchar(64),
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(64),
	"notes" text,
	"checksum" varchar(64),
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
	"image" text NOT NULL,
	"files" jsonb DEFAULT '[]'::jsonb,
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
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"product_id" uuid NOT NULL,
	"purchase_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"final_price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"transaction_id" varchar(255),
	"payment_metadata" jsonb,
	"order_number" varchar(100) NOT NULL,
	"invoice_url" text,
	"file_snapshot" jsonb,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	"refunded_at" timestamp with time zone,
	"notes" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_transaction_id_unique" UNIQUE("transaction_id"),
	CONSTRAINT "purchases_order_number_unique" UNIQUE("order_number")
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
	"product_id" uuid NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "product_tags_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_file_id_product_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."product_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_previous_version_id_product_files_id_fk" FOREIGN KEY ("previous_version_id") REFERENCES "public"."product_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_id_idx" ON "categories" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_platform_name_uidx" ON "categories" USING btree ("platform_id","name");--> statement-breakpoint
CREATE INDEX "downloads_user_id_idx" ON "downloads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "downloads_product_id_idx" ON "downloads" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "downloads_purchase_id_idx" ON "downloads" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "downloads_file_id_idx" ON "downloads" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "downloads_downloaded_at_idx" ON "downloads" USING btree ("downloaded_at");--> statement-breakpoint
CREATE INDEX "downloads_download_status_idx" ON "downloads" USING btree ("download_status");--> statement-breakpoint
CREATE UNIQUE INDEX "platforms_name_uidx" ON "platforms" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_files_product_id_idx" ON "product_files" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_files_file_key_idx" ON "product_files" USING btree ("file_key");--> statement-breakpoint
CREATE INDEX "product_files_version_idx" ON "product_files" USING btree ("version");--> statement-breakpoint
CREATE INDEX "product_files_is_latest_idx" ON "product_files" USING btree ("is_latest");--> statement-breakpoint
CREATE INDEX "product_files_is_deleted_idx" ON "product_files" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "product_files_uploaded_by_idx" ON "product_files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "product_files_uploaded_at_idx" ON "product_files" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_platform_idx" ON "products" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price");--> statement-breakpoint
CREATE INDEX "products_discount_idx" ON "products" USING btree ("discount");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "products_new_idx" ON "products" USING btree ("is_new");--> statement-breakpoint
CREATE INDEX "products_rating_idx" ON "products" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "products_review_count_idx" ON "products" USING btree ("review_count");--> statement-breakpoint
CREATE INDEX "products_sold_idx" ON "products" USING btree ("sold");--> statement-breakpoint
CREATE INDEX "products_author_id_idx" ON "products" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "purchases_user_id_idx" ON "purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "purchases_product_id_idx" ON "purchases" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "purchases_payment_status_idx" ON "purchases" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "purchases_transaction_id_idx" ON "purchases" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "purchases_order_number_idx" ON "purchases" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "purchases_purchased_at_idx" ON "purchases" USING btree ("purchased_at");--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_uidx" ON "tags" USING btree ("name");