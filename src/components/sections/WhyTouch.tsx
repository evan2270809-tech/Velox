import { ArrowUpRight, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader, container, sectionFrame } from "@/components/ui/SectionHeader";

const CARDS = ["matchLighting", "touchScale"] as const;

/**
 * Research evidence from other groups. Every card carries its experimental
 * conditions, a link to the source and the "not Velox results" note, so a
 * screenshot of a single card can never read as a Velox claim.
 */
export function WhyTouch() {
  const t = useTranslations("whyTouch");

  return (
    <section id="why-touch" className={sectionFrame}>
      <div className={container}>
        <SectionHeader title={t("title")} lead={t("lead")} />

        <ul className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-2">
          {CARDS.map((key) => (
            <li
              key={key}
              className="flex flex-col rounded-2xl border border-line bg-surface p-6 lg:p-8"
            >
              <p className="text-[22px] leading-8 text-ink lg:text-[26px] lg:leading-9">
                {t.rich(`cards.${key}.claim`, {
                  b: (chunks) => (
                    <strong className="whitespace-nowrap font-medium tabular-nums">{chunks}</strong>
                  ),
                  hl: (chunks) => <span className="text-accent-ink">{chunks}</span>,
                })}
              </p>

              {/* Conditions and citation are quoted in the papers' language. */}
              <p lang="en" className="mt-6 text-[14px] leading-6 text-ink-2">
                {t(`cards.${key}.conditions`)}
              </p>

              <a
                href={t(`cards.${key}.url`)}
                target="_blank"
                rel="noopener noreferrer"
                lang="en"
                className="group mt-4 inline-flex items-start gap-2 self-start text-[14px] leading-6 text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
              >
                {t(`cards.${key}.source`)}
                <ArrowUpRight
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-ink-3 transition-colors group-hover:text-ink"
                />
              </a>

              <div className="mt-auto pt-8">
                <p className="flex items-start gap-2 border-t border-line pt-4 text-[13px] leading-5 text-ink-3">
                  <Info aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                  {t("note")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
