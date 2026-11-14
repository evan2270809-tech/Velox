"use client";

import { usePathname } from "next/navigation";
import { localeNames, site } from "@/content/site";
import { cn } from "@/lib/cn";

/** Language switch. Keeps the visitor on the same page in the other language. */
export function LangToggle({ locale }: { locale: string }) {
  const pathname = usePathname();
  // Path without a locale prefix, e.g. "/product"
  const bare =
    site.locales.reduce(
      (path, loc) =>
        path === `/${loc}` ? "/" : path.startsWith(`/${loc}/`) ? path.slice(loc.length + 1) : path,
      pathname,
    ) || "/";

  return (
    <div className="inline-flex items-center rounded-[10px] p-0.5 font-mono text-[12px] ring-1 ring-inset ring-line">
      {site.locales.map((loc) => {
        const active = loc === locale;
        const href = loc === site.defaultLocale ? bare : `/${loc}${bare === "/" ? "" : bare}`;
        return (
          <a
            key={loc}
            href={href}
            hrefLang={loc}
            lang={loc}
            aria-label={localeNames[loc]}
            aria-current={active ? "true" : undefined}
            className={cn(
              "grid h-7 min-w-9 place-items-center rounded-lg px-2 transition-colors",
              active ? "bg-ink text-paper" : "text-ink-2 hover:text-ink",
            )}
          >
            {loc.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}
