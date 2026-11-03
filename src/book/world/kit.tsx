/**
 * Papercraft miniature kit: shared materials, the pop-up fold mechanism and
 * reusable models (houses, trees, vehicles, furniture, signs).
 * Everything is built from simple primitives in the storybook palette.
 */
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clamp01 } from "../timeline";
import { worldState } from "../scrollState";
import { C, HAND, SANS, SERIF } from "../textures";

export type V3 = [number, number, number];

/**
 * One chapter world. `anchors` maps each annotation id from the chapter's
 * content (`annotations[].id` in journey.ts) to the 3D point (world-stage
 * local space) on the object it describes; the gold label line ends there.
 */
export type WorldDef = { C: import("react").FC; anchors: Record<string, V3> };

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
  skin: "#c68a5e",
  hair: "#1f1813",
  white: "#f7f2e6",
  pink: "#d99a8f",
  glass: "#6d8a9c",
};

const matCache = new Map<string, THREE.MeshStandardMaterial>();
export function mat(
  color: string,
  opts: { emissive?: number | undefined; rough?: number | undefined } = {},
) {
  const key = `${color}|${opts.emissive ?? 0}|${opts.rough ?? 0.85}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.85,
      metalness: 0,
      emissive: opts.emissive ? new THREE.Color(color) : new THREE.Color(0, 0, 0),
      emissiveIntensity: opts.emissive ?? 0,
    });
    matCache.set(key, m);
  }
  return m;
}

/* ------------------------------------------------------------- pop-up */

const easeOutBack = (x: number) => {
  const c1 = 1.3;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/**
 * A pop-up piece: lies folded flat against the paper, then stands up as the
 * world rises. `delay` (0–0.6) staggers pieces so the scene unfolds in layers.
 */
export function PopUp({
  position = [0, 0, 0],
  rotationY = 0,
  delay = 0,
  children,
}: {
  position?: V3;
  rotationY?: number;
  delay?: number;
  children: ReactNode;
}) {
  const hinge = useRef<THREE.Group>(null!);
  useFrame(() => {
    const e = clamp01((worldState.rise - delay) / Math.max(0.2, 1 - delay));
    const k = easeOutBack(e);
    hinge.current.rotation.x = -(Math.PI / 2) * (1 - k);
    hinge.current.scale.setScalar(Math.max(0.001, Math.min(1, e * 1.6)));
    hinge.current.visible = e > 0.001;
  });
  return (
    <group position={position} rotation-y={rotationY}>
      <group ref={hinge}>{children}</group>
    </group>
  );
}

/** Flat cardstock layer glued to the page (grass, road, plaza). */
export function Card({
  size,
  color,
  position = [0, 0, 0],
  rotationY = 0,
}: {
  size: [number, number];
  color: string;
  position?: V3;
  rotationY?: number;
}) {
  return (
    <PopUp position={position} rotationY={rotationY} delay={0}>
      <mesh position={[0, 0.012, 0]} material={mat(color)} receiveShadow>
        <boxGeometry args={[size[0], 0.024, size[1]]} />
      </mesh>
    </PopUp>
  );
}

export function Box({
  size,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  emissive,
}: {
  size: V3;
  color: string;
  position?: V3;
  rotation?: V3;
  emissive?: number;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      material={mat(color, { emissive })}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
    </mesh>
  );
}

/* ------------------------------------------------------- text textures */

export function useTextTexture(
  lines: string[],
  {
    w = 512,
    h = 256,
    bg = P.ivory,
    fg = C.ink,
    font = "serif",
    size = 64,
    border,
  }: {
    w?: number;
    h?: number;
    bg?: string;
    fg?: string;
    font?: "serif" | "sans" | "hand";
    size?: number;
    border?: string;
  } = {},
) {
  const key = lines.join("|");
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 8;
      ctx.strokeRect(10, 10, w - 20, h - 20);
    }
    const family = font === "serif" ? SERIF : font === "hand" ? HAND : SANS;
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lh = size * 1.15;
    const y0 = h / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => {
      // Shrink each line until it fits the panel.
      let px = i === 0 ? size : size * 0.62;
      const weight = font === "sans" ? 700 : 600;
      ctx.font = `${weight} ${px}px ${family}`;
      while (px > 12 && ctx.measureText(l).width > w * 0.9) {
        px -= 2;
        ctx.font = `${weight} ${px}px ${family}`;
      }
      ctx.fillText(l, w / 2, y0 + i * lh);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, w, h, bg, fg, font, size, border]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/** A flat panel with printed text (signboards, boards, screens). */
export function TextPanel({
  lines,
  size,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  opts,
  glow,
}: {
  lines: string[];
  size: [number, number];
  position?: V3;
  rotation?: V3;
  opts?: Parameters<typeof useTextTexture>[1];
  glow?: number;
}) {
  const tex = useTextTexture(lines, { w: 512, h: Math.round((512 * size[1]) / size[0]), ...opts });
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={tex}
        roughness={0.8}
        emissive="#ffffff"
        emissiveMap={glow ? tex : null}
        emissiveIntensity={glow ?? 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function Signboard({
  lines,
  position = [0, 0, 0],
  rotationY = 0,
  width = 0.9,
  color = P.forest,
  fg = "#f3e3b8",
}: {
  lines: string[];
  position?: V3;
  rotationY?: number;
  width?: number;
  color?: string;
  fg?: string;
}) {
  const h = width * 0.42;
  return (
    <group position={position} rotation-y={rotationY}>
      {[-1, 1].map((s) => (
        <Box
          key={s}
          size={[0.03, 0.5, 0.03]}
          color={P.woodDark}
          position={[(s * width) / 2.4, 0.25, 0]}
        />
      ))}
      <Box
        size={[width + 0.04, h + 0.04, 0.03]}
        color={P.woodDark}
        position={[0, 0.5 + h / 2, -0.005]}
      />
      <TextPanel
        lines={lines}
        size={[width, h]}
        position={[0, 0.5 + h / 2, 0.012]}
        opts={{ bg: color, fg, font: "sans", size: 70 }}
      />
    </group>
  );
}

/* --------------------------------------------------------------- nature */

export function Tree({
  position = [0, 0, 0],
  s = 1,
  color = P.forest,
}: {
  position?: V3;
  s?: number;
  color?: string;
}) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.12, 0]} material={mat(P.woodDark)} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.24, 6]} />
      </mesh>
      <mesh position={[0, 0.33, 0]} material={mat(color)} castShadow>
        <icosahedronGeometry args={[0.16, 0]} />
      </mesh>
      <mesh
        position={[0.06, 0.45, 0.02]}
        material={mat(color === P.forest ? P.olive : P.forest)}
        castShadow
      >
        <icosahedronGeometry args={[0.1, 0]} />
      </mesh>
    </group>
  );
}

export function Bush({
  position = [0, 0, 0],
  s = 1,
  color = P.olive,
}: {
  position?: V3;
  s?: number;
  color?: string;
}) {
  return (
    <mesh
      position={[position[0], position[1] + 0.05 * s, position[2]]}
      scale={s}
      material={mat(color)}
      castShadow
    >
      <icosahedronGeometry args={[0.08, 0]} />
    </mesh>
  );
}

export function Field({
  position = [0, 0, 0],
  size = [0.8, 0.5] as [number, number],
  color = P.grass,
}: {
  position?: V3;
  size?: [number, number];
  color?: string;
}) {
  const rows = Math.round(size[1] / 0.08);
  return (
    <group position={position}>
      <Box size={[size[0], 0.02, size[1]]} color={color} position={[0, 0.01, 0]} />
      {Array.from({ length: rows }, (_, i) => (
        <Box
          key={i}
          size={[size[0] * 0.92, 0.025, 0.02]}
          color={P.olive}
          position={[0, 0.025, -size[1] / 2 + 0.05 + i * 0.08]}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------ buildings */

const WINDOW = "#3e4d57";

/** North Indian flat-roof house with parapet, door and windows. */
export function House({
  position = [0, 0, 0],
  size = [0.5, 0.45, 0.4] as V3,
  color = P.terracotta,
  rotationY = 0,
  tank = false,
}: {
  position?: V3;
  size?: V3;
  color?: string;
  rotationY?: number;
  tank?: boolean;
}) {
  const [w, h, d] = size;
  return (
    <group position={position} rotation-y={rotationY}>
      <Box size={[w, h, d]} color={color} position={[0, h / 2, 0]} />
      <Box size={[w + 0.03, 0.05, d + 0.03]} color={P.cream} position={[0, h + 0.025, 0]} />
      <Box
        size={[w * 0.22, h * 0.45, 0.012]}
        color={P.woodDark}
        position={[-w * 0.2, h * 0.225, d / 2 + 0.006]}
      />
      <Box
        size={[w * 0.22, h * 0.22, 0.012]}
        color={WINDOW}
        position={[w * 0.22, h * 0.6, d / 2 + 0.006]}
      />
      <Box
        size={[w * 0.3, 0.02, 0.06]}
        color={P.cream}
        position={[w * 0.22, h * 0.47, d / 2 + 0.03]}
      />
      {tank && (
        <mesh position={[w * 0.25, h + 0.11, -d * 0.2]} material={mat(P.charcoal)} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 10]} />
        </mesh>
      )}
    </group>
  );
}

export function Shop({
  position = [0, 0, 0],
  color = P.mustard,
  awning = P.terracotta,
  label,
  rotationY = 0,
}: {
  position?: V3;
  color?: string;
  awning?: string;
  label?: string;
  rotationY?: number;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Box size={[0.42, 0.34, 0.34]} color={color} position={[0, 0.17, 0]} />
      <Box size={[0.32, 0.18, 0.012]} color={P.charcoal} position={[0, 0.11, 0.176]} />
      <Box
        size={[0.46, 0.02, 0.14]}
        color={awning}
        position={[0, 0.27, 0.22]}
        rotation={[0.35, 0, 0]}
      />
      {label && (
        <TextPanel
          lines={[label]}
          size={[0.36, 0.08]}
          position={[0, 0.31, 0.172]}
          opts={{ bg: P.ivory, fg: C.ink, font: "sans", size: 80 }}
        />
      )}
    </group>
  );
}

let windowTex: THREE.CanvasTexture | null = null;
function windowTexture() {
  if (windowTex) return windowTex;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 128, 256);
  for (let y = 14; y < 256; y += 32) {
    for (let x = 12; x < 128; x += 28) {
      ctx.fillStyle = Math.random() > 0.75 ? "#f2d18b" : "#55636d";
      ctx.fillRect(x, y, 16, 18);
    }
  }
  windowTex = new THREE.CanvasTexture(c);
  windowTex.colorSpace = THREE.SRGBColorSpace;
  windowTex.wrapS = windowTex.wrapT = THREE.RepeatWrapping;
  return windowTex;
}

/** City / office block with a window grid. */
export function Building({
  position = [0, 0, 0],
  size = [0.4, 0.8, 0.4] as V3,
  color = P.stone,
  rotationY = 0,
}: {
  position?: V3;
  size?: V3;
  color?: string;
  rotationY?: number;
}) {
  const tex = useMemo(() => {
    const t = windowTexture().clone();
    t.repeat.set(Math.max(1, size[0] / 0.25), Math.max(1, size[1] / 0.35));
    t.needsUpdate = true;
    return t;
  }, [size]);
  useEffect(() => () => tex.dispose(), [tex]);
  const [w, h, d] = size;
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} map={tex} roughness={0.8} />
      </mesh>
      <Box size={[w + 0.02, 0.03, d + 0.02]} color={P.cream} position={[0, h + 0.015, 0]} />
    </group>
  );
}

/* ------------------------------------------------------------- vehicles */

export function Wheel({ position, r = 0.04 }: { position: V3; r?: number }) {
  return (
    <mesh position={position} rotation={[0, Math.PI / 2, 0]} material={mat(P.charcoal)} castShadow>
      <cylinderGeometry args={[r, r, 0.025, 12]} />
    </mesh>
  );
}

export function Bicycle({
  position = [0, 0, 0],
  rotationY = 0,
  color = P.terracotta,
}: {
  position?: V3;
  rotationY?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.06, 0]} material={mat(P.charcoal)} castShadow>
          <torusGeometry args={[0.05, 0.007, 6, 16]} />
        </mesh>
      ))}
      <Box
        size={[0.17, 0.012, 0.012]}
        color={color}
        position={[0, 0.1, 0]}
        rotation={[0, 0, 0.15]}
      />
      <Box size={[0.012, 0.08, 0.012]} color={color} position={[-0.03, 0.12, 0]} />
      <Box size={[0.05, 0.012, 0.03]} color={P.charcoal} position={[-0.03, 0.165, 0]} />
    </group>
  );
}

/** Indian passenger train: engine + coaches. Faces +x. */
export function Train({ cars = 3 }: { cars?: number }) {
  return (
    <group>
      <group position={[0, 0, 0]}>
        <Box size={[0.42, 0.22, 0.2]} color={P.terracotta} position={[0, 0.15, 0]} />
        <Box size={[0.12, 0.08, 0.2]} color={P.mustard} position={[0.17, 0.3, 0]} />
        <Box size={[0.08, 0.06, 0.205]} color={WINDOW} position={[0.12, 0.2, 0]} />
        <Box size={[0.44, 0.025, 0.21]} color={P.cream} position={[0, 0.1, 0]} />
      </group>
      {Array.from({ length: cars }, (_, i) => (
        <group key={i} position={[-0.47 * (i + 1), 0, 0]}>
          <Box size={[0.44, 0.22, 0.19]} color={P.dusty} position={[0, 0.15, 0]} />
          <Box size={[0.38, 0.05, 0.195]} color={P.cream} position={[0, 0.19, 0]} />
          <Box size={[0.46, 0.03, 0.2]} color={P.charcoal} position={[0, 0.275, 0]} />
        </group>
      ))}
      {Array.from({ length: (cars + 1) * 2 }, (_, i) => (
        <Wheel key={i} position={[0.12 - 0.235 * i, 0.04, 0.1]} r={0.035} />
      ))}
    </group>
  );
}

/** Straight track along x, from x0 to x1. */
export function Rails({ x0, x1, z = 0 }: { x0: number; x1: number; z?: number }) {
  const len = x1 - x0;
  const n = Math.floor(len / 0.09);
  const sleepers = useMemo(() => {
    const g = new THREE.BoxGeometry(0.035, 0.015, 0.26);
    return g;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      m.makeTranslation(x0 + 0.045 + i * 0.09, 0.0075, z);
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [n, x0, z]);
  useEffect(() => () => sleepers.dispose(), [sleepers]);
  return (
    <group>
      <instancedMesh ref={ref} args={[sleepers, mat(P.woodDark), n]} receiveShadow />
      {[-0.07, 0.07].map((o) => (
        <Box
          key={o}
          size={[len, 0.018, 0.015]}
          color="#7d7468"
          position={[x0 + len / 2, 0.022, z + o]}
        />
      ))}
    </group>
  );
}

/** Auto-rickshaw. Faces +x. */
export function AutoRickshaw() {
  return (
    <group>
      <Box size={[0.3, 0.1, 0.18]} color={P.forest} position={[0, 0.09, 0]} />
      <Box size={[0.24, 0.13, 0.19]} color={P.mustard} position={[-0.02, 0.22, 0]} />
      <Box
        size={[0.012, 0.1, 0.16]}
        color={P.glass}
        position={[0.1, 0.2, 0]}
        rotation={[0, 0, -0.3]}
      />
      <Box size={[0.08, 0.06, 0.04]} color={P.charcoal} position={[0.15, 0.12, 0]} />
      <Wheel position={[0.13, 0.04, 0]} />
      <Wheel position={[-0.1, 0.04, 0.09]} />
      <Wheel position={[-0.1, 0.04, -0.09]} />
    </group>
  );
}

/** Small aircraft. Faces +x. */
export function Plane() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} material={mat(P.white)} castShadow>
        <capsuleGeometry args={[0.05, 0.36, 4, 10]} />
      </mesh>
      <Box size={[0.12, 0.012, 0.6]} color={P.white} position={[0, 0, 0]} />
      <Box size={[0.08, 0.1, 0.012]} color={P.terracotta} position={[-0.2, 0.07, 0]} />
      <Box size={[0.06, 0.01, 0.2]} color={P.white} position={[-0.2, 0.02, 0]} />
      <Box size={[0.1, 0.025, 0.105]} color={P.glass} position={[0.16, 0.025, 0]} />
    </group>
  );
}

/* ----------------------------------------------------------- furniture */

export function Desk({
  position = [0, 0, 0],
  rotationY = 0,
  w = 0.6,
  color = P.wood,
}: {
  position?: V3;
  rotationY?: number;
  w?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Box size={[w, 0.03, 0.32]} color={color} position={[0, 0.26, 0]} />
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Box
            key={`${sx}${sz}`}
            size={[0.025, 0.25, 0.025]}
            color={P.woodDark}
            position={[(sx * (w - 0.05)) / 2, 0.125, (sz * 0.26) / 2]}
          />
        )),
      )}
    </group>
  );
}

export function Laptop({
  position = [0, 0, 0],
  rotationY = 0,
  screen = P.sky,
  open = 1.9,
}: {
  position?: V3;
  rotationY?: number;
  screen?: string;
  open?: number;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Box size={[0.2, 0.01, 0.14]} color="#b9b2a6" position={[0, 0.005, 0]} />
      <group position={[0, 0.01, -0.07]} rotation={[-(Math.PI - open), 0, 0]}>
        <Box size={[0.2, 0.13, 0.008]} color="#b9b2a6" position={[0, 0.065, 0]} />
        <Box
          size={[0.18, 0.11, 0.002]}
          color={screen}
          position={[0, 0.065, 0.005]}
          emissive={0.6}
        />
      </group>
    </group>
  );
}

export function Notebook({
  position = [0, 0, 0],
  rotationY = 0,
  color = P.terracotta,
}: {
  position?: V3;
  rotationY?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Box size={[0.12, 0.012, 0.16]} color={color} position={[0, 0.006, 0]} />
      <Box size={[0.11, 0.004, 0.15]} color={P.ivory} position={[0.002, 0.014, 0]} />
    </group>
  );
}

export function Bench({
  position = [0, 0, 0],
  rotationY = 0,
}: {
  position?: V3;
  rotationY?: number;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Box size={[0.36, 0.02, 0.1]} color={P.wood} position={[0, 0.1, 0]} />
      <Box size={[0.36, 0.08, 0.02]} color={P.wood} position={[0, 0.16, -0.05]} />
      {[-0.15, 0.15].map((x) => (
        <Box key={x} size={[0.02, 0.1, 0.09]} color={P.charcoal} position={[x, 0.05, 0]} />
      ))}
    </group>
  );
}

export function Mat({
  position = [0, 0, 0],
  color = P.lavender,
  rotationY = 0,
}: {
  position?: V3;
  color?: string;
  rotationY?: number;
}) {
  return (
    <Box
      size={[0.14, 0.012, 0.28]}
      color={color}
      position={[position[0], position[1] + 0.006, position[2]]}
      rotation={[0, rotationY, 0]}
    />
  );
}

/** Simple townsperson: a rounded pawn with a slow idle sway (random phase). */
export function Person({
  position = [0, 0, 0],
  color = P.dusty,
  s = 1.3,
  sitting = false,
  rotationY = 0,
}: {
  position?: V3;
  color?: string;
  s?: number;
  sitting?: boolean;
  rotationY?: number;
}) {
  const g = useRef<THREE.Group>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(() => {
    g.current.position.x = position[0] + Math.sin((worldState.time * Math.PI) / 2 + phase) * 0.004;
  });
  return (
    <group ref={g} position={position} scale={s} rotation-y={rotationY}>
      <mesh position={[0, sitting ? 0.08 : 0.13, 0]} material={mat(color)} castShadow>
        <capsuleGeometry args={[0.055, sitting ? 0.04 : 0.12, 4, 10]} />
      </mesh>
      <mesh position={[0, sitting ? 0.2 : 0.29, 0]} material={mat(P.skin)} castShadow>
        <sphereGeometry args={[0.05, 12, 10]} />
      </mesh>
      <mesh
        position={[0, sitting ? 0.225 : 0.315, -0.005]}
        scale={[1, 0.6, 1]}
        material={mat(P.hair)}
      >
        <sphereGeometry args={[0.052, 12, 8]} />
      </mesh>
    </group>
  );
}

export function Dog({
  position = [0, 0, 0],
  rotationY = 0,
}: {
  position?: V3;
  rotationY?: number;
}) {
  const tail = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    tail.current.rotation.z = 0.6 + Math.sin(worldState.time * 9) * 0.35;
  });
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh
        position={[0, 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={mat(P.mustard)}
        castShadow
      >
        <capsuleGeometry args={[0.05, 0.1, 4, 10]} />
      </mesh>
      <mesh position={[0.11, 0.17, 0]} material={mat(P.mustard)} castShadow>
        <sphereGeometry args={[0.055, 12, 10]} />
      </mesh>
      <mesh position={[0.16, 0.16, 0]} material={mat(P.cream)}>
        <sphereGeometry args={[0.028, 10, 8]} />
      </mesh>
      <mesh position={[0.185, 0.165, 0]} material={mat(P.charcoal)}>
        <sphereGeometry args={[0.012, 8, 6]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[0.1, 0.21, s * 0.035]}
          rotation={[s * 0.4, 0, 0]}
          material={mat(P.wood)}
        >
          <boxGeometry args={[0.03, 0.05, 0.015]} />
        </mesh>
      ))}
      {[
        [0.05, 0.03],
        [0.05, -0.03],
        [-0.05, 0.03],
        [-0.05, -0.03],
      ].map(([x, z]) => (
        <Box
          key={`${x}${z}`}
          size={[0.022, 0.06, 0.022]}
          color={P.mustard}
          position={[x!, 0.03, z!]}
        />
      ))}
      <mesh ref={tail} position={[-0.09, 0.13, 0]} material={mat(P.mustard)}>
        <capsuleGeometry args={[0.012, 0.06, 3, 6]} />
      </mesh>
    </group>
  );
}

/** Bar chart standing on the page. Values 0–1. */
export function Bars({
  values,
  colors,
  position = [0, 0, 0],
  gap = 0.12,
  height = 0.6,
}: {
  values: number[];
  colors: string[];
  position?: V3;
  gap?: number;
  height?: number;
}) {
  return (
    <group position={position}>
      {values.map((v, i) => (
        <Box
          key={i}
          size={[0.08, Math.max(0.01, v * height), 0.08]}
          color={colors[i % colors.length]!}
          position={[(i - (values.length - 1) / 2) * gap, (v * height) / 2, 0]}
        />
      ))}
    </group>
  );
}

export function Trophy({
  position = [0, 0, 0],
  color = P.mustard,
  s = 1,
}: {
  position?: V3;
  color?: string;
  s?: number;
}) {
  return (
    <group position={position} scale={s}>
      <Box size={[0.08, 0.03, 0.08]} color={P.woodDark} position={[0, 0.015, 0]} />
      <mesh position={[0, 0.06, 0]} material={mat(color, { rough: 0.35 })} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
      </mesh>
      <mesh position={[0, 0.12, 0]} material={mat(color, { rough: 0.35 })} castShadow>
        <cylinderGeometry args={[0.05, 0.02, 0.07, 14]} />
      </mesh>
    </group>
  );
}

/** Phone standing up, with a printed screen. */
export function Phone({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  lines,
  s = 1,
}: {
  position?: V3;
  rotation?: V3;
  lines: string[];
  s?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={s}>
      <Box size={[0.2, 0.4, 0.02]} color={P.charcoal} position={[0, 0.2, 0]} />
      <TextPanel
        lines={lines}
        size={[0.18, 0.36]}
        position={[0, 0.2, 0.0115]}
        opts={{ bg: P.ivory, fg: C.ink, font: "sans", size: 46 }}
        glow={0.25}
      />
    </group>
  );
}

/** Stamped label floating over a piece (not text inside paragraphs). */
export function HandNote({
  text,
  position,
  rotation = [-0.5, 0, 0],
  width = 0.9,
}: {
  text: string;
  position: V3;
  rotation?: V3;
  width?: number;
}) {
  return (
    <TextPanel
      lines={[text]}
      size={[width, width * 0.2]}
      position={position}
      rotation={rotation}
      opts={{ bg: P.ivory, fg: C.forest, font: "hand", size: 70 }}
    />
  );
}

/** Coffee mug — a small detail that makes a desk feel used. */
export function Mug({ position = [0, 0, 0], color = P.ivory }: { position?: V3; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.035, 0]} material={mat(color)} castShadow>
        <cylinderGeometry args={[0.03, 0.028, 0.07, 12]} />
      </mesh>
      <mesh position={[0.032, 0.038, 0]} rotation-z={Math.PI / 2} material={mat(color)}>
        <torusGeometry args={[0.018, 0.006, 6, 10]} />
      </mesh>
      <mesh position={[0, 0.069, 0]} rotation-x={-Math.PI / 2} material={mat(P.woodDark)}>
        <circleGeometry args={[0.026, 12]} />
      </mesh>
    </group>
  );
}

/** Potted plant. */
export function Plant({ position = [0, 0, 0], s = 1 }: { position?: V3; s?: number }) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.05, 0]} material={mat(P.terracotta)} castShadow>
        <cylinderGeometry args={[0.055, 0.045, 0.1, 12]} />
      </mesh>
      {[
        [0, 0.17, 0, 0.07],
        [0.04, 0.14, 0.02, 0.05],
        [-0.04, 0.15, -0.02, 0.055],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x!, y!, z!]} material={mat(P.forest)} castShadow>
          <icosahedronGeometry args={[r!, 0]} />
        </mesh>
      ))}
    </group>
  );
}
