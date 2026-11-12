import { ArrowUpRight, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { SectionHeader, container } from "@/components/ui/SectionHeader";
import { sectionImages } from "@/content/site";

const CARDS = ["matchLighting", "touchScale"] as const;

/**
 * Research evidence from other groups. Every card carries its experimental
 * conditions, a link to the source and the "not Velox results" note, so a
 * screenshot of a single card can never read as a Velox claim.
 */
export function WhyTouch() {
  const t = useTranslations("whyTouch");

  return (
    <section
      id="why-touch"
      className="relative isolate overflow-hidden bg-midnight-900 pb-20 pt-[15.5rem] lg:pb-28 lg:pt-0"
    >
      <SectionBackdrop
        src={sectionImages.whyTouch}
        tone="900"
        sizes="(max-width: 1023px) 180vw, 62vw"
        className="inset-x-0 top-0 h-[19rem] lg:left-auto lg:right-0 lg:h-[31rem] lg:w-[60%]"
        imageClassName="object-[82%_center] lg:object-right"
        labelClassName="right-4 top-4 lg:right-10 lg:top-8"
      />

      <div className={container}>
        {/* Desktop: the heading gets its own band so the image beside it stays uncovered. */}
        <Reveal className="lg:flex lg:min-h-[30rem] lg:items-center lg:pt-8">
          <SectionHeader title={t("title")} lead={t("lead")} className="lg:max-w-xl" />
        </Reveal>

        <RevealStagger as="ul" className="mt-10 grid gap-5 lg:mt-0 lg:grid-cols-2">
          {CARDS.map((key) => (
            <RevealItem
              key={key}
              as="li"
              className="flex flex-col rounded-[20px] border border-midnight-600/70 bg-midnight-700/95 p-6 backdrop-blur lg:p-8"
            >
              <p className="text-[1.3rem] font-medium leading-[1.4] tracking-[-0.01em] lg:text-[1.65rem]">
                {t.rich(`cards.${key}.claim`, {
                  b: (chunks) => (
                    <strong className="whitespace-nowrap font-extrabold">{chunks}</strong>
                  ),
                  hl: (chunks) => <span className="text-velox-orange">{chunks}</span>,
                })}
              </p>

              {/* Conditions and citation are quoted in the papers' language. */}
              <p lang="en" className="mt-6 text-[14px] leading-[1.65] text-lavender-300">
                {t(`cards.${key}.conditions`)}
              </p>

              <a
                href={t(`cards.${key}.url`)}
                target="_blank"
                rel="noopener noreferrer"
                lang="en"
                className="group mt-4 inline-flex items-start gap-1.5 self-start text-[14px] leading-[1.5] text-cream-100/90 underline decoration-cream-100/30 underline-offset-4 transition-colors hover:decoration-cream-100"
              >
                {t(`cards.${key}.source`)}
                <ArrowUpRight
                  aria-hidden
                  className="mt-[3px] size-4 shrink-0 text-lavender-300 transition-colors group-hover:text-cream-100"
                />
              </a>

              <p className="mt-auto flex items-start gap-2 pt-7 text-[13px] leading-[1.55] text-lavender-300">
                <Info aria-hidden className="mt-[2px] size-[15px] shrink-0" />
                {t("note")}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
