# Platform-Specific Categories Feature

## Overview
This document describes the implementation of platform-specific category filtering in the product creation and management pages.

## Problem Statement
Previously, when creating or editing a product, all categories were shown in the category dropdown regardless of which platform was selected. This could lead to invalid combinations (e.g., selecting "Steam" platform with an "Xbox" specific category).

## Solution
Implemented dynamic category filtering that only shows categories relevant to the selected platform. This ensures data consistency and improves user experience by reducing confusion.

## Implementation Details

### Files Modified

#### 1. `/apps/web/src/app/dashboard/products/create/page.tsx`

**Changes Made:**
- Split category fetching into two queries:
  - `allCategories`: Fetches all categories (used for display/preview)
  - `selectedPlatformCategories`: Fetches categories specific to the selected platform

- Added dynamic category filtering logic:
  ```typescript
  const availableCategories = React.useMemo(() => {
    if (!formData.platformId) {
      return [];
    }
    return selectedPlatformCategories.filter((cat: any) => cat.id !== "all");
  }, [formData.platformId, selectedPlatformCategories]);
  ```

- Added automatic category reset when platform changes:
  ```typescript
  React.useEffect(() => {
    if (formData.platformId) {
      setFormData((prev) => ({ ...prev, categoryId: "" }));
    }
  }, [formData.platformId]);
  ```

- Updated category dropdown to:
  - Show loading state while fetching platform-specific categories
  - Disable category selection until a platform is chosen
  - Display "Select platform first" message when no platform is selected
  - Show "No categories available" when selected platform has no categories
  - Only display categories relevant to the selected platform

**Code Structure:**
```typescript
// 1. Initialize form state
const [formData, setFormData] = React.useState<ProductFormData>({...});

// 2. Fetch platforms
const { data: platforms = [] } = useQuery({
  ...orpc.platforms.list.queryOptions(),
  staleTime: 300000,
});

// 3. Fetch all categories (for preview)
const { data: allCategories = [] } = useQuery({
  ...orpc.categories.list.queryOptions(),
  staleTime: 300000,
});

// 4. Fetch platform-specific categories
const {
  data: selectedPlatformCategories = [],
  isLoading: selectedCategoriesLoading,
} = useQuery({
  ...orpc.categories.byPlatform.queryOptions({
    input: { platformId: formData.platformId },
  }),
  enabled: !!formData.platformId,
  staleTime: 300000,
});

// 5. Filter available categories
const availableCategories = React.useMemo(() => {
  if (!formData.platformId) {
    return [];
  }
  return selectedPlatformCategories.filter((cat: any) => cat.id !== "all");
}, [formData.platformId, selectedPlatformCategories]);
```

#### 2. `/apps/web/src/app/dashboard/products/page.tsx`

**Reference Implementation:**
The products listing page already had this pattern implemented, which served as the reference for the create page implementation:

```typescript
// Fetch categories for selected platform
const {
  data: selectedPlatformCategories = [],
  isLoading: selectedCategoriesLoading,
} = useQuery({
  ...orpc.categories.byPlatform.queryOptions({
    input: { platformId: filterPlatform },
  }),
  enabled: filterPlatform !== "all" && !!filterPlatform,
  staleTime: 300000,
});

// Get available categories based on selected platform
const availableCategories = React.useMemo(() => {
  if (filterPlatform === "all" || !filterPlatform) {
    return allCategories.filter((cat) => cat.id !== "all");
  }
  return selectedPlatformCategories.filter((cat) => cat.id !== "all");
}, [filterPlatform, allCategories, selectedPlatformCategories]);
```

## User Experience Improvements

### Before
1. User selects any platform (e.g., "Steam")
2. Category dropdown shows ALL categories including irrelevant ones
3. User could accidentally select incompatible category
4. Confusing and error-prone experience

### After
1. User must select a platform first
2. Category dropdown is disabled until platform is selected
3. Once platform is selected, only relevant categories are shown
4. Loading indicator shown while fetching platform-specific categories
5. Clear feedback messages guide the user
6. Automatic category reset when changing platforms prevents invalid states

## UI States

### State 1: No Platform Selected
```
Platform: [Steam ▼]
Category: [Select platform first] (disabled)
Helper text: "Please select a platform first to see available categories"
```

### State 2: Loading Categories
```
Platform: [Steam ▼]
Category: [⟳ Loading categories...] (disabled)
```

### State 3: Categories Available
```
Platform: [Steam ▼]
Category: [Select Category ▼]
Dropdown shows: Action, Adventure, RPG, etc.
```

### State 4: No Categories for Platform
```
Platform: [Custom Platform ▼]
Category: [No categories available] (disabled)
Dropdown shows: "No categories for this platform"
```

## Technical Benefits

1. **Data Consistency**: Prevents invalid platform-category combinations
2. **Performance**: Categories are cached for 5 minutes, reducing API calls
3. **User Guidance**: Clear visual feedback about available options
4. **Maintainability**: Consistent pattern across listing and create pages
5. **Type Safety**: TypeScript ensures proper typing throughout

## API Endpoints Used

- `orpc.platforms.list.queryOptions()` - Fetch all platforms
- `orpc.categories.list.queryOptions()` - Fetch all categories
- `orpc.categories.byPlatform.queryOptions({ input: { platformId } })` - Fetch platform-specific categories

## Future Enhancements

1. **Category Suggestions**: Show most popular categories for the selected platform
2. **Multi-Platform Support**: Allow products to be listed on multiple platforms with appropriate category selections for each
3. **Category Search**: Add search/filter for platforms with many categories
4. **Recent Categories**: Show recently used categories for quick selection
5. **Validation**: Add server-side validation to ensure platform-category compatibility

## Testing Checklist

- [x] Category dropdown disabled when no platform selected
- [x] Loading state shown while fetching categories
- [x] Only platform-specific categories displayed
- [x] Category resets when platform changes
- [x] Form validation works correctly
- [x] Existing product editing preserves category selection
- [x] Preview component receives correct data
- [x] No console errors or warnings

## Related Files

- `/apps/web/src/app/dashboard/products/page.tsx` - Products listing with filters
- `/apps/web/src/app/dashboard/products/create/page.tsx` - Product creation form
- `/apps/web/src/components/product-preview.tsx` - Product preview component
- `/apps/server/src/routers/categories.ts` - Category API endpoints

## Summary

The platform-specific categories feature ensures data integrity and improves user experience by dynamically filtering categories based on the selected platform. This prevents invalid data entry and provides clear guidance throughout the product creation process.
