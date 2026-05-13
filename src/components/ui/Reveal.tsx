"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

type AsTag = "div" | "li" | "section" | "article" | "header" | "ul" | "ol" | "span";

interface RevealProps {
  children: ReactNode;
  /** Pixel offset to translate from (default 24) */
  y?: number;
  /** Delay in seconds before animation starts (default 0) */
  delay?: number;
  /** Duration in seconds (default 0.7) */
  duration?: number;
  /** Top margin for viewport intersection (default -80px) */
  margin?: string;
  /** Replay each time it enters viewport (default false — animate once) */
  repeat?: boolean;
  /** Tag to render (default "div") */
  as?: AsTag;
  className?: string;
  style?: ComponentProps<typeof motion.div>["style"];
}

/**
 * Scroll-triggered fade + slide-up wrapper.
 * Defaults play once when the element is roughly 80px into the viewport.
 */
export function Reveal({
  children,
  y = 24,
  delay = 0,
  duration = 0.7,
  margin = "-80px",
  repeat = false,
  as = "div",
  className,
  style,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduceMotion) {
    const StaticTag = as as keyof JSX.IntrinsicElements;
    // Render plain element so reduced-motion users still see content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (
      // @ts-expect-error dynamic tag
      <StaticTag className={className} style={style}>
        {children}
      </StaticTag>
    );
  }

  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: !repeat, margin: margin as `-${number}px` }}
      transition={{ duration, ease: [0.22, 1.05, 0.36, 1], delay }}
      className={className}
      style={style}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Stagger container — wraps a list and reveals children sequentially.
 * Combine with <Reveal.Item> children.
 */
export function RevealStagger({
  children,
  step = 0.08,
  margin = "-60px",
  as = "ul",
  className,
}: {
  children: ReactNode;
  step?: number;
  margin?: string;
  as?: AsTag;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : step } },
  };

  if (reduceMotion) {
    const StaticTag = as as keyof JSX.IntrinsicElements;
    return (
      // @ts-expect-error dynamic tag
      <StaticTag className={className}>{children}</StaticTag>
    );
  }

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: margin as `-${number}px` }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1.05, 0.36, 1] },
  },
};

export function RevealItem({
  children,
  as = "li",
  className,
  style,
}: {
  children: ReactNode;
  as?: AsTag;
  className?: string;
  style?: ComponentProps<typeof motion.li>["style"];
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag variants={childVariants} className={className} style={style}>
      {children}
    </MotionTag>
  );
}
