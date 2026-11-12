import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "className">;

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-bold " +
  "transition-colors duration-200";

const variants: Record<Variant, string> = {
  // Orange is reserved for the single main action on a screen.
  primary: "bg-velox-orange text-on-brand hover:bg-[#ffa62b] active:bg-[#f08c00]",
  secondary:
    "bg-cream-100/[0.06] text-cream-100 ring-1 ring-inset ring-cream-100/20 " +
    "hover:bg-cream-100/[0.12]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13.5px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-6 text-base",
};

/** A link styled as a button. Works for mailto: links and in-page anchors. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <a href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </a>
  );
}
