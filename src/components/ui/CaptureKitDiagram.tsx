/**
 * Line drawing of the capture kit as worn: a head camera, a tactile glove on
 * each hand, a camera under each wrist and a microphone. Numbers match the
 * list next to the drawing. Schematic only: not to scale.
 */
export function CaptureKitDiagram({ label }: { label: string }) {
  const ink = "var(--color-ink)";
  const hand = (cx: number, flip: 1 | -1) => (
    <g transform={`translate(${cx} 0)`}>
      {/* wrist camera view */}
      <path d="M0 446 L-74 262 H74 Z" fill="#2d7d58" fillOpacity="0.1" stroke="#2d7d58" strokeOpacity="0.55" />
      {/* forearm */}
      <path d="M-26 520 V440 M26 520 V440" />
      {/* glove */}
      <rect x="-34" y="352" width="68" height="88" rx="18" fill="var(--color-paper)" />
      {[-25, -8, 9, 26].map((x, i) => (
        <rect key={x} x={x - 7} y={i === 0 || i === 3 ? 312 : 298} width="14" height="62" rx="7" fill="var(--color-paper)" />
      ))}
      <path d={`M${34 * flip} 392 q${22 * flip} -6 ${30 * flip} -34`} strokeWidth="14" strokeLinecap="round" stroke={ink} />
      <path d={`M${34 * flip} 392 q${22 * flip} -6 ${30 * flip} -34`} strokeWidth="11" strokeLinecap="round" stroke="var(--color-paper)" />
      {/* tactile pads */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}${c}`} x={-17 + c * 13} y={372 + r * 13} width="8" height="8" rx="1.5" fill="#ff9500" stroke="none" />
        )),
      )}
      {/* wrist camera */}
      <rect x="-18" y="448" width="36" height="20" rx="5" fill={ink} stroke="none" />
      <circle cx="0" cy="458" r="4.5" fill="var(--color-paper)" stroke="none" />
    </g>
  );
  const tag = (x: number, y: number, n: string) => (
    <g>
      <circle cx={x} cy={y} r="13" fill="var(--color-paper)" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={ink} stroke="none" fontFamily="var(--font-mono)">
        {n}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 800 520" role="img" aria-label={label} className="block h-auto w-full" fill="none" stroke={ink} strokeWidth="1.5">
      {/* head camera view */}
      <path d="M400 118 L120 470 H680 Z" fill="#3b6fd9" fillOpacity="0.07" stroke="#3b6fd9" strokeOpacity="0.5" />
      {/* torso */}
      <path d="M318 520 V250 q0 -44 44 -50 h76 q44 6 44 50 V520" fill="var(--color-paper)" fillOpacity="0.6" />
      {/* head */}
      <path d="M352 112 a48 52 0 0 1 96 0 v22 a48 46 0 0 1 -96 0 Z" fill="var(--color-paper)" />
      <path d="M384 178 v24 M416 178 v24" />
      {/* head camera */}
      <rect x="344" y="96" width="112" height="28" rx="8" fill={ink} stroke="none" />
      <circle cx="372" cy="110" r="6" fill="var(--color-paper)" stroke="none" />
      <circle cx="428" cy="110" r="6" fill="var(--color-paper)" stroke="none" />
      <rect x="392" y="105" width="16" height="10" rx="3" fill="var(--color-paper)" stroke="none" />
      {/* microphone */}
      <path d="M452 150 q22 6 30 26" />
      <rect x="476" y="172" width="12" height="20" rx="6" fill={ink} stroke="none" />
      <path d="M500 170 q10 12 0 24 M510 162 q18 20 0 40" strokeOpacity="0.55" />

      {hand(250, -1)}
      {hand(550, 1)}

      {tag(210, 330, "01")}
      {tag(590, 330, "01")}
      {tag(196, 458, "02")}
      {tag(604, 458, "02")}
      {tag(486, 96, "03")}
      {tag(540, 182, "04")}
    </svg>
  );
}
