"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { SectionHeading, emRenderer } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

interface Item {
  title: string;
  description: string;
  bullets: string[];
}

// Tonal shading
const FACE_TOP = "#F2A03A";
const FACE_SOUTH = "#C97F1F";
const FACE_WEST = "#A6651A";
const FACE_HIDDEN = "#7A4B12"; // back-facing walls — darker, only ever seen as edge slivers
const EDGE_INK = "rgba(15,15,18,0.18)";

const STAGE_TRANSFORM = "rotateX(58deg) rotateZ(-38deg)";
const CUBE = 320;
const THICK = 72;
const STACK_GAP = 78;

export function CapabilityStack() {
  const t = useTranslations("services");
  const items = t.raw("items") as Item[];

  // Right-panel content always shows something so the section feels populated.
  const [displayed, setDisplayed] = useState(0);
  // Which cube is pulled out — null = nothing pulled (default).
  const [pulled, setPulled] = useState<number | null>(null);

  const stackRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(stackRef, { once: true, margin: "-15% 0px" });

  const activate = (i: number) => {
    setDisplayed(i);
    setPulled(i);
  };

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[var(--color-deep-ink)] py-28 lg:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 -z-10 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(242,160,58,0.18) 0%, rgba(242,160,58,0.04) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-40 -z-10 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(212,165,116,0.10) 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t.rich("title", { em: emRenderer("dark") })}
            lede={t("lede")}
            tone="dark"
          />
        </Reveal>

        {/* Tabs — hover or click activates the corresponding cube */}
        <div className="mt-14 grid gap-3 sm:grid-cols-3 lg:mt-16">
          {items.map((item, i) => {
            const isActive = displayed === i;
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => activate(i)}
                onFocus={() => activate(i)}
                onClick={() => activate(i)}
                aria-pressed={isActive}
                className="group relative flex flex-col gap-2 pt-5 text-left outline-none"
              >
                <span
                  aria-hidden
                  className="absolute left-0 right-0 top-0 h-px bg-white/15"
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 right-0 top-0 h-[2px] origin-left bg-[var(--color-accent)] transition-transform duration-500",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
                <span
                  className={cn(
                    "font-display text-[18px] leading-snug tracking-[-0.01em] transition-colors md:text-[20px]",
                    isActive
                      ? "text-white"
                      : "text-white/45 group-hover:text-white/75",
                  )}
                  style={{
                    fontWeight: 600,
                    wordBreak: "keep-all",
                    textWrap: "balance",
                  }}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stack visual + info panel */}
        <div
          ref={stackRef}
          className="mt-10 grid grid-cols-1 items-center gap-12 lg:mt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16"
        >
          {/* LEFT: 3D cube stack */}
          <div
            className="relative mx-auto flex h-[540px] w-full items-center justify-center lg:h-[640px]"
            style={{ perspective: "2400px" }}
          >
            <div
              className="relative"
              style={{
                width: CUBE,
                height: CUBE,
                transformStyle: "preserve-3d",
                transform: STAGE_TRANSFORM,
              }}
            >
              {/* Transparent cap outline — visible until cubes drop in */}
              <motion.div
                aria-hidden
                className="absolute left-0 top-0"
                style={{
                  width: CUBE,
                  height: CUBE,
                  transformStyle: "preserve-3d",
                  transform: `translate3d(0,0,${(items.length - 1) * STACK_GAP + THICK + 6}px)`,
                  border: "1.5px dashed rgba(242,160,58,0.5)",
                  background:
                    "linear-gradient(135deg, rgba(242,160,58,0.06) 0%, rgba(242,160,58,0) 100%)",
                }}
                initial={{ opacity: 0.55 }}
                animate={{ opacity: inView ? 0 : 0.55 }}
                transition={{ duration: 0.55, delay: 0.8 }}
              />

              {items.map((item, i) => {
                const fromBottom = items.length - 1 - i;
                const finalZ = fromBottom * STACK_GAP;
                const isPulled = pulled === i;
                const dropDelay = fromBottom * 0.16;

                return (
                  <motion.div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => activate(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        activate(i);
                      }
                    }}
                    aria-label={item.title}
                    aria-pressed={isPulled}
                    className="absolute left-0 top-0 cursor-pointer outline-none"
                    style={{
                      width: CUBE,
                      height: CUBE,
                      transformStyle: "preserve-3d",
                    }}
                    initial={{
                      z: finalZ + 460,
                      x: 0,
                      y: -260,
                      opacity: 0,
                    }}
                    animate={
                      inView
                        ? {
                            z: finalZ,
                            x: isPulled ? -200 : 0,
                            y: isPulled ? 145 : 0,
                            opacity: 1,
                          }
                        : {
                            z: finalZ + 460,
                            x: 0,
                            y: -260,
                            opacity: 0,
                          }
                    }
                    transition={{
                      duration: 0.7,
                      delay: inView ? dropDelay : 0,
                      ease: [0.22, 1.05, 0.36, 1],
                    }}
                  >
                    {/* TOP face — Velox wordmark */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: FACE_TOP,
                        boxShadow: isPulled
                          ? `inset 0 0 0 1px ${EDGE_INK}, 0 36px 70px -22px rgba(0,0,0,0.65)`
                          : `inset 0 0 0 1px ${EDGE_INK}, 0 10px 26px -14px rgba(0,0,0,0.4)`,
                        transition: "box-shadow .45s ease",
                      }}
                    >
                      <Image
                        src="/brand/velox-wordmark.png"
                        alt=""
                        width={539}
                        height={140}
                        sizes="220px"
                        priority={i === 0}
                        style={{
                          width: 200,
                          height: "auto",
                          filter: "brightness(0)",
                          display: "block",
                        }}
                      />
                    </div>

                    {/* BOTTOM face — closes the box from below */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: FACE_HIDDEN,
                        transform: `translateZ(-${THICK}px)`,
                      }}
                    />

                    {/* SOUTH face — service title */}
                    <div
                      className="absolute left-0 flex items-center justify-center px-4"
                      style={{
                        top: CUBE,
                        width: CUBE,
                        height: THICK,
                        background: FACE_SOUTH,
                        boxShadow: `inset 0 0 0 1px ${EDGE_INK}`,
                        transformOrigin: "top",
                        transform: "rotateX(-90deg)",
                      }}
                    >
                      <span
                        className="font-display text-center text-[14px] leading-[1.15] text-[#1a1a1f] md:text-[15px]"
                        style={{
                          letterSpacing: "0.04em",
                          fontWeight: 700,
                          wordBreak: "keep-all",
                          textWrap: "balance",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    {/* NORTH face — back wall, closes the box from above */}
                    <div
                      className="absolute left-0"
                      style={{
                        top: -THICK,
                        width: CUBE,
                        height: THICK,
                        background: FACE_HIDDEN,
                        transformOrigin: "bottom",
                        transform: "rotateX(90deg)",
                      }}
                    />

                    {/* WEST face — VELOX engraved */}
                    <div
                      className="absolute top-0 flex items-center justify-center"
                      style={{
                        left: -THICK,
                        width: THICK,
                        height: CUBE,
                        background: FACE_WEST,
                        boxShadow: `inset 0 0 0 1px ${EDGE_INK}`,
                        transformOrigin: "right",
                        transform: "rotateY(-90deg)",
                      }}
                    >
                      <span
                        className="font-display text-[#1a1a1f]"
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          letterSpacing: "0.42em",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          textTransform: "uppercase",
                        }}
                      >
                        VELOX
                      </span>
                    </div>

                    {/* EAST face — back wall, closes the box on the east side */}
                    <div
                      className="absolute top-0"
                      style={{
                        left: CUBE,
                        width: THICK,
                        height: CUBE,
                        background: FACE_HIDDEN,
                        transformOrigin: "left",
                        transform: "rotateY(90deg)",
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: info panel */}
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={displayed}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.22, 1.05, 0.36, 1] }}
                className="flex flex-col gap-6"
              >
                <span
                  className="inline-flex items-center gap-3 text-[11px] uppercase text-[var(--color-accent)]"
                  style={{ letterSpacing: "0.18em" }}
                >
                  <span aria-hidden className="h-px w-7 bg-[var(--color-accent)]" />
                  Layer {String(displayed + 1).padStart(2, "0")}
                </span>
                <h3
                  className="font-display text-[34px] leading-[1.1] tracking-[-0.022em] text-white md:text-[42px]"
                  style={{
                    fontWeight: 700,
                    wordBreak: "keep-all",
                    textWrap: "balance",
                  }}
                >
                  {items[displayed].title}
                </h3>
                <p
                  className="max-w-[52ch] text-[17px] leading-[1.7] text-white/70"
                  style={{ wordBreak: "keep-all" }}
                >
                  {items[displayed].description}
                </p>
                <ul className="flex flex-col gap-3">
                  {items[displayed].bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-[15px] text-white/85"
                      style={{ wordBreak: "keep-all" }}
                    >
                      <span
                        aria-hidden
                        className="mt-[10px] inline-block size-[5px] flex-none rounded-full bg-[var(--color-accent)]"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
