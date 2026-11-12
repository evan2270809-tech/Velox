import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { SectionHeader, container } from "@/components/ui/SectionHeader";
import { sectionImages, site } from "@/content/site";
import { cn } from "@/lib/cn";

/** Dated milestones, oldest first. The last one is the most recent. */
const MILESTONES = ["focus", "parts", "firstSignals", "firstSession", "replay"] as const;

export function Stage() {
  const t = useTranslations("stage");
  const latest = MILESTONES.length - 1;

  return (
    <section
      id="stage"
      className="relative isolate overflow-hidden bg-midnight-900 pb-20 pt-[15.5rem] lg:py-28"
    >
      <SectionBackdrop
        src={sectionImages.stage}
        tone="900"
        sizes="(max-width: 1023px) 150vw, 80vw"
        className="inset-x-0 top-0 h-[19rem] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[52%]"
        imageClassName="object-[78%_center]"
        labelClassName="right-4 top-4 lg:right-10 lg:top-8"
      />

      <div className={container}>
        <Reveal>
          <SectionHeader title={t("title")} />
        </Reveal>

        <Reveal as="ol" className="mt-10 max-w-xl lg:mt-14">
          {MILESTONES.map((key, index) => {
            const date = t(`milestones.${key}.date`);
            const isLatest = index === latest;

            return (
              <li key={key} className="relative pb-8 pl-9">
                {/* Connector to the next entry; dashed where it leads into what is not done yet */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 left-[5px] top-[1.15rem] border-l border-midnight-600",
                    isLatest && "border-dashed",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-[0.45rem] size-[11px] rounded-full",
                    isLatest
                      ? "bg-velox-orange shadow-[0_0_0_4px_rgb(255_149_0/0.18)]"
                      : "bg-lavender-300/70",
                  )}
                />
                {site.showTimelineDates && (
                  <time
                    dateTime={date}
                    className="block text-[14px] font-medium tabular-nums text-lavender-300"
                  >
                    {date}
                  </time>
                )}
                <p className="mt-1 text-[17px] leading-[1.55] text-cream-100">
                  {t(`milestones.${key}.text`)}
                </p>
              </li>
            );
          })}

          {/* What comes next carries no date on purpose. */}
          <li className="relative pl-9">
            <span
              aria-hidden
              className="absolute left-0 top-[0.45rem] size-[11px] rounded-full border border-dashed border-lavender-300"
            />
            <p className="text-[14px] font-medium text-lavender-300">{t("nextLabel")}</p>
            <p className="mt-1 text-[17px] leading-[1.55] text-cream-100/85">{t("next")}</p>
          </li>
        </Reveal>
      </div>
    </section>
  );
}
