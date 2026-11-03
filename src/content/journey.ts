/**
 * Story content for The Book of My Journey — the single place to edit text,
 * links, awards and quotes. Source: docs/creative-brief-v4.md and
 * docs/character-brief-v4.md.
 *
 * Honesty rules: do not invent memories, numbers, dates, marks, awards or
 * outcomes. Leave a field out until Durgesh supplies it; `toAdd` lists what
 * is still missing (shown only while editing).
 *
 * Every region shows something different — never repeat a sentence across them:
 * - `pageLabel`, `title` → LEFT page of the book
 * - `quote`              → RIGHT page of the book
 * - `heading` … `loop`   → left panel (what this is, key lesson, ownership loop)
 * - `work`               → right "My Work" panel (checklist + metric pills)
 * - `voice`              → the dictation card (text Durgesh dictated with Wispr Flow)
 * - `annotations`        → gold labels on objects in the miniature world
 */

/** Icons available to panels and labels (mapped to lucide icons in the UI). */
export type IconName =
  | "pin"
  | "school"
  | "book"
  | "route"
  | "train"
  | "plane"
  | "home"
  | "search"
  | "message"
  | "users"
  | "briefcase"
  | "calendar"
  | "compass"
  | "clock"
  | "heart"
  | "chart"
  | "pen"
  | "code"
  | "layers"
  | "megaphone"
  | "cart"
  | "box"
  | "sparkles"
  | "mic"
  | "trophy"
  | "flower"
  | "building"
  | "check";

export interface WorkItem {
  title: string;
  text: string;
}

/** A number pill under "My Work". `value` keeps its sign/suffix, e.g. "+13%", "190+". */
export interface Metric {
  value: string;
  label: string;
}

/** A label on an object in the miniature world. */
export interface Annotation {
  id: string;
  label: string;
  icon: IconName;
}

export const LOOP_STEPS = [
  "NOTICED",
  "INVESTIGATED",
  "DECIDED",
  "OWNED",
  "BUILT",
  "LEARNED",
] as const;
export type LoopStep = (typeof LOOP_STEPS)[number];
/** "on" = forest green, "learn" = terracotta (a failure or learning step). */
export type LoopTone = "on" | "learn";

/** Something Durgesh dictated with Wispr Flow. The word count is computed from `text`. */
export interface VoiceNote {
  icon: string;
  app: string;
  text: string;
}

export interface Experiment {
  label: string;
  title: string;
  body: string;
}

/** D2C and B2B growth, shown under "My Work" with a "Both sides" join between them. */
export interface GrowthSides {
  intro: string[];
  d2c: { title: string; items: string[]; note: string; placeholder: string };
  b2b: { title: string; questions: string[]; placeholder: string };
}

export type Part =
  "The Beginning" | "First Work" | "BackWithBrain" | "Personal Projects" | "The Next Chapter";

export interface Chapter {
  id: string;
  number: string;
  /** Book, left page title. */
  title: string;
  /** Short name for the previous / next buttons. */
  short: string;
  /** Shown in the top bar while the chapter is on show. */
  place?: string;
  part?: Part;
  /** Book, left page label, e.g. "CHAPTER 05 · GOCATTLES". */
  pageLabel?: string;
  /** Book, left page: one line under the title (optional). */
  intro?: string;
  /** Book, right page. */
  quote?: string;
  /** Overrides the "next" button label while this chapter is on show. */
  nextLabel?: string;

  /* Left panel */
  heading?: string;
  /** One-line description of the company, under the heading. */
  tagline?: string;
  category?: string;
  about?: string;
  tags?: string[];
  lesson?: string;
  loop?: Partial<Record<LoopStep, LoopTone>>;
  /** Small italic caveat at the bottom of the left panel. */
  note?: string;
  experiments?: Experiment[];
  closing?: string;
  /** BackWithBrain: the D2C side, the "Both sides" join, then the B2B side. */
  growthSides?: GrowthSides;

  /* Right panel */
  work?: {
    title?: string;
    subtitle: string;
    items: WorkItem[];
    metrics?: Metric[];
    note?: string;
    /** Small highlighted box under the checklist. */
    insight?: string;
  };

  voice?: VoiceNote;
  annotations?: Annotation[];
  toAdd?: string[];
}

/** A journey across the India map, shown between two chapters. */
export interface Travel {
  id: string;
  /** Chapter id the journey follows. */
  after: string;
  from: string;
  to: string;
  /** train/plane fly over the India map; metro rides across the book's own pages. */
  mode: "train" | "plane" | "metro";
  /** Stops along a metro ride, first to last. */
  stations?: string[];
  caption: string;
}

