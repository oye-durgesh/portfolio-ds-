import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronDown, Link2 } from "lucide-react";
import { LOOP_STEPS, type Chapter, type Metric } from "@/content/journey";
import { VoiceCard } from "./VoiceCard";
import { chapterLabel } from "./labels";

/**
 * The panels around the miniature world. Nothing here opens another page:
 * Left: what this is, the key lesson and the ownership loop.
 * Right: "My Work" (checklist + metric pills) and the dictation card.
 * Neither repeats the lines printed on the book.
 */
interface Props {
  chapter: Chapter;
  /** 0..1, driven by scroll. */
  visible: number;
}

function fadeStyle(visible: number, dx: number): CSSProperties {
  return {
    opacity: visible,
    transform: `translateX(${(1 - visible) * dx}px)`,
    pointerEvents: visible > 0.5 ? "auto" : "none",
  };
}

/** Staggered rise-in; restarts whenever the chapter changes (parent is keyed). */
function Rise({
  i,
  children,
  className = "",
}: {
  i: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-rise ${className}`} style={{ "--i": i } as CSSProperties}>
      {children}
    </div>
  );
}

export function OwnershipLoop({ loop }: { loop: NonNullable<Chapter["loop"]> }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5" aria-label="Ownership loop">
      {LOOP_STEPS.map((step, i) => {
        const tone = loop[step];
        return (
          <li key={step} className="flex items-center gap-1">
            <span
              className={`rounded px-2 py-1 font-mono text-[0.625rem] uppercase leading-none tracking-[0.06em] ${
                tone === "on"
                  ? "bg-loop text-ivory"
                  : tone === "learn"
                    ? "bg-learn text-ivory"
                    : "border border-foreground/15 text-foreground/25"
              }`}
            >
              {step}
              {tone ? " ✓" : ""}
              <span className="sr-only">{tone ? " (done)" : " (not yet)"}</span>
            </span>
            {i < LOOP_STEPS.length - 1 && (
              <span className="text-[0.6rem] text-foreground/25" aria-hidden>
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function KeyLesson({ text }: { text: string }) {
  return (
    <div className="border-t border-primary/15 pt-4">
      <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-primary">
        <span aria-hidden>💡</span> Key lesson
      </p>
      <p className="mt-1.5 text-sm italic leading-relaxed text-foreground/80">{text}</p>
    </div>
  );
}

function ContextBody({ chapter, compact = false }: { chapter: Chapter; compact?: boolean }) {
  let i = 0;
  return (
    <div className="space-y-3" key={chapter.id}>
      <Rise i={i++} className={compact ? "hidden" : ""}>
        <p className="eyebrow text-primary">{chapterLabel(chapter)}</p>
        <h2 className="mt-2 font-serif text-[1.9rem] font-semibold leading-[1.05] md:max-lg:text-[1.5rem] lg:text-[2.3rem]">
          {chapter.heading ?? chapter.title}
        </h2>
        {chapter.tagline && (
          <p className="mt-1 text-[0.8125rem] text-foreground/55">{chapter.tagline}</p>
        )}
      </Rise>
      {chapter.category && (
        <Rise i={i++}>
          <span className="inline-block rounded-full border border-primary/35 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-primary/90">
            {chapter.category}
          </span>
        </Rise>
      )}
      {chapter.about && (
        <Rise i={i++}>
          <p className="text-[0.95rem] leading-relaxed text-foreground/85 md:max-lg:text-sm lg:text-base">
            {chapter.about}
          </p>
        </Rise>
      )}
      {chapter.tags && (
        <Rise i={i++}>
          <ul className="flex flex-wrap gap-1.5">
            {chapter.tags.map((t) => (
              <li
                key={t}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground/80"
              >
                {t}
              </li>
            ))}
          </ul>
        </Rise>
      )}
      {!compact &&
        chapter.experiments?.map((e) => (
          <Rise i={i++} key={e.title}>
            <div className="rounded-lg border-l-[3px] border-loop bg-foreground/[0.04] px-3.5 py-3">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-check">
                {e.label}
              </p>
              <p className="mt-1 text-base font-bold leading-snug">{e.title}</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-foreground/70">{e.body}</p>
            </div>
          </Rise>
        ))}
      {!compact && chapter.closing && (
        <Rise i={i++}>
          <p className="text-sm leading-relaxed text-foreground/75">{chapter.closing}</p>
        </Rise>
      )}
      {chapter.lesson && (
        <Rise i={i++}>
          <KeyLesson text={chapter.lesson} />
        </Rise>
      )}
      {chapter.loop && (
        <Rise i={i++}>
          <OwnershipLoop loop={chapter.loop} />
        </Rise>
      )}
      {chapter.note && (
        <Rise i={i++}>
          <p className="text-xs italic leading-relaxed text-foreground/40">{chapter.note}</p>
        </Rise>
      )}
    </div>
  );
}

/** "2×" → counts 0 → 2; "~45–50%" → both numbers count up; prefixes and suffixes stay. */
export function useCountUp(value: string, active: boolean, ms = 1000) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (document.documentElement.classList.contains("calm")) {
      setK(1);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const x = Math.min(1, (t - t0) / ms);
      setK(1 - Math.pow(1 - x, 3));
      if (x < 1) raf = requestAnimationFrame(step);
    };
    setK(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, active, ms]);
  if (k >= 1) return value;
  return value.replace(/\d+(\.\d+)?/g, (n) => String(Math.round(Number(n) * k)));
}

function MetricPill({ m, active }: { m: Metric; active: boolean }) {
  const shown = useCountUp(m.value, active);
  return (
    <li className="rounded-lg border border-primary/30 bg-primary/15 px-3.5 py-2">
      <span className="font-mono text-base font-bold text-primary" aria-label={m.value}>
        {shown}
      </span>{" "}
      <span className="text-[0.8125rem] text-foreground/70">{m.label}</span>
    </li>
  );
}

function WorkBody({
  chapter,
  active,
  compact = false,
}: {
  chapter: Chapter;
  active: boolean;
  compact?: boolean;
}) {
  const w = chapter.work;
  if (!w) return null;
  let i = 0;
  return (
    <div key={chapter.id}>
      <Rise i={i++}>
        <h3 className="font-serif text-xl font-semibold text-primary">{w.title ?? "My Work"}</h3>
        <p className="mt-0.5 text-[0.8125rem] text-foreground/60">{w.subtitle}</p>
      </Rise>
      <Rise i={i++}>
        <ul className="mt-3 space-y-3">
          {w.items.map((item) => (
            <li key={item.title} className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-check" strokeWidth={3} aria-hidden />
              <span className="leading-snug">
                <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                <span className={`text-xs text-foreground/60 ${compact ? "" : "md:max-lg:hidden"}`}>
                  {item.text}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Rise>
      {w.insight && (
        <Rise i={i++}>
          <p className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-[0.8125rem] leading-relaxed text-foreground/80">
            {w.insight}
          </p>
        </Rise>
      )}
      {w.metrics && (
        <Rise i={i++}>
          <ul className="mt-4 space-y-2">
            {w.metrics.map((m) => (
              <MetricPill key={m.label} m={m} active={active} />
            ))}
          </ul>
        </Rise>
      )}
      {w.note && (
        <Rise i={i++}>
          <p className="mt-2.5 text-[0.6875rem] italic leading-relaxed text-foreground/40">
            {w.note}
          </p>
        </Rise>
      )}
      {chapter.growthSides && (
        <Rise i={i++}>
          <GrowthSidesBody g={chapter.growthSides} />
        </Rise>
      )}
    </div>
  );
}

const PLACEHOLDER =
  "rounded-lg border border-dashed border-primary/40 px-3 py-2 text-xs italic text-foreground/55";

/** D2C, then the two sides sliding together ("Both sides"), then B2B. */
function GrowthSidesBody({ g }: { g: NonNullable<Chapter["growthSides"]> }) {
  return (
    <div className="mt-5 space-y-4 border-t border-primary/15 pt-4">
      {g.intro.map((t) => (
        <p key={t} className="text-[0.8125rem] leading-relaxed text-foreground/80">
          {t}
        </p>
      ))}
      <section aria-label="D2C growth">
        <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-primary">
          {g.d2c.title}
        </h4>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {g.d2c.items.map((t) => (
            <li
              key={t}
              className="rounded-full bg-secondary px-2.5 py-1 text-[0.6875rem] text-foreground/85"
            >
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs leading-relaxed text-foreground/70">{g.d2c.note}</p>
        <p className={`mt-2 ${PLACEHOLDER}`}>{g.d2c.placeholder}</p>
      </section>

      {/* The two sides slide toward each other and join in the middle. */}
      <div className="flex items-center justify-center gap-0" aria-label="I worked on both sides">
        <span className="animate-join-left rounded-l-lg border border-r-0 border-loop/60 bg-loop/25 px-3 py-1.5 font-mono text-[0.6875rem] font-bold text-foreground">
          D2C
        </span>
        <span className="animate-join-link z-10 -mx-1 flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-panel text-primary">
          <Link2 className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="animate-join-right rounded-r-lg border border-l-0 border-primary/60 bg-primary/20 px-3 py-1.5 font-mono text-[0.6875rem] font-bold text-foreground">
          B2B
        </span>
      </div>
      <p className="-mt-2 text-center font-mono text-[0.625rem] uppercase tracking-[0.12em] text-primary">
        Both sides
      </p>

      <section aria-label="B2B growth">
        <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-primary">
          {g.b2b.title}
        </h4>
        <ul className="mt-2 grid grid-cols-2 gap-2">
          {g.b2b.questions.map((q) => (
            <li key={q} className="rounded-lg border border-primary/25 bg-foreground/[0.04] p-2.5">
              <p className="text-xs font-semibold text-foreground">{q}</p>
              <p className="mt-1 text-[0.625rem] italic text-foreground/45">{g.b2b.placeholder}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const GLASS = "rounded-2xl border border-primary/25 bg-panel shadow-panel backdrop-blur-md";

export function ChapterPanels({ chapter, visible }: Props) {
  const [headerOpen, setHeaderOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const shown = visible > 0.5;
  // Count up once per chapter, when the panel first appears.
  const seen = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (shown && seen.current !== chapter.id) {
      seen.current = chapter.id;
      setActive(false);
      requestAnimationFrame(() => setActive(true));
    }
  }, [shown, chapter.id]);
  useEffect(() => {
    setHeaderOpen(false);
    setWorkOpen(false);
  }, [chapter.id]);

  const hasWork = !!chapter.work;
  const hasRight = hasWork || !!chapter.voice;

  return (
    <>
      {/* Tablet & desktop: left panel */}
      <aside
        className={`${GLASS} fixed left-4 top-24 z-20 hidden max-h-[calc(100vh-12rem)] w-[13.5rem] overflow-y-auto p-4 md:block lg:left-6 lg:w-[17rem] lg:p-6 xl:left-8 xl:w-[20rem]`}
        style={fadeStyle(visible, -16)}
        aria-label="About this chapter"
        aria-live="polite"
      >
        {shown && <ContextBody chapter={chapter} />}
      </aside>

      {/* Tablet & desktop: right column — My Work, then the dictation card */}
      {hasRight && (
        <div
          className="fixed right-4 top-24 z-20 hidden max-h-[calc(100vh-12rem)] w-[12.5rem] flex-col gap-3 md:flex lg:right-6 lg:w-[16rem] xl:right-8 xl:w-[18.5rem]"
          style={fadeStyle(visible, 16)}
        >
          {hasWork && (
            <aside
              className={`${GLASS} min-h-0 overflow-y-auto p-4 lg:p-6`}
              aria-label={chapter.work?.title ?? "My Work"}
            >
              {shown && <WorkBody chapter={chapter} active={active} />}
            </aside>
          )}
          {chapter.voice && shown && (
            <VoiceCard
              key={chapter.id}
              note={chapter.voice}
              className={`shrink-0 ${hasWork ? "hidden" : ""}`}
            />
          )}
        </div>
      )}
      {/* Tablet & desktop: with My Work on show, the dictation card floats over the right of the scene */}
      {hasWork && chapter.voice && (
        <div
          className="fixed bottom-24 right-[14.5rem] z-20 hidden w-[15rem] md:block lg:right-[19rem] lg:w-[18rem] xl:right-[21.5rem] xl:w-[19rem]"
          style={fadeStyle(visible, 16)}
        >
          {shown && <VoiceCard key={chapter.id} note={chapter.voice} />}
        </div>
      )}

      {/* Phone: collapsible header above the scene */}
      <section
        className={`${GLASS} fixed inset-x-3 top-[4.5rem] z-20 max-h-[42vh] overflow-y-auto px-4 py-3 md:hidden`}
        style={{
          opacity: visible,
          transform: `translateY(${(visible - 1) * 12}px)`,
          pointerEvents: shown ? "auto" : "none",
        }}
        aria-label="About this chapter"
      >
        <button
          onClick={() => setHeaderOpen((o) => !o)}
          aria-expanded={headerOpen}
          className="flex min-h-12 w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="eyebrow block text-primary">{chapterLabel(chapter)}</span>
            <span className="mt-1 block font-serif text-2xl font-semibold leading-tight">
              {chapter.heading ?? chapter.title}
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-primary transition-transform ${headerOpen ? "rotate-180" : ""}`}
          />
        </button>
        {headerOpen && (
          <div className="mt-3">
            <ContextBody chapter={chapter} compact />
          </div>
        )}
      </section>

      {/* Phone: My Work and the dictation card below the scene */}
      {hasRight && (
        <section
          className="fixed inset-x-3 bottom-[4.75rem] z-20 max-h-[34vh] space-y-2 overflow-y-auto md:hidden"
          style={{
            opacity: visible,
            transform: `translateY(${(1 - visible) * 12}px)`,
            pointerEvents: shown ? "auto" : "none",
          }}
        >
          {hasWork && (
            <div className={`${GLASS} px-4 py-2`}>
              <button
                onClick={() => setWorkOpen((o) => !o)}
                aria-expanded={workOpen}
                className="flex min-h-12 w-full items-center justify-between text-left font-serif text-lg font-semibold text-primary"
              >
                {chapter.work?.title ?? "My Work"}
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${workOpen ? "rotate-180" : ""}`}
                />
              </button>
              {workOpen && (
                <div className="pb-3">
                  <WorkBody chapter={chapter} active={workOpen} compact />
                </div>
              )}
            </div>
          )}
          {chapter.voice && shown && !workOpen && (
            <VoiceCard key={chapter.id} note={chapter.voice} className="min-w-[280px]" />
          )}
        </section>
      )}
    </>
  );
}
