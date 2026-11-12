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
        "pointer-events-none select-none rounded-full bg-midnight-900/60 px-2.5 py-1",
        "text-[11px] font-medium leading-none tracking-[0.03em] text-lavender-300 backdrop-blur-sm",
        className,
      )}
    >
      {t("conceptLabel")}
    </span>
  );
}
