---
name: Supabase auth migration
description: How Supabase auth replaced Clerk; JWT flow; setAuthTokenGetter wiring
---

Auth system is Supabase email/password (not Clerk). Key architecture:

- Frontend: `artifacts/locked/src/lib/supabase.ts` — browser client using VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
- Session management: `artifacts/locked/src/context/AuthContext.tsx` — calls `setAuthTokenGetter` so ALL generated API hooks auto-attach `Authorization: Bearer <token>`
- Backend middleware: `artifacts/api-server/src/middlewares/requireAuth.ts` — calls `supabase.auth.getUser(token)` to verify JWT and sets `req.userId`
- All DB tables use `user_id` (Supabase UUID), not `clerk_id`
- Profiles saved to Supabase `profiles` table AND local Replit DB `users` table (local needed for sport lookups in checkins)

**Why:** Clerk was replaced with Supabase to store profiles (display_name, sport, level) in Supabase. Supabase anon key is public-safe — stored as env var, not secret.

**How to apply:** Any new protected route uses `requireAuth` middleware. Any new frontend page needing auth uses `useAuth()` from AuthContext. Token attachment is automatic via setAuthTokenGetter — no manual header passing needed.
