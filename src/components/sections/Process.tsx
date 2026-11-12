import { useTranslations } from "next-intl";
import { SectionHeading, emRenderer } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProcessTimeline } from "./shared/ProcessTimeline";

interface Stage {
  title: string;
  weeks?: string;
  body: string;
}

export function Process() {
  const t = useTranslations("process");
  const stages = t.raw("stages") as Stage[];

  return (
    <section
      id="process"
      className="border-t border-[var(--color-divider)] bg-[var(--color-abyss)] py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t.rich("title", { em: emRenderer("light") })}
            lede={t("lede")}
          />
        </Reveal>
        <ProcessTimeline stages={stages} />
      </div>
    </section>
  );
}
