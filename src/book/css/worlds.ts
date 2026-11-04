/**
 * One pop-up diorama per chapter, keyed by chapter id. Pure data: positions
 * are percentages of the world box that stands on the open spread
 * (x = centre from the left, y = bottom edge up from the printed band,
 * w = width). `z` 0..1 is how far the cut-out stands off the paper; `at`
 * holds a cut-out back until the chapter's "hold" beat reaches it.
 * `anchors` place the gold labels for the chapter's annotation ids.
 */
import type { PropKind } from "./props";
import type { Pose } from "./Character";

export type PropAnim = "sway" | "wag" | "ring" | "glow" | "float" | "talk" | "drift";

export interface PropSpec {
  k: PropKind;
  x: number;
  y?: number;
  w: number;
  z?: number;
  v?: string;
  tone?: string | undefined;
  flip?: boolean;
  at?: number;
  anim?: PropAnim;
  /** Extra rise delay (0..0.4) for staged pop-ups. */
  d?: number;
}

/** Label anchor: x %, y % from the bottom, and optionally which side the chip sits on. */
export type Anchor = [number, number] | [number, number, "l" | "r"];

export interface CssWorld {
  /** Backdrop: sky top, sky bottom, ground. */
  sky: [string, string];
  ground: string;
  props: PropSpec[];
  hero?: { x: number; y?: number; w?: number; z?: number; pose?: Pose; flip?: boolean };
  anchors: Record<string, Anchor>;
}

const DAY: [string, string] = ["#cfdfe6", "#f1e7d0"];
const WARM: [string, string] = ["#efd3a8", "#f4e6cc"];
const GOLDEN: [string, string] = ["#f7cf7c", "#fbecc8"];
const DUSK: [string, string] = ["#c9bcd6", "#f2e2cc"];
const INDOOR: [string, string] = ["#e6d5b8", "#efe2c9"];
const GRASS = "#b5bd7a";
const FLOOR = "#c9a983";

