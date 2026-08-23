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
    body: "6 weekly sessions over free, fancy dinner at Trajectory Labs, an off-campus AI safety hub.\n\nExplore core material in alignment or governance with other students and an experienced facilitator. No ML background needed.",
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
          className="leading-[1.65] whitespace-pre-line"
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

const ORG_GRID = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-6";

function OrgDirectory() {
  return (
    <div className="pt-4">
      <div className={ORG_GRID}>
        {safetyOrgs.map((org) => (
          <OrgCard key={org.name} org={org} />
        ))}
      </div>

      <p className="mt-6 text-[14px] text-text-secondary">
        See more organizations on the{" "}
        <a
          href="https://www.aisafety.com/map"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-accent"
        >
          AI safety field map
        </a>.
      </p>
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
            <strong className="font-semibold">AI systems are getting powerful.</strong>{" "}
            In July 2026, OpenAI models{" "}
            <a
              href="https://openai.com/index/hugging-face-model-evaluation-security-incident/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent"
            >
              broke out of their test environment
            </a>{" "}
            and{" "}
            <a
              href="https://www.youtube.com/watch?v=87DyyMV0kCY"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent"
            >
              hacked into another company
            </a>
            . Anthropic{" "}
            <a
              href="https://www.theregister.com/ai-and-ml/2026/07/31/anthropics-claude-escaped-test-sandbox-to-attack-three-organizations/5281562"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent"
            >
              disclosed three cases
            </a>{" "}
            of its models escaping sandboxes and attacking other organizations.
          </p>
          <p className="mt-8">
            Without safety measures, bad actors could use AIs for large-scale cybercrime or to design biological weapons. Rampant automation could disempower much of humanity. If models get powerful enough, we could lose control of them entirely: they could copy themselves, resist shutdown, and work against us.
          </p>
          <p className="mt-5">
            None of this is guaranteed, but the risk is uncomfortably large.
          </p>
          <p className="mt-8">
            <strong className="font-semibold">AI safety is the field working to make this go well.</strong> We seek to reduce risks from advanced AI through technical research, policy, and field building.
          </p>
        </div>

      </section>

      {/* Why get involved? */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 md:pt-12 pb-2 md:pb-3">
        <div className="text-[17px] sm:text-[19px] leading-[1.7] text-text">
          <h2 className="section-header">
            Why get involved?
          </h2>
          <p className="mt-5">
            AI safety is one of the most pressing problems of our time, and only a few thousand people worldwide work on it full-time. The field is in desperate need of more talent, and not just computer scientists: it needs people from math, law, policy, economics, philosophy, advocacy, and entrepreneurship.
          </p>
          <p className="mt-8">
            If you care about <strong className="font-semibold text-accent">careers</strong>, there are exceptional careers to be made in AI safety.
          </p>
          <p className="mt-2">
            If you care about <strong className="font-semibold text-accent">impact</strong>, this is a chance to have a critical impact on the world.
          </p>
          <p className="mt-2">
            If you care about <strong className="font-semibold text-accent">community</strong> or making friends, we have one of the strongest, kindest communities on campus :)
          </p>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 md:pt-10 pb-2 md:pb-4">
        {/* Where AI safety work happens */}
        <div className="space-y-5 text-text">
          <h2 className="section-header">
            Where does AI safety work happen?
          </h2>
          <OrgDirectory />
        </div>
      </section>

      {/* Programs */}
      <section
        id="programming"
        className="scroll-mt-24 max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 md:pt-10 pb-8 md:pb-12"
      >
        <ProgramRow />
      </section>

      {/* Statement on AI Risk */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 md:pt-12 pb-10 md:pb-16">
        <figure className="max-w-[820px] mx-auto text-center">
          <blockquote className="text-[1.35rem] sm:text-[1.6rem] md:text-[1.9rem] leading-[1.3] font-semibold text-text">
            &ldquo;Mitigating the risk of extinction from AI should be a global
            priority alongside other societal-scale risks such as pandemics and
            nuclear war.&rdquo;
          </blockquote>
          <figcaption className="mt-5 text-[15px] sm:text-[16px] leading-[1.6] text-text-secondary">
            The{" "}
            <a
              href="https://safe.ai/work/statement-on-ai-risk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent"
            >
              Statement on AI Risk
            </a>
            , signed by U of T&rsquo;s Geoffrey Hinton (Nobel laureate, godfather
            of AI, and one of the most cited scientists alive) and hundreds of
            others: lab CEOs, leading researchers, and policymakers.
          </figcaption>
        </figure>
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

const safetyOrgs: Org[] = [
  {
    name: "Anthropic",
    description: "Frontier lab, does a lot of safety work",
    logo: "/logos/anthropic-icon.png",
    url: "https://www.anthropic.com",
  },
  {
    name: "MATS",
    description: "The top AI safety research fellowship",
    logo: "/logos/mats-icon.png",
    url: "https://www.matsprogram.org",
  },
  {
    name: "Redwood Research",
    description: "Pioneered the field of AI control",
    logo: "/logos/redwood-icon.png",
    url: "https://www.redwoodresearch.org",
  },
  {
    name: "METR",
    description: "Evaluates frontier models for the top labs",
    logo: "/logos/metr-icon.png",
    url: "https://metr.org",
  },
  {
    name: "Center for AI Safety",
    description: "Compute and funding for the safety field",
    logo: "/logos/cais-icon.png",
    url: "https://www.safe.ai",
  },
  {
    name: "Epoch AI",
    description: "Data and forecasts on AI progress",
    logo: "/logos/epoch-icon.svg",
    url: "https://epoch.ai",
  },
  {
    name: "GovAI",
    description: "Oxford's AI governance research hub",
    logo: "/logos/govai-icon.jpg",
    url: "https://www.governance.ai",
  },
  {
    name: "80,000 Hours",
    description: "Career advice and the AI safety job board",
    logo: "/logos/80k-icon.png",
    url: "https://80000hours.org",
  },
  {
    name: "ARC",
    description: "Foundational theory for AI alignment",
    url: "https://www.alignment.org",
    logo: "/logos/arc.png",
  },
  {
    name: "BlueDot Impact",
    description: "Runs the field's flagship AI safety courses",
    url: "https://bluedot.org",
    logo: "/logos/bluedot.png",
  },
  {
    name: "Resolution",
    description: "Alignment lab backed by a $160M grant",
    url: "https://resolution.org",
    logo: "/logos/resolution.png",
  },
  {
    name: "UK AI Security Institute",
    description: "The UK government's frontier AI evals lab",
    url: "https://www.aisi.gov.uk",
    logo: "/logos/uk-aisi.png",
  },
];
