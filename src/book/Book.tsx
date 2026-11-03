import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  bookTimeline,
  lerp,
  pagesTurned,
  smoothstep,
  storyAt,
  WORLD_COUNT,
  worldBeats,
} from "./timeline";
import { scrollState, worldState } from "./scrollState";
import type { BookTextures } from "./textures";
import { pageBackTexture, pageTexture, prunePages } from "./pages";

/** Physical dimensions (world units). W = board width, H = board height, T = total thickness, B = board thickness. */
export const BOOK = { W: 3, H: 4, T: 0.62, B: 0.06 };
const INNER = BOOK.T - 2 * BOOK.B;
const PAGE_W = BOOK.W - 0.12;
const PAGE_H = BOOK.H - 0.16;
const LEAF_SEGMENTS = 28;

/** A single paper leaf that bends as it turns around the spine. */
function useLeafGeometry() {
  return useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = LEAF_SEGMENTS;
    const pos = new Float32Array((n + 1) * 2 * 3);
    const uv = new Float32Array((n + 1) * 2 * 2);
    const idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      uv.set([u, 1, u, 0], i * 4);
      if (i < n) {
        const a = 2 * i;
        idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
      }
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }, []);
}

function bendLeaf(g: THREE.BufferGeometry, turn: number) {
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const n = LEAF_SEGMENTS;
  const ds = PAGE_W / n;
  const phi0 = turn * Math.PI;
  const curl = 1.1 * Math.sin(turn * Math.PI);
  let x = 0;
  let y = 0;
  for (let i = 0; i <= n; i++) {
    const k = i * 6;
    arr[k] = x;
    arr[k + 1] = y;
    arr[k + 2] = -PAGE_H / 2;
    arr[k + 3] = x;
    arr[k + 4] = y;
    arr[k + 5] = PAGE_H / 2;
    const phi = Math.min(Math.PI, Math.max(0, phi0 - curl * (i / n)));
    x += Math.cos(phi) * ds;
    y += Math.sin(phi) * ds;
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
}

export function Book({ tex }: { tex: BookTextures }) {
  const { W, H, T, B } = BOOK;
  const root = useRef<THREE.Group>(null!);
  const hinge = useRef<THREE.Group>(null!);
  const spine = useRef<THREE.Group>(null!);
  const rightBlock = useRef<THREE.Mesh>(null!);
  const leftBlock = useRef<THREE.Mesh>(null!);
  const leaf = useRef<THREE.Group>(null!);
  const glow = useRef<THREE.PointLight>(null!);
  const sparkles = useRef<THREE.Group>(null!);
  const lastWorld = useRef(-2);
  const leafGeo = useLeafGeometry();

  const mats = useMemo(() => {
    const cloth = new THREE.MeshStandardMaterial({ map: tex.cloth, roughness: 0.92 });
    const coverTop = new THREE.MeshStandardMaterial({
      map: tex.coverMap,
      roughnessMap: tex.coverRough,
      metalnessMap: tex.coverMetal,
      bumpMap: tex.coverBump,
      bumpScale: 1.4,
      envMapIntensity: 1.8,
      roughness: 1,
      metalness: 1,
    });
    const endpaper = new THREE.MeshStandardMaterial({ map: tex.endpaper, roughness: 0.88 });
    const rightTop = new THREE.MeshStandardMaterial({ map: tex.titlePage, roughness: 0.9 });
    const leftTop = new THREE.MeshStandardMaterial({ map: tex.titlePage, roughness: 0.9 });
    const leafFront = new THREE.MeshStandardMaterial({
      map: tex.titlePage,
      roughness: 0.9,
      side: THREE.FrontSide,
    });
    const leafBack = new THREE.MeshStandardMaterial({
      map: tex.titlePage,
      roughness: 0.9,
      side: THREE.BackSide,
    });
    const edge = new THREE.MeshStandardMaterial({ map: tex.pageEdge, roughness: 0.95 });
    const spineMat = new THREE.MeshStandardMaterial({
      map: tex.spineMap,
      roughnessMap: tex.spineRough,
      metalnessMap: tex.spineMetal,
      roughness: 1,
      metalness: 1,
      side: THREE.DoubleSide,
    });
    return { cloth, coverTop, endpaper, rightTop, leftTop, leafFront, leafBack, edge, spineMat };
  }, [tex]);

  const spineGeo = useMemo(
    () => new THREE.CylinderGeometry(T / 2, T / 2, H, 40, 1, true, Math.PI, Math.PI),
    [T, H],
  );

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      spineGeo.dispose();
      leafGeo.dispose();
    },
    [mats, spineGeo, leafGeo],
  );

  const setMap = (m: THREE.MeshStandardMaterial, t: THREE.Texture | null) => {
    if (t && m.map !== t) m.map = t;
  };

  useFrame((state) => {
    const s = storyAt(scrollState.smooth);
    const intro = bookTimeline(s.intro);
    // After the last chapter the cover closes back over the pages.
    const open = s.outro > 0 ? 1 - worldState.close : intro.open;
    const g = intro.glow;
    const calm = scrollState.reducedMotion;
    const t = state.clock.elapsedTime;

    // Front board pivots at the spine; in the second half the hinge
    // slides down so the board comes to rest flat on the table.
    const drop = smoothstep(0.5, 1, open);
    const pivotY = lerp(T - B / 2, B / 2, drop);
    hinge.current.position.set(-W / 2, pivotY, 0);
    hinge.current.rotation.z = open * Math.PI;
    spine.current.scale.y = Math.max(0.02, (pivotY + B / 2) / T);

    const bob = calm ? 0 : Math.sin(t * 1.1) * 0.04;
    root.current.position.set(lerp(0, W / 2, open), (1 - open) * (0.22 + bob), 0);
    root.current.rotation.y = lerp(-0.05, 0, open);
    root.current.rotation.z = calm ? 0 : (1 - open) * Math.sin(t * 0.7) * 0.012;

    glow.current.intensity = s.world < 0 ? g * 6 : 0.4;
    sparkles.current.visible = open > 0.08;

    // Pages move from the right stack to the left as chapters turn.
    const turned = pagesTurned(s);
    const hl = INNER * 0.8 * (turned / WORLD_COUNT);
    const hr = INNER - hl;
    rightBlock.current.scale.y = hr / INNER;
    rightBlock.current.position.y = B + hr / 2;
    // The left stack rides on the front board, so it folds back with it when the book closes.
    leftBlock.current.visible = turned >= 0.999;
    leftBlock.current.scale.y = Math.max(hl, 0.002) / INNER;
    leftBlock.current.position.y = -(B / 2 + Math.max(hl, 0.002) / 2);

    const w = s.world;
    const turn = w >= 0 ? worldBeats(s.local, w === WORLD_COUNT - 1).turn : 0;
    if (w !== lastWorld.current) {
      lastWorld.current = w;
      if (w >= 0) prunePages(w);
    }
    setMap(mats.rightTop, w >= 0 ? pageTexture(w, "right") : tex.titlePage);
    setMap(
      mats.leftTop,
      turn >= 0.999 ? pageTexture(w, "left") : w > 0 ? pageTexture(w - 1, "left") : null,
    );

    const turning = w >= 0 && turn > 0.001 && turn < 0.999;
    leaf.current.visible = turning;
    if (turning) {
      setMap(mats.leafFront, w === 0 ? tex.titlePage : pageTexture(w - 1, "right"));
      setMap(mats.leafBack, pageBackTexture(w));
      bendLeaf(leafGeo, turn);
      const rightTop = B + hr + 0.004;
      const leftTop = B + hl + 0.004;
      leaf.current.position.set(-W / 2, lerp(rightTop, leftTop, turn), 0);
    }
  });

  const boardMats = [mats.cloth, mats.cloth, mats.cloth, mats.cloth, mats.cloth, mats.cloth];
  const frontMats = [mats.cloth, mats.cloth, mats.coverTop, mats.endpaper, mats.cloth, mats.cloth];
  const rightMats = [mats.edge, mats.edge, mats.rightTop, mats.edge, mats.edge, mats.edge];
  const leftMats = [mats.edge, mats.edge, mats.leftTop, mats.edge, mats.edge, mats.edge];

  return (
    <group ref={root}>
      {/* Back board */}
      <mesh position={[0, B / 2, 0]} material={boardMats} castShadow receiveShadow>
        <boxGeometry args={[W, B, H]} />
      </mesh>

      {/* Right page stack */}
      <mesh
        ref={rightBlock}
        position={[-0.02, B + INNER / 2, 0]}
        material={rightMats}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[PAGE_W, INNER, PAGE_H]} />
      </mesh>

      {/* Turning leaf */}
      <group ref={leaf} visible={false}>
        <mesh geometry={leafGeo} material={mats.leafFront} castShadow receiveShadow />
        <mesh geometry={leafGeo} material={mats.leafBack} castShadow receiveShadow />
      </group>

      {/* Rounded cloth spine */}
      <group ref={spine} position={[-W / 2, 0, 0]}>
        <mesh
          geometry={spineGeo}
          material={mats.spineMat}
          position={[0, T / 2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.32, 1, 1]}
          castShadow
        />
      </group>

      {/* Front board on its hinge */}
      <group ref={hinge}>
        <mesh position={[W / 2, 0, 0]} material={frontMats} castShadow receiveShadow>
          <boxGeometry args={[W, B, H]} />
        </mesh>
        {/* Left page stack (grows as pages turn), resting on the open front board.
            In board space it sits below the board; flipped open, that is on top. */}
        <mesh
          ref={leftBlock}
          position={[0.04 + PAGE_W / 2, -B, 0]}
          rotation-z={Math.PI}
          material={leftMats}
          visible={false}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[PAGE_W, INNER, PAGE_H]} />
        </mesh>
      </group>

      {/* Warm light escaping from between the pages */}
      <pointLight
        ref={glow}
        position={[0.1, T + 0.45, 0]}
        color="#ffcf8a"
        distance={5}
        decay={2}
        intensity={0}
      />
      <group ref={sparkles} position={[-W / 2, T + 0.9, 0]} visible={false}>
        <Sparkles
          count={8}
          scale={[5.5, 1.6, 3.6]}
          size={2.4}
          speed={0.12}
          color="#ffdcaa"
          opacity={0.35}
        />
      </group>
    </group>
  );
}
