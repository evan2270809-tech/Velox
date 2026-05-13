import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  size?: "md" | "lg";
  className?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] " +
  "active:bg-[var(--color-accent-press)] text-white " +
  "shadow-[var(--shadow-cta)] hover:shadow-[var(--shadow-cta-hover)] " +
  "transition-all duration-[var(--duration-fast)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const sizes = {
  md: "h-11 px-6 text-[14px]",
  lg: "h-14 px-7 text-[15px]",
};

export function Button({ children, href, size = "md", className, ...rest }: ButtonProps) {
  const classes = cn(base, sizes[size], className);

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
