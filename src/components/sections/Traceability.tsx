import { useTranslations } from "next-intl";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { SectionHeader, container } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { sectionImages } from "@/content/site";

/** Principles that are plans, not practice yet. Each one is marked "Planned". */
const PLANNED = ["consent", "ids", "noResale"] as const;

export function Traceability() {
  const t = useTranslations("trace");

  return (
    <section
      id="data"
      className="relative isolate overflow-hidden bg-midnight-800 pb-20 pt-[15.5rem] lg:pb-28 lg:pt-0"
    >
      <SectionBackdrop
        src={sectionImages.trace}
        tone="800"
        sizes="(max-width: 1023px) 150vw, 62vw"
        className="inset-x-0 top-0 h-[19rem] lg:left-auto lg:right-0 lg:h-[29rem] lg:w-[60%]"
        imageClassName="object-[72%_center] lg:object-center"
        labelClassName="right-4 top-4 lg:right-10 lg:top-8"
      />

      <div className={container}>
        <Reveal className="lg:flex lg:min-h-[28rem] lg:items-center lg:pt-8">
          <SectionHeader title={t("title")} lead={t("lead")} className="lg:max-w-xl" />
        </Reveal>

        <RevealStagger as="ul" className="mt-10 grid gap-5 lg:mt-0 lg:grid-cols-3">
          {/* The policy in force today: no badge, more weight. */}
          <RevealItem
            as="li"
            className="rounded-[20px] border border-cream-100/20 bg-midnight-700 p-6 lg:col-span-3 lg:p-9"
          >
            <p className="max-w-3xl text-[1.3rem] font-semibold leading-[1.4] tracking-[-0.01em] lg:text-[1.65rem]">
              {t("items.cleanRaw")}
            </p>
          </RevealItem>

          {PLANNED.map((key) => (
            <RevealItem
              key={key}
              as="li"
              className="rounded-[20px] border border-midnight-600/70 bg-midnight-700/70 p-6 lg:p-7"
            >
              <StatusBadge status="planned" />
              <p className="mt-4 text-[17px] leading-[1.6] text-cream-100/85">
                {t(`items.${key}`)}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