export const CSS_WORLDS: Record<string, CssWorld> = {
  kanpur: {
    sky: WARM,
    ground: GRASS,
    props: [
      { k: "sun", x: 86, y: 70, w: 7, z: 0.05, anim: "float" },
      { k: "cloud", x: 18, y: 74, w: 11, z: 0.05, anim: "drift" },
      { k: "hill", x: 30, y: 0, w: 46, z: 0.1, tone: "#a7b071" },
      { k: "hill", x: 76, y: 0, w: 40, z: 0.12, tone: "#9aa860", flip: true },
      { k: "house", x: 22, y: 8, w: 15, z: 0.4 },
      { k: "tree", x: 9, y: 8, w: 7, z: 0.45, anim: "sway" },
      { k: "school", x: 70, y: 8, w: 24, z: 0.35 },
      { k: "tree", x: 89, y: 8, w: 7, z: 0.5, tone: "#3d5a45", anim: "sway" },
      { k: "road", x: 50, y: 1, w: 76, z: 0.7 },
      { k: "flowers", x: 38, y: 4, w: 10, z: 0.8 },
    ],
    hero: { x: 46, y: 4, w: 7.5, z: 0.85, pose: "walk" },
    anchors: { home: [22, 40], school: [70, 46], streets: [56, 6] },
  },
  setback: {
    sky: DUSK,
    ground: "#b8b28a",
    props: [
      { k: "cloud", x: 70, y: 76, w: 12, z: 0.05, anim: "drift" },
      { k: "hill", x: 50, y: 0, w: 90, z: 0.1, tone: "#aeb07c" },
      { k: "gate", x: 26, y: 8, w: 22, z: 0.35 },
      { k: "path", x: 62, y: 2, w: 54, z: 0.6 },
      { k: "signpost", x: 64, y: 8, w: 11, z: 0.55 },
      { k: "pine", x: 88, y: 8, w: 6, z: 0.4 },
      { k: "pine", x: 94, y: 8, w: 5, z: 0.3 },
      { k: "bush", x: 10, y: 4, w: 10, z: 0.7 },
    ],
    hero: { x: 49, y: 4, w: 7.2, z: 0.85, pose: "stand" },
    anchors: { "iit-gate": [26, 44], "new-route": [70, 36] },
  },
  "greater-noida": {
    sky: DAY,
    ground: GRASS,
    props: [
      { k: "cloud", x: 16, y: 74, w: 12, z: 0.05, anim: "drift" },
      { k: "campus", x: 46, y: 10, w: 32, z: 0.3 },
      { k: "tree", x: 22, y: 8, w: 8, z: 0.45, anim: "sway" },
      { k: "tree", x: 70, y: 8, w: 7, z: 0.45, anim: "sway" },
      { k: "cafe", x: 82, y: 6, w: 14, z: 0.65 },
      { k: "person", x: 76, y: 6, w: 4.2, z: 0.7, tone: "#d6a33c" },
      { k: "person", x: 90, y: 6, w: 4.2, z: 0.7, tone: "#6f8ba6" },
      { k: "path", x: 30, y: 1, w: 40, z: 0.75 },
      { k: "flowers", x: 58, y: 3, w: 10, z: 0.8 },
    ],
    hero: { x: 16, y: 4, w: 7.4, z: 0.85, pose: "walk" },
    anchors: { campus: [46, 54], cafeteria: [83, 26], exploring: [16, 34] },
  },
  building: {
    sky: INDOOR,
    ground: FLOOR,
    props: [
      { k: "board", x: 50, y: 14, w: 15, z: 0.25 },
      { k: "lamp", x: 12, y: 30, w: 4, z: 0.3 },
      { k: "desk", x: 25, y: 4, w: 20, z: 0.55, v: "code" },
      { k: "chart", x: 76, y: 4, w: 15, z: 0.5, v: "up" },
      { k: "sparkle", x: 63, y: 56, w: 3, z: 0.4, anim: "float" },
      { k: "notes", x: 90, y: 50, w: 8, z: 0.2 },
    ],
    hero: { x: 38, y: 4, w: 7.2, z: 0.8, pose: "sit" },
    anchors: { coding: [25, 36], growth: [76, 44], board: [50, 60] },
  },
  gocattles: {
    sky: WARM,
    ground: FLOOR,
    props: [
      { k: "house", x: 13, y: 6, w: 15, z: 0.3, tone: "#e8d9b5" },
      { k: "desk", x: 54, y: 4, w: 19, z: 0.4, v: "cart" },
      { k: "stand", x: 84, y: 4, w: 7, z: 0.45 },
      { k: "megaphone", x: 92, y: 52, w: 7, z: 0.3, anim: "float" },
      { k: "sack", x: 30, y: 4, w: 6, z: 0.6 },
      { k: "bowl", x: 36, y: 2, w: 5, z: 0.75 },
      { k: "dog", x: 42, y: 2, w: 11, z: 0.82, anim: "wag" },
    ],
    hero: { x: 33, y: 2, w: 7.2, z: 0.88, pose: "pet" },
    anchors: { door: [13, 40], seller: [54, 38], content: [86, 50] },
  },
  "prime-day": {
    sky: WARM,
    ground: FLOOR,
    props: [
      { k: "banner", x: 52, y: 22, w: 22, z: 0.2 },
      { k: "boxes", x: 22, y: 4, w: 19, z: 0.5 },
      { k: "boxes", x: 34, y: 4, w: 11, z: 0.65 },
      { k: "chart", x: 82, y: 4, w: 15, z: 0.45, v: "down" },
      { k: "sparkle", x: 40, y: 70, w: 2.5, z: 0.1, anim: "float" },
      { k: "sparkle", x: 66, y: 72, w: 2, z: 0.1, anim: "float" },
    ],
    hero: { x: 58, y: 4, w: 7.4, z: 0.85, pose: "stand", flip: true },
    anchors: { stock: [24, 32], banner: [52, 74], chart: [82, 44] },
  },
  "in-between": {
    sky: DUSK,
    ground: FLOOR,
    props: [
      { k: "calendar", x: 24, y: 30, w: 11, z: 0.25, v: "flip" },
      { k: "desk", x: 50, y: 4, w: 20, z: 0.45 },
      { k: "envelope", x: 70, y: 6, w: 7, z: 0.6, v: "no", at: 0.12 },
      { k: "envelope", x: 76, y: 12, w: 7, z: 0.62, v: "no", at: 0.28 },
      { k: "envelope", x: 72, y: 18, w: 7, z: 0.64, v: "no", at: 0.44 },
      { k: "envelope", x: 86, y: 30, w: 9, z: 0.75, v: "reply", at: 0.7, anim: "glow" },
      { k: "skyline", x: 88, y: 56, w: 18, z: 0.05, at: 0.75 },
    ],
    hero: { x: 40, y: 4, w: 7.2, z: 0.8, pose: "sit" },
    anchors: { calendar: [24, 74], rejected: [72, 30, "l"], reply: [88, 46, "r"] },
  },
  bengaluru: {
    sky: DAY,
    ground: "#b9b6a4",
    props: [
      { k: "skyline", x: 50, y: 10, w: 52, z: 0.1 },
      { k: "cloud", x: 84, y: 76, w: 10, z: 0.05, anim: "drift" },
      { k: "tower", x: 80, y: 6, w: 11, z: 0.4, v: "flower" },
      { k: "tree", x: 66, y: 6, w: 7, z: 0.5, tone: "#3d5a45", anim: "sway" },
      { k: "road", x: 50, y: 1, w: 76, z: 0.6 },
      { k: "bus", x: 24, y: 2, w: 22, z: 0.7 },
    ],
    hero: { x: 46, y: 2, w: 7.4, z: 0.85, pose: "wave" },
    anchors: { city: [46, 70], bus: [22, 30], office: [80, 62] },
  },
  community: {
    sky: DAY,
    ground: GRASS,
    props: [
      { k: "tree", x: 10, y: 8, w: 10, z: 0.2, anim: "sway" },
      { k: "tree", x: 30, y: 10, w: 8, z: 0.15, tone: "#3d5a45", anim: "sway" },
      { k: "tree", x: 88, y: 8, w: 9, z: 0.2, anim: "sway" },
      { k: "bench", x: 20, y: 4, w: 12, z: 0.5 },
      { k: "mats", x: 52, y: 2, w: 26, z: 0.55 },
      { k: "person", x: 44, y: 4, w: 4.4, z: 0.62, v: "sit", tone: "#a99bc4" },
      { k: "person", x: 52, y: 6, w: 4.4, z: 0.6, v: "sit", tone: "#d6a33c" },
      { k: "person", x: 60, y: 4, w: 4.4, z: 0.62, v: "sit", tone: "#6f8ba6" },
      { k: "person", x: 84, y: 4, w: 4.6, z: 0.7, tone: "#c06a48" },
      { k: "bubble", x: 84, y: 44, w: 8, z: 0.72, anim: "float" },
      { k: "flowers", x: 34, y: 2, w: 10, z: 0.8 },
    ],
    hero: { x: 76, y: 4, w: 7.4, z: 0.75, pose: "talk" },
    anchors: { park: [12, 56], circle: [52, 26], talking: [84, 62] },
  },
  clarity: {
    sky: WARM,
    ground: GRASS,
    props: [
      { k: "sun", x: 58, y: 64, w: 8, z: 0.05, anim: "float" },
      { k: "board", x: 26, y: 6, w: 18, z: 0.35, v: "week" },
      { k: "clock", x: 58, y: 28, w: 8, z: 0.3 },
      { k: "mats", x: 56, y: 2, w: 18, z: 0.55 },
      { k: "chart", x: 84, y: 4, w: 15, z: 0.45, v: "drop" },
    ],
    hero: { x: 44, y: 4, w: 7.2, z: 0.8, pose: "stand" },
    anchors: { schedule: [26, 60], session: [58, 52], dropoff: [84, 46] },
  },
  accountability: {
    sky: DAY,
    ground: GRASS,
    props: [
      { k: "hill", x: 14, y: 0, w: 30, z: 0.1 },
      { k: "hill", x: 86, y: 0, w: 30, z: 0.1, flip: true },
      { k: "bridge", x: 50, y: 2, w: 46, z: 0.4 },
      { k: "heart", x: 50, y: 40, w: 4, z: 0.5, anim: "float" },
      { k: "person", x: 22, y: 4, w: 5, z: 0.65, tone: "#c06a48" },
      { k: "person", x: 78, y: 4, w: 5, z: 0.65, tone: "#6f8ba6" },
      { k: "tree", x: 8, y: 6, w: 7, z: 0.5, anim: "sway" },
      { k: "tree", x: 93, y: 6, w: 7, z: 0.5, anim: "sway" },
    ],
    hero: { x: 50, y: 22, w: 6.4, z: 0.6, pose: "wave" },
    anchors: { bridge: [50, 54], left: [22, 34], right: [78, 34] },
  },
  "daily-detox": {
    sky: DUSK,
    ground: FLOOR,
    props: [
      { k: "sun", x: 16, y: 56, w: 8, z: 0.15, anim: "float" },
      { k: "sun", x: 32, y: 60, w: 7, z: 0.15, v: "moon", anim: "float" },
      { k: "clock", x: 24, y: 20, w: 9, z: 0.35 },
      { k: "phone", x: 54, y: 8, w: 5, z: 0.55, v: "on", anim: "ring" },
      { k: "bubble", x: 62, y: 40, w: 9, z: 0.6, anim: "float" },
      { k: "board", x: 84, y: 6, w: 15, z: 0.4 },
      { k: "check", x: 84, y: 60, w: 5, z: 0.5, at: 0.55 },
    ],
    hero: { x: 44, y: 4, w: 7.2, z: 0.8, pose: "talk" },
    anchors: { slots: [24, 72], feedback: [60, 58], review: [84, 76] },
  },
  research: {
    sky: INDOOR,
    ground: FLOOR,
    props: [
      { k: "chart", x: 14, y: 6, w: 14, z: 0.4, v: "up" },
      { k: "bubble", x: 36, y: 40, w: 9, z: 0.45, anim: "float" },
      { k: "notes", x: 38, y: 12, w: 10, z: 0.5 },
      { k: "board", x: 64, y: 6, w: 15, z: 0.35 },
      { k: "tag", x: 88, y: 20, w: 8, z: 0.5, anim: "float" },
    ],
    hero: { x: 50, y: 4, w: 7.2, z: 0.8, pose: "stand" },
    anchors: { surveys: [14, 44], interviews: [36, 62], competitors: [64, 52], pricing: [88, 36] },
  },
  design: {
    sky: INDOOR,
    ground: FLOOR,
    props: [
      { k: "board", x: 14, y: 6, w: 14, z: 0.35, v: "flow" },
      { k: "screen", x: 38, y: 10, w: 15, z: 0.45, v: "wire" },
      { k: "notes", x: 62, y: 26, w: 10, z: 0.4 },
      { k: "sparkle", x: 66, y: 60, w: 3, z: 0.3, anim: "float" },
      { k: "screen", x: 86, y: 10, w: 15, z: 0.45, v: "dash" },
    ],
    hero: { x: 56, y: 4, w: 7.2, z: 0.8, pose: "stand" },
    anchors: { flows: [14, 48], wireframes: [38, 44], concepts: [62, 56], hr: [86, 44] },
  },
  voice: {
    sky: DUSK,
    ground: FLOOR,
    props: [
      { k: "mic", x: 34, y: 4, w: 6, z: 0.6 },
      { k: "waves", x: 40, y: 34, w: 6, z: 0.62, tone: "#c06a48" },
      { k: "screen", x: 62, y: 8, w: 17, z: 0.45 },
      { k: "board", x: 86, y: 6, w: 14, z: 0.3 },
    ],
    hero: { x: 24, y: 4, w: 7.4, z: 0.8, pose: "talk" },
    anchors: { mic: [36, 46], screen: [62, 52], board: [86, 52] },
  },
  smaran: {
    sky: ["#d9c7a8", "#efe2c9"],
    ground: FLOOR,
    props: [
      { k: "lamp", x: 32, y: 24, w: 4, z: 0.3 },
      { k: "bed", x: 62, y: 4, w: 30, z: 0.4 },
      { k: "person", x: 52, y: 22, w: 4.2, z: 0.48, v: "lying" },
      { k: "bedside", x: 36, y: 4, w: 8, z: 0.5 },
      { k: "phone", x: 36, y: 15, w: 3.2, z: 0.6, v: "on", anim: "ring" },
      { k: "waves", x: 41, y: 26, w: 5, z: 0.62 },
      { k: "bubble", x: 22, y: 44, w: 9, z: 0.55, tone: "#cfe9e6", anim: "float" },
      { k: "check", x: 82, y: 44, w: 6, z: 0.6, at: 0.55 },
    ],
    hero: { x: 14, y: 4, w: 7.2, z: 0.8, pose: "stand" },
    anchors: { phone: [36, 34], voice: [22, 62], tick: [82, 60] },
  },
  next: {
    // Brighter and warmer than every other chapter: a golden glow.
    sky: GOLDEN,
    ground: FLOOR,
    props: [
      { k: "sun", x: 50, y: 62, w: 16, z: 0.01, anim: "glow" },
      { k: "skyline", x: 50, y: 40, w: 60, z: 0.02 },
      { k: "door", x: 90, y: 4, w: 11, z: 0.7 },
      { k: "sparkle", x: 18, y: 70, w: 3, z: 0.1, anim: "glow" },
      { k: "sparkle", x: 78, y: 78, w: 2.4, z: 0.1, anim: "glow", d: 0.2 },
      ...[0, 1, 2, 3].map((i) => ({
        k: "officeDesk" as const,
        x: 30 + i * 14,
        y: 28,
        w: 9,
        z: 0.2,
        tone: ["#6f8ba6", "#a99bc4", "#c06a48", "#8a9152"][i],
      })),
      ...[0, 1, 2, 3].map((i) => ({
        k: "waves" as const,
        x: 35 + i * 14,
        y: 44,
        w: 3,
        z: 0.22,
        anim: "talk" as const,
        d: i * 0.02,
      })),
      ...[0, 1, 2, 3, 4].map((i) => ({
        k: "officeDesk" as const,
        x: 16 + i * 15,
        y: 6,
        w: 11,
        z: 0.5,
        tone: ["#c06a48", "#d6a33c", "#3d5a45", "#6f8ba6", "#a99bc4"][i],
      })),
      ...[0, 1, 2, 3, 4].map((i) => ({
        k: "waves" as const,
        x: 22 + i * 15,
        y: 24,
        w: 3.5,
        z: 0.52,
        anim: "talk" as const,
        tone: "#c06a48",
      })),
    ],
    // Durgesh at the doorway on the right, looking in at the speaking office.
    hero: { x: 90, y: 4, w: 7.4, z: 0.8, pose: "stand", flip: true },
    anchors: { office: [50, 76] },
  },
};
