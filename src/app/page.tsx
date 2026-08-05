"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import RotatingText from "@/components/RotatingText";
import { NOTIFY_FORM_URL } from "@/lib/links";

// Pill-shaped hero buttons: compact padding, accent fill for the primary
// action and an accent outline for the alternative.
const HERO_CTA = "cta-base rounded-full px-5 py-[9px] text-[15px]";

function HeroEmailCTA({ location }: { location: string | null }) {
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
      const source = location ? `poster-${location}` : "website";
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
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
    body: "Six weekly sessions over dinner, reading and arguing about the core work in alignment or governance. For students, no ML background needed.",
    cta: "Learn more",
    style: "filled",
    color: "accent",
    href: "/fellowships",
    art: "/hero-observatory.webp",
    tag: "Students",
  },
  {
    title: "Intensive",
    body: "One day a week at an AI safety lab in downtown Toronto, built to fit around a full-time job. You leave with finished projects.",
    cta: "Learn more",
    style: "outline",
    color: "navy",
    href: "/intensive",
    art: "/hero-skyline-1.png",
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
  const section = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [shown, setShown] = useState(false);

  // Reveal the row the first time it scrolls into view.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reveal = (delay: number) => ({
    className: `transition-all duration-700 ease-out ${
      shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    }`,
    style: { transitionDelay: `${delay}ms` },
  });

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
    <div ref={section}>
      <div
        className={`flex items-center justify-between gap-4 mb-8 sm:mb-10 ${reveal(0).className}`}
        style={reveal(0).style}
      >
        <h2 className="hero-title text-[2rem] sm:text-[2.75rem] leading-[1] font-semibold">
          Programs
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
          {programs.map((p, i) => {
            const look = cardLook(p.style, p.color);
            const entrance = reveal(120 + i * 110);
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
              <a
                key={p.title}
                data-card
                href={p.href}
                className={`${shell} ${entrance.className}`}
                style={{ ...box, ...entrance.style }}
              >
                {inner}
              </a>
            ) : (
              <div
                key={p.title}
                data-card
                className={`${shell} ${entrance.className}`}
                style={{ ...box, ...entrance.style }}
              >
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

function ResearchGrid() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 text-[17px] sm:text-[19px] text-text-secondary hover:text-navy transition-colors group"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="square"
          className="text-accent shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
        <span>Examples of AI safety work</span>
      </button>
      {open && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-black/10 bg-black/10">
          {researchLinks.map((category) => (
            <div key={category.category} className="bg-white p-5 sm:p-6">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-3">
                {category.category}
              </p>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] sm:text-[15px] leading-[1.5] text-navy hover:text-accent transition-colors"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomeInner() {
  const params = useSearchParams();
  const location = params.get("loc") || null;
  const tracked = useRef(false);

  useEffect(() => {
    if (!location || tracked.current) return;
    tracked.current = true;
    fetch("/api/qr-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    }).catch(() => {});
  }, [location]);

  return (
    <main className="md:overflow-hidden">
      <section className="relative overflow-hidden bg-[#FDFDFE] -mt-16 min-h-[100svh] flex flex-col justify-start sm:justify-center">
        {/* Hero background */}
        <div
          aria-hidden
          className="hero-art pointer-events-none absolute inset-[-8%] bg-[#FDFDFE]"
        />

        {/* Sailboat drifting right to left across the water */}
        <div
          aria-hidden
          className="sailboat pointer-events-none z-[5]"
          style={{
            bottom: "2.2%",
            "--sail-start": "97vw",
            "--sail-end": "29.5vw",
            animationDuration: "95s",
          } as React.CSSProperties}
        >
          <Image
            src="/sailboat-drift-v1.png"
            alt=""
            width={62}
            height={80}
            className="h-auto w-[67px]"
          />
        </div>

        {/* Copy of the big sailboat pinned over the one drawn in the image,
            so the drifting boat passes behind it */}
        <div
          aria-hidden
          className="sailboat-overlay pointer-events-none z-[6]"
          style={{ left: "64.5%", bottom: "0.6%" }}
        >
          <Image
            src="/sailboat-cut-big-v2.png"
            alt=""
            width={76}
            height={105}
            className="h-auto w-[84px]"
          />
        </div>

        {/* White fade layer above the boats; matches the drawing's blank
            left side so the drifter dissolves with the image itself */}
        <div
          aria-hidden
          className="hidden sm:block pointer-events-none absolute inset-0 z-[7]"
          style={{
            background: "linear-gradient(to right, #FDFDFE 30vw, rgba(253, 253, 254, 0) 48vw)",
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

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 sm:px-8 pt-28 sm:pt-8 pb-24 sm:-translate-y-[4vh]">
          <h1 className="hero-title text-[3.35rem] sm:text-[4rem] md:text-[5.5rem] leading-[0.98] tracking-normal mb-7 sm:mb-8 md:mb-10 font-semibold">
            <span className="intro-word">
              AI safety needs more <RotatingText />
            </span>
          </h1>

          <div
            className="intro-rise mt-10 flex flex-col items-start sm:flex-row sm:items-center gap-3 sm:gap-4"
            style={{ animationDelay: "260ms" }}
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
            <HeroEmailCTA location={location} />
          </div>
        </div>

        <div className="absolute z-10 bottom-8 left-0 right-0 flex justify-center">
          <a
            href="#what-is-ai-safety"
            aria-label="Scroll to next section"
            className="text-text-secondary/40 hover:text-text-secondary transition-colors"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </a>
        </div>
      </section>

      {/* What is AI safety? */}
      <section id="what-is-ai-safety" className="scroll-mt-16 max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 md:pt-12 pb-8 md:pb-10">
        <div className="space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text">
          <h2 className="section-header">
            What is AI safety?
          </h2>
          <p>
            AI systems are getting powerful. The US government uses AI for military planning, and wants the ability to have AIs piloting autonomous lethal weapons.
            <br /><br />
            These are not just chatbots anymore. People are putting AI systems in charge of real-world things, things with dangerous consequences. And this is the stupidest that the models will ever be.
          </p>
          <p>
            AI safety asks the question: <strong>&ldquo;how can we make sure that advanced AI systems don&rsquo;t do bad things?&rdquo;</strong>
          </p>
        </div>

        <div className="mt-6">
          <ResearchGrid />
        </div>

        <div className="space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text mt-6">
          <h2 className="section-header pt-5">
            What&rsquo;s in it for you?
          </h2>
          <p>
            AI safety needs more researchers. People are pouring money into finding talent for the field.
            <br /><br />
            <strong>That&rsquo;s why we exist:</strong> we have funding to find exceptional people like you, introduce you to AI safety, and train you into the cracked researchers that this field desperately needs.
          </p>
        </div>

      </section>

      {/* Programs */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 md:pt-10 pb-10 md:pb-16">
        <ProgramRow />
      </section>

      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 md:pt-10 pb-8 md:pb-10">
        {/* Where AI safety work happens */}
        <div className="mt-11 space-y-5 text-text">
          <h2 className="section-header">
            Where does AI safety work happen?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-black/10 bg-black/10 mt-2">
            {safetyOrgs.map((org) => (
              <a
                key={org.name}
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors group"
              >
                <Image
                  src={org.logo}
                  alt={org.name}
                  width={40}
                  height={40}
                  className="w-[1.8rem] h-[1.8rem] object-contain shrink-0"
                />
                <div>
                  <span className="block text-[15px] sm:text-[16px] font-semibold text-navy group-hover:text-accent transition-colors">
                    {org.name}
                  </span>
                  <span className="block text-[14px] sm:text-[15px] leading-[1.5] text-text-secondary mt-0.5">
                    {org.description}
                  </span>
                </div>
              </a>
            ))}
            <div className="bg-white p-5 flex items-start gap-4">
              <Image
                src="/logos/university.svg"
                alt="University labs"
                width={40}
                height={40}
                className="w-[1.8rem] h-[1.8rem] object-contain shrink-0"
              />
              <div>
                <span className="block text-[15px] sm:text-[16px] font-semibold text-navy">
                  University labs
                </span>
                <span className="block text-[14px] sm:text-[15px] leading-[1.5] text-text-secondary mt-0.5">
                  <a href="https://algorithmicalignment.csail.mit.edu/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MIT</a>,{" "}
                  <a href="https://www.cser.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Cambridge</a>,{" "}
                  <a href="https://xrisk.uchicago.edu/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">UChicago</a>, etc. Most top universities have at least one professor or lab working on this.
                </span>
                <span className="block text-[14px] sm:text-[15px] leading-[1.5] text-text-secondary mt-2">
                  At UofT,{" "}
                  <a href="https://www.cs.toronto.edu/~duvenaud/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">David Duvenaud</a>,{" "}
                  <a href="https://www.cs.toronto.edu/~rgrosse/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Roger Grosse</a>,{" "}
                  <a href="https://zhijing-jin.com/home" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Zhijing Jin</a>, and{" "}
                  <a href="https://www.cs.toronto.edu/~sheila/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Sheila McIlraith</a> do AI safety work.
                </span>
              </div>
            </div>
          </div>

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

      </section>




    </main>
  );
}

const safetyOrgs = [
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

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
