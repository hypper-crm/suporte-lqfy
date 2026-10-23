# Support & Implementation Board

An internal web app (installable as a PWA) for the support team to track clients through two kanban boards: **Support** and **Implementation**.

Built with React, Vite, TypeScript, Tailwind CSS, `vite-plugin-pwa`, `@dnd-kit` and Supabase.

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project with the schema from `schema.sql` already applied

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root (you can copy `.env.example`):

   ```bash
   cp .env.example .env
   ```

3. Fill in the environment variables (see below).

4. Build the app:

   ```bash
   npm run build
   ```

   The production build is written to the `dist` folder.

## Environment variables

| Variable                 | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `VITE_SUPABASE_URL`      | Your Supabase project URL, for example `https://xyz.supabase.co`.  |
| `VITE_SUPABASE_ANON_KEY` | The Supabase **anon** (public) key.                                |

Use only the anon key. **Never** put the service role key in this project, because everything in the build is served to the browser.

Vite embeds these values at build time, so rebuild after changing `.env`.

## Deploy

Deploy the `dist` folder to any static host. On Vercel, use `npm run build` as the build command and `dist` as the output directory, and set both environment variables in the project settings.

## Install as an app

The app ships a web app manifest and a service worker that caches the app shell only. Supabase API responses and Storage URLs are never cached. Use the browser's **Install** option to add it to the desktop or home screen.

## Scripts

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `npm run build`     | Type-checks and builds the app to `dist`.       |
| `npm run typecheck` | Runs the TypeScript compiler without emitting.  |
| `npm run dev`       | Starts the Vite dev server with hot reload.     |

## Project structure

```
index.html                HTML entry point
vite.config.ts            Vite and PWA configuration
public/                   Favicon and app icons
src/
  main.tsx, App.tsx       Entry point and root component
  components/             UI components (auth, board, clients, layout, common)
  hooks/                  React hooks (useSession, useProfile, useBoard, useClients)
  lib/                    Supabase client, card positions and formatting helpers
  services/               All Supabase calls (auth, profile, board, card, realtime)
  types/                  Shared types mirroring the database schema
```

## Authentication

- Sign in and account creation share one form on the login screen.
- Creating an account sends the full name as user metadata under `full_name`.
- Email confirmation is disabled in Supabase, so a new account is signed in right away.
- The signed-in screen shows the name from the `profiles` table.

## Kanban boards

- The sidebar (a top tab bar on narrow screens) switches between **Support**, **Implementation** and **Clients**. The header also has a **Clients** link.
- Columns come from `board_columns` (filtered by board, ordered by `position`); cards come from `cards`, grouped by `column_id` and ordered by `position`.
- Cards use fractional positions: a moved card gets the midpoint between its new neighbors, so only that card is updated. This requires `cards.position` to be a `numeric` or `double precision` column.
- Moves are applied optimistically and reverted with an error message if the update fails.

### Realtime requirement

Live updates require the `cards` and `board_columns` tables to be in the `supabase_realtime` publication. In the Supabase SQL editor:

```sql
alter publication supabase_realtime add table public.cards, public.board_columns;
```
