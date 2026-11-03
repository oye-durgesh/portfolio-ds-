import { describe, expect, it } from "vitest";
import {
  chapterIndexAt,
  outroBeats,
  progressForChapter,
  SEGMENTS,
  storyAt,
  TOTAL,
  travelBeats,
  WORLD_COUNT,
  worldBeats,
} from "./timeline";
import {
  chapters,
  hackathons,
  testimonials,
  travels,
  wordCount,
  worldChapters,
} from "@/content/journey";

describe("book timeline", () => {
  it("has one miniature world per chapter after the prologue", () => {
    expect(worldChapters.length).toBe(WORLD_COUNT);
  });

  it("starts on the cover and ends on the final chapter", () => {
    expect(chapterIndexAt(0)).toBe(0);
    expect(chapters[chapterIndexAt(1)]?.id).toBe("next");
  });

  it("jumping to any chapter lands on that chapter", () => {
    chapters.forEach((_, i) => {
      expect(chapterIndexAt(progressForChapter(i))).toBe(i);
    });
  });

  it("each world is fully risen when its chapter is jumped to", () => {
    for (let i = 2; i < chapters.length; i++) {
      const s = storyAt(progressForChapter(i));
      expect(s.travel).toBe(-1);
      expect(s.outro).toBe(0);
      expect(worldBeats(s.local, s.world === WORLD_COUNT - 1).rise).toBe(1);
    }
  });

  it("the camera reads the printed pages before the world rises", () => {
    const reading = worldBeats(0.22, false);
    expect(reading.read).toBe(1);
    expect(reading.rise).toBe(0);
  });
});

describe("closing the book", () => {
  it("closes after the last chapter, at the very end of the scroll", () => {
    const outro = SEGMENTS[SEGMENTS.length - 1]!;
    expect(outro.kind).toBe("outro");
    expect(storyAt(1).outro).toBeCloseTo(1);
    expect(storyAt(progressForChapter(chapters.length - 1)).outro).toBe(0);
  });

  it("the world sinks first, then the cover shuts, then the camera pulls back", () => {
    expect(outroBeats(0.25).close).toBeLessThan(0.1);
    expect(outroBeats(0.3).sink).toBe(1);
    expect(outroBeats(1)).toEqual({ sink: 1, close: 1, pull: 1 });
  });
});

describe("story structure", () => {
  it("has chapters 01 to 17 in order", () => {
    expect(worldChapters.map((c) => c.number)).toEqual(
      Array.from({ length: 17 }, (_, i) => String(i + 1).padStart(2, "0")),
    );
  });

  it("chapter 07 is the in-between, between GoCattles and BackWithBrain", () => {
    const i = worldChapters.findIndex((c) => c.id === "in-between");
    expect(worldChapters[i]?.number).toBe("07");
    expect(worldChapters[i - 1]?.place).toMatch(/^GoCattles/);
    expect(worldChapters[i + 1]?.part).toBe("BackWithBrain");
    expect(worldChapters[i]?.lesson).toBe(
      "Rejections were part of it. Writing to the founders directly is what finally got me a conversation.",
    );
  });

  it("BackWithBrain shows both D2C and B2B, with the B2B answers left for Durgesh", () => {
    const g = worldChapters.find((c) => c.id === "community")?.growthSides;
    expect(g?.d2c.items).toContain("Community events");
    expect(g?.b2b.title).toBe("How do I figure out B2B growth?");
    expect(g?.b2b.questions.length).toBeGreaterThanOrEqual(3);
    expect(g?.b2b.questions.length).toBeLessThanOrEqual(4);
    expect(g?.b2b.placeholder).toBe("To be filled by me");
  });

  it("Smaran has the new lesson and no email card", () => {
    const c = worldChapters.find((c) => c.id === "smaran")!;
    expect(c.lesson).toBe("It worked for my mother. It did not sell. Both are useful to know.");
    expect(c.voice).toBeUndefined();
    expect(c.tags).toEqual(expect.arrayContaining(["Replit", "Claude", "ElevenLabs"]));
  });

  it("the Wispr Flow chapter has no growth experiments, Slack card or office-corridor plan", () => {
    const c = worldChapters.find((c) => c.id === "next")!;
    expect(c.experiments).toBeUndefined();
    expect(c.voice).toBeUndefined();
    expect(c.work?.title).toBe("What I would build next");
    expect(c.work?.subtitle).toBe("If I join Wispr Flow, this is how I would start.");
    expect(JSON.stringify(c)).not.toMatch(/corridor|ORR|Whitefield|Hebbal/i);
  });

  it("chapter 04 is From Code to Growth, with no 3D modelling", () => {
    const c = worldChapters[3]!;
    expect(c.title).toBe("From Code to Growth");
    expect(JSON.stringify(c)).not.toMatch(/3D modelling/i);
  });

  it("introduces BackWithBrain as an early-stage meditation and mind-fitness company", () => {
    const bwb = worldChapters.find((c) => c.id === "community");
    expect(bwb?.tagline).toMatch(/^An early-stage meditation & mind-fitness company/);
    for (const c of worldChapters.filter((c) => c.part === "BackWithBrain"))
      expect(c.place).toBe("BackWithBrain · Meditation & Mind Fitness");
  });

  it("never repeats a sentence across the book pages, the panels and the voice card", () => {
    for (const c of worldChapters) {
      const zones = [
        [c.title, c.intro, c.quote],
        [c.about, c.lesson, c.note, c.closing, ...(c.work?.items.map((w) => w.text) ?? [])],
        [c.voice?.text],
      ].map((z) => z.filter(Boolean).flatMap((t) => t!.split(/(?<=[.!?])\s+/)));
      zones.forEach((a, i) =>
        zones.forEach((b, j) => {
          if (i < j) for (const line of a) expect(b).not.toContain(line);
        }),
      );
    }
  });

  it("shows the Accountability Partners results exactly as reported", () => {
    const m = worldChapters.find((c) => c.id === "accountability")?.work?.metrics;
    expect(m?.map((x) => x.value)).toEqual(["~70%", "50%+", "190+", "83%"]);
  });

  it("never claims completion doubled", () => {
    expect(JSON.stringify(chapters)).not.toMatch(/doubled programme completion/i);
  });
});

