import Link from "next/link";
import { useLocale } from "next-intl";
import { localeNames } from "@/content/site";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/** Language switch. Plain links, so it works without JavaScript and is crawlable. */
export function LangToggle() {
  const locale = useLocale();

  return (
    <div className="inline-flex items-center rounded-lg bg-surface p-0.5 font-mono text-[12px] ring-1 ring-inset ring-line">
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <Link
            key={loc}
            href={getPathname({ href: "/", locale: loc })}
            hrefLang={loc}
            lang={loc}
            aria-label={localeNames[loc]}
            aria-current={active ? "true" : undefined}
            className={cn(
              "grid h-7 min-w-9 place-items-center rounded-md px-2 transition-colors",
              active ? "bg-ink text-paper" : "text-ink-2 hover:text-ink",
            )}
          >
            {loc.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
