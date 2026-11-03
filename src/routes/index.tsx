import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { JourneyHUD } from "@/components/journey/JourneyHUD";
import { ChapterPanels } from "@/components/journey/ChapterPanels";
import { TravelCaption } from "@/components/journey/TravelCaption";
import { AfterBook } from "@/components/journey/AfterBook";
import { chapters } from "@/content/journey";
import { StoryText } from "@/components/journey/StoryText";
import { scrollState } from "@/book/scrollState";
import {
  chapterIndexAt,
  progressForChapter,
  smoothstep,
  storyAt,
  TOTAL,
  WORLD_COUNT,
  worldBeats,
} from "@/book/timeline";
import { loadBookScene } from "@/book/loadBookScene";
import { SceneBoundary } from "@/components/journey/SceneBoundary";

const BookScene = lazy(loadBookScene);

/** Rendered by the boundary when the 3D book can't load: switch to the 2D story. */
function SceneFailed({ onFail }: { onFail: () => void }) {
  useEffect(onFail, [onFail]);
  return null;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Book of My Journey — Durgesh Shukla" },
      {
        name: "description",
        content:
          "An interactive 3D pop-up autobiography and portfolio by Durgesh Shukla: growth, ownership and building, one page at a time.",
      },
      { property: "og:title", content: "The Book of My Journey — Durgesh Shukla" },
      {
        property: "og:description",
        content:
          "Open the book: 16 chapters of Durgesh Shukla's journey, the work behind them, and what he'd build next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const MOTION_KEY = "book-reduced-motion";

function Index() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [afterBook, setAfterBook] = useState(false);
  const [reduced, setReduced] = useState(false);
  const runway = useRef<HTMLDivElement>(null);

  /** Scroll distance covered by the book itself (the sections after it scroll on top). */
  const bookMax = useCallback(() => {
    const h = runway.current?.offsetHeight ?? TOTAL * window.innerHeight;
    return Math.max(1, h - window.innerHeight);
  }, []);

  useEffect(() => {
    setWebgl(hasWebGL());
    const saved = window.localStorage.getItem(MOTION_KEY);
    const initial =
      saved !== null
        ? saved === "1"
        : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollState.reducedMotion = initial;
    setReduced(initial);

    const onScroll = () => {
      const max = bookMax();
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      scrollState.target = p;
      setProgress(Math.round(p * 2000) / 2000);
      setAfterBook(window.scrollY > max + window.innerHeight * 0.15);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [bookMax]);

  useEffect(() => {
    document.documentElement.classList.toggle("calm", reduced);
  }, [reduced]);

  const toggleMotion = useCallback(() => {
    setReduced((r) => {
      const next = !r;
      scrollState.reducedMotion = next;
      window.localStorage.setItem(MOTION_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const jumpChapter = useCallback(
    (index: number) => {
      const to = progressForChapter(Math.max(0, Math.min(chapters.length - 1, index))) * bookMax();
      // Long jumps go straight there; the book catches up on its own.
      const far = Math.abs(window.scrollY - to) > window.innerHeight * 3;
      window.scrollTo({ top: to, behavior: scrollState.reducedMotion || far ? "auto" : "smooth" });
    },
    [bookMax],
  );

  const chapter = chapterIndexAt(progress);

  // Left / right arrow keys move between chapters.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") jumpChapter(chapter + 1);
      else if (e.key === "ArrowLeft") jumpChapter(chapter - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, jumpChapter]);

  const jumpToId = useCallback(
    (id: string) => {
      if (id === "hackathons") {
        document.getElementById("hackathons")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const i = chapters.findIndex((c) => c.id === id);
      if (i >= 0) jumpChapter(i);
    },
    [jumpChapter],
  );

  const onReady = useCallback(() => setReady(true), []);
  const onSceneFailed = useCallback(() => setWebgl(false), []);

  const pos = storyAt(progress);
  const isFinal = pos.world === WORLD_COUNT - 1;
  const panelChapter = pos.world >= 0 && pos.travel < 0 ? chapters[2 + pos.world] : undefined;
  const beats = worldBeats(pos.local, isFinal);
  const panelVisible =
    panelChapter && !afterBook
      ? smoothstep(0.5, 0.9, beats.rise) *
        smoothstep(0.3, 0.7, beats.zoom + beats.pullBack) *
        (1 - smoothstep(0, 0.2, pos.outro))
      : 0;

  return (
    <main data-scene-ready={ready ? "true" : undefined} className="relative">
      {webgl !== false && (
        <>
          <div className="fixed inset-0">
            <ClientOnly fallback={null}>
              {webgl && (
                <SceneBoundary fallback={<SceneFailed onFail={onSceneFailed} />}>
                  <Suspense fallback={null}>
                    <BookScene onReady={onReady} />
                  </Suspense>
                </SceneBoundary>
              )}
            </ClientOnly>
          </div>
          <div className="pointer-events-none fixed inset-0 bg-vignette" />

          <div
            className="pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background transition-opacity duration-700"
            style={{ opacity: ready ? 0 : 1 }}
            aria-hidden={ready}
          >
            <p className="font-serif text-3xl">Binding the pages…</p>
            <div className="h-px w-40 overflow-hidden bg-border">
              <div className="h-full w-1/3 animate-pulse bg-primary" />
            </div>
          </div>

          <JourneyHUD
            progress={progress}
            chapter={chapter}
            reducedMotion={reduced}
            onToggleMotion={toggleMotion}
            onJumpChapter={jumpChapter}
            afterBook={afterBook}
          />
          {panelChapter && <ChapterPanels chapter={panelChapter} visible={panelVisible} />}
          <TravelCaption position={pos} />
          {/* Scroll runway that drives the book */}
          <div ref={runway} aria-hidden style={{ height: `${TOTAL * 100}vh` }} />
        </>
      )}
      <StoryText visible={webgl === false} />
      <AfterBook onChapter={jumpToId} onRestart={() => jumpChapter(0)} />
    </main>
  );
}
