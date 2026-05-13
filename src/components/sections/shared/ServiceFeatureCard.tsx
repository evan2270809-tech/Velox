import { Check, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ServiceFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  visual: ReactNode;
  index?: number;
  /** If true, reverses left/right (visual left, text right) */
  reverse?: boolean;
}

export function ServiceFeatureCard({
  icon: Icon,
  title,
  description,
  bullets,
  visual,
  index = 0,
  reverse = false,
}: ServiceFeatureCardProps) {
  return (
    <div
      className="grid grid-cols-1 overflow-hidden rounded-[16px] border border-white/[0.08] bg-white/[0.03] lg:grid-cols-[1fr_1.05fr]"
      data-index={index}
    >
      {/* Text */}
      <div
        className={`flex flex-col gap-6 p-8 md:p-12 ${
          reverse ? "lg:order-2" : ""
        }`}
      >
        <div className="flex items-baseline justify-between">
          <div
            className="inline-flex size-12 items-center justify-center rounded-[10px]"
            style={{
              background: "rgba(242,160,58,0.18)",
              color: "var(--color-accent)",
            }}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
          <span className="font-mono-tight text-[11px] uppercase tracking-[0.2em] text-white/40">
            {String(index + 1).padStart(2, "0")} / 03
          </span>
        </div>
        <h3
          className="font-display text-[clamp(26px,3vw,34px)] leading-[1.1] text-white"
          style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
        >
          {title}
        </h3>
        <p className="text-[16px] leading-relaxed text-white/72">{description}</p>
        <ul className="mt-2 flex flex-col gap-2.5 border-t border-white/[0.08] pt-5">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2.5 text-[14px] text-white/75"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-[var(--color-accent)]"
                strokeWidth={2.25}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual */}
      <div
        className={`relative flex min-h-[280px] items-center justify-center overflow-hidden border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-8 md:min-h-[360px] md:p-12 ${
          reverse
            ? "lg:order-1 lg:border-r"
            : "lg:border-l"
        }`}
      >
        {visual}
      </div>
    </div>
  );
}
