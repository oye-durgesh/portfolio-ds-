/**
 * The pop-up diorama for one chapter. Every cut-out unfolds from the paper
 * as `--rise` goes 0 → 1 (back layers first) and stands off the page by its
 * depth; gold labels point at the objects the chapter's annotations name.
 * Labels never open anything: the visitor never leaves the book.
 */
import type { CSSProperties } from "react";
import type { Annotation, Chapter } from "@/content/journey";
import { AnnotationIcon } from "@/components/journey/icons";
import { CSS_WORLDS, type Anchor, type PropSpec } from "./worlds";
import { PropArt } from "./props";
import { Character } from "./Character";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Cut-outs are sized as a share of the world's width, scaled up to fill the tall pop-up. */
const SIZE = 1.3;

function propStyle(p: {
  x: number;
  y?: number | undefined;
  w: number;
  z?: number | undefined;
  d?: number | undefined;
  at?: number | undefined;
}): Vars {
  const z = p.z ?? 0.3;
  return {
    left: `${p.x}%`,
    bottom: `${p.y ?? 0}%`,
    width: `${Math.min(100, p.w * SIZE)}%`,
    "--z": z,
    "--d": (p.d ?? 0) + z * 0.32,
    "--at": p.at ?? -1,
  };
}

function CalendarSheets() {
  return (
    <div className="absolute inset-x-[6%] bottom-[3%] top-[30%]" aria-hidden>
      {[3, 2, 1, 0].map((i) => (
        <div key={i} className="bk-cal-sheet" style={{ "--i": i } as Vars} />
      ))}
    </div>
  );
}

function Prop({ p, seq }: { p: PropSpec; seq: number }) {
  return (
    <div
      className={`bk-prop ${p.anim ? `bk-a-${p.anim}` : ""}`}
      style={{ ...propStyle(p), "--seq": seq } as Vars}
    >
      <div className={p.flip ? "bk-flip" : undefined}>
        <PropArt k={p.k} v={p.v} tone={p.tone} />
        {p.k === "calendar" && p.v === "flip" && <CalendarSheets />}
      </div>
    </div>
  );
}

function Label({ a, at, index }: { a: Annotation; at: Anchor; index: number }) {
  const left = at[2] ? at[2] === "l" : at[0] > 55;
  const dx = left ? -40 : 40;
  const dy = -(30 + (index % 2) * 26);
  return (
    <div className="bk-label" style={{ left: `${at[0]}%`, bottom: `${at[1]}%` }}>
      <svg
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        width="1"
        height="1"
        aria-hidden
      >
        <line x1="0" y1="0" x2={dx} y2={dy} className="stroke-primary" strokeWidth="1" />
        <circle cx="0" cy="0" r="3" className="fill-primary" />
        <circle
          cx="0"
          cy="0"
          r="6"
          className="animate-dot-pulse fill-none stroke-primary/70"
          strokeWidth="1.5"
          style={{ animationDelay: `${index * 0.3}s` }}
        />
      </svg>
      <div
        className="absolute"
        style={{ left: dx, top: dy, transform: `translate(${left ? "-100%" : "0"}, -50%)` }}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/50 bg-panel px-3 py-1.5 text-[0.8rem] font-medium leading-none text-foreground shadow-[var(--shadow-glow)]">
          <AnnotationIcon name={a.icon} className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{a.label}</span>
        </div>
      </div>
    </div>
  );
}

export function World({ chapter }: { chapter: Chapter }) {
  const def = CSS_WORLDS[chapter.id];
  if (!def) return null;
  const sky = { "--sky-a": def.sky[0], "--sky-b": def.sky[1], "--ground": def.ground } as Vars;
  return (
    <div className="bk-world" style={sky}>
      <div
        className="bk-prop bk-backdrop"
        style={
          {
            left: "50%",
            bottom: 0,
            width: "100%",
            height: "92%",
            "--z": 0,
            "--d": 0,
            "--at": -1,
          } as Vars
        }
      >
        <div className="bk-backdrop-ground" />
      </div>
      {def.props.map((p, i) => (
        <Prop key={i} p={p} seq={i} />
      ))}
      {def.hero && (
        <div
          className="bk-prop"
          style={propStyle({ ...def.hero, w: def.hero.w ?? 7.4, z: def.hero.z ?? 0.8 })}
        >
          <div className={def.hero.flip ? "bk-flip" : undefined}>
            <Character chapterId={chapter.id} pose={def.hero.pose ?? "stand"} />
          </div>
        </div>
      )}
      <div className="bk-labels">
        {chapter.annotations?.map((a, i) => {
          const at = def.anchors[a.id];
          return at ? <Label key={`${chapter.id}-${a.id}`} a={a} at={at} index={i} /> : null;
        })}
      </div>
    </div>
  );
}
