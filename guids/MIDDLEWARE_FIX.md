# Middleware Location Fix

## Problem

The middleware was not running at all, allowing unauthenticated access to `/dashboard` routes.

## Root Cause

**Wrong Location**: The middleware file was located at `apps/web/middleware.ts` (project root).

**Correct Location**: With a `src` directory structure, Next.js expects middleware at `apps/web/src/middleware.ts`.

## Next.js Middleware Location Rules

### Without `src` Directory
```
project/
├── app/
├── middleware.ts  ← Place here
└── package.json
```

### With `src` Directory (Your Case)
```
project/
├── src/
│   ├── app/
│   └── middleware.ts  ← Place here
└── package.json
```

## Solution

Moved the middleware file from:
```
apps/web/middleware.ts  ❌
```

To:
```
apps/web/src/middleware.ts  ✅
```

## How Next.js Discovers Middleware

Next.js looks for middleware in these locations (in order):
1. `src/middleware.ts` (if using `src` directory)
2. `src/middleware.js`
3. `middleware.ts` (if NOT using `src` directory)
4. `middleware.js`

**Key Point**: If you have a `src` directory, middleware MUST be inside it!

## Verification

After moving the file, restart your dev server and check the console:

```bash
# You should now see middleware logs
=== MIDDLEWARE TRIGGERED ===
[Middleware] Pathname: /dashboard/products/create
[Middleware] Dashboard route detected, checking authentication...
```

## Testing

### Test 1: Access Protected Route (Not Logged In)
```bash
# Visit: http://localhost:3001/dashboard/products/create
# Expected: Redirect to /auth?callback=/dashboard/products/create
```

### Test 2: Access Protected Route (Logged In)
```bash
# Visit: http://localhost:3001/dashboard/products/create
# Expected: Access granted, page loads
```

### Test 3: Access Public Route
```bash
# Visit: http://localhost:3001/
# Expected: Access granted, no middleware logs
```

## Why This Happened

The `src` directory pattern is optional in Next.js, but when used:
- All source code goes in `src/`
- Middleware must also be in `src/`
- Next.js won't look for middleware outside `src/`

## Project Structure

Your correct structure should be:
```
apps/web/
├── src/
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── middleware.ts     # ✅ Middleware HERE
│   └── index.css
├── public/               # Static assets
├── next.config.ts
└── package.json
```

## Common Mistakes

### ❌ Wrong Locations
```
apps/web/middleware.ts           # Too high up
apps/web/src/app/middleware.ts   # Too deep
apps/web/middleware/index.ts     # Wrong structure
```

### ✅ Correct Location
```
apps/web/src/middleware.ts       # Perfect!
```

## Additional Notes

### File Naming
- ✅ `middleware.ts` (TypeScript)
- ✅ `middleware.js` (JavaScript)
- ❌ `Middleware.ts` (case matters on Linux!)
- ❌ `middleware.tsx` (not a React component)

### Export Requirements
```typescript
// ✅ Correct - default export of async function
export async function middleware(request: NextRequest) {
  // ...
}

// ✅ Correct - config export
export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### Hot Reload
- Middleware changes require a server restart
- If changes aren't picked up, restart the dev server:
  ```bash
  # Stop the server (Ctrl+C)
  bun run dev
  ```

## Debugging Checklist

If middleware still doesn't run:

- [ ] File is at `src/middleware.ts` (not project root)
- [ ] File exports `middleware` function
- [ ] File exports `config` object with `matcher`
- [ ] Dev server was restarted after moving file
- [ ] No TypeScript errors in middleware file
- [ ] Matcher pattern is correct: `"/dashboard/:path*"`

## Related Documentation

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Better-Auth Next.js Integration](https://better-auth.com/docs/integrations/next)
- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)

## Summary

**Issue**: Middleware not running → routes unprotected
**Cause**: Middleware in wrong location (project root instead of `src/`)
**Fix**: Moved to `apps/web/src/middleware.ts`
**Result**: Middleware now runs correctly, all `/dashboard/*` routes protected ✅

Now restart your dev server and the middleware will protect all dashboard routes!
