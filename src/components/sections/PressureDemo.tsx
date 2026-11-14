"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The "Contact localization" and "Glove pressure" panels of Prototype 1
 * Collector, as a small interactive demo: five pressure channels, thumb to
 * pinky, in raw mV. The values are simulated here (a slow pinch pattern), and
 * a visitor can press a fingertip to drive its channel.
 */

const FINGERS = ["Thumb", "Index", "Middle", "Ring", "Pinky"] as const;
const COLORS = ["#5B37ED", "#00BDDE", "#F55A00", "#E846CD", "#429E00"];
const MAX = 3100;
const N = 150;
const MUTED = "rgba(55,56,60,0.61)";
const MONO = "var(--font-mono)";

type Frame = { mv: number[]; pts: string[] };

const idle: Frame = { mv: [0, 0, 0, 0, 0], pts: ["", "", "", "", ""] };

function glow(i: number, k: number) {
  return `radial-gradient(circle at 50% ${i === 0 ? 40 : 34}%, #FFD600 0%, #3BD1A0 ${Math.round(10 + 22 * k)}%, rgba(0,189,222,0.55) ${Math.round(28 + 30 * k)}%, rgba(0,189,222,0) ${Math.round(45 + 35 * k)}%)`;
}

export function PressureDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const held = useRef([false, false, false, false, false]);
  const [frame, setFrame] = useState<Frame>(idle);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hist = Array.from({ length: 5 }, () => new Float32Array(N));
    const value = [0, 0, 0, 0, 0];
    let head = 0;
    let visible = false;
    let timer = 0;
    let t = 0;

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
    });
    io.observe(root);

    const step = () => {
      if (!visible) return;
      t += 0.05;
      for (let i = 0; i < 5; i++) {
        // A pinch every few seconds: thumb and index together, a touch of middle.
        const phase = (t % 6.5) / 6.5;
        const pinch = phase > 0.18 && phase < 0.62 ? Math.sin(((phase - 0.18) / 0.44) * Math.PI) : 0;
        const share = [0.78, 0.66, 0.16, 0, 0][i]!;
        let target = still ? 0 : pinch * share * 2500;
        if (held.current[i]) target = 2550;
        value[i]! += (target - value[i]!) * 0.22;
        const noise = value[i]! > 40 ? (Math.random() - 0.5) * 60 : 0;
        hist[i]![head] = Math.max(0, value[i]! + noise);
      }
      head = (head + 1) % N;
      setFrame({
        mv: value.map((v) => Math.max(0, Math.round(v))),
        pts: hist.map((h) => {
          let s = "";
          for (let n = 0; n < N; n++) {
            const v = h[(head + n) % N]!;
            s += `${((n / (N - 1)) * 600).toFixed(1)},${(139 - (v / MAX) * 132).toFixed(1)} `;
          }
          return s;
        }),
      });
    };
    timer = window.setInterval(step, 50);
    return () => {
      window.clearInterval(timer);
      io.disconnect();
    };
  }, []);

  const press = (i: number, on: boolean) => {
    held.current[i] = on;
  };

  const card = "min-w-0 rounded-xl border border-[rgba(112,115,124,0.16)] bg-white p-3 lg:p-4";

  return (
    <div
      ref={rootRef}
      className="grid gap-2 px-[1.4%] pb-[1.4%] pt-0 text-[#171719] sm:grid-cols-2"
    >
        {/* Contact localization */}
        <div className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="whitespace-nowrap text-[13px] font-semibold">Contact localization</span>
              <span className="hidden whitespace-nowrap rounded-[5px] bg-[rgba(112,115,124,0.08)] px-[6px] py-[2px] text-[10px] font-bold tracking-[0.04em] xl:inline">
                R · RIGHT HAND
              </span>
            </div>
            <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px]" style={{ color: MUTED, fontFamily: MONO }}>
              0
              <span
                aria-hidden
                className="h-1 w-10 rounded-full lg:w-16"
                style={{ background: "linear-gradient(90deg,#DCDDE0,#00BDDE,#3BD1A0,#FFD600)" }}
              />
              3100 mV
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-5 gap-1 lg:gap-1.5">
            {FINGERS.map((finger, i) => {
              const mv = frame.mv[i]!;
              const k = Math.min(1, mv / 2600);
              return (
                <button
                  key={finger}
                  type="button"
                  aria-label={`${finger}: ${mv} mV`}
                  onPointerDown={() => press(i, true)}
                  onPointerUp={() => press(i, false)}
                  onPointerLeave={() => press(i, false)}
                  onPointerCancel={() => press(i, false)}
                  onKeyDown={(e) => (e.key === " " || e.key === "Enter") && press(i, true)}
                  onKeyUp={() => press(i, false)}
                  onBlur={() => press(i, false)}
                  className="flex cursor-pointer touch-none select-none flex-col items-center gap-1.5 rounded-lg border border-[rgba(112,115,124,0.08)] bg-[#F7F7F8] px-1 pb-2 pt-1.5 transition-colors hover:border-[rgba(112,115,124,0.3)] lg:px-2"
                >
                  <span className="flex w-full items-center justify-between gap-1 text-[9px] font-semibold tracking-[0.04em] lg:text-[10px]">
                    <span className="hidden whitespace-nowrap xl:inline" style={{ color: MUTED }}>
                      {finger.toUpperCase()}
                    </span>
                    <span className="xl:hidden" style={{ color: MUTED }}>
                      {finger.slice(0, 1)}
                    </span>
                    <span className="tabular-nums" style={{ fontFamily: MONO, color: mv < 60 ? MUTED : "#171719" }}>
                      {mv}
                    </span>
                  </span>
                  <span
                    className="relative block h-[58px] w-[30px] overflow-hidden lg:h-[76px] lg:w-10"
                    style={{
                      borderRadius: "20px 20px 8px 8px",
                      background: "linear-gradient(180deg,#F2F2F4,#DADBDF)",
                      boxShadow:
                        "inset -4px -3px 7px rgba(112,115,124,0.18), inset 3px 3px 6px rgba(255,255,255,0.9)",
                    }}
                  >
                    <span
                      className="absolute inset-0"
                      style={{
                        background: glow(i, k),
                        opacity: mv < 60 ? 0 : 0.35 + 0.65 * Math.sqrt(k),
                      }}
                    />
                  </span>
                  <span className="block h-1 w-full overflow-hidden rounded-full bg-[rgba(112,115,124,0.08)]">
                    <span
                      className="block h-full"
                      style={{ width: `${(mv / MAX) * 100}%`, background: COLORS[i] }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Glove pressure */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <span className="whitespace-nowrap text-[13px] font-semibold">Glove pressure</span>
            <span className="whitespace-nowrap text-[10px]" style={{ color: MUTED, fontFamily: MONO }}>
              simulated · raw mV
            </span>
          </div>
          <svg viewBox="0 0 600 140" preserveAspectRatio="none" aria-hidden className="mt-2.5 block h-[62px] w-full lg:h-[82px]">
            <line x1="0" y1="139" x2="600" y2="139" stroke="rgba(112,115,124,0.16)" />
            <line x1="0" y1="70" x2="600" y2="70" stroke="rgba(112,115,124,0.08)" />
            {COLORS.map((color, i) => (
              <polyline
                key={color}
                fill="none"
                stroke={color}
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
                points={frame.pts[i]}
              />
            ))}
          </svg>
          <div className="mt-2 grid grid-cols-5 gap-1">
            {FINGERS.map((finger, i) => (
              <div key={finger} className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 text-[10px]">
                  <span aria-hidden className="size-1.5 rounded-[2px]" style={{ background: COLORS[i] }} />
                  <span className="font-semibold">S{i + 1}</span>
                  <span className="hidden 2xl:inline" style={{ color: MUTED }}>
                    {finger}
                  </span>
                </span>
                <span className="text-[12px] font-semibold tabular-nums lg:text-[14px]" style={{ fontFamily: MONO }}>
                  {frame.mv[i]}
                  <span className="ml-[2px] hidden text-[9px] font-normal lg:inline" style={{ color: MUTED }}>
                    mV
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
