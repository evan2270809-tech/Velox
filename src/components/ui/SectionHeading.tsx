import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow: string;
  /** Plain string OR pre-rendered ReactNode (for rich-text headings) */
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  index?: number;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  tone = "light",
  className,
}: SectionHeadingProps) {
  const onDark = tone === "dark";
  const headlineColor = onDark ? "text-white" : "text-[var(--color-starlight)]";
  const ledeColor = onDark ? "text-white/70" : "text-[var(--color-silver)]";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          align === "center" && "justify-center",
        )}
      >
        <span
          aria-hidden
          className="h-px w-7 bg-[var(--color-accent)]"
        />
        <span
          className={cn(
            "text-[11px] font-medium uppercase",
            onDark ? "text-[var(--color-accent)]" : "text-[var(--color-accent-press)]",
          )}
          style={{ letterSpacing: "0.16em" }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className={cn(
          "font-display max-w-3xl text-[clamp(32px,4.4vw,52px)]",
          headlineColor,
        )}
        style={{ fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.022em" }}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "max-w-2xl text-[17px]",
            ledeColor,
          )}
          style={{ lineHeight: 1.7 }}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

/** Re-usable `<em>` renderer for next-intl rich-text titles.  */
export function emRenderer(tone: "light" | "dark" = "light") {
  const color =
    tone === "dark"
      ? "text-[var(--color-accent)]"
      : "text-[var(--color-accent-press)]";
  return (chunks: ReactNode) => (
    <span className={color} style={{ fontStyle: "normal" }}>
      {chunks}
    </span>
  );
}
