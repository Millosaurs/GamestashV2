## UI Design and Style Principles (shadcn + Tailwind v4 variables)

These principles govern how all new UI is built. They assume shadcn-style components (Radix primitives + CVA) and Tailwind v4 with CSS variables. Use only Tailwind utilities and semantic tokens defined in `apps/web/src/index.css`.

### Foundations

- **Stack**: React + TypeScript, Tailwind v4, Radix UI, shadcn patterns, CVA, `cn` helper.
- **Tokens**: Use semantic Tailwind tokens only: `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, etc. Do not hardcode colors/hex.
- **Theming**: Respect `.dark` class from `next-themes`. Avoid inline light/dark conditionals; rely on semantic tokens which already change per theme.
- **Typography**: Use `--font-sans` as default. Size with Tailwind utilities, not inline styles.

### Styling conventions

- **Tailwind-first**: Compose UI with utilities. Add one-off CSS only when reusable and colocate in Tailwind layers.
- **Class merging**: Always compose `className` with `cn(...)` to merge and dedupe.
- **Radius & shadows**: Use the provided scale (`rounded-md`, `shadow-xs/sm/md/...`) which maps to CSS vars in `index.css`.
- **Motion**: Prefer small, consistent transitions (`transition-colors`, `transition-shadow`, `duration-200/300`). Respect reduced-motion.

### Component API design (shadcn pattern)

- **Variants with CVA**: Expose `variant` and `size` via CVA. Provide `defaultVariants`.
- **Typing**: Extend intrinsic element props + `VariantProps<typeof variants>` for safety.
- **Polymorphism**: Support `asChild` (Radix `Slot`) when a component should render as another element.
- **Data hooks**: Add `data-slot="component-name"` for styling/tests.
- **Forward refs**: For focusable/form controls, export `forwardRef` components.

Example skeleton:

```tsx
import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-10 px-6",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

type Props = React.ComponentProps<"button"> &
  VariantProps<typeof componentVariants> & { asChild?: boolean };

export function Component({
  className,
  variant,
  size,
  asChild,
  ...props
}: Props) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="component"
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Accessibility

- **Focus**: Never remove focus without replacement. Use `focus-visible:ring-ring/50 focus-visible:ring-[3px]` and semantic borders.
- **ARIA**: Add roles and `aria-*` attributes. Pair inputs with labels. Use Radix primitives for complex widgets (menus, dialogs, popovers, etc.).
- **Contrast**: Ensure WCAG AA in both themes by sticking to semantic tokens.

### States and interaction

- **Disabled**: `disabled:pointer-events-none disabled:opacity-50` + `aria-disabled` when appropriate.
- **Invalid**: Use `aria-invalid` hooks with tokenized rings/borders (e.g., `aria-invalid:ring-destructive/20 aria-invalid:border-destructive`).
- **Hover/active**: Subtle tokenized deltas (e.g., `hover:bg-primary/90`, `hover:bg-accent`). Avoid harsh transforms.
- **Loading**: Prefer inline spinners sized via utilities and set `aria-busy`.

### Layout, spacing, and icons

- **Spacing**: Use Tailwind spacing scale consistently. Tie padding/height to `size` variants (`h-8/9/10`, `px-3/4/6`).
- **Icons**: Default SVG size `size-4`. Keep icon/text gaps consistent (`gap-1.5`/`gap-2`). Ensure icons are non-interactive by default.
- **Responsive**: Mobile-first; use `md:`/`lg:` progressively. Avoid layout shifts; prefer `aspect-*` for media.

### Dark mode

- **Automatic**: Do not hardcode dark colors. Semantic tokens handle theme shifts. Reduce intensity via existing token opacities.

### Do and Don’t

- Do: Use `bg-*/text-*/border-*` semantic utilities; rely on tokens.
- Do: Use CVA for variants/sizes; merge `className` last via `cn(...)`.
- Do: Use Radix primitives for a11y and behaviors.
- Don’t: Hardcode hex colors, arbitrary RGBA, or custom inline styles for color.
- Don’t: Manually concatenate class strings.
- Don’t: Remove focus styles without accessible alternatives.

### Reference tokens

Defined in `apps/web/src/index.css` (OKLCH-backed CSS variables):

- Colors: `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, charts, sidebar.
- Radii: `--radius` mapped to Tailwind `rounded-*` scales.
- Shadows: `--shadow-{2xs,xs,sm,md,lg,xl,2xl}` mapped to `shadow-*` utilities.
- Fonts: `--font-sans`, `--font-mono`, `--font-serif`.

Keep new components consistent with `apps/web/src/components/ui/*` (e.g., `button.tsx`) for focus rings, spacing, and variant naming.
