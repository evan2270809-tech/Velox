import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/**
 * Small caption that marks an image as a concept illustration, not a real product photo.
 * Hidden from screen readers: the images it sits on are decorative (empty alt).
 */
export function ConceptLabel({ className }: { className?: string }) {
  const t = useTranslations("common");
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none select-none rounded bg-midnight-900/70 px-2 py-1",
        "font-mono text-[11px] leading-none text-[#d9d4c9]",
        className,
      )}
    >
      {t("conceptLabel")}
    </span>
  );
}
