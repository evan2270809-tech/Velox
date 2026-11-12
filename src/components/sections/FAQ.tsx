import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader, container, sectionFrame } from "@/components/ui/SectionHeader";

const ITEMS = ["sell", "measure", "episode", "formats", "collection", "research"] as const;

/**
 * Native <details> accordion: works without JavaScript, answers stay in the HTML
 * for search engines, and the shared `name` keeps one item open at a time.
 */
export function FAQ() {
  const t = useTranslations("faq");

  return (
    <section id="faq" className={sectionFrame}>
      <div className={container}>
        <SectionHeader title={t("title")} />

        <div className="mt-12 max-w-3xl border-t border-line lg:mt-16">
          {ITEMS.map((key, index) => (
            <details
              key={key}
              name="faq"
              open={index === 0}
              className="faq-item group border-b border-line"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-[18px] font-medium leading-7 transition-colors hover:text-ink-2">
                {t(`items.${key}.q`)}
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180 group-open:text-accent-ink"
                  strokeWidth={2}
                />
              </summary>
              <p className="pb-6 pr-10 text-[16px] leading-7 text-ink-2">
                {t(`items.${key}.a`)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
