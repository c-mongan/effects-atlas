import { useId, useState, type CSSProperties, type PointerEvent } from "react";
import type { EffectId } from "../catalog";
import { StaticPreview } from "./StaticPreview";
function FoilCard() {
  const [point, setPoint] = useState({ x: 50, y: 50 });
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setPoint({
      x: Math.max(
        0,
        Math.min(100, ((event.clientX - box.left) / box.width) * 100),
      ),
      y: Math.max(
        0,
        Math.min(100, ((event.clientY - box.top) / box.height) * 100),
      ),
    });
  };
  return (
    <button
      type="button"
      className="ea-foil-card"
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={() => setPoint({ x: 50, y: 50 })}
      onClick={() =>
        setPoint((point) => ({ x: 100 - point.x + 1, y: 100 - point.y }))
      }
      onKeyDown={(event) => {
        const directions: Record<string, [number, number]> = {
          ArrowLeft: [-10, 0],
          ArrowRight: [10, 0],
          ArrowUp: [0, -10],
          ArrowDown: [0, 10],
        };
        const delta = directions[event.key];
        if (delta) {
          event.preventDefault();
          setPoint((point) => ({
            x: Math.max(0, Math.min(100, point.x + delta[0])),
            y: Math.max(0, Math.min(100, point.y + delta[1])),
          }));
        }
      }}
      style={
        {
          "--foil-x": `${point.x}%`,
          "--foil-y": `${point.y}%`,
          transform: `perspective(1000px) rotateX(${(point.y - 50) * -0.16}deg) rotateY(${(point.x - 50) * 0.16}deg)`,
        } as CSSProperties
      }
    >
      <span className="ea-card-kicker">MATERIAL / 001</span>
      <strong>
        Chromatic
        <br />
        surface.
      </strong>
      <span>Drag · tap · arrow keys</span>
    </button>
  );
}
export function DomEffect({ id }: { id: EffectId }) {
  const key = useId().replace(/:/g, "");
  if (id === "holographic-foil")
    return (
      <div className="ea-center">
        <FoilCard />
      </div>
    );
  if (id === "neon-glow")
    return (
      <div className="ea-center ea-neon">
        <div>
          AFTER
          <br />
          HOURS<small>NEON / LIGHT STUDY</small>
        </div>
      </div>
    );
  if (id === "kinetic-typography")
    return (
      <div className="ea-center ea-kinetic" role="img" aria-label="Motion">
        {"MOTION".split("").map((letter, index) => (
          <span
            aria-hidden="true"
            key={index}
            style={{ animationDelay: `${index * -0.17}s` }}
          >
            {letter}
          </span>
        ))}
      </div>
    );
  if (id === "glitch-effect")
    return (
      <div className="ea-center">
        <span className="ea-glitch" data-text="SIGNAL">
          SIGNAL
        </span>
      </div>
    );
  if (id === "ascii-art")
    return (
      <div className="ea-center">
        <pre className="ea-ascii" role="img" aria-label="Animated ASCII sphere">
          {Array.from({ length: 18 }, (_, row) => (
            <span key={row} style={{ animationDelay: `${row * -0.12}s` }}>
              {Array.from({ length: 38 }, (_, col) => {
                const r = Math.hypot((col - 18.5) / 1.8, row - 8.5);
                return r > 8
                  ? " "
                  : ".:+*#%@"[Math.min(6, Math.floor((8 - r) * 0.85))];
              }).join("")}
              {"\n"}
            </span>
          ))}
        </pre>
      </div>
    );
  if (id === "bauhaus-shapes")
    return (
      <div className="ea-bauhaus">
        <div>
          <StaticPreview id={id} />
        </div>
      </div>
    );
  if (id === "glassmorphism")
    return (
      <div className="ea-glass-scene">
        <i />
        <i />
        <div className="ea-glass-panel">
          <span>TRANSLUCENCY / 01</span>
          <strong>
            Soft focus.
            <br />
            Clear hierarchy.
          </strong>
          <p>Backdrop blur, a subtle border, and readable content.</p>
        </div>
      </div>
    );
  if (id === "vaporwave-grid")
    return (
      <div className="ea-retro">
        <div className="ea-retro-plane">
          <div />
        </div>
        <div className="ea-sun" />
        <span>MIDNIGHT / 1988</span>
      </div>
    );
  if (id === "paper-cutout")
    return (
      <svg className="ea-paper" viewBox="0 0 1000 600" aria-hidden="true">
        <defs>
          <filter id={key}>
            <feDropShadow dx="0" dy="12" stdDeviation="7" floodOpacity=".25" />
          </filter>
        </defs>
        <rect width="1000" height="600" fill="#d3dfd2" />
        <circle
          className="ea-paper-sun"
          cx="710"
          cy="160"
          r="82"
          fill="#efb276"
        />
        <g filter={`url(#${key})`}>
          <path
            d="M0 400L180 180 370 340 580 150 790 370 1000 190V600H0Z"
            fill="#86aaa1"
          />
          <path
            className="ea-paper-layer"
            d="M0 450L270 300 460 440 760 260 1000 430V600H0Z"
            fill="#527f7f"
          />
          <path d="M0 520Q170 340 410 500T1000 440V600H0Z" fill="#315c62" />
          <path d="M0 560Q340 450 600 540T1000 500V600H0Z" fill="#1c4249" />
        </g>
      </svg>
    );
  return null;
}
