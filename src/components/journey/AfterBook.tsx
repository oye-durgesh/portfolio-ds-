import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  AudioLines,
  Check,
  ChevronDown,
  ImagePlus,
  Linkedin,
  Plus,
} from "lucide-react";
import {
  contact,
  growth,
  hackathon,
  links,
  operate,
  statement,
  testimonials,
  testimonialsIntro,
  whoIAm,
  type GrowthOpportunity,
  type Headline,
  type OperateExtra,
  type OperatePrinciple,
} from "@/content/journey";
import { LAMP_DARK_PX, LAMP_HOLD_PX, LAMP_LIGHT_PX, lampBeats } from "./lamp";

/**
 * The sections after the book closes, in the Wispr Flow editorial style:
 * the lamp turns on (dark → cream) → How I Operate (photo + one-open-at-a-time principles)
 * → Building Under Pressure → What people say → green "My Growth Playbook" heading →
 * four opportunity cards, the execution steps and the transcription strip → green contact block. Cream sections and deep-green blocks alternate.
 * Everything from the lamp on uses the cream `.lit` theme; the only scroll-driven
 * piece is the lamp, which is already lit when Reduce motion is on.
 */


/** True while the in-app "Reduce motion" switch (html.calm) is on. */
function isCalm() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("calm");
}

function useCalm() {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const read = () => setCalm(isCalm());
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return calm;
}

/** Runs `fn` on scroll/resize (once per frame) and when Reduce motion changes. */
function useScrollFrame(fn: () => void) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => cb.current());
    };
    run();
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    const mo = new MutationObserver(run);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
      mo.disconnect();
    };
  }, []);
}

/** Fades a block in (rise 40px) the first time it scrolls into view. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isCalm()) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      data-shown={on}
      className={`transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${className}`}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(40px)",
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------ shared pieces */

/** "Good questions." style: roman lead, italic ending. */
function TitleText({ title, em }: { title: string; em: string }) {
  const at = title.lastIndexOf(em);
  if (at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <em className="italic">{em}</em>
      {title.slice(at + em.length)}
    </>
  );
}

