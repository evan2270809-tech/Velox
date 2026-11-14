import type { ReactNode } from "react";
import { container } from "@/components/ui/SectionHeader";

/** Opening block of an inner page: a mono label, a large light title, a lead. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="pb-16 pt-32 lg:pb-24 lg:pt-44">
      <div className={container}>
        <p className="eyebrow rise">{eyebrow}</p>
        <h1 className="display rise mt-5 max-w-[16ch] text-[clamp(2.75rem,7.4vw,6.5rem)] tracking-[-0.04em]">
          {title}
        </h1>
        {lead && (
          <p
            className="rise mt-6 max-w-2xl text-[18px] leading-7 text-ink-2 lg:mt-8 lg:text-[21px] lg:leading-8"
            style={{ "--rise-delay": "80ms" } as React.CSSProperties}
          >
            {lead}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
