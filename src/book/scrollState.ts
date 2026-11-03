/**
 * Per-frame shared state, kept outside React so the scene can read it in
 * useFrame without re-rendering. `target` is raw scroll, `smooth` is damped.
 * `world*` fields are derived once per frame by the Stepper.
 */
export const scrollState = {
  target: 0,
  smooth: 0,
  reducedMotion: false,
};

export const worldState = {
  /** Active world index, -1 during the intro. */
  world: -1,
  local: 0,
  turn: 0,
  /** 0..1 while the camera reads the printed spread. */
  read: 0,
  readPan: 0,
  rise: 0,
  hold: 0,
  zoom: 0,
  pullBack: 0,
  /** Index into `travels` during an India-map journey, else -1. */
  travel: -1,
  travelP: 0,
  /** 0..1, how much of the map is on show. */
  map: 0,
  /** Scale of the book while it shrinks into the map. */
  bookScale: 1,
  /** 0..1 while the book closes after the last chapter. */
  close: 0,
  /** 0..1 while the camera pulls back over the closed book. */
  pull: 0,
  time: 0,
};
