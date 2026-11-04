/** Late chapters: handcrafted miniatures, in world-stage local coordinates. */
import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState, worldState } from "../scrollState";
import { Character } from "./Character";
import {
  P,
  mat,
  PopUp,
  Box,
  Card,
  TextPanel,
  Tree,
  Desk,
  Laptop,
  Notebook,
  Person,
  Bench,
  Building,
  Signboard,
  Mug,
  Plant,
  Phone,
  Bars,
  type V3,
  type WorldDef,
} from "./kit";

const colors = [P.dusty, P.olive, P.terracotta, P.lavender];
const ramp = (a: number, b: number, value: number) => {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
function Floor() {
  return <Card size={[5.3, 2.1]} position={[0, 0, -0.85]} color={P.cream} />;
}
function Item({ at, children, delay = 0.12 }: { at: V3; children: ReactNode; delay?: number }) {
  return (
    <PopUp position={at} delay={delay}>
      {children}
    </PopUp>
  );
}
function Label({ text, at, size = [0.9, 0.2] }: { text: string; at: V3; size?: [number, number] }) {
  return (
    <TextPanel
      lines={[text]}
      position={at}
      size={size}
      opts={{
        bg: P.ivory,
        fg: P.charcoal,
        border: P.mustard,
        font: "sans",
        size: 64,
      }}
    />
  );
}
function Reveal({
  start = 0,
  fade = false,
  children,
}: {
  start?: number;
  fade?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    const s = fade
      ? 1 - 0.72 * ramp(start, start + 0.25, worldState.hold)
      : ramp(start, start + 0.18, worldState.hold);
    ref.current.scale.setScalar(Math.max(0.001, s));
    ref.current.visible = s > 0.001;
  });
  return <group ref={ref}>{children}</group>;
}
function Thread({
  from,
  to,
  color = P.mustard,
  radius = 0.012,
}: {
  from: V3;
  to: V3;
  color?: string;
  radius?: number;
}) {
  const a = new THREE.Vector3(...from),
    b = new THREE.Vector3(...to),
    d = b.clone().sub(a);
  return (
    <mesh
      position={a.clone().add(b).multiplyScalar(0.5)}
      quaternion={new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        d.clone().normalize(),
      )}
      material={mat(color)}
    >
      <cylinderGeometry args={[radius, radius, d.length(), 6]} />
    </mesh>
  );
}
function Bubble({ text = "", at }: { text?: string; at: V3 }) {
  return (
    <group position={at}>
      <Label text={text || "· · ·"} at={[0, 0, 0]} size={[0.46, 0.23]} />
      <Box
        size={[0.09, 0.09, 0.025]}
        position={[-0.12, -0.12, -0.01]}
        rotation={[0, 0, Math.PI / 4]}
        color={P.ivory}
      />
    </group>
  );
}
function Chair() {
  return (
    <>
      <Box size={[0.29, 0.04, 0.26]} position={[0, 0.17, 0]} color={P.wood} />
      <Box size={[0.29, 0.3, 0.035]} position={[0, 0.3, -0.13]} color={P.wood} />
      {[-0.11, 0.11].map((x) => (
        <Box key={x} size={[0.035, 0.17, 0.23]} position={[x, 0.08, 0]} color={P.woodDark} />
      ))}
    </>
  );
}
function Cushion({ color = P.dusty }: { color?: string }) {
  return (
    <>
      <Box size={[0.56, 0.025, 0.42]} color={P.paper} />
      <mesh position={[0, 0.06, 0]} material={mat(color)}>
        <cylinderGeometry args={[0.19, 0.22, 0.09, 12]} />
      </mesh>
    </>
  );
}
/** Simple seated participants; the recurring detailed avatar remains unique. */
function Meditator({ color }: { color: string }) {
  return (
    <group position={[0, 0.11, 0]}>
      <Box size={[0.34, 0.09, 0.23]} position={[0, 0.05, 0.05]} color={P.charcoal} />
      <mesh position={[0, 0.23, 0]} material={mat(color)}>
        <sphereGeometry args={[0.14, 10, 8]} />
      </mesh>
      <mesh position={[0, 0.45, 0]} material={mat(P.skin)}>
        <sphereGeometry args={[0.11, 10, 8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <Thread
          key={s}
          from={[s * 0.11, 0.3, 0]}
          to={[s * 0.19, 0.1, 0.13]}
          color={color}
          radius={0.035}
        />
      ))}
    </group>
  );
}
function Board({
  title,
  cols = 3,
  rows = 2,
  width = 1.3,
}: {
  title: string;
  cols?: number;
  rows?: number;
  width?: number;
}) {
  return (
    <>
      <Box size={[width, 0.95, 0.05]} position={[0, 0.65, 0]} color={P.wood} />
      <Label text={title} at={[0, 1.02, 0.035]} size={[width - 0.08, 0.18]} />
      {Array.from({ length: cols * rows }, (_, i) => (
        <group
          key={i}
          position={[
            -width / 2 + (((i % cols) + 0.5) * width) / cols,
            0.34 + Math.floor(i / cols) * 0.23,
            0.04,
          ]}
        >
          <Box size={[width / cols - 0.07, 0.17, 0.02]} color={colors[i % 4]!} />
          <Box size={[width / cols - 0.13, 0.014, 0.025]} color={P.paper} />
        </group>
      ))}
    </>
  );
}
function Clock({ moon = false }: { moon?: boolean }) {
  return (
    <>
      <mesh material={mat(P.wood)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 24]} />
      </mesh>
      <mesh position={[0, 0, 0.025]} material={mat(P.ivory)}>
        <circleGeometry args={[0.25, 24]} />
      </mesh>
      <Thread from={[0, 0, 0.04]} to={[0, 0.2, 0.04]} color={P.charcoal} />
      <Thread from={[0, 0, 0.045]} to={[-0.09, -0.15, 0.045]} color={P.charcoal} />
      <mesh position={[0.15, 0.13, 0.05]} material={mat(moon ? P.dusty : P.mustard)}>
        <circleGeometry args={[0.045, 10]} />
      </mesh>
      {moon && (
        <mesh position={[0.17, 0.15, 0.055]} material={mat(P.ivory)}>
          <circleGeometry args={[0.038, 10]} />
        </mesh>
      )}
    </>
  );
}
function Waves() {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    ref.current.scale.setScalar(1 + Math.sin(worldState.time * 2) * 0.06);
  });
  return (
    <group ref={ref}>
      {[0.09, 0.16, 0.23].map((r) => (
        <mesh key={r} material={mat(P.mustard)} rotation-z={-Math.PI / 2}>
          <torusGeometry args={[r, 0.009, 4, 16, Math.PI]} />
        </mesh>
      ))}
    </group>
  );
}
function Frame({
  mode = "wire",
  title = "",
}: {
  mode?: "wire" | "flow" | "puzzle" | "prompt" | "web";
  title?: string;
}) {
  return (
    <>
      <Box size={[1.05, 0.72, 0.045]} position={[0, 0.67, 0]} color={P.woodDark} />
      <Box size={[0.97, 0.64, 0.015]} position={[0, 0.67, 0.03]} color={P.ivory} />
      {title && <Label text={title} at={[0, 1.12, 0.04]} size={[1.05, 0.18]} />}
      {[0, 1, 2].map((i) => (
        <group key={i}>
          <Box
            size={
              mode === "flow"
                ? [0.2, 0.17, 0.02]
                : mode === "prompt"
                  ? [0.57 - i * 0.1, 0.1, 0.02]
                  : [0.2, 0.22 + i * 0.04, 0.02]
            }
            position={
              mode === "prompt"
                ? [-0.08 + (i % 2) * 0.15, 0.85 - i * 0.17, 0.05]
                : [-0.31 + i * 0.31, 0.68, 0.05]
            }
            rotation={[0, 0, mode === "puzzle" ? i * 0.5 : 0]}
            color={colors[i]!}
          />
          {mode === "flow" && i < 2 && (
            <Label text="→" at={[-0.15 + i * 0.31, 0.68, 0.07]} size={[0.1, 0.12]} />
          )}
        </group>
      ))}
      {mode === "web" && (
        <Box size={[0.86, 0.05, 0.02]} position={[0, 0.92, 0.05]} color={P.dusty} />
      )}
    </>
  );
}

