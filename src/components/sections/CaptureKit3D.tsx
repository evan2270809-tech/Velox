"use client";

import { useEffect, useRef } from "react";
import type { KitRig } from "@/components/three/kit";

/** Order matches the numbered list under the drawing. */
const NUMBER: Record<string, string> = { gloves: "01", wrist: "02", head: "03" };
/** One head camera, then a glove and a wrist camera for each hand. */
const BADGES = ["head", "gloves", "wrist", "gloves", "wrist"];

/**
 * The capture kit as a 3D line sketch. It sways slowly and can be turned by
 * dragging; the numbered badges follow the parts they name.
 */
export function CaptureKit3D({ label, hint }: { label: string; hint: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let rig: KitRig | null = null;
    let cancelled = false;
    let frame = 0;
    const cleanups: (() => void)[] = [];

    void import("@/components/three/kit").then(({ KitRig }) => {
      if (cancelled) return;
      try {
        rig = new KitRig(canvas);
      } catch {
        return;
      }
      const r = rig;
      r.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const size = () => r.resize(canvas.clientWidth, canvas.clientHeight);
      size();
      const ro = new ResizeObserver(size);
      ro.observe(canvas);
      const io = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) r.start();
        else r.stop();
      });
      io.observe(canvas);

      const place = () => {
        frame = requestAnimationFrame(place);
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        r.anchors.forEach((a, i) => {
          const el = badgeRefs.current[i];
          if (el) el.style.transform = `translate3d(${a.x * w}px, ${a.y * h}px, 0) translate(-50%, -50%)`;
        });
      };
      frame = requestAnimationFrame(place);

      let drag: { x: number; yaw: number } | null = null;
      const down = (e: PointerEvent) => {
        drag = { x: e.clientX, yaw: r.yaw };
        canvas.setPointerCapture(e.pointerId);
        canvas.dataset.dragging = "true";
      };
      const move = (e: PointerEvent) => {
        if (drag) r.yaw = Math.max(-1.1, Math.min(0.9, drag.yaw + (e.clientX - drag.x) * 0.008));
      };
      const up = () => {
        drag = null;
        delete canvas.dataset.dragging;
      };
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      cleanups.push(() => {
        ro.disconnect();
        io.disconnect();
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanups.forEach((fn) => fn());
      rig?.dispose();
    };
  }, []);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-paper-2 sm:aspect-[16/11]">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="absolute inset-0 block size-full cursor-grab touch-pan-y data-[dragging=true]:cursor-grabbing"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {BADGES.map((id, i) => (
          <span
            key={i}
            ref={(el) => {
              badgeRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 grid size-6 place-items-center rounded-full border border-ink bg-paper font-mono text-[10px] leading-none text-ink will-change-transform"
          >
            {NUMBER[id]}
          </span>
        ))}
      </div>
      <p className="eyebrow pointer-events-none absolute bottom-4 left-5">{hint}</p>
    </div>
  );
}
