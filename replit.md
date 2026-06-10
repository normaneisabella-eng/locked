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
- Required env: `SUPABASE_URL`, `SUPABASE_ANON_KEY` — backend Supabase client
- Required env (frontend): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 at `/api`, port 8080
- DB: PostgreSQL + Drizzle ORM (user_id column = Supabase UUID)
- Auth: Supabase email/password — JWT verified on backend via `supabase.auth.getUser(token)`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind v4, Wouter, TanStack Query, Recharts

## Where things live

- `lib/api-spec/openapi.yaml` — Source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle ORM schema (`users.ts`, `checkins.ts`, `pushSubscriptions.ts`)
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks
- `artifacts/api-server/src/` — Express app, routes, Supabase auth middleware
- `artifacts/locked/src/` — React frontend (App.tsx, pages/, components/, context/)
- `artifacts/locked/src/context/AuthContext.tsx` — Supabase session state + `setAuthTokenGetter` wiring
- `artifacts/locked/src/lib/supabase.ts` — Supabase browser client

## Architecture decisions

- Contract-first API: OpenAPI spec drives Zod schemas and React Query hooks via Orval
- **Supabase auth**: email/password sign-up/sign-in; JWT sent as `Authorization: Bearer <token>` header
- `setAuthTokenGetter` in `AuthContext.tsx` wires all generated API hooks to auto-attach the Supabase JWT
- Profile data saved to **both** Supabase `profiles` table (canonical) AND local Replit DB (`users` table used by Express for sport lookups on check-ins)
- Community feed is fully anonymous — no user IDs or names exposed in the feed API
- Tailwind v4 with `optimize: false` in Vite plugin
- `dedupe: ["react", "react-dom", "react/jsx-runtime"]` in vite.config.ts

## Supabase Profiles Table (run in Supabase SQL editor)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## Product

- **Landing page** — marketing page for unauthenticated users
- **Auth** — Custom Supabase sign-in / sign-up pages with dark athletic branding
- **Onboarding** — sport selection + display name + level setup after first sign-in; saves to Supabase profiles + local DB
- **Daily Check-In** — sliders for Focus/Confidence/Energy (1–10) + optional note; one per day
- **Community Feed** — anonymous check-ins browsable by sport
- **History** — personal trends chart (Recharts), streak stats, check-in log

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Tailwind v4: `@layer theme, base, components, utilities;` must come BEFORE `@import "tailwindcss"` in index.css
- Vite: `tailwindcss({ optimize: false })` required to prevent CSS layer reordering in prod builds
- `useGetMe` (and similar generated hooks): must pass `queryKey` explicitly when also passing `enabled` option
- Community feed API route strips user identity — do NOT add auth info to feed responses
- `getGetCommunityFeedQueryKey` must be called with the same params as the hook for cache invalidation to work
- Supabase email confirmation: if enabled in Supabase dashboard, sign-up won't return a session until confirmed; sign-up page shows "check your email" message in that case
- `drizzle-kit push` requires TTY for column rename prompts — use raw SQL (`ALTER TABLE x RENAME COLUMN y TO z`) instead for migrations in non-interactive environments

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
