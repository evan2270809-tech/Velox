import { notFound } from "next/navigation";

// Any unknown path under a locale renders the localized 404 page
// (src/app/[locale]/not-found.tsx) inside the normal layout.
export default function CatchAll() {
  notFound();
}
