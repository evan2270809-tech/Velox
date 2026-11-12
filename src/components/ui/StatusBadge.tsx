import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export type Status = "working" | "development" | "concept" | "planned";

/**
 * How far along something is. Only "working" uses the orange accent, so the one
 * thing that exists today stands out; anything not built yet gets a dashed outline.
 */
const tones: Record<Status, { pill: string; dot: string }> = {
  working: {
    pill: "border-velox-orange/45 bg-velox-orange/[0.12] text-velox-orange",
    dot: "bg-velox-orange",
  },
  development: {
    pill: "border-cream-100/25 bg-cream-100/[0.04] text-cream-100",
    dot: "bg-cream-100",
  },
  concept: {
    pill: "border-dashed border-lavender-300/55 text-lavender-300",
    dot: "border border-lavender-300",
  },
  planned: {
    pill: "border-dashed border-lavender-300/55 text-lavender-300",
    dot: "border border-lavender-300",
  },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const t = useTranslations("status");
  const tone = tones[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        "text-[12.5px] font-semibold leading-none",
        tone.pill,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", tone.dot)} />
      {t(status)}
    </span>
  );
}
