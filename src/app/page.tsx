"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import RotatingText from "@/components/RotatingText";
import HeroBackdrop from "@/components/HeroBackdrop";
import HeroBoats from "@/components/HeroBoats";
import { NOTIFY_FORM_URL } from "@/lib/links";

// Pill-shaped hero buttons: compact padding, accent fill for the primary
// action and an accent outline for the alternative.
const HERO_CTA = "cta-base rounded-full px-6 py-[11px] text-[16px]";

function HeroEmailCTA() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "website" }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className={`${HERO_CTA} cta-outline cursor-default`}>
        You&rsquo;re on the list.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${HERO_CTA} cta-outline`}
      >
        Join our mailing list
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <input
        ref={inputRef}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@gmail.com"
        className="field-pill sm:w-64 self-stretch"
      />
      <button
        type="submit"
        disabled={submitting}
        className={`${HERO_CTA} cta-outline shrink-0`}
      >
        {submitting ? "..." : "Sign up"}
      </button>
      {error && (
        <p className="text-accent text-[14px] font-medium">{error}</p>
      )}
    </form>
  );
}

type Program = {
  title: string;
  body: string;
  cta: string;
  style: CardStyle;
  color: keyof typeof COLORS;
  href?: string;
  art?: string;
  tag?: string;
};

const programs: Program[] = [
  {
    title: "Fellowship",
    body: "6 weekly sessions over dinner at Trajectory Labs. Explore core material in alignment or governance with other students and an experienced facilitator. No ML background needed.",
    cta: "Learn more",
    style: "outline",
    color: "navy",
    href: "/fellowships",
    art: "/hero-observatory.webp",
    tag: "Students",
  },
  {
    title: "Intensive",
    body: "One day a week at an AI safety lab in downtown Toronto, built to fit around a full-time job. Leave with next steps and a plan for how to contribute.",
    cta: "Learn more",
    style: "outline",
    color: "navy",
    href: "/intensive",
    art: "/hero-skyline-1.webp",
    tag: "Working professionals",
  },
  {
    title: "Coming soon",
    body: "",
    cta: "",
    style: "neutral",
    color: "accent",
  },
];

// Locked-in card proportions.
const CARD_WIDTH = 440;
const CARD_RATIO = "5 / 4";
const CARD_FONT = { title: 21, body: 16 };
const ART_OPACITY = 0.55;
const ART_SIZE = { w: "100%", h: "88%" };

const COLORS = {
  accent: { hex: "#D94F30", rgb: "217, 79, 48" },
  navy: { hex: "#1A3355", rgb: "26, 51, 85" },
  stone: { hex: "#8C8781", rgb: "140, 135, 129" },
} as const;

const CARD_STYLES = ["outline", "filled", "tinted", "neutral"] as const;
type CardStyle = (typeof CARD_STYLES)[number];

function cardLook(style: CardStyle, key: keyof typeof COLORS) {
  const c = COLORS[key];
  // On a filled card the button inverts to white; on light cards it fills
  // with the card colour and the label turns white.
  const filled = {
    box: { backgroundColor: c.hex, borderColor: c.hex },
    title: "#FFFFFF",
    body: "rgba(255, 255, 255, 0.85)",
    tag: "rgba(255, 255, 255, 0.75)",
    cta: "#FFFFFF",
    ctaHoverBg: "#FFFFFF",
    ctaHoverFg: c.hex,
  };
  const onLight = (cta: string, ctaRgb: string) => ({
    tag: `rgba(${ctaRgb}, 0.75)`,
    cta,
    ctaHoverBg: cta,
    ctaHoverFg: "#FFFFFF",
  });
  switch (style) {
    case "filled":
      return filled;
    case "tinted":
      return {
        box: {
          backgroundColor: `rgba(${c.rgb}, 0.1)`,
          borderColor: `rgba(${c.rgb}, 0.35)`,
        },
        title: "#1A1A1A",
        body: "#4A4A4A",
        ...onLight(c.hex, c.rgb),
      };
    case "neutral":
      return {
        box: { backgroundColor: "#FFFFFF", borderColor: "rgba(0, 0, 0, 0.15)" },
        // Softer than the live cards, so it reads as a placeholder.
        title: "#8C8781",
        body: "#8C8781",
        ...onLight(COLORS.accent.hex, COLORS.accent.rgb),
      };
    default:
      return {
        box: { backgroundColor: "#FFFFFF", borderColor: c.hex },
        title: "#1A1A1A",
        body: "#4A4A4A",
        ...onLight(c.hex, c.rgb),
      };
  }
}

function ProgramRow() {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  function sync() {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  function step(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const distance = card ? card.clientWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  const arrow =
    "flex items-center justify-center w-10 h-10 rounded-full border border-accent text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-accent";

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10">
        <h2 className="section-header">
          Programming
        </h2>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous programs"
            className={arrow}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="More programs"
            className={arrow}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={sync}
        className="-mx-5 sm:-mx-8 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-6 px-5 sm:px-8 snap-x snap-mandatory">
          {programs.map((p) => {
            const look = cardLook(p.style, p.color);
            const shell =
              "program-card group relative overflow-hidden snap-start shrink-0 flex flex-col justify-between rounded-lg p-6 sm:p-8 border";
            const art = p.art && (
              <div
                aria-hidden
                className="pointer-events-none absolute -right-[6%] -bottom-[4%] bg-no-repeat bg-contain bg-right-bottom transition-transform duration-500 group-hover:scale-[1.04]"
                style={{
                  backgroundImage: `url('${p.art}')`,
                  width: ART_SIZE.w,
                  height: ART_SIZE.h,
                  opacity: ART_OPACITY,
                  // Dark cards need the sketch inverted, otherwise dark pencil
                  // lines vanish into the fill.
                  mixBlendMode: p.style === "filled" ? "screen" : "multiply",
                  filter: p.style === "filled" ? "invert(1)" : undefined,
                }}
              />
            );
            const box: React.CSSProperties = {
              ...look.box,
              width: `min(${CARD_WIDTH}px, 86vw)`,
            };
            const inner = (
              <>
                {art}
                {p.tag && (
                  <span
                    className="absolute top-7 right-6 sm:top-9 sm:right-8 z-[1] text-[11px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: look.tag }}
                  >
                    {p.tag}
                  </span>
                )}
                <ProgramBody
                  program={p}
                  title={look.title}
                  body={look.body}
                  fontTitle={CARD_FONT.title}
                  fontBody={CARD_FONT.body}
                />
                {p.cta && (
                  <span
                    className="card-cta relative z-[1] self-start"
                    style={
                      {
                        "--cta-fg": look.cta,
                        "--cta-hover-bg": look.ctaHoverBg,
                        "--cta-hover-fg": look.ctaHoverFg,
                      } as React.CSSProperties
                    }
                  >
                    {p.cta}
                    <span aria-hidden className="card-cta-arrow">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="square"
                        className="shrink-0"
                      >
                        <path d="M5 12h13M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </span>
                )}
              </>
            );
            return p.href ? (
              <a key={p.title} data-card href={p.href} className={shell} style={box}>
                {inner}
              </a>
            ) : (
              <div key={p.title} data-card className={shell} style={box}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgramBody({
  program,
  title,
  body,
  fontTitle,
  fontBody,
}: {
  program: Program;
  title: string;
  body: string;
  fontTitle: number;
  fontBody: number;
}) {
  return (
    <div className="relative z-[1]">
      <h3
        className="font-semibold mb-3 pr-32"
        style={{ color: title, fontSize: `${fontTitle}px` }}
      >
        {program.title}
      </h3>
      {program.body && (
        <p
          className="leading-[1.65]"
          style={{ color: body, fontSize: `${fontBody}px` }}
        >
          {program.body}
        </p>
      )}
    </div>
  );
}

function OrgLogo({ src, size = "w-7 h-7" }: { src: string; size?: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={40}
      height={40}
      className={`${size} object-contain shrink-0 transition-transform duration-200 group-hover:scale-110`}
    />
  );
}

function UniversityNote() {
  return (
    <p className="text-[15px] sm:text-[16px] leading-[1.6] text-text-secondary max-w-[720px]">
      <span className="font-semibold text-navy">University labs. </span>
      <a href="https://algorithmicalignment.csail.mit.edu/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MIT</a>,{" "}
      <a href="https://www.cser.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Cambridge</a>,{" "}
      <a href="https://xrisk.uchicago.edu/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">UChicago</a>{" "}
      and most top universities have at least one professor or lab working on
      this. At the University of Toronto,{" "}
      <a href="https://www.cs.toronto.edu/~duvenaud/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">David Duvenaud</a>,{" "}
      <a href="https://www.cs.toronto.edu/~rgrosse/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Roger Grosse</a>,{" "}
      <a href="https://zhijing-jin.com/home" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Zhijing Jin</a>{" "}
      and{" "}
      <a href="https://www.cs.toronto.edu/~sheila/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Sheila McIlraith</a>{" "}
      do AI safety work.
    </p>
  );
}

function OrgCard({ org }: { org: Org }) {
  return (
    <a
      href={org.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3"
    >
      {org.logo ? (
        <OrgLogo src={org.logo} size="w-6 h-6" />
      ) : (
        <span className="w-6 h-6 shrink-0 mt-0.5 grid place-items-center rounded-sm bg-black/[0.06] text-[10px] font-semibold text-text-secondary group-hover:text-accent transition-colors">
          {org.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase()}
        </span>
      )}
      <span>
        <span className="block text-[16px] font-semibold text-navy group-hover:text-accent transition-colors">
          {org.name}
        </span>
        <span className="block text-[14px] leading-[1.5] text-text-secondary mt-0.5">
          {org.description}
        </span>
      </span>
    </a>
  );
}

const ORG_GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6";

function OrgDirectory() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pt-4">
      <div className={ORG_GRID}>
        {safetyOrgs.map((org) => (
          <OrgCard key={org.name} org={org} />
        ))}
      </div>

      {/* Animating grid-template-rows lets the panel open to its own height.
          The inner padding matches the grid row gap so the extra entries read
          as more rows of the same grid, not a separate block. */}
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`${ORG_GRID} pt-6 transition-opacity duration-500 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {moreOrgs.map((org) => (
              <OrgCard key={org.name} org={org} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-accent hover:underline underline-offset-4"
      >
        {expanded ? "Collapse" : "Expand"}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="square"
          className="transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "none" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className="mt-8">
        <UniversityNote />
      </div>
    </div>
  );
}

// Titles carry their source in trailing parentheses; split it out so the
// source can sit quietly beside the title.
function splitSource(title: string) {
  const m = title.match(/^(.*)\s\(([^()]+)\)$/);
  return m ? { title: m[1], source: m[2] } : { title, source: "" };
}

// Bold two-colour set: most tiles are outlined, a couple are filled so the
// grid has some weight in it.
const ACCENT = "#D94F30";
const NAVY = "#1A3355";
const TILE_LOOKS = [
  { border: ACCENT, bg: "transparent", title: NAVY, link: "#3C3C3C" },
  { border: NAVY, bg: NAVY, title: "#FFFFFF", link: "rgba(255,255,255,0.85)" },
  { border: NAVY, bg: "transparent", title: NAVY, link: "#3C3C3C" },
  { border: ACCENT, bg: ACCENT, title: "#FFFFFF", link: "rgba(255,255,255,0.9)" },
  { border: NAVY, bg: "transparent", title: NAVY, link: "#3C3C3C" },
  { border: ACCENT, bg: "transparent", title: NAVY, link: "#3C3C3C" },
];

function ResearchGrid() {
  return (
        <div>
          <h2 className="section-header mb-6">Examples of AI safety work</h2>
          {/* Fewer, wider columns: at five across the titles wrapped to three
              lines in a narrow box, which read as cramped rather than dense. */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {researchLinks
              .flatMap((c) => c.links)
              .map((link, i) => {
                const { title, source } = splitSource(link.title);
                const look = TILE_LOOKS[i % TILE_LOOKS.length];
                const filled = look.bg !== "transparent";
                return (
                  <div key={link.url} className="flex">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-tile w-full rounded-lg px-4 py-4 sm:px-5 sm:py-[18px] border flex flex-col justify-between min-h-[104px] sm:min-h-[118px] hover:-translate-y-0.5"
                    style={
                      {
                        "--tile-border": look.border,
                        "--tile-bg": look.bg,
                        // The two states swap: outlined tiles fill with their
                        // colour, filled ones empty out to white.
                        "--tile-hover-bg": filled ? "#FFFFFF" : look.border,
                        "--tile-fg": filled ? "#FFFFFF" : NAVY,
                        "--tile-sub": filled ? "rgba(255,255,255,0.75)" : "#6B6B6B",
                        "--tile-hover-fg": filled ? look.border : "#FFFFFF",
                        "--tile-hover-sub": filled
                          ? "#6B6B6B"
                          : "rgba(255,255,255,0.75)",
                      } as React.CSSProperties
                    }
                  >
                    <span className="tile-title text-[14px] sm:text-[16px] font-semibold leading-[1.35]">
                      {title}
                    </span>
                    {source && (
                      <span className="tile-source text-[12px] sm:text-[13px] mt-2.5">
                        {source}
                      </span>
                    )}
                  </a>
                  </div>
                );
              })}
          </div>
        </div>
  );
}

export default function Home() {
  return (
    <main className="md:overflow-hidden">
      <section className="relative -mt-16 min-h-[100svh] flex flex-col justify-start sm:justify-center">
        <HeroBackdrop pinned={false}>
        {/* Hero background */}
        <div
          aria-hidden
          className="hero-art pointer-events-none absolute inset-[-8%] bg-[#FDFDFE]"
        />

        {/* Boats are placed against the drawing, so they stay on their
            painted twins when the window changes shape */}
        <HeroBoats />

        {/* White fade layer above the boats; matches the drawing's blank
            left side so the drifter dissolves with the image itself */}
        <div
          aria-hidden
          className="hidden sm:block pointer-events-none absolute inset-0 z-[7]"
          style={{
            background: "linear-gradient(to right, #FDFDFE 30vw, rgba(253, 253, 254, 0) 48vw)",
          }}
        />
        {/* Settles the bottom of the drawing into the page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[8%] z-[7]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(253, 253, 254, 0) 0%, rgba(253, 253, 254, 0.4) 55%, #FDFDFE 100%)",
          }}
        />
        {/* On phones the drawing sits under the text, so it fades downward */}
        <div
          aria-hidden
          className="sm:hidden pointer-events-none absolute inset-0 z-[7]"
          style={{
            background:
              "linear-gradient(to bottom, #FDFDFE 0%, #FDFDFE 34%, rgba(253, 253, 254, 0.55) 54%, rgba(253, 253, 254, 0) 72%)",
          }}
        />
        </HeroBackdrop>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 sm:px-8 pt-28 sm:pt-8 pb-24 sm:-translate-y-[4vh]">
          <h1 className="hero-title text-[3.35rem] sm:text-[4rem] md:text-[5.5rem] leading-[0.98] tracking-normal mb-7 sm:mb-8 md:mb-10 font-semibold">
            AI safety needs more <RotatingText />
          </h1>

          <div
            className="flex flex-col items-start sm:flex-row sm:items-center gap-3 sm:gap-4"
            style={{ marginTop: "var(--hero-gap, 2.5rem)" }}
          >
            <a
              href={NOTIFY_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${HERO_CTA} cta-solid`}
            >
              Express interest in a future cohort
              <span aria-hidden className="cta-arrow">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                  className="shrink-0"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </a>
            <HeroEmailCTA />
          </div>
        </div>

      </section>

      {/* What is AI safety? */}
      <section id="what-is-ai-safety" className="scroll-mt-16 max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 md:pt-12 pb-2 md:pb-3">
        <div className="text-[17px] sm:text-[19px] leading-[1.7] text-text">
          <h2 className="section-header">
            What is AI safety?
          </h2>
          <p className="mt-5">
              <strong className="font-semibold">AI systems are getting powerful.</strong> The{" "}
              <a
                href="https://www.defenseone.com/policy/2026/01/grok-ethics-are-out-pentagons-new-ai-acceleration-strategy/410649/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                US government uses AI for military planning
              </a>
              , and wants the ability to have AIs piloting autonomous lethal weapons.{" "}
              <a
                href="https://openai.com/index/hugging-face-model-evaluation-security-incident/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                AI systems regularly hack external infrastructure during testing
              </a>
              .
            </p>
          <p className="mt-8">
            These are not just chatbots anymore. People are putting AI systems in charge of real-world things, things with <strong className="font-semibold">dangerous consequences</strong>. And this is the stupidest that the models will ever be.
          </p>
          <p className="mt-5">
            AI safety asks the question:{" "}
            <span className="text-accent font-medium">
              how can we make sure that advanced AI systems don&rsquo;t do bad things?
            </span>
          </p>
        </div>

      </section>

      {/* Programs */}
      <section
        id="programming"
        className="scroll-mt-24 max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 md:pt-10 pb-8 md:pb-12"
      >
        <ProgramRow />
      </section>

      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-2 md:pt-4 pb-8 md:pb-10">
        {/* Where AI safety work happens */}
        <div className="space-y-5 text-text">
          <h2 className="section-header">
            Where does AI safety work happen?
          </h2>
          <OrgDirectory />

          <p className="text-[14px] text-text-secondary">
            These are just a few. Explore many more organizations on the{" "}
            <a
              href="https://www.aisafety.com/map"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              AI safety map
            </a>.
          </p>
        </div>

        <div className="mt-10 md:mt-12">
          <ResearchGrid />
        </div>

      </section>




    </main>
  );
}

type Org = {
  name: string;
  description: string;
  url: string;
  logo?: string;
};

// Shown behind the "show more" toggle. No marks for these, so they fall back
// to a monogram.
const moreOrgs: Org[] = [
  {
    name: "ARC",
    description: "Theoretical alignment research",
    url: "https://www.alignment.org",
    logo: "/logos/arc.png",
  },
  {
    name: "MIRI",
    description: "Long-running alignment research nonprofit",
    url: "https://intelligence.org",
    logo: "/logos/miri.png",
  },
  {
    name: "FAR.AI",
    description: "Research nonprofit and a Berkeley research space",
    url: "https://www.far.ai",
    logo: "/logos/farai.svg",
  },
  {
    name: "Constellation",
    description: "Home to the Astra and Visiting fellowships, and a Berkeley coworking space",
    url: "https://constellation.org",
    logo: "/logos/constellation.png",
  },
  {
    name: "Timaeus",
    description: "Developmental interpretability research",
    url: "https://timaeus.co",
    logo: "/logos/timaeus.png",
  },
  {
    name: "Palisade Research",
    description: "Demonstrates the offensive capabilities of AI systems",
    url: "https://palisaderesearch.org",
    logo: "/logos/palisade.png",
  },
  {
    name: "IAPS",
    description: "AI policy think tank focused on security and governance",
    url: "https://www.iaps.ai",
    logo: "/logos/iaps.png",
  },
  {
    name: "LISA",
    description: "London research centre hosting safety orgs and fellows",
    url: "https://www.safeai.org.uk",
    logo: "/logos/lisa.png",
  },
  {
    name: "BlueDot Impact",
    description: "Runs the courses our fellowship curriculum adapts",
    url: "https://bluedot.org",
    logo: "/logos/bluedot.png",
  },
  {
    name: "Pivotal",
    description: "Research fellowships in AI safety and governance",
    url: "https://www.pivotal-research.org",
    logo: "/logos/pivotal.png",
  },
  {
    name: "Kairos",
    description: "Field building, runs SPAR and the Pathfinder fellowship",
    url: "https://kairos-project.org",
    logo: "/logos/kairos.png",
  },
  {
    name: "ILIAD",
    description: "Conference on mathematical approaches to alignment",
    url: "https://www.iliadconference.com",
    logo: "/logos/iliad.png",
  },
  {
    name: "AISST",
    description: "Harvard's AI safety student team",
    url: "https://aisst.ai",
    logo: "/logos/aisst.png",
  },
];

const safetyOrgs: Org[] = [
  {
    name: "Anthropic",
    description: "Frontier lab, does a lot of safety work",
    logo: "/logos/anthropic-icon.png",
    url: "https://www.anthropic.com",
  },
  {
    name: "MATS",
    description: "The top advanced AI safety research fellowship",
    logo: "/logos/mats-icon.png",
    url: "https://www.matsprogram.org",
  },
  {
    name: "Redwood Research",
    description: "AI control research",
    logo: "/logos/redwood-icon.png",
    url: "https://www.redwoodresearch.org",
  },
  {
    name: "METR",
    description: "Tests whether frontier models are dangerous",
    logo: "/logos/metr-icon.png",
    url: "https://metr.org",
  },
  {
    name: "Center for AI Safety",
    description: "Provides compute and funding for safety researchers",
    logo: "/logos/cais-icon.png",
    url: "https://www.safe.ai",
  },
  {
    name: "Geodesic Research",
    description: "AI safety research lab working on scalable alignment",
    logo: "/logos/geodesic.png",
    url: "https://geodesicresearch.ai",
  },

  {
    name: "Epoch AI",
    description: "AI trends and forecasting",
    logo: "/logos/epoch-icon.svg",
    url: "https://epoch.ai",
  },
  {
    name: "GovAI",
    description: "Oxford-based AI governance research. Runs competitive fellowships",
    logo: "/logos/govai-icon.jpg",
    url: "https://www.governance.ai",
  },
  {
    name: "80,000 Hours",
    description: "Career advice and the main AI safety job board",
    logo: "/logos/80k-icon.png",
    url: "https://80000hours.org",
  },
];

const researchLinks = [
  {
    category: "Accessible Introductions",
    links: [
      { title: "A.I. — Humanity's Final Invention? (Kurzgesagt)", url: "https://www.youtube.com/watch?v=fa8k8IQ1_X0" },
      { title: "If someone builds it, does everyone die? (80,000 Hours)", url: "https://www.youtube.com/watch?v=Nl7-bRFSZBs" },
      { title: "What Failure Looks Like (Paul Christiano)", url: "https://www.lesswrong.com/posts/HBxe6wdjxK239zajf/what-failure-looks-like" },
    ],
  },
  {
    category: "Mechanistic Interpretability",
    links: [
      { title: "Multimodal Neurons in Artificial Neural Networks", url: "https://distill.pub/2021/multimodal-neurons/" },
      { title: "Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet", url: "https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html" },
    ],
  },
  {
    category: "Alignment Failures",
    links: [
      { title: "Emergent Misalignment: Narrow Finetuning Can Produce Broadly Misaligned LLMs", url: "https://www.emergent-misalignment.com/" },
      { title: "Alignment Faking in Large Language Models (Anthropic)", url: "https://www.anthropic.com/research/alignment-faking" },

    ],
  },
  {
    category: "Evals & AI Control",
    links: [
      { title: "AI Control: Improving Safety Despite Intentional Subversion (Redwood Research)", url: "https://arxiv.org/abs/2312.06942" },
      { title: "Model Evaluation for Extreme Risks (DeepMind)", url: "https://arxiv.org/abs/2305.15324" },
    ],
  },
  {
    category: "Timelines & Forecasting [some content dated]",
    links: [
      { title: "Algorithmic Progress in Language Models (Epoch AI)", url: "https://epoch.ai/blog/algorithmic-progress-in-language-models" },
      { title: "AI 2027 (Kokotajlo et al.)", url: "https://ai-2027.com" },

    ],
  },
  {
    category: "Economics of AI",
    links: [
      { title: "Gradual Disempowerment (Kulveit et al.)", url: "https://gradual-disempowerment.ai" },
      { title: "Explosive Growth from AI Automation (Epoch AI)", url: "https://epoch.ai/blog/explosive-growth-from-ai-a-review-of-the-arguments" },
    ],
  },
];
