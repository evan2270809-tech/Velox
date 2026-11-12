import { useLocale, useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PortfolioCard } from "./shared/PortfolioCard";
import { portfolio } from "@/content/portfolio";

export function Portfolio() {
  const t = useTranslations("portfolio");
  const locale = useLocale() as "ko" | "en";

  return (
    <section
      id="portfolio"
      className="border-t border-[var(--color-divider)] bg-[var(--color-cream)] py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {portfolio.map((c, i) => (
            <li key={c.slug} className="h-full">
              <PortfolioCard
                title={c.title[locale]}
                sector={c.sector[locale]}
                summary={c.summary[locale]}
                kpis={c.kpis.map((k) => ({ value: k.value, label: k.label[locale] }))}
                index={i}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
