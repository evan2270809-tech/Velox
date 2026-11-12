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
| Image slots and status badges for the "What we're building" cards | `src/content/site.ts` |
| Copy, English and Korean (same keys in both files) | `messages/en.json`, `messages/ko.json` |
| Brand tokens (Midnight + Orange) and fonts | `src/styles/globals.css` |
| Page sections, in page order | `src/app/[locale]/page.tsx`, `src/components/sections/` |
| Favicon and app icons | `src/app/favicon.ico`, `icon.png`, `apple-icon.png` |
| Share images (1200×630) | `public/og/` |

## Languages

English is the default and has no URL prefix (`/`). Korean lives at `/ko`.
A request for `/en` is redirected to `/`. Change the default or turn on
browser-language detection in `src/content/site.ts`.

## Images

Every picture on the page is a path in `src/content/site.ts`.

- Files under `public/images/concept/` are concept illustrations. They fill their
  frame and get a "Concept illustration" label automatically.
- Any other path (use `public/images/real/`) is treated as a real screen or photo:
  no label, and the whole image stays visible instead of being cropped.

To replace a concept picture with an approved real one, add the file under
`public/images/real/` and change the path. Only add real material once it has
been cleared for publication.

## Design rules

- Dark Midnight background, cream text, lavender for secondary text.
- Orange (`#FF9500`) is an accent: an emphasised word, a key number, one button —
  at most two places on a screen. Status badges use it only for "Working prototype".
- The wordmark (`public/brand/velox-logo.svg`) is used as supplied; do not recolour it.
- Latin text is DM Sans (headlines 800, body 400); Hangul is Pretendard.
