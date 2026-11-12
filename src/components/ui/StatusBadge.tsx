import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export type Status = "working" | "development" | "concept" | "planned";

/**
 * How far along something is, as a quiet readout: a dot and a mono label.
 * Only "working" gets the orange dot, so the one thing that exists today
 * stands out; anything not built yet gets a hollow dot.
 */
const dots: Record<Status, string> = {
  working: "bg-velox-orange",
  development: "bg-ink",
  concept: "border border-ink-3",
  planned: "border border-ink-3",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const t = useTranslations("status");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[12px] leading-4",
        status === "concept" || status === "planned" ? "text-ink-3" : "text-ink-2",
        className,
      )}
    >
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", dots[status])} />
      {t(status)}
    </span>
  );
}
