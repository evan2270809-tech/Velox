import { useTranslations } from "next-intl";
import { SectionHeader, container, sectionFrame } from "@/components/ui/SectionHeader";

const ITEMS = ["robotics", "video", "labs"] as const;

export function Audience() {
  const t = useTranslations("audience");

  return (
    <section id="audience" className={sectionFrame}>
      <div className={container}>
        <SectionHeader title={t("title")} />

        <ul className="mt-12 max-w-3xl border-t border-line lg:mt-16">
          {ITEMS.map((key) => (
            <li key={key} className="border-b border-line py-6 text-[18px] leading-7 text-ink-2">
              {t.rich(`items.${key}`, {
                b: (chunks) => <strong className="font-medium text-ink">{chunks}</strong>,
              })}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
