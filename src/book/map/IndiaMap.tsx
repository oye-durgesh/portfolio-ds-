/**
 * The India-map journey between cities. A parchment map lies on the table;
 * while a journey plays, the map slides beneath a train or plane so the
 * vehicle stays at the centre of the frame (the camera "follows" it).
 * Driven entirely by `worldState.travel` / `travelP`.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { travels } from "@/content/journey";
import { worldState } from "../scrollState";
import { travelBeats } from "../timeline";
import { Plane, Train } from "../world/kit";
import { C, SANS, SERIF, canvas, spaced, toTexture } from "../textures";
import { INDIA_OUTLINE } from "./indiaOutline";
import { CITY_COORDS, MAP, toMap } from "./geo";

function drawMap() {
  const PX = 64; // canvas px per degree
  const W = (MAP.lon1 - MAP.lon0) * PX;
  const H = (MAP.lat1 - MAP.lat0) * PX;
  const { c, ctx } = canvas(W, H);
  const xy = (lon: number, lat: number): [number, number] => [
    (lon - MAP.lon0) * PX,
    (MAP.lat1 - lat) * PX,
  ];

  // Parchment sheet.
  const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.1, W / 2, H / 2, W * 0.7);
  g.addColorStop(0, "#c9b994");
  g.addColorStop(1, "#9f8c66");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Sea hatching.
  ctx.strokeStyle = "rgba(100,128,154,0.22)";
  ctx.lineWidth = 2;
  for (let y = 20; y < H; y += 26) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 24) {
      const yy = y + Math.sin((x + y) * 0.03) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  // Graticule.
  ctx.strokeStyle = "rgba(90,70,40,0.16)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 10]);
  for (let lon = 70; lon < MAP.lon1; lon += 5) {
    const [x] = xy(lon, 0);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let lat = 10; lat < MAP.lat1; lat += 5) {
    const [, y] = xy(0, lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // India.
  const path = new Path2D();
  INDIA_OUTLINE.forEach(([lon, lat], i) => {
    const [x, y] = xy(lon, lat);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.closePath();
  ctx.save();
  ctx.shadowColor = "rgba(40,28,15,0.45)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = C.ivory;
  ctx.fill(path);
  ctx.restore();
  // Paper grain inside the land.
  ctx.save();
  ctx.clip(path);
  ctx.strokeStyle = "rgba(125,133,80,0.12)";
  ctx.lineWidth = 2;
  for (let i = -H; i < W; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.stroke(path);
  ctx.strokeStyle = "rgba(160,120,50,0.35)";
  ctx.lineWidth = 2;
  ctx.save();
  ctx.translate(0, 9);
  ctx.stroke(path);
  ctx.restore();

  // Cities on the journey.
  for (const [name, [lon, lat]] of Object.entries(CITY_COORDS)) {
    const [x, y] = xy(lon, lat);
    ctx.fillStyle = C.terracotta;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.ivory;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.font = `600 54px ${SERIF}`;
    const right = name !== "Greater Noida";
    ctx.textAlign = right ? "left" : "right";
    ctx.fillText(name, x + (right ? 24 : -24), y + (name === "Greater Noida" ? -14 : 18));
  }

  // Title and compass in the sea.
  ctx.fillStyle = "rgba(42,34,27,0.7)";
  ctx.textAlign = "center";
  spaced(ctx, 22);
  ctx.font = `600 96px ${SERIF}`;
  const [tx, ty] = xy(88.5, 15.5);
  ctx.fillText("INDIA", tx, ty);
  spaced(ctx, 8);
  ctx.font = `500 26px ${SANS}`;
  ctx.fillText("THE ROUTE OF MY JOURNEY", tx, ty + 52);
  spaced(ctx, 0);

  const [cx, cy] = xy(70.5, 10);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = "rgba(42,34,27,0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = i % 2 ? C.gold : "rgba(42,34,27,0.7)";
    ctx.beginPath();
    ctx.moveTo(0, -100);
    ctx.lineTo(14, 0);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = C.ink;
  ctx.font = `600 40px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.fillText("N", 0, -112);
  ctx.restore();

  // Fade the sheet's edges so it melts into the table.
  ctx.globalCompositeOperation = "destination-in";
  const fade = ctx.createRadialGradient(W / 2, H / 2, W * 0.32, W / 2, H / 2, W * 0.56);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";
  return toTexture(c);
}

const DOTS = 90;

/** One leg: quadratic curve between two cities, in map space. */
function legCurve(i: number) {
  const t = travels[i]!;
  const a = toMap(CITY_COORDS[t.from]!);
  const b = toMap(CITY_COORDS[t.to]!);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const d = b.clone().sub(a);
  const perp = new THREE.Vector3(-d.z, 0, d.x).normalize().multiplyScalar(d.length() * 0.18);
  return new THREE.QuadraticBezierCurve3(a, mid.add(perp), b);
}

