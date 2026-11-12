import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface MetricItem {
  value: string;
  label: string;
}

// Direction hints per metric position: cost-cut (down), time (down), volume (up), retention (up)
const DIRECTIONS: Array<"down" | "up"> = ["down", "down", "up", "up"];

export function Metrics() {
  const t = useTranslations("metrics");
  const items = t.raw("items") as MetricItem[];

  return (
    <section className="border-t border-[var(--color-divider)] bg-[var(--color-cream)] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

        <ul className="mt-10 grid grid-cols-2 lg:grid-cols-4">
          {items.map((m, i) => {
            const dir = DIRECTIONS[i] ?? "up";
            const Arrow = dir === "down" ? ArrowDownRight : ArrowUpRight;
            return (
              <li
                key={m.label}
                className="animate-spring-in flex flex-col gap-4 px-5 py-6 md:px-8 md:py-2 lg:border-l lg:first:border-l-0"
                style={{
                  animationDelay: `${i * 80}ms`,
                  borderColor: "var(--color-lead)",
                }}
              >
                <span
                  className="font-numeric text-[clamp(56px,7vw,84px)] font-medium leading-[0.95] tracking-[-0.02em] text-[var(--color-starlight)]"
                >
                  {m.value}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.16em] text-[var(--color-silver)]">
                  <Arrow
                    className="size-3.5 shrink-0 text-[var(--color-accent-press)]"
                    strokeWidth={2.25}
                  />
                  {m.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
