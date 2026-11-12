import { Bot, Clapperboard, FlaskConical, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { SectionHeader, container } from "@/components/ui/SectionHeader";
import { sectionImages } from "@/content/site";

const ITEMS: ReadonlyArray<{ key: "robotics" | "video" | "labs"; icon: LucideIcon }> = [
  { key: "robotics", icon: Bot },
  { key: "video", icon: Clapperboard },
  { key: "labs", icon: FlaskConical },
];

export function Audience() {
  const t = useTranslations("audience");

  return (
    <section
      id="audience"
      className="relative isolate overflow-hidden bg-midnight-800 pb-20 pt-[15.5rem] lg:pb-28 lg:pt-0"
    >
      <SectionBackdrop
        src={sectionImages.audience}
        tone="800"
        sizes="(max-width: 1023px) 150vw, 62vw"
        className="inset-x-0 top-0 h-[19rem] lg:left-auto lg:right-0 lg:h-[27rem] lg:w-[60%]"
        imageClassName="object-[78%_center] lg:object-center"
        labelClassName="right-4 top-4 lg:right-10 lg:top-8"
      />

      <div className={container}>
        <Reveal className="lg:flex lg:min-h-[26rem] lg:items-center lg:pt-8">
          <SectionHeader title={t("title")} className="lg:max-w-xl" />
        </Reveal>

        <RevealStagger as="ul" className="mt-10 grid gap-5 lg:mt-0 lg:grid-cols-3">
          {ITEMS.map(({ key, icon: Icon }) => (
            <RevealItem
              key={key}
              as="li"
              className="rounded-[20px] border border-midnight-600/70 bg-midnight-700/95 p-6 backdrop-blur lg:p-7"
            >
              <Icon aria-hidden className="size-6 text-lavender-300" strokeWidth={1.75} />
              <p className="mt-5 text-[17px] leading-[1.6] text-cream-100/75">
                {t.rich(`items.${key}`, {
                  b: (chunks) => <strong className="font-bold text-cream-100">{chunks}</strong>,
                })}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
