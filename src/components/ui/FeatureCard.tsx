import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  tone?: "graphite" | "abyss" | "transparent" | "white";
}

const tones = {
  graphite: "bg-[var(--color-graphite)] shadow-[inset_0_0_0_1px_rgba(15,15,18,0.06)]",
  abyss: "bg-[var(--color-abyss)] shadow-[inset_0_0_0_1px_rgba(15,15,18,0.06)]",
  transparent: "bg-transparent shadow-[inset_0_0_0_1px_rgba(15,15,18,0.08)]",
  white: "bg-white shadow-[var(--shadow-card-rest)]",
};

export function FeatureCard({
  children,
  className,
  interactive = true,
  tone = "white",
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] p-6 md:p-8 transition-all duration-[var(--duration-fast)]",
        tones[tone],
        interactive && "hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
