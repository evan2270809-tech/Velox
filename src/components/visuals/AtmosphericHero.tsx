"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

interface AtmosphericHeroProps {
  children: ReactNode;
}

// Inline SVG noise — paper texture overlay.
const grainSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/>
      <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
  </svg>`,
);
const grainUrl = `url("data:image/svg+xml;utf8,${grainSvg}")`;

export function AtmosphericHero({ children }: AtmosphericHeroProps) {
  const { scrollY } = useScroll();
  // Glows drift slower than scroll → parallax depth
  const glowATranslate = useTransform(scrollY, [0, 800], [0, 120]);
  const glowBTranslate = useTransform(scrollY, [0, 800], [0, -80]);
  const grainOpacity = useTransform(scrollY, [0, 600], [0.30, 0.08]);

  return (
    <div className="relative isolate min-h-[88vh] overflow-hidden bg-[var(--color-abyss)]">
      {/* Ambient orange — top right (parallax) */}
      <motion.div
        aria-hidden
        style={{ y: glowATranslate }}
        className="pointer-events-none absolute -right-40 -top-40 -z-30 h-[680px] w-[680px] rounded-full"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(242,160,58,0.18) 0%, rgba(242,160,58,0.06) 35%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      </motion.div>

      {/* Ambient warm wash — bottom left (counter parallax) */}
      <motion.div
        aria-hidden
        style={{ y: glowBTranslate }}
        className="pointer-events-none absolute -bottom-40 -left-40 -z-30 h-[560px] w-[560px] rounded-full"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(212,165,116,0.12) 0%, rgba(212,165,116,0.04) 40%, transparent 70%)",
            filter: "blur(14px)",
          }}
        />
      </motion.div>

      {/* Film grain — fades as user scrolls past hero */}
      <motion.div
        aria-hidden
        style={{ opacity: grainOpacity }}
        className="pointer-events-none absolute inset-0 -z-20 mix-blend-multiply"
      >
        <div
          className="h-full w-full"
          style={{
            backgroundImage: grainUrl,
            backgroundSize: "160px 160px",
          }}
        />
      </motion.div>

      {/* Faint top hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[72px] -z-10 h-px"
        style={{ background: "var(--color-divider)" }}
      />

      {children}
    </div>
  );
}
