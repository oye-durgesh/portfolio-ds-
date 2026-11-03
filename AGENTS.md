<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- The current brief is `docs/creative-brief-v4.md` + `docs/character-brief-v4.md`, with `docs/chapter-04-fix.md`, `docs/chapter-04-metro.md`, `docs/after-book-sections.md` and then `docs/edits-v5-*.md` overriding it where they differ; older briefs are history. Read it before building any chapter. Progress is tracked in `roadmap.md`.
- Story copy, chapter list, travels and links live in `src/content/journey.ts`; components never hard-code story text, so content edits stay in one file. Each screen region reads its own field (pages: pageLabel/title/intro/quote, left panel: heading…loop, right panel: work, dictation card: voice, scene: annotations) so no sentence repeats across regions; a test enforces it. Nothing opens an overlay — the visitor never leaves the book view.
- Scroll → animation mapping is pure TS in `src/book/timeline.ts`; per-frame state lives in `src/book/scrollState.ts` (outside React) and one `Stepper` in `BookScene` damps it before anything reads it.
- The 3D scene (`src/book/*`) is lazy-loaded behind `<ClientOnly>` from the `/` route so the route still SSRs; the full story also renders as HTML (`StoryText`) for screen readers and as the no-WebGL fallback.
- Book surfaces are drawn as canvas textures in `src/book/textures.ts` (no remote HDRs/models), so the scene never blanks on a failed fetch; `data-scene-ready` on `<main>` signals the first rendered frame.
- Each chapter is one miniature world (`src/book/world/worlds*.tsx`, a `WorldDef` with `anchors` keyed by the chapter's annotation ids) built from shared papercraft parts in `world/kit.tsx`; only the current world is mounted, so adding chapters doesn't grow GPU cost.
- After the last chapter an `outro` timeline segment sinks the world, closes the cover (the left page stack rides inside the front-board hinge so it folds with it) and pulls the camera back; the after-book HTML sections (`AfterBook`) sit below the scroll runway, and book progress is measured against the runway, not the document height.
- The metro leg (`mode: "metro"`) plays on the book's own pages (`src/book/map/MetroRide.tsx`) instead of the India map.
- Durgesh's outfit is chosen per chapter id inside `Character` (`CHAPTER_LOOK`), never per world, so he stays identical everywhere.
- City changes are timeline `travel` segments rendered by `src/book/map/IndiaMap.tsx`: the map slides under a vehicle kept at the origin while the book scales down, so the camera never has to chase coordinates. India's outline (`map/indiaOutline.ts`) is generated from Natural Earth's India point-of-view data; keep that source if it is regenerated.
- `BookScene` exposes `window.__book` in dev only, so scripted screenshot checks can snap the damped scroll state; never rely on it in app code.
- After the book, everything from the lamp-on section down sits inside a `.lit` wrapper that redefines the colour tokens to cream/ink, so sections there use `text-foreground` (not `text-ivory`) and stay themable. Scroll-driven after-book effects write CSS variables/data attributes directly and show their finished state when `html.calm` (Reduce motion) is set.
