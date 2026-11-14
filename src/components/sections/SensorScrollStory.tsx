"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import type { SensorRig } from "@/components/three/sensor";

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The fingertip sensor as a line drawing in 3D. Scrolling pulls its layers
 * apart. There are no controls and no labels: the page says only that the
 * sensor is our own design and reads both pressure and shear.
 */
export function SensorScrollStory({
  id,
  header,
  note,
  canvasLabel,
}: {
  id: string;
  header: ReactNode;
  note: string;
  canvasLabel: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rigRef = useRef<SensorRig | null>(null);

  const update = useCallback(() => {
    const section = sectionRef.current;
    const rig = rigRef.current;
    if (!section || !rig) return;
    const range = section.offsetHeight - window.innerHeight;
    const p = clamp01(-section.getBoundingClientRect().top / Math.max(range, 1));
    rig.explode = smooth(clamp01((p - 0.12) / 0.7));
    rig.turn = -0.95 + p * 0.6;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let rig: SensorRig | null = null;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    void import("@/components/three/sensor").then(({ SensorRig }) => {
      if (cancelled) return;
      try {
        rig = new SensorRig(canvas);
      } catch {
        return;
      }
      const r = rig;
      rigRef.current = r;
      r.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const size = () => r.resize(canvas.clientWidth, canvas.clientHeight);
      size();
      update();
      const ro = new ResizeObserver(size);
      ro.observe(canvas);
      const io = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) r.start();
        else r.stop();
      });
      io.observe(canvas);
      cleanups.push(() => {
        ro.disconnect();
        io.disconnect();
      });
    });

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cleanups.forEach((fn) => fn());
      rig?.dispose();
      rigRef.current = null;
    };
  }, [update]);

  return (
    <section id={id} ref={sectionRef} className="relative h-[240svh] border-t border-line">
      <div className="sticky top-0 h-svh overflow-hidden bg-paper-2">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={canvasLabel}
          className="absolute inset-x-0 top-[8%] block h-[52%] w-full lg:inset-y-0 lg:left-[36%] lg:top-0 lg:h-full lg:w-[64%]"
        />
        <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-5 pb-8 pt-24 sm:px-8 lg:justify-center lg:px-10 lg:pb-0">
          <div className="max-w-[27rem]">
            {header}
            <p className="mt-6 font-mono text-[12px] leading-4 text-ink-3">{note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
