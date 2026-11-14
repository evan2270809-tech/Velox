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
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap " +
  "transition-colors duration-200";

const variants: Record<Variant, string> = {
  // Ink on white. Orange is kept for the live sensor pads, not for buttons.
  primary: "bg-ink text-paper hover:bg-[#333] active:translate-y-px",
  secondary:
    "bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-paper-2 active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[14px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-11 px-5 text-[15px]",
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
