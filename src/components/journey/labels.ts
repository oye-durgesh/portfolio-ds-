import type { Chapter } from "@/content/journey";

/** "Chapter 05" or "Cover". */
export function chapterLabel(c: Chapter) {
  if (c.id === "cover" || c.id === "prologue") return "Cover";
  return `Chapter ${c.number}`;
}

/** First part of the place line, e.g. "GoCattles" from "GoCattles · Prime Day". */
export function shortPlace(c: Chapter) {
  return c.place?.split(" · ")[0] ?? c.title;
}
