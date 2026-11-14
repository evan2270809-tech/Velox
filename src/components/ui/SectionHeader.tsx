import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}

/** Shared page gutter. */
export const container = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10";

/** Shared section rhythm: a hairline on top, generous space around. */
export const sectionFrame = "border-t border-line py-20 lg:py-28";

export function SectionHeader({ title, lead, className }: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 className="display text-[30px] lg:text-[44px]">{title}</h2>
      {lead && <p className="mt-4 text-[17px] leading-7 text-ink-2 lg:text-[19px] lg:leading-8">{lead}</p>}
    </div>
  );
}
