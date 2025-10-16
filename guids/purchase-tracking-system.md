# Purchase Tracking & Download Verification System

This guide explains how to set up a complete purchase tracking system with download verification logic to ensure only users who have purchased a product can download its files.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Purchase Tracking Logic](#purchase-tracking-logic)
3. [Download Verification](#download-verification)
4. [Implementation Steps](#implementation-steps)
5. [Usage Examples](#usage-examples)

---

## Database Schema

### 1. Create Purchases Table

First, we need to track all purchases in the database.

Create/update `apps/server/src/db/schema.ts`:

```typescript
import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    integer,
    decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Existing products table (add if not exists)
export const products = pgTable("products", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    content: text("content").default(""),
    price: text("price").notNull(),
    originalPrice: text("original_price").notNull(),
    discount: integer("discount").default(0),
    platformId: text("platform_id").notNull(),
    categoryId: text("category_id").notNull(),
    image: text("image").notNull(),
    files: jsonb("files")
        .$type<
            {
                name: string;
                key: string;
                size: number;
                type: string;
            }[]
        >()
        .default([]),
    author: text("author").notNull(),
    authorId: text("author_id").notNull(),
    rating: integer("rating").default(0),
    reviewCount: integer("review_count").default(0),
    sold: integer("sold").default(0),
    isFeatured: boolean("is_featured").default(false),
    isNew: boolean("is_new").default(false),
    tags: text("tags").array().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table (if not exists)
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatar: text("avatar"),
    role: text("role").default("user"), // user, developer, admin
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Purchases table - tracks all product purchases
export const purchases = pgTable("purchases", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),

    // Payment information
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),
    paymentMethod: text("payment_method"), // stripe, paypal, etc.
    paymentId: text("payment_id"), // external payment gateway transaction ID
    paymentStatus: text("payment_status").notNull(), // pending, completed, failed, refunded

    // Purchase metadata
    purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
    isRefunded: boolean("is_refunded").default(false),
    refundDate: timestamp("refund_date"),
    refundReason: text("refund_reason"),

    // Additional tracking
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Downloads table - tracks every file download
export const downloads = pgTable("downloads", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    purchaseId: text("purchase_id")
        .notNull()
        .references(() => purchases.id, { onDelete: "cascade" }),

    // Download details
    fileKey: text("file_key").notNull(), // S3 file key
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size"), // in bytes

    // Download metadata
    downloadDate: timestamp("download_date").defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    // Rate limiting
    downloadAttempts: integer("download_attempts").default(1),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const purchasesRelations = relations(purchases, ({ one }) => ({
    user: one(users, {
        fields: [purchases.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [purchases.productId],
        references: [products.id],
    }),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
    user: one(users, {
        fields: [downloads.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [downloads.productId],
        references: [products.id],
    }),
    purchase: one(purchases, {
        fields: [downloads.purchaseId],
        references: [purchases.id],
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
    purchases: many(purchases),
    downloads: many(downloads),
}));

export const productsRelations = relations(products, ({ many }) => ({
    purchases: many(purchases),
    downloads: many(downloads),
}));
```

### 2. Generate and Run Migrations

```bash
cd apps/server
bun run db:generate  # Generate migration files
bun run db:migrate   # Apply migrations to database
```

---

## Purchase Tracking Logic

### Create Purchase Procedures

Create `apps/server/src/lib/procedures/purchases.ts`:

```typescript
import { z } from "zod";
import { os } from "../orpc";
import { db } from "../db";
import { purchases, products } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// Schema for creating a purchase
const CreatePurchaseSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    userId: z.string().min(1, "User ID is required"),
    amount: z.string(),
    currency: z.string().default("USD"),
    paymentMethod: z.string(),
    paymentId: z.string(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
});

// Schema for checking purchase status
const CheckPurchaseSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    userId: z.string().min(1, "User ID is required"),
});

// Schema for getting user purchases
const GetUserPurchasesSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
});

// Create a new purchase
export const createPurchase = os
    .input(CreatePurchaseSchema)
    .handler(async (opt) => {
        const input = opt.input;

        try {
            // Check if product exists
            const product = await db.query.products.findFirst({
                where: eq(products.id, input.productId),
            });

            if (!product) {
                throw new Error("Product not found");
            }

            // Check if user already purchased this product
            const existingPurchase = await db.query.purchases.findFirst({
                where: and(
                    eq(purchases.userId, input.userId),
                    eq(purchases.productId, input.productId),
                    eq(purchases.paymentStatus, "completed"),
                    eq(purchases.isRefunded, false),
                ),
            });

            if (existingPurchase) {
                return {
                    success: false,
                    message: "You have already purchased this product",
                    purchase: existingPurchase,
                };
            }

            // Create purchase record
            const newPurchase = await db
                .insert(purchases)
                .values({
                    id: randomUUID(),
                    userId: input.userId,
                    productId: input.productId,
                    amount: input.amount,
                    currency: input.currency,
                    paymentMethod: input.paymentMethod,
                    paymentId: input.paymentId,
                    paymentStatus: "completed", // Set to completed after payment verification
                    ipAddress: input.ipAddress,
                    userAgent: input.userAgent,
                })
                .returning();

            // Update product sold count
            await db
                .update(products)
                .set({
                    sold: product.sold + 1,
                    updatedAt: new Date(),
                })
                .where(eq(products.id, input.productId));

            return {
                success: true,
                message: "Purchase created successfully",
                purchase: newPurchase[0],
            };
        } catch (error) {
            console.error("Error creating purchase:", error);
            throw new Error("Failed to create purchase");
        }
    });

// Check if user has purchased a product
export const checkPurchase = os
    .input(CheckPurchaseSchema)
    .handler(async (opt) => {
        const { productId, userId } = opt.input;

        try {
            const purchase = await db.query.purchases.findFirst({
                where: and(
                    eq(purchases.userId, userId),
                    eq(purchases.productId, productId),
                    eq(purchases.paymentStatus, "completed"),
                    eq(purchases.isRefunded, false),
                ),
            });

            return {
                hasPurchased: !!purchase,
                purchase: purchase || null,
            };
        } catch (error) {
            console.error("Error checking purchase:", error);
            throw new Error("Failed to check purchase status");
        }
    });

// Get all purchases for a user
export const getUserPurchases = os
    .input(GetUserPurchasesSchema)
    .handler(async (opt) => {
        const { userId, limit, offset } = opt.input;

        try {
            const userPurchases = await db.query.purchases.findMany({
                where: eq(purchases.userId, userId),
                with: {
                    product: true,
                },
                orderBy: [desc(purchases.purchaseDate)],
                limit,
                offset,
            });

            return {
                success: true,
                purchases: userPurchases,
            };
        } catch (error) {
            console.error("Error fetching user purchases:", error);
            throw new Error("Failed to fetch user purchases");
        }
    });

// Get purchase by ID
export const getPurchaseById = os
    .input(z.object({ purchaseId: z.string() }))
    .handler(async (opt) => {
        const { purchaseId } = opt.input;

        try {
            const purchase = await db.query.purchases.findFirst({
                where: eq(purchases.id, purchaseId),
                with: {
                    product: true,
                    user: true,
                },
            });

            if (!purchase) {
                throw new Error("Purchase not found");
            }

            return {
                success: true,
                purchase,
            };
        } catch (error) {
            console.error("Error fetching purchase:", error);
            throw new Error("Failed to fetch purchase");
        }
    });

export const purchaseRouter = {
    create: createPurchase,
    check: checkPurchase,
    getUserPurchases,
    getById: getPurchaseById,
};
```

---

## Download Verification

### Create Download Procedures with Verification

Create `apps/server/src/lib/procedures/downloads.ts`:

```typescript
import { z } from "zod";
import { os } from "../orpc";
import { db } from "../db";
import { downloads, purchases, products } from "../db/schema";
import { eq, and, desc, count, gte } from "drizzle-orm";
import { randomUUID } from "crypto";
import { generateFileDownloadUrl } from "../s3";

// Schema for requesting file download
const RequestDownloadSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    fileKey: z.string().min(1, "File key is required"),
    userId: z.string().min(1, "User ID is required"),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
});

// Schema for getting download history
const GetDownloadHistorySchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    productId: z.string().optional(),
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
});

// Configuration for download limits
const DOWNLOAD_CONFIG = {
    MAX_DOWNLOADS_PER_DAY: 10, // Max downloads per product per day
    DOWNLOAD_URL_EXPIRY: 300, // 5 minutes
};

// Request a file download with verification
export const requestDownload = os
    .input(RequestDownloadSchema)
    .handler(async (opt) => {
        const { productId, fileKey, userId, ipAddress, userAgent } = opt.input;

        try {
            // Step 1: Verify user has purchased the product
            const purchase = await db.query.purchases.findFirst({
                where: and(
                    eq(purchases.userId, userId),
                    eq(purchases.productId, productId),
                    eq(purchases.paymentStatus, "completed"),
                    eq(purchases.isRefunded, false),
                ),
            });

            if (!purchase) {
                return {
                    success: false,
                    error: "PURCHASE_NOT_FOUND",
                    message:
                        "You must purchase this product before downloading",
                };
            }

            // Step 2: Verify the file belongs to this product
            const product = await db.query.products.findFirst({
                where: eq(products.id, productId),
            });

            if (!product) {
                return {
                    success: false,
                    error: "PRODUCT_NOT_FOUND",
                    message: "Product not found",
                };
            }

            const files = product.files as Array<{
                name: string;
                key: string;
                size: number;
                type: string;
            }>;

            const file = files.find((f) => f.key === fileKey);

            if (!file) {
                return {
                    success: false,
                    error: "FILE_NOT_FOUND",
                    message: "File not found in this product",
                };
            }

            // Step 3: Check download rate limits (optional)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const recentDownloads = await db
                .select({ count: count() })
                .from(downloads)
                .where(
                    and(
                        eq(downloads.userId, userId),
                        eq(downloads.productId, productId),
                        gte(downloads.downloadDate, oneDayAgo),
                    ),
                );

            const downloadCount = recentDownloads[0]?.count || 0;

            if (downloadCount >= DOWNLOAD_CONFIG.MAX_DOWNLOADS_PER_DAY) {
                return {
                    success: false,
                    error: "RATE_LIMIT_EXCEEDED",
                    message: `You have reached the maximum download limit (${DOWNLOAD_CONFIG.MAX_DOWNLOADS_PER_DAY} per day) for this product`,
                };
            }

            // Step 4: Generate presigned download URL
            const downloadUrl = await generateFileDownloadUrl(
                fileKey,
                DOWNLOAD_CONFIG.DOWNLOAD_URL_EXPIRY,
            );

            // Step 5: Record the download
            await db.insert(downloads).values({
                id: randomUUID(),
                userId,
                productId,
                purchaseId: purchase.id,
                fileKey,
                fileName: file.name,
                fileSize: file.size,
                ipAddress,
                userAgent,
                downloadAttempts: 1,
            });

            return {
                success: true,
                downloadUrl,
                fileName: file.name,
                fileSize: file.size,
                expiresIn: DOWNLOAD_CONFIG.DOWNLOAD_URL_EXPIRY,
                message: "Download URL generated successfully",
            };
        } catch (error) {
            console.error("Error requesting download:", error);
            throw new Error("Failed to generate download URL");
        }
    });

// Get download history for a user
export const getDownloadHistory = os
    .input(GetDownloadHistorySchema)
    .handler(async (opt) => {
        const { userId, productId, limit, offset } = opt.input;

        try {
            const conditions = [eq(downloads.userId, userId)];

            if (productId) {
                conditions.push(eq(downloads.productId, productId));
            }

            const downloadHistory = await db.query.downloads.findMany({
                where: and(...conditions),
                with: {
                    product: true,
                    purchase: true,
                },
                orderBy: [desc(downloads.downloadDate)],
                limit,
                offset,
            });

            return {
                success: true,
                downloads: downloadHistory,
            };
        } catch (error) {
            console.error("Error fetching download history:", error);
            throw new Error("Failed to fetch download history");
        }
    });

// Get download stats for a product (for developers)
export const getProductDownloadStats = os
    .input(z.object({ productId: z.string() }))
    .handler(async (opt) => {
        const { productId } = opt.input;

        try {
            // Total downloads
            const totalDownloads = await db
                .select({ count: count() })
                .from(downloads)
                .where(eq(downloads.productId, productId));

            // Unique users who downloaded
            const uniqueUsers = await db
                .selectDistinct({ userId: downloads.userId })
                .from(downloads)
                .where(eq(downloads.productId, productId));

            // Recent downloads (last 30 days)
            const thirtyDaysAgo = new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000,
            );
            const recentDownloads = await db
                .select({ count: count() })
                .from(downloads)
                .where(
                    and(
                        eq(downloads.productId, productId),
                        gte(downloads.downloadDate, thirtyDaysAgo),
                    ),
                );

            return {
                success: true,
                stats: {
                    totalDownloads: totalDownloads[0]?.count || 0,
                    uniqueDownloaders: uniqueUsers.length,
                    downloadsLast30Days: recentDownloads[0]?.count || 0,
                },
            };
        } catch (error) {
            console.error("Error fetching download stats:", error);
            throw new Error("Failed to fetch download stats");
        }
    });

export const downloadRouter = {
    request: requestDownload,
    getHistory: getDownloadHistory,
    getStats: getProductDownloadStats,
};
```

---

## Implementation Steps

### 1. Add Routers to Main Server

In `apps/server/src/routers/index.ts`:

```typescript
import { purchaseRouter } from "../lib/procedures/purchases";
import { downloadRouter } from "../lib/procedures/downloads";
import { uploadRoute } from "../lib/procedures/upload";
import { productsRoute } from "../lib/procedures/products";

export const appRouter = {
    products: productsRoute,
    purchases: purchaseRouter,
    downloads: downloadRouter,
    upload: uploadRoute,
    // ... other routes
};

export type AppRouter = typeof appRouter;
```

### 2. ORPC Client Setup (Already Configured)

Your ORPC client should already be set up in `apps/web/src/utils/orpc.ts`:

```typescript
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { appRouter } from "../../../server/src/routers/index";
import type { RouterClient } from "@orpc/server";

export const link = new RPCLink({
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc`,
    fetch(url, options) {
        return fetch(url, {
            ...options,
            credentials: "include",
        });
    },
});

export const client: RouterClient<typeof appRouter> = createORPCClient(link);
```

You can now call procedures directly from any component:

```typescript
import { client } from "@/utils/orpc";

// Example usage
const result = await client.purchases.create({ ... });
```

### 3. Create Purchase Flow Component

Create `apps/web/src/components/purchase-button.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api/client";
import { useAuth } from "@/hooks/use-auth"; // Your auth hook

interface PurchaseButtonProps {
  productId: string;
  productName: string;
  price: string;
}

export function PurchaseButton({ productId, productName, price }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // Your auth hook

  const handlePurchase = async () => {
    if (!user) {
      alert("Please sign in to purchase");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Process payment with your payment gateway (Stripe, PayPal, etc.)
      // This is a placeholder - implement your actual payment logic
      const paymentResult = await processPayment({
        amount: price,
        productName,
      });

      if (!paymentResult.success) {
        throw new Error("Payment failed");
      }

      // Step 2: Record purchase in your database using ORPC
      const result = await client.purchases.create({
        productId,
        userId: user.id,
        amount: price,
        currency: "USD",
        paymentMethod: paymentResult.method,
        paymentId: paymentResult.transactionId,
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent,
      });

      if (result.success) {
        alert("Purchase successful! You can now download the product.");
        window.location.reload(); // Refresh to show download buttons
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to complete purchase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePurchase} disabled={isLoading}>
      {isLoading ? "Processing..." : `Purchase for ${price}`}
    </Button>
  );
}

// Placeholder payment function - replace with actual payment gateway
async function processPayment(data: { amount: string; productName: string }) {
  // Implement Stripe, PayPal, or other payment gateway here
  return {
    success: true,
    method: "stripe",
    transactionId: "txn_" + Math.random().toString(36).substr(2, 9),
  };
}
```

### 4. Create Download Button Component

Create `apps/web/src/components/download-button.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { client } from "@/utils/orpc";
import { useAuth } from "@/hooks/use-auth";

interface DownloadButtonProps {
  productId: string;
  fileKey: string;
  fileName: string;
  fileSize?: number;
}

export function DownloadButton({
  productId,
  fileKey,
  fileName,
  fileSize
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return ` (${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]})`;
  };

  const handleDownload = async () => {
    if (!user) {
      alert("Please sign in to download");
      return;
    }

    setIsDownloading(true);

    try {
      // Request download URL with verification
      const result = await client.downloads.request({
        productId,
        fileKey,
        userId: user.id,
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent,
      });

      if (!result.success) {
        // Handle different error types
        switch (result.error) {
          case "PURCHASE_NOT_FOUND":
            alert("You must purchase this product before downloading.");
            break;
          case "FILE_NOT_FOUND":
            alert("File not found. Please contact support.");
            break;
          case "RATE_LIMIT_EXCEEDED":
            alert(result.message);
            break;
          default:
            alert("Failed to generate download link. Please try again.");
        }
        return;
      }

      // Download the file
      window.open(result.downloadUrl, "_blank");

      // Optional: Show success message
      alert(`Downloading ${fileName}. The link expires in ${result.expiresIn / 60} minutes.`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant="outline"
      size="sm"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Preparing...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {fileName}{formatFileSize(fileSize)}
        </>
      )}
    </Button>
  );
}
```

### 5. Update Product Page to Show Purchase/Download Status

Create `apps/web/src/app/products/[slug]/page.tsx` or update your existing product page:

```typescript
"use client";

import { useEffect, useState } from "react";
import { client } from "@/utils/orpc";
import { useAuth } from "@/hooks/use-auth";
import { PurchaseButton } from "@/components/purchase-button";
import { DownloadButton } from "@/components/download-button";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadProductAndPurchaseStatus() {
      try {
        // Load product details
        const productData = await client.products.getBySlug({ slug: params.slug });
        setProduct(productData.product);

        // Check if user has purchased
        if (user) {
          const purchaseStatus = await client.purchases.check({
            productId: productData.product.id,
            userId: user.id,
          });
          setHasPurchased(purchaseStatus.hasPurchased);
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProductAndPurchaseStatus();
  }, [params.slug, user]);

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-600 mb-6">{product.description}</p>

      {/* Product Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full max-w-2xl mb-6 rounded-lg"
      />

      {/* Purchase or Download Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {!user ? (
          <div>
            <p className="mb-4">Please sign in to purchase this product</p>
            <Button onClick={() => window.location.href = "/signin"}>
              Sign In
            </Button>
          </div>
        ) : hasPurchased ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Download Files</h2>
            <p className="text-green-600 mb-4">✓ You own this product</p>

            {/* Download Files */}
            <div className="space-y-2">
              {product.files?.map((file: any, index: number) => (
                <DownloadButton
                  key={index}
                  productId={product.id}
                  fileKey={file.key}
                  fileName={file.name}
                  fileSize={file.size}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Purchase This Product</h2>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.originalPrice !== product.price && (
                <span className="text-xl text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <div className="mt-4">
              <PurchaseButton
                productId={product.id}
                productName={product.name}
                price={product.price}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Usage Examples

### Example 1: Check if User Has Purchased a Product

```typescript
// In any component or page
const { user } = useAuth();

const checkPurchaseStatus = async (productId: string) => {
    if (!user) return false;

    const result = await client.purchases.check({
        productId,
        userId: user.id,
    });

    return result.hasPurchased;
};
```

### Example 2: Request a Download

```typescript
// When user clicks download button
const downloadFile = async (productId: string, fileKey: string) => {
    const result = await client.downloads.request({
        productId,
        fileKey,
        userId: user.id,
    });

    if (result.success) {
        // Open download URL in new tab
        window.open(result.downloadUrl, "_blank");
    } else {
        // Handle error
        alert(result.message);
    }
};
```

### Example 3: Get User's Purchase History

```typescript
// In user dashboard or library page
const loadPurchaseHistory = async () => {
    const result = await client.purchases.getUserPurchases({
        userId: user.id,
        limit: 20,
        offset: 0,
    });

    console.log("User purchases:", result.purchases);
};
```

### Example 4: Track Download Analytics (for Developers)

```typescript
// In developer dashboard
const loadDownloadStats = async (productId: string) => {
  const result = await client.downloads.getStats({
    productId,
  });

  console.log("Download stats:", result
```
