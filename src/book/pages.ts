/**
 * Printed paper for each chapter spread, drawn on demand and cached.
 * The back of each page is left for the pop-up world; all printed text sits
 * in the front band (nearest the reader) so the world never covers it.
 * Left page: chapter label, title, short intro. Right page: one key line.
 * Only a few spreads are kept on the GPU at once.
 */
import * as THREE from "three";
import { worldChapters, type Chapter } from "@/content/journey";
import { C, SANS, SERIF, canvas, paperBase, spaced, toTexture } from "./textures";

const PW = 768;
const PH = 1024;
const MARGIN = 64;
const TEXT_W = PW - MARGIN * 2;
/** Top of the printed band (canvas px). Everything above belongs to the world. */
const BAND = 618;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Wrap at the largest size (down to `min`) that fits within `maxLines`. */
function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (px: number) => string,
  start: number,
  min: number,
  maxLines: number,
) {
  let px = start;
  let lines: string[] = [];
  for (; px >= min; px -= 2) {
    ctx.font = font(px);
    lines = wrap(ctx, text, TEXT_W);
    if (lines.length <= maxLines) break;
  }
  return { px: Math.max(px, min), lines: lines.slice(0, maxLines) };
}

/** Faint scored fold lines where the pop-up stands. */
function foldMarks(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(90,80,70,0.1)";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([6, 8]);
  for (let i = 1; i <= 3; i++) {
    const y = 110 + ((BAND - 150) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y);
    ctx.lineTo(PW - MARGIN, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function bandRule(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(160,120,60,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGIN, BAND);
  ctx.lineTo(MARGIN + 90, BAND);
  ctx.stroke();
}

function header(ctx: CanvasRenderingContext2D, text: string, align: "left" | "right") {
  ctx.textAlign = align;
  ctx.fillStyle = "rgba(42,34,27,0.42)";
  spaced(ctx, 5);
  ctx.font = `500 15px ${SANS}`;
  ctx.fillText(text, align === "left" ? MARGIN : PW - MARGIN, 66);
  spaced(ctx, 0);
}

function folio(ctx: CanvasRenderingContext2D, n: number, align: "left" | "right") {
  ctx.textAlign = align;
  ctx.fillStyle = "rgba(42,34,27,0.5)";
  ctx.font = `500 24px ${SERIF}`;
  ctx.fillText(String(n), align === "left" ? MARGIN : PW - MARGIN, PH - 30);
}

function label(ch: Chapter) {
  return ch.pageLabel ?? `CHAPTER ${ch.number}`;
}

function drawLeft(ctx: CanvasRenderingContext2D, ch: Chapter, index: number) {
  paperBase(ctx, PW, PH, false);
  header(ctx, "THE BOOK OF MY JOURNEY", "left");
  foldMarks(ctx);
  bandRule(ctx);
  ctx.textAlign = "left";

  // Large faint chapter numeral where the pop-up will stand.
  ctx.fillStyle = "rgba(192,106,72,0.13)";
  ctx.font = `600 340px ${SERIF}`;
  ctx.fillText(ch.number, MARGIN - 10, BAND - 70);

  ctx.fillStyle = C.terracotta;
  spaced(ctx, 3);
  const lab = fit(ctx, label(ch), (px) => `700 ${px}px ${SANS}`, 21, 14, 1);
  ctx.font = `700 ${lab.px}px ${SANS}`;
  ctx.fillText(lab.lines[0] ?? "", MARGIN, BAND + 46);
  spaced(ctx, 0);

  ctx.fillStyle = C.ink;
  const title = fit(ctx, ch.title, (px) => `600 ${px}px ${SERIF}`, 62, 40, ch.intro ? 2 : 3);
  ctx.font = `600 ${title.px}px ${SERIF}`;
  let y = BAND + 46 + title.px * 1.12;
  title.lines.forEach((l) => {
    ctx.fillText(l, MARGIN, y);
    y += title.px * 1.04;
  });

  if (ch.intro) {
    ctx.fillStyle = "rgba(42,34,27,0.86)";
    const intro = fit(ctx, ch.intro, (px) => `italic 500 ${px}px ${SERIF}`, 34, 24, 3);
    ctx.font = `italic 500 ${intro.px}px ${SERIF}`;
    y += 6;
    intro.lines.forEach((l) => {
      y += intro.px * 1.2;
      ctx.fillText(l, MARGIN, y);
    });
  }
  folio(ctx, index * 2 + 2, "left");
}

function drawRight(ctx: CanvasRenderingContext2D, ch: Chapter, index: number) {
  paperBase(ctx, PW, PH, true);
  header(ctx, (ch.place?.split(" · ").pop() ?? ch.title).toUpperCase(), "right");
  foldMarks(ctx);
  bandRule(ctx);
  const text = ch.quote ?? "";
  ctx.textAlign = "left";

  // Opening quote mark in gold.
  ctx.fillStyle = "rgba(176,128,48,0.7)";
  ctx.font = `600 96px ${SERIF}`;
  ctx.fillText("“", MARGIN - 6, BAND + 92);

  ctx.fillStyle = C.forest;
  const q = fit(ctx, text, (px) => `600 ${px}px ${SERIF}`, 46, 30, 6);
  ctx.font = `600 ${q.px}px ${SERIF}`;
  let y = BAND + 56;
  q.lines.forEach((l) => {
    y += q.px * 1.14;
    ctx.fillText(l, MARGIN + 44, y);
  });
  folio(ctx, index * 2 + 3, "right");
}

const cache = new Map<string, THREE.Texture>();

export function pageTexture(world: number, side: "left" | "right") {
  const key = `${world}-${side}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const ch = worldChapters[world];
  if (!ch) return null;
  const { c, ctx } = canvas(PW, PH);
  if (side === "left") drawLeft(ctx, ch, world);
  else drawRight(ctx, ch, world);
  const t = toTexture(c);
  cache.set(key, t);
  return t;
}

/** Same paper seen from the back of a turning leaf (mirrored UVs). */
const backCache = new Map<string, THREE.Texture>();
export function pageBackTexture(world: number) {
  const key = `${world}`;
  const hit = backCache.get(key);
  if (hit) return hit;
  const base = pageTexture(world, "left");
  if (!base) return null;
  const t = base.clone();
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.x = -1;
  t.offset.x = 1;
  t.needsUpdate = true;
  backCache.set(key, t);
  return t;
}

/** Drop spreads that are far from the one on show. */
export function prunePages(world: number) {
  for (const [key, t] of cache) {
    const w = Number(key.split("-")[0]);
    if (Math.abs(w - world) > 2) {
      t.dispose();
      cache.delete(key);
    }
  }
  for (const [key, t] of backCache) {
    if (Math.abs(Number(key) - world) > 2) {
      t.dispose();
      backCache.delete(key);
    }
  }
}

export function disposeAllPages() {
  cache.forEach((t) => t.dispose());
  backCache.forEach((t) => t.dispose());
  cache.clear();
  backCache.clear();
}
