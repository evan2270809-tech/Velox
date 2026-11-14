"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { GloveCanvas } from "@/components/three/GloveCanvas";
import type { GloveRig, GloveState } from "@/components/three/glove";
import { cn } from "@/lib/cn";

const BASE: GloveState = {
  x: 0, y: 0, ox: 0, oy: 0, rotX: 0, rotY: 0, rotZ: 0,
  scale: 1, curl: 0, point: 0, sweep: 0, grip: 0, explode: 0,
};
const pose = (p: Partial<GloveState>): GloveState => ({ ...BASE, ...p });

/** Closed hand, open hand, then the layers pulled apart. */
const STOPS: { wide: GloveState; narrow: GloveState }[] = [
  {
    wide: pose({ x: 0.17, y: -0.07, rotX: 0.12, rotY: 0.55, scale: 0.9, curl: 1 }),
    narrow: pose({ y: -0.02, rotX: 0.12, rotY: 0.55, scale: 0.7, curl: 1 }),
  },
  {
    wide: pose({ x: 0.17, y: -0.07, rotX: 0.02, rotY: -0.2, scale: 0.9 }),
    narrow: pose({ y: -0.02, rotX: 0.02, rotY: -0.2, scale: 0.7 }),
  },
  {
    wide: pose({ x: 0.19, y: -0.1, rotX: 0.12, rotY: -1.08, scale: 0.74, explode: 1 }),
    narrow: pose({ y: -0.04, rotX: 0.12, rotY: -1.08, scale: 0.5, explode: 1 }),
  },
];

const LAYERS = [
  { id: "pads", swatch: "bg-[#5b8be6]" },
  { id: "shell", swatch: "border border-line-strong bg-white" },
  { id: "inner", swatch: "bg-[#22b8cf]" },
  { id: "hub", swatch: "bg-[#dfe1e4]" },
] as const;

interface GloveScrollStoryProps {
  id: string;
  /** Badge, title and body, rendered on the server. */
  header: ReactNode;
  labels: {
    assembled: string;
    exploded: string;
    layers: Record<(typeof LAYERS)[number]["id"], string>;
    note: string;
    canvasLabel: string;
  };
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/**
 * The glove on the same scanned hand as the home page. Scrolling opens the
 * closed hand, then pulls the glove's layers apart to show the sensors inside.
 */
export function GloveScrollStory({ id, header, labels }: GloveScrollStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rigRef = useRef<GloveRig | null>(null);
  const stepRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const legendRef = useRef<HTMLUListElement>(null);

  const update = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const range = section.offsetHeight - window.innerHeight;
    const p = clamp01(-section.getBoundingClientRect().top / Math.max(range, 1));
    const posN = p * (STOPS.length - 1);
    const i = Math.min(Math.floor(posN), STOPS.length - 2);
    const f = smooth(clamp01((posN - i - 0.12) / 0.76));
    const key = window.innerWidth < 1024 ? "narrow" : "wide";

    const rig = rigRef.current;
    if (rig) {
      const a = STOPS[i]![key];
      const b = STOPS[i + 1]![key];
      (Object.keys(BASE) as (keyof GloveState)[]).forEach((k) => {
        rig.target[k] = a[k] + (b[k] - a[k]) * f;
      });
    }
    const exploded = posN > 1.45;
    stepRefs.current.forEach((el, n) => {
      if (el) el.dataset.active = String((n === 1) === exploded);
    });
    if (legendRef.current) legendRef.current.dataset.active = String(exploded);
  }, []);

  useEffect(() => {
    update();
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  const onReady = useCallback(
    (rig: GloveRig) => {
      rigRef.current = rig;
      update();
      rig.snap();
    },
    [update],
  );

  return (
    <section id={id} ref={sectionRef} className="relative h-[320svh] border-t border-line">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0">
          <GloveCanvas onReady={onReady} initial={STOPS[0]!.wide} scan label={labels.canvasLabel} />
        </div>

        <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-5 pb-8 pt-24 sm:px-8 lg:justify-center lg:px-10 lg:pb-0">
          <div className="max-w-[27rem] rounded-2xl bg-paper/90 p-5 backdrop-blur-md lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            {header}

            <div className="mt-6 flex items-center gap-3 font-mono text-[12px] uppercase leading-4 tracking-[0.04em] lg:mt-8">
              {[labels.assembled, labels.exploded].map((label, n) => (
                <span
                  key={label}
                  ref={(el) => {
                    stepRefs.current[n] = el;
                  }}
                  data-active={n === 0}
                  className="flex items-center gap-2 text-ink-3 transition-colors duration-300 data-[active=true]:text-ink"
                >
                  <span className="h-px w-6 bg-current" />
                  {label}
                </span>
              ))}
            </div>

            <ul
              ref={legendRef}
              data-active="false"
              className="mt-4 hidden border-t border-line opacity-30 transition-opacity duration-500 data-[active=true]:opacity-100 sm:block"
            >
              {LAYERS.map((layer) => (
                <li key={layer.id} className="flex items-center gap-3 border-b border-line py-2.5 text-[15px] leading-5 text-ink">
                  <span aria-hidden className={cn("size-2.5 shrink-0 rounded-[3px]", layer.swatch)} />
                  {labels.layers[layer.id]}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[12px] leading-4 text-ink-3">{labels.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
