import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { ConceptLabel } from "./ConceptLabel";

interface SectionBackdropProps {
  src: string;
  /** Background colour of the section the image fades into. */
  tone: "900" | "800";
  /**
   * side   — a band at the top of the section (full width on mobile, right-hand on desktop)
   * bottom — anchored to the bottom edge, full width
   */
  variant?: "side" | "bottom";
  /** Size and placement of the image box. */
  className?: string;
  /** Focal point, e.g. "object-[80%_center]". */
  imageClassName?: string;
  /** Placement of the "Concept illustration" label inside the image box. */
  labelClassName?: string;
  sizes: string;
}

const toneColor = {
  "900": "var(--color-midnight-900)",
  "800": "var(--color-midnight-800)",
} as const;

/**
 * Decorative concept image behind a section. A dark gradient is always laid over it
 * so text stays readable on every screen size, and it carries the concept label.
 * Place it inside a `relative isolate overflow-hidden` section.
 */
export function SectionBackdrop({
  src,
  tone,
  variant = "side",
  className,
  imageClassName,
  labelClassName,
  sizes,
}: SectionBackdropProps) {
  return (
    <div
      className={cn("pointer-events-none absolute -z-10 overflow-hidden", className)}
      style={{ "--tone": toneColor[tone] } as CSSProperties}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
      />
      {variant === "side" ? (
        <>
          {/* Mobile: fade down into the section. Desktop: fade in from the text side too. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,var(--tone)_96%)] lg:bg-[linear-gradient(90deg,var(--tone)_0%,transparent_62%),linear-gradient(180deg,transparent_45%,var(--tone)_98%)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,var(--tone),transparent)]"
          />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,var(--tone)_0%,transparent_55%)]"
          />
          {/* Keep the left side, where the text sits, dark. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,var(--tone)_0%,transparent_78%)] opacity-90 lg:opacity-75"
          />
        </>
      )}
      <ConceptLabel className={cn("absolute", labelClassName)} />
    </div>
  );
}
