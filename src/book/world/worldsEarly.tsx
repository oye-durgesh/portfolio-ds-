/** Seven early chapters, built as lightweight folding paper miniatures. */
import { useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldState } from "../scrollState";
import { lerp, smoothstep } from "../timeline";
import { Character } from "./Character";
import {
  P,
  mat,
  Box,
  Card,
  PopUp,
  TextPanel,
  Tree,
  House,
  Desk,
  Laptop,
  Notebook,
  Bench,
  Person,
  Dog,
  Building,
  Signboard,
  Mug,
  Plant,
  Bars,
  Phone,
  type V3,
  type WorldDef,
} from "./kit";

/** Compatibility hook: updates React only when the threshold is crossed. */
export function useHoldPast(threshold: number) {
  const [past, setPast] = useState(false);
  const previous = useRef(false);
  useFrame(() => {
    const next = worldState.hold > threshold;
    if (next !== previous.current) {
      previous.current = next;
      setPast(next);
    }
  });
  return past;
}

function Label({
  text,
  position = [0, 0, 0],
  width = 0.9,
  height = 0.18,
  color = P.forest,
}: {
  text: string;
  position?: V3;
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <TextPanel
      lines={[text]}
      position={position}
      size={[width, height]}
      opts={{ bg: color, fg: P.ivory, font: "sans", size: 64 }}
    />
  );
}

function Ground({ indoor = false }: { indoor?: boolean }) {
  return <Card size={[5.2, 2.1]} position={[0, 0, -0.85]} color={indoor ? P.cream : P.olive} />;
}

function Piece({
  position,
  children,
  delay = 0.15,
}: {
  position: V3;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <PopUp position={position} delay={delay}>
      {children}
    </PopUp>
  );
}

function Road({
  position,
  size,
  rotationY = 0,
}: {
  position: V3;
  size: [number, number];
  rotationY?: number;
}) {
  return <Card position={position} size={size} color={P.road} rotationY={rotationY} />;
}

function AcademicBlock({
  width = 1.6,
  height = 0.9,
  color = P.cream,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <group>
      <Box size={[width, height, 0.36]} position={[0, height / 2, 0]} color={color} />
      <Box size={[width + 0.08, 0.05, 0.46]} position={[0, height, 0]} color={P.terracotta} />
      {[0.32, 0.7].map((row) => (
        <group key={row}>
          {[-0.36, -0.12, 0.12, 0.36].map((x) => (
            <Box
              key={x}
              size={[width * 0.15, 0.14, 0.015]}
              position={[x * width, height * row, 0.19]}
              color={P.dusty}
            />
          ))}
          <Box
            size={[width, 0.025, 0.12]}
            position={[0, height * row - 0.1, 0.22]}
            color={P.ivory}
          />
        </group>
      ))}
      <Box size={[0.17, 0.25, 0.02]} position={[0, 0.125, 0.2]} color={P.woodDark} />
    </group>
  );
}

function Gate() {
  return (
    <group>
      {[-0.65, 0.65].map((x) => (
        <Box key={x} size={[0.13, 0.95, 0.18]} position={[x, 0.475, 0]} color={P.terracotta} />
      ))}
      <Box size={[1.45, 0.2, 0.2]} position={[0, 0.96, 0]} color={P.cream} />
      <Label text="IIT" position={[0, 0.96, 0.11]} width={0.8} />
      {[-0.48, -0.32, -0.16, 0, 0.16, 0.32, 0.48].map((x) => (
        <Box key={x} size={[0.025, 0.65, 0.035]} position={[x, 0.39, 0.03]} color={P.charcoal} />
      ))}
      {[0.17, 0.62].map((y) => (
        <Box key={y} size={[1.2, 0.035, 0.04]} position={[0, y, 0.03]} color={P.charcoal} />
      ))}
      <Box size={[0.08, 0.1, 0.05]} position={[0, 0.4, 0.065]} color={P.mustard} />
    </group>
  );
}

/** A reusable corkboard: anchors land on its actual paper surface. */
function Board({ title, color = P.wood }: { title: string; color?: string }) {
  return (
    <group>
      <Box size={[1, 0.8, 0.06]} position={[0, 0.65, 0]} color={color} />
      <Label text={title} position={[0, 0.94, 0.035]} width={0.92} height={0.15} />
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[((i % 3) - 1) * 0.29, 0.72 - Math.floor(i / 3) * 0.23, 0.04]}>
          <Box size={[0.23, 0.17, 0.01]} color={i % 2 ? P.mustard : P.ivory} />
          <Box size={[0.14, 0.012, 0.005]} position={[0, 0.025, 0.009]} color={P.dusty} />
          <Box size={[0.1, 0.012, 0.005]} position={[-0.02, -0.02, 0.009]} color={P.olive} />
        </group>
      ))}
      {[-0.37, 0.37].map((x) => (
        <Box key={x} size={[0.035, 0.25, 0.035]} position={[x, 0.125, 0]} color={P.wood} />
      ))}
    </group>
  );
}

function Books({ position = [0, 0, 0] }: { position?: V3 }) {
  return (
    <group position={position}>
      {[P.forest, P.mustard, P.lavender].map((color, i) => (
        <group key={color} position={[i % 2 ? 0.02 : 0, i * 0.045, 0]}>
          <Box size={[0.26, 0.04, 0.18]} color={color} />
          <Box size={[0.22, 0.025, 0.012]} position={[0.015, 0, 0.092]} color={P.ivory} />
        </group>
      ))}
    </group>
  );
}

function Lamp() {
  return (
    <group>
      <Box size={[0.15, 0.025, 0.12]} color={P.wood} />
      <Box size={[0.025, 0.27, 0.025]} position={[0, 0.14, 0]} color={P.wood} />
      <mesh position={[0, 0.3, 0]} material={mat(P.mustard)}>
        <coneGeometry args={[0.12, 0.13, 8, 1, true]} />
      </mesh>
      <mesh position={[0, 0.27, 0]} material={mat(P.ivory)}>
        <sphereGeometry args={[0.035, 8, 6]} />
      </mesh>
    </group>
  );
}

