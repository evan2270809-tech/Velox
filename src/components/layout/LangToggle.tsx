"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

interface LangToggleProps {
  onDark?: boolean;
}

export function LangToggle({ onDark = false }: LangToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const swap = (target: (typeof routing.locales)[number]) => {
    if (target === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: target });
    });
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full p-0.5 text-[13px] font-medium",
        onDark
          ? "bg-white/10 shadow-[inset_0_0_0_1px_var(--color-ring-on-dark)]"
          : "bg-[var(--color-bg-subtle)] shadow-[var(--shadow-ring)]",
      )}
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => swap(loc)}
            aria-pressed={active}
            className={cn(
              "h-7 rounded-full px-3 transition-colors",
              active
                ? onDark
                  ? "bg-white text-[var(--color-ink-1)]"
                  : "bg-[var(--color-bg-card)] text-[var(--color-ink-1)] shadow-[var(--shadow-ring)]"
                : onDark
                  ? "text-white/70 hover:text-white"
                  : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)]",
            )}
          >
            {loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
