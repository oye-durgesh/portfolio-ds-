/**
 * The book, drawn with HTML and CSS 3D transforms only (no WebGL), so it
 * opens in every browser. One requestAnimationFrame stepper damps the scroll,
 * derives the beats from the pure timeline, writes them to `worldState`, and
 * pushes them into CSS variables and a single camera transform. React only
 * re-renders when the chapter or page-turn state changes.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { book, travels, worldChapters } from "@/content/journey";
import {
  bookTimeline,
  lerp,
  outroBeats,
  smoothstep,
  storyAt,
  travelBeats,
  WORLD_COUNT,
  worldBeats,
} from "../timeline";
import { scrollState, worldState } from "../scrollState";
import { Cover, Endpaper, LeftPage, RightPage, TitlePage } from "./Pages";
import { World } from "./World";
import { IndiaMapLayer, MetroLayer, routePoint } from "./Journeys";

/** Page size in book pixels; the camera scales the whole book to the screen. */
export const PW = 440;
export const PH = 586;

interface View {
  world: number;
  turned: boolean;
  turning: boolean;
  travel: number;
}

/** Side-panel footprint (left, right) in px, matching ChapterPanels' breakpoints. */
function panelInsets(vw: number): [number, number] {
  if (vw >= 1280) return [32 + 320 + 24, 32 + 296 + 24];
  if (vw >= 1024) return [24 + 272 + 20, 24 + 256 + 20];
  return [16 + 216 + 12, 16 + 200 + 12];
}