const DAYS = [1, 0.82, 0.66, 0.52, 0.42, 0.34, 0.29];
function ClarityWorld() {
  return (
    <group>
      <Floor />
      <Item at={[-0.35, 0.03, -1.72]}>
        <Box size={[3.4, 1.15, 0.05]} position={[0, 0.62, 0]} color={P.wood} />
        <Label text="7-DAY PROGRAMME" at={[0, 1.08, 0.035]} size={[1.6, 0.18]} />
        {DAYS.map((v, i) => (
          <group key={i} position={[-1.38 + i * 0.46, 0, 0.04]}>
            <Box size={[0.36, 0.72, 0.02]} position={[0, 0.58, 0]} color={P.ivory} />
            <Label text={`DAY ${i + 1}`} at={[0, 0.86, 0.015]} size={[0.32, 0.1]} />
            <Box
              size={[0.18, 0.55 * v, 0.03]}
              position={[0, 0.25 + (0.55 * v) / 2, 0.02]}
              color={i < 2 ? P.forest : i < 5 ? P.mustard : P.terracotta}
            />
          </group>
        ))}
      </Item>
      <Item at={[2.1, 1.1, -1.65]}>
        <Clock />
      </Item>
      {Array.from({ length: 6 }, (_, i) => {
        const x = -1.95 + (i % 3) * 1.15,
          z = i < 3 ? -0.95 : -0.3;
        return (
          <Item key={i} at={[x, 0.04, z]} delay={0.16 + i * 0.035}>
            <Cushion color={colors[i % 4]!} />
            <Reveal fade={i > 1} start={0.15 + i * 0.08}>
              <Meditator color={colors[i % 4]!} />
            </Reveal>
          </Item>
        );
      })}
      <Item at={[1.75, 0.04, -0.75]} delay={0.4}>
        <Character pose="point" mood="determined" rotationY={-2.1} />
        <Notebook position={[0.35, 0.02, 0.2]} />
      </Item>
      <Item at={[2.25, 0.04, -0.2]}>
        <Plant s={1.5} />
      </Item>
    </group>
  );
}

