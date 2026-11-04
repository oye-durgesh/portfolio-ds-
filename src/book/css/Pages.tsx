/**
 * The printed paper of the book: cover, inside cover, opening page and the
 * two pages of every chapter spread. Text sits in the lower band of each page
 * (nearest the reader) so the pop-up world above never covers it.
 */
import { book, bookPrint, type Chapter } from "@/content/journey";

const placeOf = (ch: Chapter) => (ch.place?.split(" · ").pop() ?? ch.title).toUpperCase();

export function LeftPage({ ch, index }: { ch: Chapter; index: number }) {
  return (
    <div className="bk-paper bk-gutter-r flex flex-col px-[34px] pb-[18px] pt-[22px] text-ink">
      <p className="text-[8.5px] font-medium tracking-[0.32em] text-ink/45">
        {bookPrint.pageHeader.toUpperCase()}
      </p>
      <p
        aria-hidden
        className="pointer-events-none absolute left-[24px] top-[150px] font-serif text-[150px] font-semibold leading-none text-terracotta/[0.13]"
      >
        {ch.number}
      </p>
      <div className="mt-auto h-[246px] overflow-hidden">
        <div className="h-px w-[60px] bg-gold/70" />
        <p className="mt-[16px] text-[10.5px] font-bold tracking-[0.2em] text-terracotta">
          {ch.pageLabel ?? `CHAPTER ${ch.number}`}
        </p>
        <h3 className="mt-[8px] font-serif text-[30px] font-semibold leading-[1.04]">{ch.title}</h3>
        {ch.intro && (
          <p className="mt-[10px] font-serif text-[16px] italic leading-[1.25] text-ink/85">
            {ch.intro}
          </p>
        )}
      </div>
      <p className="font-serif text-[12px] text-ink/50">{index * 2 + 2}</p>
    </div>
  );
}

export function RightPage({ ch, index }: { ch: Chapter; index: number }) {
  return (
    <div className="bk-paper bk-gutter-l flex flex-col px-[34px] pb-[18px] pt-[22px] text-ink">
      <p className="text-right text-[8.5px] font-medium tracking-[0.32em] text-ink/45">
        {placeOf(ch)}
      </p>
      <div className="relative mt-auto h-[246px] overflow-hidden">
        <div className="h-px w-[60px] bg-gold/70" />
        <span
          aria-hidden
          className="absolute left-[-4px] top-[6px] font-serif text-[64px] leading-none text-gold/80"
        >
          “
        </span>
        <p className="mt-[22px] pl-[30px] font-serif text-[23px] font-semibold leading-[1.16] text-forest">
          {ch.quote}
        </p>
      </div>
      <p className="text-right font-serif text-[12px] text-ink/50">{index * 2 + 3}</p>
    </div>
  );
}

/** Opening page: the core message, signed. */
export function TitlePage() {
  return (
    <div className="bk-paper bk-gutter-l flex flex-col items-center px-[40px] pt-[96px] text-center text-ink">
      <p className="text-[10px] font-medium tracking-[0.4em] text-terracotta">
        {bookPrint.prologueLabel.toUpperCase()}
      </p>
      <div className="mt-[14px] h-px w-[60px] bg-terracotta/70" />
      <p className="mt-[42px] max-w-[330px] font-serif text-[30px] italic leading-[1.2]">
        {book.coreMessage}
      </p>
      <p className="mt-[16px] self-end pr-[30px] font-hand text-[26px]">{bookPrint.signature}</p>
      <p className="mt-auto mb-[48px] -rotate-2 font-hand text-[21px] text-dusty-blue">
        {bookPrint.nextStop} →
      </p>
    </div>
  );
}

/** Inside of the front cover. */
export function Endpaper() {
  return (
    <div className="bk-endpaper absolute inset-0 flex items-center justify-center">
      <div className="rounded-[10px] bg-ivory px-[26px] py-[22px] text-center shadow-[0_6px_18px_oklch(0.3_0.04_50/0.25)]">
        <div className="rounded-[6px] border border-terracotta/80 px-[30px] py-[20px]">
          <p className="text-[9px] font-medium tracking-[0.35em] text-terracotta">
            {bookPrint.exLibrisLabel.toUpperCase()}
          </p>
          <p className="mt-[10px] font-serif text-[30px] italic text-ink">{bookPrint.exLibris}</p>
          <p className="mt-[4px] font-hand text-[34px] text-forest">{book.author}</p>
        </div>
      </div>
    </div>
  );
}

