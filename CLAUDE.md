# Meridian
A time-blocking web app. Horizontal timeline for desktop, vertical for mobile.

## Stack
- React 19 + Vite 7
- Supabase (auth + Postgres database)
- No component library — custom CSS
- Deployed on Vercel at meridian.aptorian.com

## Architecture
- Single-file app: `src/App.jsx` (~2100 lines) contains all UI, state, and logic
- `src/supabase.js` — Supabase client init (defensive: returns null if env vars missing/invalid)
- `src/main.jsx` — React entry point
- Auth: Google OAuth via Supabase, optional (app works fully without login)
- Data: localStorage for all users, cloud sync via Supabase `user_data` table for logged-in users
- Debounced cloud save (1s) mirrors localStorage save pattern

## Key Concepts
- **Blocks**: time blocks on the timeline, stored as JSON array
- **Themes**: light, dark, ink — with dark variant sub-themes
- **Lock mode**: prevents accidental edits (hold to toggle, duration ~1s)
- **Settings panel**: day range, quote categories, account (sign in/out)
- **Quotes**: rotating inspirational quotes with category filtering

## Database
- Supabase project: `meridian` (org: aptorian)
- Single `user_data` table with row-level security (users can only access own data)
- Columns: blocks (jsonb), notes, theme, dark_variant, hours_start, hours_end, muted, quote_categories, updated_at

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase publishable anon key
- Set in `.env` locally (gitignored) and in Vercel project settings
- These are baked in at build time via `import.meta.env`

## Conventions
- Single-file components where possible
- Obsidian-inspired warm color palette
- Dark theme is default
- 8 block colors: rose, sand, amber, sage, teal, steel, plum, mauve
- localStorage keys prefixed with `timeblock-`

## External Services
- **Supabase**: Auth (Google OAuth) + database — dashboard at supabase.com
- **Vercel**: Hosting + deploys from `main` branch
- **Google Cloud Console**: OAuth client config (consent screen, redirect URIs)
