/**
 * Hand-drawn canvas textures for the physical book: cloth cover with gold
 * foil, spine, endpapers, title page, page edges and the walnut table.
 * Browser-only: call from an effect.
 */
import * as THREE from "three";

export const SERIF = '"Cormorant Garamond", Georgia, serif';
export const SANS = '"Figtree", system-ui, sans-serif';
export const HAND = '"Caveat", cursive';

export const C = {
  cloth: "#2b4535",
  clothDeep: "#1f3428",
  gold: "#d6b061",
  ivory: "#f3ead6",
  paper: "#efe4cb",
  ink: "#2a221b",
  forest: "#2f4a3a",
  terracotta: "#b8603f",
  olive: "#7d8550",
  dusty: "#64809a",
  mustard: "#c9982f",
};

export async function loadBookFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  const wanted = [
    `600 64px ${SERIF}`,
    `italic 500 64px ${SERIF}`,
    `500 40px ${HAND}`,
    `500 24px ${SANS}`,
  ];
  await Promise.race([
    Promise.all(wanted.map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
}

export function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

export function toTexture(c: HTMLCanvasElement, color = true) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

export function spaced(ctx: CanvasRenderingContext2D, px: number) {
  // letterSpacing is supported in Chromium/Firefox/Safari 17+
  (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
}

export function noise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  n: number,
  alpha: number,
  light = "255,255,255",
  dark = "0,0,0",
) {
  for (let i = 0; i < n; i++) {
    const rgb = Math.random() > 0.5 ? light : dark;
    ctx.fillStyle = `rgba(${rgb},${Math.random() * alpha})`;
    ctx.fillRect(
      Math.random() * w,
      Math.random() * h,
      1 + Math.random() * 2,
      1 + Math.random() * 2,
    );
  }
}

function weave(ctx: CanvasRenderingContext2D, w: number, h: number, strength = 1) {
  for (let y = 0; y < h; y += 3) {
    ctx.fillStyle = `rgba(0,0,0,${(0.05 + Math.random() * 0.05) * strength})`;
    ctx.fillRect(0, y, w, 1);
  }
  for (let x = 0; x < w; x += 3) {
    ctx.fillStyle = `rgba(255,255,255,${(0.02 + Math.random() * 0.03) * strength})`;
    ctx.fillRect(x, 0, 1, h);
  }
  noise(ctx, w, h, w * h * 0.04, 0.08 * strength);
}

/* ---------------------------------------------------------------- cover */

type Ink = { base: string; gold: string; label: string; texture: boolean };

const COVER_W = 1024;
const COVER_H = 1366;

function drawCover(ctx: CanvasRenderingContext2D, ink: Ink) {
  const w = COVER_W;
  const h = COVER_H;
  ctx.fillStyle = ink.base;
  ctx.fillRect(0, 0, w, h);
  if (ink.texture) weave(ctx, w, h);

  ctx.strokeStyle = ink.gold;
  ctx.fillStyle = ink.gold;

  // Double frame + corner diamonds
  ctx.lineWidth = 5;
  ctx.strokeRect(58, 58, w - 116, h - 116);
  ctx.lineWidth = 1.6;
  ctx.strokeRect(76, 76, w - 152, h - 152);
  for (const [x, y] of [
    [58, 58],
    [w - 58, 58],
    [58, h - 58],
    [w - 58, h - 58],
  ] as const) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-11, -11, 22, 22);
    ctx.restore();
  }

  // Title
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  spaced(ctx, 14);
  ctx.font = `600 50px ${SERIF}`;
  ctx.fillText("THE BOOK OF", w / 2 + 7, 236);
  spaced(ctx, 6);
  ctx.font = `600 122px ${SERIF}`;
  ctx.fillText("MY JOURNEY", w / 2 + 3, 366);

  // Rule with diamond
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 170, 420);
  ctx.lineTo(w / 2 - 18, 420);
  ctx.moveTo(w / 2 + 18, 420);
  ctx.lineTo(w / 2 + 170, 420);
  ctx.stroke();
  ctx.save();
  ctx.translate(w / 2, 420);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();

  drawRoute(ctx, ink);

  // Author + subtitle
  spaced(ctx, 12);
  ctx.font = `600 48px ${SERIF}`;
  ctx.fillText("DURGESH SHUKLA", w / 2 + 6, 1136);
  spaced(ctx, 6);
  ctx.font = `500 22px ${SANS}`;
  ctx.fillText("A LIFE BUILT ONE PAGE AT A TIME", w / 2 + 3, 1196);
  spaced(ctx, 0);
}

