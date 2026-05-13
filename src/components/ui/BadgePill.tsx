import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface BadgePillProps {
  children: ReactNode;
  tone?: "neutral" | "brand" | "dark";
  className?: string;
}

const tones = {
  neutral:
    "border border-[var(--color-lead)] bg-white text-[var(--color-silver)]",
  brand:
    "bg-[rgba(242,160,58,0.10)] text-[var(--color-accent-press)]",
  dark:
    "bg-white/[0.08] text-white/80 border border-white/[0.14] backdrop-blur",
};

export function BadgePill({ children, tone = "brand", className }: BadgePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
