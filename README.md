# Velox — Website

One-page site for Velox: tactile capture hardware and software for robot-learning data.
Next.js 15 (App Router) · React 19 · Tailwind v4 · next-intl.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run typecheck` — strict TypeScript check
- `npm run lint` — ESLint (Next.js rules)

## Where things live

| What | File |
| --- | --- |
| Settings that are still open (contact email, site URL, languages, footer line, timeline dates) | `src/content/site.ts` |
| Hero video, card images (with their pixel size) and status labels | `src/content/site.ts` |
| Copy, English and Korean (same keys in both files) | `messages/en.json`, `messages/ko.json` |
| Colour tokens, fonts, base styles | `src/styles/globals.css` (fonts are loaded in `src/app/[locale]/layout.tsx`) |
| Page sections, in page order | `src/app/[locale]/page.tsx`, `src/components/sections/` |
| Favicon and app icons | `src/app/favicon.ico`, `icon.png`, `apple-icon.png` |
| Share images (1200×630) | `public/og/` |

## Languages

English is the default and has no URL prefix (`/`). Korean lives at `/ko`.
A request for `/en` is redirected to `/`. Change the default or turn on
browser-language detection in `src/content/site.ts`.

## Images and video

Every picture on the page is set in `src/content/site.ts`.

- The hero shows `heroVideo`: a silent recording of a real episode replayed in our
  collection software. It loops on its own while it is on screen (no player
  controls) and pauses when it scrolls away. Visitors who prefer reduced motion see
  the poster image.
- Card images are given with their pixel size. The frame takes that aspect ratio,
  so no picture is ever cropped. If you swap an image, update its width and height.
- Files under `public/images/concept/` are concept illustrations and get a
  "Concept illustration" label automatically. Real, approved material goes in
  `public/images/real/` and gets no label.

Only add real material once it has been cleared for publication. This repository
is public: anything committed is visible to everyone.

## Design rules

- Light page in warm paper tones (`--color-paper`), dark ink text, three text roles
  (`ink`, `ink-2`, `ink-3`) and hairline borders (`--color-line`).
- Orange (`#FF9500`) is the accent: the main button and the live dot. Orange text on
  the light page uses the darker `--color-accent-ink`.
- Type: IBM Plex Sans for Latin text (weights 400 and 500), IBM Plex Mono for small
  readouts (dates, status labels, episode data), Pretendard for Hangul.
- Status is a dot plus a mono label, not a pill. Only "Working prototype" gets the
  orange dot.
- The wordmark (`public/brand/velox-logo.svg`) is used as supplied; do not recolour it.
- No scroll animations. One short fade on load for the hero only.

## Deploying

The repository is connected to Vercel. Pushing any branch creates a protected
preview. Pushing `main` deploys to production at https://www.velox.llc, so merge to
`main` only when the change is approved.