export function IndiaMap() {
  const tex = useMemo(drawMap, []);
  const curves = useMemo(() => travels.map((_, i) => legCurve(i)), []);
  const root = useRef<THREE.Group>(null!);
  const sheet = useRef<THREE.MeshBasicMaterial>(null!);
  const dots = useRef<THREE.InstancedMesh>(null!);
  const dotMat = useRef<THREE.MeshBasicMaterial>(null!);
  const ringFrom = useRef<THREE.Mesh>(null!);
  const ringTo = useRef<THREE.Mesh>(null!);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null!);
  const ringMat2 = useRef<THREE.MeshBasicMaterial>(null!);
  const train = useRef<THREE.Group>(null!);
  const plane = useRef<THREE.Group>(null!);
  const leg = useRef(-1);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const d = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => tex.dispose(), [tex]);

  useFrame(() => {
    const i = worldState.travel;
    const visible = i >= 0 && worldState.map > 0.001;
    root.current.visible = visible;
    if (!visible) return;
    const curve = curves[i]!;
    const b = travelBeats(worldState.travelP);

    if (leg.current !== i) {
      leg.current = i;
      for (let k = 0; k < DOTS; k++) {
        curve.getPoint(k / (DOTS - 1), v);
        m4.makeTranslation(v.x, 0.03, v.z);
        dots.current.setMatrixAt(k, m4);
      }
      dots.current.instanceMatrix.needsUpdate = true;
      ringFrom.current.position.copy(curve.v0).setY(0.025);
      ringTo.current.position.copy(curve.v2).setY(0.025);
    }

    const fade = worldState.map;
    sheet.current.opacity = fade;
    dotMat.current.opacity = fade;
    dots.current.count = Math.floor(b.route * DOTS);

    // Slide the map so the vehicle stays at the origin.
    curve.getPoint(b.move, v);
    root.current.position.set(-v.x, 0, -v.z);

    const t = worldState.time;
    const pulse = 1 + 0.18 * Math.sin(t * 3);
    ringMat.current.opacity = fade * (1 - b.move * 0.6);
    ringMat2.current.opacity = fade * (0.35 + 0.65 * b.move);
    ringFrom.current.scale.setScalar(1 - b.move * 0.3);
    ringTo.current.scale.setScalar((0.8 + b.move * 0.5) * (b.move > 0.9 ? pulse : 1));

    const mode = travels[i]!.mode;
    const show = b.route > 0.5 && fade > 0.4;
    train.current.visible = show && mode === "train";
    plane.current.visible = show && mode === "plane";
    curve.getTangent(Math.min(0.999, Math.max(0.001, b.move)), d);
    const heading = Math.atan2(-d.z, d.x);
    const veh = mode === "train" ? train.current : plane.current;
    veh.position.set(v.x, mode === "plane" ? 0.35 + Math.sin(b.move * Math.PI) * 1.1 : 0.03, v.z);
    veh.rotation.set(0, heading, mode === "plane" ? Math.cos(b.move * Math.PI) * 0.12 : 0);
  });

  const w = (MAP.lon1 - MAP.lon0) * MAP.K;
  const h = (MAP.lat1 - MAP.lat0) * MAP.K;
  const centre = toMap([(MAP.lon0 + MAP.lon1) / 2, (MAP.lat0 + MAP.lat1) / 2]);

  return (
    <group ref={root} visible={false}>
      <mesh rotation-x={-Math.PI / 2} position={[centre.x, 0.012, centre.z]} renderOrder={1}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          ref={sheet}
          map={tex}
          color="#cfc0a0"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <instancedMesh ref={dots} args={[undefined, undefined, DOTS]} renderOrder={2}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 10]} />
        <meshBasicMaterial ref={dotMat} color="#d6b061" transparent depthWrite={false} />
      </instancedMesh>
      <mesh ref={ringFrom} rotation-x={-Math.PI / 2} renderOrder={3}>
        <ringGeometry args={[0.24, 0.32, 32]} />
        <meshBasicMaterial ref={ringMat} color="#d6b061" transparent depthWrite={false} />
      </mesh>
      <mesh ref={ringTo} rotation-x={-Math.PI / 2} renderOrder={3}>
        <ringGeometry args={[0.26, 0.36, 32]} />
        <meshBasicMaterial ref={ringMat2} color="#e2c27a" transparent depthWrite={false} />
      </mesh>
      <group ref={train} scale={1.5} visible={false}>
        <group position={[0.4, 0, 0]}>
          <Train cars={2} />
        </group>
      </group>
      <group ref={plane} scale={3} visible={false}>
        <Plane />
      </group>
    </group>
  );
}
