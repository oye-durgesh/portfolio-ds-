import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AudioWaveform,
  BellRing,
  Bot,
  Check,
  Crown,
  Flame,
  ImagePlus,
  Linkedin,
  Trophy,
} from "lucide-react";
import {
  closing,
  contact,
  growth,
  hackathonIntro,
  hackathons,
  internalBook,
  links,
  operate,
  testimonials,
  type Hackathon,
  type OperateCard,
} from "@/content/journey";

/**
 * The sections after the book closes:
 * Internal Book (still dark) → the lamp turns on → How I Operate (flow chart)
 * → hackathons (fuse timeline) → What people say → Why Wispr Flow → contact
 * → My Wispr Flow. Everything from the lamp on uses the cream `.lit` theme.
 * Scroll-driven pieces write CSS variables directly (no re-render per frame)
 * and show their finished, static state when Reduce motion is on.
 */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

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

function Divider() {
  return <div className="mx-auto my-12 h-px w-20 bg-primary/30 md:my-20" aria-hidden />;
}

function SectionTitle({ title, subtitle, id }: { title: string; subtitle?: string; id?: string }) {
  return (
    <Reveal className="text-center">
      <h2 id={id} className="font-serif text-[1.75rem] font-semibold text-foreground md:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-sm text-foreground/60 md:text-base">{subtitle}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------ Internal Book (dark) */

function InternalBook() {
  return (
    <section aria-labelledby="internal-title" className="mx-auto max-w-5xl px-4 pb-24">
      <SectionTitle id="internal-title" title={internalBook.title} />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {internalBook.sections.map((s, i) => (
          <Reveal key={s.name} delay={i * 0.1}>
            <article className="h-full rounded-xl border border-primary/25 bg-panel p-6 shadow-panel backdrop-blur-md">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-primary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-ivory">{s.name}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground/75">{s.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="mt-5 text-center text-xs italic text-foreground/40">{internalBook.note}</p>
    </section>
  );
}

/* ------------------------------------------------ the lamp turns on */

function LampOn() {
  const zone = useRef<HTMLElement>(null);
  const calm = useCalm();
  useScrollFrame(() => {
    const el = zone.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = isCalm() ? 1 : clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
    el.style.setProperty("--lit", p.toFixed(3));
    el.setAttribute("data-on", String(p > 0.06));
  });
  return (
    <section
      ref={zone}
      aria-labelledby="operate-title"
      className={`lamp relative ${calm ? "h-[70vh]" : "h-[180vh]"}`}
      style={{ "--lit": 0 } as CSSProperties}
    >
      <div className="lamp-bg sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4">
        <div className="lamp-light pointer-events-none absolute inset-0" aria-hidden />
        <svg
          viewBox="0 0 160 200"
          className="absolute right-3 top-16 h-32 w-28 md:right-10 md:top-20 md:h-48 md:w-40"
          aria-hidden
        >
          <rect x="112" y="186" width="44" height="8" rx="3" className="lamp-metal" />
          <path d="M134 186 L120 110 L84 66" className="lamp-arm" />
          <circle cx="120" cy="110" r="4" className="lamp-metal" />
          <path d="M52 76 L80 38 L112 60 L104 78 Z" className="lamp-metal" />
          <circle cx="80" cy="80" r="9" className="lamp-bulb" />
        </svg>
        <div className="relative max-w-2xl text-center">
          <h2 id="operate-title" className="lamp-ink font-serif text-4xl font-semibold md:text-6xl">
            {operate.title}
          </h2>
          <p className="lamp-ink mt-3 text-base opacity-80 md:text-lg">{operate.subtitle}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ How I Operate: flow chart */

const TONE_VAR: Record<OperateCard["tone"], string> = {
  forest: "var(--loop)",
  gold: "var(--primary)",
  terracotta: "var(--learn)",
  blue: "var(--dusty-blue)",
  olive: "var(--olive)",
};

function HowIOperate({ onChapter }: { onChapter: (id: string) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const root = wrap.current;
    if (!root) return;
    const calm = isCalm();
    const line = window.innerHeight * 0.6;
    root.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
      const r = row.getBoundingClientRect();
      const start = r.top + 28;
      const f = calm ? 1 : clamp01((line - start) / Math.max(1, r.height));
      row.setAttribute("data-active", String(calm || line >= start));
      const fill = row.querySelector<HTMLElement>("[data-fill]");
      if (fill) fill.style.height = `${(f * 100).toFixed(1)}%`;
    });
  });
  const n = operate.cards.length;
  return (
    <div ref={wrap} className="mx-auto max-w-3xl px-4" aria-label="How I operate, step by step">
      <ol>
        {operate.cards.map((c, i) => (
          <li
            key={c.number}
            data-row
            data-active="false"
            className="group relative pb-10 pl-14 last:pb-0 md:pl-20"
            style={{ "--tone": TONE_VAR[c.tone] } as CSSProperties}
          >
            {i < n - 1 && (
              <span
                className="absolute bottom-0 left-5 top-10 w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-foreground/10 md:left-8"
                aria-hidden
              >
                <span
                  data-fill
                  className="relative block w-full overflow-hidden bg-[var(--tone)]"
                  style={{ height: 0 }}
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="animate-flow-dot absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ivory"
                      style={{ animationDelay: `${d * 0.8}s` }}
                    />
                  ))}
                </span>
              </span>
            )}
            <span
              className="absolute left-5 top-3 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[var(--tone)] bg-background font-mono text-xs font-bold text-[var(--tone)] transition-[background-color,color,box-shadow] duration-500 group-data-[active=true]:bg-[var(--tone)] group-data-[active=true]:text-ivory group-data-[active=true]:shadow-[0_0_0_6px_color-mix(in_oklch,var(--tone)_22%,transparent)] md:left-8"
              aria-hidden
            >
              {c.number}
            </span>
            <article className="rounded-xl border border-foreground/10 border-l-4 border-l-[var(--tone)] bg-background px-5 py-5 opacity-55 shadow-[0_4px_18px_oklch(0.3_0.03_60/0.08)] transition-[opacity,transform] duration-500 group-data-[active=true]:opacity-100 md:px-7 md:py-6">
              <h3 className="flex items-start gap-2 font-serif text-xl font-semibold text-foreground md:text-2xl">
                <span aria-hidden>{c.icon}</span>
                {c.title}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground/75">{c.text}</p>
              <button
                onClick={() => onChapter(c.link)}
                className="mt-3 font-mono text-xs font-semibold text-[var(--tone)] underline-offset-4 hover:underline"
              >
                {c.evidence} →
              </button>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------ hackathons: fuse timeline */

const CARD_BG: Record<Hackathon["tone"], string> = {
  pink: "bg-soft-pink",
  yellow: "bg-soft-yellow",
  purple: "bg-soft-purple",
  teal: "bg-soft-teal",
};
const RING: Record<Hackathon["tone"], string> = {
  pink: "border-primary",
  yellow: "border-primary",
  purple: "border-lavender",
  teal: "border-badge-teal",
};
const ART = { "1st": Trophy, "2nd": BellRing, "3rd": AudioWaveform, "4th": Bot } as const;

function PhotoSlots({ photos, event }: { photos: Hackathon["photos"]; event: string }) {
  return (
    <ul className="mt-4 grid grid-cols-3 gap-2" aria-label={`Photos from ${event}`}>
      {photos.map((src, i) => (
        <li key={i} className="aspect-[4/3] overflow-hidden rounded-md">
          {src ? (
            <img
              src={src}
              alt={`${event}, photo ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-ink/25 text-ink/35">
              <ImagePlus className="h-4 w-4" aria-hidden />
              <span className="text-[0.625rem]">Photo</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function HackathonCard({ h }: { h: Hackathon }) {
  const Art = ART[h.place];
  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl p-5 text-ink shadow-[0_4px_16px_oklch(0_0_0/0.12)] ${CARD_BG[h.tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="relative inline-block">
          {h.place === "1st" && (
            <Crown
              className="absolute -top-4 left-1/2 h-5 w-5 -translate-x-1/2 text-primary"
              aria-hidden
              fill="currentColor"
            />
          )}
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] bg-ivory font-sans text-lg font-extrabold text-ink sm:h-14 sm:w-14 sm:text-xl ${RING[h.tone]}`}
          >
            {h.place.toUpperCase()}
          </span>
        </div>
        <Art className="h-9 w-9 shrink-0 text-ink/35" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug">{h.event}</h3>
      <p className="mt-0.5 text-[0.8125rem] text-ink/60">
        {h.date} · {h.teams}
      </p>
      <p className="mt-3 text-[0.8125rem] font-bold">Project: {h.project}</p>
      <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink/70">{h.text}</p>
      {h.tags && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {h.tags.map((t) => (
            <li
              key={t}
              className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-medium ${
                t.startsWith("★") ? "bg-primary text-primary-foreground" : "bg-ink/[0.08]"
              }`}
            >
              {t}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto">
        <PhotoSlots photos={h.photos} event={h.event} />
      </div>
    </article>
  );
}

function Hackathons() {
  const track = useRef<HTMLDivElement>(null);
  const fuse = useRef<HTMLSpanElement>(null);
  useScrollFrame(() => {
    const root = track.current;
    const line = fuse.current;
    if (!root || !line) return;
    const wide = window.matchMedia("(min-width: 1280px)").matches;
    const fr = line.getBoundingClientRect();
    const vh = window.innerHeight;
    let p: number;
    if (isCalm()) p = 1;
    else if (wide) {
      // One row: the flame crosses as the row scrolls from the bottom to the middle.
      const rr = root.getBoundingClientRect();
      p = clamp01((vh * 0.9 - rr.top) / (vh * 0.55));
    } else p = clamp01((vh * 0.6 - fr.top) / Math.max(1, fr.height));
    root.style.setProperty("--fuse", p.toFixed(3));
    root.setAttribute("data-burning", String(p > 0 && p < 1));
    root.querySelectorAll<HTMLElement>("[data-dot]").forEach((dot) => {
      const d = dot.getBoundingClientRect();
      const at = wide
        ? (d.left + d.width / 2 - fr.left) / Math.max(1, fr.width)
        : (d.top + d.height / 2 - fr.top) / Math.max(1, fr.height);
      dot.closest("[data-item]")?.setAttribute("data-lit", String(p >= at - 0.01));
    });
  });
  return (
    <section
      id="hackathons"
      aria-labelledby="hack-title"
      className="mx-auto max-w-6xl scroll-mt-24 px-4"
    >
      <SectionTitle
        id="hack-title"
        title={hackathonIntro.title}
        subtitle={hackathonIntro.subtitle}
      />
      <p className="mt-2 text-center font-mono text-xs text-foreground/45">Oldest → newest</p>
      <div
        ref={track}
        className="relative mt-10 flex flex-col gap-6 xl:flex-row xl:gap-4"
        style={{ "--fuse": 0 } as CSSProperties}
      >
        {/* The fuse: vertical beside the cards on small screens, across the top on wide ones. */}
        <span
          ref={fuse}
          className="absolute bottom-6 left-[0.6875rem] top-6 w-[3px] rounded-full bg-foreground/15 xl:bottom-auto xl:left-[12.5%] xl:right-[12.5%] xl:top-[0.6875rem] xl:h-[3px] xl:w-auto"
          aria-hidden
        >
          <span className="absolute inset-0 origin-top scale-y-[var(--fuse)] rounded-full bg-learn xl:origin-left xl:scale-x-[var(--fuse)] xl:scale-y-100" />
          <span className="fuse-flame absolute left-1/2 top-[calc(var(--fuse)*100%)] -translate-x-1/2 -translate-y-1/2 xl:left-[calc(var(--fuse)*100%)] xl:top-1/2">
            <Flame className="animate-flicker h-6 w-6 fill-primary text-learn" />
          </span>
        </span>
        {hackathons.map((h) => (
          <div
            key={h.event}
            data-item
            data-lit="false"
            className="group relative flex-1 pl-10 xl:pl-0 xl:pt-10"
          >
            <div className="absolute left-0 top-6 flex items-center gap-2 xl:left-1/2 xl:top-0 xl:-translate-x-1/2 xl:flex-col xl:gap-1">
              <span
                data-dot
                className="relative z-10 block h-[1.375rem] w-[1.375rem] rounded-full border-[3px] border-foreground/25 bg-background transition-colors duration-500 group-data-[lit=true]:border-learn group-data-[lit=true]:bg-primary"
              />
            </div>
            <p className="mb-2 font-mono text-[0.6875rem] text-foreground/60 xl:mt-3 xl:text-center">
              <span className="font-bold text-foreground">{h.place.toUpperCase()}</span> · {h.date}
            </p>
            <div className="h-[calc(100%-1.75rem)] rounded-2xl opacity-50 saturate-50 transition-[opacity,filter,box-shadow] duration-700 group-data-[lit=true]:opacity-100 group-data-[lit=true]:saturate-100 group-data-[lit=true]:shadow-[0_0_0_2px_var(--primary),0_8px_28px_color-mix(in_oklch,var(--primary)_35%,transparent)]">
              <HackathonCard h={h} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------ What people say */

function Testimonials() {
  return (
    <section aria-labelledby="say-title" className="mx-auto max-w-6xl px-4">
      <div className="rounded-3xl border border-primary/30 bg-soft-yellow px-5 py-10 md:px-10 md:py-14">
        <SectionTitle id="say-title" title="What people say" subtitle="LinkedIn recommendations" />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <li key={i}>
              <Reveal delay={i * 0.08}>
                <figure className="overflow-hidden rounded-2xl border border-ink/10 bg-background shadow-[0_4px_16px_oklch(0.3_0.03_60/0.1)]">
                  {t.image ? (
                    <img src={t.image} alt={t.alt} loading="lazy" className="w-full" />
                  ) : (
                    <div className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border-b border-dashed border-ink/20 px-4 text-center text-ink/40">
                      <Linkedin className="h-6 w-6" aria-hidden />
                      <span className="text-xs">LinkedIn recommendation screenshot</span>
                      <span className="text-[0.6875rem] italic">to be added</span>
                    </div>
                  )}
                  <figcaption className="px-4 py-3 text-[0.8125rem]">
                    <span className="block font-bold text-ink">{t.name || "Name"}</span>
                    <span className="block text-ink/55">{t.role || "Role"}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------ Why Wispr Flow */

function WhyWispr({ onChapter }: { onChapter: (id: string) => void }) {
  return (
    <section aria-labelledby="wispr-title" className="mx-auto max-w-5xl px-4">
      <SectionTitle id="wispr-title" title={growth.title} />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Reveal>
          <article className="h-full rounded-2xl border border-foreground/10 border-t-4 border-t-loop bg-background p-6 shadow-[0_4px_18px_oklch(0.3_0.03_60/0.08)] md:p-8">
            <h3 className="font-serif text-2xl font-semibold text-foreground">{growth.doTitle}</h3>
            <ul className="mt-5 space-y-4">
              {growth.doPoints.map((d) => (
                <li key={d.text} className="flex gap-2.5">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-check"
                    strokeWidth={3}
                    aria-hidden
                  />
                  <span className="text-[0.9375rem] leading-relaxed text-foreground/80">
                    {d.text}{" "}
                    <button
                      onClick={() => onChapter(d.link)}
                      className="font-mono text-xs text-primary underline-offset-4 hover:underline"
                    >
                      See chapter →
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
        <Reveal delay={0.1}>
          <article className="h-full rounded-2xl border border-foreground/10 border-t-4 border-t-primary bg-background p-6 shadow-[0_4px_18px_oklch(0.3_0.03_60/0.08)] md:p-8">
            <h3 className="font-serif text-2xl font-semibold text-foreground">{growth.whyTitle}</h3>
            <ol className="mt-5 space-y-4">
              {growth.whyPoints.map((w, i) => (
                <li key={w} className="flex gap-3">
                  <span className="font-mono text-sm font-bold text-primary">{i + 1}</span>
                  <span className="text-[0.9375rem] italic leading-relaxed text-foreground/55">
                    {w}
                  </span>
                </li>
              ))}
            </ol>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------ contact + closing */

function ContactButton({ href, children }: { href: string; children: ReactNode }) {
  const external = !href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-loop px-7 py-3.5 text-[0.9375rem] font-medium text-ivory transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--loop-hover)] active:scale-[0.97] sm:w-auto"
    >
      {children}
    </a>
  );
}

function Contact({ onRestart }: { onRestart: () => void }) {
  const buttons = [
    links.email && { href: `mailto:${links.email}`, label: "📧 Email" },
    links.linkedin && { href: links.linkedin, label: "🔗 LinkedIn" },
    links.video && { href: links.video, label: "📹 Watch my 3-min video" },
  ].filter(Boolean) as { href: string; label: string }[];
  return (
    <section aria-labelledby="contact-title" className="px-4 pb-10 pt-6 text-center md:pt-10">
      <Reveal>
        <h2
          id="contact-title"
          className="font-serif text-4xl font-semibold text-foreground md:text-[2.625rem]"
        >
          {contact.title}
        </h2>
        <p className="mt-2 font-mono text-sm uppercase tracking-[0.1em] text-foreground/50 md:text-base">
          {contact.subtitle}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mx-auto mt-6 max-w-[640px] font-serif text-[1.375rem] italic leading-[1.6] text-foreground/80">
          “{contact.quote}”
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mx-auto mt-10 flex max-w-xs flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row">
          {buttons.map((b) => (
            <ContactButton key={b.href} href={b.href}>
              {b.label}
            </ContactButton>
          ))}
          <button
            onClick={onRestart}
            className="w-full rounded-xl border border-primary/50 px-7 py-3.5 text-[0.9375rem] font-medium text-foreground hover:bg-secondary sm:w-auto"
          >
            Read the book again
          </button>
        </div>
      </Reveal>
      <p className="mt-12 text-[0.8125rem] text-foreground/40">{contact.footer}</p>
      <p className="mt-8 font-mono text-[0.6875rem] text-foreground/30">{contact.colophon}</p>
    </section>
  );
}

/** Calm last word: static, no animation, so nothing to reduce. */
function Closing() {
  const email = closing.email.includes("@") ? `mailto:${closing.email}` : "";
  const linkedin = /^https?:/.test(closing.linkedin) ? closing.linkedin : "";
  return (
    <section aria-labelledby="closing-title" className="px-4 pb-16 pt-10 text-center">
      <h2
        id="closing-title"
        className="font-serif text-3xl font-semibold text-foreground md:text-4xl"
      >
        {closing.title}
      </h2>
      <p className="mx-auto mt-4 max-w-[560px] font-serif text-xl italic leading-relaxed text-foreground/80">
        {closing.line}
      </p>
      <p className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[0.9375rem] text-foreground/65">
        {email ? (
          <a href={email} className="underline underline-offset-4 hover:text-foreground">
            {closing.email}
          </a>
        ) : (
          <span>{closing.email}</span>
        )}
        {linkedin ? (
          <a
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            LinkedIn
          </a>
        ) : (
          <span>{closing.linkedin}</span>
        )}
      </p>
    </section>
  );
}

export function AfterBook({
  onChapter,
  onRestart,
}: {
  onChapter: (id: string) => void;
  onRestart: () => void;
}) {
  const go = useCallback((id: string) => onChapter(id), [onChapter]);
  return (
    <div className="relative z-10">
      <div
        className="pt-[45vh]"
        style={{ background: "linear-gradient(to bottom, transparent 0, var(--background) 45vh)" }}
      >
        <InternalBook />
      </div>
      <LampOn />
      <div className="lit pb-4 pt-4">
        <HowIOperate onChapter={go} />
        <Divider />
        <Hackathons />
        <Divider />
        <Testimonials />
        <Divider />
        <WhyWispr onChapter={go} />
        <Divider />
        <Contact onRestart={onRestart} />
        <Closing />
      </div>
    </div>
  );
}
