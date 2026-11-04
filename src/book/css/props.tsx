/**
 * Cut-paper props for the pop-up dioramas, drawn as small inline SVGs in the
 * book's palette. Each prop has a viewBox; the diorama sets its width and the
 * height follows the aspect ratio. Story words never appear inside a prop:
 * the gold annotation labels carry them.
 */
import type { ReactNode } from "react";

export const P = {
  ivory: "#f1e7d0",
  cream: "#e8d9b5",
  paper: "#efe4cb",
  forest: "#3d5a45",
  olive: "#8a9152",
  grass: "#9aa860",
  terracotta: "#c06a48",
  brick: "#a65a3e",
  mustard: "#d6a33c",
  lavender: "#a99bc4",
  dusty: "#6f8ba6",
  sky: "#9db7c9",
  wood: "#8a5a3a",
  woodDark: "#5e3d27",
  charcoal: "#3a332d",
  road: "#9a8f80",
  stone: "#c9bfae",
  white: "#f7f2e6",
  pink: "#d99a8f",
  glass: "#6d8a9c",
  teal: "#00b2a9",
  gold: "#c9a24a",
};

type Draw = (o: { v?: string | undefined; tone?: string | undefined }) => ReactNode;
interface PropDef {
  vb: [number, number];
  draw: Draw;
}

const windows = (
  x0: number,
  y0: number,
  cols: number,
  rows: number,
  dx: number,
  dy: number,
  w = 8,
  h = 9,
) => {
  const out: ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      out.push(
        <rect
          key={`${r}-${c}`}
          x={x0 + c * dx}
          y={y0 + r * dy}
          width={w}
          height={h}
          rx="1"
          fill={P.sky}
        />,
      );
  return out;
};

const bars = (vals: number[], x0: number, base: number, color: string) =>
  vals.map((v, i) => (
    <rect
      key={i}
      x={x0 + i * 14}
      y={base - v}
      width="10"
      height={v}
      rx="1.5"
      fill={i === vals.length - 1 ? P.terracotta : color}
    />
  ));