function Screen({ listing = false }: { listing?: boolean }) {
  return (
    <group>
      <Box size={[0.43, 0.3, 0.035]} position={[0, 0.47, -0.06]} color={P.charcoal} />
      <Box size={[0.39, 0.26, 0.008]} position={[0, 0.47, -0.038]} color={P.ivory} />
      <Box size={[0.025, 0.15, 0.025]} position={[0, 0.33, -0.06]} color={P.wood} />
      <Box size={[0.22, 0.015, 0.12]} position={[0, 0.28, -0.02]} color={P.charcoal} />
      {listing ? (
        <>
          <Box size={[0.1, 0.15, 0.01]} position={[-0.1, 0.48, -0.028]} color={P.forest} />
          <Box size={[0.06, 0.05, 0.01]} position={[-0.1, 0.48, -0.018]} color={P.cream} />
          <Label
            text="★ ★ ★"
            position={[0.075, 0.43, -0.027]}
            width={0.19}
            height={0.065}
            color={P.wood}
          />
          <Box size={[0.15, 0.02, 0.01]} position={[0.075, 0.52, -0.027]} color={P.olive} />
        </>
      ) : (
        Array.from({ length: 5 }, (_, i) => (
          <Box
            key={i}
            size={[i % 2 ? 0.19 : 0.27, 0.018, 0.006]}
            position={[i % 2 ? 0.02 : -0.02, 0.55 - i * 0.04, -0.03]}
            color={i % 2 ? P.terracotta : P.forest}
          />
        ))
      )}
    </group>
  );
}

function Stock({ count = 6 }: { count?: number }) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[((i % 3) - 1) * 0.24, 0.11 + Math.floor(i / 3) * 0.22, 0]}>
          <Box size={[0.22, 0.21, 0.24]} color={P.wood} />
          <Box size={[0.035, 0.215, 0.245]} color={P.mustard} />
          <Box size={[0.08, 0.06, 0.01]} position={[0.06, 0, 0.126]} color={P.ivory} />
        </group>
      ))}
    </group>
  );
}

/** Hold moves the story forward; time alone drives ambient motion. */
function Walker({
  from,
  to,
  stage,
  notebook = false,
}: {
  from: V3;
  to: V3;
  stage: number;
  notebook?: boolean;
}) {
  const root = useRef<THREE.Group>(null!);
  const standing = useRef<THREE.Group>(null!);
  const walking = useRef<THREE.Group>(null!);
  useFrame(() => {
    const progress = smoothstep(0.35, 0.9, worldState.hold);
    root.current.position.set(
      lerp(from[0], to[0], progress),
      lerp(from[1], to[1], progress),
      lerp(from[2], to[2], progress),
    );
    standing.current.visible = progress <= 0 || progress >= 1;
    walking.current.visible = progress > 0 && progress < 1;
  });
  return (
    <group ref={root} position={from}>
      <PopUp delay={0.35}>
        <group ref={standing}>
          <Character
            stage={stage}
            pose="stand"
            mood="curious"
            {...(notebook ? { holding: "notebook" as const } : {})}
          />
        </group>
        <group ref={walking} visible={false}>
          <Character
            stage={stage}
            pose="walk"
            mood="curious"
            {...(notebook ? { holding: "notebook" as const } : {})}
          />
        </group>
      </PopUp>
    </group>
  );
}

function Rickshaw() {
  return (
    <group>
      <Box size={[0.5, 0.17, 0.28]} position={[0, 0.18, 0]} color={P.forest} />
      <Box size={[0.43, 0.05, 0.31]} position={[-0.035, 0.43, 0]} color={P.mustard} />
      {[-0.18, 0.15].map((x) => (
        <Box key={x} size={[0.025, 0.22, 0.025]} position={[x, 0.32, 0.13]} color={P.wood} />
      ))}
      <Box size={[0.1, 0.14, 0.26]} position={[0.23, 0.27, 0]} color={P.dusty} />
      {[-0.17, 0.2].map((x) =>
        [-0.15, 0.15].map((z) => (
          <mesh
            key={`${x}:${z}`}
            position={[x, 0.08, z]}
            rotation={[Math.PI / 2, 0, 0]}
            material={mat(P.charcoal)}
          >
            <cylinderGeometry args={[0.075, 0.075, 0.035, 8]} />
          </mesh>
        )),
      )}
    </group>
  );
}

export function KanpurWorld() {
  return (
    <group>
      <Ground />
      <Road position={[0, 0.03, -0.35]} size={[4.9, 0.45]} />
      <Road position={[-0.9, 0.035, -0.95]} size={[0.34, 1.2]} />
      <Piece position={[-1.85, 0.04, -1.4]}>
        <House size={[0.85, 0.65, 0.55]} color={P.terracotta} tank />
        <Tree position={[-0.45, 0, 0.2]} s={0.8} />
      </Piece>
      <Piece position={[0.35, 0.04, -1.4]} delay={0.08}>
        <AcademicBlock width={2} height={0.95} />
        <Label
          text="SRI RAM EDUCATION CENTER"
          position={[0, 0.83, 0.24]}
          width={1.9}
          height={0.16}
        />
        <Box size={[0.8, 0.04, 0.3]} position={[0, 0.02, 0.31]} color={P.ivory} />
      </Piece>
      <Piece position={[1.95, 0.04, -1.3]}>
        <House size={[0.65, 0.5, 0.45]} color={P.cream} />
        <Label text="SHOP" position={[0, 0.4, 0.24]} width={0.5} />
        <Box size={[0.75, 0.04, 0.35]} position={[0, 0.34, 0.3]} color={P.mustard} />
      </Piece>
      <Piece position={[1.15, 0.04, -0.34]} delay={0.3}>
        <Rickshaw />
      </Piece>
      <Piece position={[-1.55, 0.04, -0.68]}>
        <Bench />
        <Notebook position={[0, 0.23, 0]} />
      </Piece>
      <Piece position={[2.25, 0.04, -0.62]}>
        <Tree s={0.85} />
      </Piece>
      <Piece position={[-0.35, 0.04, -0.3]} delay={0.4}>
        <Character pose="explore" mood="curious" walkIn={0.9} rotationY={0.35} />
      </Piece>
      <Piece position={[0.7, 0.04, -0.75]}>
        <Person color={P.lavender} />
      </Piece>
    </group>
  );
}