function CommunityWorld() {
  return (
    <group>
      <Card size={[5.3, 2.1]} position={[0, 0, -0.85]} color={P.grass} />
      <Card size={[0.55, 2.0]} position={[-0.45, 0.004, -0.85]} color={P.stone} rotationY={0.35} />
      <Item at={[-1.75, 0.03, -1.7]} delay={0.05}>
        <Signboard
          lines={["BACKWITHBRAIN", "MEDITATION & MIND FITNESS"]}
          width={1.35}
          color={P.forest}
        />
      </Item>
      {[
        [-2.4, -1.5, 0.95],
        [-0.3, -1.85, 1.1],
        [2.4, -1.6, 1],
        [2.45, -0.4, 0.7],
      ].map(([x, z, k]) => (
        <Item key={`${x}${z}`} at={[x!, 0.03, z!]}>
          <Tree s={k!} />
        </Item>
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <Item
            key={i}
            at={[1.0 + Math.cos(a) * 0.62, 0.03, -1.15 + Math.sin(a) * 0.42]}
            delay={0.12 + i * 0.03}
          >
            <group rotation-y={-a - Math.PI / 2} scale={0.62}>
              <Box size={[0.42, 0.02, 0.32]} color={colors[i % 4]!} />
              <Meditator color={colors[(i + 1) % 4]!} />
            </group>
          </Item>
        );
      })}
      <Item at={[-2.05, 0.03, -0.55]}>
        <Bench />
        <Mug position={[0.1, 0.12, 0]} />
      </Item>
      <Item at={[-0.75, 0.04, -0.5]} delay={0.4}>
        <Character pose="talk" holding="notebook" rotationY={0.7} walkIn={0.5} />
      </Item>
      <Item at={[-0.15, 0.04, -0.75]} delay={0.45}>
        <Person color="#e07b5b" rotationY={-1.9} />
      </Item>
      <Item at={[-0.3, 0.04, -0.15]} delay={0.45}>
        <Person color="#457b9d" rotationY={-2.4} />
      </Item>
      <Item at={[0.35, 0.04, -0.35]} delay={0.5}>
        <Person color="#e6a817" rotationY={-1.4} />
      </Item>
    </group>
  );
}

