import { useTranslations } from "next-intl";
import { Rocket, Calculator, Users } from "lucide-react";
import { SectionHeading, emRenderer } from "@/components/ui/SectionHeading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";

const ICONS = [Rocket, Calculator, Users];

interface Item {
  title: string;
  body: string;
}

export function WhyVelox() {
  const t = useTranslations("why");
  const items = t.raw("items") as Item[];

  return (
    <section
      id="why"
      className="border-t border-[var(--color-divider)] bg-[var(--color-cream)] py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t.rich("title", { em: emRenderer("light") })}
          />
        </Reveal>

        <RevealStagger
          as="ul"
          className="mt-14 grid gap-5 md:grid-cols-3"
        >
          {items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <RevealItem
                key={item.title}
                as="li"
                className="flex h-full flex-col gap-5 rounded-[16px] bg-white p-8 md:p-10"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(15,15,18,0.08)",
                }}
              >
                <div
                  className="inline-flex size-11 items-center justify-center rounded-[10px]"
                  style={{
                    background: "var(--color-accent-soft)",
                    color: "var(--color-accent-press)",
                  }}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <h3
                  className="font-display text-[24px] leading-tight text-[var(--color-starlight)] md:text-[26px]"
                  style={{ fontWeight: 600, letterSpacing: "-0.015em" }}
                >
                  {item.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[var(--color-silver)]">
                  {item.body}
                </p>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