/** Subtle miniature route: rail Kanpur → Greater Noida, road to Noida, flight to Bengaluru. */
function drawRoute(ctx: CanvasRenderingContext2D, ink: Ink) {
  const kanpur = { x: 700, y: 600 };
  const gnoida = { x: 380, y: 560 };
  const noida = { x: 300, y: 690 };
  const blr = { x: 600, y: 965 };
  const ctrl = { x: 560, y: 470 };

  const q = (t: number) => ({
    x: (1 - t) ** 2 * kanpur.x + 2 * (1 - t) * t * ctrl.x + t * t * gnoida.x,
    y: (1 - t) ** 2 * kanpur.y + 2 * (1 - t) * t * ctrl.y + t * t * gnoida.y,
  });

  ctx.strokeStyle = ink.gold;
  ctx.fillStyle = ink.gold;

  // Rails: two offset curves + sleepers
  ctx.lineWidth = 2;
  for (const off of [-5, 5]) {
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const a = q(Math.max(0, t - 0.01));
      const b = q(Math.min(1, t + 0.01));
      const nx = -(b.y - a.y);
      const ny = b.x - a.x;
      const l = Math.hypot(nx, ny) || 1;
      const p = q(t);
      const x = p.x + (nx / l) * off;
      const y = p.y + (ny / l) * off;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.lineWidth = 2;
  for (let i = 1; i < 40; i++) {
    const t = i / 40;
    const a = q(t - 0.01);
    const b = q(t + 0.01);
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const p = q(t);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(0, 9);
    ctx.stroke();
    ctx.restore();
  }

  // Tiny train riding the rails
  {
    const t = 0.42;
    const a = q(t - 0.01);
    const b = q(t + 0.01);
    const p = q(t);
    ctx.save();
    ctx.translate(p.x, p.y - 12);
    ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
    const box = (x: number, wd: number, ht: number) => {
      ctx.beginPath();
      ctx.roundRect(x, -ht, wd, ht, 4);
      ctx.fill();
    };
    box(-58, 34, 18);
    box(-20, 34, 18);
    box(18, 30, 22);
    ctx.fillRect(38, -32, 6, 10); // chimney
    ctx.restore();
  }

  // Road to Noida (solid, slightly wavy)
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(gnoida.x, gnoida.y);
  ctx.bezierCurveTo(330, 600, 360, 640, noida.x, noida.y);
  ctx.stroke();

  // Auto-rickshaw silhouette
  ctx.save();
  ctx.translate(250, 600);
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(-22, -18);
  ctx.quadraticCurveTo(-20, -30, -4, -30);
  ctx.lineTo(18, -30);
  ctx.quadraticCurveTo(26, -26, 26, -10);
  ctx.lineTo(26, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ink.base;
  ctx.fillRect(-14, -24, 14, 10);
  ctx.fillStyle = ink.gold;
  for (const x of [-14, 18]) {
    ctx.beginPath();
    ctx.arc(x, 3, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Flight path to Bengaluru (dashed arc)
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(noida.x, noida.y);
  ctx.quadraticCurveTo(250, 920, blr.x, blr.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Paper plane on the arc
  ctx.save();
  ctx.translate(318, 880);
  ctx.rotate(0.55);
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-14, -11);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-14, 11);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // City markers + labels
  const city = (
    pt: { x: number; y: number },
    label: string,
    dx: number,
    dy: number,
    align: CanvasTextAlign,
  ) => {
    ctx.fillStyle = ink.gold;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ink.label;
    ctx.textAlign = align;
    spaced(ctx, 5);
    ctx.font = `600 24px ${SANS}`;
    ctx.fillText(label, pt.x + dx, pt.y + dy);
  };
  city(kanpur, "KANPUR", 30, 8, "left");
  city(gnoida, "GREATER NOIDA", 0, -32, "center");
  city(noida, "NOIDA", -30, 8, "right");
  city(blr, "BENGALURU", 30, 8, "left");
  ctx.textAlign = "center";
  spaced(ctx, 0);
}

/* ---------------------------------------------------------------- spine */

function drawSpine(ctx: CanvasRenderingContext2D, w: number, h: number, ink: Ink) {
  ctx.fillStyle = ink.base;
  ctx.fillRect(0, 0, w, h);
  if (ink.texture) weave(ctx, w, h);
  ctx.fillStyle = ink.gold;
  ctx.strokeStyle = ink.gold;
  // Raised bands
  for (const y of [70, 92, h - 92, h - 70]) ctx.fillRect(0, y, w, 4);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  // Glyph tops face the front cover; text reads head → tail.
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  spaced(ctx, 10);
  ctx.font = `600 64px ${SERIF}`;
  ctx.fillText("THE BOOK OF MY JOURNEY", -110, 2);
  spaced(ctx, 6);
  ctx.font = `600 34px ${SANS}`;
  ctx.fillText("D. SHUKLA", 470, 4);
  ctx.restore();
  spaced(ctx, 0);
}

/* ------------------------------------------------------------ endpaper */

function drawEndpaper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#e9dcbd";
  ctx.fillRect(0, 0, w, h);
  noise(ctx, w, h, w * h * 0.05, 0.06, "255,250,235", "90,60,30");

  // Repeating motif: leaf, star, tiny train car
  const motifs = [C.olive, C.terracotta, C.dusty];
  let k = 0;
  for (let y = 40; y < h; y += 92) {
    for (let x = (y / 92) % 2 ? 40 : 86; x < w; x += 92) {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = motifs[k % 3]!;
      ctx.strokeStyle = motifs[k % 3]!;
      const m = k % 3;
      if (m === 0) {
        ctx.rotate(0.6);
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (m === 1) {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const r = i % 2 ? 4 : 11;
          const a = (i / 8) * Math.PI * 2;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(-14, -7, 28, 12, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-7, 7, 3, 0, Math.PI * 2);
        ctx.arc(7, 7, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      k++;
    }
  }
  ctx.globalAlpha = 1;

  // Ex libris plate
  const pw = 520;
  const ph = 380;
  const px = (w - pw) / 2;
  const py = (h - ph) / 2;
  ctx.fillStyle = C.ivory;
  ctx.shadowColor = "rgba(60,40,20,0.25)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 14);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = C.terracotta;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px + 16, py + 16, pw - 32, ph - 32, 8);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = C.terracotta;
  spaced(ctx, 8);
  ctx.font = `500 20px ${SANS}`;
  ctx.fillText("THIS BOOK BELONGS TO", w / 2 + 4, py + 92);
  spaced(ctx, 0);
  ctx.fillStyle = C.ink;
  ctx.font = `italic 500 64px ${SERIF}`;
  ctx.fillText("Ex Libris", w / 2, py + 180);
  ctx.fillStyle = C.forest;
  ctx.font = `600 76px ${HAND}`;
  ctx.fillText("Durgesh Shukla", w / 2, py + 280);
}

/* ---------------------------------------------------------- title page */

export function paperBase(ctx: CanvasRenderingContext2D, w: number, h: number, gutterLeft = true) {
  ctx.fillStyle = C.ivory;
  ctx.fillRect(0, 0, w, h);
  noise(ctx, w, h, w * h * 0.06, 0.05, "255,255,250", "120,90,50");
  // Fibres
  for (let i = 0; i < 260; i++) {
    ctx.strokeStyle = `rgba(150,120,80,${Math.random() * 0.06})`;
    ctx.lineWidth = 0.8;
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.random() * 20 - 10,
      y + Math.random() * 20 - 10,
      x + Math.random() * 30 - 15,
      y + Math.random() * 30 - 15,
    );
    ctx.stroke();
  }
  // Gutter shading
  const g = ctx.createLinearGradient(gutterLeft ? 0 : w, 0, gutterLeft ? 140 : w - 140, 0);
  g.addColorStop(0, "rgba(110,80,40,0.28)");
  g.addColorStop(1, "rgba(110,80,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawTitlePage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  paperBase(ctx, w, h);
  ctx.textAlign = "center";

  ctx.fillStyle = C.terracotta;
  spaced(ctx, 9);
  ctx.font = `500 22px ${SANS}`;
  ctx.fillText("PROLOGUE", w / 2 + 4, 270);
  spaced(ctx, 0);

  ctx.strokeStyle = C.terracotta;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 60, 310);
  ctx.lineTo(w / 2 + 60, 310);
  ctx.stroke();

  ctx.fillStyle = C.ink;
  ctx.font = `italic 500 70px ${SERIF}`;
  ctx.fillText("I don't have everything", w / 2, 450);
  ctx.fillText("figured out.", w / 2, 530);
  ctx.fillStyle = C.forest;
  ctx.font = `italic 600 70px ${SERIF}`;
  ctx.fillText("I just don't stop", w / 2, 660);
  ctx.fillText("figuring things out.", w / 2, 740);

  ctx.fillStyle = C.ink;
  ctx.font = `500 56px ${HAND}`;
  ctx.fillText("— Durgesh", w / 2 + 150, 840);

  // Pencil doodle: dotted path toward the next chapter
  ctx.save();
  ctx.translate(0, 0);
  ctx.strokeStyle = "rgba(70,70,80,0.55)";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([3, 10]);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(250, 1060);
  ctx.bezierCurveTo(380, 980, 560, 1130, 760, 1040);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(760, 1040);
  ctx.lineTo(738, 1034);
  ctx.moveTo(760, 1040);
  ctx.lineTo(748, 1058);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = C.dusty;
  ctx.font = `500 44px ${HAND}`;
  ctx.save();
  ctx.translate(w / 2, 1150);
  ctx.rotate(-0.03);
  ctx.fillText("next stop: Kanpur, where it began", 0, 0);
  ctx.restore();

  ctx.fillStyle = "rgba(42,34,27,0.6)";
  ctx.font = `italic 500 34px ${SERIF}`;
  ctx.fillText("i", w / 2, h - 80);
}

/* ---------------------------------------------------------- page edges */

function drawPageEdges(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2 + Math.random() * 2.5) {
    const shade = Math.random();
    ctx.fillStyle =
      shade > 0.6
        ? `rgba(120,95,60,${0.1 + Math.random() * 0.18})`
        : `rgba(255,252,240,${0.2 + Math.random() * 0.3})`;
    ctx.fillRect(0, y, w, 1 + Math.random());
  }
  noise(ctx, w, h, w * h * 0.02, 0.06, "255,255,250", "100,80,50");
}

/* ---------------------------------------------------------------- wood */

function drawWood(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#3b2a1d";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 220; i++) {
    const y0 = Math.random() * h;
    const amp = 4 + Math.random() * 16;
    const freq = 0.004 + Math.random() * 0.01;
    const phase = Math.random() * 10;
    const dark = Math.random() > 0.45;
    ctx.strokeStyle = dark
      ? `rgba(25,14,8,${0.15 + Math.random() * 0.3})`
      : `rgba(150,105,65,${0.06 + Math.random() * 0.14})`;
    ctx.lineWidth = 0.6 + Math.random() * 2.4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = y0 + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1) * amp * 0.25;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  noise(ctx, w, h, w * h * 0.03, 0.08, "200,150,100", "0,0,0");
}

/* ------------------------------------------------------------- builder */

export interface BookTextures {
  coverMap: THREE.Texture;
  coverRough: THREE.Texture;
  coverMetal: THREE.Texture;
  coverBump: THREE.Texture;
  spineMap: THREE.Texture;
  spineRough: THREE.Texture;
  spineMetal: THREE.Texture;
  cloth: THREE.Texture;
  endpaper: THREE.Texture;
  titlePage: THREE.Texture;
  pageEdge: THREE.Texture;
  wood: THREE.Texture;
}

export function buildBookTextures(): BookTextures {
  const color: Ink = { base: C.cloth, gold: C.gold, label: C.gold, texture: true };
  const rough: Ink = { base: "#e0e0e0", gold: "#555555", label: "#555555", texture: false };
  const metal: Ink = { base: "#000000", gold: "#ffffff", label: "#ffffff", texture: false };
  const bump: Ink = { base: "#a0a0a0", gold: "#5a5a5a", label: "#5a5a5a", texture: true };

  const make = (ink: Ink, isColor: boolean) => {
    const { c, ctx } = canvas(COVER_W, COVER_H);
    drawCover(ctx, ink);
    return toTexture(c, isColor);
  };

  const spine = (ink: Ink, isColor: boolean) => {
    const { c, ctx } = canvas(256, 1366);
    drawSpine(ctx, 256, 1366, ink);
    return toTexture(c, isColor);
  };

  const cloth = (() => {
    const { c, ctx } = canvas(512, 512);
    ctx.fillStyle = C.cloth;
    ctx.fillRect(0, 0, 512, 512);
    weave(ctx, 512, 512);
    const t = toTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  })();

  const endpaper = (() => {
    const { c, ctx } = canvas(1024, 1366);
    drawEndpaper(ctx, 1024, 1366);
    const t = toTexture(c);
    // The inside board is seen after a 180° flip: rotate so it reads upright.
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI;
    return t;
  })();

  const titlePage = (() => {
    const { c, ctx } = canvas(1024, 1366);
    drawTitlePage(ctx, 1024, 1366);
    return toTexture(c);
  })();

  const pageEdge = (() => {
    const { c, ctx } = canvas(1024, 256);
    drawPageEdges(ctx, 1024, 256);
    return toTexture(c);
  })();

  const wood = (() => {
    const { c, ctx } = canvas(1024, 1024);
    drawWood(ctx, 1024, 1024);
    const t = toTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(18, 18);
    return t;
  })();

  return {
    coverMap: make(color, true),
    coverRough: make(rough, false),
    coverMetal: make(metal, false),
    coverBump: make(bump, false),
    spineMap: spine(color, true),
    spineRough: spine(rough, false),
    spineMetal: spine(metal, false),
    cloth,
    endpaper,
    titlePage,
    pageEdge,
    wood,
  };
}

export function disposeBookTextures(t: BookTextures) {
  Object.values(t).forEach((tex) => tex.dispose());
}