export function SetbackWorld() {
  return (
    <group>
      <Ground />
      <Road position={[-0.85, 0.03, -0.75]} size={[0.55, 1.75]} />
      <Road position={[0.65, 0.035, -0.65]} size={[2.9, 0.5]} rotationY={0.25} />
      <Piece position={[-0.85, 0.04, -1.5]} delay={0.08}>
        <Gate />
      </Piece>
      <Piece position={[-1.95, 0.04, -1.4]}>
        <AcademicBlock width={0.6} height={0.65} />
      </Piece>
      <Piece position={[1.8, 0.04, -1.1]} delay={0.25}>
        <Box size={[0.05, 0.65, 0.05]} position={[0, 0.325, 0]} color={P.wood} />
        <Label text="GREATER NOIDA →" position={[0, 0.67, 0.035]} width={1.1} height={0.22} />
      </Piece>
      {[-2.3, 2.35].map((x) => (
        <Piece key={x} position={[x, 0.04, -0.75]}>
          <Tree s={0.85} />
        </Piece>
      ))}
      <Piece position={[-0.7, 0.04, -0.42]} delay={0.4}>
        <Character pose="look" mood="curious" rotationY={0.45} />
      </Piece>
      <Piece position={[0.35, 0.04, -0.2]}>
        <Box
          size={[0.32, 0.05, 0.05]}
          position={[0, 0.3, 0]}
          rotation={[0, 0.3, 0]}
          color={P.wood}
        />
        <Box size={[0.03, 0.3, 0.03]} position={[0, 0.15, 0]} color={P.woodDark} />
      </Piece>
    </group>
  );
}

export function GreaterNoidaWorld() {
  return (
    <group>
      <Ground />
      <Road position={[0, 0.03, -0.52]} size={[4.8, 0.4]} />
      <Road position={[0, 0.035, -1]} size={[0.4, 1.2]} />
      <Piece position={[0, 0.04, -1.5]} delay={0.08}>
        <AcademicBlock width={1.9} height={1.1} />
        <Label text="GALGOTIAS UNIVERSITY" position={[0, 0.98, 0.23]} width={1.8} />
      </Piece>
      <Piece position={[-1.8, 0.04, -1.4]}>
        <AcademicBlock width={1.1} height={0.8} color={P.terracotta} />
      </Piece>
      <Piece position={[1.85, 0.04, -1.4]}>
        <AcademicBlock width={1.1} height={0.6} />
        <Label text="CAFETERIA" position={[0, 0.53, 0.23]} width={1} height={0.15} />
      </Piece>
      <Piece position={[1.85, 0.04, -0.72]} delay={0.25}>
        <Desk w={0.65} />
        <Bench position={[0, 0, 0.22]} />
      </Piece>
      {[-1.1, 0.95].map((x, i) => (
        <Piece key={x} position={[x, 0.04, -0.52]}>
          <Person color={i ? P.mustard : P.lavender} />
        </Piece>
      ))}
      {[-2.35, 2.4].map((x) => (
        <Piece key={x} position={[x, 0.04, -0.7]}>
          <Tree s={0.75} />
        </Piece>
      ))}
      <Walker from={[-1.6, 0.04, -0.2]} to={[0.25, 0.04, -0.52]} stage={2} notebook />
    </group>
  );
}

export function BuildingWorld() {
  return (
    <group>
      <Ground indoor />
      <Piece position={[0, 0.04, -1.65]} delay={0.08}>
        <Box size={[4.7, 1.05, 0.05]} position={[0, 0.525, 0]} color={P.paper} />
        <Label text="LEARNING BY BUILDING" position={[-0.9, 0.9, 0.03]} width={2} />
      </Piece>
      <Piece position={[-1.05, 0.04, -0.82]}>
        <Desk w={1.5} />
        <Screen />
        <Notebook position={[-0.5, 0.28, 0.02]} />
        <group position={[0.55, 0.28, 0]}>
          <Lamp />
        </group>
      </Piece>
      <Piece position={[0.85, 0.04, -0.9]} delay={0.22}>
        <Desk w={1.25} />
        <group position={[-0.32, 0.28, 0]}>
          <Laptop screen={P.ivory} />
          <Bars
            values={[0.25, 0.4, 0.6, 0.9]}
            colors={[P.forest]}
            position={[0, 0.03, -0.06]}
            gap={0.04}
            height={0.09}
          />
        </group>
        <Notebook position={[0.08, 0.28, 0.06]} color={P.forest} />
        <Label text="GROWTH IDEAS" position={[0.08, 0.36, 0.14]} width={0.36} height={0.07} />
        <Books position={[0.42, 0.29, -0.02]} />
        <Phone
          position={[0.28, 0.28, 0.1]}
          rotation={[-0.5, -0.3, 0]}
          lines={["INSTAGRAM", "♥ 128"]}
          s={0.42}
        />
        <Mug position={[-0.55, 0.28, 0.1]} />
      </Piece>
      <Piece position={[1.75, 0.04, -1.5]}>
        <Board title="OPPORTUNITIES" />
      </Piece>
      <Piece position={[2.2, 0.04, -0.55]}>
        <Plant s={1.5} />
      </Piece>
      <Piece position={[-1.05, 0.04, -0.47]} delay={0.4}>
        <Bench />
        <Character stage={2} pose="work" mood="curious" rotationY={Math.PI} />
      </Piece>
    </group>
  );
}

