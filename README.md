# Velox BD — Marketing Website

Next.js 15 + Tailwind v4 + next-intl marketing site.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run typecheck` — strict TS check
- `npm run lint` — Next.js eslint

## Tech

- Next.js 15 (App Router) · React 19
- Tailwind v4 (`@theme` inline tokens in `src/styles/globals.css`)
- next-intl — KR (default `/`) + EN (`/en`)
- framer-motion — Antimetal-style spring entrances
- lucide-react — icon set

## Editing content

- **Copy (KR/EN)** — `messages/ko.json`, `messages/en.json`
- **Team members** — `src/content/team.ts` (drop photos in `public/team/{slug}.jpg`)
- **Portfolio cases** — `src/content/portfolio.ts`
- **Services / Process** — `src/content/services.ts`, `src/content/process.ts`
- **Brand tokens (orange, hero gradient, etc.)** — `src/styles/globals.css` `@theme` block
