import { useId } from "react";
import type { EffectId } from "../catalog";
/** Original, self-contained artwork: no network assets or live simulation. */
export function StaticPreview({ id }: { id: EffectId }) {
  const key = useId().replace(/:/g, "");
  const index = [...id].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const colors = ["#b6a6ef", "#f0a78c", "#88c6c4", "#e6c572"];
  const dark = id === "metaballs" ? "#e8deec" : "#141322";
  return (
    <svg
      className="ea-preview-art"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={key} x2="1" y2="1">
          <stop stopColor={colors[index % 4]} />
          <stop offset="1" stopColor={colors[(index + 1) % 4]} />
        </linearGradient>
      </defs>
      <rect width="1000" height="600" fill={dark} />
      {id === "paper-cutout" || id === "glassmorphism" ? (
        <>
          <circle cx="730" cy="160" r="82" fill="#efb276" />
          <path
            d="M0 420L210 160 470 400 720 220 1000 420V600H0Z"
            fill="#86aaa1"
          />
          <path
            d="M0 490L290 310 570 480 810 330 1000 450V600H0Z"
            fill="#527f7f"
          />
          <path d="M0 550Q250 400 500 540T1000 500V600H0Z" fill="#315c62" />
        </>
      ) : id === "vaporwave-grid" ? (
        <>
          <circle cx="500" cy="205" r="88" fill={`url(#${key})`} />
          {Array.from({ length: 15 }, (_, i) => (
            <path
              key={i}
              d={`M500 300L${(i - 7) * 180 + 500} 600 M0 ${300 + i * i * 1.5}H1000`}
              fill="none"
              stroke="#b777c2"
            />
          ))}
        </>
      ) : /typography|glitch|neon|ascii/.test(id) ? (
        <text
          x="500"
          y="325"
          textAnchor="middle"
          fill={`url(#${key})`}
          fontFamily="system-ui,sans-serif"
          fontSize="100"
          fontWeight="800"
        >
          {id === "ascii-art"
            ? "# FORM #"
            : id === "neon-glow"
              ? "AFTER HOURS"
              : "MOTION"}
        </text>
      ) : id === "bauhaus-shapes" ? (
        <>
          {Array.from({ length: 15 }, (_, i) => (
            <g
              key={i}
              transform={`translate(${200 + (i % 5) * 120} ${120 + Math.floor(i / 5) * 120})`}
            >
              <rect
                width="120"
                height="120"
                fill={i % 2 ? "#efeee3" : "#e7bc19"}
              />
              {i % 3 === 0 ? (
                <circle cx="60" cy="60" r="45" fill="#d64335" />
              ) : (
                <path d="M0 0A120 120 0 0 1 120 120H0Z" fill="#304a9b" />
              )}
            </g>
          ))}
        </>
      ) : id === "pixel-art" ? (
        <>
          {Array.from(
            { length: 64 },
            (_, i) =>
              (i % 9 < 4 || i % 7 === 0) && (
                <rect
                  key={i}
                  x={330 + (i % 8) * 44}
                  y={130 + Math.floor(i / 8) * 44}
                  width="35"
                  height="35"
                  fill={colors[index % 4]}
                />
              ),
          )}
        </>
      ) : (
        <>
          {Array.from({ length: id === "particle-swarm" ? 80 : 7 }, (_, i) => (
            <circle
              key={i}
              cx={180 + ((i * 137) % 650)}
              cy={160 + ((i * 73) % 300)}
              r={id === "particle-swarm" ? 3 : 30 + ((i * 13) % 70)}
              fill={`url(#${key})`}
              opacity={0.55 + (i % 3) * 0.15}
            />
          ))}
        </>
      )}
    </svg>
  );
}
