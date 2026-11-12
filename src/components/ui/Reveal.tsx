import type { CSSProperties, ReactNode } from "react";

type Tag = "div" | "li" | "section" | "article" | "header" | "ul" | "ol" | "span";

/**
 * Scroll reveal as progressive enhancement.
 *
 * These components only mark elements with `data-reveal`. Content is visible by
 * default, so it shows without JavaScript and for visitors who prefer reduced
 * motion. <RevealObserver /> (mounted once per page) turns the fade-in on, and
 * the styles live in src/styles/globals.css.
 */
export function Reveal({
  children,
  as: Element = "div",
  delay,
  className,
}: {
  children: ReactNode;
  as?: Tag;
  /** Delay in milliseconds before the element fades in. */
  delay?: number;
  className?: string;
}) {
  return (
    <Element
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Element>
  );
}

/** Wraps a list whose <RevealItem> children fade in one after another, row by row. */
export function RevealStagger({
  children,
  as: Element = "ul",
  className,
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
}) {
  return (
    <Element data-reveal-stagger="" className={className}>
      {children}
    </Element>
  );
}

export function RevealItem({
  children,
  as: Element = "li",
  className,
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
}) {
  return (
    <Element data-reveal="" className={className}>
      {children}
    </Element>
  );
}
