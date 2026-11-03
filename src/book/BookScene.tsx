import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Book } from "./Book";
import {
  bookTimeline,
  lerp,
  outroBeats,
  smoothstep,
  storyAt,
  travelBeats,
  WORLD_COUNT,
  worldBeats,
} from "./timeline";
import { scrollState, worldState } from "./scrollState";
import { WorldStage } from "./world/WorldStage";
import { IndiaMap } from "./map/IndiaMap";
import { CITY_COORDS } from "./map/geo";
import { disposeAllPages } from "./pages";
import { travels } from "@/content/journey";
import {
  buildBookTextures,
  disposeBookTextures,
  loadBookFonts,
  type BookTextures,
} from "./textures";

const ROOM = "#15110d";

/** The single stepper: damps scroll and derives world beats before anything reads them. */
function Stepper() {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = scrollState;
    s.smooth = s.reducedMotion
      ? s.target
      : s.smooth + (s.target - s.smooth) * (1 - Math.exp(-4.5 * dt));
    const pos = storyAt(s.smooth);
    const b = worldBeats(pos.local, pos.world === WORLD_COUNT - 1);
    const intro = pos.world < 0;
    worldState.world = pos.world;
    worldState.local = pos.local;
    worldState.turn = intro ? 0 : b.turn;
    worldState.read = intro ? 0 : b.read;
    worldState.readPan = intro ? 0 : b.readPan;
    const ob = outroBeats(pos.outro);
    worldState.rise = intro ? 0 : b.rise * (1 - ob.sink);
    worldState.hold = b.hold;
    worldState.zoom = intro ? 0 : b.zoom * (1 - ob.sink);
    worldState.close = ob.close;
    worldState.pull = ob.pull;
    worldState.pullBack = intro ? 0 : b.pullBack;
    worldState.travel = pos.travel;
    worldState.travelP = pos.travelP;
    const tb = travelBeats(pos.travelP);
    // The metro ride plays on the book's own pages; the others fly over the India map.
    const overMap = pos.travel >= 0 && travels[pos.travel]?.mode !== "metro";
    worldState.map = overMap ? tb.map : 0;
    worldState.bookScale = overMap ? tb.bookScale : 1;
    worldState.time = s.reducedMotion ? 0 : state.clock.elapsedTime;
  });
  return null;
}

type V3 = [number, number, number];
type Shot = { pos: V3; tgt: V3 };
const SHOTS: Record<
  "top" | "far" | "near" | "spread" | "read" | "close" | "final" | "map" | "closed",
  Shot
> = {
  /** Straight down onto the closed cover — the first thing a visitor sees. */
  top: { pos: [0, 10.4, 1.1], tgt: [0, 0.3, -0.3] },
  far: { pos: [-4.5, 3.6, 6.3], tgt: [0, 0.3, 0] },
  near: { pos: [-3.2, 3.6, 5.1], tgt: [0, 0.35, 0.1] },
  spread: { pos: [0, 8.2, 5.4], tgt: [0, 0.2, 0.3] },
  /** Top-down onto the printed band of the spread. */
  read: { pos: [0, 7.6, 4.75], tgt: [0, 0.4, 1.0] },
  close: { pos: [0, 6.0, 6.3], tgt: [0, 0.6, -0.6] },
  final: { pos: [0, 11, 8.8], tgt: [0, 0.2, 0] },
  /** High above the India map, following the vehicle at the origin. */
  map: { pos: [0, 15.5, 8.2], tgt: [0, 0, -0.6] },
  /** After the last chapter: pulled back and up over the closed book. */
  closed: { pos: [0, 9.6, 5.6], tgt: [0, 0.2, 0.9] },
};

