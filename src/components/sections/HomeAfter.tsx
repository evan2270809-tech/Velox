import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { container, sectionFrame } from "@/components/ui/SectionHeader";
import { routes } from "@/content/site";
import { getPathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const STUDIES = ["matchLighting", "touchScale"] as const;
const PAGES = ["why", "product", "contact"] as const;

/** Everything on the home page below the 3D story. */
export function HomeAfter() {
  const t = useTranslations("home");
  const why = useTranslations("why");
  const touch = useTranslations("whyTouch");
  const locale = useLocale();
  const path = (href: string) => getPathname({ href, locale });
  const words = t("statement").split(" ");

  return (
    <>
      {/* Vision statement */}
      <section className={sectionFrame}>
        <div className={container}>
          <p className="statement display max-w-[22ch] text-[clamp(2rem,5.2vw,4.75rem)] leading-[1.08]">
            {words.map((word, i) => (
              <span key={i} className="word">
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Evidence in two numbers */}
      <section className={sectionFrame}>
        <div className={cn(container, "grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16")}>
          <div>
            <h2 className="display text-[30px] lg:text-[44px]">{touch("title")}</h2>
            <p className="mt-4 max-w-md text-[17px] leading-7 text-ink-2">{touch("lead")}</p>
            <a
              href={path(routes.why)}
              className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
            >
              {t("evidenceLink")}
              <span aria-hidden>→</span>
            </a>
          </div>

          <div>
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              {STUDIES.map((key) => (
                <div key={key} className="bg-paper p-6 lg:p-8">
                  <dt className="eyebrow">{why("success")}</dt>
                  <dd className="mt-6 flex flex-wrap items-baseline gap-x-3 tabular-nums">
                    <span className="text-[28px] font-light leading-none text-ink-3 lg:text-[36px]">
                      {why(`bars.${key}.av`)}
                    </span>
                    <span aria-hidden className="text-ink-3">→</span>
                    <span className="display text-[52px] text-ink xl:text-[72px]">
                      {why(`bars.${key}.bv`)}
                    </span>
                  </dd>
                  <dd className="mt-5 text-[14px] leading-5 text-ink-2">
                    {why(`bars.${key}.a`)} → {why(`bars.${key}.b`)}
                  </dd>
                  <dd lang="en" className="mt-2 font-mono text-[11px] leading-4 text-ink-3">
                    {touch(`cards.${key}.source`)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[13px] leading-5 text-ink-3">{touch("note")}</p>
          </div>
        </div>
      </section>

      {/* Where to go next */}
      <section className={sectionFrame}>
        <div className={container}>
          <ul className="grid gap-4 md:grid-cols-3">
            {PAGES.map((key) => (
              <li key={key}>
                <a
                  href={path(routes[key])}
                  className={cn(
                    "group flex h-full min-h-[240px] flex-col rounded-2xl border border-line p-6 transition-colors lg:min-h-[300px] lg:p-8",
                    key === "contact"
                      ? "border-ink bg-ink text-paper hover:bg-[#262626]"
                      : "hover:border-line-strong hover:bg-paper-2",
                  )}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="display text-[26px] lg:text-[32px]">{t(`pages.${key}.title`)}</span>
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1 size-5 shrink-0 opacity-50 transition-[opacity,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </span>
                  <span
                    className={cn(
                      "mt-4 text-[15px] leading-6",
                      key === "contact" ? "text-paper/70" : "text-ink-2",
                    )}
                  >
                    {t(`pages.${key}.body`)}
                  </span>
                  <span className="mt-auto pt-8 font-mono text-[12px] uppercase leading-4 tracking-[0.04em]">
                    {t(`pages.${key}.cta`)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
