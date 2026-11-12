import { useTranslations } from "next-intl";
import { SectionHeader, container, sectionFrame } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

/** Principles that are plans, not practice yet. Each one is marked "Planned". */
const PLANNED = ["consent", "ids", "noResale"] as const;

export function Traceability() {
  const t = useTranslations("trace");

  return (
    <section id="data" className={sectionFrame}>
      <div className={container}>
        <SectionHeader title={t("title")} lead={t("lead")} />

        {/* The policy in force today: a statement, not a card. */}
        <p className="mt-12 max-w-3xl border-l-2 border-ink pl-6 text-[22px] leading-8 text-ink lg:mt-16 lg:text-[28px] lg:leading-10">
          {t("items.cleanRaw")}
        </p>

        <ul className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-8 lg:mt-16">
          {PLANNED.map((key) => (
            <li key={key} className="border-t border-line-strong pt-4">
              <StatusBadge status="planned" />
              <p className="mt-3 text-[16px] leading-6 text-ink-2">{t(`items.${key}`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
