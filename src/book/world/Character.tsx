/**
 * Durgesh, the recurring character (docs/character-brief-v4.md).
 * Same face, body and hair in every chapter — only the outfit and backpack
 * change, chosen from the chapter on show. He breathes, blinks and shifts
 * his weight; each pose adds its own small loop, and `walkIn` makes him
 * walk into the scene as the camera arrives.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldChapters } from "@/content/journey";
import { mat, P, type V3, Laptop, Notebook } from "./kit";
import { worldState } from "../scrollState";

export type Pose =
  | "stand"
  | "walk"
  | "sit"
  | "think"
  | "work"
  | "cheer"
  | "talk"
  | "meditate"
  | "explore"
  | "reflect"
  | "point"
  | "bridge"
  | "dictate"
  | "draw"
  | "listen"
  | "look"
  | "pet";
export type Mood = "happy" | "curious" | "sad" | "determined";

/** Locked look (never changes between chapters). */
const SKIN = "#8d6e63";
const EYES = "#3e2723";
const HAIR = "#15100c";

interface Look {
  scale: number;
  shirt: string;
  pants: string;
  shoes: string;
  shorts?: boolean;
  /** Short sleeves show the forearms; rolled sleeves too. */
  forearms?: boolean;
  hood?: boolean;
  collar?: boolean;
  bag: { color: string; size: number; stickers?: boolean; strap?: boolean; glow?: boolean } | null;
}

const LOOKS = {
  school: {
    scale: 0.86,
    shirt: "#8fb7d9",
    pants: "#8b8780",
    shoes: "#7a4f32",
    shorts: true,
    forearms: true,
    bag: { color: "#7a4f32", size: 0.8 },
  },
  college: {
    scale: 0.92,
    shirt: "#e0a33a",
    pants: "#4d6a8f",
    shoes: "#f3efe6",
    forearms: true,
    bag: { color: "#7d8450", size: 0.95 },
  },
  gocattles: {
    scale: 0.95,
    shirt: "#3d6b4c",
    pants: "#2f3b52",
    shoes: "#f3efe6",
    forearms: true,
    collar: true,
    bag: { color: "#7d8450", size: 0.95 },
  },
  bwb: {
    scale: 0.97,
    shirt: "#a9c6e0",
    pants: "#34302c",
    shoes: "#3a332d",
    forearms: true,
    collar: true,
    bag: { color: "#3b3a40", size: 1.12, stickers: true },
  },
  voice: {
    scale: 0.97,
    shirt: "#8f8c88",
    pants: "#2f3b52",
    shoes: "#f3efe6",
    hood: true,
    bag: { color: "#3b3a40", size: 1.12, stickers: true, strap: true },
  },
  home: {
    scale: 0.97,
    shirt: "#f4f0e8",
    pants: "#7d7a76",
    shoes: "#f4f0e8",
    forearms: true,
    bag: null,
  },
  next: {
    scale: 0.97,
    shirt: "#f7f4ee",
    pants: "#2c2a28",
    shoes: "#3a332d",
    collar: true,
    bag: { color: "#3b3a40", size: 1.15, stickers: true, glow: true },
  },
} satisfies Record<string, Look>;
export type LookName = keyof typeof LOOKS;

/** Which outfit each chapter uses. */
const CHAPTER_LOOK: Record<string, LookName> = {
  kanpur: "school",
  setback: "school",
  "greater-noida": "college",
  noida: "college",
  building: "college",
  gocattles: "gocattles",
  "prime-day": "gocattles",
  reset: "gocattles",
  "in-between": "gocattles",
  voice: "voice",
  smaran: "home",
  projects: "home",
  next: "next",
};
export function lookForChapter(id: string | undefined): LookName {
  return (id && CHAPTER_LOOK[id]) || "bwb";
}

