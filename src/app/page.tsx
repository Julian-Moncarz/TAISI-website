import { Suspense } from "react";
import Image from "next/image";
import Section from "@/components/Section";
import GeoObject from "@/components/geo/GeoObject";
import HomeQueryEffects from "@/components/HomeQueryEffects";
import OrgList from "@/components/OrgList";
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

// The ways in, membership first: TAISI is a community, and the fellowship is
// the usual way into it. Photos are from the Fall 2026 retreat.
const waysIn = [
  {
    id: "membership",
    title: "Membership",
    body: "Members get compute for technical projects, coworking at Trajectory Labs, a retreat with AI safety researchers each semester, and monthly socials. We also send members to retreats hosted by the AI safety groups at Harvard and MIT. Most members join after a fellowship, and students who have taken MAT1510 or have similar experience can apply directly.",
    photo: "/photos/retreat-conversation.webp",
    alt: "Three TAISI members talking on the grass at the retreat",
    cta: { label: "Apply for membership", href: "mailto:joseph@taisi.ca?subject=TAISI%20membership" },
  },
  {
    id: "fellowship",
    title: "Intro Fellowship",
    body: "Six weeks of readings and dinner discussions at Trajectory Labs, an off-campus AI safety hub near King Station. There is a technical track and a governance track. It takes about three hours a week and needs no technical background.",
    photo: "/photos/retreat-talk.webp",
    alt: "A talk on modelling AI-driven research progress at the TAISI retreat",
    cta: { label: "Express interest in our fellowship", href: interestFormHref("home-programs") },
    more: "/fellowships",
  },
  {
    id: "reading-group",
    title: "Reading group",
    body: "Read and discuss current AI safety research with other students.",
    photo: "/photos/retreat-audience.webp",
    alt: "TAISI members listening to a talk at the retreat",
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
        <div className="container-site pt-12 pb-20 md:pt-[72px] md:pb-24 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] gap-x-16 gap-y-12 items-center">
          <div className="intro-rise flex flex-col gap-10 min-w-0">
            <h1 className="t-display">
              A community for U&nbsp;of&nbsp;T&rsquo;s most ambitious students to work on AI&nbsp;safety.
            </h1>
            <div className="flex flex-wrap items-center gap-5">
              <a href={interestFormHref("home-hero")} className="btn btn-ink">
                Express interest in our fellowship
              </a>
              {/* Shown before the invite exists, pointing nowhere. Set
                  DISCORD_URL in src/lib/links.ts and it opens the invite. */}
              <a
                href={DISCORD_URL || "#"}
                {...(DISCORD_URL ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="btn btn-ink"
              >
                Join our Discord
              </a>
            </div>
          </div>
          {/* Kept to the size of the other pages' hero objects, so the
              headline leads and the object sits beside it. */}
          <div className="w-full max-w-[200px] md:max-w-[min(320px,45vh)] aspect-square justify-self-center">
            <GeoObject kind="armillary" play="loop" />
          </div>
        </div>
      </section>

      <Section
        object="gyre"
        title={<>U&nbsp;of&nbsp;T&rsquo;s best think AI safety is the most important problem.</>}
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
            <ExternalLink href="https://www.youtube.com/watch?v=ujkD4SxPKOI">autonomously hacked</ExternalLink>{" "}
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
          <ul className="m-0 pl-6 list-disc flex flex-col gap-2 t-lead marker:text-[0.6em]">
            <li className="pl-1">Soon, AI systems could be smarter than humans.</li>
            <li className="pl-1">If that happens, they could harm, kill or disempower many people.</li>
            <li className="pl-1">AI safety is the field working to stop that from happening.</li>
          </ul>
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

      {/* Copy carried over from the pre-redesign home page. */}
      <Section id="why-get-involved" object="implode" title="Why get involved?">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,460px)] gap-x-16 gap-y-10 items-center">
          <div className="flex flex-col gap-5 t-lead">
            <p>
              If you care about <strong className="font-semibold">careers</strong>, there are
              exceptional careers to be made in AI safety.
            </p>
            <p>
              If you care about <strong className="font-semibold">impact</strong>, this is a chance to
              have a critical impact on the world.
            </p>
            <p>
              If you care about <strong className="font-semibold">community</strong> or making
              friends, we have one of the kindest, tightest-knit communities on campus :)
            </p>
          </div>
          <div className="card relative aspect-[3/2] overflow-hidden !bg-cream">
            <Image
              src="/photos/retreat-friends.webp"
              alt="Three TAISI members smiling together outdoors at the retreat"
              fill
              sizes="(min-width: 768px) 460px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section id="programs" object="ratchet" title="Our programs">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
          {waysIn.map((w) => (
            <article id={w.id} key={w.id} className="card overflow-hidden flex flex-col scroll-mt-[96px]">
              <div className="relative aspect-[3/2] bg-cream">
                <Image src={w.photo} alt={w.alt} fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
              </div>
              <div className="px-8 pt-7 pb-8 flex flex-col gap-3 flex-1">
                <h3 className="t-h3">{w.title}</h3>
                <p className="t-body">{w.body}</p>
                {w.cta && (
                  <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <a href={w.cta.href} className="btn btn-ink btn-sm">
                      {w.cta.label}
                    </a>
                    {w.more && (
                      <a href={w.more} className="btn-text">
                        Learn more &rarr;
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
