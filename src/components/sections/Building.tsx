import { useTranslations } from "next-intl";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { SectionHeader, container, sectionFrame } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buildingItems } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Layout by position: two halves, one full-width row with the image beside the
 * text, then three thirds. Every image keeps its own aspect ratio.
 */
type Layout = "half" | "banner" | "third";

const layouts: Layout[] = ["half", "half", "banner", "third", "third", "third"];

const cardSpan: Record<Layout, string> = {
  half: "lg:col-span-3",
  banner: "sm:col-span-2 lg:col-span-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
  third: "lg:col-span-2",
};

const mediaSizes: Record<Layout, string> = {
  half: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 600px",
  banner: "(max-width: 1023px) 100vw, 800px",
  third: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px",
};

const READOUT = ["episode", "excerpt", "camera", "glove", "usb"] as const;

export function Building() {
  const t = useTranslations("building");
  const lastIndex = buildingItems.length - 1;

  return (
    <section id="building" className={sectionFrame}>
      <div className={container}>
        <SectionHeader title={t("title")} />

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-6">
          {buildingItems.map((item, index) => {
            const layout = layouts[index] ?? "third";
            const title = t(`items.${item.id}.title`);
            // On tablets the last third would sit alone in a two-column row; let it span.
            const lastThird = layout === "third" && index === lastIndex;

            return (
              <li
                key={item.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-2xl border border-line bg-surface",
                  cardSpan[layout],
                  lastThird && "sm:col-span-2 lg:col-span-2",
                )}
              >
                {"readout" in item ? (
                  // The episode shown in the hero, as the Collector reports it.
                  <dl className="bg-paper-2 px-6 py-4 font-mono text-[12px] leading-5 sm:text-[13px] lg:aspect-[1040/585] lg:content-center">
                    {READOUT.map((key) => (
                      <div
                        key={key}
                        className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 border-b sm:grid-cols-[6.5rem_minmax(0,1fr)] border-line py-2 last:border-b-0"
                      >
                        <dt className="text-ink-3">{t(`items.${item.id}.readout.${key}.label`)}</dt>
                        <dd className="text-ink [overflow-wrap:anywhere]">{t(`items.${item.id}.readout.${key}.value`)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <MediaSlot image={item.image} alt={title} sizes={mediaSizes[layout]} />
                )}

                <div
                  className={cn(
                    "flex flex-1 flex-col p-6",
                    layout === "banner" && "lg:justify-center lg:p-8",
                  )}
                >
                  <StatusBadge status={item.status} />
                  <h3 className="mt-4 text-[20px] font-medium leading-7">{title}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-ink-2">{t(`items.${item.id}.body`)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