export const book = {
  title: "The Book of My Journey",
  author: "Durgesh Shukla",
  subtitle: "A life built one page at a time.",
  coreMessage: "I don't have everything figured out. I just don't stop figuring things out.",
  centralIdea:
    "I don't wait for a perfect playbook. I explore, understand problems, take ownership, experiment, learn and build.",
};

/** Links on the contact section. Empty = button hidden. */
export const links = {
  email: "",
  linkedin: "",
  video: "",
};

/** City changes that get the animated India-map journey. */
export const travels: Travel[] = [
  {
    id: "to-greater-noida",
    after: "setback",
    from: "Kanpur",
    to: "Greater Noida",
    mode: "train",
    caption: "Kanpur to Greater Noida, by train",
  },
  {
    id: "to-noida",
    after: "building",
    from: "Greater Noida",
    to: "Noida",
    mode: "metro",
    stations: ["Greater Noida", "Knowledge Park", "Noida Sector", "Noida"],
    caption: "Daily metro commute: Greater Noida → Noida. My first professional routine.",
  },
  {
    id: "to-bengaluru",
    after: "in-between",
    from: "Greater Noida",
    to: "Bengaluru",
    mode: "train",
    caption: "Greater Noida to Bengaluru",
  },
];

const BWB = "BackWithBrain · Meditation & Mind Fitness";

