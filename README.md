# Flight Fare Finder

Build a SaaS landing page + authenticated app shell for Flight Price Notifier (機票降價通知), a product that watches popular flight routes from Taipei and emails the user when the cheapest fare drops to or below their target price — targeted at budget-driven travelers who don't care exactly when they fly, they just want a ticket under their budget.

The site must include:

A public landing page (/) with:

Hero section: product name "Flight Price Notifier" prominently displayed, value prop 「設定航線與目標價，機票降價就通知你」 (English subtitle: "Set a route and a target price — we email you when the fare drops."), and a primary CTA button labeled "Sign in / 登入" in the top-right header.

## Tech stack

Plain **Vite + React** single-page app (no SSR). Client-side routing with
**React Router** (`/`, `/app`, `/sign-in`, `/sign-up`). Auth and data via
**Supabase** (your own project). Styling with Tailwind CSS v4.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Environment variables (see `.env`) — only the `VITE_`-prefixed ones are used by
the SPA and are inlined into the bundle at build time:

- `VITE_SUPABASE_URL` — your Supabase project URL (`https://<ref>.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — the project's publishable key (`sb_publishable_…`;
  browser-safe, RLS-gated — the role formerly called the "anon key")

## Build

```sh
npm run build      # → static assets in dist/
npm run preview     # serve the production build locally
```

## Deploy to Vercel

The repo ships a `vercel.json` that sets the framework to Vite, builds to
`dist/`, and rewrites every path to `/index.html` so client-side deep links
(e.g. `/app`) resolve. Import the repo in Vercel, add the `VITE_*` environment
variables, and deploy — no other configuration needed.
