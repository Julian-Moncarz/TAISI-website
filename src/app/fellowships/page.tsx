import TestimonialRow, { type Testimonial } from "@/components/TestimonialRow";
import HeroBackdrop from "@/components/HeroBackdrop";
import { FELLOWSHIP_APPLY_URL, FELLOWSHIP_DEADLINE } from "@/lib/links";

const fellowTestimonials: Testimonial[] = [
  {
    quote:
      "I participated in a fellowship last fall, and I absolutely loved it! The fellowship gave me a friendly and passionate environment in which to explore recent research in AI alignment techniques during meals with other students. Since the fellowship, I've continued to develop my skills alongside these students, and have become much more informed and capable of working to improve AI safety.",
    name: "Boyan",
    role: "Fellow '25",
    image: "/boyan.webp",
    imagePosition: "center 20%",
  },
  {
    quote:
      "Going in, I had some interest in AI safety but little idea how it shows up in real research or how someone technical like me could contribute. The curriculum and weekly discussions gave me a much clearer sense of the field, and I enjoyed the sushi.",
    name: "Divy",
    role: "Fellow '25",
    image: "/divy.webp",
  },
  {
    quote:
      "I came in curious and found a community of people who genuinely care about getting this right, a real grip on the technical landscape, and a clearer sense of where I want to contribute. The modern discussion space and free food are also awesome perks. These fellowships have given me a foundation for thinking about AI safety that I carry into everything I work on.",
    name: "Pera",
    role: "Fellow '25 and '26",
    image: "/pera.webp",
  },
];

// Answers hold JSX rather than strings, since the first one carries a link.
const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "What if I don't have a technical background?",
    a: (
      <>
        None of our fellowship streams require a technical background. Both will
        introduce you to the field of AI safety, with a focus on technical and
        governance aspects depending on the stream. We&rsquo;ll focus mostly on
        the conceptual arguments for why we might expect misalignment and why it
        might be a hard problem. For the technical stream, we recommend watching{" "}
        <a
          href="https://www.youtube.com/watch?v=aircAruvnKk"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-amber-deep"
        >
          3B1B: But What is a Neural Network?
        </a>{" "}
        to get some high-level intuition for how deep learning works. There
        won&rsquo;t be any coding though.
      </>
    ),
  },
  {
    q: "What is the expected time commitment?",
    a: (
      <>
        Around 3 hours per week. There will be around 1-1.5 hours of readings per
        week, and a 1.5 hour dinner meeting with your cohort to strengthen your
        understanding of each week&rsquo;s material.
      </>
    ),
  },
  {
    q: "Where will the dinner meetings be held?",
    a: <>At Trajectory Labs, close to King station.</>,
  },
  {
    q: "When does the reading group start?",
    a: <>The fall iteration will begin the week of September 20th.</>,
  },
  {
    q: "I have a question that wasn't answered here. Is there anyone I can reach out to?",
    a: (
      <>
        For sure! Send an email to{" "}
        <a
          href="mailto:joseph@taisi.ca"
          className="underline underline-offset-2 hover:text-amber-deep"
        >
          joseph@taisi.ca
        </a>{" "}
        and we&rsquo;ll get back asap.
      </>
    ),
  },
];

export default function Fellowships() {
  return (
    <main>
      <section className="relative">
        {/* The drawing is pinned to the viewport and fades out as the page
            scrolls, the same treatment as the skyline on the homepage. */}
        <HeroBackdrop fadeOverScreens={0.75}>
          {/* Observatory drawing, anchored to the right edge of the screen.
              It is drawn taller than the viewport, so the band crops it to
              the right-hand part of the sketch. */}
          <div
            aria-hidden
            className="art-fade hidden sm:block absolute inset-y-0 right-0 w-[62%] bg-no-repeat"
            style={{
              backgroundImage: "url('/hero-observatory.webp')",
              backgroundPosition: "right center",
              backgroundSize: "auto 114%",
            }}
          />
          {/* Fades the drawing into the page on every edge */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-white from-40% via-white/75 via-70% to-white/40"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white"
          />
        </HeroBackdrop>

        <div className="intro-rise relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-8 md:pb-12">
        <div>
          <h1 className="hero-title text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-6 sm:mb-8 font-semibold">
            <span className="text-text">Fellowship</span>
          </h1>
        </div>

        <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text max-w-[820px]">
          <div>
            <p>
              <strong className="font-semibold text-accent">
                Applications are now open for our intro fellowship.
              </strong>
            </p>
          </div>
          <div>
            <p>
              We offer two parallel introductory fellowships:{" "}
              AI Safety Fundamentals and AI Governance.
            </p>
          </div>
          <div>
            <p>
              The fundamentals track introduces the technical challenge of making
              AI systems reliably follow human intentions, while the governance
              track examines the role of policy, institutions, and global
              coordination to reduce AI risks. Both cover forecasting how the
              technology develops.
            </p>
          </div>
          <div>
            <p>
              Fellowships run weekly for 6 sessions, paper discussions over
              free, fancy dinner at Trajectory Labs, an off-campus AI safety
              hub.
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-7">
        <a
          href={FELLOWSHIP_APPLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="card-cta"
          style={
            {
              "--cta-fg": "#501684",
              "--cta-hover-bg": "#501684",
              "--cta-hover-fg": "#FFFFFF",
            } as React.CSSProperties
          }
        >
          Apply by {FELLOWSHIP_DEADLINE}
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
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </a>
        </div>

        <div className="mt-8 sm:mt-10">
          <TestimonialRow items={fellowTestimonials} title="Our fellows" />
        </div>

        <hr className="mt-8 sm:mt-10 border-t border-gray-200" />

        <div>
          <p className="mt-6 sm:mt-8 text-[14px] leading-[1.6] text-text-secondary">
            Curriculum adapted from BlueDot Impact.
          </p>
        </div>

        <div className="mt-6 sm:mt-8 grid sm:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <h2 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-text tracking-normal mb-1">
              AI Safety Fundamentals
            </h2>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-4">6 weeks</p>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-3">Topics include:</p>
            <ul className="space-y-1.5 text-[17px] sm:text-[19px] text-text-secondary list-disc pl-5">
              <li>Intro to deep learning (first session only)</li>
              <li>Forecasting</li>
              <li>Reinforcement learning from human feedback</li>
              <li>Scalable oversight</li>
              <li>Mechanistic interpretability</li>
              <li>Technical governance</li>
              <li>Contributing to technical AI safety</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-text tracking-normal mb-1">
              AI Governance
            </h2>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-4">6 weeks</p>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-3">Topics include:</p>
            <ul className="space-y-1.5 text-[17px] sm:text-[19px] text-text-secondary list-disc pl-5">
              <li>Forecasting</li>
              <li>Overview of key actors</li>
              <li>Identifying levers for effective policy frameworks</li>
              <li>Governance at frontier labs</li>
              <li>Canada&rsquo;s role in international cooperation</li>
              <li>Contributing to AI governance</li>
            </ul>
          </div>
        </div>

        <hr className="mt-10 sm:mt-12 border-t border-gray-200" />

        {/* A description list rather than stacked headings: the pairing is the
            point, and it reads as question and answer to a screen reader. */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-text tracking-normal mb-5 sm:mb-6">
            FAQ
          </h2>
          <dl className="max-w-[760px] space-y-6 sm:space-y-7">
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <dt className="text-[17px] sm:text-[19px] font-semibold text-text mb-1.5">
                  {q}
                </dt>
                <dd className="text-[17px] sm:text-[19px] leading-[1.6] text-text-secondary">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        </div>
      </section>
    </main>
  );
}
