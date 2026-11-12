"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Tile {
  label: string;
  icon: string;
  /** Tailwind grid placement classes */
  span: string;
  /** Card visual variant */
  variant: "orange" | "cream" | "ink" | "white" | "outline";
}

// 9 abstract capability tiles. No numbers, no fake metrics — just service surface area.
const TILES: Tile[] = [
  { label: "Workflow automation", icon: "/brand/icons/workflow-automation.png", span: "col-span-3 row-span-2", variant: "orange" },
  { label: "Model routing", icon: "/brand/icons/model-routing.png", span: "col-span-2 row-span-1", variant: "cream" },
  { label: "Cost dashboard", icon: "/brand/icons/cost-dashboard.png", span: "col-span-2 row-span-1", variant: "ink" },
  { label: "Prompt cache", icon: "/brand/icons/prompt-cache.png", span: "col-span-2 row-span-1", variant: "white" },
  { label: "Evaluation rig", icon: "/brand/icons/evaluation-rig.png", span: "col-span-2 row-span-1", variant: "outline" },
  { label: "Embedded ops", icon: "/brand/icons/embedded-ops.png", span: "col-span-3 row-span-1", variant: "ink" },
  { label: "ROI modeling", icon: "/brand/icons/roi-modeling.png", span: "col-span-2 row-span-1", variant: "white" },
  { label: "Audit", icon: "/brand/icons/audit.png", span: "col-span-2 row-span-1", variant: "orange" },
  { label: "AI strategy", icon: "/brand/icons/ai-strategy.png", span: "col-span-3 row-span-1", variant: "cream" },
];

const VARIANTS = {
  orange: {
    bg: "rgba(242,160,58,0.16)",
    ring: "rgba(242,160,58,0.30)",
    textColor: "var(--color-starlight)",
  },
  cream: {
    bg: "rgba(240,237,230,0.95)",
    ring: "rgba(15,15,18,0.08)",
    textColor: "var(--color-starlight)",
  },
  ink: {
    bg: "rgba(26,26,31,0.96)",
    ring: "rgba(255,255,255,0.06)",
    textColor: "rgba(255,255,255,0.92)",
  },
  white: {
    bg: "#ffffff",
    ring: "rgba(15,15,18,0.08)",
    textColor: "var(--color-starlight)",
  },
  outline: {
    bg: "transparent",
    ring: "rgba(15,15,18,0.16)",
    textColor: "var(--color-silver)",
  },
} as const;

export function HeroBento() {
  return (
    <div className="grid w-full grid-cols-7 grid-rows-4 gap-2.5 md:gap-3">
      {TILES.map((t, i) => {
        const v = VARIANTS[t.variant];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.05 + i * 0.06,
              ease: [0.22, 1.05, 0.36, 1],
            }}
            whileHover={{ y: -2 }}
            className={`relative flex min-h-[64px] flex-col justify-between overflow-hidden rounded-[14px] p-4 md:p-5 ${t.span}`}
            style={{
              background: v.bg,
              boxShadow: `inset 0 0 0 1px ${v.ring}`,
            }}
          >
            <div className="relative size-11 md:size-12">
              <Image
                src={t.icon}
                alt=""
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <span
              className="text-[13px] font-medium tracking-[-0.01em] md:text-[14px]"
              style={{ color: v.textColor }}
            >
              {t.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
