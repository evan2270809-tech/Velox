import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader, container } from "@/components/ui/SectionHeader";

const ITEMS = ["sell", "measure", "episode", "formats", "collection", "research"] as const;

/**
 * Native <details> accordion: works without JavaScript, answers stay in the HTML
 * for search engines, and the shared `name` keeps one item open at a time.
 */
export function FAQ() {
  const t = useTranslations("faq");

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className={container}>
        <Reveal>
          <SectionHeader title={t("title")} />
        </Reveal>

        <Reveal className="mt-8 max-w-3xl border-t border-midnight-600/70 lg:mt-12">
          {ITEMS.map((key, index) => (
            <details
              key={key}
              name="faq"
              open={index === 0}
              className="faq-item group border-b border-midnight-600/70"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-[17px] font-semibold leading-[1.4] transition-colors hover:text-cream-100 lg:text-[19px]">
                {t(`items.${key}.q`)}
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-lavender-300 transition-transform duration-300 group-open:rotate-180 group-open:text-velox-orange"
                  strokeWidth={2}
                />
              </summary>
              <p className="pb-7 pr-10 text-[16px] leading-[1.7] text-cream-100/75">
                {t(`items.${key}.a`)}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