export const chapters: Chapter[] = [
  {
    id: "cover",
    number: "00",
    title: "The Cover",
    short: "Cover",
    quote: "Some journeys begin with a plan. Mine began with curiosity.",
  },
  {
    id: "prologue",
    number: "00",
    title: "Opening",
    short: "Opening",
    quote: book.coreMessage,
  },

  /* ---------------------------------------------------------------- 01 */
  {
    id: "kanpur",
    number: "01",
    title: "Where It All Started",
    short: "Kanpur",
    place: "Kanpur",
    part: "The Beginning",
    pageLabel: "CHAPTER 01 · KANPUR",
    quote: "Curiosity was my first skill. It came before any degree or job title.",
    heading: "Kanpur",
    category: "Personal",
    about:
      "Kanpur, 2002. A curious kid who wanted to understand how things work before being told how they work.",
    voice: {
      icon: "📝",
      app: "Notes",
      text: "The story starts in Kanpur. I grew up curious about how things work — not just school things but how shops run, why some things sell and others don't.",
    },
    annotations: [
      { id: "home", label: "Home", icon: "home" },
      { id: "school", label: "Sri Ram Education Center", icon: "school" },
      { id: "streets", label: "Neighbourhood streets", icon: "pin" },
    ],
    toAdd: ["A school memory in your own words", "School or family photographs"],
  },

  /* ---------------------------------------------------------------- 02 */
  {
    id: "setback",
    number: "02",
    title: "The Road I Had to Rethink",
    short: "JEE",
    place: "Kanpur → Greater Noida",
    part: "The Beginning",
    pageLabel: "CHAPTER 02 · KANPUR → GREATER NOIDA",
    quote: "Where you study does not decide what you build. What you do with your time there does.",
    heading: "A turning point",
    category: "Personal",
    about:
      "I attempted JEE in 2022. It did not work out. Instead of stopping, I found a different path — Galgotias University, Greater Noida.",
    annotations: [
      { id: "iit-gate", label: "The road I planned", icon: "school" },
      { id: "new-route", label: "A different path", icon: "route" },
    ],
  },

  /* ---------------------------------------------------------------- 03 */
  {
    id: "greater-noida",
    number: "03",
    title: "The Learning Years",
    short: "Galgotias",
    place: "Greater Noida · Galgotias University",
    part: "The Beginning",
    pageLabel: "CHAPTER 03 · GREATER NOIDA · GALGOTIAS UNIVERSITY",
    quote: "I did not wait for someone to assign me interesting work. I started looking for it.",
    heading: "Galgotias University",
    category: "Education",
    about: "B.Tech Computer Science, 2022–2026. College gave my curiosity a direction.",
    annotations: [
      { id: "campus", label: "Galgotias University", icon: "school" },
      { id: "cafeteria", label: "The cafeteria", icon: "users" },
      { id: "exploring", label: "Exploring the campus", icon: "compass" },
    ],
    toAdd: ["Campus photos", "Projects, clubs or experiments from college"],
  },

  /* ---------------------------------------------------------------- 04 */
  {
    id: "building",
    number: "04",
    title: "From Code to Growth",
    short: "From Code to Growth",
    place: "Greater Noida",
    part: "First Work",
    pageLabel: "CHAPTER 04 · GREATER NOIDA",
    intro: "I started with code, but my curiosity kept pulling me toward growth.",
    quote:
      "I don't wait for a perfect playbook. I explore until I find where I create the most value.",
    nextLabel: "🚇 Take the metro to Noida",
    heading: "Finding my strength",
    category: "Personal",
    about:
      "In college, I started with coding. But I kept noticing something — I was more excited about understanding why things grow than about writing the code behind them. That realisation pointed me toward marketing, business and operations.",
    lesson:
      "I started with coding and noticed I cared more about why products grow than how they are built. Trying a few things showed me where my curiosity pointed.",
    loop: { NOTICED: "on", INVESTIGATED: "on", DECIDED: "on" },
    work: {
      title: "What I practised",
      subtitle: "Things I taught myself by doing.",
      items: [
        { title: "Coding", text: "Started here. Learned how technology works." },
        {
          title: "Campus events",
          text: "Organised events, coordinated teams, learned execution.",
        },
        { title: "Growth & marketing", text: "Started exploring how products reach people." },
        {
          title: "Business thinking",
          text: "Began understanding customers, positioning, demand.",
        },
      ],
      insight:
        "This is when I started looking for a real-world opportunity in digital marketing and growth. My first internship came from that search.",
    },
    annotations: [
      { id: "coding", label: "Coding desk", icon: "code" },
      { id: "growth", label: "Growth & marketing", icon: "chart" },
      { id: "board", label: "Opportunities", icon: "compass" },
    ],
  },

  /* ---------------------------------------------------------------- 05 */
  {
    id: "gocattles",
    number: "05",
    title: "My First Real Taste of Business",
    short: "GoCattles",
    place: "GoCattles · Premium Dog Food",
    part: "First Work",
    pageLabel: "CHAPTER 05 · GOCATTLES",
    quote:
      "I learned how a real product brand works, from research to content to customer visibility.",
    heading: "GoCattles",
    tagline: "A premium dog food startup · D2C · Noida",
    category: "Internship",
    about:
      "My first internship, in digital marketing at a dog food company. I started by selling remaining inventory directly to shopkeepers, door to door, and that led to the digital marketing role. Later I expanded into operations, Amazon Seller Central and content.",
    lesson: "The business side of a product is learned by doing the work, not by watching it.",
    loop: { NOTICED: "on", INVESTIGATED: "on", OWNED: "on", BUILT: "on" },
    work: {
      subtitle: "What I did at GoCattles.",
      items: [
        {
          title: "Competitor & market research",
          text: "Studied similar brands and found growth gaps",
        },
        {
          title: "Listing optimisation",
          text: "Improved product listings for better visibility",
        },
        { title: "Content planning", text: "Created and scheduled content for social media" },
        { title: "E-commerce execution", text: "Amazon Seller Central operations" },
        { title: "Coordination", text: "Managed two interns" },
      ],
      metrics: [
        { value: "2×", label: "Instagram Reels views" },
        { value: "+13%", label: "Amazon Fresh Meal category ranking" },
        { value: "2", label: "Interns coordinated" },
      ],
    },
    annotations: [
      { id: "door", label: "Door-to-door sales", icon: "home" },
      { id: "seller", label: "Amazon Seller Central", icon: "cart" },
      { id: "content", label: "Content", icon: "megaphone" },
    ],
  },

  /* ---------------------------------------------------------------- 06 */
  {
    id: "prime-day",
    number: "06",
    title: "The Campaign That Did Not Go as Planned",
    short: "Prime Day",
    place: "GoCattles · Prime Day",
    part: "First Work",
    pageLabel: "CHAPTER 06 · GOCATTLES · PRIME DAY",
    quote: "Honest reflection matters more than defending a result.",
    heading: "Prime Day",
    tagline: "GoCattles' Amazon Prime Day campaign",
    category: "Team contribution",
    about:
      "The campaign did not perform as hoped. Significant inventory remained. This taught me the difference between visibility and demand.",
    lesson:
      "Getting attention is not the same as creating demand. I learned to think about the full funnel: need → positioning → discovery → conversion → demand.",
    loop: { NOTICED: "on", INVESTIGATED: "on", LEARNED: "learn" },
    note: "This is about what I learned. I do not claim I alone caused the outcome.",
    work: {
      subtitle: "What I did after the campaign.",
      items: [
        { title: "Reflected honestly", text: "On what did and did not work" },
        { title: "Examined the gap", text: "Between marketing activity and business outcomes" },
        { title: "Studied the funnel", text: "E-commerce, customer intent, pricing and inventory" },
      ],
    },
    voice: {
      icon: "📊",
      app: "Presentation",
      text: "The Prime Day campaign taught me that attention does not automatically become demand. That gap changed how I think about growth.",
    },
    annotations: [
      { id: "stock", label: "Unsold inventory", icon: "box" },
      { id: "banner", label: "Prime Day campaign", icon: "calendar" },
      { id: "chart", label: "Attention vs. demand", icon: "chart" },
    ],
  },

  /* ---------------------------------------------------------------- 07 */
  {
    id: "in-between",
    number: "07",
    title: "The In-Between",
    short: "The in-between",
    place: "Greater Noida · 3 to 4 months",
    part: "First Work",
    pageLabel: "CHAPTER 07 · THE IN-BETWEEN",
    quote: "For about three to four months I was just living, and working on different things.",
    heading: "The in-between",
    category: "A pause",
    about:
      "I finished my internship and gave several interviews. I got rejected. Then I found a new startup whose founders were looking for strong interns. I kept emailing the founders until they replied. I joined as an intern and moved to Bangalore.",
    lesson:
      "Rejections were part of it. Writing to the founders directly is what finally got me a conversation.",
    annotations: [
      { id: "calendar", label: "3 to 4 months", icon: "calendar" },
      { id: "rejected", label: "Rejections", icon: "message" },
      { id: "reply", label: "The founders replied", icon: "sparkles" },
    ],
  },

  /* ---------------------------------------------------------------- 08 */
  {
    id: "bengaluru",
    number: "08",
    title: "A New World",
    short: "Bengaluru",
    place: BWB,
    part: "BackWithBrain",
    pageLabel: "CHAPTER 08 · BENGALURU",
    quote: "The best opportunities do not always come with a clear job description.",
    heading: "Bengaluru",
    category: "A new start",
    about:
      "A new city. A new environment. I reached out to the BackWithBrain founders directly. There was no fixed job description.",
    annotations: [
      { id: "city", label: "Bengaluru", icon: "building" },
      { id: "bus", label: "Off the bus", icon: "route" },
      { id: "office", label: "BackWithBrain", icon: "flower" },
    ],
  },

  /* ---------------------------------------------------------------- 09 */
  {
    id: "community",
    number: "09",
    title: "Building a Community",
    short: "Community",
    place: BWB,
    part: "BackWithBrain",
    pageLabel: "CHAPTER 09 · BACKWITHBRAIN",
    quote: "I wanted to understand the experience before asking others to try it.",
    heading: "BackWithBrain",
    tagline: "An early-stage meditation & mind-fitness company · Bengaluru",
    category: "Personally owned",
    about:
      "I was the first hire at this early startup, and later built a team of 5 people. Before thinking about growth channels, I went to community parks to talk to people about meditation. I tried it myself first.",
    growthSides: {
      intro: [
        "In my first 3 months I decided how we should approach growth for both B2C (D2C) and B2B.",
      ],
      d2c: {
        title: "B2C / D2C growth — what I explored",
        items: [
          "Going to existing app users and learning from them",
          "Finding different directions and testing them",
          "Community events",
          "Going into small local areas to find people interested in meditation",
        ],
        note: "Friends and family were not a major channel. Community events and talking to people directly worked best.",
        placeholder: "Referral growth channel — wording to be confirmed by me",
      },
      b2b: {
        title: "How do I figure out B2B growth?",
        questions: [
          "Who buys?",
          "Who is the user?",
          "How do we reach them?",
          "How do we test it cheaply?",
        ],
        placeholder: "To be filled by me",
      },
    },
    lesson:
      "Understanding a product starts with experiencing it yourself. I went to parks before I touched any growth channel.",
    loop: { NOTICED: "on", DECIDED: "on", OWNED: "on", BUILT: "on" },
    work: {
      subtitle: "What I did at BackWithBrain.",
      items: [
        { title: "Practised it", text: "Meditated myself before promoting anything" },
        { title: "Ground-level outreach", text: "Face-to-face conversations in community parks" },
        { title: "Bringing people in", text: "WhatsApp, social media and personal outreach" },
      ],
    },
    annotations: [
      { id: "park", label: "Community park", icon: "flower" },
      { id: "circle", label: "Meditation circle", icon: "users" },
      { id: "talking", label: "Talking to people", icon: "message" },
    ],
  },

  /* ---------------------------------------------------------------- 10 */
  {
    id: "clarity",
    number: "10",
    title: "From Chaos to Clarity",
    short: "7-day programme",
    place: BWB,
    part: "BackWithBrain",
    pageLabel: "CHAPTER 10 · BACKWITHBRAIN · 7-DAY PROGRAMME",
    quote: "The first challenge was not attracting people. It was getting them to stay.",
    heading: "The 7-day programme",
    category: "Team contribution",
    about: "A seven-day meditation programme, and the drop-off that showed up in it.",
    lesson: "Getting someone to join is one thing. Giving them a reason to return is another.",
    loop: { NOTICED: "on", INVESTIGATED: "on" },
    work: {
      subtitle: "What I tracked.",
      items: [
        { title: "Attendance", text: "Followed drop-offs day by day" },
        { title: "Listening", text: "Collected feedback from participants" },
        { title: "Naming the problem", text: "Fewer than a third finished the week" },
      ],
      metrics: [
        { value: "~45–50%", label: "Day-1 attendance" },
        { value: "29%", label: "Day-7 completion" },
      ],
      note: "Early cohorts, before any change.",
    },
    annotations: [
      { id: "schedule", label: "Day 1 → Day 7", icon: "calendar" },
      { id: "session", label: "Morning session", icon: "clock" },
      { id: "dropoff", label: "The drop-off", icon: "chart" },
    ],
  },

  /* ---------------------------------------------------------------- 11 */
  {
    id: "accountability",
    number: "11",
    title: "Accountability Partners",
    short: "Accountability",
    place: BWB,
    part: "BackWithBrain",
    pageLabel: "CHAPTER 11 · BACKWITHBRAIN",
    quote: "The intervention was social, not technical. And it worked.",
    heading: "Pairing people up",
    category: "Personally owned · team effort",
    about:
      "Instead of accepting the drop-off, I introduced accountability partners. Participants were paired so they would encourage each other to attend.",
    lesson:
      "People stay when someone else is counting on them. Social accountability changed the completion rate.",
    loop: {
      NOTICED: "on",
      INVESTIGATED: "on",
      DECIDED: "on",
      OWNED: "on",
      BUILT: "on",
      LEARNED: "on",
    },
    work: {
      subtitle: "What I did in the programme.",
      items: [
        { title: "Identified the problem", text: "Day-7 completion was only 29%" },
        {
          title: "Designed the intervention",
          text: "Paired participants for social accountability",
        },
        { title: "Observed results", text: "Tracked attendance and completion daily" },
      ],
      metrics: [
        { value: "~70%", label: "Day-1 attendance (up from ~50%)" },
        { value: "50%+", label: "Day-7 completion (up from 29%)" },
        { value: "190+", label: "Participants reached" },
        { value: "83%", label: "Average day-over-day retention" },
      ],
      note: "Reported figures for later cohorts. A team effort; other factors may also have contributed.",
    },
    voice: {
      icon: "💬",
      app: "WhatsApp",
      text: "If someone else is expecting you to show up, you are more likely to show up. That was the whole idea behind accountability partners.",
    },
    annotations: [
      { id: "bridge", label: "The bridge between partners", icon: "heart" },
      { id: "left", label: "Partner A", icon: "users" },
      { id: "right", label: "Partner B", icon: "users" },
    ],
  },

  /* ---------------------------------------------------------------- 12 */
  {
    id: "daily-detox",
    number: "12",
    title: "When an Idea Doesn’t Sustain",
    short: "Daily Detox",
    place: BWB,
    part: "BackWithBrain",
    pageLabel: "CHAPTER 12 · DAILY DETOX",
    quote:
      "I would rather investigate and change direction than keep defending something that is not working.",
    heading: "Daily Detox",
    category: "Experiment",
    about:
      "Participants wanted to continue after 7 days, so I proposed Daily Detox. When engagement did not sustain, I phoned customers to find out why.",
    lesson:
      "Sometimes ownership means knowing when to stop an experiment, not just when to start one.",
    loop: { NOTICED: "on", INVESTIGATED: "on", DECIDED: "learn", LEARNED: "learn" },
    work: {
      subtitle: "Owning an experiment, start to finish.",
      items: [
        { title: "Designed the concept", text: "Short daily sessions, morning and evening" },
        { title: "Launched the experiment", text: "YouTube and WhatsApp distribution" },
        { title: "Investigated the failure", text: "Called customers directly" },
        { title: "Made the decision", text: "Recommended stopping the experiment" },
      ],
    },
    voice: {
      icon: "📝",
      app: "Notes",
      text: "Daily Detox didn't work. Instead of defending the idea, I called customers. They told me the timing was wrong and content felt repetitive.",
    },
    annotations: [
      { id: "slots", label: "Morning & evening sessions", icon: "clock" },
      { id: "feedback", label: "Customer calls", icon: "message" },
      { id: "review", label: "The decision", icon: "check" },
    ],
  },

  /* ---------------------------------------------------------------- 13 */
  {
    id: "research",
    number: "13",
    title: "Customer Research & Product Thinking",
    short: "Research",
    place: BWB,
    part: "BackWithBrain",
    pageLabel: "CHAPTER 13 · RESEARCH STUDIO",
    quote: "Before building a product, understand the problem and the market it has to serve.",
    heading: "Corporate wellness",
    category: "Research",
    about:
      "Interviews, surveys, competitors and pricing — and knowing what the numbers do not say.",
    lesson: "Survey interest is not the same as paying customer demand. Numbers need context.",
    loop: { INVESTIGATED: "on", DECIDED: "on" },
    work: {
      subtitle: "How I listened.",
      items: [
        { title: "Customer research", text: "Interviews and surveys" },
        { title: "Competitor analysis", text: "Features, pricing, positioning" },
        { title: "Market understanding", text: "Corporate wellness landscape" },
        { title: "Product flows", text: "Designed user flows across 4 product areas" },
      ],
      metrics: [
        { value: "119+", label: "Research respondents" },
        { value: "98%", label: "Interest in tested concept" },
        { value: "97%", label: "Alignment with target pain point" },
        { value: "10+", label: "Competitors analysed" },
      ],
      note: "Survey interest ≠ paying demand",
    },
    annotations: [
      { id: "surveys", label: "Survey responses", icon: "chart" },
      { id: "interviews", label: "Interview notes", icon: "message" },
      { id: "competitors", label: "Competitor board", icon: "search" },
      { id: "pricing", label: "Pricing research", icon: "briefcase" },
    ],
  },

  /* ---------------------------------------------------------------- 14 */
  {
    id: "design",
    number: "14",
    title: "From Ideas to Product Experiences",
    short: "Product design",
    place: BWB,
    part: "BackWithBrain",
    pageLabel: "CHAPTER 14 · PRODUCT STUDIO",
    quote:
      "Good ideas become useful when someone takes responsibility for making the experience real.",
    heading: "From D2C to B2B",
    category: "Exploration & design",
    about:
      "Mood tracking, sleep journeys, guided workouts, HR analytics, gratitude journaling — translating broad wellness ideas into product concepts.",
    lesson:
      "Product thinking starts when you stop looking at features and start understanding people.",
    loop: { NOTICED: "on", INVESTIGATED: "on" },
    work: {
      subtitle: "What I designed and explored.",
      items: [
        { title: "Product requirements", text: "What a wellness product for teams would need" },
        { title: "User journeys", text: "Flows for each product area" },
        { title: "Employee concepts", text: "Check-ins, sleep journeys, guided workouts" },
        { title: "HR dashboards", text: "Concept views for organisations" },
      ],
      metrics: [{ value: "4", label: "Product areas mapped" }],
      note: "Concepts, not shipped features. The move to B2B was the founders' decision; I contributed to it.",
    },
    annotations: [
      { id: "flows", label: "User flows", icon: "route" },
      { id: "wireframes", label: "Wireframes", icon: "pen" },
      { id: "concepts", label: "Concepts — explored", icon: "sparkles" },
      { id: "hr", label: "HR dashboard concept", icon: "chart" },
    ],
  },

  /* ---------------------------------------------------------------- 15 */
  {
    id: "voice",
    number: "15",
    title: "Voice to Build",
    short: "Voice to Build",
    place: "Bengaluru",
    part: "Personal Projects",
    pageLabel: "CHAPTER 15 · BENGALURU OFFICE",
    quote:
      "An idea starts as a thought. A thought becomes an instruction. An instruction becomes something real.",
    heading: "How I work",
    category: "Voice-first",
    about:
      "I like expressing ideas while they are still fresh. Voice helps me get those thoughts out, turn them into instructions and keep moving.",
    voice: {
      icon: "🔗",
      app: "LinkedIn · New post",
      text: "I use voice to think faster. This entire portfolio was directed through voice — every prompt, every instruction, every iteration.",
    },
    annotations: [
      { id: "mic", label: "Thinking out loud", icon: "mic" },
      { id: "screen", label: "Words appearing", icon: "pen" },
      { id: "board", label: "Ideas → instructions", icon: "layers" },
    ],
  },

  /* ---------------------------------------------------------------- 16 */
  {
    id: "smaran",
    number: "16",
    title: "Building Something Personal",
    short: "Smaran",
    place: "Personal project · Home",
    part: "Personal Projects",
    pageLabel: "CHAPTER 16 · PERSONAL PROJECT",
    quote: "Technology becomes personal when it solves a problem for someone you love.",
    heading: "Smaran",
    tagline: "A voice-based medication reminder",
    category: "Solo build",
    about:
      "My mother needed help remembering her medicines. I built Smaran, a voice reminder that calls in my own cloned voice, so it feels like her son is reminding her, in Hindi, Hinglish or English. I used ElevenLabs to connect the voice part. I also tried to sell it to other platforms, such as habit and health apps, but it did not work out.",
    tags: ["Replit", "Claude", "ElevenLabs", "Voice AI"],
    lesson: "It worked for my mother. It did not sell. Both are useful to know.",
    loop: { NOTICED: "on", DECIDED: "on", OWNED: "on", BUILT: "on", LEARNED: "learn" },
    annotations: [
      { id: "phone", label: "The phone by her bed", icon: "mic" },
      { id: "voice", label: "My cloned voice", icon: "message" },
      { id: "tick", label: "Medicine taken", icon: "check" },
    ],
  },

  /* ---------------------------------------------------------------- 17 */
  {
    id: "next",
    number: "17",
    title: "What I Would Build Next",
    short: "What's next",
    place: "Wispr Flow · India",
    part: "The Next Chapter",
    pageLabel: "CHAPTER 17 · THE NEXT CHAPTER",
    quote: "I do not have every answer. I do know how to start, measure and learn.",
    heading: "Wispr Flow, in India",
    category: "Growth thinking",
    about:
      "Wispr Flow grows when someone tries voice for one real workflow and discovers it is faster than typing.",
    loop: { NOTICED: "on", INVESTIGATED: "on", DECIDED: "on" },
    work: {
      title: "What I would build next",
      subtitle: "If I join Wispr Flow, this is how I would start.",
      items: [
        { title: "[First thing I would build]", text: "To be filled by me" },
        { title: "[Second thing I would build]", text: "To be filled by me" },
        { title: "[Third thing I would build]", text: "To be filled by me" },
      ],
    },
    annotations: [
      { id: "office", label: "An office that speaks", icon: "building" },
      { id: "desk", label: "Speaking, not typing", icon: "mic" },
      { id: "screen", label: "Voice becomes text", icon: "pen" },
    ],
  },
];