const tmp = new THREE.Vector3();
const setShot = (p: THREE.Vector3, t: THREE.Vector3, s: Shot) => {
  p.set(...s.pos);
  t.set(...s.tgt);
};
const mixShot = (p: THREE.Vector3, t: THREE.Vector3, s: Shot, k: number) => {
  p.lerp(tmp.set(...s.pos), k);
  t.lerp(tmp.set(...s.tgt), k);
};

function CameraRig() {
  const pos = useRef(new THREE.Vector3());
  const tgt = useRef(new THREE.Vector3());
  useFrame((state) => {
    const aspect = state.size.width / state.size.height;
    const portrait = aspect < 0.9;
    const w = worldState.world;
    const p = pos.current;
    const t = tgt.current;
    let fit: number;
    if (w < 0) {
      const { approach, settle } = bookTimeline(storyAt(scrollState.smooth).intro);
      // Top view of the cover → the camera comes down as the cover lifts → open spread.
      setShot(p, t, SHOTS.top);
      mixShot(p, t, SHOTS.near, approach);
      mixShot(p, t, SHOTS.spread, settle);
      const coverFit = lerp(Math.max(1, 0.82 / aspect), Math.max(1, 1.05 / aspect), approach);
      fit = lerp(coverFit, Math.max(1, 1.5 / aspect), settle);
    } else {
      const { read, readPan, zoom: z, pullBack: pb, hold } = worldState;

      // 1. Open spread → 2. read the printed band → 3. into the world.
      setShot(p, t, SHOTS.spread);
      let f = Math.max(1, 1.5 / aspect);
      if (read > 0) {
        mixShot(p, t, SHOTS.read, read);
        // On tall screens read one page at a time, panning left → right.
        const panX = portrait ? lerp(-1.45, 1.45, smoothstep(0.35, 0.65, readPan)) * read : 0;
        p.x += panX;
        t.x += panX;
        f = lerp(f, portrait ? Math.max(1, 0.76 / aspect) : Math.max(1, 1.55 / aspect), read);
      }

      mixShot(p, t, SHOTS.close, z);
      // Gentle orbit, alternating sides chapter to chapter.
      const side = w % 2 ? 1 : -1;
      p.x += side * z * (0.35 + Math.sin(hold * Math.PI) * 0.35);
      // Wide screens: frame the world between the two side panels, a little high.
      // With the side panels on show (tablet and up), pull back so the world sits between them.
      const panels = state.size.width >= 768 ? (state.size.width < 1100 ? 1.42 : 1.26) : 1;
      f = lerp(f, Math.max(1, 1.25 / aspect) * panels, z);

      if (pb > 0) {
        mixShot(p, t, SHOTS.final, pb);
        f = lerp(f, Math.max(1, 1.5 / aspect), pb);
      }

      // India-map journey: rise high above the map, then dive back to the book.
      if (worldState.travel >= 0) {
        const tb = travelBeats(worldState.travelP);
        const m = worldState.map;
        mixShot(p, t, SHOTS.map, m);
        const leg = travels[worldState.travel];
        // Long legs (the plane, or the train down to Bengaluru) climb higher to show India.
        const long =
          !!leg &&
          (leg.mode === "plane" ||
            Math.abs((CITY_COORDS[leg.from]?.[1] ?? 0) - (CITY_COORDS[leg.to]?.[1] ?? 0)) > 8);
        p.y += Math.sin(tb.move * Math.PI) * m * (long ? 4.5 : 0.6);
        p.z += Math.sin(tb.move * Math.PI) * m * (long ? 2.2 : 0.3);
        f = lerp(f, Math.max(1, 1.2 / aspect), m);
      }
      // The book closes after the last chapter: back to the spread, then pull away.
      if (worldState.close > 0 || worldState.pull > 0) {
        const sink = Math.min(1, worldState.close * 2);
        mixShot(p, t, SHOTS.spread, sink);
        f = lerp(f, Math.max(1, 1.5 / aspect), sink);
        mixShot(p, t, SHOTS.closed, worldState.pull);
        f = lerp(f, Math.max(1, 0.95 / aspect), worldState.pull);
      }
      fit = f;
    }

    // Pull back on tall screens so the subject fits.
    p.sub(t).multiplyScalar(fit).add(t);

    if (!scrollState.reducedMotion) {
      p.x += state.pointer.x * 0.2;
      p.y += state.pointer.y * 0.12;
    }

    state.camera.position.copy(p);
    state.camera.lookAt(t);
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      fog.near = 11 * fit + 14 * worldState.map;
      fog.far = 24 * fit + 26 * worldState.map;
    }
  });
  return null;
}