/** Two groups joined by a paper bridge; threads appear between partners. */
function BridgeWorld() {
  const left = [
    [-1.95, -1.25],
    [-1.55, -0.75],
    [-2.05, -0.45],
  ];
  const right = [
    [1.95, -1.25],
    [1.55, -0.75],
    [2.05, -0.45],
  ];
  const npc = ["#e07b5b", "#457b9d", "#6b705c", "#b8a9c9", "#e6a817", "#457b9d"];
  return (
    <group>
      <Card size={[5.3, 2.1]} position={[0, 0, -0.85]} color={P.cream} />
      <Card size={[2.05, 2.0]} position={[-1.65, 0.004, -0.85]} color={P.grass} />
      <Card size={[2.05, 2.0]} position={[1.65, 0.004, -0.85]} color={P.grass} />
      <Card size={[1.25, 2.0]} position={[0, 0.002, -0.85]} color={P.sky} />
      <Item at={[0, 0.03, -0.85]} delay={0.08}>
        <Box size={[1.5, 0.05, 0.5]} position={[0, 0.3, 0]} color={P.wood} />
        {[-1, 1].map((sx) => (
          <Box
            key={sx}
            size={[0.42, 0.04, 0.5]}
            position={[sx * 0.93, 0.15, 0]}
            rotation={[0, 0, sx * 0.62]}
            color={P.wood}
          />
        ))}
        {[-0.24, 0.24].map((z) => (
          <group key={z}>
            <Box size={[1.5, 0.03, 0.03]} position={[0, 0.55, z]} color={P.woodDark} />
            {[-0.7, -0.35, 0, 0.35, 0.7].map((x) => (
              <Box key={x} size={[0.03, 0.25, 0.03]} position={[x, 0.42, z]} color={P.woodDark} />
            ))}
          </group>
        ))}
      </Item>
      <Item at={[0, 0.03, -1.75]} delay={0.1}>
        <Label text="ACCOUNTABILITY PARTNERS" at={[0, 1.0, 0]} size={[1.9, 0.22]} />
        {[-0.85, 0.85].map((x) => (
          <Box key={x} size={[0.04, 0.9, 0.04]} position={[x, 0.45, -0.02]} color={P.woodDark} />
        ))}
      </Item>
      {left.map(([x, z], i) => (
        <Item key={`l${i}`} at={[x!, 0.04, z!]} delay={0.2 + i * 0.04}>
          <Person color={npc[i]!} rotationY={1.2} />
        </Item>
      ))}
      {right.map(([x, z], i) => (
        <Item key={`r${i}`} at={[x!, 0.04, z!]} delay={0.2 + i * 0.04}>
          <Person color={npc[i + 3]!} rotationY={-1.2} />
        </Item>
      ))}
      <Reveal start={0.35}>
        {left.map(([x, z], i) => (
          <Thread
            key={i}
            from={[x! + 0.1, 0.5, z!]}
            to={[right[i]![0]! - 0.1, 0.5, right[i]![1]!]}
            radius={0.008}
          />
        ))}
      </Reveal>
      <Item at={[0, 0.33, -0.85]} delay={0.4}>
        <Character pose="bridge" mood="determined" walkIn={0.6} />
      </Item>
    </group>
  );
}
function DailyDetoxWorld() {
  return (
    <group>
      <Floor />
      <Item at={[-2, 1.25, -1.7]}>
        <Clock />
      </Item>
      <Item at={[2, 1.25, -1.7]}>
        <Clock moon />
      </Item>
      <Item at={[0, 0.03, -1.7]}>
        <Label text="DAILY DETOX" at={[0, 1.4, 0]} size={[1.5, 0.22]} />
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i} position={[-1.4 + i * 0.56, 0.95, 0]}>
            <Reveal fade={i > 2} start={0.35 + i * 0.04}>
              <Label text={i < 3 ? "MORNING" : "EVENING"} at={[0, 0, 0]} size={[0.49, 0.3]} />
            </Reveal>
          </group>
        ))}
      </Item>
      <Item at={[-1.5, 0.03, -0.95]}>
        <Board title="CONTENT CALENDAR" cols={4} width={1.5} />
        <Label text="PAUSED" at={[0.35, 0.55, 0.07]} size={[0.55, 0.2]} />
      </Item>
      <Item at={[1.55, 0.03, -0.95]}>
        <Board title="FEEDBACK" width={1.5} />
        <Bubble at={[-0.3, 0.5, 0.1]} />
        <Bubble at={[0.3, 0.76, 0.1]} />
      </Item>
      <Item at={[0, 0.03, -0.35]}>
        <Desk w={1.2} />
        <group position={[0, 0, -0.2]}>
          <Chair />
        </group>
        <Character pose="listen" holding="notebook" position={[0, 0.03, -0.2]} />
        <group position={[0, 0, 0.42]} rotation-y={Math.PI}>
          <Chair />
        </group>
        <Person sitting position={[0, 0.16, 0.42]} rotationY={Math.PI} color="#e07b5b" />
        <Person sitting position={[0.55, 0.0, 0.32]} rotationY={-2.5} color="#457b9d" />
        <Phone
          position={[-0.35, 0.28, 0.02]}
          rotation={[-0.4, 0.3, 0]}
          lines={["CALL", "…"]}
          s={0.6}
        />
        <Notebook position={[0.35, 0.28, 0]} />
        <Mug position={[-0.12, 0.28, 0.06]} />
        <Label text="REVIEW" at={[0.48, 0.53, 0]} size={[0.6, 0.18]} />
      </Item>
    </group>
  );
}
function ResearchWorld() {
  return (
    <group>
      <Floor />
      <Item at={[-1.85, 0.03, -1.6]}>
        <Desk w={1} />
        <Label text="SURVEYS" at={[0, 0.8, 0]} />
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            size={[0.32, 0.025, 0.23]}
            position={[-0.2 + i * 0.025, 0.3 + i * 0.03, 0]}
            color={i % 2 ? P.paper : P.ivory}
          />
        ))}
      </Item>
      <Item at={[-0.1, 0.03, -1.65]}>
        <Board title="COMPETITORS" width={1.6} cols={4} />
      </Item>
      <Item at={[1.85, 0.03, -1.6]}>
        <Board title="WELLNESS" width={1.2} />
        <Tree s={0.35} />
      </Item>
      <Item at={[-1.6, 0.03, -0.55]}>
        <Desk w={1} />
        <Chair />
        <group position={[0, 0, 0.35]} rotation-y={Math.PI}>
          <Chair />
        </group>
        <Notebook position={[0.2, 0.28, 0]} />
        <Character stage={4} pose="sit" holding="notebook" position={[0, 0.02, -0.2]} />
        <Person sitting position={[0, 0.02, 0.35]} rotationY={Math.PI} color={P.dusty} />
        <Label text="INTERVIEWS" at={[-0.3, 0.85, 0]} />
      </Item>
      <Item at={[0.35, 0.03, -0.55]}>
        <Frame title="SKETCHES" />
      </Item>
      <Item at={[1.85, 0.03, -0.5]}>
        <Desk w={0.85} />
        <Label text="PRICING" at={[0, 0.75, 0]} />
        {[-0.2, 0, 0.2].map((x) => (
          <Notebook key={x} position={[x, 0.29, 0]} />
        ))}
      </Item>
    </group>
  );
}
const concepts = ["MOOD CHECK-IN", "SLEEP JOURNEY", "GUIDED WORKOUT", "HR DASHBOARD"];
function DesignWorld() {
  return (
    <group>
      <Floor />
      {concepts.map((title, i) => (
        <Item key={title} at={[-1.95 + i * 1.3, 0.03, -1.7]} delay={i * 0.06}>
          <Frame title={title} />
          <Label text="CONCEPT" at={[0, 0.39, 0.07]} size={[0.65, 0.15]} />
        </Item>
      ))}
      <Item at={[-1.7, 0.03, -0.6]}>
        <Frame title="USER FLOWS" mode="flow" />
      </Item>
      <Item at={[1.7, 0.03, -0.6]}>
        <Frame title="WIREFRAMES" />
      </Item>
      <Item at={[0, 0.03, -0.4]}>
        <Desk w={1.15} />
        <Laptop position={[0, 0.28, 0]} />
        <Chair />
        <Notebook position={[0.35, 0.28, 0]} />
        <Mug position={[-0.38, 0.28, 0.05]} />
      </Item>
      <Item at={[1.2, 0.04, -0.2]} delay={0.4}>
        <Character pose="draw" rotationY={2.55} />
      </Item>
      <Item at={[-0.75, 0.04, -0.15]}>
        <Plant s={1.4} />
      </Item>
    </group>
  );
}
function BeyondWorld() {
  return (
    <group>
      <Floor />
      <Item at={[-1.8, 0.03, -1.5]}>
        <Frame title="AI ASSIST" mode="prompt" />
        <Desk w={1.1} />
        <Laptop position={[0.2, 0.28, 0.08]} />
        <mesh position={[0.45, 1.1, 0.07]} material={mat(P.mustard, { emissive: 0.25 })}>
          <octahedronGeometry args={[0.08]} />
        </mesh>
        <Character stage={4} pose="work" position={[0, 0, 0.38]} rotationY={Math.PI} />
      </Item>
      <Item at={[-0.15, 0.03, -1.65]}>
        <Frame title="PITCH" mode="flow" />
        <Thread from={[-0.4, 0, 0]} to={[0, 1, 0]} color={P.wood} />
        <Thread from={[0.4, 0, 0]} to={[0, 1, 0]} color={P.wood} />
      </Item>
      <Item at={[1.65, 0.03, -1.65]}>
        <Frame title="WEBSITE" mode="web" />
      </Item>
      <Item at={[-1.4, 0.03, -0.35]}>
        <Desk w={1.1} />
        <Box size={[0.45, 0.025, 0.28]} position={[-0.1, 0.3, 0]} color={P.charcoal} />
        <Box size={[0.36, 0.01, 0.2]} position={[-0.1, 0.32, 0]} color={P.dusty} />
        <Thread from={[0.2, 0.33, -0.1]} to={[0.35, 0.33, 0.1]} color={P.woodDark} />
        {colors.map((c, i) => (
          <Box
            key={c}
            size={[0.1, 0.015, 0.09]}
            color={c}
            position={[-0.3 + i * 0.16, 0.3, 0.12]}
          />
        ))}
      </Item>
      <Item at={[0.25, 0.03, -0.5]}>
        <Box size={[0.5, 0.3, 0.4]} position={[0, 0.15, 0]} color={P.wood} />
        <Box size={[0.24, 0.46, 0.04]} position={[0, 0.55, 0]} color={P.charcoal} />
        <Box size={[0.19, 0.36, 0.01]} position={[0, 0.55, 0.03]} color={P.paper} />
        <Box size={[0.12, 0.12, 0.015]} position={[0, 0.6, 0.04]} color={P.olive} />
      </Item>
      <Item at={[1.4, 0.03, -0.4]}>
        <Person color={P.terracotta} rotationY={-0.7} />
        <Person position={[0.6, 0, -0.1]} color={P.olive} rotationY={0.7} />
        <Bubble at={[0.3, 0.95, 0]} />
      </Item>
    </group>
  );
}
function ProjectsWorld() {
  return (
    <group>
      <Floor />
      <Item at={[-1.4, 0.03, -1.15]}>
        <Label text="SMARAN" at={[0, 1.2, 0]} />
        <Desk w={1.45} />
        <Box size={[0.65, 0.06, 0.3]} position={[-0.18, 0.32, 0]} color={P.wood} />
        {Array.from({ length: 6 }, (_, i) => (
          <group
            key={i}
            position={[-0.39 + (i % 3) * 0.21, 0.36, -0.07 + Math.floor(i / 3) * 0.14]}
          >
            <Box size={[0.18, 0.025, 0.11]} color={P.ivory} />
            <Box
              size={[0.06, 0.025, 0.035]}
              position={[0, 0.025, 0]}
              color={i % 2 ? P.lavender : P.terracotta}
            />
          </group>
        ))}
        <Box size={[0.17, 0.32, 0.12]} position={[0.5, 0.45, 0]} color={P.forest} />
        <group position={[0.58, 0.58, 0.1]}>
          <Waves />
        </group>
        {["Hindi", "Hinglish", "English"].map((text, i) => (
          <Bubble key={text} text={text} at={[-0.48 + i * 0.53, 0.91, 0.05]} />
        ))}
      </Item>
      <Item at={[-2, 0.03, -0.25]}>
        <Box size={[0.42, 0.36, 0.3]} position={[0, 0.18, 0]} color={P.paper} />
        <mesh position={[0, 0.48, 0]} rotation-y={Math.PI / 4} material={mat(P.terracotta)}>
          <coneGeometry args={[0.36, 0.26, 4]} />
        </mesh>
        <group position={[0.6, 0, 0]}>
          <Chair />
          <Person sitting color={P.terracotta} position={[0, 0.03, 0]} />
        </group>
      </Item>
      <Item at={[1.55, 0.03, -1.1]}>
        <Desk w={1.4} />
        <Frame title="MIND GAMES" mode="puzzle" />
        <Box
          size={[0.2, 0.03, 0.2]}
          position={[-0.35, 0.3, 0.08]}
          rotation={[0, 0.4, 0]}
          color={P.lavender}
        />
      </Item>
      <Item at={[0.15, 0.03, -0.3]}>
        <Character stage={5} pose="think" holding="notebook" mood="curious" />
      </Item>
    </group>
  );
}
function Skyline({ distant = false }: { distant?: boolean }) {
  return (
    <>
      {[0.45, 0.8, 0.58, 1, 0.65].map((h, i) => (
        <group key={i} position={[-0.7 + i * 0.34, 0, 0]}>
          <Box
            size={[0.25, h, 0.22]}
            position={[0, h / 2, 0]}
            color={distant ? P.stone : i % 2 ? P.dusty : P.paper}
          />
          {!distant && (
            <Box size={[0.13, 0.05, 0.015]} position={[0, h * 0.65, 0.12]} color={P.woodDark} />
          )}
        </group>
      ))}
    </>
  );
}

