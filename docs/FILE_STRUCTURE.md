# GameStash v2 - File Structure

This document outlines the file structure of the GameStash v2 project, a monorepo built with Turbo and Bun.

## Project Overview

GameStash v2 is a monorepo containing multiple applications:

- **Web App** - Next.js frontend application
- **Server** - Backend API server
- **FumaDocs** - Documentation site

## Root Structure

```
gamestashv2/
├── apps/                    # Application packages
│   ├── web/                # Next.js web application
│   ├── server/             # Backend API server
│   └── fumadocs/           # Documentation site
├── docs/                   # Project documentation
│   └── ui-design-principles.md
├── node_modules/           # Dependencies
├── package.json            # Root package configuration
├── turbo.json              # Turbo build configuration
├── bun.lock                # Bun lockfile
├── bunfig.toml             # Bun configuration
├── bts.jsonc               # Bun TypeScript configuration
└── README.md               # Project readme
```

## Apps Structure

### Web Application (`apps/web/`)

```
apps/web/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── about/          # About page
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── developers/     # Developer pages
│   │   ├── market/         # Market pages
│   │   ├── product/        # Product pages
│   │   ├── simple/         # Simple pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── favicon.ico     # Site favicon
│   ├── components/         # React components
│   │   ├── ui/             # UI components (shadcn/ui)
│   │   ├── forgeui/       # ForgeUI components
│   │   ├── magicui/       # MagicUI components
│   │   ├── animate-ui/     # Animated UI components
│   │   ├── categories.tsx  # Category components
│   │   ├── dev-card.tsx    # Developer card component
│   │   ├── featured-products.tsx
│   │   ├── footer.tsx      # Footer component
│   │   ├── header.tsx      # Header component
│   │   ├── hero-section.tsx
│   │   ├── loader.tsx      # Loading component
│   │   ├── logo.tsx        # Logo component
│   │   ├── mode-toggle.tsx # Theme toggle
│   │   ├── overlay-card.tsx
│   │   ├── price-slider.tsx
│   │   ├── providers.tsx   # Context providers
│   │   ├── rte.tsx         # Rich text editor
│   │   ├── sign-in-form.tsx
│   │   ├── sign-up-form.tsx
│   │   ├── theme-provider.tsx
│   │   └── user-menu.tsx   # User menu component
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── styles/             # Styling files
│   └── index.css           # Global styles
├── public/                 # Static assets
├── components.json         # shadcn/ui configuration
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.tsbuildinfo    # TypeScript build info
├── package.json            # Web app dependencies
└── next-env.d.ts           # Next.js type definitions
```

### Server Application (`apps/server/`)

```
apps/server/
├── src/
│   ├── app/                # API routes
│   │   ├── api/            # API endpoints
│   │   ├── rpc/            # RPC endpoints
│   │   └── route.ts        # Main route handler
│   ├── db/                 # Database related files
│   ├── lib/                # Server utilities
│   ├── routers/            # API routers
│   └── middleware.ts       # Server middleware
├── drizzle.config.ts       # Drizzle ORM configuration
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Server dependencies
└── next-env.d.ts           # Next.js type definitions
```

### Documentation Site (`apps/fumadocs/`)

```
apps/fumadocs/
├── src/
│   ├── app/                # Next.js App Router
│   ├── lib/                # Documentation utilities
│   └── mdx-components.tsx  # MDX component configuration
├── content/                # Documentation content
├── next.config.mjs         # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── source.config.ts        # FumaDocs configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Documentation dependencies
├── README.md               # Documentation readme
└── next-env.d.ts           # Next.js type definitions
```

## Key Technologies

- **Monorepo Management**: Turbo
- **Package Manager**: Bun
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Drizzle ORM
- **UI Components**: shadcn/ui, ForgeUI, MagicUI
- **Documentation**: FumaDocs
- **TypeScript**: Full TypeScript support
- **Styling**: Tailwind CSS, PostCSS

## Scripts

The project includes several npm scripts for development and deployment:

- `dev` - Start all applications in development mode
- `dev:web` - Start only the web application
- `dev:server` - Start only the server application
- `build` - Build all applications
- `check-types` - Type check all applications
- `db:push` - Push database schema changes
- `db:studio` - Open database studio
- `db:generate` - Generate database migrations
- `db:migrate` - Run database migrations

## Development Workflow

1. **Install dependencies**: `bun install`
2. **Start development**: `bun dev`
3. **Database operations**: Use the `db:*` scripts for database management
4. **Type checking**: `bun check-types`
5. **Linting**: `bun check`

## Notes

- This is a monorepo using Turbo for build orchestration
- Each app has its own `package.json` and dependencies
- Shared dependencies are managed at the root level
- TypeScript is configured per application
- The project uses Bun as the package manager and runtime
