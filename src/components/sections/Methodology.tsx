import { useTranslations } from "next-intl";
import { Microscope, Wallet, FileCheck2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";

const ICONS = [Microscope, Wallet, FileCheck2];

interface Note {
  title: string;
  body: string;
  tag: string;
}

export function Methodology() {
  const t = useTranslations("methodology");
  const notes = t.raw("items") as Note[];

  return (
    <section
      id="methodology"
      className="border-t border-[var(--color-divider)] bg-[var(--color-cream)] py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            lede={t("lede")}
          />
        </Reveal>

        <RevealStagger as="ul" className="mt-14 grid gap-5 md:grid-cols-3">
          {notes.map((n, i) => {
            const Icon = ICONS[i];
            return (
              <RevealItem
                key={n.title}
                as="li"
                className="flex h-full flex-col gap-5 rounded-[16px] bg-white p-8 md:p-10"
                style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,18,0.08)" }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="inline-flex size-11 items-center justify-center rounded-[10px]"
                    style={{
                      background: "var(--color-accent-soft)",
                      color: "var(--color-accent-press)",
                    }}
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <span
                    className="text-[10px] font-medium uppercase text-[var(--color-silver)]"
                    style={{ letterSpacing: "0.16em" }}
                  >
                    {n.tag}
                  </span>
                </div>
                <h3
                  className="font-display text-[22px] leading-tight text-[var(--color-starlight)]"
                  style={{ fontWeight: 600, letterSpacing: "-0.015em" }}
                >
                  {n.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-[var(--color-silver)]">
                  {n.body}
                </p>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