/** A monitor whose text lines type themselves out, over and over. */
function TypingScreen() {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    const k = (worldState.time * 0.25) % 1;
    g.current.children.forEach((c, i) => {
      c.scale.x = Math.max(0.001, THREE.MathUtils.clamp(k * 5 - i, 0, 1));
    });
  });
  return (
    <group>
      <Box size={[0.62, 0.42, 0.035]} position={[0, 0.6, 0]} color={P.charcoal} />
      <Box size={[0.56, 0.36, 0.008]} position={[0, 0.6, 0.02]} color={P.ivory} emissive={0.25} />
      <Box size={[0.04, 0.16, 0.04]} position={[0, 0.34, -0.01]} color={P.charcoal} />
      <group ref={g}>
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} position={[-0.24, 0.72 - i * 0.06, 0.027]}>
            <Box
              size={[i % 2 ? 0.34 : 0.46, 0.022, 0.004]}
              position={[(i % 2 ? 0.34 : 0.46) / 2, 0, 0]}
              color={i === 4 ? P.forest : P.charcoal}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

function VoiceWorld() {
  return (
    <group>
      <Floor />
      <Item at={[0, 0.03, -1.78]} delay={0.04}>
        <Box size={[4.8, 1.2, 0.05]} position={[0, 0.6, 0]} color={P.paper} />
        <Label text="BENGALURU OFFICE" at={[-1.35, 1.05, 0.035]} size={[1.5, 0.18]} />
        <Box size={[1.5, 0.7, 0.02]} position={[1.2, 0.62, 0.03]} color={P.sky} />
        <group position={[1.2, 0.27, 0.05]} scale={0.6}>
          <Skyline distant />
        </group>
      </Item>
      <Item at={[-1.75, 0.03, -1.35]}>
        <Frame title="IDEAS → INSTRUCTIONS" mode="prompt" />
      </Item>
      <Item at={[0.35, 0.03, -0.8]} delay={0.2}>
        <Desk w={1.4} />
        <group position={[0.25, 0.27, 0]} rotation-y={-Math.PI / 2 + 0.45}>
          <TypingScreen />
        </group>
        <Box size={[0.3, 0.015, 0.1]} position={[-0.05, 0.285, 0.05]} color={P.charcoal} />
        <Mug position={[0.55, 0.28, 0.08]} />
        <Plant position={[-0.55, 0.28, -0.05]} s={0.8} />
      </Item>
      <Item at={[-0.3, 0.03, -0.8]} delay={0.4}>
        <group rotation-y={Math.PI / 2 - 0.35}>
          <Chair />
        </group>
        <Character pose="dictate" rotationY={Math.PI / 2 - 0.35} />
      </Item>
      <Item at={[-0.55, 0.65, -0.65]} delay={0.5}>
        <Waves />
      </Item>
      <Item at={[2.05, 0.03, -0.35]}>
        <Plant s={1.8} />
      </Item>
    </group>
  );
}