export const PROPS = {
  house: {
    vb: [100, 100],
    draw: ({ tone }) => (
      <>
        <rect x="14" y="44" width="72" height="54" fill={tone ?? P.cream} />
        <polygon points="6,48 50,10 94,48" fill={P.brick} />
        <rect x="42" y="66" width="18" height="32" rx="2" fill={P.woodDark} />
        <circle cx="56" cy="83" r="1.6" fill={P.mustard} />
        <rect x="20" y="56" width="16" height="14" fill={P.sky} />
        <rect x="66" y="56" width="16" height="14" fill={P.sky} />
      </>
    ),
  },
  school: {
    vb: [150, 100],
    draw: () => (
      <>
        <rect x="10" y="38" width="130" height="60" fill={P.cream} />
        <polygon points="40,38 75,14 110,38" fill={P.terracotta} />
        <rect x="74" y="0" width="2" height="16" fill={P.charcoal} />
        <polygon points="76,1 90,5 76,9" fill={P.mustard} />
        <rect x="10" y="38" width="130" height="6" fill={P.brick} />
        {windows(18, 52, 8, 2, 15.5, 20)}
        <rect x="66" y="70" width="18" height="28" fill={P.woodDark} />
      </>
    ),
  },
  campus: {
    vb: [170, 110],
    draw: () => (
      <>
        <rect x="8" y="46" width="154" height="62" fill={P.stone} />
        <ellipse cx="85" cy="40" rx="26" ry="20" fill={P.dusty} />
        <rect x="58" y="36" width="54" height="12" fill={P.stone} />
        <polygon points="50,48 85,26 120,48" fill={P.cream} />
        {[60, 72, 84, 96, 108].map((x) => (
          <rect key={x} x={x - 3} y="52" width="6" height="44" fill={P.ivory} />
        ))}
        {windows(14, 56, 3, 3, 12, 14)}
        {windows(124, 56, 3, 3, 12, 14)}
        <rect x="8" y="96" width="154" height="12" fill={P.cream} />
      </>
    ),
  },
  tree: {
    vb: [60, 100],
    draw: ({ tone }) => (
      <>
        <rect x="26" y="58" width="8" height="42" fill={P.wood} />
        <circle cx="30" cy="36" r="26" fill={tone ?? P.olive} />
        <circle cx="18" cy="48" r="14" fill={tone ?? P.olive} />
        <circle cx="43" cy="46" r="14" fill={tone ?? P.olive} />
      </>
    ),
  },
  pine: {
    vb: [50, 100],
    draw: () => (
      <>
        <rect x="22" y="80" width="6" height="20" fill={P.wood} />
        <polygon points="25,4 46,84 4,84" fill={P.forest} />
      </>
    ),
  },
  bush: {
    vb: [80, 40],
    draw: ({ tone }) => (
      <>
        <ellipse cx="22" cy="26" rx="20" ry="14" fill={tone ?? P.grass} />
        <ellipse cx="50" cy="22" rx="24" ry="18" fill={tone ?? P.grass} />
        <ellipse cx="66" cy="30" rx="14" ry="10" fill={tone ?? P.grass} />
      </>
    ),
  },
  flowers: {
    vb: [80, 40],
    draw: () => (
      <>
        {[8, 22, 36, 50, 64, 74].map((x, i) => (
          <g key={x}>
            <rect x={x - 1} y={18 + (i % 2) * 6} width="2" height="22" fill={P.olive} />
            <circle
              cx={x}
              cy={16 + (i % 2) * 6}
              r="5"
              fill={[P.terracotta, P.mustard, P.lavender, P.pink][i % 4]}
            />
          </g>
        ))}
      </>
    ),
  },
  hill: {
    vb: [200, 60],
    draw: ({ tone }) => <path d="M0 60 Q 50 0 100 30 T 200 22 L200 60 Z" fill={tone ?? P.grass} />,
  },
  cloud: {
    vb: [100, 46],
    draw: () => (
      <>
        <ellipse cx="34" cy="30" rx="26" ry="14" fill={P.white} />
        <ellipse cx="58" cy="22" rx="24" ry="18" fill={P.white} />
        <ellipse cx="76" cy="32" rx="18" ry="12" fill={P.white} />
      </>
    ),
  },
  sun: {
    vb: [60, 60],
    draw: ({ v }) =>
      v === "moon" ? (
        <path d="M38 8 A24 24 0 1 0 52 44 A18 18 0 1 1 38 8 Z" fill={P.cream} />
      ) : (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={i}
              x="28"
              y="2"
              width="4"
              height="12"
              rx="2"
              fill={P.mustard}
              transform={`rotate(${i * 45} 30 30)`}
            />
          ))}
          <circle cx="30" cy="30" r="15" fill={P.mustard} />
        </>
      ),
  },
  skyline: {
    vb: [220, 120],
    draw: () => (
      <>
        {[
          [0, 50, 30, P.dusty],
          [28, 20, 34, P.glass],
          [60, 60, 26, P.stone],
          [84, 8, 30, P.dusty],
          [112, 40, 38, P.glass],
          [148, 26, 26, P.stone],
          [172, 54, 46, P.dusty],
        ].map(([x, y, w, c]) => (
          <g key={x as number}>
            <rect
              x={x as number}
              y={y as number}
              width={w as number}
              height={120 - (y as number)}
              fill={c as string}
            />
            {windows(
              (x as number) + 5,
              (y as number) + 8,
              2,
              Math.floor((112 - (y as number)) / 14),
              ((w as number) - 14) / 1,
              14,
              5,
              6,
            )}
          </g>
        ))}
      </>
    ),
  },
  tower: {
    vb: [70, 140],
    draw: ({ v }) => (
      <>
        <rect x="6" y="24" width="58" height="116" fill={P.stone} />
        <rect x="6" y="24" width="58" height="8" fill={P.forest} />
        {windows(13, 40, 3, 6, 16, 15)}
        <rect x="26" y="116" width="18" height="24" fill={P.glass} />
        {v === "flower" && (
          <g transform="translate(35 12)">
            {Array.from({ length: 6 }, (_, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-7"
                rx="4"
                ry="7"
                fill={P.lavender}
                transform={`rotate(${i * 60})`}
              />
            ))}
            <circle r="4" fill={P.mustard} />
          </g>
        )}
      </>
    ),
  },
  gate: {
    vb: [120, 100],
    draw: () => (
      <>
        <rect x="6" y="20" width="16" height="80" fill={P.stone} />
        <rect x="98" y="20" width="16" height="80" fill={P.stone} />
        <path d="M14 22 Q60 -6 106 22 L106 32 Q60 6 14 32 Z" fill={P.brick} />
        {[30, 42, 54, 66, 78, 90].map((x) => (
          <rect key={x} x={x - 1.5} y="34" width="3" height="66" fill={P.charcoal} />
        ))}
        <rect x="22" y="58" width="76" height="4" fill={P.charcoal} />
        <circle cx="60" cy="60" r="6" fill={P.mustard} />
      </>
    ),
  },
  signpost: {
    vb: [90, 110],
    draw: () => (
      <>
        <rect x="42" y="10" width="6" height="100" fill={P.wood} />
        <polygon points="10,18 70,18 84,28 70,38 10,38" fill={P.terracotta} />
        <polygon points="80,46 20,46 6,56 20,66 80,66" fill={P.forest} />
      </>
    ),
  },
  road: {
    vb: [220, 24],
    draw: () => (
      <>
        <rect x="0" y="2" width="220" height="20" rx="4" fill={P.road} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={8 + i * 24} y="11" width="12" height="2.5" fill={P.white} />
        ))}
      </>
    ),
  },
  path: {
    vb: [200, 40],
    draw: () => (
      <path
        d="M4 36 C 60 36 80 6 196 8"
        fill="none"
        stroke={P.mustard}
        strokeWidth="5"
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
    ),
  },
  train: {
    vb: [180, 60],
    draw: () => (
      <>
        {[0, 58].map((x) => (
          <g key={x}>
            <rect x={x + 4} y="12" width="52" height="34" rx="5" fill={P.dusty} />
            {windows(x + 10, 18, 3, 1, 15, 0, 10, 10)}
          </g>
        ))}
        <rect x="120" y="8" width="56" height="38" rx="8" fill={P.terracotta} />
        <rect x="150" y="14" width="18" height="14" rx="2" fill={P.sky} />
        {[14, 46, 72, 104, 132, 164].map((x) => (
          <circle key={x} cx={x} cy="50" r="6" fill={P.charcoal} />
        ))}
      </>
    ),
  },
  bus: {
    vb: [140, 80],
    draw: () => (
      <>
        <rect x="4" y="10" width="132" height="56" rx="10" fill={P.mustard} />
        {windows(14, 20, 5, 1, 22, 0, 16, 18)}
        <rect x="118" y="20" width="12" height="40" rx="2" fill={P.glass} />
        <rect x="4" y="48" width="132" height="5" fill={P.brick} />
        <circle cx="32" cy="68" r="10" fill={P.charcoal} />
        <circle cx="106" cy="68" r="10" fill={P.charcoal} />
      </>
    ),
  },
  desk: {
    vb: [120, 90],
    draw: ({ v }) => (
      <>
        <rect x="4" y="50" width="112" height="8" rx="2" fill={P.wood} />
        <rect x="12" y="58" width="6" height="32" fill={P.woodDark} />
        <rect x="102" y="58" width="6" height="32" fill={P.woodDark} />
        <rect x="34" y="14" width="54" height="34" rx="3" fill={P.charcoal} />
        <rect x="38" y="18" width="46" height="26" rx="1" fill={v === "cart" ? P.ivory : P.glass} />
        <rect x="26" y="46" width="70" height="5" rx="2" fill={P.stone} />
        {v === "code" && (
          <>
            <rect x="42" y="22" width="20" height="3" fill={P.mustard} />
            <rect x="46" y="28" width="26" height="3" fill={P.ivory} />
            <rect x="46" y="34" width="16" height="3" fill={P.terracotta} />
          </>
        )}
        {v === "cart" && (
          <g transform="translate(48 22)" fill="none" stroke={P.terracotta} strokeWidth="2.4">
            <path d="M0 2 h5 l4 12 h14 l3 -9 h-19" />
            <circle cx="11" cy="18" r="1.8" fill={P.terracotta} />
            <circle cx="21" cy="18" r="1.8" fill={P.terracotta} />
          </g>
        )}
        <rect x="96" y="38" width="10" height="12" rx="2" fill={P.terracotta} />
      </>
    ),
  },
  board: {
    vb: [100, 110],
    draw: ({ v }) => (
      <>
        <rect x="18" y="70" width="5" height="40" fill={P.woodDark} transform="rotate(8 20 70)" />
        <rect x="77" y="70" width="5" height="40" fill={P.woodDark} transform="rotate(-8 80 70)" />
        <rect x="4" y="4" width="92" height="72" rx="3" fill={P.wood} />
        <rect x="9" y="9" width="82" height="62" rx="2" fill={v === "flow" ? P.ivory : "#c9a27a"} />
        {v === "flow" ? (
          <g fill="none" stroke={P.forest} strokeWidth="2.5">
            <rect x="14" y="16" width="18" height="12" rx="2" />
            <rect x="42" y="30" width="18" height="12" rx="2" />
            <rect x="68" y="48" width="18" height="12" rx="2" />
            <path d="M32 22 h5 v14 h5 M60 36 h4 v18 h4" />
          </g>
        ) : v === "week" ? (
          Array.from({ length: 7 }, (_, i) => (
            <rect
              key={i}
              x={13 + i * 11}
              y="22"
              width="9"
              height="36"
              rx="1.5"
              fill={i < 5 ? P.mustard : P.terracotta}
              opacity={1 - i * 0.1}
            />
          ))
        ) : (
          [
            [14, 14, P.mustard],
            [40, 18, P.pink],
            [66, 14, P.sky],
            [20, 42, P.lavender],
            [50, 44, P.white],
            [70, 40, P.grass],
          ].map(([x, y, c]) => (
            <rect
              key={`${x}-${y}`}
              x={x as number}
              y={y as number}
              width="18"
              height="16"
              fill={c as string}
              transform={`rotate(${((x as number) % 7) - 3} ${x} ${y})`}
            />
          ))
        )}
      </>
    ),
  },
  chart: {
    vb: [100, 110],
    draw: ({ v }) => (
      <>
        <rect x="18" y="70" width="5" height="40" fill={P.woodDark} transform="rotate(8 20 70)" />
        <rect x="77" y="70" width="5" height="40" fill={P.woodDark} transform="rotate(-8 80 70)" />
        <rect x="4" y="4" width="92" height="72" rx="3" fill={P.white} />
        <rect x="12" y="66" width="76" height="2" fill={P.charcoal} />
        {bars(
          v === "down"
            ? [48, 40, 28, 20, 12]
            : v === "drop"
              ? [50, 46, 30, 22, 16]
              : [14, 22, 30, 40, 52],
          16,
          66,
          P.forest,
        )}
      </>
    ),
  },
  banner: {
    vb: [140, 100],
    draw: () => (
      <>
        <rect x="8" y="4" width="5" height="96" fill={P.woodDark} />
        <rect x="127" y="4" width="5" height="96" fill={P.woodDark} />
        <path d="M13 10 H127 V58 L70 68 L13 58 Z" fill={P.mustard} />
        <path d="M13 10 H127 V18 H13 Z" fill={P.terracotta} />
        {[38, 70, 102].map((x) => (
          <polygon
            key={x}
            points={`${x},26 ${x + 4},36 ${x + 14},36 ${x + 6},42 ${x + 9},52 ${x},46 ${x - 9},52 ${x - 6},42 ${x - 14},36 ${x - 4},36`}
            fill={P.white}
          />
        ))}
      </>
    ),
  },
  boxes: {
    vb: [120, 90],
    draw: () => (
      <>
        {[
          [4, 50, 40],
          [46, 50, 40],
          [88, 58, 30],
          [24, 12, 40],
          [66, 18, 32],
        ].map(([x, y, s]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={s} height={s} fill="#c79a63" />
            <rect x={x! + s! / 2 - 4} y={y} width="8" height={s} fill="#e3c08c" />
          </g>
        ))}
      </>
    ),
  },
  sack: {
    vb: [60, 80],
    draw: () => (
      <>
        <path d="M8 18 Q30 4 52 18 L56 76 H4 Z" fill={P.forest} />
        <rect x="10" y="14" width="40" height="6" fill={P.mustard} />
        <g fill={P.mustard} transform="translate(30 48)">
          <ellipse cx="0" cy="5" rx="7" ry="6" />
          <circle cx="-8" cy="-4" r="3" />
          <circle cx="-3" cy="-9" r="3" />
          <circle cx="3" cy="-9" r="3" />
          <circle cx="8" cy="-4" r="3" />
        </g>
      </>
    ),
  },
  bowl: {
    vb: [50, 22],
    draw: () => (
      <>
        <ellipse cx="25" cy="7" rx="20" ry="5" fill="#8a5a3a" />
        <path d="M3 7 Q25 32 47 7 Z" fill={P.terracotta} />
      </>
    ),
  },
  dog: {
    vb: [100, 76],
    draw: () => (
      <>
        <g className="bk-tail" style={{ transformOrigin: "16px 34px" }}>
          <path
            d="M18 36 Q4 26 8 12"
            fill="none"
            stroke="#b07a48"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
        <ellipse cx="44" cy="44" rx="30" ry="16" fill="#b07a48" />
        {[24, 34, 56, 66].map((x) => (
          <rect key={x} x={x - 3} y="52" width="7" height="22" rx="3" fill="#b07a48" />
        ))}
        <circle cx="76" cy="28" r="15" fill="#b07a48" />
        <ellipse cx="90" cy="34" rx="9" ry="6" fill="#c9915f" />
        <circle cx="96" cy="32" r="2.6" fill={P.charcoal} />
        <circle cx="78" cy="24" r="2.2" fill={P.charcoal} />
        <path d="M66 18 Q62 34 70 38 Q74 28 70 16 Z" fill={P.woodDark} />
      </>
    ),
  },
  calendar: {
    vb: [80, 90],
    draw: () => (
      <>
        <rect x="4" y="10" width="72" height="78" rx="4" fill={P.white} />
        <rect x="4" y="10" width="72" height="18" rx="4" fill={P.terracotta} />
        {[20, 40, 60].map((x) => (
          <rect key={x} x={x - 2} y="4" width="4" height="12" rx="2" fill={P.charcoal} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <rect
            key={i}
            x={12 + (i % 5) * 12}
            y={36 + Math.floor(i / 5) * 16}
            width="8"
            height="9"
            rx="1"
            fill={i === 11 ? P.mustard : P.stone}
          />
        ))}
      </>
    ),
  },
  envelope: {
    vb: [70, 48],
    draw: ({ v }) => (
      <>
        <rect
          x="3"
          y="3"
          width="64"
          height="42"
          rx="3"
          fill={v === "reply" ? P.mustard : v === "no" ? P.stone : P.white}
        />
        <path d="M3 5 L35 28 L67 5" fill="none" stroke={P.charcoal} strokeWidth="2" opacity="0.5" />
        {v === "no" && (
          <path
            d="M48 26 l12 12 M60 26 l-12 12"
            stroke={P.brick}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        )}
        {v === "reply" && <circle cx="35" cy="30" r="6" fill={P.terracotta} />}
      </>
    ),
  },
  phone: {
    vb: [40, 70],
    draw: ({ v }) => (
      <>
        <rect x="4" y="2" width="32" height="66" rx="6" fill={P.charcoal} />
        <rect x="7" y="8" width="26" height="50" rx="2" fill={v === "on" ? P.teal : P.glass} />
        {v === "on" && (
          <>
            <rect x="11" y="16" width="18" height="3" fill={P.white} />
            <rect x="11" y="24" width="12" height="3" fill={P.white} />
          </>
        )}
        <circle cx="20" cy="63" r="2.4" fill={P.stone} />
      </>
    ),
  },
  stand: {
    vb: [50, 110],
    draw: () => (
      <>
        <path d="M25 50 L8 108 M25 50 L42 108 M25 50 L25 108" stroke={P.charcoal} strokeWidth="3" />
        <rect x="11" y="10" width="28" height="44" rx="5" fill={P.charcoal} />
        <rect x="14" y="15" width="22" height="34" rx="2" fill={P.terracotta} />
        <circle cx="25" cy="32" r="6" fill={P.white} />
      </>
    ),
  },
  megaphone: {
    vb: [80, 60],
    draw: () => (
      <>
        <path d="M10 22 L52 6 L52 54 L10 38 Z" fill={P.terracotta} />
        <rect x="2" y="20" width="12" height="20" rx="3" fill={P.charcoal} />
        <rect x="18" y="36" width="8" height="18" rx="2" fill={P.charcoal} />
        <path
          d="M60 18 Q70 30 60 42 M68 10 Q82 30 68 50"
          fill="none"
          stroke={P.mustard}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  bed: {
    vb: [170, 80],
    draw: () => (
      <>
        <rect x="4" y="10" width="12" height="70" rx="3" fill={P.wood} />
        <rect x="154" y="34" width="12" height="46" rx="3" fill={P.wood} />
        <rect x="10" y="44" width="150" height="20" rx="4" fill={P.white} />
        <rect x="20" y="30" width="34" height="16" rx="8" fill={P.ivory} />
        <path d="M50 44 Q100 24 158 44 V60 H50 Z" fill={P.dusty} />
      </>
    ),
  },
  bedside: {
    vb: [60, 50],
    draw: () => (
      <>
        <rect x="4" y="4" width="52" height="8" rx="2" fill={P.wood} />
        <rect x="8" y="12" width="44" height="36" fill={P.woodDark} />
        <rect x="24" y="26" width="12" height="3" rx="1" fill={P.mustard} />
      </>
    ),
  },
  person: {
    vb: [50, 110],
    draw: ({ tone, v }) =>
      v === "lying" ? (
        <>
          <circle cx="12" cy="12" r="10" fill="#9c7458" />
          <path d="M3 9 Q12 -2 22 8" fill="#d9d4cc" />
        </>
      ) : v === "sit" ? (
        <>
          <rect x="10" y="72" width="30" height="12" rx="6" fill={P.charcoal} />
          <path d="M12 44 Q25 34 38 44 L40 78 H10 Z" fill={tone ?? P.lavender} />
          <circle cx="25" cy="28" r="12" fill="#9c7458" />
          <path d="M13 26 Q25 10 37 26 Q31 18 13 26 Z" fill={P.charcoal} />
        </>
      ) : (
        <>
          <rect x="15" y="74" width="8" height="34" rx="3" fill={P.charcoal} />
          <rect x="27" y="74" width="8" height="34" rx="3" fill={P.charcoal} />
          <path d="M12 42 Q25 32 38 42 L38 78 H12 Z" fill={tone ?? P.lavender} />
          <circle cx="25" cy="24" r="12" fill="#9c7458" />
          <path d="M13 22 Q25 6 37 22 Q31 14 13 22 Z" fill={P.charcoal} />
        </>
      ),
  },
  bench: {
    vb: [120, 50],
    draw: () => (
      <>
        <rect x="6" y="6" width="108" height="8" rx="2" fill={P.wood} />
        <rect x="6" y="22" width="108" height="8" rx="2" fill={P.wood} />
        <rect x="14" y="30" width="6" height="20" fill={P.charcoal} />
        <rect x="100" y="30" width="6" height="20" fill={P.charcoal} />
      </>
    ),
  },
  mats: {
    vb: [160, 40],
    draw: () => (
      <>
        {[22, 62, 102, 140].map((x, i) => (
          <ellipse
            key={x}
            cx={x}
            cy={24}
            rx="18"
            ry="9"
            fill={[P.lavender, P.mustard, P.sky, P.pink][i]}
          />
        ))}
      </>
    ),
  },
  bridge: {
    vb: [220, 80],
    draw: () => (
      <>
        <path d="M0 70 Q110 0 220 70 L220 80 L0 80 Z" fill={P.terracotta} />
        <path d="M30 70 Q110 22 190 70 Z" fill="#00000000" />
        <path d="M24 80 Q110 26 196 80 Z" fill={P.sky} />
        <path d="M6 46 Q110 -16 214 46" fill="none" stroke={P.woodDark} strokeWidth="3" />
        {[30, 60, 90, 130, 160, 190].map((x) => (
          <rect
            key={x}
            x={x - 1.5}
            y={Math.abs(110 - x) * 0.32 + 6}
            width="3"
            height="16"
            fill={P.woodDark}
          />
        ))}
        <path d="M0 80 C 60 72 160 72 220 80" fill="none" stroke={P.dusty} strokeWidth="3" />
      </>
    ),
  },
  heart: {
    vb: [40, 36],
    draw: () => (
      <path
        d="M20 34 C 4 22 0 14 4 8 C 9 1 17 3 20 9 C 23 3 31 1 36 8 C 40 14 36 22 20 34 Z"
        fill={P.terracotta}
      />
    ),
  },
  clock: {
    vb: [70, 70],
    draw: () => (
      <>
        <circle cx="35" cy="35" r="31" fill={P.white} />
        <circle cx="35" cy="35" r="31" fill="none" stroke={P.wood} strokeWidth="5" />
        <path
          d="M35 35 V14 M35 35 L50 42"
          stroke={P.charcoal}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="35" cy="35" r="3" fill={P.terracotta} />
      </>
    ),
  },
  mic: {
    vb: [50, 110],
    draw: () => (
      <>
        <rect x="9" y="4" width="32" height="46" rx="16" fill={P.charcoal} />
        <path d="M16 12 h18 M16 20 h18 M16 28 h18" stroke={P.stone} strokeWidth="2" />
        <path d="M4 34 Q4 64 25 64 Q46 64 46 34" fill="none" stroke={P.stone} strokeWidth="4" />
        <rect x="22" y="64" width="6" height="36" fill={P.stone} />
        <rect x="8" y="100" width="34" height="8" rx="3" fill={P.charcoal} />
      </>
    ),
  },
  screen: {
    vb: [110, 90],
    draw: ({ v }) => (
      <>
        <rect x="4" y="4" width="102" height="66" rx="4" fill={P.charcoal} />
        <rect x="9" y="9" width="92" height="56" rx="2" fill={P.ivory} />
        <rect x="49" y="70" width="12" height="12" fill={P.stone} />
        <rect x="30" y="82" width="50" height="6" rx="2" fill={P.stone} />
        {v === "wire" ? (
          <g fill="none" stroke={P.dusty} strokeWidth="2">
            <rect x="15" y="15" width="34" height="44" rx="2" />
            <rect x="56" y="15" width="38" height="12" rx="2" />
            <rect x="56" y="32" width="38" height="12" rx="2" />
            <rect x="56" y="49" width="24" height="10" rx="2" />
          </g>
        ) : v === "dash" ? (
          <>
            <rect x="15" y="15" width="26" height="18" rx="2" fill={P.mustard} />
            <rect x="45" y="15" width="26" height="18" rx="2" fill={P.sky} />
            <rect x="75" y="15" width="20" height="18" rx="2" fill={P.pink} />
            {bars([10, 16, 12, 20, 24], 18, 60, P.forest)}
          </>
        ) : (
          <g className="bk-type">
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                x="16"
                y={16 + i * 11}
                width={[70, 56, 64, 40][i]}
                height="5"
                rx="2"
                fill={i % 2 ? P.dusty : P.forest}
                style={{ ["--i" as string]: i }}
              />
            ))}
          </g>
        )}
      </>
    ),
  },
  bubble: {
    vb: [80, 56],
    draw: ({ tone }) => (
      <>
        <path
          d="M8 4 H72 Q78 4 78 10 V36 Q78 42 72 42 H30 L16 54 L18 42 H8 Q2 42 2 36 V10 Q2 4 8 4 Z"
          fill={tone ?? P.white}
        />
        <rect x="12" y="14" width="48" height="4" rx="2" fill={P.charcoal} opacity="0.6" />
        <rect x="12" y="24" width="34" height="4" rx="2" fill={P.charcoal} opacity="0.4" />
      </>
    ),
  },
  check: {
    vb: [60, 60],
    draw: () => (
      <>
        <circle cx="30" cy="30" r="27" fill={P.forest} />
        <path
          d="M17 31 L26 40 L44 21"
          fill="none"
          stroke={P.white}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  cafe: {
    vb: [110, 70],
    draw: () => (
      <>
        <ellipse cx="55" cy="22" rx="34" ry="8" fill={P.wood} />
        <rect x="52" y="24" width="6" height="40" fill={P.woodDark} />
        <rect x="38" y="62" width="34" height="6" rx="2" fill={P.woodDark} />
        <rect x="42" y="8" width="10" height="12" rx="2" fill={P.white} />
        <rect x="60" y="10" width="10" height="10" rx="2" fill={P.terracotta} />
        {[10, 100].map((x) => (
          <g key={x}>
            <rect x={x - 9} y="38" width="18" height="6" rx="2" fill={P.mustard} />
            <rect x={x - 2} y="44" width="4" height="24" fill={P.charcoal} />
          </g>
        ))}
      </>
    ),
  },
  waves: {
    vb: [60, 60],
    draw: ({ tone }) => (
      <g fill="none" stroke={tone ?? P.teal} strokeWidth="4" strokeLinecap="round">
        <path className="bk-wave" style={{ ["--i" as string]: 0 }} d="M14 18 Q22 30 14 42" />
        <path className="bk-wave" style={{ ["--i" as string]: 1 }} d="M26 10 Q40 30 26 50" />
        <path className="bk-wave" style={{ ["--i" as string]: 2 }} d="M38 2 Q58 30 38 58" />
      </g>
    ),
  },
  notes: {
    vb: [90, 60],
    draw: () => (
      <>
        {[
          [4, 10, P.mustard, -6],
          [30, 2, P.pink, 4],
          [56, 12, P.sky, -3],
          [18, 30, P.lavender, 5],
          [46, 32, P.grass, -4],
        ].map(([x, y, c, r]) => (
          <rect
            key={`${x}-${y}`}
            x={x as number}
            y={y as number}
            width="26"
            height="24"
            fill={c as string}
            transform={`rotate(${r} ${(x as number) + 13} ${(y as number) + 12})`}
          />
        ))}
      </>
    ),
  },
  tag: {
    vb: [70, 50],
    draw: () => (
      <>
        <path d="M4 25 L20 4 H66 V46 H20 Z" fill={P.mustard} />
        <circle cx="20" cy="25" r="4" fill={P.ivory} />
        <rect x="32" y="16" width="26" height="5" rx="2" fill={P.charcoal} opacity="0.6" />
        <rect x="32" y="28" width="18" height="5" rx="2" fill={P.charcoal} opacity="0.4" />
      </>
    ),
  },
  sparkle: {
    vb: [40, 40],
    draw: ({ tone }) => (
      <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16 Z" fill={tone ?? P.mustard} />
    ),
  },
  officeDesk: {
    vb: [80, 80],
    draw: ({ tone }) => (
      <>
        <rect x="26" y="8" width="34" height="22" rx="2" fill={P.charcoal} />
        <rect x="29" y="11" width="28" height="16" rx="1" fill={P.ivory} />
        <g className="bk-type">
          {[0, 1].map((i) => (
            <rect
              key={i}
              x="32"
              y={14 + i * 6}
              width={[20, 14][i]}
              height="3"
              rx="1"
              fill={P.forest}
              style={{ ["--i" as string]: i }}
            />
          ))}
        </g>
        <circle cx="14" cy="34" r="9" fill="#9c7458" />
        <path d="M2 74 V52 Q14 42 26 52 V74 Z" fill={tone ?? P.dusty} />
        <rect x="0" y="48" width="80" height="6" rx="2" fill={P.wood} />
        <rect x="6" y="54" width="4" height="24" fill={P.woodDark} />
        <rect x="70" y="54" width="4" height="24" fill={P.woodDark} />
      </>
    ),
  },
  lamp: {
    vb: [40, 70],
    draw: () => (
      <>
        <path d="M8 4 H32 L38 26 H2 Z" fill={P.mustard} />
        <rect x="18" y="26" width="4" height="36" fill={P.charcoal} />
        <rect x="8" y="62" width="24" height="6" rx="2" fill={P.charcoal} />
      </>
    ),
  },
  /** An open office doorway with warm light spilling out. */
  door: {
    vb: [60, 100],
    draw: () => (
      <>
        <rect x="8" y="6" width="44" height="94" fill="#ffd889" />
        <rect x="14" y="12" width="32" height="88" fill="#ffe9b8" />
        <rect x="4" y="2" width="52" height="8" fill={P.charcoal} />
        <rect x="4" y="2" width="6" height="98" fill={P.charcoal} />
        <rect x="50" y="2" width="6" height="98" fill={P.charcoal} />
        <path d="M50 10 L60 16 L60 100 L50 100 Z" fill="#3d5a45" />
      </>
    ),
  },
} satisfies Record<string, PropDef>;

export type PropKind = keyof typeof PROPS;

export function PropArt({
  k,
  v,
  tone,
}: {
  k: PropKind;
  v?: string | undefined;
  tone?: string | undefined;
}) {
  const def: PropDef = PROPS[k];
  return (
    <svg
      className="bk-cut block h-auto w-full overflow-visible"
      viewBox={`0 0 ${def.vb[0]} ${def.vb[1]}`}
      aria-hidden
    >
      {def.draw({ v, tone })}
    </svg>
  );
}
