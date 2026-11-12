import { useTranslations } from "next-intl";
import { SectionHeader, container, sectionFrame } from "@/components/ui/SectionHeader";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

/** Dated milestones, oldest first. The last one is the most recent. */
const MILESTONES = ["focus", "parts", "firstSignals", "firstSession", "replay"] as const;

export function Stage() {
  const t = useTranslations("stage");
  const latest = MILESTONES.length - 1;

  return (
    <section id="stage" className={sectionFrame}>
      <div className={cn(container, "grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16")}>
        <SectionHeader title={t("title")} />

        <ol className="max-w-xl lg:pt-2">
          {MILESTONES.map((key, index) => {
            const date = t(`milestones.${key}.date`);
            const isLatest = index === latest;

            return (
              <li key={key} className="relative pb-8 pl-9">
                {/* Connector to the next entry; dashed where it leads into what is not done yet */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 left-1 top-5 border-l border-line-strong",
                    isLatest && "border-dashed",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-1.5 size-2 rounded-full",
                    isLatest
                      ? "bg-velox-orange"
                      : "bg-ink-3",
                  )}
                />
                {site.showTimelineDates && (
                  <time
                    dateTime={date}
                    className="block font-mono text-[13px] leading-5 tabular-nums text-ink-3"
                  >
                    {date}
                  </time>
                )}
                <p className="mt-1 text-[17px] leading-7 text-ink">
                  {t(`milestones.${key}.text`)}
                </p>
              </li>
            );
          })}

          {/* What comes next carries no date on purpose. */}
          <li className="relative pl-9">
            <span
              aria-hidden
              className="absolute left-0 top-1.5 size-2 rounded-full border border-ink-3"
            />
            <p className="font-mono text-[13px] leading-5 text-ink-3">{t("nextLabel")}</p>
            <p className="mt-1 text-[17px] leading-7 text-ink-2">{t("next")}</p>
          </li>
        </ol>
      </div>
    </section>
  );
}