/** Warm light that comes up slowly as the camera arrives. */
function RoomLight({ at }: { at: V3 }) {
  const l = useRef<THREE.PointLight>(null!);
  useFrame(() => {
    l.current.intensity = 0.7 + 0.8 * ramp(0, 0.3, worldState.hold) * worldState.rise;
  });
  return (
    <pointLight ref={l} position={at} color="#ffb36b" distance={4.5} decay={1.6} intensity={0.7} />
  );
}

/** Her phone rings in short bursts by the bed. */
function RingingPhone() {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    const t = worldState.time;
    g.current.rotation.z = t % 3 < 0.9 ? Math.sin(t * 42) * 0.09 : 0;
  });
  return (
    <group ref={g}>
      <Phone
        position={[0, 0, 0]}
        rotation={[-0.25, -0.3, 0]}
        lines={["SMARAN", "दवाई का", "समय"]}
        s={0.55}
      />
    </group>
  );
}

/** A green tick over her once the medicine is taken. */
function TakenTick() {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    const k = ramp(0.45, 0.6, worldState.hold);
    g.current.scale.setScalar(Math.max(0.001, k));
    g.current.visible = k > 0.001;
  });
  return (
    <group ref={g}>
      <mesh rotation-x={Math.PI / 2} material={mat(P.forest, { emissive: 0.35 })}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 20]} />
      </mesh>
      <Box
        size={[0.05, 0.015, 0.025]}
        position={[-0.025, -0.01, 0.012]}
        rotation={[0, 0, -0.8]}
        color={P.ivory}
      />
      <Box
        size={[0.1, 0.015, 0.025]}
        position={[0.025, 0.012, 0.012]}
        rotation={[0, 0, 0.9]}
        color={P.ivory}
      />
    </group>
  );
}