/** The front of the cloth cover, with gold foil lettering and the route of the journey. */
export function Cover() {
  // Route points in cover units (1024 × 1366), as on the printed cover.
  const kanpur = [700, 600];
  const gnoida = [380, 560];
  const noida = [300, 690];
  const blr = [600, 965];
  const city = (
    pt: number[],
    label: string,
    dx: number,
    dy: number,
    anchor: "start" | "middle" | "end",
  ) => (
    <g key={label}>
      <circle cx={pt[0]} cy={pt[1]} r="9" fill="url(#bk-foil)" />
      <circle cx={pt[0]} cy={pt[1]} r="16" fill="none" stroke="url(#bk-foil)" strokeWidth="2" />
      <text x={pt[0]! + dx} y={pt[1]! + dy} textAnchor={anchor} className="bk-cover-small">
        {label.toUpperCase()}
      </text>
    </g>
  );
  return (
    <div className="bk-cloth absolute inset-0 overflow-hidden rounded-r-[6px] rounded-l-[3px]">
      <svg viewBox="0 0 1024 1366" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="bk-foil" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0" stopColor="#a8823a" />
            <stop offset="0.45" stopColor="#ecd18c" />
            <stop offset="1" stopColor="#b08a40" />
          </linearGradient>
        </defs>
        <g fill="url(#bk-foil)" stroke="url(#bk-foil)">
          <rect x="58" y="58" width="908" height="1250" fill="none" strokeWidth="5" />
          <rect x="76" y="76" width="872" height="1214" fill="none" strokeWidth="1.6" />
          {[
            [58, 58],
            [966, 58],
            [58, 1308],
            [966, 1308],
          ].map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              x={x! - 11}
              y={y! - 11}
              width="22"
              height="22"
              transform={`rotate(45 ${x} ${y})`}
              stroke="none"
            />
          ))}
          <text x="512" y="236" textAnchor="middle" className="bk-cover-kicker" stroke="none">
            {bookPrint.coverKicker.toUpperCase()}
          </text>
          <text x="512" y="366" textAnchor="middle" className="bk-cover-title" stroke="none">
            {bookPrint.coverTitle.toUpperCase()}
          </text>
          <path d="M342 420 H494 M530 420 H682" strokeWidth="2" fill="none" />
          <rect
            x="505"
            y="413"
            width="14"
            height="14"
            transform="rotate(45 512 420)"
            stroke="none"
          />

          {/* Rails Kanpur → Greater Noida, road to Noida, dashed line to Bengaluru */}
          <path d="M700 600 Q560 470 380 560" fill="none" strokeWidth="3" />
          <path
            d="M700 600 Q560 470 380 560"
            fill="none"
            strokeWidth="14"
            strokeDasharray="2 14"
            opacity="0.8"
          />
          <path d="M380 560 C330 600 360 640 300 690" fill="none" strokeWidth="4" />
          <path
            d="M300 690 Q250 920 600 965"
            fill="none"
            strokeWidth="2.5"
            strokeDasharray="10 10"
          />
          <g transform="translate(520 512) rotate(-16)" stroke="none">
            <rect x="-58" y="-18" width="34" height="18" rx="4" />
            <rect x="-20" y="-18" width="34" height="18" rx="4" />
            <rect x="18" y="-22" width="30" height="22" rx="4" />
            <rect x="38" y="-32" width="6" height="10" />
          </g>
          <path
            d="M318 880 l18 10 -32 -1 8 -10 -8 -10 32 -1 Z"
            transform="rotate(32 318 880)"
            stroke="none"
          />
        </g>
        {city(kanpur, "Kanpur", 30, 8, "start")}
        {city(gnoida, "Greater Noida", 0, -32, "middle")}
        {city(noida, "Noida", -30, 8, "end")}
        {city(blr, "Bengaluru", 30, 8, "start")}
        <g fill="url(#bk-foil)">
          <text x="512" y="1136" textAnchor="middle" className="bk-cover-author">
            {book.author.toUpperCase()}
          </text>
          <text x="512" y="1196" textAnchor="middle" className="bk-cover-small">
            {bookPrint.coverLine.toUpperCase()}
          </text>
        </g>
      </svg>
    </div>
  );
}
