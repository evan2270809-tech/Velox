# Velox — Website

Site for Velox: tactile capture hardware and software for robot-learning data.
Four pages, in English and Korean, with interactive 3D models.
Next.js 15 (App Router) · React 19 · Tailwind v4 · next-intl · three.js.

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

## Pages

| Page | Route | File |
| --- | --- | --- |
| Home: the glove meets a robot hand, then three scroll chapters | `/` | `src/app/[locale]/page.tsx` |
| Why tactile data: studies, traceability, audience, FAQ | `/why-touch-data` | `src/app/[locale]/why-touch-data/page.tsx` |
| Product: replay, glove, sensor, capture kit, data format, timeline | `/product` | `src/app/[locale]/product/page.tsx` |
| Contact: a form that composes an email in the visitor's mail app | `/contact` | `src/app/[locale]/contact/page.tsx` |

Route paths are set in `routes` in `src/content/site.ts`.

## Where things live

| What | File |
| --- | --- |
| Settings that are still open (contact email, site URL, languages, footer line, timeline dates), logo, routes | `src/content/site.ts` |
| Copy, English and Korean (same keys in both files) | `messages/en.json`, `messages/ko.json` |
| Colour tokens, fonts, base styles | `src/styles/globals.css` (fonts are loaded in `src/app/[locale]/layout.tsx`) |
| Page sections | `src/components/sections/` |
| 3D scenes (plain three.js, no React inside) | `src/components/three/` |
| 3D model files | `public/models/` |
| Favicon and app icons | `src/app/favicon.ico`, `icon.png`, `apple-icon.png` |
| Share images (1200×630) | `public/og/` |

## Languages

English is the default and has no URL prefix (`/`). Korean lives at `/ko`.
A request for `/en` is redirected to `/`. Change the default or turn on
browser-language detection in `src/content/site.ts`.

## 3D scenes

All three scenes load three.js on the client only and render only while on screen.

- `three/glove.ts` — the hand scenes. On the home page a scanned hand wearing the
  glove meets a robot hand, with particles flowing between the fingertips; the
  cursor stirs them. On the product page the same hand opens from a fist and the
  glove comes off in two halves to show the sensors inside. Both are driven by
  scroll position (`HomeStory.tsx`, `GloveScrollStory.tsx`).
  The scan has no skeleton: fingers are bent by a small rig that finds each
  finger's joints from its shape, so a fully closed fist is an approximation.
- `three/sensor.ts` — the fingertip sensor as a coloured line drawing whose layers
  come apart on scroll (`SensorScrollStory.tsx`). It is deliberately schematic and
  carries no real layout, counts or dimensions.
- `three/kit.ts` — the capture kit as a line sketch that can be dragged round
  (`CaptureKit3D.tsx`).

The sensor pads, their counts and their layout in these scenes are illustrations.
Do not add real specifications to them.

### Model files

`public/models/` holds third-party models used under open licences:

- `hand-scan.obj`, `hand-scan-skin.jpg`, `hand-scan-normal.jpg` — scanned hand, with
  its skin texture and normal map downsized for the web.
- `robot-hand.glb` — robot hand, converted from a Blender file and recoloured in code.

Record each model's source and licence here when replacing or adding one, and
include any attribution its licence requires.

## Recorded replay

The product page shows `heroVideo` (set in `src/content/site.ts`): a silent
recording of a real episode replayed in our collection software. It loops while on
screen and pauses when it scrolls away; visitors who prefer reduced motion see the
poster image.

Three things are drawn over the video in `ProductSections.tsx`, positioned as
percentages of its 1920×900 frame. If the video is re-recorded, check or remove them:

- the left half of the title bar, redrawn so it reads "V1 Collector";
- the USB panel, where the still frame is given a slow drift;
- below the video, an interactive pressure view (`PressureDemo.tsx`) whose values
  are simulated and labelled as such.

Only add real material once it has been cleared for publication. This repository
is public: anything committed is visible to everyone.

## Design rules

- White page (`--color-paper`), near-black ink, three text roles (`ink`, `ink-2`,
  `ink-3`) and hairline borders (`--color-line`).
- Orange (`#FF9500`) is the accent and is used sparingly: a status dot, an evidence
  bar. Buttons are ink on white.
- Type: Geist for Latin text, with headlines set light (300); Geist Mono for small
  readouts (dates, status labels, episode data); Pretendard for Hangul.
- Status is a dot plus a mono label, not a pill. Only "Working prototype" gets the
  orange dot.
- The wordmark is `public/brand/velox-wordmark.svg`. The earlier wordmark is kept
  as `velox-logo.svg` (orange) and `velox-logo-black.svg`; switch in `site.ts`.
- Motion is tied to scrolling or the cursor. Scenes hold still for visitors who
  prefer reduced motion.

## Deploying

The repository is connected to Vercel. Pushing any branch creates a protected
preview. Pushing `main` deploys to production at https://www.velox.llc, so merge to
`main` only when the change is approved.
