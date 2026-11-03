import { useState } from "react";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { book, chapters, links, PARTS, travels } from "@/content/journey";
import { smoothstep, storyAt } from "@/book/timeline";
import { chapterLabel } from "./labels";

interface Props {
  progress: number;
  chapter: number;
  reducedMotion: boolean;
  onToggleMotion: () => void;
  onJumpChapter: (index: number) => void;
  /** True once the visitor has scrolled past the closed book. */
  afterBook?: boolean;
}

const WORK_INDEX = chapters.findIndex((c) => c.id === "gocattles");

export function JourneyHUD({
  progress,
  chapter,
  reducedMotion,
  onToggleMotion,
  onJumpChapter,
  afterBook = false,
}: Props) {
  const [navOpen, setNavOpen] = useState(false);
  const current = chapters[chapter] ?? chapters[0]!;
  const prev = chapter > 0 ? chapters[chapter - 1] : undefined;
  const next = chapter < chapters.length - 1 ? chapters[chapter + 1] : undefined;
  const s = storyAt(progress);
  const coverCaption = s.world < 0 ? 1 - smoothstep(0.08, 0.18, s.intro) : 0;
  const nextTeaser = s.world < 0 ? smoothstep(0.86, 0.97, s.intro) : 0;
  const first = chapters[2]!;
  const leg = s.travel >= 0 ? travels[s.travel] : undefined;

  return (
    <>
      {/* Progress line */}
      <div className="fixed inset-x-0 top-0 z-30 h-0.5 bg-border">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Top bar */}
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-4 pt-4 transition-colors duration-300 sm:px-8 sm:pt-6 ${
          afterBook ? "bg-background/90 pb-3 backdrop-blur-md sm:pb-4" : ""
        }`}
      >
        <button
          className="pointer-events-auto flex items-center gap-3 text-left"
          onClick={() => onJumpChapter(0)}
          aria-label="Back to the cover"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/50 sm:h-11 sm:w-11">
            <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden />
          </span>
          <span>
            <span className="block font-serif text-xl font-semibold leading-none sm:text-2xl">
              {book.author}
            </span>
            <span className="eyebrow mt-1.5 block text-primary/80">{book.title}</span>
          </span>
        </button>
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
          <div className="hidden items-center gap-2.5 rounded-full border border-primary/25 bg-panel px-4 py-1.5 backdrop-blur-md lg:flex">
            {leg ? (
              <p className="font-serif text-lg leading-tight">
                {leg.from} <span className="text-primary">→</span> {leg.to}
              </p>
            ) : (
              <>
                {chapter >= 2 && (
                  <span className="font-serif text-lg font-semibold text-primary">
                    {current.number}
                  </span>
                )}
                <span className="font-serif text-lg leading-tight">
                  {current.place ?? current.title}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => onJumpChapter(WORK_INDEX)}
            className="hidden rounded-full border border-primary/40 bg-panel px-3.5 py-2 text-sm font-medium backdrop-blur-md hover:bg-secondary sm:inline-flex"
          >
            Jump to Work
          </button>
          <button
            onClick={onToggleMotion}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-panel px-3 py-2 text-sm font-medium backdrop-blur-md hover:bg-secondary"
            aria-pressed={reducedMotion}
            title={reducedMotion ? "Turn motion back on" : "Reduce motion"}
          >
            {reducedMotion ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            <span className="hidden md:inline">
              {reducedMotion ? "Motion reduced" : "Reduce motion"}
            </span>
          </button>
          <button
            onClick={() => setNavOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-panel px-3.5 py-2 text-sm font-medium backdrop-blur-md hover:bg-secondary"
            aria-label="Open contents"
          >
            <BookOpen className="h-4 w-4 text-primary" /> Contents
          </button>
        </div>
      </header>

      {/* Cover caption */}
      <div
        className="pointer-events-none fixed bottom-24 left-5 z-20 max-w-sm sm:bottom-28 sm:left-10"
        style={{ opacity: coverCaption, transform: `translateY(${(1 - coverCaption) * 12}px)` }}
      >
        <p className="font-serif text-2xl leading-snug sm:text-3xl">“{chapters[0]?.quote}”</p>
      </div>

      {/* Next-chapter teaser on the opening spread */}
      <div
        className="pointer-events-none fixed bottom-24 right-4 z-20 max-w-xs rounded-lg border border-border bg-card p-5 text-right shadow-panel backdrop-blur sm:right-10"
        style={{ opacity: nextTeaser, transform: `translateY(${(1 - nextTeaser) * 12}px)` }}
      >
        <p className="eyebrow text-primary">
          Next · {chapterLabel(first)} · {first.short}
        </p>
        <p className="mt-1 font-serif text-2xl leading-tight">{first.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">Keep scrolling to turn the page</p>
      </div>

      {/* Bottom bar: previous / next */}
      <footer
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-end justify-between gap-2 px-3 pb-3 transition-opacity duration-300 sm:px-8 sm:pb-6"
        style={{ opacity: afterBook ? 0 : 1, visibility: afterBook ? "hidden" : "visible" }}
      >
        <button
          onClick={() => prev && onJumpChapter(chapter - 1)}
          disabled={!prev}
          className="pointer-events-auto flex min-h-12 max-w-[40%] items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-left text-sm backdrop-blur hover:bg-secondary disabled:opacity-0"
          aria-label={prev ? `Previous: ${prev.title}` : "Previous chapter"}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">
            <span className="hidden sm:inline">{prev ? prev.short : ""}</span>
            <span className="sm:hidden">Previous</span>
          </span>
        </button>

        {chapter >= 2 && (
          <nav
            className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-1.5 pb-4 lg:flex"
            aria-label="Chapters"
          >
            {chapters.slice(2).map((c, i) => (
              <button
                key={c.id}
                onClick={() => onJumpChapter(i + 2)}
                aria-label={`Chapter ${c.number}: ${c.title}`}
                aria-current={i + 2 === chapter ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  i + 2 === chapter
                    ? "w-5 bg-primary shadow-[var(--shadow-glow)]"
                    : "w-2 bg-foreground/25 hover:bg-foreground/50"
                }`}
              />
            ))}
          </nav>
        )}

        <div
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 pb-1 text-muted-foreground transition-opacity"
          style={{ opacity: 1 - smoothstep(0.002, 0.012, progress) }}
        >
          <span className="eyebrow whitespace-nowrap">Scroll to open</span>
          <ChevronDown className="h-4 w-4 animate-scroll-nudge" />
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {chapter < 2 && (
            <button
              onClick={() => onJumpChapter(2)}
              className="hidden rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              Skip intro
            </button>
          )}
          <button
            onClick={() => next && onJumpChapter(chapter + 1)}
            disabled={!next}
            className="flex min-h-12 max-w-[45vw] items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-right text-sm backdrop-blur hover:bg-secondary disabled:opacity-0"
            aria-label={next ? `Next: ${next.title}` : "Next chapter"}
          >
            <span className="truncate">
              <span className="hidden sm:inline">
                {next ? (current.nextLabel ?? next.short) : ""}
              </span>
              <span className="sm:hidden">Next</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </footer>

      {/* Contents */}
      {navOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm"
          onClick={() => setNavOpen(false)}
        >
          <nav
            className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-popover px-6 py-7 shadow-panel sm:px-8"
            onClick={(e) => e.stopPropagation()}
            aria-label="Contents"
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="font-serif text-3xl">Contents</p>
              <button
                onClick={() => setNavOpen(false)}
                aria-label="Close contents"
                className="rounded-full p-1.5 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              {PARTS.map((part) => (
                <section key={part}>
                  <p className="eyebrow mb-1.5 px-3 text-primary">{part}</p>
                  <ol className="space-y-0.5">
                    {chapters.map((c, i) =>
                      c.part !== part ? null : (
                        <li key={c.id}>
                          <button
                            onClick={() => {
                              onJumpChapter(i);
                              setNavOpen(false);
                            }}
                            aria-current={i === chapter ? "true" : undefined}
                            className={`flex w-full items-baseline gap-4 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-secondary ${
                              i === chapter ? "bg-secondary" : ""
                            }`}
                          >
                            <span className="w-7 shrink-0 font-serif text-base font-semibold text-primary">
                              {c.number}
                            </span>
                            <span className="flex-1">
                              <span className="block font-serif text-xl leading-tight">
                                {c.title}
                              </span>
                              {c.place && (
                                <span className="mt-0.5 block text-sm text-muted-foreground">
                                  {c.place}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ),
                    )}
                  </ol>
                </section>
              ))}
            </div>
            {(links.linkedin || links.email || links.video) && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
                {links.linkedin && <NavLink href={links.linkedin}>LinkedIn</NavLink>}
                {links.email && <NavLink href={`mailto:${links.email}`}>Email</NavLink>}
                {links.video && <NavLink href={links.video}>Video</NavLink>}
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      className="rounded-full border border-border px-3.5 py-2 text-sm hover:bg-secondary"
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
