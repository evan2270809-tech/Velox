"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { GloveRig, GloveState } from "./glove";

interface GloveCanvasProps {
  /** Called once the model exists. The caller steers it through `rig.target`. */
  onReady?: (rig: GloveRig) => void;
  initial?: Partial<GloveState>;
  /** Adds the robot hand and the data stream between the two index fingertips. */
  robot?: boolean;
  /** Builds a left-hand glove instead of a right-hand one. */
  mirrored?: boolean;
  /** Uses the scanned hand in its glove instead of the posable concept model. */
  scan?: boolean;
  /**
   * "follow": the canvas ignores the pointer itself; the glove leans towards the
   * cursor anywhere on the page (used behind page content).
   * "drag": the visitor rotates the glove by dragging on the canvas.
   */
  interaction?: "follow" | "drag";
  /** Text alternative for the picture. */
  label: string;
  className?: string;
}

/**
 * Mounts the WebGL glove. three.js is loaded on the client only and the frame
 * loop runs only while the canvas is on screen.
 */
export function GloveCanvas({
  onReady,
  initial,
  robot = false,
  mirrored = false,
  scan = false,
  interaction = "follow",
  label,
  className,
}: GloveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const initialRef = useRef(initial);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let rig: GloveRig | null = null;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    void import("./glove").then(({ GloveRig }) => {
      if (cancelled) return;
      try {
        rig = new GloveRig(canvas, { robot, mirrored, scan });
      } catch {
        return; // No WebGL: the page still reads fine without the model.
      }
      const r = rig;
      Object.assign(r.target, initialRef.current);
      r.snap();
      r.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const size = () => r.resize(canvas.clientWidth, canvas.clientHeight);
      size();
      const ro = new ResizeObserver(size);
      ro.observe(canvas);
      cleanups.push(() => ro.disconnect());

      const io = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) r.start();
        else r.stop();
      });
      io.observe(canvas);
      cleanups.push(() => io.disconnect());

      const toNdc = (e: PointerEvent) => {
        const b = canvas.getBoundingClientRect();
        const x = ((e.clientX - b.left) / b.width) * 2 - 1;
        const y = -(((e.clientY - b.top) / b.height) * 2 - 1);
        return Math.abs(x) <= 1 && Math.abs(y) <= 1 ? { x, y } : null;
      };

      if (interaction === "follow") {
        const move = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          const p = toNdc(e);
          r.pointer = p;
          r.nudge.y = p ? p.x * 0.28 : 0;
          r.nudge.x = p ? -p.y * 0.12 : 0;
        };
        const leave = () => {
          r.pointer = null;
          r.nudge.x = 0;
          r.nudge.y = 0;
        };
        window.addEventListener("pointermove", move, { passive: true });
        document.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          window.removeEventListener("pointermove", move);
          document.removeEventListener("pointerleave", leave);
        });
      } else {
        let drag: { x: number; y: number; nx: number; ny: number } | null = null;
        const down = (e: PointerEvent) => {
          drag = { x: e.clientX, y: e.clientY, nx: r.nudge.x, ny: r.nudge.y };
          canvas.setPointerCapture(e.pointerId);
          canvas.dataset.dragging = "true";
        };
        const move = (e: PointerEvent) => {
          r.pointer = e.pointerType === "touch" && !drag ? null : toNdc(e);
          if (!drag) return;
          r.nudge.y = drag.ny + (e.clientX - drag.x) * 0.008;
          r.nudge.x = Math.max(-0.7, Math.min(0.7, drag.nx + (e.clientY - drag.y) * 0.005));
        };
        const up = () => {
          drag = null;
          delete canvas.dataset.dragging;
        };
        const leave = () => {
          if (!drag) r.pointer = null;
        };
        canvas.addEventListener("pointerdown", down);
        canvas.addEventListener("pointermove", move);
        canvas.addEventListener("pointerup", up);
        canvas.addEventListener("pointercancel", up);
        canvas.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          canvas.removeEventListener("pointerdown", down);
          canvas.removeEventListener("pointermove", move);
          canvas.removeEventListener("pointerup", up);
          canvas.removeEventListener("pointercancel", up);
          canvas.removeEventListener("pointerleave", leave);
        });
      }

      if (process.env.NODE_ENV !== "production") {
        // Handy while tuning poses in the browser console.
        (window as unknown as { __rig?: GloveRig }).__rig = r;
      }
      onReadyRef.current?.(r);
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      rig?.dispose();
    };
  }, [interaction, robot, mirrored, scan]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className={cn(
        "block size-full",
        interaction === "follow"
          ? "pointer-events-none"
          : "cursor-grab touch-pan-y data-[dragging=true]:cursor-grabbing",
        className,
      )}
    />
  );
}
