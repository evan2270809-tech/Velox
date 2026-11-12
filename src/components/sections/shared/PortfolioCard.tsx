import { ArrowUpRight } from "lucide-react";

interface PortfolioCardProps {
  title: string;
  sector: string;
  summary: string;
  kpis: Array<{ value: string; label: string }>;
  index?: number;
}

export function PortfolioCard({
  title,
  sector,
  summary,
  kpis,
  index = 0,
}: PortfolioCardProps) {
  return (
    <div
      className="animate-spring-in group relative h-full overflow-hidden rounded-[10px] bg-white shadow-[var(--shadow-card-rest)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex h-full flex-col gap-5 p-7 md:p-8">
        <div className="flex items-center justify-between">
          <span className="font-mono-tight text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent-press)]">
            {sector}
          </span>
          <ArrowUpRight
            className="size-5 text-[var(--color-lead)] transition-colors group-hover:text-[var(--color-accent)]"
            strokeWidth={1.75}
          />
        </div>

        <h3
          className="font-display text-[22px] leading-tight text-[var(--color-starlight)] md:text-[24px]"
          style={{ fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          {title}
        </h3>
        <p className="text-[14px] leading-relaxed text-[var(--color-silver)] md:text-[15px]">
          {summary}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-[var(--color-divider)] pt-5">
          {kpis.map((k) => (
            <div key={k.label} className="flex flex-col gap-1">
              <span
                className="font-numeric text-[32px] leading-none text-[var(--color-starlight)] md:text-[36px]"
                style={{ fontWeight: 500, letterSpacing: "-0.01em" }}
              >
                {k.value}
              </span>
              <span className="text-[12px] uppercase tracking-[0.14em] text-[var(--color-silver)]">
                {k.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
