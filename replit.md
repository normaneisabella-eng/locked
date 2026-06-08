# Locked

Mental performance app for athletes — daily 2-minute mental check-ins tracking focus, confidence, and energy, with an anonymous community feed and personal history/trends.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/locked run dev` — run the frontend (port auto-assigned via PORT env var)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 at `/api`, port 8080
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (whitelabel proxy via `/api/__clerk`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind v4, Wouter, TanStack Query, Recharts

## Where things live

- `lib/api-spec/openapi.yaml` — Source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle ORM schema (`users.ts`, `checkins.ts`)
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks
- `artifacts/api-server/src/` — Express app, routes, Clerk middleware
- `artifacts/locked/src/` — React frontend (App.tsx, pages/, components/)

## Architecture decisions

- Contract-first API: OpenAPI spec drives Zod schemas and React Query hooks via Orval
- Clerk auth with Replit-managed whitelabel proxy — no token handling needed in browser; cookie-based auth
- Community feed is fully anonymous — no user IDs or names exposed in the feed API
- Tailwind v4 with `optimize: false` in Vite plugin (required for Clerk themes CSS layer ordering)
- `dedupe: ["react", "react-dom", "react/jsx-runtime"]` in vite.config.ts prevents multiple React instances when Clerk packages are bundled

## Product

- **Landing page** — marketing page for unauthenticated users
- **Auth** — Clerk sign-in / sign-up with custom dark athletic branding
- **Onboarding** — sport selection + display name setup after first sign-in
- **Daily Check-In** — sliders for Focus/Confidence/Energy (1–10) + optional note; one per day
- **Community Feed** — anonymous check-ins browsable by sport
- **History** — personal trends chart (Recharts), streak stats, check-in log

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Tailwind v4: `@layer theme, base, clerk, components, utilities;` must come BEFORE `@import "tailwindcss"` in index.css
- Vite: `tailwindcss({ optimize: false })` required to prevent Clerk theme CSS layer reordering in prod builds
- `useGetMe` (and similar generated hooks): must pass `queryKey` explicitly when also passing `enabled` option
- Community feed API route strips user identity — do NOT add auth info to feed responses
- `getGetCommunityFeedQueryKey` must be called with the same params as the hook for cache invalidation to work

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for auth setup details and troubleshooting