/** Warm key light with a barely-there flicker (off with reduced motion). */
function KeyLight() {
  const l = useRef<THREE.SpotLight>(null!);
  useFrame(() => {
    l.current.intensity =
      190 * (1 - (scrollState.reducedMotion ? 0 : 0.01 + 0.01 * Math.sin(worldState.time * 1.57)));
  });
  return (
    <spotLight
      ref={l}
      position={[-3.5, 9, 5]}
      angle={0.55}
      penumbra={0.85}
      intensity={190}
      color="#ffe2b8"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-radius={6}
    />
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onReady);
  });
  return null;
}

/** Scales the book (and its world) down into the map during a journey. */
function BookRig({ children }: { children: ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    const k = worldState.bookScale;
    g.current.scale.setScalar(k);
    g.current.visible = k > 0.08;
  });
  return <group ref={g}>{children}</group>;
}

function Table({ wood }: { wood: THREE.Texture }) {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial map={wood} roughness={0.72} color="#d9bfa3" />
    </mesh>
  );
}

export default function BookScene({ onReady }: { onReady: () => void }) {
  const [tex, setTex] = useState<BookTextures | null>(null);

  useEffect(() => {
    // Dev-only handle for scripted checks: snap the book to the scroll position.
    if (import.meta.env.DEV)
      (window as unknown as { __book: unknown }).__book = { scrollState, worldState };
  }, []);

  useEffect(() => {
    let alive = true;
    let built: BookTextures | null = null;
    loadBookFonts().then(() => {
      if (!alive) return;
      built = buildBookTextures();
      setTex(built);
    });
    return () => {
      alive = false;
      if (built) disposeBookTextures(built);
      disposeAllPages();
    };
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 32, near: 0.1, far: 80, position: SHOTS.top.pos }}
      gl={{ antialias: true }}
      aria-label="A 3D storybook titled The Book of My Journey"
    >
      <color attach="background" args={[ROOM]} />
      <fog attach="fog" args={[ROOM, 11, 24]} />
      <Stepper />
      <CameraRig />

      <hemisphereLight args={["#ffe9c9", "#2a1d14", 0.5]} />
      <KeyLight />
      <directionalLight position={[6, 3, -5]} intensity={0.7} color="#a9bddb" />
      <directionalLight position={[2, 6, 6]} intensity={0.9} color="#fff1dc" />

      <Environment resolution={256} frames={1} environmentIntensity={0.55}>
        <Lightformer
          intensity={2.4}
          color="#ffe6c4"
          position={[0, 6, 2]}
          rotation-x={Math.PI / 2}
          scale={[8, 3, 1]}
        />
        <Lightformer
          intensity={1.3}
          color="#ffd3a1"
          position={[-6, 2, 3]}
          rotation-y={Math.PI / 2}
          scale={[6, 2, 1]}
        />
        <Lightformer
          intensity={0.7}
          color="#a8bcd8"
          position={[6, 2, -3]}
          rotation-y={-Math.PI / 2}
          scale={[6, 2, 1]}
        />
      </Environment>

      {tex && (
        <>
          <Table wood={tex.wood} />
          <BookRig>
            <Book tex={tex} />
            <WorldStage />
          </BookRig>
          <IndiaMap />
          <ReadySignal onReady={onReady} />
        </>
      )}
    </Canvas>
  );
}
