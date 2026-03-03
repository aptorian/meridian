# Meridian
A time-blocking web app. Horizontal timeline for desktop, vertical for mobile.

## Stack
- React 19 + Vite 7
- Supabase (auth + Postgres database + Edge Functions + Realtime)
- No component library — custom CSS
- Electron 40 for desktop builds (Windows + macOS)
- Deployed on Vercel at meridian.aptorian.com

## Architecture
- Single-file app: `src/App.jsx` (~3500 lines) contains all UI, state, and logic
- `src/supabase.js` — Supabase client init (defensive: returns null if env vars missing/invalid)
- `src/main.jsx` — React entry point
- `supabase/functions/google-calendar/index.ts` — Edge Function for Google Calendar API proxy
- `electron/main.js` — Electron main process (window state, deep links, OAuth)
- Auth: Google OAuth via Supabase, optional (app works fully without login)
- Data: localStorage for all users, cloud sync via Supabase for logged-in users
- Debounced cloud save (1s) mirrors localStorage save pattern

## Key Concepts
- **Blocks**: time blocks on the timeline, stored as JSON array per date
- **Tags**: user-created categories (Work, Personal, etc.) with color assignment; blocks can be tagged
- **Past days**: navigate to previous dates; blocks stored as `{ "YYYY-MM-DD": [blocks] }` in localStorage and `user_blocks` table
- **Themes**: light, dark, ink — with dark variant sub-themes (coolMineral, warmDesert, mutedBotanical)
- **Lock mode**: prevents accidental edits; long-press padlock (1020ms lock, 194ms unlock), SVG progress ring
- **Collapsing icon tray**: when locked, theme/settings/mute icons collapse into lock; lock fades to 0.15 opacity, rises on mouse movement
- **Settings panel**: day range, tags, quote categories, desktop app downloads, account, Google Calendar (beta)
- **Quotes**: date-locked inspirational quotes (hash of selectedDate), with category filtering
- **Notepad**: per-tag columns (side-by-side, expanding container), slash commands, contentEditable rich text
- **Frosted block editor**: double-click block → full blur overlay with title input + tag selector
- **Lane stacking**: overlapping blocks/calendar events get assigned to lanes (side-by-side rendering)

## Database
- Supabase project ref: `dginhfxbndzfbqljcocz`
- `user_data` table: blocks (jsonb), notes, theme, dark_variant, hours_start, hours_end, muted, quote_categories, tags (jsonb), calendar_enabled, calendar_ids (jsonb), google_refresh_token, updated_at
- `user_blocks` table: per-date block storage for past days (user_id, date, blocks jsonb)
- Row-level security on both tables (users can only access own data)

## Google Calendar Integration (Beta — not yet working)
- OAuth re-auth with `calendar.events` scope via `connectCalendar()`
- Edge Function at `supabase/functions/google-calendar/index.ts` proxies Google Calendar API
- Edge Function requires env secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Token flow: `onAuthStateChange` captures `provider_token` + `provider_refresh_token` → stored in localStorage → refresh token persisted to `user_data.google_refresh_token`
- **Known issue**: Edge Function returns 401 "Invalid JWT" from Supabase gateway. Deployed with `--no-verify-jwt` flag as workaround. Root cause: Authorization header may not be reaching the gateway correctly after OAuth re-redirect. Needs further debugging.
- Deploy command: `cd E:\Repos\meridian-clone; supabase functions deploy google-calendar --no-verify-jwt --project-ref dginhfxbndzfbqljcocz`

## Notepad Slash Commands
- `/1` through `/3` — heading sizes
- `/todo` — checkbox list
- `/bullet` — bullet list
- `/number` — numbered list
- `/quote` — blockquote
- `/divider` — horizontal rule

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase publishable anon key
- Set in `.env` locally (gitignored) and in Vercel project settings
- These are baked in at build time via `import.meta.env`

## Conventions
- Single-file components where possible
- Obsidian-inspired warm color palette
- Dark theme is default
- 8 block colors: rose, sand, amber, sage, teal, steel, plum, mauve (+ 3 variant sets)
- localStorage keys prefixed with `timeblock-`
- All inline styles (no CSS modules or styled-components)

## CI/CD & Releases
- **Vercel**: auto-deploys from `main` branch (web app at meridian.aptorian.com)
- **GitHub Actions** (`.github/workflows/release.yml`): "Build & Release" workflow
  - Triggered automatically by pushing any `v*` tag to GitHub
  - Builds **both** macOS .dmg and Windows .exe via matrix (macos-latest + windows-latest runners)
  - Uploads both installers to the GitHub Release automatically
  - Uses `softprops/action-gh-release@v2` with `generate_release_notes: true`
  - Supabase env vars injected from GitHub repo secrets during Vite build step
  - **DO NOT build desktop apps locally** — just push the tag and CI handles everything
- **Release process** (version bump → all platforms):
  1. Bump `version` in `package.json`, commit and push to `main`
  2. Create release: `gh release create v1.x.x --title "v1.x.x" --generate-notes`
     - This creates the git tag, which triggers the CI workflow
  3. CI builds both .dmg and .exe and attaches them to the release automatically
  4. Vercel deploys the web app from the same `main` push
  5. Existing desktop users get update prompts via the in-app update checker (`electron/main.js` checks GitHub releases API on launch)
- Download links in Settings point to `github.com/aptorian/meridian/releases/latest/download/`

## External Services
- **Supabase**: Auth (Google OAuth) + database + Edge Functions + Realtime — dashboard at supabase.com
- **Vercel**: Hosting + auto-deploys from `main` branch
- **Google Cloud Console**: OAuth client config (consent screen, redirect URIs, Calendar API enabled)
- **GitHub**: `https://github.com/aptorian/meridian`

## Dev Setup
- Working directory (Mac): `/Users/adam/Downloads/meridian`
- Working directory (Windows): `E:\Repos\meridian-clone`
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — Production build (web only)
- `npm run dev:electron` — Electron + Vite concurrently
- `npm run build:electron` — Local Electron build (use CI instead for releases)
- PowerShell on Windows: use `;` not `&&` to chain commands
