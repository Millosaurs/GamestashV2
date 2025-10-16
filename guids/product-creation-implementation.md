# Product Creation & Update Implementation Guide

This document explains the complete implementation of product creation and update functionality using ORPC with optimistic UI updates.

---

## Overview

The product creation/update form is fully integrated with:

- ✅ **ORPC procedures** for all backend operations
- ✅ **Optimistic UI updates** for instant feedback
- ✅ **Toast notifications** for user feedback
- ✅ **Image compression** before S3 upload
- ✅ **File uploads** to S3 with protected access
- ✅ **Automatic slug generation** from product name
- ✅ **Auto-calculated discounts** from pricing
- ✅ **Form validation** with error messages
- ✅ **Better Auth session** for user authentication and author identification

---

## Architecture

### **Frontend (`apps/web/src/app/dashboard/products/create/page.tsx`)**

The page uses:

- `@tanstack/react-query` for data fetching and mutations
- `orpc` utilities for type-safe API calls
- `useSession` from Better Auth (`@/lib/auth-client`) for user authentication
- `useMutation` for optimistic updates
- `useQuery` for fetching platforms, categories, and existing product data

### **Backend (`apps/server/src/lib/procedures/products.ts`)**

Procedures available:

- `createProduct` - Create new product
- `updateProduct` - Update existing product
- `getProduct` - Fetch single product by ID
- `listProducts` - List all products with filtering

---

## Data Flow

### **Create Product Flow:**

1. User fills out the form
2. User uploads image → Compressed → Uploaded to S3 → Public URL returned
3. User uploads files (optional) → Uploaded to S3 → File keys stored
4. User clicks "Create Product"
5. Form validates all fields
6. Gets user info from session (`author`, `authorId`)
7. Calls `createProduct` mutation with optimistic UI
8. Toast shows "Creating..." → "Product created successfully!"
9. Redirects to `/dashboard/products` after 1 second

### **Update Product Flow:**

1. Page loads with `productId` from URL query
2. Fetches existing product data via `orpc.products.get`
3. Populates form with existing data
4. User modifies fields
5. User clicks "Update Product"
6. Calls `updateProduct` mutation with optimistic UI
7. Toast shows "Updating..." → "Product updated successfully!"
8. Redirects to `/dashboard/products` after 1 second

---

## Better Auth Integration

### **Session Hook Usage**

```typescript
import { useSession } from "@/lib/auth-client";

function ProductFormContent() {
    const { data: session } = useSession();

    // session.user.id - User ID for authorId
    // session.user.name - User name for author
    // session.user.email - User email
}
```

### **Auth Client Setup**

The auth client is already configured in `apps/web/src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});

export const { signIn, signOut, signUp, useSession } = authClient;
```

### **Author Information from Session**

When creating/updating a product, the author information is automatically extracted from the Better Auth session:

```typescript
// Check if user is authenticated
if (!session?.user) {
    toast.error("You must be logged in to create products");
    return;
}

// Get user info from Better Auth session
const author = session.user.name || "Unknown User";
const authorId = session.user.id;
```

This ensures:

- ✅ Only authenticated users can create/update products
- ✅ Author name and ID are automatically populated
- ✅ Products are properly attributed to the correct user
- ✅ No need to manually enter author information

---

## Form Fields

### **Required Fields:**

- ✅ Product Name (auto-generates slug)
- ✅ Slug (auto-generated, editable in edit mode)
- ✅ Description (rich text editor)
- ✅ Current Price (USD)
- ✅ Original Price (USD)
- ✅ Platform (dropdown)
- ✅ Category (dropdown)
- ✅ Product Image (S3 upload with compression)

### **Optional Fields:**

- Product Files (S3 upload, protected)
- Tags (comma-separated)
- Featured (checkbox)
- New (checkbox)

### **Auto-Calculated Fields:**

- Discount Percentage (from prices)
- Rating (default: 0)
- Review Count (default: 0)
- Sold (default: 0)

---

## Component Integration

### **ImageUpload Component**

```typescript
<ImageUpload
  value={formData.image}
  onChange={(url) => handleInputChange("image", url)}
  disabled={isLoading}
/>
```

**Features:**

- Automatic image compression (max 1MB, 1920px)
- Shows compression ratio
- Toast notifications for each step
- Deletes from S3 when removed

### **FileUpload Component**

```typescript
<FileUpload
  value={formData.files}
  onChange={(files) => handleInputChange("files", files)}
  disabled={isLoading}
  maxFiles={5}
/>
```

**Features:**

- Multiple file upload (max 5 files, 100MB each)
- Shows upload progress for each file
- Stores file metadata (name, key, size, type)
- Deletes from S3 when removed

