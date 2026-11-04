import { describe, expect, it } from "vitest";
import { lampBeats } from "./lamp";

describe("lamp after the book", () => {
  it("stays dark for the first 100px of scroll", () => {
    expect(lampBeats(0).lit).toBe(0);
    expect(lampBeats(100).lit).toBe(0);
    expect(lampBeats(100).appear).toBe(0);
  });

  it("turns the room from dark to cream over the next 200px", () => {
    expect(lampBeats(200).lit).toBeCloseTo(0.5);
    expect(lampBeats(300).lit).toBe(1);
    expect(lampBeats(900).lit).toBe(1);
  });

  it("is already lit, with the lamp on show, when Reduce motion is on", () => {
    expect(lampBeats(0, true)).toEqual({ appear: 1, lit: 1 });
  });
});