describe("voice cards", () => {
  it("are on chapters 01, 06, 11, 12 and 15", () => {
    expect(worldChapters.filter((c) => c.voice).map((c) => c.number)).toEqual([
      "01",
      "06",
      "11",
      "12",
      "15",
    ]);
  });

  it("count words the way the footer shows them", () => {
    expect(wordCount("Daily Detox didn't work — I called customers.")).toBe(7);
  });
});

describe("journeys", () => {
  it("train after 02, metro after 04, train to Bengaluru after the in-between (07)", () => {
    const legs = SEGMENTS.filter((s) => s.kind === "travel").map((s) => {
      const t = travels[s.kind === "travel" ? s.leg : 0]!;
      return { after: worldChapters[s.world]!.number, route: `${t.from} → ${t.to}`, mode: t.mode };
    });
    expect(legs).toEqual([
      { after: "02", route: "Kanpur → Greater Noida", mode: "train" },
      { after: "04", route: "Greater Noida → Noida", mode: "metro" },
      { after: "07", route: "Greater Noida → Bengaluru", mode: "train" },
    ]);
  });

  it("each journey sits between two chapters and plays fully", () => {
    const seg = SEGMENTS.find((s) => s.kind === "travel")!;
    const mid = storyAt((seg.start + seg.len / 2) / TOTAL);
    expect(mid.travel).toBe(0);
    expect(travelBeats(0.55).map).toBe(1);
    expect(travelBeats(1).bookScale).toBe(1);
    expect(travelBeats(1).move).toBe(1);
  });
});

describe("after the book", () => {
  it("lists the four hackathons oldest to newest, each with its own placing and date", () => {
    expect(hackathons.map((h) => `${h.place} ${h.event} ${h.date} ${h.teams}`)).toEqual([
      "4th AI Agents Hackathon 6 Sep 2026 30 teams",
      "3rd ElevenCreative Session, Bengaluru 18 Sep 2026 8 teams",
      "2nd Razorpay × Replit Sprint Saturday 19 Sep 2026 90+ teams",
      "1st EmberGround AI Hackathon 27 Sep 2026 26 teams",
    ]);
    for (const h of hackathons) expect(h.photos).toHaveLength(3);
  });

  it("testimonials are screenshot slots only, with no written quotes", () => {
    expect(testimonials.length).toBeGreaterThanOrEqual(3);
    expect(testimonials.length).toBeLessThanOrEqual(4);
    for (const t of testimonials) expect(Object.keys(t)).not.toContain("quote");
  });
});
