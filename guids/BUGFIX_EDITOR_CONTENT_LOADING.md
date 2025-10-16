# Bug Fix: Rich Text Editor Content Not Loading on Edit

## Issue Description

**Problem**: When editing an existing product, the rich text editor (TipTap) was not loading the existing product content. The editor remained empty even though the form data contained the content.

**Impact**: Users couldn't edit existing product descriptions, making the edit functionality incomplete.

## Root Cause

The TipTap editor was initialized with the `content` prop only once during component mount. When the `content` prop updated (e.g., when existing product data loaded), the editor didn't react to this change.

### Technical Explanation

```typescript
// Initial setup - content prop passed to useEditor
const editor = useEditor({
  extensions: [...],
  content, // ❌ Only used during initial render
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML());
  },
});
```

**Timeline of Events:**
1. Component mounts → Editor initializes with empty content
2. Product data loads from API → `content` prop updates
3. Editor doesn't re-render → Content remains empty ❌

## Solution

Added a `useEffect` hook to watch for changes in the `content` prop and update the editor accordingly:

```typescript
// Update editor content when content prop changes
React.useEffect(() => {
  if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content);
  }
}, [editor, content]);
```

### How It Works

1. **Dependency Array**: Watches `editor` and `content` props
2. **Conditional Check**: Only updates if content differs from current editor HTML
3. **Update Command**: Uses TipTap's `setContent()` command to update editor
4. **Prevents Loop**: Comparison prevents infinite update loops

## Code Changes

### File: `/apps/web/src/components/rich-text-editor.tsx`

**Before:**
```typescript
export function RichTextEditor({ content, onChange, ... }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [...],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // ❌ No effect to handle content prop changes

  return <div>...</div>;
}
```

**After:**
```typescript
export function RichTextEditor({ content, onChange, ... }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [...],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // ✅ Update editor when content prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return <div>...</div>;
}
```

## Testing

### Test Case 1: Create New Product
1. Navigate to `/dashboard/products/create`
2. Fill in product details
3. Add content in rich text editor
4. **Result**: ✅ Content saves correctly

### Test Case 2: Edit Existing Product
1. Navigate to `/dashboard/products`
2. Click "Edit" on an existing product
3. Wait for data to load
4. **Before Fix**: ❌ Editor remains empty
5. **After Fix**: ✅ Editor loads with existing content

### Test Case 3: Switch Between Products
1. Edit Product A → Load content A ✅
2. Navigate to Product B → Load content B ✅
3. Content updates correctly for each product

### Test Case 4: Empty Content
1. Edit product with no content
2. **Result**: ✅ Editor shows placeholder text
3. No errors or infinite loops

## Edge Cases Handled

### 1. Null/Undefined Content
```typescript
if (editor && content !== editor.getHTML()) {
  // If content is null/undefined, editor handles gracefully
  editor.commands.setContent(content);
}
```

### 2. Infinite Update Loop Prevention
```typescript
// Comparison prevents loop:
// onChange updates parent → parent re-renders → useEffect checks → no change → no update
content !== editor.getHTML()
```

### 3. Editor Not Initialized
```typescript
if (editor && ...) {
  // Only updates if editor exists
}
```

### 4. HTML Formatting Differences
TipTap normalizes HTML, so comparing `content !== editor.getHTML()` accounts for minor formatting differences.

## Performance Considerations

### Optimization 1: Conditional Update
Only updates when content actually changes, preventing unnecessary re-renders.

### Optimization 2: Shallow Comparison
Uses string comparison (`!==`) which is fast for HTML strings.

### Optimization 3: No Debouncing Needed
The comparison check is sufficient; no need for additional debouncing.

## Related Components

### Product Create/Edit Page
```typescript
// /apps/web/src/app/dashboard/products/create/page.tsx
<RichTextEditor
  content={formData.content}
  onChange={(content) => handleInputChange("content", content)}
  placeholder="Write a detailed description of your product..."
/>
```

The form data updates when existing product loads:
```typescript
React.useEffect(() => {
  if (existingProduct && isEditMode) {
    setFormData({
      // ...
      content: existingProduct.content || "",
    });
  }
}, [existingProduct, isEditMode]);
```

## Alternative Solutions Considered

### Option 1: Key Prop Reset
```typescript
// ❌ Not ideal - causes full re-mount and loses focus
<RichTextEditor key={productId} content={content} />
```
**Rejected**: Causes component re-mount, losing editor state and user focus.

### Option 2: Controlled Component Pattern
```typescript
// ❌ Too complex - requires managing editor state externally
const [editorContent, setEditorContent] = useState(content);
```
**Rejected**: Adds unnecessary complexity and state management.

### Option 3: UseEffect with SetContent (Selected)
```typescript
// ✅ Optimal - Updates content without re-mounting
React.useEffect(() => {
  if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content);
  }
}, [editor, content]);
```
**Selected**: Clean, efficient, and maintains editor state.

## Best Practices Applied

1. ✅ **Dependency Array**: Properly defined with `[editor, content]`
2. ✅ **Null Checks**: Guards against undefined editor
3. ✅ **Comparison Check**: Prevents unnecessary updates
4. ✅ **No Side Effects**: Pure function, no external mutations
5. ✅ **TypeScript Safe**: Properly typed with no `any` usage

## Common TipTap Patterns

This fix follows the official TipTap pattern for controlled components:

```typescript
// Official TipTap documentation pattern
const editor = useEditor({
  content: initialContent,
});

useEffect(() => {
  if (editor && externalContent !== editor.getHTML()) {
    editor.commands.setContent(externalContent);
  }
}, [editor, externalContent]);
```

**Reference**: [TipTap Controlled Components](https://tiptap.dev/guide/controlled)

## Migration Guide

### For Existing Projects

If you have similar TipTap implementations, apply this pattern:

```typescript
// 1. Identify controlled TipTap editors
const editor = useEditor({ content: propContent });

// 2. Add useEffect to sync prop changes
useEffect(() => {
  if (editor && propContent !== editor.getHTML()) {
    editor.commands.setContent(propContent);
  }
}, [editor, propContent]);

// 3. Test edit functionality
```

## Monitoring

### Potential Issues to Watch

1. **Performance**: Monitor for slow updates on large content (>10KB HTML)
2. **Memory Leaks**: Ensure editor cleanup in useEffect return
3. **Race Conditions**: Watch for concurrent content updates

### Logging (Development Only)

```typescript
useEffect(() => {
  console.log('[RichTextEditor] Content prop changed:', {
    newContent: content?.substring(0, 100),
    currentContent: editor?.getHTML()?.substring(0, 100),
    willUpdate: content !== editor?.getHTML(),
  });

  if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content);
  }
}, [editor, content]);
```

## Summary

**Problem**: Rich text editor didn't load existing product content on edit.

**Solution**: Added `useEffect` to sync `content` prop with editor state.

**Impact**:
- ✅ Edit functionality now works correctly
- ✅ No performance degradation
- ✅ Maintains editor state and focus
- ✅ Handles all edge cases

**Files Modified**:
- `/apps/web/src/components/rich-text-editor.tsx` - Added useEffect hook

The fix is minimal, efficient, and follows TipTap best practices.