const STICKERS = [P.terracotta, P.mustard, P.lavender, P.sky];
const ramp = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function Character({
  position = [0, 0, 0],
  rotationY = 0,
  pose = "stand",
  mood = "happy",
  holding,
  look,
  walkIn = 0,
  lean = 0,
}: {
  position?: V3;
  rotationY?: number;
  /** Ignored: the outfit comes from the chapter. Kept so older worlds still compile. */
  stage?: number;
  pose?: Pose;
  mood?: Mood;
  /** Kept for older worlds; badges are now stickers on the BackWithBrain bag. */
  badges?: number;
  holding?: "laptop" | "notebook" | "suitcase" | undefined;
  look?: LookName;
  /** Walk in from this far to his left (local units) as the camera arrives. */
  walkIn?: number;
  /** Lean forward (radians). */
  lean?: number;
}) {
  const L: Look = LOOKS[look ?? lookForChapter(worldChapters[worldState.world]?.id)];
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const torso = useRef<THREE.Mesh>(null!);
  const phase = useMemo(() => Math.random() * 10, []);

  const meditating = pose === "meditate";
  const sitting =
    pose === "sit" ||
    pose === "work" ||
    pose === "reflect" ||
    pose === "dictate" ||
    pose === "listen" ||
    pose === "pet";

  useFrame(() => {
    const t = worldState.time + phase;
    // Entry: walk in from the left while the camera settles into the world.
    const enter = walkIn ? ramp(0, 0.28, worldState.hold) : 1;
    const entering = walkIn > 0 && enter < 1;
    root.current.position.set(position[0] - walkIn * (1 - enter), position[1], position[2]);

    const walk = pose === "walk" || entering;
    const swing = walk ? Math.sin(t * 7) * 0.6 : 0;
    const seated = sitting && !entering;
    legL.current.rotation.x = meditating ? -1.25 : seated ? -1.45 : swing;
    legR.current.rotation.x = meditating ? -1.25 : seated ? -1.45 : -swing;
    legL.current.rotation.z = meditating ? -0.85 : 0;
    legR.current.rotation.z = meditating ? 0.85 : 0;

    // Idle: breathing, a slow weight shift and a small bob.
    torso.current.scale.y = 1.1 * (1 + Math.sin((t * Math.PI * 2) / 3) * 0.01);
    body.current.position.x = sitting ? 0 : Math.sin((t * Math.PI * 2) / 5) * 0.006;
    body.current.position.y = walk
      ? Math.abs(Math.sin(t * 7)) * 0.015
      : Math.sin((t * Math.PI * 2) / 3) * 0.006;
    body.current.rotation.x = lean + (pose === "explore" ? 0.12 : pose === "listen" ? 0.16 : 0);

    // Blink every ~4 s.
    const blink = t % 4 < 0.15 ? 0.15 : 1;
    eyes.current.scale.y = meditating ? 1 : blink;

    let al = -swing * 0.8;
    let ar = swing * 0.8;
    let zl = 0.18;
    let zr = -0.18;
    body.current.rotation.z = 0;
    if (!entering) {
      switch (pose) {
        case "think":
          ar = -2.2;
          break;
        case "cheer":
          al = -2.8 + Math.sin(t * 6) * 0.15;
          ar = -2.8 - Math.sin(t * 6) * 0.15;
          break;
        case "work":
          al = -1.1 + Math.sin(t * 10) * 0.08;
          ar = -1.1 - (t % 5 < 0.6 ? Math.sin(t * 14) * 0.18 : 0);
          break;
        case "talk":
          ar = -0.9 + Math.sin((t * Math.PI * 2) / 1.5) * 0.35;
          al = -0.3;
          break;
        case "explore":
          ar = -2.55;
          zr = -0.75;
          break;
        case "reflect":
          al = -1.25;
          ar = -2.15;
          zr = 0.15;
          if (t % 10 < 0.4) ar = -2.6;
          break;
        case "point":
          ar = -1.75 + Math.sin(t * 2) * 0.05;
          zr = -0.25;
          al = -0.2;
          break;
        case "bridge": {
          const reach = ramp(0.2, 0.45, worldState.hold);
          zl = 0.18 + reach * 1.05;
          zr = -0.18 - reach * 1.05;
          al = -0.25;
          ar = -0.25;
          break;
        }
        case "dictate":
          ar = -2.55 + Math.sin(t * Math.PI * 2) * 0.06;
          zr = 0.35;
          al = -1.1;
          break;
        case "draw":
          ar = -1.95 + Math.sin(t * 2.4) * 0.18;
          zr = -0.1;
          al = -0.15;
          break;
        case "listen":
          al = -1.15;
          ar = -1.15;
          break;
        case "pet": {
          // Types, then every few seconds leans over and reaches down to the dog.
          const c = (t % 6) / 6;
          const reach = ramp(0.45, 0.55, c) * (1 - ramp(0.85, 0.95, c));
          al = -1.1 + Math.sin(t * 10) * 0.08 * (1 - reach);
          ar = -1.1 + reach * (0.75 + Math.sin(t * 8) * 0.12);
          zr = -0.18 + reach * 0.85;
          body.current.rotation.z = -reach * 0.16;
          break;
        }
      }
    }
    if (holding === "laptop" && pose !== "work") {
      al = -0.9;
      ar = -0.9;
    }
    if (holding === "suitcase") {
      ar = 0;
      zr = -0.12;
    }
    if (meditating) {
      al = -0.65;
      ar = -0.65;
      zl = 0.2;
      zr = -0.2;
    }
    armL.current.rotation.z = zl;
    armR.current.rotation.z = zr;
    armL.current.rotation.x = al;
    armR.current.rotation.x = ar;

    // Head: per-pose loops.
    let hy = Math.sin(t * 0.6) * 0.12;
    let hx = 0;
    if (mood === "curious" || pose === "look" || pose === "explore")
      hy = Math.sin((t * Math.PI * 2) / 6) * 0.18;
    if (pose === "reflect") hy = Math.sin((t * Math.PI * 2) / 8) * 0.09;
    if (pose === "work" || pose === "dictate")
      hx = -0.035 + Math.sin((t * Math.PI * 2) / 4) * 0.035;
    if (pose === "talk" || pose === "listen") hx = t % 4 < 0.4 ? -0.09 : 0;
    if (pose === "reflect") hx = 0.32;
    if (pose === "think") hx = -0.15;
    if (pose === "look") hx = -0.2;
    if (mood === "sad") hx = 0.35;
    head.current.rotation.y = meditating ? 0 : hy;
    head.current.rotation.x = hx;
    head.current.rotation.z = pose === "think" ? 0.12 : pose === "look" ? 0.06 : 0;
  });

  const browTilt = mood === "sad" ? 0.3 : mood === "determined" ? -0.3 : 0;
  const hipY = meditating ? 0.055 : sitting ? 0.16 : 0.2;
  const bag = L.bag;

  return (
    <group ref={root} position={position} rotation-y={rotationY} scale={L.scale}>
      <group ref={body}>
        {/* Legs */}
        {[
          [legL, -0.065],
          [legR, 0.065],
        ].map(([ref, x]) => (
          <group
            key={x as number}
            ref={ref as React.RefObject<THREE.Group>}
            position={[x as number, hipY, 0]}
          >
            <mesh position={[0, -0.09, 0]} material={mat(L.shorts ? SKIN : L.pants)} castShadow>
              <capsuleGeometry args={[L.shorts ? 0.045 : 0.058, 0.1, 4, 10]} />
            </mesh>
            {L.shorts && (
              <mesh position={[0, -0.025, 0]} material={mat(L.pants)} castShadow>
                <capsuleGeometry args={[0.062, 0.04, 4, 10]} />
              </mesh>
            )}
            <mesh
              visible={!meditating}
              position={[0, -0.18, 0.03]}
              material={mat(L.shoes)}
              castShadow
            >
              <boxGeometry args={[0.085, 0.04, 0.14]} />
            </mesh>
          </group>
        ))}

        {meditating &&
          [-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.025, 0.025, 0.18]}
              rotation={[0, side * 0.3, Math.PI / 2]}
              material={mat(L.pants)}
              castShadow
            >
              <capsuleGeometry args={[0.045, 0.18, 4, 10]} />
            </mesh>
          ))}

        {/* Slightly chubby torso */}
        <mesh
          ref={torso}
          position={[0, hipY + 0.15, 0]}
          scale={[1.05, 1.1, 0.92]}
          material={mat(L.shirt)}
          castShadow
        >
          <sphereGeometry args={[0.17, 20, 16]} />
        </mesh>
        {L.collar && (
          <mesh
            position={[0, hipY + 0.3, 0.035]}
            rotation-x={Math.PI / 2}
            material={mat(L.shirt === "#f7f4ee" ? "#e9e3d8" : P.white)}
          >
            <torusGeometry args={[0.07, 0.014, 6, 16]} />
          </mesh>
        )}
        {L.hood && (
          <mesh
            position={[0, hipY + 0.33, -0.08]}
            rotation-x={0.5}
            material={mat(L.shirt)}
            castShadow
          >
            <torusGeometry args={[0.09, 0.035, 8, 16]} />
          </mesh>
        )}
        {bag?.strap && (
          <mesh position={[0, hipY + 0.17, 0.02]} rotation-z={0.75} material={mat(P.charcoal)}>
            <boxGeometry args={[0.03, 0.42, 0.33]} />
          </mesh>
        )}

        {/* Backpack */}
        {bag && (
          <group position={[0, hipY + 0.17, -0.16]} scale={bag.size}>
            <mesh material={mat(bag.color)} castShadow>
              <boxGeometry args={[0.22, 0.24, 0.1]} />
            </mesh>
            <mesh position={[0, -0.05, -0.052]} material={mat(bag.color)}>
              <boxGeometry args={[0.18, 0.1, 0.03]} />
            </mesh>
            {bag.stickers &&
              STICKERS.map((c, i) => (
                <mesh
                  key={c}
                  position={[-0.06 + (i % 2) * 0.11, 0.05 - Math.floor(i / 2) * 0.06, -0.053]}
                  rotation-x={Math.PI / 2}
                  material={mat(c)}
                >
                  <cylinderGeometry args={[0.02, 0.02, 0.008, 10]} />
                </mesh>
              ))}
            {bag.glow && (
              <mesh scale={1.12}>
                <boxGeometry args={[0.22, 0.24, 0.1]} />
                <meshBasicMaterial
                  color={P.mustard}
                  side={THREE.BackSide}
                  transparent
                  opacity={0.55}
                />
              </mesh>
            )}
            {[-0.07, 0.07].map((x) => (
              <mesh key={x} position={[x, 0.02, 0.07]} material={mat(P.charcoal)}>
                <boxGeometry args={[0.025, 0.22, 0.03]} />
              </mesh>
            ))}
          </group>
        )}

        {/* Arms */}
        {[
          [armL, -0.2],
          [armR, 0.2],
        ].map(([ref, x]) => (
          <group
            key={x as number}
            ref={ref as React.RefObject<THREE.Group>}
            position={[x as number, hipY + 0.24, 0]}
            rotation-z={(x as number) > 0 ? -0.18 : 0.18}
          >
            <mesh position={[0, -0.06, 0]} material={mat(L.shirt)} castShadow>
              <capsuleGeometry args={[0.047, L.forearms ? 0.05 : 0.1, 4, 8]} />
            </mesh>
            {L.forearms && (
              <mesh position={[0, -0.12, 0]} material={mat(SKIN)}>
                <capsuleGeometry args={[0.038, 0.05, 4, 8]} />
              </mesh>
            )}
            <mesh position={[0, -0.17, 0]} material={mat(SKIN)}>
              <sphereGeometry args={[0.042, 10, 8]} />
            </mesh>
            {holding === "suitcase" && (x as number) > 0 && (
              <group position={[0, -0.32, 0]}>
                <mesh material={mat(P.terracotta)} castShadow>
                  <boxGeometry args={[0.08, 0.22, 0.26]} />
                </mesh>
                <mesh position={[0, 0.13, 0]} material={mat(P.charcoal)}>
                  <boxGeometry args={[0.02, 0.04, 0.08]} />
                </mesh>
              </group>
            )}
          </group>
        ))}

        {/* Head — slightly large, round, friendly (about 1 : 3.5) */}
        <group ref={head} position={[0, hipY + 0.44, 0]}>
          <mesh material={mat(SKIN)} castShadow>
            <sphereGeometry args={[0.16, 24, 20]} />
          </mesh>
          {/* Thick, short, slightly messy black hair */}
          <mesh
            position={[0, 0.06, -0.015]}
            scale={[1.05, 0.74, 1.03]}
            material={mat(HAIR)}
            castShadow
          >
            <sphereGeometry args={[0.162, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {[
            [0.06, 0.13, 0.09, -0.5],
            [-0.05, 0.14, 0.1, 0.4],
            [0.01, 0.16, 0.06, 0.1],
            [0.1, 0.1, 0.06, -0.9],
          ].map(([x, y, z, r], i) => (
            <mesh
              key={i}
              position={[x!, y!, z!]}
              rotation={[0.6, 0, r!]}
              scale={[1.2, 0.55, 0.85]}
              material={mat(HAIR)}
            >
              <sphereGeometry args={[0.055, 10, 8]} />
            </mesh>
          ))}
          {/* Ears */}
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * 0.158, -0.005, 0]}
              scale={[0.5, 1, 0.8]}
              material={mat(SKIN)}
            >
              <sphereGeometry args={[0.036, 10, 8]} />
            </mesh>
          ))}
          {/* Large expressive eyes */}
          <group ref={eyes} position={[0, 0.012, 0]}>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.058, 0, 0.138]}>
                {meditating ? (
                  <mesh rotation-z={Math.PI} material={mat(HAIR)}>
                    <torusGeometry args={[0.026, 0.005, 4, 12, Math.PI]} />
                  </mesh>
                ) : (
                  <>
                    <mesh material={mat(P.white, { rough: 0.4 })}>
                      <sphereGeometry args={[0.035, 12, 10]} />
                    </mesh>
                    <mesh position={[0, -0.002, 0.024]} material={mat(EYES, { rough: 0.3 })}>
                      <sphereGeometry args={[0.021, 10, 8]} />
                    </mesh>
                    <mesh
                      position={[0.007, 0.007, 0.041]}
                      material={mat(P.white, { emissive: 0.6 })}
                    >
                      <sphereGeometry args={[0.006, 6, 6]} />
                    </mesh>
                  </>
                )}
              </group>
            ))}
          </group>
          {/* Thick eyebrows */}
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * 0.058, 0.068, 0.142]}
              rotation={[0, 0, s * browTilt + (mood === "curious" && s > 0 ? -0.25 : 0)]}
              material={mat(HAIR)}
            >
              <boxGeometry args={[0.055, 0.016, 0.012]} />
            </mesh>
          ))}
          {/* Small nose */}
          <mesh position={[0, -0.025, 0.158]} material={mat(SKIN)}>
            <sphereGeometry args={[0.018, 8, 6]} />
          </mesh>
          {/* Wide friendly mouth */}
          <mesh
            position={[0, mood === "sad" ? -0.09 : -0.068, 0.145]}
            rotation={[0, 0, mood === "sad" ? 0 : Math.PI]}
            material={mat(P.woodDark)}
          >
            <torusGeometry args={[mood === "determined" ? 0.03 : 0.042, 0.008, 6, 14, Math.PI]} />
          </mesh>
          {pose === "dictate" && <SoundDots />}
        </group>

        {holding === "laptop" && pose !== "work" && (
          <Laptop position={[0, hipY + 0.12, 0.2]} open={1.6} />
        )}
        {holding === "notebook" && <Notebook position={[0.05, hipY + 0.1, 0.18]} rotationY={0.2} />}
      </group>
    </group>
  );
}

/** Three small circles near the mouth that grow and fade while he speaks. */
function SoundDots() {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    g.current.children.forEach((c, i) => {
      const k = (worldState.time * 0.8 + i / 3) % 1;
      c.position.set(0.12 + k * 0.18, -0.05 + k * 0.05, 0.12);
      c.scale.setScalar(0.4 + k * 0.9);
      c.visible = k < 0.92;
    });
  });
  return (
    <group ref={g}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={mat(P.mustard, { emissive: 0.5 })}>
          <sphereGeometry args={[0.018, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}
