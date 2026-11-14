"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GloveCanvas } from "@/components/three/GloveCanvas";
import type { GloveRig, GloveState } from "@/components/three/glove";
import { Segmented } from "@/components/ui/Segmented";

type View = "palm" | "back" | "side";
type Pose = "relaxed" | "flat" | "grip";

const VIEWS: Record<View, { rotX: number; rotY: number }> = {
  palm: { rotX: 0, rotY: 0.2 },
  back: { rotX: 0.05, rotY: Math.PI - 0.35 },
  side: { rotX: 0.05, rotY: -1.25 },
};

const POSES: Record<Pose, Pick<GloveState, "curl" | "sweep" | "grip">> = {
  relaxed: { curl: 0.2, sweep: 0.6, grip: 0 },
  flat: { curl: 0.0, sweep: 1, grip: 0 },
  grip: { curl: 0.62, sweep: 0, grip: 1 },
};

/** Exploded: a flat hand seen three-quarters from the side, so the layers read apart. */
const EXPLODED: Partial<GloveState> = { rotX: 0.12, rotY: -0.95, curl: 0, sweep: 0.8, grip: 0, explode: 1, scale: 1.12 };

const BASE: Partial<GloveState> = {
  x: 0, y: -0.07, ox: 0, oy: 0, rotZ: 0, scale: 1.28, point: 0, explode: 0,
  ...VIEWS.palm,
  ...POSES.relaxed,
};

const LAYERS = [
  { id: "pads", swatch: "bg-velox-orange" },
  { id: "shell", swatch: "bg-[#15161a]" },
  { id: "inner", swatch: "bg-[#c9953c]" },
  { id: "hub", swatch: "bg-[#2b2d33]" },
] as const;

interface GloveLabProps {
  labels: {
    viewLabel: string;
    poseLabel: string;
    stackLabel: string;
    assembled: string;
    exploded: string;
    layers: Record<(typeof LAYERS)[number]["id"], string>;
    views: Record<View, string>;
    poses: Record<Pose, string>;
    hint: string;
    note: string;
    canvasLabel: string;
  };
}

/** The whole-hand concept model as something to turn over, press and take apart. */
export function GloveLab({ labels }: GloveLabProps) {
  const rigRef = useRef<GloveRig | null>(null);
  const [view, setView] = useState<View>("palm");
  const [pose, setPose] = useState<Pose>("relaxed");
  const [exploded, setExploded] = useState(false);

  const onReady = useCallback((rig: GloveRig) => {
    rigRef.current = rig;
  }, []);

  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    if (exploded) Object.assign(rig.target, EXPLODED);
    else Object.assign(rig.target, { explode: 0, scale: 1.28 }, VIEWS[view], POSES[pose]);
  }, [view, pose, exploded]);

  const resetDrag = () => {
    const rig = rigRef.current;
    if (!rig) return;
    rig.nudge.x = 0;
    rig.nudge.y = 0;
  };

  return (
    <div className="grid overflow-hidden rounded-2xl border border-line lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative bg-paper-2">
        <div className="h-[480px] sm:h-[600px] lg:h-[700px]">
          <GloveCanvas onReady={onReady} initial={BASE} interaction="drag" label={labels.canvasLabel} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <p className="eyebrow">{labels.hint}</p>
          <p className="font-mono text-[12px] leading-4 text-ink-3">{labels.note}</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 border-t border-line p-6 lg:border-l lg:border-t-0 lg:p-8">
        <div>
          <p className="eyebrow">{labels.stackLabel}</p>
          <Segmented
            className="mt-3"
            value={exploded ? "exploded" : "assembled"}
            onChange={(v) => {
              resetDrag();
              setExploded(v === "exploded");
            }}
            options={[
              { value: "assembled", label: labels.assembled },
              { value: "exploded", label: labels.exploded },
            ]}
          />
          <ul className="mt-4 border-t border-line">
            {LAYERS.map((layer) => (
              <li key={layer.id} className="flex items-center gap-3 border-b border-line py-3 text-[15px] leading-5 text-ink">
                <span aria-hidden className={`size-2.5 shrink-0 rounded-[3px] ${layer.swatch}`} />
                {labels.layers[layer.id]}
              </li>
            ))}
          </ul>
        </div>

        <div className={exploded ? "opacity-40" : undefined}>
          <p className="eyebrow">{labels.viewLabel}</p>
          <Segmented
            className="mt-3"
            value={view}
            onChange={(v) => {
              resetDrag();
              setExploded(false);
              setView(v);
            }}
            options={(Object.keys(VIEWS) as View[]).map((v) => ({ value: v, label: labels.views[v] }))}
          />
          <p className="eyebrow mt-6">{labels.poseLabel}</p>
          <Segmented
            className="mt-3"
            value={pose}
            onChange={(v) => {
              setExploded(false);
              setPose(v);
            }}
            options={(Object.keys(POSES) as Pose[]).map((p) => ({ value: p, label: labels.poses[p] }))}
          />
        </div>
      </div>
    </div>
  );
}
