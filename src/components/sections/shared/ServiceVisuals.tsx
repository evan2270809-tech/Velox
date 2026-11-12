"use client";

/* ─── Three abstract visuals for the Services section, dark theme ───
 * AutomationFlow  — pipeline of nodes
 * CostReduction   — declining cost bars
 * AXRoadmap       — 4-week stage timeline
 */

const ACCENT = "#f2a03a";
const INK_TEXT = "rgba(255,255,255,0.78)";
const INK_DIM = "rgba(255,255,255,0.45)";

export function AutomationFlow() {
  return (
    <svg
      viewBox="0 0 400 280"
      className="h-auto w-full max-w-[440px]"
      role="img"
      aria-label="Automation pipeline diagram"
    >
      {/* Background grid hint */}
      <defs>
        <pattern
          id="grid-auto"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        </pattern>
        <marker
          id="arrow-auto"
          markerWidth="10"
          markerHeight="10"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 z" fill={ACCENT} />
        </marker>
      </defs>
      <rect width="400" height="280" fill="url(#grid-auto)" />

      {/* Three nodes */}
      {[
        { x: 30, y: 110, label: "Source" },
        { x: 165, y: 110, label: "Process" },
        { x: 300, y: 110, label: "Action" },
      ].map((n) => (
        <g key={n.label}>
          <rect
            x={n.x}
            y={n.y}
            width={70}
            height={60}
            rx={8}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.12)"
          />
          <circle cx={n.x + 16} cy={n.y + 16} r={4} fill={ACCENT} />
          <text
            x={n.x + 35}
            y={n.y + 38}
            textAnchor="middle"
            fontSize="11"
            fontFamily="system-ui, sans-serif"
            fill={INK_TEXT}
            letterSpacing="0.04em"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Connecting flowing lines */}
      <path
        d="M 100 140 L 165 140"
        stroke={ACCENT}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 4"
        markerEnd="url(#arrow-auto)"
        className="fp-path"
      />
      <path
        d="M 235 140 L 300 140"
        stroke={ACCENT}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 4"
        markerEnd="url(#arrow-auto)"
        className="fp-path"
      />

      {/* Side branch */}
      <path
        d="M 200 170 Q 200 220 250 220 L 310 220"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="3 3"
      />
      <text
        x={250}
        y={245}
        fontSize="10"
        fill={INK_DIM}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.08em"
      >
        FALLBACK
      </text>

      {/* Top label */}
      <text
        x={30}
        y={60}
        fontSize="10"
        fill={INK_DIM}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.16em"
      >
        WORKFLOW · DAILY
      </text>
    </svg>
  );
}

export function CostReduction() {
  const months = [
    { m: "M1", h: 150, label: "$48k" },
    { m: "M2", h: 138, label: "" },
    { m: "M3", h: 112, label: "" },
    { m: "M4", h: 90, label: "" },
    { m: "M5", h: 72, label: "" },
    { m: "M6", h: 58, label: "$22k" },
  ];
  return (
    <svg
      viewBox="0 0 400 280"
      className="h-auto w-full max-w-[440px]"
      role="img"
      aria-label="LLM cost reduction chart"
    >
      {/* Y-axis hint */}
      <line
        x1="40"
        y1="50"
        x2="40"
        y2="220"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
      />
      <line
        x1="40"
        y1="220"
        x2="380"
        y2="220"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
      />

      {/* Bars */}
      {months.map((b, i) => {
        const x = 60 + i * 52;
        const y = 220 - b.h;
        const fillOpacity = 0.18 + (i / months.length) * 0.4;
        return (
          <g key={b.m}>
            <rect
              x={x}
              y={y}
              width={28}
              height={b.h}
              rx={3}
              fill={ACCENT}
              fillOpacity={i === months.length - 1 ? 1 : fillOpacity}
            />
            <text
              x={x + 14}
              y={235}
              fontSize="10"
              textAnchor="middle"
              fill={INK_DIM}
              fontFamily="system-ui, sans-serif"
            >
              {b.m}
            </text>
            {b.label && (
              <text
                x={x + 14}
                y={y - 8}
                fontSize="11"
                textAnchor="middle"
                fill={INK_TEXT}
                fontFamily="system-ui, sans-serif"
                fontWeight={600}
              >
                {b.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Trend line */}
      <path
        d="M 74 70 Q 165 90 240 130 T 374 162"
        stroke={ACCENT}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 3"
        opacity="0.6"
      />

      {/* Label */}
      <text
        x={40}
        y={40}
        fontSize="10"
        fill={INK_DIM}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.16em"
      >
        MONTHLY LLM SPEND
      </text>
      <text
        x={260}
        y={60}
        fontSize="11"
        fill={ACCENT}
        fontFamily="system-ui, sans-serif"
        fontWeight={600}
      >
        −54%
      </text>
    </svg>
  );
}

export function AXRoadmap() {
  const stages = [
    { label: "Audit", weeks: "W1–2", done: true },
    { label: "Blueprint", weeks: "W3–4", done: true },
    { label: "Build", weeks: "W5–8", done: false, active: true },
    { label: "Operate", weeks: "Ongoing", done: false },
  ];
  return (
    <svg
      viewBox="0 0 400 280"
      className="h-auto w-full max-w-[440px]"
      role="img"
      aria-label="AX adoption roadmap"
    >
      {/* Spine */}
      <line
        x1="40"
        y1="140"
        x2="360"
        y2="140"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />
      <line
        x1="40"
        y1="140"
        x2="200"
        y2="140"
        stroke={ACCENT}
        strokeWidth="2"
      />

      {stages.map((s, i) => {
        const x = 40 + i * (320 / 3);
        return (
          <g key={s.label}>
            <circle
              cx={x}
              cy={140}
              r={s.active ? 10 : 7}
              fill={s.done || s.active ? ACCENT : "rgba(255,255,255,0.08)"}
              stroke={s.active ? ACCENT : "rgba(255,255,255,0.20)"}
              strokeWidth={s.active ? 2 : 1}
            />
            {s.active && (
              <circle
                cx={x}
                cy={140}
                r={18}
                fill="none"
                stroke={ACCENT}
                strokeOpacity="0.3"
                strokeWidth="1"
                className="fp-pulse"
              />
            )}
            <text
              x={x}
              y={108}
              fontSize="13"
              textAnchor="middle"
              fill={s.active ? "#fff" : INK_TEXT}
              fontFamily="system-ui, sans-serif"
              fontWeight={s.active ? 600 : 500}
            >
              {s.label}
            </text>
            <text
              x={x}
              y={172}
              fontSize="10"
              textAnchor="middle"
              fill={INK_DIM}
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.08em"
            >
              {s.weeks}
            </text>
          </g>
        );
      })}

      <text
        x={40}
        y={60}
        fontSize="10"
        fill={INK_DIM}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.16em"
      >
        8-WEEK ADOPTION ROADMAP
      </text>
      <text
        x={40}
        y={230}
        fontSize="11"
        fill={INK_DIM}
        fontFamily="system-ui, sans-serif"
      >
        Week 5 · Build in progress
      </text>
    </svg>
  );
}
