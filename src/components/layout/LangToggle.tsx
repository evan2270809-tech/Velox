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
    <div className="inline-flex items-center rounded-full bg-cream-100/[0.06] p-0.5 text-[12.5px] font-semibold ring-1 ring-inset ring-cream-100/15">
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
              "grid h-7 min-w-9 place-items-center rounded-full px-2.5 transition-colors",
              active ? "bg-cream-100 text-midnight-900" : "text-cream-100/70 hover:text-cream-100",
            )}
          >
            {loc.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
