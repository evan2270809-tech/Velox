"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { GloveCanvas } from "@/components/three/GloveCanvas";
import type { GloveRig, GloveState } from "@/components/three/glove";
import { cn } from "@/lib/cn";

export interface StoryChapter {
  /** Rendered status badge (server component), e.g. "Design concept". */
  badge: ReactNode;
  title: string;
  body: string;
  link: { href: string; label: string };
}

interface HomeStoryProps {
  chip: string;
  headline: [string, string];
  sub: string;
  actions: ReactNode;
  conceptNote: string;
  hint: string;
  canvasLabel: string;
  chapters: [StoryChapter, StoryChapter, StoryChapter];
  streams: { label: string; live?: boolean }[];
  /** Labels for the glove, the contact point and the robot hand. */
  tags: [string, string, string];
  traceNote: string;
}

const BASE: GloveState = {
  x: 0, y: 0, ox: 0, oy: 0, rotX: 0, rotY: 0, rotZ: 0,
  scale: 1, curl: 0.2, point: 0, sweep: 0, grip: 0, explode: 0,
};
const pose = (p: Partial<GloveState>): GloveState => ({ ...BASE, ...p });

type Stop = { glove: GloveState; robot: GloveState; flow: number };

/** The robot hand waits off stage to the right once the story moves on. */
const ROBOT_AWAY = pose({ ox: 46, y: -0.06, rotZ: 1.5, rotX: 0.3, curl: 0.3, point: 1 });

/**
 * Poses at each stop of the scroll story: the two hands meeting, then the
 * glove alone for the whole hand, the fingertip and the capture system.
 * `wide` is used from tablet landscape up, `narrow` on phones.
 */