---

## Mutations

### **Create Product Mutation**

```typescript
const createProductMutation = useMutation({
    ...orpc.products.create.mutationOptions(),
    onSuccess: (data) => {
        toast.success("Product created successfully!", {
            description: `${data.product.name} has been added to your catalog.`,
        });
        setTimeout(() => {
            router.push("/dashboard/products");
        }, 1000);
    },
    onError: (error) => {
        toast.error("Failed to create product", {
            description:
                error instanceof Error ? error.message : "Unknown error",
        });
    },
});
```

### **Update Product Mutation**

```typescript
const updateProductMutation = useMutation({
    ...orpc.products.update.mutationOptions(),
    onSuccess: (data) => {
        toast.success("Product updated successfully!", {
            description: `${data.product.name} has been updated.`,
        });
        setTimeout(() => {
            router.push("/dashboard/products");
        }, 1000);
    },
    onError: (error) => {
        toast.error("Failed to update product", {
            description:
                error instanceof Error ? error.message : "Unknown error",
        });
    },
});
```

---

## Queries

### **Fetch Platforms**

```typescript
const { data: platforms = [] } = useQuery({
    ...orpc.platforms.list.queryOptions(),
});
```

### **Fetch Categories**

```typescript
const { data: categories = [] } = useQuery({
    ...orpc.categories.list.queryOptions(),
});
```

### **Fetch Existing Product (Edit Mode)**

```typescript
const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
    ...orpc.products.get.queryOptions({ input: { id: productId || "" } }),
    enabled: isEditMode && !!productId,
});
```

---

## Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate form
    if (!validateForm()) {
        toast.error("Please fix all errors before submitting");
        return;
    }

    // 2. Check authentication
    if (!session?.user) {
        toast.error("You must be logged in to create products");
        return;
    }

    // 3. Get user info from Better Auth session
    const author = session.user.name || "Unknown User";
    const authorId = session.user.id;

    // 4. Parse tags
    const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

    // 5. Prepare product data
    const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        content: formData.content || "",
        price: formData.price,
        originalPrice: formData.originalPrice,
        discount: formData.discount,
        platformId: formData.platformId,
        categoryId: formData.categoryId,
        image: formData.image,
        files: formData.files,
        author,
        authorId,
        tags,
        isFeatured: formData.isFeatured,
        isNew: formData.isNew,
    };

    // 6. Submit (create or update)
    if (isEditMode && productId) {
        updateProductMutation.mutate({ id: productId, ...productData });
    } else {
        createProductMutation.mutate(productData);
    }
};
```

---

## Validation Rules

```typescript
const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
        newErrors.name = "Product name is required";
    }

    if (!formData.slug?.trim()) {
        newErrors.slug = "Slug is required";
    }

    if (!formData.description.trim() || formData.description === "<p></p>") {
        newErrors.description = "Product description is required";
    }

    // Pricing validation
    if (!formData.price || parseFloat(formData.price) < 0) {
        newErrors.price = "Valid price is required";
    }

    if (!formData.originalPrice || parseFloat(formData.originalPrice) < 0) {
        newErrors.originalPrice = "Valid original price is required";
    }

    // Price comparison
    if (formData.price && formData.originalPrice) {
        const price = parseFloat(formData.price);
        const originalPrice = parseFloat(formData.originalPrice);
        if (price > originalPrice) {
            newErrors.price = "Price cannot be greater than original price";
        }
    }

    // Classification
    if (!formData.platformId) {
        newErrors.platformId = "Platform selection is required";
    }

    if (!formData.categoryId) {
        newErrors.categoryId = "Category selection is required";
    }

    // Image
    if (!formData.image) {
        newErrors.image = "Product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
```

---

## Auto-Generated Fields

### **Slug from Name**

```typescript
React.useEffect(() => {
    if (!isEditMode && formData.name) {
        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        setFormData((prev) => ({ ...prev, slug }));
    }
}, [formData.name, isEditMode]);
```

### **Discount from Prices**

```typescript
React.useEffect(() => {
    if (formData.price && formData.originalPrice) {
        const price = parseFloat(formData.price);
        const originalPrice = parseFloat(formData.originalPrice);
        if (price > 0 && originalPrice > 0 && originalPrice > price) {
            const calculatedDiscount = Math.round(
                ((originalPrice - price) / originalPrice) * 100,
            );
            setFormData((prev) => ({ ...prev, discount: calculatedDiscount }));
        } else if (price >= originalPrice) {
            setFormData((prev) => ({ ...prev, discount: 0 }));
        }
    }
}, [formData.price, formData.originalPrice]);
```

---

## Optimistic UI Features

### **Loading States:**

- ⏳ Shows "Creating..." or "Updating..." on submit button
- ⏳ Disables all form fields during submission
- ⏳ Toast notifications show progress

### **Success Handling:**

- ✅ Toast shows success message with product name
- ✅ Automatically redirects to products list after 1 second
- ✅ Form data is cleared on successful creation

### **Error Handling:**

- ❌ Toast shows error message with description
- ❌ Form stays open for user to fix issues
- ❌ Form fields remain enabled to allow editing

---

## Backend Schema

```typescript
const CreateProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().min(1, "Description is required"),
    content: z.string().optional(),
    price: z.string().min(0, "Price must be positive"),
    originalPrice: z.string().min(0, "Original price must be positive"),
    discount: z.number().min(0).max(100).optional().default(0),
    platformId: z.string().min(1, "Platform is required"),
    categoryId: z.string().min(1, "Category is required"),
    image: z.string().url("Valid image URL is required"),
    files: z
        .array(
            z.object({
                name: z.string(),
                key: z.string(),
                size: z.number(),
                type: z.string(),
            }),
        )
        .optional()
        .default([]),
    author: z.string().min(1, "Author name is required"),
    authorId: z.string().min(1, "Author ID is required"),
    tags: z.array(z.string()).optional().default([]),
    isFeatured: z.boolean().optional().default(false),
    isNew: z.boolean().optional().default(false),
});
```

---

## Testing the Implementation

### **Create New Product:**

1. Navigate to `/dashboard/products/create`
2. Fill out all required fields
3. Upload an image (watch compression toast)
4. Optionally upload files
5. Click "Create Product"
6. Watch toast notifications
7. Verify redirect to `/dashboard/products`

### **Edit Existing Product:**

1. Navigate to `/dashboard/products/create?id={productId}`
2. Verify form is populated with existing data
3. Modify any fields
4. Click "Update Product"
5. Watch toast notifications
6. Verify redirect to `/dashboard/products`

---

## Error Scenarios

### **Not Authenticated:**

- Shows toast: "You must be logged in to create products"
- Form submission is blocked

### **Validation Errors:**

- Shows toast: "Please fix all errors before submitting"
- Scrolls to first error field
- Shows error messages under each invalid field

### **Upload Failures:**

- Image upload failure: Shows toast with S3 error
- File upload failure: Shows toast with filename and error
- Deletes successfully uploaded files if one fails

### **Server Errors:**

- Shows toast: "Failed to create/update product"
- Includes error description from server
- Form stays open for retry

---

## Best Practices

✅ **Always validate before submitting**
✅ **Show loading states during async operations**
✅ **Provide clear error messages**
✅ **Use optimistic updates for better UX**
✅ **Compress images before uploading**
✅ **Store file metadata, not file content**
✅ **Use session for user identification**
✅ **Redirect after successful operations**
✅ **Clean up S3 files on errors**
✅ **Use toast notifications for feedback**

---

## Future Enhancements

- [ ] Add draft/publish workflow
- [ ] Add product preview before publishing
- [ ] Add version history
- [ ] Add bulk import from CSV
- [ ] Add image cropping/editing
- [ ] Add file type validation
- [ ] Add SEO metadata fields
- [ ] Add product variants
- [ ] Add inventory management
- [ ] Add scheduled publishing

---

## Authentication Requirements

### **User Must Be Logged In**

The form checks for authentication before allowing product creation/updates:

```typescript
if (!session?.user) {
    toast.error("You must be logged in to create products");
    return;
}
```

### **Session Data Structure**

Better Auth provides the following session data:

```typescript
session = {
    user: {
        id: string, // Used for authorId
        name: string, // Used for author
        email: string,
        emailVerified: boolean,
        image: string,
        createdAt: Date,
        updatedAt: Date,
    },
    session: {
        id: string,
        userId: string,
        expiresAt: Date,
        token: string,
        ipAddress: string,
        userAgent: string,
    },
};
```

### **Protected Routes**

To ensure only authenticated users can access the product creation page, you can add middleware:

```typescript
// apps/web/middleware.ts
import { auth } from "@/lib/auth";

export async function middleware(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    const isProtectedRoute = request.url.includes("/dashboard/products/create");

    if (isProtectedRoute && !session) {
        return Response.redirect(new URL("/signin", request.url));
    }
}
```

---

## Related Documentation

- [S3 Upload Setup Guide](./s3-upload-setup.md)
- [Purchase Tracking System](./purchase-tracking-system.md)
- [ORPC Integration Guide](../apps/web/src/utils/orpc.ts)
- [Better Auth Documentation](https://better-auth.com)
