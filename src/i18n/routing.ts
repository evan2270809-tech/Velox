import { defineRouting } from "next-intl/routing";
import { site } from "@/content/site";

// Language settings live in src/content/site.ts.
// With "as-needed", the default locale has no prefix ("/") and a prefixed request
// for it (e.g. the old "/en" address) is redirected to the unprefixed URL.
export const routing = defineRouting({
  locales: site.locales,
  defaultLocale: site.defaultLocale,
  localePrefix: "as-needed",
  localeDetection: site.detectBrowserLanguage,
});

export type Locale = (typeof routing.locales)[number];
