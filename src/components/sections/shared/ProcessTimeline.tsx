"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Stage {
  title: string;
  weeks?: string;
  body: string;
}

interface ProcessTimelineProps {
  stages: Stage[];
}

export function ProcessTimeline({ stages }: ProcessTimelineProps) {
  const ref = useRef<HTMLOListElement | null>(null);
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <ol ref={ref} className="relative mt-10 grid gap-10 lg:grid-cols-4 lg:gap-8">
      {/* Hairline base */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[18px] hidden lg:block"
        style={{
          left: "calc(12.5% + 22px)",
          right: "calc(12.5% + 22px)",
          height: 1,
          background: "var(--color-lead)",
        }}
      />
      {/* Animated progress overlay */}
      <div
        aria-hidden
        className={`pointer-events-none absolute top-[18px] hidden lg:block ${
          active ? "timeline-progress-active" : ""
        }`}
        style={{
          left: "calc(12.5% + 22px)",
          height: 1,
          width: active ? undefined : "0%",
          background: "var(--color-accent)",
          maxWidth: "75%",
        }}
      />
      {stages.map((stage, i) => {
        const isFirst = i === 0;
        return (
          <motion.li
            key={stage.title}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1.05, 0.36, 1],
              delay: reduceMotion ? 0 : i * 0.12,
            }}
            className="relative flex flex-col gap-3"
          >
            <div className="flex items-center gap-3 lg:flex-col lg:items-start">
              <span
                className={`relative z-10 flex size-9 items-center justify-center rounded-full text-[13px] font-medium ${
                  isFirst
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-white text-[var(--color-starlight)]"
                }`}
                style={{
                  boxShadow: isFirst
                    ? "0 0 0 4px var(--color-abyss), 0 0 0 5px var(--color-accent)"
                    : "0 0 0 4px var(--color-abyss), 0 0 0 5px var(--color-lead)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1 lg:mt-5">
                {stage.weeks && (
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-silver)]">
                    {stage.weeks}
                  </span>
                )}
                <h3
                  className="font-display text-[24px] leading-tight text-[var(--color-starlight)] lg:text-[26px]"
                  style={{ fontWeight: 700 }}
                >
                  {stage.title}
                </h3>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-[var(--color-silver)] lg:max-w-[260px]">
              {stage.body}
            </p>
          </motion.li>
        );
      })}
    </ol>
  );
}
