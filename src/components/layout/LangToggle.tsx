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

  const labels: Record<string, string> = { en: "EN", ko: "한국어" };

  return (
    <div className="relative inline-flex items-center rounded-full bg-paper-2 p-[3px] text-[12px] font-medium leading-none">
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
              "grid h-[26px] place-items-center rounded-full px-3 transition-[color,background-color,box-shadow] duration-300 ease-out",
              active
                ? "bg-paper text-ink shadow-[0_1px_2px_rgb(17_17_17/0.12),0_0_0_1px_rgb(17_17_17/0.04)]"
                : "text-ink-3 hover:text-ink",
            )}
          >
            {labels[loc] ?? loc.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}