/** Chapters that have a miniature world (everything after the prologue). */
export const worldChapters = chapters.slice(2);

/** Groups for the Contents list. */
export const PARTS: Part[] = [
  "The Beginning",
  "First Work",
  "BackWithBrain",
  "Personal Projects",
  "The Next Chapter",
];

/** Words in a dictated note, as Flow would count them. */
export function wordCount(text: string) {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/* ------------------------------------------------------- after the book */

export interface Hackathon {
  place: "1st" | "2nd" | "3rd" | "4th";
  tone: "pink" | "yellow" | "purple" | "teal";
  event: string;
  date: string;
  teams: string;
  project: string;
  text: string;
  tags?: string[];
  /** Up to three photos from the event. Empty strings show an upload slot. */
  photos: [string, string, string];
}

/** Oldest to newest, left to right — the timeline under the cards uses the same order. */
export const hackathons: Hackathon[] = [
  {
    place: "4th",
    tone: "teal",
    event: "AI Agents Hackathon",
    date: "6 Sep 2026",
    teams: "30 teams",
    project: "Mind Games",
    text: "Built independently using Kimchi.dev.",
    tags: ["Solo build"],
    photos: ["", "", ""],
  },
  {
    place: "3rd",
    tone: "purple",
    event: "ElevenCreative Session, Bengaluru",
    date: "18 Sep 2026",
    teams: "8 teams",
    project: "AI Music Experiment",
    text: "AI-powered music blending Western and Indian classical influences using ElevenLabs.",
    photos: ["", "", ""],
  },
  {
    place: "2nd",
    tone: "yellow",
    event: "Razorpay × Replit Sprint Saturday",
    date: "19 Sep 2026",
    teams: "90+ teams",
    project: "Smaran",
    text: "Solo build. Hindi, Hinglish, English medication reminder. Replit · Claude · ElevenLabs.",
    tags: ["★ Featured achievement", "Solo build"],
    photos: ["", "", ""],
  },
  {
    place: "1st",
    tone: "pink",
    event: "EmberGround AI Hackathon",
    date: "27 Sep 2026",
    teams: "26 teams",
    project: "Smaran",
    text: "Voice-based medication reminder. Built with team collaboration using ElevenLabs.",
    tags: ["Team build", "Voice AI"],
    photos: ["", "", ""],
  },
];

/**
 * "What people say": screenshots of LinkedIn recommendations, uploaded by
 * Durgesh. No quotes are written here — an empty `image` shows a slot.
 */
export interface TestimonialShot {
  name: string;
  role: string;
  image: string;
  alt: string;
}

export const testimonials: TestimonialShot[] = [
  { name: "", role: "", image: "", alt: "LinkedIn recommendation screenshot" },
  { name: "", role: "", image: "", alt: "LinkedIn recommendation screenshot" },
  { name: "", role: "", image: "", alt: "LinkedIn recommendation screenshot" },
  { name: "", role: "", image: "", alt: "LinkedIn recommendation screenshot" },
];

export interface OperateCard {
  number: string;
  tone: "forest" | "gold" | "terracotta" | "blue" | "olive";
  icon: string;
  title: string;
  text: string;
  evidence: string;
  /** Chapter id the evidence links to ("hackathons" scrolls to that section). */
  link: string;
}

export const operate = {
  title: "How I Operate",
  subtitle: "The pattern behind every chapter you just read.",
  cards: [
    {
      number: "01",
      tone: "forest",
      icon: "🎯",
      title: "I own the problem, not just the task",
      text: "At BackWithBrain, nobody asked me to fix the drop-off. I noticed it, investigated it, introduced accountability partners and tracked the result. Day-7 completion went from 29% to 50%+.",
      evidence: "See Chapter 11 — Accountability Partners",
      link: "accountability",
    },
    {
      number: "02",
      tone: "gold",
      icon: "⚡",
      title: "I start before anyone asks me to",
      text: "At GoCattles, I started by selling remaining inventory directly to shopkeepers — on the ground, door to door. That earned me the digital marketing role. From there I expanded into operations, Amazon Seller Central, content, and eventually managed two interns. Nobody gave me that path. I built it one step at a time.",
      evidence: "See Chapter 05 — GoCattles",
      link: "gocattles",
    },
    {
      number: "03",
      tone: "terracotta",
      icon: "🔄",
      title: "When something breaks, I investigate before I react",
      text: "Prime Day campaign didn't convert. I didn't blame the channel — I examined the gap between attention and demand. Daily Detox engagement dropped. I didn't defend the idea — I called customers and recommended stopping the experiment.",
      evidence: "See Chapter 06 — Prime Day + Chapter 12 — Daily Detox",
      link: "prime-day",
    },
    {
      number: "04",
      tone: "blue",
      icon: "🚀",
      title: "I learn by doing, not by taking a course first",
      text: "Figma, Replit, Claude, ElevenLabs, Amazon Seller Central — I did not study any of these before using them. I had a problem, picked the tool, and shipped something with it the same week. Four hackathons in four weeks, each with a different tool and a working prototype.",
      evidence: "See Hackathon wins + Chapter 16 — Smaran",
      link: "hackathons",
    },
    {
      number: "05",
      tone: "olive",
      icon: "🤝",
      title: "I start on the ground, not on a slide deck",
      text: "I sold dog food to shopkeepers in Noida. I went to community parks and wellness events across Bengaluru to introduce people to meditation. I called customers when an experiment failed. Growth strategies that only exist in presentations do not interest me.",
      evidence: "See Chapters 05, 09, 12",
      link: "community",
    },
  ] satisfies OperateCard[],
};

export const growth = {
  title: "Why Wispr Flow, and what I will bring",
  doTitle: "What I do",
  doPoints: [
    {
      text: "I own a problem end to end, from noticing it to tracking what changed.",
      link: "accountability",
    },
    {
      text: "I run community-style growth tests on the ground: parks, events, direct conversations.",
      link: "community",
    },
    {
      text: "I build small products fast when I see a real need, like Smaran for my mother.",
      link: "smaran",
    },
    {
      text: "I talk to customers and stop an experiment when it is not working.",
      link: "daily-detox",
    },
  ],
  whyTitle: "Why Wispr Flow",
  whyPoints: [
    "[Reason 1 — to be filled by me]",
    "[Reason 2 — to be filled by me]",
    "[Reason 3 — to be filled by me]",
  ],
};

/** Shown right after the book closes. Section names are placeholders to confirm. */
export const internalBook = {
  title: "What I would write in the Wispr Flow Growth Internal Book",
  sections: [
    {
      name: "Watch",
      text: "Where people already talk instead of type, and where typing slows them down.",
    },
    {
      name: "Try",
      text: "Small first-dictation tests with real people, one real message at a time.",
    },
    { name: "Learn", text: "What made someone come back to voice the next day, and what did not." },
  ],
  note: "Section names to be confirmed.",
};

export const contact = {
  title: "Durgesh Shukla",
  subtitle: "Product · Growth · Building",
  quote:
    "I am not someone who has everything figured out. I am someone who is willing to figure things out, take ownership and make things happen.",
  footer: "Built with voice. Built with Wispr Flow. November 2026.",
  colophon: "THE BOOK OF MY JOURNEY — Durgesh Shukla — 2026",
};

/** Last section of the site. Fill in `line`, `email` and `linkedin` later. */
export const closing = {
  title: "My Wispr Flow",
  line: "[Your closing line goes here]",
  email: "[your email]",
  linkedin: "[your LinkedIn link]",
};

export const hackathonIntro = {
  title: "Building Under Pressure",
  subtitle: "Four hackathons. Four weeks. Four different problems.",
};
