# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### 卡牌工坊 (Card Designer) — `/`
A pure-frontend React + Vite app for designing custom tabletop game components.

- **Home** (`/`): Landing page with links to both design tools
- **Board Designer** (`/board`): Monopoly-style 40-square board editor — click any square to edit its name and color; supports PDF print via `window.print()`
- **Card Designer** (`/cards`): Playing card deck editor — manage up to 4 custom suits (name + symbol) and 13 cards each (value + description); supports PDF print with poker-card-sized layout
- **No backend**: All state is in-memory React state; no API calls or database
- **Print support**: `@media print` CSS hides UI and formats board/cards for A4/Letter paper

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