function SmaranWorld() {
  return (
    <group>
      <Card size={[5.3, 2.1]} position={[0, 0, -0.85]} color={P.cream} />
      <Card size={[1.8, 1.0]} position={[0.9, 0.004, -0.75]} color={P.terracotta} />
      <RoomLight at={[0.6, 1.6, -0.9]} />
      <Item at={[0, 0.03, -1.8]} delay={0.04}>
        <Box size={[4.8, 1.25, 0.05]} position={[0, 0.62, 0]} color="#e6cfa8" />
        <Box size={[0.8, 0.55, 0.02]} position={[-1.6, 0.75, 0.03]} color={P.sky} />
        <Box size={[0.84, 0.04, 0.04]} position={[-1.6, 0.75, 0.04]} color={P.wood} />
        <Label text="SMARAN" at={[0.15, 1.05, 0.035]} size={[0.9, 0.2]} />
      </Item>
      {/* Her bed, with her sitting on it. */}
      <Item at={[1.75, 0.03, -1.2]} delay={0.1}>
        <Box size={[1.1, 0.22, 1.35]} position={[0, 0.11, 0]} color={P.wood} />
        <Box size={[1.05, 0.12, 1.3]} position={[0, 0.28, 0]} color={P.ivory} />
        <Box size={[1.07, 0.06, 0.8]} position={[0, 0.36, 0.25]} color={P.lavender} />
        <Box size={[0.45, 0.1, 0.25]} position={[0, 0.39, -0.45]} color={P.white} />
        <Box size={[1.1, 0.55, 0.06]} position={[0, 0.4, -0.66]} color={P.woodDark} />
        <Person position={[-0.32, 0.34, 0.05]} color={P.pink} sitting s={1.5} rotationY={-0.6} />
        <group position={[-0.32, 0.95, 0.05]}>
          <TakenTick />
        </group>
      </Item>
      {/* Bedside table: medicine organiser and the ringing phone. */}
      <Item at={[0.75, 0.03, -1.45]} delay={0.16}>
        <Box size={[0.5, 0.42, 0.4]} position={[0, 0.21, 0]} color={P.wood} />
        <Box size={[0.4, 0.05, 0.25]} position={[-0.02, 0.45, 0.02]} color={P.forest} />
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i} position={[-0.15 + (i % 3) * 0.12, 0.48, -0.03 + Math.floor(i / 3) * 0.1]}>
            <Box size={[0.1, 0.02, 0.08]} color={P.ivory} />
            <Box
              size={[0.04, 0.02, 0.03]}
              position={[0, 0.018, 0]}
              color={i % 2 ? P.lavender : P.terracotta}
            />
          </group>
        ))}
        <group position={[0.17, 0.44, 0.05]}>
          <RingingPhone />
        </group>
        <group position={[0.3, 0.75, 0.1]} scale={0.7}>
          <Waves />
        </group>
        {["Hindi", "Hinglish", "English"].map((text, i) => (
          <Bubble key={text} text={text} at={[-0.4 + i * 0.5, 1.05, 0.05]} />
        ))}
      </Item>
      <Item at={[-1.25, 0.03, -0.8]} delay={0.22}>
        <Desk w={1.1} />
        <Laptop position={[0, 0.28, 0.03]} rotationY={Math.PI} screen={P.mustard} />
        <Mug position={[0.38, 0.28, 0.03]} color={P.terracotta} />
        <Plant position={[-0.4, 0.28, -0.05]} s={0.75} />
        <group position={[0, 0, -0.25]}>
          <Chair />
        </group>
        <Character pose="work" position={[0, 0.02, -0.25]} />
      </Item>
      <Item at={[-2.25, 0.03, -0.35]}>
        <Plant s={1.6} />
      </Item>
    </group>
  );
}

/* ------------------------------------------------ 17: an office that speaks */

const DESKS: V3[] = [-1.8, -0.6, 0.6, 1.8].flatMap((x) =>
  [-1.55, -1.05, -0.55].map((z): V3 => [x, 0.03, z]),
);
/** Order in which desks start speaking: spreading out from the front centre. */
const SPEAK_ORDER = DESKS.map((d, i) => ({ i, k: Math.hypot(d[0] * 0.8, d[2] + 0.55) }))
  .sort((a, b) => a.k - b.k)
  .reduce<number[]>((o, d, n) => ((o[d.i] = n), o), []);
const CYCLE = 16;

