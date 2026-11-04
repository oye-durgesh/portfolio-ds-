/**
 * City changes. Train/plane legs play over a paper map of India (the book
 * shrinks away while the vehicle travels the route); the metro leg is drawn
 * on the book's own pages. Both read progress from CSS variables the
 * stepper writes (--map, --route, --move, --vx/--vy/--va, --metro).
 */
import type { CSSProperties } from "react";
import { bookPrint, travels, type Travel } from "@/content/journey";
import { CITY_COORDS, INDIA_PATH, MAP_H, MAP_W, toMap } from "./cssGeo";
import { P } from "./props";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Control point for the curved route between two cities (map units). */
export function routeCurve(leg: Travel) {
  const a = toMap(CITY_COORDS[leg.from] ?? [78, 22]);
  const b = toMap(CITY_COORDS[leg.to] ?? [78, 22]);
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const c: [number, number] = [mx - dy * 0.22, my + dx * 0.22];
  return { a, b, c };
}

/** Point and heading (degrees) along the route at t ∈ [0, 1]. */
export function routePoint(leg: Travel, t: number) {
  const { a, b, c } = routeCurve(leg);
  const u = 1 - t;
  const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0];
  const y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
  const tx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
  const ty = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
  return { x, y, angle: (Math.atan2(ty, tx) * 180) / Math.PI };
}

function Vehicle({ mode }: { mode: Travel["mode"] }) {
  if (mode === "plane")
    return (
      <path
        d="M22 0 L-16 -13 L-7 0 L-16 13 Z"
        fill={P.terracotta}
        stroke={P.ivory}
        strokeWidth="2"
      />
    );
  return (
    <g stroke={P.ivory} strokeWidth="1.6">
      <rect x="-30" y="-9" width="18" height="16" rx="3" fill={P.dusty} />
      <rect x="-10" y="-9" width="18" height="16" rx="3" fill={P.dusty} />
      <rect x="10" y="-11" width="22" height="18" rx="5" fill={P.terracotta} />
    </g>
  );
}

export function IndiaMapLayer({ leg }: { leg: number }) {
  const t = leg >= 0 ? travels[leg] : undefined;
  const curve = t && t.mode !== "metro" ? routeCurve(t) : undefined;
  return (
    <div
      className="bk-map pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <svg
        viewBox={`-40 -40 ${MAP_W + 80} ${MAP_H + 80}`}
        className="h-[78vh] max-h-[92vw] w-auto max-w-[92vw]"
        style={{ filter: "drop-shadow(0 18px 30px oklch(0.1 0.02 40 / 0.6))" }}
      >
        <path
          d={INDIA_PATH}
          fill={P.paper}
          stroke="#c9a24a"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d={INDIA_PATH}
          fill="none"
          stroke={P.wood}
          strokeWidth="1"
          strokeDasharray="2 6"
          opacity="0.4"
          transform="translate(4 6)"
        />
        {Object.entries(CITY_COORDS)
          .filter(([name]) => name !== "Noida")
          .map(([name, ll]) => {
            const [x, y] = toMap(ll);
            const on = t && (t.from === name || t.to === name);
            return (
              <g key={name} opacity={on ? 1 : 0.5}>
                <circle
                  cx={x}
                  cy={y}
                  r={on ? 7 : 5}
                  fill={on ? P.terracotta : P.wood}
                  stroke={P.ivory}
                  strokeWidth="2"
                />
                <text x={x + 12} y={y + 5} className="bk-map-city">
                  {name}
                </text>
              </g>
            );
          })}
        {curve && t && (
          <>
            <path
              d={`M${curve.a[0]} ${curve.a[1]} Q${curve.c[0]} ${curve.c[1]} ${curve.b[0]} ${curve.b[1]}`}
              fill="none"
              stroke={P.terracotta}
              strokeWidth="4"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              style={{ strokeDashoffset: "calc(1 - var(--route))" }}
            />
            <g
              style={{
                transform:
                  "translate(calc(var(--vx) * 1px), calc(var(--vy) * 1px)) rotate(calc(var(--va) * 1deg))",
              }}
            >
              <Vehicle mode={t.mode} />
            </g>
          </>
        )}
      </svg>
    </div>
  );
}

/** The daily metro ride, drawn across the open spread like a hand-drawn route map. */
export function MetroLayer() {
  const leg = travels.find((t) => t.mode === "metro");
  const stations = leg?.stations ?? [];
  const x0 = 120;
  const x1 = 880;
  const y = 270;
  const n = Math.max(1, stations.length - 1);
  return (
    <div className="bk-metro" aria-hidden>
      <svg viewBox="0 0 1000 580" className="h-full w-full">
        <text x="70" y="96" className="bk-metro-title">
          {bookPrint.metroTitle}
        </text>
        <line
          x1={x0}
          y1={y}
          x2={x1}
          y2={y}
          stroke={P.teal}
          strokeWidth="12"
          strokeLinecap="round"
        />
        {stations.map((name, i) => {
          const x = x0 + ((x1 - x0) * i) / n;
          const end = i === 0 || i === stations.length - 1;
          return (
            <g key={name}>
              <circle cx={x} cy={y} r="17" fill={P.ivory} stroke={P.teal} strokeWidth="6" />
              <circle
                cx={x}
                cy={y}
                r="9"
                fill={i === stations.length - 1 ? "#c9a24a" : P.teal}
                style={
                  { opacity: `clamp(0, calc((var(--move) - ${i / n} + 0.04) * 14), 1)` } as Vars
                }
              />
              <text
                x={x}
                y={i % 2 ? y + 66 : y - 42}
                textAnchor="middle"
                className={end ? "bk-metro-end" : "bk-metro-stop"}
              >
                {end ? name.toUpperCase() : name}
              </text>
            </g>
          );
        })}
        <g
          style={{
            transform: `translate(calc(${x0}px + var(--move) * ${x1 - x0}px), ${y - 30}px)`,
          }}
        >
          <rect
            x="-70"
            y="-14"
            width="140"
            height="40"
            rx="12"
            fill={P.teal}
            stroke={P.ivory}
            strokeWidth="3"
          />
          {[-48, -20, 8, 36].map((x) => (
            <rect key={x} x={x} y="-6" width="18" height="14" rx="3" fill={P.sky} />
          ))}
          <circle cx="-25" cy="1" r="5" fill="#8d6e63" />
          <rect x="-70" y="16" width="140" height="5" fill="#c0c0c0" />
        </g>
      </svg>
    </div>
  );
}
