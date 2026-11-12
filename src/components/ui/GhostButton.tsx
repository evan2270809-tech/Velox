import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type GhostButtonProps = {
  children: ReactNode;
  href?: string;
  size?: "md" | "lg";
  onDark?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "bg-[rgba(205,221,255,0.08)] text-[var(--color-starlight)] " +
  "transition-all duration-[var(--duration-fast)] " +
  "hover:bg-[rgba(205,221,255,0.16)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-starlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]";

const sizes = {
  md: "h-11 px-6 text-[14px]",
  lg: "h-14 px-7 text-[15px]",
};

export function GhostButton({
  children,
  href,
  size = "md",
  className,
  ...rest
}: GhostButtonProps) {
  const classes = cn(
    base,
    sizes[size],
    "shadow-[inset_0_0_0_1px_rgba(237,237,243,0.10)]",
    className,
  );

  if (href) {
    const isExternal = /^https?:|^mailto:|^tel:/.test(href);
    if (isExternal) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
