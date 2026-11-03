/**
 * Pure scroll → animation mapping for the book. No React, no three.js.
 * `p` is overall scroll progress in [0, 1]. The story is measured in
 * "units": the intro (cover opening) takes INTRO units, each miniature
 * world takes one unit, and each India-map journey takes TRAVEL_LEN units.
 */
import { travels, worldChapters } from "@/content/journey";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const INTRO = 1.5;
export const TRAVEL_LEN = 1.2;
/** After the last chapter: the world sinks, the book closes, the camera pulls back. */
export const OUTRO_LEN = 1.4;
/** Chapters 01–16. Must match `worldChapters`. */
export const WORLD_COUNT = worldChapters.length;

export type Segment =
  | { kind: "world"; world: number; start: number; len: number }
  | { kind: "travel"; leg: number; world: number; start: number; len: number }
  | { kind: "outro"; world: number; start: number; len: number };

/** The story in scroll order: worlds, with map journeys after their chapter. */
export const SEGMENTS: Segment[] = (() => {
  const out: Segment[] = [];
  let u = INTRO;
  worldChapters.forEach((ch, world) => {
    out.push({ kind: "world", world, start: u, len: 1 });
    u += 1;
    const leg = travels.findIndex((t) => t.after === ch.id);
    if (leg >= 0 && world < worldChapters.length - 1) {
      out.push({ kind: "travel", leg, world, start: u, len: TRAVEL_LEN });
      u += TRAVEL_LEN;
    }
  });
  out.push({ kind: "outro", world: worldChapters.length - 1, start: u, len: OUTRO_LEN });
  return out;
})();

export const TOTAL = SEGMENTS.reduce((u, s) => Math.max(u, s.start + s.len), INTRO);

/** Scroll windows for the intro, measured in intro progress [0, 1]. */
export const BEATS = {
  approach: [0, 0.3],
  open: [0.2, 0.72],
  settle: [0.45, 0.95],
} as const;

export function bookTimeline(introP: number) {
  const approach = smoothstep(BEATS.approach[0], BEATS.approach[1], introP);
  const open = smoothstep(BEATS.open[0], BEATS.open[1], introP);
  const settle = smoothstep(BEATS.settle[0], BEATS.settle[1], introP);
  // Warm light that spills from between the pages while the cover lifts.
  const glow = Math.sin(open * Math.PI) * 0.9 + open * 0.08;
  return { approach, open, settle, glow };
}

export interface StoryPosition {
  /** Intro progress [0, 1]; 1 once the worlds begin. */
  intro: number;
  /** Index into the world chapters, or -1 during the intro. During a journey, the chapter just left. */
  world: number;
  /** Progress through the current world [0, 1]; 1 during a journey. */
  local: number;
  /** Index into `travels` while a map journey is on show, else -1. */
  travel: number;
  /** Progress through the journey [0, 1]. */
  travelP: number;
  /** Progress through the closing of the book [0, 1]; 0 before it. */
  outro: number;
}

export function storyAt(p: number): StoryPosition {
  const u = clamp01(p) * TOTAL;
  if (u < INTRO) return { intro: u / INTRO, world: -1, local: 0, travel: -1, travelP: 0, outro: 0 };
  let seg = SEGMENTS[SEGMENTS.length - 1]!;
  for (const s of SEGMENTS) {
    if (u < s.start + s.len) {
      seg = s;
      break;
    }
  }
  const t = clamp01((u - seg.start) / seg.len);
  if (seg.kind === "travel")
    return { intro: 1, world: seg.world, local: 1, travel: seg.leg, travelP: t, outro: 0 };
  if (seg.kind === "outro")
    return { intro: 1, world: seg.world, local: 1, travel: -1, travelP: 0, outro: t };
  return { intro: 1, world: seg.world, local: t, travel: -1, travelP: 0, outro: 0 };
}

/**
 * Beats inside one chapter, in order:
 * turn the page → read the printed spread up close → the world rises and
 * the camera moves into it → hold (characters act) → zoom back out → fold.
 */
export function worldBeats(local: number, isLast: boolean) {
  const turn = smoothstep(0, 0.14, local);
  const readIn = smoothstep(0.1, 0.2, local);
  const readOut = smoothstep(0.3, 0.42, local);
  const read = readIn * (1 - readOut);
  /** Pan across the spread while reading (left page → right page). */
  const readPan = clamp01((local - 0.14) / 0.18);
  const up = smoothstep(0.3, 0.46, local);
  const down = isLast ? 0 : smoothstep(0.9, 1, local);
  const rise = up * (1 - down);
  const hold = clamp01((local - 0.44) / 0.42);
  const zoomIn = smoothstep(0.36, 0.56, local);
  const zoomOut = isLast ? 0 : smoothstep(0.84, 0.96, local);
  return {
    turn,
    read,
    readPan,
    rise,
    hold,
    zoom: zoomIn * (1 - zoomOut),
    pullBack: 0,
  };
}

/**
 * Beats of one India-map journey:
 * the book shrinks into the map → the route draws → the vehicle travels
 * (the map slides beneath it) → the camera dives into the destination and
 * the book grows back for the next chapter.
 */
export function travelBeats(tp: number) {
  const out = smoothstep(0, 0.22, tp);
  const route = smoothstep(0.16, 0.36, tp);
  const move = smoothstep(0.3, 0.8, tp);
  const arrive = smoothstep(0.8, 1, tp);
  /** How much of the map is on show (0 = the book, 1 = the map). */
  const map = out * (1 - arrive);
  return { out, route, move, arrive, map, bookScale: 1 - 0.97 * map };
}

/**
 * Beats of the closing: the last world sinks into the paper → the book
 * closes over it → the camera pulls back over the closed cover.
 */
export function outroBeats(t: number) {
  const sink = smoothstep(0, 0.28, t);
  const close = smoothstep(0.22, 0.78, t);
  const pull = smoothstep(0.5, 1, t);
  return { sink, close, pull };
}

/** Pages turned so far (fractional while a page is turning). */
export function pagesTurned(s: StoryPosition) {
  if (s.world < 0) return 0;
  return s.world + worldBeats(s.local, s.world === WORLD_COUNT - 1).turn;
}

/** Index into `chapters` (cover = 0, prologue = 1, worlds from 2). */
export function chapterIndexAt(p: number) {
  const s = storyAt(p);
  if (s.world < 0) return s.intro < 0.55 ? 0 : 1;
  if (s.travel >= 0) return 2 + s.world;
  if (s.local < 0.12) return s.world === 0 ? 1 : 1 + s.world;
  return 2 + s.world;
}

/** Scroll progress at which a chapter is fully on show. */
export function progressForChapter(index: number) {
  if (index <= 0) return 0;
  if (index === 1) return (INTRO - 0.02) / TOTAL;
  const world = Math.min(WORLD_COUNT - 1, index - 2);
  const seg = SEGMENTS.find((s) => s.kind === "world" && s.world === world)!;
  return (seg.start + 0.62) / TOTAL;
}