const STOPS: { wide: Stop; narrow: Stop }[] = [
  {
    wide: {
      glove: pose({ ox: -10.2, oy: -1.7, y: -0.1, rotZ: -1.42, rotX: 0.38, rotY: 0.12, scale: 0.88, curl: 0.34, point: 1, sweep: 0.25 }),
      robot: pose({ ox: 10.2, oy: 0.5, y: -0.1, rotZ: 1.5, rotX: 0.3, rotY: -0.12, scale: 0.88, curl: 0.3, point: 1 }),
      flow: 1,
    },
    narrow: {
      glove: pose({ ox: -7.6, oy: -1.4, y: 0.02, rotZ: -1.42, rotX: 0.38, rotY: 0.12, scale: 0.74, curl: 0.34, point: 1, sweep: 0.25 }),
      robot: pose({ ox: 7.6, oy: 0.5, y: 0.02, rotZ: 1.5, rotX: 0.3, rotY: -0.12, scale: 0.74, curl: 0.3, point: 1 }),
      flow: 1,
    },
  },
  {
    wide: { glove: pose({ x: -0.21, y: -0.02, rotX: -0.04, rotY: -0.22, scale: 1.04, curl: 0.02, sweep: 1 }), robot: ROBOT_AWAY, flow: 0 },
    narrow: { glove: pose({ y: 0.13, rotX: -0.04, rotY: -0.2, scale: 0.72, curl: 0.02, sweep: 1 }), robot: ROBOT_AWAY, flow: 0 },
  },
  {
    wide: { glove: pose({ x: 0.14, y: -0.52, rotX: 0.3, rotY: 0.62, scale: 2.3, curl: 0.16, sweep: 0.25 }), robot: ROBOT_AWAY, flow: 0 },
    narrow: { glove: pose({ x: 0.16, y: -0.2, rotX: 0.3, rotY: 0.6, scale: 1.7, curl: 0.16, sweep: 0.25 }), robot: ROBOT_AWAY, flow: 0 },
  },
  {
    wide: { glove: pose({ x: -0.22, y: -0.02, rotX: 0.1, rotY: -0.85, scale: 0.98, curl: 0.62, grip: 1 }), robot: ROBOT_AWAY, flow: 0 },
    narrow: { glove: pose({ y: 0.14, rotX: 0.1, rotY: -0.8, scale: 0.7, curl: 0.62, grip: 1 }), robot: ROBOT_AWAY, flow: 0 },
  },
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export function HomeStory({
  chip,
  headline,
  sub,
  actions,
  conceptNote,
  hint,
  canvasLabel,
  chapters,
  streams,
  tags,
  traceNote,
}: HomeStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rigRef = useRef<GloveRig | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const traceRef = useRef<HTMLCanvasElement>(null);
  const traceOn = useRef(false);
  const heroOpacity = useRef(1);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const update = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const range = section.offsetHeight - window.innerHeight;
    const p = clamp01(-section.getBoundingClientRect().top / Math.max(range, 1));
    const pos = p * (STOPS.length - 1); // 0 … 3
    const i = Math.min(Math.floor(pos), STOPS.length - 2);
    // Hold each pose, then move during the middle of the gap.
    const f = smooth(clamp01((pos - i - 0.22) / 0.56));
    const narrow = window.innerWidth < 900;

    const rig = rigRef.current;
    if (rig) {
      const a = STOPS[i]![narrow ? "narrow" : "wide"];
      const b = STOPS[i + 1]![narrow ? "narrow" : "wide"];
      (Object.keys(BASE) as (keyof GloveState)[]).forEach((key) => {
        rig.target[key] = a.glove[key] + (b.glove[key] - a.glove[key]) * f;
        if (rig.robotTarget) rig.robotTarget[key] = a.robot[key] + (b.robot[key] - a.robot[key]) * f;
      });
      rig.flow = a.flow + (b.flow - a.flow) * f;
    }

    const show = (el: HTMLElement | null, stop: number) => {
      if (!el) return 0;
      const o = clamp01(1 - (Math.abs(pos - stop) - 0.2) / 0.16);
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(pos - stop) * -36}px, 0)`;
      el.style.visibility = o === 0 ? "hidden" : "visible";
      el.inert = o < 0.5;
      return o;
    };
    heroOpacity.current = show(heroRef.current, 0);
    if (headlineRef.current) {
      const o = clamp01(1 - (pos - 0.12) / 0.3);
      headlineRef.current.style.opacity = String(o);
      headlineRef.current.style.transform = `translate3d(0, ${pos * -60}px, 0)`;
    }
    panelRefs.current.forEach((el, n) => show(el, n + 1));
    traceOn.current = Math.abs(pos - 3) < 0.4;

    const active = Math.round(pos);
    railRefs.current.forEach((el, n) => {
      if (el) el.dataset.active = String(n === active);
    });
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

  /* Live trace of the five fingertip channels, drawn from the model itself. */
  useEffect(() => {
    const canvas = traceRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const N = 160;
    const history = Array.from({ length: 5 }, () => new Float32Array(N));
    let head = 0;
    let frame = 0;
    let last = 0;

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const rig = rigRef.current;
      if (!traceOn.current || !rig || now - last < 33) return;
      last = now;
      for (let c = 0; c < 5; c++) history[c]![head] = rig.signals[c]!;
      head = (head + 1) % N;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const row = h / 5;
      for (let c = 0; c < 5; c++) {
        const base = row * (c + 1) - 3;
        ctx.beginPath();
        for (let n = 0; n < N; n++) {
          const v = history[c]![(head + n) % N]!;
          const x = (n / (N - 1)) * w;
          const y = base - v * (row - 6);
          if (n === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = c === 1 ? "#ff9500" : "#111111";
        ctx.globalAlpha = c === 1 ? 1 : 0.55;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Annotation tags follow the hands, like labels on an annotated recording. */
  useEffect(() => {
    let frame = 0;
    const keys = ["glove", "contact", "robot"] as const;
    const place = () => {
      frame = requestAnimationFrame(place);
      const rig = rigRef.current;
      const section = sectionRef.current;
      if (!rig || !section) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      keys.forEach((key, n) => {
        const el = tagRefs.current[n];
        if (!el) return;
        const a = rig.anchors[key];
        el.style.opacity = String(heroOpacity.current);
        el.style.transform = `translate3d(${a.x * w}px, ${a.y * h}px, 0)`;
      });
    };
    frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
  }, []);

  const onReady = useCallback(
    (rig: GloveRig) => {
      rigRef.current = rig;
      update();
      rig.snap();
    },
    [update],
  );

  return (
    <section ref={sectionRef} className="relative h-[400svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Giant headline; the glove stands in front of it. */}
        <div
          ref={headlineRef}
          className="absolute inset-x-0 top-[12svh] px-4 text-center will-change-transform lg:top-[13svh]"
        >
          <h1 className="display text-[clamp(2.5rem,8.2vw,8.5rem)] leading-[0.98] tracking-[-0.045em] text-ink">
            <span className="block">{headline[0]}</span>
            <span className="block">{headline[1]}</span>
          </h1>
        </div>

        <div className="absolute inset-0">
          <GloveCanvas onReady={onReady} initial={STOPS[0]!.wide.glove} robot mirrored label={canvasLabel} />
        </div>

        {/* Annotation tags */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
          {tags.map((tag, n) => (
            <span
              key={tag}
              ref={(el) => {
                tagRefs.current[n] = el;
              }}
              className="absolute left-0 top-0 will-change-transform"
            >
              <span
                className={cn(
                  "absolute flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-[4px] border px-1.5 py-1 font-mono text-[11px] leading-none",
                  n === 1
                    ? "-top-16 border-velox-orange/50 bg-velox-orange/15 text-accent-ink"
                    : "top-12 border-line-strong bg-paper/80 text-ink-2 backdrop-blur-sm",
                )}
              >
                <span className={cn("size-1.5 rounded-full", n === 1 ? "bg-velox-orange" : "bg-ink")} />
                {tag}
              </span>
            </span>
          ))}
        </div>

        {/* Hero copy: centred below the two hands, between the forearms */}
        <div ref={heroRef} className="absolute inset-x-0 bottom-0 will-change-transform">
          <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-8 sm:px-8 lg:px-10 lg:pb-10">
            <div className="mx-auto max-w-[34rem] rounded-2xl bg-paper/90 p-4 text-center backdrop-blur-md lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <p className="eyebrow">{chip}</p>
              <p className="mt-3 text-[16px] leading-6 text-ink-2 lg:text-[17px] lg:leading-7">{sub}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">{actions}</div>
            </div>
            <div className="absolute bottom-10 right-10 hidden text-right xl:block">
              <p className="eyebrow">{hint}</p>
              <p className="mt-1.5 font-mono text-[12px] leading-4 text-ink-3">{conceptNote}</p>
            </div>
          </div>
        </div>

        {/* Chapters */}
        {chapters.map((chapter, n) => {
          const right = n !== 1;
          return (
            <div
              key={chapter.title}
              ref={(el) => {
                panelRefs.current[n] = el;
              }}
              style={{ opacity: 0, visibility: "hidden" }}
              className={cn(
                "absolute inset-x-0 bottom-0 will-change-transform lg:inset-y-0 lg:flex lg:items-center",
              )}
            >
              <div className="mx-auto w-full max-w-[1440px] px-5 pb-8 sm:px-8 lg:px-10 lg:pb-0">
                <div
                  className={cn(
                    "max-w-[30rem] rounded-2xl bg-paper/90 p-5 backdrop-blur-md lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
                    right && "lg:ml-auto",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[12px] leading-4 text-ink-3">
                      {String(n + 1).padStart(2, "0")}
                    </span>
                    {chapter.badge}
                  </div>
                  <h2 className="display mt-4 text-[32px] lg:mt-5 lg:text-[52px]">{chapter.title}</h2>
                  <p className="mt-3 text-[16px] leading-6 text-ink-2 lg:mt-5 lg:text-[19px] lg:leading-8">
                    {chapter.body}
                  </p>

                  {n === 2 && (
                    <div className="mt-5 hidden border-t border-line sm:block lg:mt-7">
                      {streams.map((stream) => (
                        <div
                          key={stream.label}
                          className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-4 border-b border-line py-2.5"
                        >
                          <span className="font-mono text-[12px] leading-4 text-ink-2">
                            {stream.label}
                          </span>
                          {stream.live ? (
                            <canvas ref={traceRef} aria-hidden className="h-16 w-full" />
                          ) : (
                            <span
                              aria-hidden
                              className="h-2 w-full bg-[repeating-linear-gradient(90deg,var(--color-line-strong)_0_1px,transparent_1px_7px)]"
                            />
                          )}
                        </div>
                      ))}
                      <p className="mt-2.5 font-mono text-[11px] leading-4 text-ink-3">{traceNote}</p>
                    </div>
                  )}

                  <a
                    href={chapter.link.href}
                    className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink lg:mt-7"
                  >
                    {chapter.link.label}
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {/* Progress rail */}
        <div
          aria-hidden
          className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:right-6 xl:flex"
        >
          {STOPS.map((_, n) => (
            <span
              key={n}
              ref={(el) => {
                railRefs.current[n] = el;
              }}
              className="h-6 w-px bg-line-strong transition-colors duration-300 data-[active=true]:bg-ink"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
