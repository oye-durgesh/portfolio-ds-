/**
 * Durgesh as a cut-paper figure. Same face, body and hair in every chapter;
 * only the outfit and backpack change, chosen by chapter id (never per world).
 */
import { P } from "./props";

const SKIN = "#8d6e63";
const HAIR = "#15100c";

interface Look {
  scale: number;
  shirt: string;
  pants: string;
  shoes: string;
  shorts?: boolean;
  collar?: boolean;
  hood?: boolean;
  bag: string | null;
  stickers?: boolean;
}

const LOOKS = {
  school: {
    scale: 0.86,
    shirt: "#8fb7d9",
    pants: "#8b8780",
    shoes: "#7a4f32",
    shorts: true,
    bag: "#7a4f32",
  },
  college: { scale: 0.92, shirt: "#e0a33a", pants: "#4d6a8f", shoes: "#f3efe6", bag: "#7d8450" },
  gocattles: {
    scale: 0.95,
    shirt: "#3d6b4c",
    pants: "#2f3b52",
    shoes: "#f3efe6",
    collar: true,
    bag: "#7d8450",
  },
  bwb: {
    scale: 0.97,
    shirt: "#a9c6e0",
    pants: "#34302c",
    shoes: "#3a332d",
    collar: true,
    bag: "#3b3a40",
    stickers: true,
  },
  voice: {
    scale: 0.97,
    shirt: "#8f8c88",
    pants: "#2f3b52",
    shoes: "#f3efe6",
    hood: true,
    bag: "#3b3a40",
    stickers: true,
  },
  home: { scale: 0.97, shirt: "#f4f0e8", pants: "#7d7a76", shoes: "#f4f0e8", bag: null },
  next: {
    scale: 0.97,
    shirt: "#f7f4ee",
    pants: "#2c2a28",
    shoes: "#3a332d",
    collar: true,
    bag: "#3b3a40",
    stickers: true,
  },
} satisfies Record<string, Look>;

export type LookName = keyof typeof LOOKS;

const CHAPTER_LOOK: Record<string, LookName> = {
  kanpur: "school",
  setback: "school",
  "greater-noida": "college",
  building: "college",
  gocattles: "gocattles",
  "prime-day": "gocattles",
  "in-between": "gocattles",
  voice: "voice",
  smaran: "home",
  next: "next",
};

export function lookForChapter(id: string | undefined): LookName {
  return (id && CHAPTER_LOOK[id]) || "bwb";
}

export type Pose = "stand" | "wave" | "sit" | "pet" | "talk" | "walk";

export function Character({ chapterId, pose = "stand" }: { chapterId: string; pose?: Pose }) {
  const L: Look = LOOKS[lookForChapter(chapterId)];
  const sit = pose === "sit";
  const pet = pose === "pet";
  const legY = sit ? 92 : 80;
  return (
    <svg
      className={`bk-cut bk-hero block h-auto w-full overflow-visible ${pose === "walk" ? "bk-walk" : "bk-bob"}`}
      viewBox="0 0 60 130"
      aria-hidden
      style={{ transform: `scale(${L.scale})`, transformOrigin: "50% 100%" }}
    >
      <g className={pet ? "bk-pet" : undefined} style={{ transformOrigin: "30px 120px" }}>
        {/* Backpack behind the body */}
        {L.bag && (
          <g>
            <rect x="36" y="46" width="16" height="30" rx="5" fill={L.bag} />
            {L.stickers && (
              <>
                <circle cx="44" cy="54" r="2.6" fill={P.terracotta} />
                <circle cx="46" cy="64" r="2.2" fill={P.mustard} />
              </>
            )}
          </g>
        )}
        {/* Legs */}
        {sit ? (
          <>
            <rect x="18" y="80" width="26" height="10" rx="4" fill={L.pants} />
            <rect x="36" y="86" width="9" height="30" rx="4" fill={L.pants} />
            <rect x="34" y="114" width="16" height="7" rx="3" fill={L.shoes} />
          </>
        ) : (
          <>
            <g className="bk-leg-a">
              <rect x="20" y={legY} width="9" height={L.shorts ? 18 : 38} rx="3" fill={L.pants} />
              {L.shorts && <rect x="21" y="97" width="7" height="21" rx="3" fill={SKIN} />}
              <rect x="17" y="116" width="14" height="7" rx="3" fill={L.shoes} />
            </g>
            <g className="bk-leg-b">
              <rect x="31" y={legY} width="9" height={L.shorts ? 18 : 38} rx="3" fill={L.pants} />
              {L.shorts && <rect x="32" y="97" width="7" height="21" rx="3" fill={SKIN} />}
              <rect x="30" y="116" width="14" height="7" rx="3" fill={L.shoes} />
            </g>
          </>
        )}
        {/* Body */}
        <path d="M16 50 Q30 40 44 50 L44 84 H16 Z" fill={L.shirt} />
        {L.collar && (
          <path d="M24 45 L30 52 L36 45" fill="none" stroke={P.white} strokeWidth="2.4" />
        )}
        {L.bag && <rect x="37" y="46" width="3" height="30" fill={L.bag} opacity="0.85" />}
        {/* Arms */}
        <rect
          x="9"
          y="50"
          width="8"
          height="28"
          rx="4"
          fill={L.shirt}
          transform={pet ? "rotate(-28 13 52)" : undefined}
        />
        <circle
          cx="13"
          cy="80"
          r="4"
          fill={SKIN}
          transform={pet ? "rotate(-28 13 52)" : undefined}
        />
        {pose === "wave" ? (
          <g className="bk-wave-arm" style={{ transformOrigin: "47px 52px" }}>
            <rect
              x="43"
              y="26"
              width="8"
              height="28"
              rx="4"
              fill={L.shirt}
              transform="rotate(20 47 52)"
            />
            <circle cx="56" cy="27" r="4.4" fill={SKIN} />
          </g>
        ) : pose === "talk" ? (
          <>
            <rect
              x="43"
              y="40"
              width="8"
              height="22"
              rx="4"
              fill={L.shirt}
              transform="rotate(-50 47 52)"
            />
            <circle cx="40" cy="40" r="4" fill={SKIN} />
          </>
        ) : (
          <>
            <rect x="43" y="50" width="8" height="28" rx="4" fill={L.shirt} />
            <circle cx="47" cy="80" r="4" fill={SKIN} />
          </>
        )}
        {/* Head */}
        {L.hood && <path d="M14 34 Q30 6 46 34 L44 48 H16 Z" fill={L.shirt} />}
        <rect x="26" y="38" width="8" height="8" fill={SKIN} />
        <circle cx="30" cy="28" r="13" fill={SKIN} />
        <path d="M17 27 Q17 12 30 12 Q44 12 43 26 Q38 18 28 20 Q22 21 17 27 Z" fill={HAIR} />
        <circle cx="25.5" cy="29" r="1.6" fill={HAIR} />
        <circle cx="34.5" cy="29" r="1.6" fill={HAIR} />
        <path
          d="M26 34 Q30 37 34 34"
          fill="none"
          stroke={HAIR}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