/** One desk: a person speaking, a waveform above them, words appearing on screen. */
function SpeakingDesk({ index }: { index: number }) {
  const wave = useRef<THREE.Group>(null!);
  const text = useRef<THREE.Group>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    const t = worldState.time;
    // Reduce motion (time frozen at 0): the whole office is already speaking.
    const since = scrollState.reducedMotion ? 99 : (t % CYCLE) - SPEAK_ORDER[index]! * 0.75;
    const on = since > 0;
    wave.current.visible = on;
    wave.current.children.forEach((b, i) => {
      b.scale.y = scrollState.reducedMotion
        ? 0.7
        : 0.35 + Math.abs(Math.sin(t * 7 + i * 1.3 + index)) * 0.9;
    });
    text.current.children.forEach((l, i) => {
      l.scale.x = Math.max(0.001, THREE.MathUtils.clamp(on ? since * 1.2 - i * 0.6 : 0, 0, 1));
    });
    (glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 0.55 : 0.08;
  });
  return (
    <group>
      <Desk w={0.62} />
      {/* Monitor facing the person (and the camera). */}
      <Box size={[0.3, 0.2, 0.02]} position={[0.06, 0.4, -0.08]} color={P.charcoal} />
      <Box size={[0.03, 0.1, 0.03]} position={[0.06, 0.29, -0.09]} color={P.charcoal} />
      <mesh ref={glow} position={[0.06, 0.4, -0.068]}>
        <boxGeometry args={[0.27, 0.17, 0.004]} />
        <meshStandardMaterial
          color={P.ivory}
          emissive={P.ivory}
          emissiveIntensity={0.08}
          roughness={0.8}
        />
      </mesh>
      <group ref={text}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[-0.055, 0.45 - i * 0.045, -0.064]}>
            <Box
              size={[i === 1 ? 0.16 : 0.22, 0.018, 0.003]}
              position={[(i === 1 ? 0.16 : 0.22) / 2, 0, 0]}
              color={i === 2 ? P.forest : P.charcoal}
            />
          </group>
        ))}
      </group>
      <Person
        position={[-0.08, 0, 0.2]}
        color={colors[index % colors.length]!}
        sitting
        s={1.25}
        rotationY={Math.PI}
      />
      <group ref={wave} position={[-0.08, 0.5, 0.2]}>
        {[-0.045, -0.015, 0.015, 0.045].map((x) => (
          <mesh key={x} position={[x, 0, 0]} material={mat(P.mustard, { emissive: 0.7 })}>
            <boxGeometry args={[0.018, 0.09, 0.018]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Brighter than every other chapter: a warm golden wash that comes up as the world rises. */
function GoldenGlow() {
  const room = useRef<THREE.PointLight>(null!);
  const door = useRef<THREE.PointLight>(null!);
  useFrame(() => {
    const k = ramp(0, 0.35, worldState.hold) * worldState.rise;
    room.current.intensity = 1.2 + 1.6 * k;
    door.current.intensity = 0.6 + 1.1 * k;
  });
  return (
    <>
      <pointLight
        ref={room}
        position={[0, 1.7, -0.9]}
        color="#ffd27a"
        distance={7}
        decay={1.2}
        intensity={1.2}
      />
      <pointLight
        ref={door}
        position={[2.05, 0.9, -0.2]}
        color="#ffc36b"
        distance={3.2}
        decay={1.4}
        intensity={0.6}
      />
    </>
  );
}

/** The office doorway on the right; Durgesh stands on the threshold, looking in. */
function Doorway() {
  return (
    <group>
      <Box size={[0.07, 1, 0.07]} position={[0, 0.5, -0.62]} color={P.woodDark} />
      <Box size={[0.07, 1, 0.07]} position={[0, 0.5, 0.22]} color={P.woodDark} />
      <Box size={[0.09, 0.08, 0.92]} position={[0, 1.02, -0.2]} color={P.woodDark} />
      {/* The door, swung open to the back so Durgesh stays in view. */}
      <Box size={[0.03, 0.92, 0.4]} position={[0.18, 0.47, -0.8]} rotation={[0, 1.1, 0]} color={P.forest} />
      {/* A warm pool of light spilling over the threshold. */}
      <mesh position={[0.05, 0.006, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.82]} />
        <meshStandardMaterial
          color="#ffe2a0"
          emissive="#ffc55a"
          emissiveIntensity={0.6}
          transparent
          opacity={0.75}
        />
      </mesh>
    </group>
  );
}

function NextWorld() {
  return (
    <group>
      <GoldenGlow />
      <Floor />
      <Item at={[0, 0.03, -1.95]} delay={0.02}>
        {/* A golden halo behind the banner. */}
        <mesh position={[0, 0.55, -0.02]}>
          <planeGeometry args={[5.1, 1.15]} />
          <meshStandardMaterial color="#ffd889" emissive="#ffbf4d" emissiveIntensity={0.55} />
        </mesh>
        <Box size={[4.9, 0.9, 0.05]} position={[0, 0.45, 0]} color={P.paper} />
        <Label text="JOIN WISPR FLOW" at={[0, 0.7, 0.035]} size={[1.5, 0.22]} />
      </Item>
      {DESKS.map((at, i) => (
        <Item key={i} at={at} delay={0.06 + (i % 3) * 0.06}>
          <SpeakingDesk index={i} />
        </Item>
      ))}
      <Item at={[2.3, 0.03, 0]} delay={0.3}>
        <Doorway />
      </Item>
      {/* Standing just outside the door, turned toward the speaking office. */}
      <Item at={[2.48, 0.04, -0.2]} delay={0.4}>
        <Character pose="look" mood="happy" rotationY={-Math.PI / 2 - 0.25} walkIn={0} />
      </Item>
      <Item at={[-2.5, 0.03, -0.3]}>
        <Plant s={1.6} />
      </Item>
    </group>
  );
}

export const LATE_WORLDS: Record<string, WorldDef> = {
  clarity: {
    C: ClarityWorld,
    anchors: {
      schedule: [-1.38, 0.95, -1.66],
      session: [-1.95, 0.45, -0.95],
      dropoff: [1.38, 0.5, -1.66],
    },
  },
  "daily-detox": {
    C: DailyDetoxWorld,
    anchors: {
      slots: [0.28, 0.98, -1.7],
      feedback: [1.25, 0.53, -0.85],
      review: [0.35, 0.33, -0.35],
    },
  },
  research: {
    C: ResearchWorld,
    anchors: {
      surveys: [-2, 0.45, -1.6],
      interviews: [-1.4, 0.33, -0.55],
      competitors: [-0.1, 0.6, -1.6],
      pricing: [1.85, 0.34, -0.5],
    },
  },
  design: {
    C: DesignWorld,
    anchors: {
      flows: [-1.7, 0.71, -0.55],
      wireframes: [1.7, 0.71, -0.55],
      concepts: [-1.95, 0.7, -1.65],
      hr: [1.95, 0.7, -1.65],
    },
  },
  beyond: {
    C: BeyondWorld,
    anchors: {
      ai: [-1.8, 0.71, -1.45],
      "design-tools": [-1.5, 0.35, -0.35],
      prototype: [0.25, 0.58, -0.46],
      deck: [-0.15, 0.71, -1.6],
      website: [1.65, 0.71, -1.6],
    },
  },
  projects: {
    C: ProjectsWorld,
    anchors: {
      smaran: [-1.58, 0.43, -1.15],
      languages: [-1.35, 0.94, -1.1],
      mindgames: [1.55, 0.7, -1.05],
    },
  },
  community: {
    C: CommunityWorld,
    anchors: {
      park: [-1.75, 1.0, -1.7],
      circle: [1.0, 0.4, -1.15],
      talking: [-0.75, 0.75, -0.5],
    },
  },
  accountability: {
    C: BridgeWorld,
    anchors: {
      bridge: [0, 0.36, -0.6],
      left: [-1.75, 0.5, -0.8],
      right: [1.75, 0.5, -0.8],
    },
  },
  voice: {
    C: VoiceWorld,
    anchors: {
      mic: [-0.3, 0.8, -0.8],
      screen: [0.4, 0.75, -0.75],
      board: [-1.75, 1.0, -1.33],
    },
  },
  smaran: {
    C: SmaranWorld,
    anchors: {
      phone: [0.92, 0.7, -1.4],
      voice: [1.05, 0.85, -1.35],
      tick: [1.43, 1.05, -1.15],
    },
  },
  next: {
    C: NextWorld,
    anchors: {
      office: [0, 0.82, -1.92],
    },
  },
};
