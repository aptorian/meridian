# Meridian
A time-blocking web app. Horizontal timeline for desktop, vertical for mobile.

## Stack
- React 19 + Vite 7
- Supabase (auth + Postgres database + Edge Functions + Realtime)
- No component library — custom CSS, all inline styles
- Electron 40 for desktop builds (Windows + macOS)
- Deployed on Vercel at meridian.aptorian.com

## Architecture
- Single-file app: `src/App.jsx` (~4900 lines) contains all UI, state, and logic
- `src/supabase.js` — Supabase client init (defensive: returns null if env vars missing/invalid)
- `src/main.jsx` — React entry point
- `supabase/functions/google-calendar/index.ts` — Edge Function for Google Calendar API proxy
- `electron/main.js` — Electron main process (window state, deep links, OAuth)
- Auth: Google OAuth via Supabase, optional (app works fully without login)
- Data: localStorage for all users, cloud sync via Supabase for logged-in users
- Debounced cloud save (1s) mirrors localStorage save pattern

## Key Concepts
- **Blocks**: `{ id, title, startSlot, endSlot, colorIndex, tagId, googleEventId }` — 15-min slots on main timeline
- **Tags**: user-created categories with color assignment; blocks can be tagged; stored in `timeblock-tags`
- **Past days**: navigate to previous dates; blocks stored as `{ "YYYY-MM-DD": [blocks] }` in localStorage and `user_blocks` table
- **Themes**: light, dark, ink — with dark variant sub-themes (coolMineral, warmDesert, mutedBotanical)
- **Lock mode**: long-press padlock to toggle (1020ms lock, 194ms unlock), SVG progress ring, NOT a click
- **Collapsing icon tray**: when locked, theme/settings/mute icons collapse (width→0); lock fades to 0.15 opacity
- **Settings panel**: day range, tags, quote categories, desktop downloads, account, Google Calendar (beta)
- **Quotes**: date-locked inspirational quotes (hash of selectedDate), with category filtering
- **Notepad**: per-tag columns, contentEditable rich text, slash commands, 500ms debounced save
- **Frosted block editor**: double-click block → full blur overlay with title input + tag selector
- **Tag popover**: rendered at timeline level (NOT inside block DOM) with `data-tag-popover` attribute
- **Lane stacking**: `computeLanes()` for overlapping blocks/calendar events (side-by-side rendering)
- **Drawer**: upcoming blocks view with 1-hour grid, inline editing (no overlay)

## Important Code Patterns
- Block onBlur handler deletes blocks with title "" or "New Block" — any UI that causes blur during editing must use `e.preventDefault()` on mouseDown
- Tag popovers exist in two places: main timeline (~line 4074) and drawer (~line 1664)
- `TimelineRow` is a sub-component defined inside App.jsx
- 47 useState hooks in main Meridian component
- All styles are inline (no CSS modules, no styled-components)

## Database
- Supabase project ref: `dginhfxbndzfbqljcocz`
- `user_data` table: blocks, notes, theme, dark_variant, hours_start, hours_end, muted, quote_categories, tags, calendar_enabled, calendar_ids, google_refresh_token, updated_at
- `user_blocks` table: per-date block storage (user_id, date, blocks jsonb)
- Row-level security on both tables

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

## Conventions
- Single-file components where possible
- Obsidian-inspired warm color palette
- Dark theme is default
- 8 block colors: rose, sand, amber, sage, teal, steel, plum, mauve (+ 3 variant sets for dark themes)
- localStorage keys prefixed with `timeblock-` (includes `timeblock-cal-enabled`, `timeblock-cal-ids`, `timeblock-cal-provider-token`, `timeblock-cal-provider-refresh-token` for Google Calendar)
- All inline styles

## CI/CD & Releases
- **Vercel**: auto-deploys from `main` branch
- **GitHub Actions** (`.github/workflows/release.yml`): `v*` tag → builds macOS .dmg + Windows .exe → GitHub Release
- **DO NOT build desktop apps locally** — push tag and CI handles everything
- Release: bump version in package.json, commit, then `gh release create v1.x.x --title "v1.x.x" --generate-notes`

## Dev Setup
- Working directory (Windows): `E:\Repos\meridian-clone`
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — Production build
- `npm run dev:electron` — Electron + Vite concurrently

### Windows-specific notes
- Bash: `export PATH="/c/Program Files/nodejs:$PATH"` before npm/node commands
- PowerShell: `"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -Command "..."`
- PowerShell uses `;` not `&&` for chaining

## Known Issues
- Google Calendar: 401 "Invalid JWT" from Supabase gateway — deployed with `--no-verify-jwt` as workaround
- Electron build fails locally (electron-builder npm JSON parse bug) — always use CI
- Drawer new block click offset near hour grid lines (Math.round boundary issue)
