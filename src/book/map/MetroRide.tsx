/**
 * The daily metro ride (Greater Noida → Noida), drawn on the book's own
 * pages like a hand-drawn route map. A teal train with Durgesh at the window
 * runs along it; each station pulses as the train passes and the last one
 * turns gold. Driven by the travel progress of a `mode: "metro"` leg.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { travels } from "@/content/journey";
import { smoothstep } from "../timeline";
import { worldState } from "../scrollState";
import { canvas, toTexture, SERIF } from "../textures";
import { mat, P } from "../world/kit";

const TEAL = "#00b2a9";
const SILVER = "#c0c0c0";
const SIZE: [number, number] = [5.5, 3.3];
const X0 = -2.2;
const X1 = 2.2;
const LINE_Z = -0.25;

function drawRoute(stations: string[]) {
  const W = 1650;
  const H = 990;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#f1e7d0";
  ctx.fillRect(0, 0, W, H);
  // Faint ruled paper.
  ctx.strokeStyle = "rgba(90,80,70,0.08)";
  ctx.lineWidth = 2;
  for (let y = 40; y < H; y += 46) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(W - 30, y);
    ctx.stroke();
  }
  const px = (x: number) => ((x + SIZE[0] / 2) / SIZE[0]) * W;
  const py = (z: number) => ((z + SIZE[1] / 2) / SIZE[1]) * H;
  const y = py(LINE_Z);
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(px(X0), y);
  ctx.lineTo(px(X1), y);
  ctx.stroke();
  stations.forEach((name, i) => {
    const x = px(X0 + ((X1 - X0) * i) / (stations.length - 1));
    ctx.fillStyle = "#f1e7d0";
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2a221b";
    ctx.textAlign = "center";
    const end = i === 0 || i === stations.length - 1;
    ctx.font = end ? `italic 600 50px ${SERIF}` : `500 34px "JetBrains Mono", monospace`;
    ctx.fillText(end ? name.toUpperCase() : name, x, i % 2 ? y + 92 : y - 60);
  });
  ctx.fillStyle = "rgba(42,34,27,0.55)";
  ctx.font = `italic 500 44px ${SERIF}`;
  ctx.textAlign = "left";
  ctx.fillText("Aqua Line · my daily commute", 70, 110);
  return toTexture(c);
}

function Train() {
  return (
    <group>
      <mesh position={[0, 0.17, 0]} material={mat(TEAL)} castShadow>
        <boxGeometry args={[1.5, 0.3, 0.36]} />
      </mesh>
      <mesh position={[0.78, 0.15, 0]} material={mat(TEAL)} castShadow>
        <capsuleGeometry args={[0.13, 0.12, 4, 10]} />
      </mesh>
      <mesh position={[0, 0.07, 0]} material={mat(SILVER, { rough: 0.4 })}>
        <boxGeometry args={[1.52, 0.04, 0.37]} />
      </mesh>
      {[-0.55, -0.3, -0.05, 0.2, 0.45].map((x) => (
        <mesh key={x} position={[x, 0.22, 0.182]} material={mat(P.sky, { emissive: 0.2 })}>
          <boxGeometry args={[0.18, 0.1, 0.005]} />
        </mesh>
      ))}
      {/* Durgesh at a window */}
      <mesh position={[-0.05, 0.22, 0.12]} material={mat("#8d6e63")}>
        <sphereGeometry args={[0.05, 12, 10]} />
      </mesh>
      <mesh position={[-0.05, 0.25, 0.115]} scale={[1, 0.6, 1]} material={mat("#15100c")}>
        <sphereGeometry args={[0.052, 12, 8]} />
      </mesh>
      <mesh position={[0, 0.33, 0]} material={mat(P.cream)}>
        <boxGeometry args={[1.5, 0.03, 0.34]} />
      </mesh>
    </group>
  );
}

export function MetroRide() {
  const legIndex = travels.findIndex((t) => t.mode === "metro");
  const leg = travels[legIndex];
  const stations = useMemo(() => leg?.stations ?? [leg?.from ?? "", leg?.to ?? ""], [leg]);
  const tex = useMemo(() => drawRoute(stations), [stations]);
  useEffect(() => () => tex.dispose(), [tex]);
  const root = useRef<THREE.Group>(null!);
  const sheet = useRef<THREE.MeshStandardMaterial>(null!);
  const train = useRef<THREE.Group>(null!);
  const dots = useRef<THREE.Group>(null!);
  const lines = useRef<THREE.Group>(null!);

  useFrame(() => {
    const on = worldState.travel === legIndex && legIndex >= 0;
    const tp = worldState.travelP;
    const show = on ? smoothstep(0.02, 0.16, tp) * (1 - smoothstep(0.9, 1, tp)) : 0;
    root.current.visible = show > 0.001;
    if (!root.current.visible) return;
    sheet.current.opacity = show;
    const k = smoothstep(0.24, 0.8, tp);
    const x = X0 + (X1 - X0) * k;
    train.current.position.set(x, 0.035, LINE_Z);
    train.current.visible = tp > 0.16 && tp < 0.92;
    const n = stations.length - 1;
    dots.current.children.forEach((d, i) => {
      const sx = X0 + ((X1 - X0) * i) / n;
      const near = Math.max(0, 1 - Math.abs(x - sx) / 0.25);
      d.scale.setScalar(1 + 0.3 * near);
      const last = i === n && k > 0.98;
      ((d as THREE.Mesh).material as THREE.MeshStandardMaterial) = last
        ? mat(P.mustard, { emissive: 0.8 })
        : mat(TEAL, { emissive: 0.15 + near * 0.6 });
    });
    // Speed lines while moving.
    const moving = k > 0.01 && k < 0.99;
    lines.current.visible = moving;
    lines.current.position.set(x - 0.95, 0.2, LINE_Z);
  });

  if (!leg) return null;
  return (
    <group ref={root} visible={false}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={SIZE} />
        <meshStandardMaterial ref={sheet} map={tex} transparent roughness={0.9} />
      </mesh>
      <group ref={dots}>
        {stations.map((s, i) => (
          <mesh
            key={s}
            position={[X0 + ((X1 - X0) * i) / (stations.length - 1), 0.02, LINE_Z]}
            material={mat(TEAL)}
          >
            <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          </mesh>
        ))}
      </group>
      <group ref={train}>
        <Train />
      </group>
      <group ref={lines}>
        {[-0.08, 0, 0.08].map((y, i) => (
          <mesh key={y} position={[-i * 0.08, y, 0.1]} material={mat(P.ivory)}>
            <boxGeometry args={[0.35 - i * 0.08, 0.008, 0.008]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
