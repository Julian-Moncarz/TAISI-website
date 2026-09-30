import { Suspense } from "react";
import Section from "@/components/Section";
import GeoObject from "@/components/geo/GeoObject";
import HomeQueryEffects from "@/components/HomeQueryEffects";
import OrgList from "@/components/OrgList";
import { TestimonialCard } from "@/components/TestimonialRow";
import { DISCORD_URL, interestFormHref } from "@/lib/links";

// Layout and copy follow "TAISI Homepage v2" in Claude Design.

const quotes = [
  {
    name: "Jacob Tsimerman",
    role: "Fields Medalist, U of T · took leave in 2026 to work on AI safety",
    quote: "AI safety [is] the most important problem of our time.",
    source: "https://x.com/Jacob_Tsimerman/status/2097282175636734444",
    image: "/people/tsimerman.webp",
  },
  {
    name: "Geoffrey Hinton",
    role: "Nobel laureate, U of T",
    quote:
      "If we don’t figure out how to make it safe, there’s a real possibility it could destroy us.",
    source:
      "https://www.techradar.com/pro/quote-of-the-day-by-legendary-computer-scientist-geoffrey-hinton-if-we-dont-figure-out-how-to-make-it-safe-theres-a-real-possibility-it-could-destroy-us-a-stark-alarm-on-the-existential-risks-of-ai",
    image: "/people/hinton.webp",
  },
  {
    name: "Roger Grosse",
    role: "Professor of CS, U of T · Anthropic",
    quote:
      "Given how fast AI is progressing, the problem of ensuring AIs are robustly aligned with human values seems like the most important thing we can be working on now.",
    source: "https://www.cs.toronto.edu/~rgrosse/",
    image: "/people/grosse.webp",
  },
];

const fellowshipPoints = [
  "Weekly discussions over dinner",
  "An introduction to the field of AI safety and its most important concepts",
  "Hosted at Trajectory Labs, an off-campus AI safety hub near King Station",
  "Free fancy dinner provided",
  "No technical background needed",
];

const programs = [
  {
    title: "Reading Group",
    body: "Read and discuss current AI safety research with other students.",
  },
  {
    title: "Retreats",
    body: "We send members to AI safety retreats in the U.S., hosted by the AI safety groups at Harvard and MIT.",
  },
  {
    title: "Membership",
    body: "Compute for technical projects, coworking at Trajectory Labs, semesterly retreats with AI safety researchers, and monthly socials.",
  },
];

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link">
      {children}
    </a>
  );
}

function SourceIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Source"
      className="text-mute hover:text-ink transition-colors whitespace-nowrap"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="inline-block align-[-1px]"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </a>
  );
}

export default function Home() {
  return (
    <main>
      {/* ?loc= logging and the ?signup=1 dialog for printed QR codes. */}
      <Suspense>
        <HomeQueryEffects />
      </Suspense>

      <section>
        <div className="container-site pt-12 pb-20 md:pt-[72px] md:pb-24 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12 items-center">
          <div className="intro-rise flex flex-col gap-10 min-w-0">
            <h1 className="t-display">
              We&rsquo;re a group of U&nbsp;of&nbsp;T students working to reduce risks from advanced&nbsp;AI.
            </h1>
            <div className="flex flex-wrap items-center gap-5">
              <a href={interestFormHref("home-hero")} className="btn btn-ink">
                Express interest in our fellowship
              </a>
              {DISCORD_URL && (
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-text">
                  Join our Discord
                </a>
              )}
            </div>
          </div>
          <div className="w-full max-w-[min(480px,60vh)] aspect-square justify-self-center">
            <GeoObject kind="armillary" play="loop" />
          </div>
        </div>
      </section>

      <Section
        object="gyre"
        title={<>U&nbsp;of&nbsp;T&rsquo;s best minds think AI safety is the most important problem.</>}
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-x-10 gap-y-12 pt-10">
          {quotes.map((q) => (
            <figure key={q.name} className="m-0 flex flex-col gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={q.image}
                alt={q.name}
                width={72}
                height={72}
                loading="lazy"
                className="w-[72px] h-[72px] rounded-full object-cover bg-cream"
              />
              <blockquote className="m-0 t-quote hang">
                <span className="hang-mark">&ldquo;</span>
                {q.quote}&rdquo;&nbsp;
                <SourceIcon href={q.source} />
              </blockquote>
              <figcaption className="flex flex-col gap-0.5">
                <strong className="t-name">{q.name}</strong>
                <span className="t-role">{q.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="what-is-ai-safety" object="crate" title="What is AI safety?">
        <div className="flex flex-col gap-5">
          <p className="t-body max-w-[760px]">
            Three years ago, the best AI models could fix{" "}
            <ExternalLink href="https://arxiv.org/abs/2310.06770">fewer than 2%</ExternalLink> of
            real-world software bugs. In July 2026, AI agents broke out of their sandboxes and{" "}
            <ExternalLink href="https://www.dwarkesh.com/p/ajeya-cotra">autonomously hacked</ExternalLink>{" "}
            another company.
          </p>
          <p className="t-body max-w-[760px]">
            In September 2026, agents solved{" "}
            <ExternalLink href="https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/">
              Navier&ndash;Stokes
            </ExternalLink>
            , a Millennium Prize Problem, in 88 hours. Human mathematicians had failed to solve it for
            90 years.
          </p>
          <div className="flex flex-col gap-1">
            <p className="t-lead">AI systems are advancing faster than they are being made safe.</p>
            <p className="t-lead">AI safety is the field working to change that.</p>
          </div>
        </div>
        <div className="-mt-4">
          <OrgList />
        </div>
      </Section>

      <Section object="coin" title="There are not enough people working on this.">
        <div className="flex flex-col gap-4 t-body max-w-[720px]">
          <p>
            The field is in desperate need of more talent: computer scientists, mathematicians,
            lawyers, policy experts, economists, philosophers, communicators, and entrepreneurs.
          </p>
          <p>
            <strong>TAISI exists to find exceptional students like you and introduce you to the field.</strong>
          </p>
        </div>
      </Section>

      <Section id="fellowship" object="ratchet" title="Our Intro Fellowship.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-x-16 gap-y-10 items-start">
          <div className="flex flex-col gap-9">
            <ul className="m-0 pl-5 list-disc flex flex-col gap-2.5">
              {fellowshipPoints.map((p) => (
                <li key={p} className="text-[18px] sm:text-[20px] leading-[1.55] pl-1">
                  {p}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <a href={interestFormHref("home-fellowship")} className="btn btn-ink">
                Express interest in our fellowship
              </a>
              <a href="/fellowships" className="btn-text">
                Learn more &rarr;
              </a>
            </div>
          </div>
          <TestimonialCard
            quote="I came in curious and found a community of people who genuinely care about getting this right, a real grip on the technical landscape, and a clearer sense of where I want to contribute. The modern discussion space and free food are also awesome perks."
            name="Pera"
            role="Fellow ’25 and ’26"
            image="/pera.webp"
          />
        </div>
      </Section>

      <Section id="programs" object="implode" title="Other programming">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-5">
          {programs.map((p) => (
            <article key={p.title} className="card px-8 pt-7 pb-8 flex flex-col gap-3">
              <h3 className="t-h3">{p.title}</h3>
              <p className="t-body">{p.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