function SectionHead({
  h,
  id,
  subtitle,
  onGreen = false,
}: {
  h: Headline;
  id: string;
  subtitle?: string;
  onGreen?: boolean;
}) {
  return (
    <Reveal className="text-center">
      <p
        className={`font-mono text-[0.6875rem] uppercase tracking-[0.1em] ${
          onGreen ? "text-flow-foreground/60" : "text-foreground/45"
        }`}
      >
        {h.eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-3 font-serif text-[2.25rem] font-medium leading-[1.05] md:text-[3.25rem] ${
          onGreen ? "text-flow-foreground" : "text-foreground"
        }`}
      >
        <TitleText title={h.title} em={h.em} />
      </h2>
      {subtitle && (
        <p
          className={`mx-auto mt-3 max-w-xl text-sm md:text-base ${
            onGreen ? "text-flow-foreground/70" : "text-foreground/55"
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

/** A photo, or a labelled dashed slot until Durgesh uploads one. */
function ImageSlot({
  src,
  alt,
  label,
  className = "",
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-foreground/20 bg-foreground/[0.03] text-foreground/40 ${className}`}
    >
      <ImagePlus className="h-6 w-6" aria-hidden />
      <span className="px-3 text-center text-xs font-medium">{label}</span>
    </div>
  );
}

const SECTION = "mx-auto max-w-[1100px] px-4 py-16 md:py-20";

/** Full-width deep-green block, like the green bands on the Wispr Flow site. */
function GreenBlock({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={label}
      className={`bg-flow px-4 py-14 text-flow-foreground md:py-20 ${className}`}
    >
      {children}
    </section>
  );
}

function Rule() {
  return <hr className="mx-auto max-w-[1100px] border-foreground/[0.08]" aria-hidden />;
}

/* ------------------------------------------------ the lamp turns on */

function LampOn() {
  const zone = useRef<HTMLElement>(null);
  const calm = useCalm();
  useScrollFrame(() => {
    const el = zone.current;
    if (!el) return;
    const { appear, lit } = lampBeats(-el.getBoundingClientRect().top, isCalm());
    el.style.setProperty("--appear", appear.toFixed(3));
    el.style.setProperty("--lit", lit.toFixed(3));
    el.setAttribute("data-on", String(lit > 0.02));
  });
  return (
    <section
      ref={zone}
      aria-hidden
      className="lamp relative"
      style={
        {
          "--lit": 0,
          "--appear": 0,
          height: calm
            ? "40vh"
            : `calc(100vh + ${LAMP_DARK_PX + LAMP_LIGHT_PX + LAMP_HOLD_PX}px)`,
        } as CSSProperties
      }
    >
      <div
        className={`lamp-bg sticky top-0 flex ${calm ? "h-full" : "h-screen"} items-center justify-center overflow-hidden px-4`}
      >
        {/* Desk lamp on the left; its light spreads out from the shade. */}
        <div className="lamp-fixture absolute left-[3vw] top-[12vh] h-36 w-36 md:left-[6vw] md:top-[14vh] md:h-60 md:w-60">
          <div className="lamp-light-origin absolute left-[83%] top-[52%]" aria-hidden>
            <div className="lamp-light" />
          </div>
          <svg viewBox="0 0 220 220" className="relative h-full w-full" aria-hidden>
            <rect x="18" y="200" width="84" height="12" rx="6" className="lamp-gold" />
            <path d="M60 202 L96 118 L148 64" className="lamp-arm" />
            <circle cx="96" cy="118" r="7" className="lamp-gold" />
            <circle cx="148" cy="64" r="6" className="lamp-gold" />
            <g className="lamp-shade">
              <circle cx="176" cy="104" r="9" className="lamp-bulb" />
              <path d="M144 64.5 L160 55.5 L207 95 L155 125 Z" className="lamp-gold" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ How I Operate (photo + accordion) */

const ACCENT: Record<OperatePrinciple["accent"], string> = {
  forest: "var(--flow)",
  gold: "var(--lamp-gold)",
  terracotta: "var(--learn)",
  olive: "var(--op-olive)",
};

const PILL = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium";

function OperateExtraView({ x }: { x: OperateExtra }) {
  if (x.kind === "compare")
    return (
      <ul className="flex flex-wrap gap-2">
        <li className={`${PILL} bg-foreground/[0.06] text-foreground/60`}>{x.before}</li>
        <li className={`${PILL} bg-soft-green font-semibold text-flow`}>{x.after}</li>
      </ul>
    );
  if (x.kind === "steps")
    return (
      <ol className="flex flex-wrap items-center gap-1.5" aria-label="Growth path">
        {x.steps.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-xs text-foreground/35" aria-hidden>
                →
              </span>
            )}
            <span
              className={`${PILL} border border-[var(--acc)] bg-[color-mix(in_oklch,var(--acc)_12%,transparent)] text-foreground`}
            >
              {s}
            </span>
          </li>
        ))}
      </ol>
    );
  if (x.kind === "lessons")
    return (
      <ul className="flex flex-wrap gap-2">
        {x.lessons.map((l) => (
          <li key={l} className={`${PILL} border border-learn text-learn`}>
            {l}
          </li>
        ))}
      </ul>
    );
  return (
    <ul className="flex flex-wrap gap-2">
      {x.places.map((p) => (
        <li key={p} className={`${PILL} bg-foreground/[0.05] text-foreground/75`}>
          <span aria-hidden>📍</span>
          {p}
        </li>
      ))}
    </ul>
  );
}

function OperateItem({
  p,
  open,
  onToggle,
  onChapter,
}: {
  p: OperatePrinciple;
  open: boolean;
  onToggle: () => void;
  onChapter: (id: string) => void;
}) {
  const btn = `op-btn-${p.number}`;
  const panel = `op-panel-${p.number}`;
  return (
    <li
      className="op-acc rounded-xl border border-foreground/[0.08] bg-paper-white"
      data-open={open}
      style={{ "--acc": ACCENT[p.accent] } as CSSProperties}
    >
      <h3>
        <button
          id={btn}
          aria-expanded={open}
          aria-controls={panel}
          onClick={onToggle}
          className="flex w-full items-center gap-4 rounded-xl px-6 py-5 text-left transition-colors hover:bg-foreground/[0.02]"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--acc)] font-mono text-xs font-bold text-paper-white"
            aria-hidden
          >
            {p.number}
          </span>
          <span className="flex-1 text-[0.9375rem] font-semibold leading-snug text-foreground">
            {p.title}
          </span>
          <ChevronDown className="op-arrow h-4 w-4 shrink-0 text-foreground/40" aria-hidden />
        </button>
      </h3>
      <div id={panel} role="region" aria-labelledby={btn} className="op-panel" inert={!open}>
        <div className="overflow-hidden">
          <div className="op-body px-6 pb-6 md:pl-[4.75rem]">
            <p className="text-[0.9375rem] leading-[1.7] text-foreground/65">{p.text}</p>
            <div className="mt-4">
              <OperateExtraView x={p.extra} />
            </div>
            <button
              onClick={() => onChapter(p.link)}
              className="mt-4 font-mono text-xs font-semibold text-flow underline-offset-4 hover:underline"
            >
              {p.evidence} →
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function HowIOperate({ onChapter }: { onChapter: (id: string) => void }) {
  const [open, setOpen] = useState(0);
  return (
    <section aria-labelledby="who-title" className="bg-background px-5 pb-[60px] pt-6">
      <div className="mx-auto grid max-w-[1000px] gap-10 md:grid-cols-[2fr_3fr] md:gap-12">
        {/* Photo column: stays in view on desktop while the principles scroll. */}
        <div className="text-center md:sticky md:top-28 md:self-start md:text-left">
          <Reveal>
            <h2
              id="who-title"
              className="mb-6 font-serif text-[2rem] font-medium italic leading-tight text-foreground"
            >
              {whoIAm.headline.title}
            </h2>
            <img
              src={whoIAm.image}
              alt={whoIAm.imageAlt}
              loading="lazy"
              className="mx-auto aspect-square w-[250px] rounded-2xl bg-paper-white object-cover object-center shadow-lg md:mx-0 md:w-full md:max-w-[350px]"
            />
            <p className="mt-5 font-serif text-2xl font-medium text-foreground">{whoIAm.name}</p>
            <p className="mt-1 font-serif text-base italic text-foreground/50">{whoIAm.tagline}</p>
            <ul
              className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start"
              aria-label="How I work"
            >
              {whoIAm.pills.map((pill) => (
                <li
                  key={pill}
                  className={`${PILL} border border-foreground/10 bg-paper-white text-flow`}
                >
                  {pill}
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <h3
              id="operate-title"
              className="font-serif text-[2rem] font-medium italic leading-tight text-foreground"
            >
              {operate.headline.title}
            </h3>
          </Reveal>
          <ul className="mt-6 flex flex-col gap-2">
            {operate.principles.map((p, i) => (
              <OperateItem
                key={p.number}
                p={p}
                open={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)}
                onChapter={onChapter}
              />
            ))}
          </ul>
          <p className="mt-8 font-serif text-base italic text-foreground/40">{statement}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ Building Under Pressure */

function Hackathon() {
  const h = hackathon;
  return (
    <section id="hackathons" aria-labelledby="hack-title" className={`${SECTION} scroll-mt-16`}>
      <SectionHead id="hack-title" h={h.headline} subtitle={h.subtitle} />
      <Reveal delay={0.1}>
        <article className="mx-auto mt-10 grid max-w-[900px] overflow-hidden rounded-2xl bg-paper-white shadow-lg md:grid-cols-2">
          {/* Photos left (2 + 1), story right; stacked on phones. */}
          <ul className="grid grid-cols-2 gap-3 p-4" aria-label={`Photos from ${h.event}`}>
            {h.photos.map((src, i) => (
              <li key={i} className="col-span-2">
                <ImageSlot
                  src={src}
                  alt={`${h.event}, photo ${i + 1}`}
                  label={`Photo ${i + 1}`}
                  className="h-[200px] w-full rounded-xl"
                />
              </li>
            ))}
          </ul>
          <div className="flex flex-col justify-center p-6 text-ink md:p-8 md:pl-4">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-paper-white text-lg font-extrabold">
                {h.place}
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.1em]">
                {h.placeLabel}
              </span>
            </div>
            <h3 className="mt-4 font-serif text-2xl font-semibold">{h.event}</h3>
            <p className="mt-1 text-sm text-ink/55">{h.details}</p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed">{h.text}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {h.tags.map((t) => (
                <li
                  key={t}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    t.startsWith("★")
                      ? "bg-primary text-primary-foreground"
                      : "bg-ink text-paper-white"
                  }`}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------ What people say */

/** Left-edge accent per card: lavender, then gold. */
const ACCENTS = [
  { border: "border-l-quote-lavender", fill: "bg-soft-lavender/40" },
  { border: "border-l-lamp-gold", fill: "bg-soft-yellow" },
];

function Testimonials() {
  return (
    <section aria-labelledby="say-title" className={SECTION}>
      <SectionHead id="say-title" h={testimonialsIntro.headline} />
      <ul className="mx-auto mt-10 grid max-w-[1100px] items-start gap-4 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <li key={i}>
            <Reveal delay={i * 0.08}>
              <figure
                className={`overflow-hidden rounded-2xl border-l-[3px] bg-paper-white p-6 shadow-sm ${ACCENTS[i % ACCENTS.length]!.border}`}
              >
                {t.image ? (
                  <img src={t.image} alt={t.alt} loading="lazy" className="w-full rounded-lg" />
                ) : (
                  <div
                    role="img"
                    aria-label="Upload: LinkedIn recommendation screenshot"
                    className={`m-3 flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/15 px-4 text-center text-foreground/45 ${ACCENTS[i % ACCENTS.length]!.fill}`}
                  >
                    <Linkedin className="h-6 w-6" aria-hidden />
                    <span className="text-xs font-medium">
                      Upload: LinkedIn recommendation screenshot
                    </span>
                  </div>
                )}
                {t.name && (
                  <figcaption className="px-4 py-3 text-[0.8125rem]">
                    <span className="block font-bold text-foreground">{t.name}</span>
                    {t.role && <span className="block text-foreground/55">{t.role}</span>}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------ My Growth Playbook */

const DETAIL_ROWS: { key: keyof GrowthOpportunity["details"]; label: string }[] = [
  { key: "opportunity", label: "The opportunity" },
  { key: "execute", label: "What I will execute" },
  { key: "audience", label: "The audience" },
  { key: "hypothesis", label: "The growth hypothesis" },
  { key: "measure", label: "How I will measure success" },
];

function OpportunityCard({ o, i }: { o: GrowthOpportunity; i: number }) {
  const [open, setOpen] = useState(false);
  const btn = `opp-btn-${o.number}`;
  const panel = `opp-panel-${o.number}`;
  return (
    <li>
      <Reveal delay={(i % 2) * 0.12}>
        <article
          className="opp flex flex-col overflow-hidden rounded-2xl border border-foreground/[0.08] bg-paper-white shadow-sm"
          data-open={open}
          aria-labelledby={`opp-h-${o.number}`}
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
            <img
              src={o.image}
              alt={o.imageAlt}
              loading="lazy"
              width={1280}
              height={832}
              className="opp-img h-full w-full object-cover"
            />
            <span className="absolute left-3 top-3 rounded-full bg-paper-white/90 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-foreground/70 backdrop-blur">
              Concept visual
            </span>
          </div>
          <div className="flex flex-1 flex-col p-6 md:p-8">
            <div className="flex items-end justify-between gap-4">
              <span
                className="opp-num font-serif text-[3.25rem] lining-nums font-medium leading-none text-flow"
                aria-hidden
              >
                {o.number}
              </span>
              <span className="pb-1 text-right font-mono text-[0.625rem] uppercase tracking-[0.12em] text-primary">
                {o.category}
              </span>
            </div>
            <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-foreground/50">
              <span className="sr-only">Opportunity {o.number}: </span>
              {o.channel}
            </p>
            <h3
              id={`opp-h-${o.number}`}
              className="mt-2 font-serif text-[1.75rem] font-semibold leading-[1.15] text-foreground md:text-[2rem]"
            >
              “{o.headline}”
            </h3>
            <p className="mt-4 text-[0.9375rem] leading-[1.7] text-foreground/70">{o.description}</p>
            <div className="mt-5 rounded-xl border-l-[3px] border-flow bg-flow/[0.05] px-4 py-3">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-flow">
                Growth objective
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{o.objective}</p>
            </div>

            <div id={panel} role="region" aria-labelledby={btn} className="opp-panel" inert={!open}>
              <div className="overflow-hidden">
                <div className="opp-body pt-6">
                  <dl className="divide-y divide-foreground/[0.08] border-y border-foreground/[0.08]">
                    {DETAIL_ROWS.map((r, n) => (
                      <div key={r.key} className="grid gap-1 py-3.5 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                        <dt className="font-mono text-[0.625rem] uppercase leading-5 tracking-[0.1em] text-primary">
                          {String(n + 1).padStart(2, "0")} · {r.label}
                        </dt>
                        <dd className="text-sm leading-relaxed text-foreground/75">
                          {o.details[r.key]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {o.creative && (
                    <figure className="mt-5 rounded-xl bg-flow p-5 text-flow-foreground">
                      <figcaption className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-flow-foreground/60">
                        Billboard creative
                      </figcaption>
                      <p className="mt-3 font-serif text-2xl font-semibold">{o.creative[0]}</p>
                      {o.creative.slice(1, 3).map((l) => (
                        <p key={l} className="mt-1 font-serif text-lg italic text-flow-foreground/85">
                          {l}
                        </p>
                      ))}
                      <p className="mt-3 font-serif text-2xl font-semibold text-lamp-gold">
                        {o.creative[3]}
                      </p>
                      <p className="mt-1 text-sm text-flow-foreground/85">{o.creative[4]}</p>
                      <p className="mt-3 border-t border-flow-foreground/15 pt-3 text-xs text-flow-foreground/65">
                        {o.creative[5]}
                      </p>
                    </figure>
                  )}
                </div>
              </div>
            </div>

            <button
              id={btn}
              aria-expanded={open}
              aria-controls={panel}
              onClick={() => setOpen(!open)}
              className="mt-auto inline-flex items-center gap-2 self-start pt-6 text-sm font-semibold text-flow underline-offset-4 hover:underline"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-flow/30">
                <Plus className="opp-plus h-3.5 w-3.5" aria-hidden />
              </span>
              {open ? "Close the idea" : "Explore the idea"}
            </button>
          </div>
        </article>
      </Reveal>
    </li>
  );
}



function ExecutionStrip() {
  const x = growth.execution;
  return (
    <div className="mx-auto mt-20 max-w-[1000px]">
      <Reveal>
        <p className="mx-auto max-w-4xl text-center font-serif text-[2rem] font-semibold leading-[1.2] text-foreground md:text-[3rem]">
          {x.line}
        </p>
      </Reveal>
    </div>
  );
}

/** Live speech becoming text: a black ribbon and a white ribbon, crossing. */
function TranscriptStrip() {
  const phrases = [...growth.transcript, ...growth.transcript];
  const group = (cls: string) =>
    [0, 1].map((g) => (
      <span key={g} className="flex shrink-0" aria-hidden>
        {phrases.map((p, i) => (
          <span key={i} className={`flex shrink-0 items-center whitespace-nowrap ${cls}`}>
            {p}
            <span className="ts-dot" />
          </span>
        ))}
      </span>
    ));
  return (
    <figure className="ts relative overflow-hidden py-14 md:py-20">
      <figcaption className="sr-only">{growth.transcript.join(" ")}</figcaption>
      <div className="ts-ribbon ts-ribbon-dark">
        <div className="ts-track ts-track-slow">
          {group("font-serif text-2xl italic md:text-[2.5rem] px-0")}
        </div>
      </div>
      <div className="ts-ribbon ts-ribbon-light">
        <div className="ts-track ts-track-fast">
          {group("font-mono text-[0.6875rem] uppercase tracking-[0.14em] md:text-sm")}
        </div>
      </div>
      {/* The waveform sits in the strip itself, where the two ribbons cross. */}
      <div className="ts-capsule" aria-hidden>
        {Array.from({ length: 13 }, (_, i) => (
          <span
            key={i}
            className="animate-wave-bar w-[3px] rounded-full bg-ribbon-light"
            style={{
              height: `${[40, 70, 100, 60, 85, 45, 95, 55, 80, 100, 50, 70, 40][i]}%`,
              animationDelay: `${(i % 5) * 0.13}s`,
            }}
          />
        ))}
      </div>
    </figure>
  );
}

function GrowthPlaybook() {
  return (
    <>
      <section aria-label="Four growth opportunities for Wispr Flow" className={SECTION}>
        <Reveal>
          <p className="mx-auto max-w-2xl text-center text-sm italic leading-relaxed text-foreground/55">
            {growth.note}
          </p>
        </Reveal>
        <ul className="mt-10 grid items-start gap-6 md:grid-cols-2 md:gap-8">
          {growth.opportunities.map((o, i) => (
            <OpportunityCard key={o.number} o={o} i={i} />
          ))}
        </ul>
        <ExecutionStrip />
        <Reveal>
          <aside className="mx-auto mt-16 max-w-[1000px] rounded-lg border-l-[3px] border-flow bg-flow/5 px-6 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold">
              {growth.personalUse.label}
            </p>
            <h3 className="mt-2 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-flow">
              <AudioLines className="h-4 w-4" aria-hidden />
              {growth.personalUse.title}
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-[1.7] text-foreground/70">
              {growth.personalUse.text}
            </p>
          </aside>
        </Reveal>
      </section>
      <TranscriptStrip />
    </>
  );
}

/* ------------------------------------------------ contact */

function ContactButton({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 break-all rounded-xl bg-flow-foreground px-5 py-3 text-[0.9375rem] font-medium text-flow shadow-[0_4px_16px_oklch(0_0_0/0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-paper-white active:scale-[0.97] motion-reduce:transition-none sm:w-auto"
    >
      {children}
    </a>
  );
}

function Contact({ onRestart }: { onRestart: () => void }) {
  const buttons = [
    links.email && { href: `mailto:${links.email}`, label: `📧 ${links.email}` },
    links.phone && { href: `tel:${links.phone.replace(/\s+/g, "")}`, label: `📱 ${links.phone}` },
    links.linkedin && { href: links.linkedin, label: "🔗 LinkedIn" },
    links.video && { href: links.video, label: "📹 Watch my 3-min video" },
  ].filter(Boolean) as { href: string; label: string }[];
  return (
    <GreenBlock label="contact-title" className="pb-10 md:pb-12">
      <Reveal className="text-center">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-flow-foreground/60">
          Contact
        </p>
        <h2
          id="contact-title"
          className="mt-3 font-serif text-[2.25rem] font-medium leading-[1.05] md:text-[3.25rem]"
        >
          <TitleText title={contact.title} em={contact.em} />
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-flow-foreground/70 md:text-base">
          {contact.line}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mx-auto mt-10 grid max-w-[1000px] gap-6 md:grid-cols-2 md:gap-8">
          <div className="text-center md:text-left">
            <p className="font-serif text-[2.25rem] font-semibold leading-tight md:text-[2.625rem]">
              {contact.name}
            </p>
            <p className="mt-1 font-mono text-sm uppercase tracking-[0.1em] text-flow-foreground/60">
              {contact.subtitle}
            </p>
            <p className="mt-5 font-serif text-xl italic leading-[1.6] text-flow-foreground/80">
              “{contact.quote}”
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-start">
              {buttons.map((b) => (
                <ContactButton key={b.href} href={b.href}>
                  {b.label}
                </ContactButton>
              ))}
            </div>
            <button
              onClick={onRestart}
              className="mt-4 text-sm text-flow-foreground/70 underline underline-offset-4 hover:text-flow-foreground"
            >
              Read the book again
            </button>
          </div>
          <article className="rounded-2xl bg-flow-foreground p-6 text-ink md:p-7">
            <h3 className="font-serif text-2xl font-semibold">
              <TitleText title={contact.builtTitle} em="Wispr Flow" />
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/75">{contact.builtText}</p>
            {youtubeId(contact.builtVideo) ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId(contact.builtVideo)}`}
                title={contact.builtVideoTitle}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="mt-4 aspect-video w-full rounded-xl border-0"
              />
            ) : (
            <ImageSlot
              src={contact.builtImage}
              alt={contact.builtImageAlt}
              label={contact.builtImageLabel}
              className="mt-4 aspect-video w-full rounded-xl"
            />
            )}
            <p className="mt-3 text-sm italic text-ink/60">{contact.builtCaption}</p>
          </article>
        </div>
      </Reveal>
      <p className="mt-14 text-center text-[0.8125rem] text-flow-foreground/40">
        {contact.footer}
      </p>
      <p className="mt-6 text-center font-mono text-[0.6875rem] text-flow-foreground/25">
        {contact.colophon}
      </p>
    </GreenBlock>
  );
}

export function AfterBook({
  onChapter,
  onRestart,
}: {
  onChapter: (id: string) => void;
  onRestart: () => void;
}) {
  return (
    <div className="relative z-10">
      {/* Room for the closed book before the lamp section slides up over it. */}
      <div
        className="h-[40vh]"
        style={{ background: "linear-gradient(to bottom, transparent, var(--lamp-dark))" }}
        aria-hidden
      />
      <LampOn />
      <div className="lit">
        <HowIOperate onChapter={onChapter} />
        <Hackathon />
        <Rule />
        <Testimonials />
        <GreenBlock label="wispr-title">
          <SectionHead
            id="wispr-title"
            h={{ eyebrow: growth.eyebrow, title: growth.title, em: growth.em }}
            subtitle={growth.subtitle}
            onGreen
          />
        </GreenBlock>
        <GrowthPlaybook />
        <Contact onRestart={onRestart} />
      </div>
    </div>
  );
}

/** Video id from any YouTube link (watch, youtu.be, shorts, embed), or "" if none. */
export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? m[1]! : "";
}
