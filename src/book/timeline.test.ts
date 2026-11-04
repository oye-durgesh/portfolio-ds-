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
  contact,
  growth,
  hackathon,
  links,
  operate,
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

  it("BackWithBrain shows the referral channel and Durgesh's four B2B answers", () => {
    const g = worldChapters.find((c) => c.id === "community")?.growthSides;
    expect(g?.d2c.items).toContain("Community events");
    expect(g?.d2c.referral).toMatch(/^Referral growth channel — Participants invite a friend/);
    expect(g?.b2b.title).toBe("How do I figure out B2B growth?");
    expect(g?.b2b.questions).toEqual([
      { q: "Who buys?", a: "HR leaders and wellness heads at mid-size tech companies." },
      {
        q: "Who is the user?",
        a: "The employee who meditates. Adoption depends on them, not on the buyer.",
      },
      {
        q: "How do we reach them?",
        a: "Direct outreach to HR, plus word of mouth from employees who tried the B2C product.",
      },
      {
        q: "How do we test it cheaply?",
        a: "Offer a free 7-day programme to one company. Measure how many employees complete it.",
      },
    ]);
  });

  it("Smaran has the new lesson and no email card", () => {
    const c = worldChapters.find((c) => c.id === "smaran")!;
    expect(c.lesson).toBe("It worked for my mother. It did not sell. Both are useful to know.");
    expect(c.voice).toBeUndefined();
    expect(c.tags).toEqual(expect.arrayContaining(["Replit", "Claude", "ElevenLabs"]));
  });

  it("chapter 17 is 'Written with Wispr Flow': no right panel, lesson, loop or desk labels", () => {
    const c = worldChapters.find((c) => c.id === "next")!;
    expect(c.title).toBe("Written with Wispr Flow");
    expect(c.quote).toBe("The next chapter, I want to write with Wispr.");
    expect(c.work).toBeUndefined();
    expect(c.voice).toBeUndefined();
    expect(c.lesson).toBeUndefined();
    expect(c.loop).toBeUndefined();
    expect(c.experiments).toBeUndefined();
    expect(c.annotations?.map((a) => a.label)).not.toEqual(
      expect.arrayContaining(["Speaking, not typing", "Voice becomes text"]),
    );
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
  it("train after 02, metro after 04, flight to Bengaluru after the in-between (07)", () => {
    const legs = SEGMENTS.filter((s) => s.kind === "travel").map((s) => {
      const t = travels[s.kind === "travel" ? s.leg : 0]!;
      return { after: worldChapters[s.world]!.number, route: `${t.from} → ${t.to}`, mode: t.mode };
    });
    expect(legs).toEqual([
      { after: "02", route: "Kanpur → Greater Noida", mode: "train" },
      { after: "04", route: "Greater Noida → Noida", mode: "metro" },
      { after: "07", route: "Greater Noida → Bengaluru", mode: "plane" },
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
  it("features only the Razorpay × Replit 2nd place, with its two photos", () => {
    expect(hackathon.event).toBe("Razorpay × Replit Sprint Saturday");
    expect(hackathon.place).toBe("2ND");
    expect(hackathon.subtitle).toBe("Razorpay × Replit Sprint Saturday · 19 Sep 2026 · 90+ teams");
    expect(hackathon.photos).toHaveLength(2);
  });

  it("testimonials are screenshot slots only, with no written quotes", () => {
    expect(testimonials.length).toBeGreaterThanOrEqual(2);
    expect(testimonials.length).toBeLessThanOrEqual(4);
    for (const t of testimonials) expect(Object.keys(t)).not.toContain("quote");
  });

  it("uses Durgesh's real email, phone and LinkedIn", () => {
    expect(links.email).toBe("durgeshshukla0213@gmail.com");
    expect(links.phone).toBe("+91 7022647516");
    expect(links.linkedin).toBe("https://www.linkedin.com/in/durgesh-shukla-46b9101b5/");
  });

  it("How I Operate has 4 principles, each linked to its chapter", () => {
    expect(operate.principles.map((c) => c.evidence)).toEqual([
      "See Chapter 11",
      "See Chapter 05",
      "See Chapter 06 + 12",
      "See Chapters 05, 09, 12",
    ]);
    expect(operate.principles.map((c) => c.accent)).toEqual(["forest", "gold", "terracotta", "olive"]);
    const ids = chapters.map((c) => c.id);
    for (const p of operate.principles) expect(ids).toContain(p.link);
  });

  it("principle 04 carries the old 'learn by doing' line", () => {
    expect(operate.principles[3]!.text).toContain(
      "I test growth channels by showing up, not by making decks.",
    );
  });

  it("the growth playbook has the four proposed channels, in order, each fully explained", () => {
    expect(growth.title).toBe("Unlocking New Growth Channels for Wispr Flow.");
    expect(growth.opportunities.map((o) => o.number)).toEqual(["01", "02", "03", "04"]);
    expect(growth.opportunities.map((o) => o.category)).toEqual([
      "Partnership-led distribution",
      "Community-led distribution",
      "Out-of-home brand awareness",
      "Contextual outdoor advertising",
    ]);
    for (const o of growth.opportunities)
      for (const v of Object.values(o.details)) expect(v.length).toBeGreaterThan(0);
    expect(growth.execution.steps.map((s) => s.name)).toEqual([
      "Discover",
      "Pilot",
      "Activate",
      "Retain",
      "Scale",
    ]);
  });

  it("frames every channel as a proposal, not a launched partnership", () => {
    expect(growth.note).toMatch(/proposed experiments/);
    expect(growth.note).toMatch(/None of them has launched/);
    expect(JSON.stringify(growth)).not.toMatch(/partnered with|in partnership with|launched with/i);
  });

  it("the Zepto offer tests ₹299 and ₹399 baskets", () => {
    expect(growth.opportunities[0]!.description).toContain("₹299 and ₹399");
  });

  it("the ORR billboard never asks people to dictate while driving", () => {
    const b = growth.opportunities[3]!.creative!;
    expect(b.at(-1)).toMatch(/parked or back at your desk/);
    expect(b.at(-1)).toMatch(/never while driving or riding/);
  });

  it("shows no fill-in placeholders anywhere", () => {
    const all = JSON.stringify({ chapters, growth, contact, hackathon, operate, links });
    expect(all).not.toMatch(
      /to be filled|to be confirmed|wording to be|\[your|\[Reason|\[First thing|closing line goes here|Section names/i,
    );
  });
});
