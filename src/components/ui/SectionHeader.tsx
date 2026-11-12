import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}

/** Shared page gutter. */
export const container = "mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10";

export function SectionHeader({ title, lead, className }: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 className="display text-[clamp(2rem,4.4vw,3.25rem)]">{title}</h2>
      {lead && (
        <p className="mt-5 text-[17px] leading-[1.65] text-cream-100/80 lg:text-[19px]">{lead}</p>
      )}
    </div>
  );
}
