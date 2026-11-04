/**
 * Scroll → lamp mapping for the section after the book closes.
 * `scrolled` is how many px the lamp section's top has moved above the viewport top.
 * The room stays dark for the first DARK_PX, then the lamp fades in and, over
 * LIGHT_PX, its shade tilts down and the room goes from walnut to cream.
 */
export const LAMP_DARK_PX = 100;
export const LAMP_LIGHT_PX = 200;
/** Extra scroll with the room fully lit before the next section slides up. */
export const LAMP_HOLD_PX = 0;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function lampBeats(scrolled: number, calm = false) {
  if (calm) return { appear: 1, lit: 1 };
  return {
    appear: clamp01((scrolled - LAMP_DARK_PX) / 40),
    lit: clamp01((scrolled - LAMP_DARK_PX) / LAMP_LIGHT_PX),
  };
}
