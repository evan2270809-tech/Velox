import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { InView } from "@/components/ui/InView";
import { SectionHeader, container, sectionFrame } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";

const STUDIES = [
  { key: "matchLighting", a: 20, b: 80 },
  { key: "touchScale", a: 22.5, b: 57.5 },
] as const;

/**
 * Research evidence from other groups, drawn as before/after bars. Every card
 * carries its experimental conditions, the source link and the "not Velox
 * results" note, so a screenshot of one card can never read as a Velox claim.
 */
export function Evidence() {
  const t = useTranslations("whyTouch");
  const why = useTranslations("why");

  return (
    <section id="why-touch" className={sectionFrame}>
      <div className={container}>
        <SectionHeader title={t("title")} />

        <ul className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-2">
          {STUDIES.map((study) => (
            <li key={study.key} className="flex flex-col rounded-2xl border border-line p-6 lg:p-10">
              <p className="eyebrow">{why("success")}</p>

              <InView className="mt-6 space-y-5">
                {(["a", "b"] as const).map((side) => (
                  <div key={side}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className={cn("text-[15px] leading-5", side === "b" ? "text-ink" : "text-ink-2")}>
                        {why(`bars.${study.key}.${side}`)}
                      </span>
                      <span
                        className={cn(
                          "tabular-nums",
                          side === "b"
                            ? "display text-[44px] text-ink lg:text-[64px]"
                            : "text-[24px] font-light leading-none text-ink-3 lg:text-[32px]",
                        )}
                      >
                        {why(`bars.${study.key}.${side}v`)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-2">
                      <div
                        className={cn(
                          "bar-fill h-full rounded-full",
                          side === "b" ? "bg-velox-orange" : "bg-line-strong",
                        )}
                        style={{ width: `${study[side]}%`, transitionDelay: side === "b" ? "150ms" : "0ms" }}
                      />
                    </div>
                  </div>
                ))}
              </InView>

              <p className="mt-10 text-[19px] leading-7 text-ink lg:text-[22px] lg:leading-8">
                {t.rich(`cards.${study.key}.claim`, {
                  b: (chunks) => <strong className="whitespace-nowrap font-medium tabular-nums">{chunks}</strong>,
                  hl: (chunks) => <span>{chunks}</span>,
                })}
              </p>

              {/* Conditions and citation are quoted in the papers' language. */}
              <p lang="en" className="mt-5 text-[14px] leading-6 text-ink-2">
                {t(`cards.${study.key}.conditions`)}
              </p>

              <a
                href={t(`cards.${study.key}.url`)}
                target="_blank"
                rel="noopener noreferrer"
                lang="en"
                className="group mt-4 inline-flex items-start gap-2 self-start text-[14px] leading-6 text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
              >
                {t(`cards.${study.key}.source`)}
                <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-ink-3 transition-colors group-hover:text-ink" />
              </a>

              <p className="mt-auto pt-8">
                <span className="block border-t border-line pt-4 text-[13px] leading-5 text-ink-3">
                  {t("note")}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