function PacketShelf() {
  return (
    <group>
      {[-0.46, 0.46].map((x) => (
        <Box key={x} size={[0.035, 1, 0.28]} position={[x, 0.5, 0]} color={P.wood} />
      ))}
      {[0.08, 0.39, 0.7].map((y, row) => (
        <group key={y}>
          <Box size={[0.95, 0.03, 0.3]} position={[0, y, 0]} color={P.wood} />
          {[-0.3, 0, 0.3].map((x, i) => (
            <group key={x} position={[x, y + 0.13, 0]}>
              <Box size={[0.2, 0.23, 0.13]} color={(i + row) % 2 ? P.forest : P.mustard} />
              <Box size={[0.12, 0.09, 0.01]} position={[0, 0, 0.07]} color={P.ivory} />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function CameraRig() {
  return (
    <group>
      {[-1, 0, 1].map((s) => (
        <Box
          key={s}
          size={[0.02, 0.4, 0.02]}
          position={[s * 0.07, 0.2, s === 0 ? -0.07 : 0.03]}
          rotation={[s === 0 ? -0.3 : 0, 0, -s * 0.3]}
          color={P.charcoal}
        />
      ))}
      <Box size={[0.2, 0.12, 0.1]} position={[0, 0.43, 0]} color={P.charcoal} />
      <mesh position={[0, 0.43, 0.07]} rotation={[Math.PI / 2, 0, 0]} material={mat(P.wood)}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 8]} />
      </mesh>
    </group>
  );
}

function Attention() {
  const root = useRef<THREE.Group>(null!);
  useFrame(() => {
    root.current.children.forEach((child, i) => {
      const phase = (worldState.time * 0.18 + i / 3) % 1;
      child.position.y = 1.12 + phase * 0.42;
      child.scale.setScalar(1 - phase * 0.4);
    });
  });
  return (
    <group ref={root}>
      {[-0.28, 0, 0.28].map((x) => (
        <group key={x} position={[x, 1.2, 0.05]}>
          <mesh scale={[1.6, 0.8, 0.3]} material={mat(P.ivory)}>
            <sphereGeometry args={[0.045, 8, 6]} />
          </mesh>
          <mesh position={[0, 0, 0.018]} material={mat(P.charcoal)}>
            <sphereGeometry args={[0.018, 8, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Sack() {
  return (
    <group>
      <Box size={[0.26, 0.32, 0.16]} position={[0, 0.16, 0]} color={P.mustard} />
      <Box
        size={[0.22, 0.06, 0.12]}
        position={[0, 0.34, 0]}
        rotation={[0, 0, 0.12]}
        color={P.mustard}
      />
      <TextPanel
        lines={["DOG", "FOOD"]}
        size={[0.18, 0.14]}
        position={[0, 0.17, 0.082]}
        opts={{ bg: P.forest, fg: P.ivory, font: "sans", size: 58 }}
      />
    </group>
  );
}

function Bowl() {
  return (
    <group>
      <mesh position={[0, 0.022, 0]} material={mat(P.terracotta)} castShadow>
        <cylinderGeometry args={[0.085, 0.065, 0.045, 16]} />
      </mesh>
      <mesh position={[0, 0.046, 0]} material={mat(P.wood)}>
        <cylinderGeometry args={[0.07, 0.07, 0.008, 16]} />
      </mesh>
    </group>
  );
}

/** First internship: door-to-door sales, Seller Central, content — and the office dog. */
export function GoCattlesWorld() {
  return (
    <group>
      <Ground indoor />
      <Piece position={[-1.95, 0.04, -1.45]} delay={0.08}>
        <PacketShelf />
        <Label
          text="SHOPKEEPERS · DOOR TO DOOR"
          position={[0.25, 1.16, 0.02]}
          width={1.7}
          height={0.2}
        />
      </Piece>
      <Piece position={[-0.45, 0.04, -1.5]}>
        <Board title="SELLER CENTRAL" />
      </Piece>
      <Piece position={[0.95, 0.04, -1.5]}>
        <Board title="CONTENT" />
        <group position={[0.68, 0, 0.1]}>
          <CameraRig />
        </group>
      </Piece>
      <Piece position={[2.1, 0.04, -1.35]}>
        <Stock count={6} />
      </Piece>
      {/* The desk, the laptop and Durgesh, who reaches down to pet the dog. */}
      <Piece position={[0.35, 0.04, -0.66]} delay={0.25}>
        <Desk w={1.1} />
        <Laptop position={[0.05, 0.28, 0]} screen={P.mustard} />
        <Notebook position={[0.35, 0.28, 0.02]} />
        <Mug position={[-0.38, 0.28, 0]} />
      </Piece>
      <Piece position={[0.35, 0.04, -0.3]} delay={0.4}>
        <Character pose="pet" rotationY={Math.PI} />
      </Piece>
      <Piece position={[-0.15, 0.04, -0.2]} delay={0.45}>
        <group scale={1.7}>
          <Dog rotationY={0.25} />
        </group>
      </Piece>
      <Piece position={[-0.55, 0.04, -0.05]} delay={0.5}>
        <Bowl />
      </Piece>
      <Piece position={[-0.95, 0.04, -0.4]} delay={0.5}>
        <Sack />
      </Piece>
      <Piece position={[2.2, 0.04, -0.45]} delay={0.45}>
        <Plant s={1.6} />
      </Piece>
    </group>
  );
}

function Calendar() {
  return (
    <group>
      {[-0.36, 0, 0.36].map((x) => (
        <group key={x} position={[x, 0.65, 0]}>
          <Box size={[0.32, 0.48, 0.025]} color={P.ivory} />
          <Box size={[0.32, 0.08, 0.03]} position={[0, 0.2, 0]} color={P.terracotta} />
          {Array.from({ length: 9 }, (_, i) => (
            <Box
              key={i}
              size={[0.055, 0.05, 0.006]}
              position={[((i % 3) - 1) * 0.085, 0.08 - Math.floor(i / 3) * 0.09, 0.018]}
              color={P.stone}
            />
          ))}
        </group>
      ))}
      <Label text="THREE MONTHS" position={[0, 1, 0.025]} width={1.08} />
    </group>
  );
}

function Envelopes() {
  return (
    <group>
      {[-0.24, 0, 0.24].map((x, i) => (
        <group key={x} position={[x, 0.015 + i * 0.008, 0]}>
          <Box size={[0.2, 0.01, 0.14]} color={P.ivory} />
          {[-1, 1].map((s) => (
            <Box
              key={s}
              size={[0.11, 0.004, 0.006]}
              position={[s * 0.043, 0.008, 0]}
              rotation={[0, s * 0.5, 0]}
              color={P.terracotta}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

export function ResetWorld() {
  return (
    <group>
      <Ground indoor />
      <Piece position={[1.3, 0.04, -1.72]} delay={0.08}>
        <Box size={[2.25, 0.7, 0.04]} position={[0, 0.35, -0.05]} color={P.paper} />
        {[-0.9, -0.55, -0.2, 0.2, 0.55, 0.9].map((x, i) => {
          const h = [0.25, 0.4, 0.32, 0.52, 0.37, 0.28][i]!;
          return (
            <Box
              key={x}
              size={[0.25, h, 0.08]}
              position={[x, h / 2, 0]}
              color={i % 2 ? P.stone : P.sky}
            />
          );
        })}
        <Label
          text="BENGALURU"
          position={[0, 0.63, 0.05]}
          width={1}
          height={0.14}
          color={P.dusty}
        />
      </Piece>
      <Piece position={[-1.75, 0.04, -1.5]}>
        <Calendar />
      </Piece>
      <Piece position={[-0.3, 0.04, -1.5]}>
        <Board title="RESEARCH NOTES" />
      </Piece>
      <Piece position={[-0.85, 0.04, -0.73]} delay={0.25}>
        <Desk w={1.5} />
        <Laptop position={[-0.25, 0.28, -0.02]} />
        <group position={[0.55, 0.28, 0]}>
          <Lamp />
        </group>
        <Notebook position={[0.12, 0.28, 0.03]} />
      </Piece>
      <Piece position={[0.75, 0.04, -0.58]}>
        <Desk w={0.85} />
        <group position={[0, 0.28, 0]}>
          <Envelopes />
        </group>
        <Label text="APPLICATIONS" position={[0, 0.48, -0.08]} width={0.8} height={0.14} />
      </Piece>
      <Piece position={[1.9, 0.04, -0.6]}>
        <Books position={[0, 0.03, 0]} />
        <Notebook position={[0.1, 0.17, 0]} />
        <Tree position={[0.35, 0, -0.12]} s={0.65} />
      </Piece>
      <Piece position={[-0.85, 0.04, -0.35]} delay={0.4}>
        <Character stage={3} pose="think" mood="curious" holding="notebook" rotationY={Math.PI} />
      </Piece>
    </group>
  );
}

function Cushion({ color = P.lavender }: { color?: string }) {
  return (
    <mesh position={[0, 0.055, 0]} material={mat(color)}>
      <cylinderGeometry args={[0.22, 0.23, 0.09, 12]} />
    </mesh>
  );
}

export function BackWithBrainWorld() {
  return (
    <group>
      <Ground indoor />
      <Piece position={[0, 0.04, -1.7]} delay={0.08}>
        <Box size={[4.8, 1.25, 0.05]} position={[0, 0.625, 0]} color={P.paper} />
        <Label text="BACKWITHBRAIN" position={[-1.25, 1.08, 0.03]} width={1.8} height={0.22} />
        <TextPanel
          lines={["7-DAY PROGRAMME", "FROM CHAOS TO CLARITY"]}
          position={[-1.55, 0.65, 0.035]}
          size={[1.05, 0.48]}
          opts={{
            bg: P.lavender,
            fg: P.charcoal,
            font: "sans",
            size: 54,
          }}
        />
      </Piece>
      <Piece position={[-1.55, 0.04, -0.73]}>
        <Card size={[1.45, 0.8]} color={P.olive} />
        {[-0.34, 0.34].map((x, i) => (
          <group key={x} position={[x, 0, 0]}>
            <Cushion color={i ? P.mustard : P.lavender} />
            <group position={[0, 0.08, 0]} scale={[1, 0.68, 1]}>
              <Person color={i ? P.terracotta : P.dusty} />
            </group>
            <Box size={[0.27, 0.06, 0.13]} position={[0, 0.13, 0.07]} color={P.charcoal} />
          </group>
        ))}
      </Piece>
      <Piece position={[0, 0.04, -1.45]}>
        <Board title="FEEDBACK" color={P.cream} />
      </Piece>
      <Piece position={[1.35, 0.04, -1.45]}>
        <Board title="PRODUCT PLANNING" color={P.ivory} />
      </Piece>
      <Piece position={[0.05, 0.04, -0.75]}>
        <Box size={[0.7, 0.42, 0.04]} position={[0, 0.7, 0]} color={P.ivory} />
        {[-0.15, 0, 0.15].map((x) => (
          <Box key={x} size={[0.08, 0.07, 0.01]} position={[x, 0.7, 0.026]} color={P.olive} />
        ))}
        <Desk w={0.8} />
        <Notebook position={[0, 0.28, 0]} />
      </Piece>
      <Piece position={[1.85, 0.04, -0.65]}>
        <Desk w={0.85} />
        <Laptop position={[0, 0.28, 0]} />
        <Notebook position={[0.3, 0.28, 0]} />
      </Piece>
      <Piece position={[-2.15, 0.04, -1.4]}>
        <Stock count={2} />
        <Box
          size={[0.2, 0.015, 0.22]}
          position={[-0.34, 0.25, 0]}
          rotation={[0, 0, 0.45]}
          color={P.wood}
        />
      </Piece>
      {[-2.3, 2.3].map((x) => (
        <Piece key={x} position={[x, 0.04, -0.4]}>
          <Tree s={0.7} />
        </Piece>
      ))}
      <Piece position={[0.55, 0.04, -0.23]} delay={0.4}>
        <Character stage={4} pose="talk" mood="curious" rotationY={0.5} />
        <Person position={[-0.48, 0, -0.1]} color={P.lavender} rotationY={0.5} />
        <Person position={[0.48, 0, -0.1]} color={P.terracotta} rotationY={-0.5} />
      </Piece>
    </group>
  );
}

/** A bigger auto-rickshaw with room for a passenger. Faces +x. */
function NoidaAuto() {
  const wheels = useRef<THREE.Group>(null!);
  useFrame(() => {
    wheels.current.children.forEach((w) => (w.rotation.z = -worldState.time * 6));
  });
  return (
    <group>
      <Box size={[0.95, 0.28, 0.56]} position={[-0.05, 0.27, 0]} color={P.forest} />
      <Box size={[0.3, 0.42, 0.5]} position={[0.42, 0.42, 0]} color={P.forest} />
      <Box
        size={[0.02, 0.26, 0.4]}
        position={[0.58, 0.6, 0]}
        rotation={[0, 0, -0.25]}
        color={P.glass}
      />
      <Box size={[1.02, 0.06, 0.62]} position={[0.02, 1.08, 0]} color={P.mustard} />
      {[-0.45, 0.25].map((x) =>
        [-0.27, 0.27].map((z) => (
          <Box
            key={`${x}${z}`}
            size={[0.03, 0.66, 0.03]}
            position={[x, 0.75, z]}
            color={P.charcoal}
          />
        )),
      )}
      <Box size={[0.08, 0.35, 0.5]} position={[-0.5, 0.58, 0]} color={P.mustard} />
      <group ref={wheels}>
        {[
          [-0.32, 0.27],
          [-0.32, -0.27],
          [0.5, 0],
        ].map(([x, z]) => (
          <mesh
            key={`${x}${z}`}
            position={[x!, 0.12, z!]}
            rotation={[Math.PI / 2, 0, 0]}
            material={mat(P.charcoal)}
          >
            <cylinderGeometry args={[0.12, 0.12, 0.06, 10]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Drives in from the left as the camera arrives, then idles. */
function DriveIn({ to, children }: { to: V3; children: ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    const k = smoothstep(0, 0.35, worldState.hold);
    g.current.position.set(
      lerp(to[0] - 3, to[0], k),
      to[1] + Math.sin(worldState.time * 9) * 0.004,
      to[2],
    );
  });
  return (
    <group ref={g} position={to}>
      {children}
    </group>
  );
}

export function NoidaWorld() {
  return (
    <group>
      <Ground />
      <Road position={[0, 0.03, -0.45]} size={[4.9, 0.62]} />
      {[-1.8, -0.6, 0.6, 1.8].map((x) => (
        <Box key={x} size={[0.3, 0.005, 0.04]} position={[x, 0.05, -0.45]} color={P.ivory} />
      ))}
      <Piece position={[-1.95, 0.04, -1.5]} delay={0.04}>
        <Building size={[0.55, 1.35, 0.45]} color={P.stone} />
        <Building position={[0.58, 0, 0.05]} size={[0.5, 0.95, 0.42]} color={P.sky} />
      </Piece>
      <Piece position={[0.75, 0.04, -1.5]} delay={0.1}>
        <Building size={[1.35, 0.8, 0.5]} color={P.cream} />
        <Label text="STARTUP OFFICE" position={[0, 0.66, 0.27]} width={1.1} height={0.17} />
        <Box size={[0.26, 0.4, 0.02]} position={[0, 0.2, 0.26]} color={P.woodDark} />
      </Piece>
      <Piece position={[-0.45, 0.04, -1.25]} delay={0.16}>
        <Signboard lines={["NOIDA"]} width={0.62} />
      </Piece>
      <Piece position={[2.15, 0.04, -1.25]}>
        <Tree s={0.85} />
      </Piece>
      <Piece position={[-2.35, 0.04, -0.85]}>
        <Tree s={0.65} />
      </Piece>
      <Piece position={[1.75, 0.04, -0.95]} delay={0.3}>
        <Person color={P.dusty} rotationY={-0.6} />
        <Box size={[0.3, 0.22, 0.2]} position={[0.35, 0.11, 0]} color={P.wood} />
        <Mug position={[0.3, 0.22, 0]} />
        <Mug position={[0.4, 0.22, 0.03]} color={P.mustard} />
      </Piece>
      <DriveIn to={[0.15, 0.04, -0.45]}>
        <NoidaAuto />
        <group position={[-0.18, 0.27, 0.02]}>
          <Character pose="sit" mood="curious" rotationY={0.25} />
        </group>
      </DriveIn>
    </group>
  );
}

export function PrimeDayWorld() {
  return (
    <group>
      <Ground indoor />
      <Piece position={[0, 0.04, -1.72]} delay={0.04}>
        <Box size={[3.6, 1.15, 0.05]} position={[0, 0.575, 0]} color={P.paper} />
        <TextPanel
          lines={["PRIME DAY", "CAMPAIGN"]}
          position={[0, 0.78, 0.035]}
          size={[1.3, 0.52]}
          opts={{ bg: P.terracotta, fg: P.ivory, font: "sans", size: 64 }}
        />
        <Attention />
      </Piece>
      <Piece position={[-1.75, 0.04, -1.25]} delay={0.1}>
        <Stock count={9} />
      </Piece>
      <Piece position={[-1.05, 0.04, -0.75]} delay={0.16}>
        <Stock count={5} />
      </Piece>
      <Piece position={[1.85, 0.04, -1.25]} delay={0.1}>
        <Stock count={6} />
      </Piece>
      <Piece position={[1.25, 0.04, -0.62]} delay={0.22}>
        <Box size={[0.95, 0.75, 0.05]} position={[0, 0.5, 0]} color={P.ivory} />
        <Label text="ATTENTION → DEMAND" position={[0, 0.8, 0.03]} width={0.88} height={0.12} />
        <Bars
          values={[0.9, 0.78, 0.32, 0.18]}
          colors={[P.mustard, P.mustard, P.terracotta, P.terracotta]}
          position={[0, 0.2, 0.06]}
          gap={0.18}
          height={0.48}
        />
        {[-0.3, 0.3].map((x) => (
          <Box key={x} size={[0.03, 0.2, 0.03]} position={[x, 0.1, 0]} color={P.wood} />
        ))}
      </Piece>
      <Piece position={[0.1, 0.04, -0.42]} delay={0.4}>
        <Box size={[0.34, 0.2, 0.3]} position={[0, 0.1, -0.02]} color={P.wood} />
        <Box size={[0.05, 0.205, 0.305]} position={[0, 0.1, -0.02]} color={P.mustard} />
        <group position={[0, 0.05, 0.02]}>
          <Character pose="reflect" />
        </group>
        <group position={[0.5, 0, 0.12]} scale={1.5}>
          <Dog rotationY={-2.4} />
        </group>
      </Piece>
    </group>
  );
}

function Bus() {
  return (
    <group>
      <Box size={[1.25, 0.5, 0.48]} position={[0, 0.34, 0]} color={P.terracotta} />
      <Box size={[1.1, 0.16, 0.49]} position={[0.02, 0.46, 0]} color={P.glass} />
      <Box size={[1.27, 0.05, 0.5]} position={[0, 0.61, 0]} color={P.cream} />
      <Box size={[0.16, 0.34, 0.01]} position={[0.42, 0.3, 0.245]} color={P.charcoal} />
      {[-0.4, 0.4].map((x) =>
        [-0.23, 0.23].map((z) => (
          <mesh
            key={`${x}${z}`}
            position={[x, 0.1, z]}
            rotation={[Math.PI / 2, 0, 0]}
            material={mat(P.charcoal)}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.05, 10]} />
          </mesh>
        )),
      )}
    </group>
  );
}

export function BengaluruWorld() {
  return (
    <group>
      <Ground />
      <Road position={[0, 0.03, -0.42]} size={[4.9, 0.55]} />
      <Piece position={[-1.6, 0.04, -1.6]} delay={0.04}>
        {[
          [-0.55, 1.15, P.stone],
          [0, 1.65, P.sky],
          [0.55, 1.0, P.cream],
        ].map(([x, h, c]) => (
          <Building
            key={x as number}
            position={[x as number, 0, 0]}
            size={[0.5, h as number, 0.45]}
            color={c as string}
          />
        ))}
      </Piece>
      <Piece position={[1.75, 0.04, -1.6]} delay={0.08}>
        <Building position={[-0.3, 0, 0]} size={[0.5, 1.45, 0.45]} color={P.stone} />
        <Building position={[0.3, 0, 0]} size={[0.5, 1.05, 0.42]} color={P.sky} />
        <Label
          text="BENGALURU"
          position={[0, 0.25, 0.26]}
          width={1}
          height={0.17}
          color={P.dusty}
        />
      </Piece>
      <Piece position={[0.1, 0.04, -1.5]} delay={0.12}>
        <Building size={[1.2, 0.72, 0.45]} color={P.ivory} />
        <TextPanel
          lines={["BACKWITHBRAIN", "MEDITATION & MIND FITNESS"]}
          position={[0, 0.5, 0.235]}
          size={[1.1, 0.3]}
          opts={{ bg: P.lavender, fg: P.charcoal, font: "sans", size: 50 }}
        />
      </Piece>
      <Piece position={[-1.55, 0.04, -0.42]} delay={0.2}>
        <Bus />
      </Piece>
      <Piece position={[-0.7, 0.04, -0.8]} delay={0.25}>
        <Signboard lines={["BUS STOP"]} width={0.5} color={P.dusty} />
      </Piece>
      {[-2.4, 2.4].map((x) => (
        <Piece key={x} position={[x, 0.04, -0.9]}>
          <Tree s={0.75} />
        </Piece>
      ))}
      <Piece position={[0.3, 0.04, -0.3]} delay={0.4}>
        <Character pose="look" mood="curious" holding="suitcase" walkIn={0.8} rotationY={0.35} />
      </Piece>
    </group>
  );
}

/** One calendar page per month, flipping over its top edge as the camera holds. */
function FlipCalendar() {
  const pages = useRef<THREE.Group>(null!);
  useFrame(() => {
    pages.current.children.forEach((pg, i) => {
      const f = smoothstep(0.04 + i * 0.12, 0.14 + i * 0.12, worldState.hold);
      pg.rotation.x = -f * Math.PI * 0.92;
      pg.visible = f < 0.98;
    });
  });
  const months = ["MONTH 1", "MONTH 2", "MONTH 3"];
  return (
    <group>
      <Box size={[0.62, 0.05, 0.05]} position={[0, 1.12, 0]} color={P.terracotta} />
      <Box size={[0.03, 1.1, 0.03]} position={[0, 0.55, -0.04]} color={P.woodDark} />
      <TextPanel
        lines={["MONTH 4", "→ BENGALURU"]}
        size={[0.58, 0.5]}
        position={[0, 0.84, 0.0]}
        opts={{ bg: P.ivory, fg: P.forest, font: "sans", size: 60 }}
      />
      <group ref={pages}>
        {months.map((m, i) => (
          <group key={m} position={[0, 1.09, 0.012 + (months.length - i) * 0.004]}>
            <TextPanel
              lines={[m]}
              size={[0.58, 0.5]}
              position={[0, -0.25, 0]}
              opts={{ bg: P.paper, fg: P.charcoal, font: "sans", size: 64 }}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

/** A growing stack of "REJECTED" letters, one at a time. */
function RejectedStack() {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    g.current.children.forEach((c, i) => {
      const k = smoothstep(0.18 + i * 0.07, 0.24 + i * 0.07, worldState.hold);
      c.scale.setScalar(Math.max(0.001, k));
      c.visible = k > 0.001;
    });
  });
  return (
    <group ref={g}>
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          position={[(i % 2) * 0.03 - 0.015, 0.012 + i * 0.016, 0]}
          rotation-y={(i - 1.5) * 0.12}
        >
          <Box size={[0.3, 0.012, 0.2]} color={P.ivory} />
          <TextPanel
            lines={["REJECTED"]}
            size={[0.2, 0.06]}
            position={[0, 0.008, 0]}
            rotation={[-Math.PI / 2, 0, 0.2]}
            opts={{ bg: P.ivory, fg: P.terracotta, border: P.terracotta, font: "sans", size: 70 }}
          />
        </group>
      ))}
    </group>
  );
}

/** The one reply that came back: an envelope rising out of the laptop, glowing. */
function ReplyGlow() {
  const g = useRef<THREE.Group>(null!);
  const l = useRef<THREE.PointLight>(null!);
  useFrame(() => {
    const k = smoothstep(0.55, 0.68, worldState.hold);
    g.current.scale.setScalar(Math.max(0.001, k));
    g.current.visible = k > 0.001;
    g.current.position.y = 0.42 + k * 0.18 + Math.sin(worldState.time * 2) * 0.012;
    l.current.intensity = k * 1.4;
  });
  return (
    <>
      <pointLight
        ref={l}
        position={[0, 0.65, 0.1]}
        color="#ffd38a"
        distance={1.6}
        decay={1.5}
        intensity={0}
      />
      <group ref={g}>
        <Box size={[0.3, 0.2, 0.012]} color={P.mustard} emissive={0.55} />
        <TextPanel
          lines={["RE: INTERNSHIP"]}
          size={[0.27, 0.07]}
          position={[0, 0, 0.008]}
          opts={{ bg: P.ivory, fg: P.forest, font: "sans", size: 60 }}
          glow={0.6}
        />
      </group>
    </>
  );
}

function InBetweenCharacter() {
  const replied = useHoldPast(0.62);
  return (
    <Character
      pose={replied ? "cheer" : "work"}
      mood={replied ? "happy" : "curious"}
      rotationY={Math.PI}
    />
  );
}

/** 3 to 4 months: the calendar flips, rejections pile up, then one reply lights up. */
export function InBetweenWorld() {
  return (
    <group>
      <Ground indoor />
      <Piece position={[-1.65, 0.04, -1.55]} delay={0.06}>
        <FlipCalendar />
      </Piece>
      <Piece position={[1.75, 0.04, -1.65]} delay={0.1}>
        <Box size={[1.4, 0.7, 0.04]} position={[0, 0.35, -0.05]} color={P.paper} />
        {[-0.5, -0.2, 0.15, 0.45].map((x, i) => {
          const h = [0.28, 0.44, 0.34, 0.5][i]!;
          return (
            <Box
              key={x}
              size={[0.22, h, 0.08]}
              position={[x, h / 2, 0]}
              color={i % 2 ? P.stone : P.sky}
            />
          );
        })}
        <Label
          text="BENGALURU"
          position={[0, 0.63, 0.05]}
          width={0.9}
          height={0.14}
          color={P.dusty}
        />
      </Piece>
      <Piece position={[-0.35, 0.04, -0.7]} delay={0.22}>
        <Desk w={0.9} />
        <group position={[0, 0.28, 0]}>
          <RejectedStack />
        </group>
        <Label text="INTERVIEWS" position={[0, 0.52, -0.1]} width={0.7} height={0.14} />
      </Piece>
      <Piece position={[0.9, 0.04, -0.7]} delay={0.26}>
        <Desk w={0.9} />
        <Laptop position={[0, 0.28, 0]} />
        <Notebook position={[0.28, 0.28, 0.02]} />
        <ReplyGlow />
      </Piece>
      <Piece position={[0.9, 0.04, -0.32]} delay={0.4}>
        <InBetweenCharacter />
      </Piece>
      <Piece position={[-1.9, 0.04, -0.5]} delay={0.45}>
        <Books position={[0, 0.03, 0]} />
        <Plant position={[0.35, 0, 0]} s={1.3} />
      </Piece>
    </group>
  );
}

export const EARLY_WORLDS: Record<string, WorldDef> = {
  "in-between": {
    C: InBetweenWorld,
    anchors: {
      calendar: [-1.65, 1.15, -1.5],
      rejected: [-0.35, 0.4, -0.7],
      reply: [0.9, 0.7, -0.68],
    },
  },
  kanpur: {
    C: KanpurWorld,
    anchors: {
      home: [-1.85, 0.69, -1.4],
      school: [0.35, 0.87, -1.16],
      streets: [1.15, 0.47, -0.34],
    },
  },
  setback: {
    C: SetbackWorld,
    anchors: {
      "iit-gate": [-0.85, 1, -1.39],
      "new-route": [1.8, 0.71, -1.065],
    },
  },
  noida: {
    C: NoidaWorld,
    anchors: {
      auto: [0.15, 1.1, -0.45],
      office: [0.75, 0.7, -1.23],
      city: [-0.45, 0.7, -1.25],
    },
  },
  "prime-day": {
    C: PrimeDayWorld,
    anchors: {
      stock: [-1.75, 0.7, -1.13],
      banner: [0, 1.05, -1.68],
      chart: [1.25, 0.72, -0.58],
    },
  },
  bengaluru: {
    C: BengaluruWorld,
    anchors: {
      city: [-1.6, 1.4, -1.38],
      bus: [-1.55, 0.62, -0.42],
      office: [0.1, 0.6, -1.27],
    },
  },
  "greater-noida": {
    C: GreaterNoidaWorld,
    anchors: {
      campus: [0, 1.02, -1.27],
      cafeteria: [1.85, 0.57, -1.17],
      exploring: [0.25, 0.055, -0.52],
    },
  },
  building: {
    C: BuildingWorld,
    anchors: {
      coding: [-1.05, 0.51, -0.85],
      growth: [0.53, 0.45, -0.9],
      board: [1.75, 0.95, -1.45],
    },
  },
  gocattles: {
    C: GoCattlesWorld,
    anchors: {
      door: [-1.95, 1.2, -1.42],
      seller: [-0.45, 1.0, -1.45],
      content: [0.95, 1.0, -1.45],
    },
  },
  reset: {
    C: ResetWorld,
    anchors: {
      calendar: [-1.75, 0.89, -1.485],
      applications: [0.75, 0.345, -0.58],
      learning: [1.9, 0.175, -0.6],
      bengaluru: [1.3, 0.67, -1.67],
    },
  },
  backwithbrain: {
    C: BackWithBrainWorld,
    anchors: {
      meditation: [-1.89, 0.14, -0.73],
      founders: [0.05, 0.74, -0.724],
      feedback: [0, 0.76, -1.4],
      planning: [1.35, 0.76, -1.4],
    },
  },
};
