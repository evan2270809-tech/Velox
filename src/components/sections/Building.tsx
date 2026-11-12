import { useTranslations } from "next-intl";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeader, container } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buildingItems } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Layout by position: two large cards (what exists today), one full-width
 * card (the system being integrated), then three smaller ones.
 */
type Layout = "half" | "banner" | "third";

const layouts: Layout[] = ["half", "half", "banner", "third", "third", "third"];

const cardSpan: Record<Layout, string> = {
  half: "lg:col-span-3",
  banner: "sm:col-span-2 lg:col-span-6",
  third: "lg:col-span-2",
};

const mediaShape: Record<Layout, string> = {
  half: "aspect-[16/9]",
  banner: "aspect-[2/1] lg:aspect-[3/1]",
  third: "aspect-[16/10]",
};

const mediaSizes: Record<Layout, string> = {
  half: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 600px",
  banner: "(max-width: 1279px) 100vw, 1200px",
  third: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px",
};

export function Building() {
  const t = useTranslations("building");
  const lastIndex = buildingItems.length - 1;

  return (
    <section id="building" className="bg-midnight-800 py-20 lg:py-28">
      <div className={container}>
        <Reveal>
          <SectionHeader title={t("title")} />
        </Reveal>

        <RevealStagger
          as="ul"
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-6"
        >
          {buildingItems.map((item, index) => {
            const layout = layouts[index] ?? "third";
            const title = t(`items.${item.id}.title`);
            // On tablets the last card would sit alone in a two-column row; let it span.
            const lastThird = layout === "third" && index === lastIndex;

            return (
              <RevealItem
                key={item.id}
                as="li"
                className={cn(
                  "flex flex-col overflow-hidden rounded-[20px] border border-midnight-600/70 bg-midnight-700",
                  cardSpan[layout],
                  lastThird && "sm:col-span-2",
                )}
              >
                <MediaSlot
                  src={item.image}
                  alt={title}
                  sizes={mediaSizes[layout]}
                  position={layout === "banner" ? "center 58%" : undefined}
                  className={cn(
                    mediaShape[layout],
                    lastThird && "sm:aspect-[2.4/1] lg:aspect-[16/10]",
                  )}
                />

                <div
                  className={cn(
                    "flex flex-1 flex-col p-6 lg:p-7",
                    layout === "banner" &&
                      "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-10 lg:p-8",
                  )}
                >
                  <div>
                    <StatusBadge status={item.status} />
                    <h3 className="mt-4 text-[1.3rem] font-bold leading-[1.25] tracking-[-0.015em] lg:text-[1.4rem]">
                      {title}
                    </h3>
                  </div>
                  <p
                    className={cn(
                      "mt-2.5 text-[15.5px] leading-[1.65] text-cream-100/75",
                      layout === "banner" && "lg:mt-0 lg:text-[17px]",
                    )}
                  >
                    {t(`items.${item.id}.body`)}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
