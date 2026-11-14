"use client";

import { useEffect, useRef, useState } from "react";
import type { SensorLayer, SensorMode, SensorRig } from "@/components/three/sensor";
import { cn } from "@/lib/cn";
import { Segmented } from "@/components/ui/Segmented";

const LAYERS: { id: SensorLayer; swatch: string }[] = [
  { id: "shield", swatch: "bg-[#1d1f23]" },
  { id: "top", swatch: "bg-[#a8521f]" },
  { id: "pillars", swatch: "bg-[#5f85b3]" },
  { id: "bottom", swatch: "bg-[#d9a53a]" },
];

interface SensorLabProps {
  labels: {
    modeLabel: string;
    stackLabel: string;
    modes: Record<SensorMode, { label: string; caption: string }>;
    exploded: string;
    assembled: string;
    layers: Record<SensorLayer, string>;
    note: string;
    hint: string;
    canvasLabel: string;
  };
}

/** Interactive layer stack of the fingertip sensor concept. */
export function SensorLab({ labels }: SensorLabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rigRef = useRef<SensorRig | null>(null);
  const [mode, setMode] = useState<SensorMode>("tangential");
  const [exploded, setExploded] = useState(true);
  const [focus, setFocus] = useState<SensorLayer | null>(null);

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
      r.mode = "tangential";
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

      let drag: { x: number; y: number; rx: number; ry: number } | null = null;
      const down = (e: PointerEvent) => {
        drag = { x: e.clientX, y: e.clientY, rx: r.rotation.x, ry: r.rotation.y };
        canvas.setPointerCapture(e.pointerId);
        canvas.dataset.dragging = "true";
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        r.rotation.y = drag.ry + (e.clientX - drag.x) * 0.008;
        r.rotation.x = Math.max(0.1, Math.min(1.35, drag.rx + (e.clientY - drag.y) * 0.006));
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
      cleanups.forEach((fn) => fn());
      rig?.dispose();
      rigRef.current = null;
    };
  }, []);

  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    rig.mode = mode;
    rig.exploded = exploded;
    rig.focus = focus;
  }, [mode, exploded, focus]);

  return (
    <div className="grid overflow-hidden rounded-2xl border border-line lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="relative aspect-square bg-paper-2 sm:aspect-[4/3] lg:aspect-auto lg:min-h-[560px]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={labels.canvasLabel}
          className="absolute inset-0 block size-full cursor-grab touch-pan-y data-[dragging=true]:cursor-grabbing"
        />
        <p className="eyebrow pointer-events-none absolute bottom-4 left-5">{labels.hint}</p>
      </div>

      <div className="flex flex-col gap-8 border-t border-line p-6 lg:border-l lg:border-t-0 lg:p-8">
        <div>
          <p className="eyebrow">{labels.modeLabel}</p>
          <Segmented
            className="mt-3"
            value={mode}
            onChange={setMode}
            options={[
              { value: "normal", label: labels.modes.normal.label },
              { value: "tangential", label: labels.modes.tangential.label },
            ]}
          />
          <p aria-live="polite" className="mt-4 text-[17px] leading-7 text-ink">
            {labels.modes[mode].caption}
          </p>
        </div>

        <div>
          <p className="eyebrow">{labels.stackLabel}</p>
          <Segmented
            className="mt-3"
            value={exploded ? "exploded" : "assembled"}
            onChange={(v) => setExploded(v === "exploded")}
            options={[
              { value: "exploded", label: labels.exploded },
              { value: "assembled", label: labels.assembled },
            ]}
          />
          <ul className="mt-4 border-t border-line" onPointerLeave={() => setFocus(null)}>
            {LAYERS.map((layer) => (
              <li key={layer.id}>
                <button
                  type="button"
                  onPointerEnter={() => setFocus(layer.id)}
                  onFocus={() => setFocus(layer.id)}
                  onBlur={() => setFocus(null)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-line py-3 text-left text-[15px] leading-5 transition-colors",
                    focus === null || focus === layer.id ? "text-ink" : "text-ink-3",
                  )}
                >
                  <span aria-hidden className={cn("size-2.5 shrink-0 rounded-[3px]", layer.swatch)} />
                  {labels.layers[layer.id]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-auto font-mono text-[12px] leading-5 text-ink-3">{labels.note}</p>
      </div>
    </div>
  );
}
