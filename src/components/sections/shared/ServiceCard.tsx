import { Check, type LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  index?: number;
  tone?: "light" | "dark";
}

export function ServiceCard({
  icon: Icon,
  title,
  description,
  bullets,
  index = 0,
  tone = "light",
}: ServiceCardProps) {
  const onDark = tone === "dark";
  const headingClr = onDark ? "text-white" : "text-[var(--color-starlight)]";
  const bodyClr = onDark ? "text-white/70" : "text-[var(--color-silver)]";
  const dividerClr = onDark ? "border-white/[0.08]" : "border-[var(--color-divider)]";
  const numClr = onDark ? "text-white/45" : "text-[var(--color-silver)]";

  return (
    <div className="flex h-full flex-col gap-5 p-7 md:p-8" data-index={index}>
      <div className="flex items-baseline justify-between">
        <div
          className="inline-flex size-11 items-center justify-center rounded-[8px]"
          style={{
            background: onDark ? "rgba(242,160,58,0.16)" : "var(--color-accent-soft)",
            color: onDark ? "var(--color-accent)" : "var(--color-accent-press)",
          }}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <span
          className={`font-mono-tight text-[11px] uppercase tracking-[0.18em] ${numClr}`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h3
          className={`font-display text-[22px] leading-tight ${headingClr}`}
          style={{ fontWeight: 600 }}
        >
          {title}
        </h3>
        <p className={`text-[15px] leading-relaxed ${bodyClr}`}>{description}</p>
      </div>
      <ul className={`mt-auto flex flex-col gap-2 border-t pt-4 ${dividerClr}`}>
        {bullets.map((b) => (
          <li key={b} className={`flex items-start gap-2 text-[14px] ${bodyClr}`}>
            <Check
              className={`mt-0.5 size-4 shrink-0 ${
                onDark ? "text-[var(--color-accent)]" : "text-[var(--color-accent-press)]"
              }`}
              strokeWidth={2.25}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
