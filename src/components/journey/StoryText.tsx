import { book, chapters, travels, wordCount } from "@/content/journey";
import { chapterLabel } from "./labels";

/**
 * The whole story as plain HTML. Screen-reader only alongside the 3D book;
 * shown as a readable 2D storybook when 3D is unavailable.
 */
export function StoryText({ visible }: { visible: boolean }) {
  return (
    <article
      className={
        visible
          ? "relative z-10 mx-auto min-h-screen max-w-3xl bg-ivory px-6 py-24 text-ink sm:px-12"
          : "sr-only"
      }
    >
      <header className="mb-16 text-center">
        <p className="eyebrow text-terracotta">{book.author}</p>
        <h1 className="mt-4 font-serif text-5xl font-semibold">{book.title}</h1>
        <p className="mt-3 font-serif text-2xl text-forest">{book.subtitle}</p>
        <p className="mx-auto mt-8 max-w-lg font-serif text-2xl leading-snug">
          “{book.centralIdea}”
        </p>
      </header>
      <ol className="space-y-16">
        {chapters.slice(2).map((c) => {
          const leg = travels.find((t) => t.after === c.id);
          return (
            <li key={c.id} id={`chapter-${c.id}`} className="border-t border-ink/15 pt-10">
              <p className="eyebrow text-terracotta">
                {chapterLabel(c)}
                {c.place ? ` · ${c.place}` : ""}
                {c.category ? ` · ${c.category}` : ""}
              </p>
              <h2 className="mt-2 font-serif text-4xl font-semibold">{c.title}</h2>
              {c.intro && <p className="mt-2 font-serif text-xl italic">{c.intro}</p>}
              {c.quote && (
                <p className="mt-4 font-serif text-2xl leading-snug text-forest">“{c.quote}”</p>
              )}
              {c.about && (
                <section className="mt-6">
                  <h3 className="font-serif text-2xl font-semibold">{c.heading}</h3>
                  {c.tagline && <p className="text-sm text-ink/60">{c.tagline}</p>}
                  <p className="mt-1 text-base leading-relaxed">{c.about}</p>
                  {c.tags && <p className="mt-1 text-sm">{c.tags.join(" · ")}</p>}
                </section>
              )}
              {c.experiments?.map((e) => (
                <section key={e.title} className="mt-4 border-l-4 border-forest pl-4">
                  <p className="eyebrow text-forest">{e.label}</p>
                  <h4 className="font-semibold">{e.title}</h4>
                  <p className="text-base">{e.body}</p>
                </section>
              ))}
              {c.closing && <p className="mt-3 text-base">{c.closing}</p>}
              {c.lesson && (
                <p className="mt-4 text-base italic">
                  <span className="font-semibold not-italic">Key lesson: </span>
                  {c.lesson}
                </p>
              )}
              {c.work && (
                <section className="mt-6">
                  <h3 className="font-serif text-2xl font-semibold">{c.work.title ?? "My Work"}</h3>
                  <ul className="mt-2 space-y-1 text-base">
                    {c.work.items.map((w) => (
                      <li key={w.title}>
                        <span className="font-semibold">{w.title}</span> — {w.text}
                      </li>
                    ))}
                  </ul>
                  {c.work.insight && <p className="mt-2 text-base">{c.work.insight}</p>}
                  {c.work.metrics && (
                    <ul className="mt-3 space-y-1 text-base">
                      {c.work.metrics.map((m) => (
                        <li key={m.label}>
                          <span className="font-semibold text-forest">{m.value}</span> {m.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.work.note && <p className="mt-2 text-sm italic text-ink/70">{c.work.note}</p>}
                </section>
              )}
              {c.note && <p className="mt-2 text-sm italic text-ink/70">{c.note}</p>}
              {c.growthSides && (
                <section className="mt-4 text-base">
                  {c.growthSides.intro.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                  <h3 className="mt-3 font-semibold">{c.growthSides.d2c.title}</h3>
                  <ul className="list-disc pl-5">
                    {c.growthSides.d2c.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="mt-1">{c.growthSides.d2c.note}</p>
                  <p className="mt-1 italic text-ink/60">{c.growthSides.d2c.placeholder}</p>
                  <p className="mt-3 font-semibold">D2C + B2B: both sides</p>
                  <h3 className="mt-3 font-semibold">{c.growthSides.b2b.title}</h3>
                  <ul className="list-disc pl-5">
                    {c.growthSides.b2b.questions.map((q) => (
                      <li key={q}>
                        {q}{" "}
                        <span className="italic text-ink/60">
                          ({c.growthSides!.b2b.placeholder})
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {c.voice && (
                <blockquote className="mt-6 rounded-lg bg-ink/5 p-4 text-base">
                  <p className="text-sm text-ink/60">Dictated with Wispr Flow into {c.voice.app}</p>
                  <p className="mt-1">{c.voice.text}</p>
                  <p className="mt-1 text-sm italic text-ink/50">
                    Flow typed {wordCount(c.voice.text)} words.
                  </p>
                </blockquote>
              )}
              {leg && <p className="mt-8 font-serif text-xl italic text-ink/70">{leg.caption}</p>}
            </li>
          );
        })}
      </ol>
    </article>
  );
}
