import { useState } from "react";
import { X } from "lucide-react";
import { wordCount, type VoiceNote } from "@/content/journey";

const BARS = [0.45, 0.8, 0.6, 1, 0.7, 0.9, 0.5, 0.75];

/**
 * Something Durgesh dictated with Wispr Flow while building this book.
 * The word count is computed from the text so the footer always matches it.
 */
export function VoiceCard({ note, className = "" }: { note: VoiceNote; className?: string }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  const words = wordCount(note.text);
  return (
    <figure
      className={`animate-slide-in rounded-xl bg-voice px-5 py-4 text-ivory shadow-[var(--shadow-voice)] lg:px-6 lg:py-5 ${className}`}
      aria-label={`Dictated with Wispr Flow into ${note.app}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 px-2.5 py-1 text-xs">
          <span aria-hidden>{note.icon}</span> {note.app}
        </span>
        <button
          onClick={() => setClosed(true)}
          className="rounded-full p-1 text-ivory/40 hover:bg-ivory/10 hover:text-ivory/80"
          aria-label="Hide this dictation"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 flex h-6 items-center gap-1" aria-hidden>
        {BARS.map((h, i) => (
          <span
            key={i}
            className="animate-wave-bar w-[3px] rounded-full bg-ivory/40"
            style={{ height: `${h * 100}%`, animationDelay: `${i * 0.11}s` }}
          />
        ))}
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed">{note.text}</blockquote>
      <figcaption className="mt-3 text-xs italic text-ivory/35">
        Flow typed {words} words into {note.app.split(" · ")[0]}.
      </figcaption>
    </figure>
  );
}