export function BookStage({ onReady }: { onReady: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const bookEl = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ world: -1, turned: false, turning: false, travel: -1 });
  const viewRef = useRef(view);

  useEffect(() => {
    if (import.meta.env.DEV)
      (window as unknown as { __book: unknown }).__book = { scrollState, worldState };

    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    let last = performance.now();
    const px = { x: 0, y: 0 };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = scrollState;
      const calm = s.reducedMotion;
      s.smooth = calm ? s.target : s.smooth + (s.target - s.smooth) * (1 - Math.exp(-4.5 * dt));
      if (Math.abs(s.target - s.smooth) < 1e-5) s.smooth = s.target;

      const pos = storyAt(s.smooth);
      const intro = pos.world < 0;
      const b = worldBeats(pos.local, pos.world === WORLD_COUNT - 1);
      const ib = bookTimeline(pos.intro);
      const ob = outroBeats(pos.outro);
      const tb = travelBeats(pos.travelP);
      const leg = pos.travel >= 0 ? travels[pos.travel] : undefined;
      const overMap = !!leg && leg.mode !== "metro";

      const W = worldState;
      W.world = pos.world;
      W.local = pos.local;
      W.turn = intro ? 0 : b.turn;
      W.read = intro ? 0 : b.read;
      W.readPan = intro ? 0 : b.readPan;
      W.rise = intro ? 0 : b.rise * (1 - ob.sink);
      W.hold = b.hold;
      W.zoom = intro ? 0 : b.zoom * (1 - ob.sink);
      W.close = ob.close;
      W.pull = ob.pull;
      W.pullBack = 0;
      W.travel = pos.travel;
      W.travelP = pos.travelP;
      W.map = overMap ? tb.map : 0;
      W.bookScale = overMap ? tb.bookScale : 1;
      W.time = calm ? 0 : now / 1000;

      const open = pos.outro > 0 ? 1 - ob.close : ib.open;

      // ---- camera: scale s maps book px → screen px; focus (fx, fy) lands at (tx, ty).
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const portrait = vw / vh < 0.9;
      const md = vw >= 768;
      const closedFit = Math.min((0.62 * vw) / PW, (0.62 * vh) / PH);
      const spreadFit = Math.min((0.94 * vw) / (2 * PW), (0.64 * vh) / PH);
      let sc: number;
      let fx = 0;
      let fy = 0;
      let tx = 0;
      let ty = 0;
      if (intro) {
        sc = lerp(closedFit * lerp(0.86, 1, ib.approach), spreadFit, ib.settle);
        fx = (PW / 2) * (1 - open);
      } else {
        sc = spreadFit;
        if (W.read > 0) {
          const readFit = portrait
            ? (0.94 * vw) / PW
            : Math.min((0.9 * vw) / (2 * PW), (0.8 * vh) / (PH * 0.5), spreadFit * 1.9);
          const panX = portrait ? lerp(-PW / 2, PW / 2, smoothstep(0.35, 0.65, W.readPan)) : 0;
          sc = lerp(sc, readFit, W.read);
          fx = lerp(fx, panX, W.read);
          fy = lerp(fy, PH * 0.27, W.read);
        }
        if (W.zoom > 0) {
          let wf: number;
          let cx = 0;
          let cy = 0;
          if (md) {
            const [L, R] = panelInsets(vw);
            wf = Math.min((vw - L - R) / (2 * PW * 0.96), (vh - 170) / (PH * 1.36));
            cx = (L - R) / 2;
            cy = 8;
          } else {
            wf = Math.min((0.98 * vw) / (2 * PW * 0.94), (0.5 * vh) / (PH * 1.36));
            cy = vh * 0.03;
          }
          sc = lerp(sc, wf, W.zoom);
          fx = lerp(fx, 0, W.zoom);
          fy = lerp(fy, -PH * 0.18, W.zoom);
          tx = lerp(tx, cx, W.zoom);
          ty = lerp(ty, cy, W.zoom);
        }
        if (pos.outro > 0) {
          const k = Math.min(1, ob.close * 1.6);
          sc = lerp(sc, spreadFit, k);
          fy = lerp(fy, 0, k);
          tx = lerp(tx, 0, k);
          ty = lerp(ty, 0, k);
          fx = lerp(fx, PW / 2, ob.close);
          sc = lerp(sc, closedFit * 0.8, ob.pull);
        }
        sc *= W.bookScale;
      }

      // Soft pointer parallax shows off the depth of the pop-ups.
      px.x += ((calm ? 0 : pointer.x) - px.x) * (1 - Math.exp(-3 * dt));
      px.y += ((calm ? 0 : pointer.y) - px.y) * (1 - Math.exp(-3 * dt));
      const bob = calm ? 0 : (1 - open) * Math.sin((now / 1000) * 1.1) * 6;
      const tilt = intro ? ib.approach : 1 - ob.pull * 0.6;
      const rx = 12 * tilt - px.y * 2.5;
      const ry = -3 * tilt + px.x * 3.5;

      if (camera.current)
        camera.current.style.transform = `translate3d(${(tx - fx * sc).toFixed(2)}px, ${(ty - fy * sc + bob).toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
      if (bookEl.current)
        bookEl.current.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

      const r = root.current;
      if (r) {
        const st = r.style;
        st.setProperty("--open", open.toFixed(4));
        st.setProperty("--turn", W.turn.toFixed(4));
        st.setProperty("--rise", W.rise.toFixed(4));
        st.setProperty("--hold", W.hold.toFixed(4));
        st.setProperty("--glow", (intro ? ib.glow : 0).toFixed(3));
        st.setProperty("--map", W.map.toFixed(4));
        st.setProperty("--book", smoothstep(0.04, 0.3, W.bookScale).toFixed(3));
        st.setProperty("--route", tb.route.toFixed(4));
        st.setProperty("--move", tb.move.toFixed(4));
        st.setProperty(
          "--metro",
          (leg?.mode === "metro"
            ? smoothstep(0, 0.16, pos.travelP) * (1 - smoothstep(0.84, 1, pos.travelP))
            : 0
          ).toFixed(3),
        );
        st.setProperty("--inv", (1 / Math.max(0.05, sc)).toFixed(4));
        const labels = pos.travel < 0 && W.rise > 0.92 && W.zoom > 0.6;
        st.setProperty("--labels", labels ? "1" : "0");
        if (overMap && leg) {
          const p = routePoint(leg, tb.move);
          st.setProperty("--vx", p.x.toFixed(1));
          st.setProperty("--vy", p.y.toFixed(1));
          st.setProperty("--va", p.angle.toFixed(1));
        }
      }

      const next: View = {
        world: pos.world,
        turned: W.turn >= 0.999,
        turning: pos.world >= 0 && W.turn > 0.001 && W.turn < 0.999,
        travel: pos.travel,
      };
      const v = viewRef.current;
      if (
        v.world !== next.world ||
        v.turned !== next.turned ||
        v.turning !== next.turning ||
        v.travel !== next.travel
      ) {
        viewRef.current = next;
        setView(next);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    let alive = true;
    const fonts = document.fonts?.ready ?? Promise.resolve();
    void fonts.then(() => {
      if (!alive) return;
      requestAnimationFrame(() => requestAnimationFrame(() => alive && onReady()));
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [onReady]);

  const w = view.world;
  const ch = w >= 0 ? worldChapters[w] : undefined;
  const prev = w > 0 ? worldChapters[w - 1] : undefined;
  const underLeft = ch && view.turned ? { c: ch, i: w } : prev ? { c: prev, i: w - 1 } : undefined;

  return (
    <div
      ref={root}
      className="bk-stage bg-walnut"
      style={{ "--pw": `${PW}px`, "--ph": `${PH}px` } as CSSProperties}
      role="img"
      aria-label={`An open storybook: ${book.title}`}
    >
      <div className="bk-pool" aria-hidden />
      <div ref={camera} className="bk-camera" style={{ width: PW * 2, height: PH }}>
        <div ref={bookEl} className="bk-book">
          {/* Back board and right page stack */}
          <div className="bk-board bk-board-back" />
          <div className="bk-spine" />
          <div className="bk-stack bk-stack-right">
            {ch ? <RightPage ch={ch} index={w} /> : <TitlePage />}
          </div>
          <div className="bk-glow" aria-hidden />

          {/* Front board on its hinge; the left page stack rides on its inside */}
          <div className="bk-cover">
            <div className="bk-face">
              <Cover />
            </div>
            <div className="bk-face bk-face-back bk-cloth-in">
              <Endpaper />
              {underLeft && (
                <div className="bk-stack bk-stack-left">
                  <LeftPage ch={underLeft.c} index={underLeft.i} />
                </div>
              )}
            </div>
          </div>

          {/* The page being turned */}
          {view.turning && ch && (
            <div className="bk-leaf">
              <div className="bk-face">
                {prev ? <RightPage ch={prev} index={w - 1} /> : <TitlePage />}
                <div className="bk-leaf-shade" />
              </div>
              <div className="bk-face bk-face-back">
                <LeftPage ch={ch} index={w} />
                <div className="bk-leaf-shade" />
              </div>
            </div>
          )}

          {ch && <World key={ch.id} chapter={ch} />}
          {view.travel >= 0 && travels[view.travel]?.mode === "metro" && <MetroLayer />}
        </div>
      </div>
      <IndiaMapLayer leg={view.travel} />
    </div>
  );
}
