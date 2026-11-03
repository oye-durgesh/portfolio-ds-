/**
 * Mounts the miniature world for the chapter on show, keeps it standing on
 * the paper, and adds the gold annotation labels that point at its objects.
 * Labels never open anything: the visitor never leaves the book.
 */
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { worldChapters, type Annotation } from "@/content/journey";
import { AnnotationIcon } from "@/components/journey/icons";
import { worldState } from "../scrollState";
import { MetroRide } from "../map/MetroRide";
import { BOOK } from "../Book";
import { WORLD_COUNT } from "../timeline";
import type { V3, WorldDef } from "./kit";
import { EARLY_WORLDS } from "./worldsEarly";
import { LATE_WORLDS } from "./worldsLate";

const WORLDS: Record<string, WorldDef> = { ...EARLY_WORLDS, ...LATE_WORLDS };

const INNER = BOOK.T - 2 * BOOK.B;

/** Height of the paper the world stands on, given pages turned so far. */
export function stageHeight(turned: number) {
  const hl = INNER * 0.8 * (turned / WORLD_COUNT);
  return BOOK.B + Math.max(hl, INNER - hl) + 0.004;
}
export const STAGE_Z = -0.15;

/** A floating label joined to its object by a fine gold line. */
function AnnotationLabel({ a, at, index }: { a: Annotation; at: V3; index: number }) {
  const el = useRef<HTMLDivElement>(null);
  useFrame(() => {
    if (!el.current) return;
    const on = worldState.travel < 0 && worldState.rise > 0.92 && worldState.zoom > 0.6;
    el.current.style.opacity = on ? "1" : "0";
    el.current.style.pointerEvents = on ? "auto" : "none";
  });
  // Point outward, except near the page edges where the side panels would hide the label.
  const left = at[0] < 0 ? at[0] > -1.3 : at[0] > 1.7;
  const dx = left ? -46 : 46;
  const dy = -(38 + (index % 2) * 30);
  const body = (
    <>
      <AnnotationIcon name={a.icon} className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span>{a.label}</span>
    </>
  );
  const chip =
    "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/50 bg-panel px-3 py-1.5 text-[0.8rem] font-medium leading-none text-foreground shadow-[var(--shadow-glow)] backdrop-blur-md";
  return (
    <Html position={at} zIndexRange={[15, 10]} style={{ pointerEvents: "none" }}>
      <div
        ref={el}
        className="relative transition-opacity duration-500"
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <svg
          className="pointer-events-none absolute overflow-visible"
          style={{ left: 0, top: 0 }}
          width="1"
          height="1"
          aria-hidden
        >
          <line x1="0" y1="0" x2={dx} y2={dy} className="stroke-primary" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" className="fill-primary" />
          <circle
            cx="0"
            cy="0"
            r="6"
            className="animate-dot-pulse fill-none stroke-primary/70"
            strokeWidth="1.5"
            style={{ animationDelay: `${index * 0.3}s` }}
          />
        </svg>
        <div
          className="absolute"
          style={{
            left: dx,
            top: dy,
            transform: `translate(${left ? "-100%" : "0"}, -50%)`,
          }}
        >
          <div className={chip}>{body}</div>
        </div>
      </div>
    </Html>
  );
}

export function WorldStage() {
  const [w, setW] = useState(-1);
  const root = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (worldState.world !== w) setW(worldState.world);
    if (!root.current) return;
    // Stand on whichever page stack is higher so nothing sinks into paper.
    const turned = worldState.world < 0 ? 0 : worldState.world + worldState.turn;
    root.current.position.y = stageHeight(turned);
  });

  const ch = w >= 0 ? worldChapters[w] : undefined;
  const def = ch ? WORLDS[ch.id] : undefined;
  const World = def?.C;

  return (
    <group ref={root} position={[0, BOOK.T, STAGE_Z]}>
      <MetroRide />
      {ch && World && <World key={ch.id} />}
      {ch?.annotations?.map((a, i) => {
        const at = def?.anchors[a.id];
        return at ? <AnnotationLabel key={`${ch.id}-${a.id}`} a={a} at={at} index={i} /> : null;
      })}
    </group>
  );
}
