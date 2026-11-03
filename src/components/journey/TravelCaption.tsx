import { Plane, TrainFront, TramFront } from "lucide-react";
import { travels } from "@/content/journey";
import { smoothstep, travelBeats, type StoryPosition } from "@/book/timeline";

/** Caption over the India map while a journey plays. */
export function TravelCaption({ position }: { position: StoryPosition }) {
  const leg = position.travel >= 0 ? travels[position.travel] : undefined;
  if (!leg) return null;
  const b = travelBeats(position.travelP);
  const show = b.map * smoothstep(0.1, 0.25, position.travelP);
  const Icon = leg.mode === "plane" ? Plane : leg.mode === "metro" ? TramFront : TrainFront;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-20 flex justify-center px-4 sm:bottom-28"
      style={{ opacity: show, transform: `translateY(${(1 - show) * 12}px)` }}
      aria-live="polite"
    >
      <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-panel px-6 py-4 shadow-panel backdrop-blur-md">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/50">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </span>
        <div>
          <p className="eyebrow text-primary">
            {leg.mode === "metro" ? "The metro" : "The journey"}
          </p>
          <p className="font-serif text-2xl leading-tight sm:text-3xl">
            {leg.from} <span className="text-primary">→</span> {leg.to}
          </p>
          {leg.mode === "metro" && (
            <p className="mt-1 max-w-xs text-sm text-foreground/70">{leg.caption}</p>
          )}
        </div>
      </div>
    </div>
  );
}
