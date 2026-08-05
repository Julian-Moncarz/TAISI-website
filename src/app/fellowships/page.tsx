import TestimonialRow, { type Testimonial } from "@/components/TestimonialRow";
import { NOTIFY_FORM_URL } from "@/lib/links";

const fellowTestimonials: Testimonial[] = [
  {
    quote:
      "I participated in a fellowship last fall, and I absolutely loved it! The fellowship gave me a friendly and passionate environment in which to explore recent research in AI alignment techniques during meals with other students. Since the fellowship, I've continued to develop my skills alongside these students, and have become much more informed and capable of working to improve AI safety.",
    name: "Boyan",
    role: "Fellow '25",
    image: "/boyan.png",
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

export default function Fellowships() {
  return (
    <main>
      <section className="relative overflow-hidden">
        {/* Observatory drawing, anchored to the right edge of the viewport */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-[62%] bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-observatory.webp')",
            backgroundPosition: "right -70px",
            backgroundSize: "auto 72%",
          }}
        />
        {/* Fades the drawing into the page on every edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white from-40% via-white/75 via-70% to-white/40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white"
        />

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-8 md:pb-12">
        <h1 className="hero-title text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-6 sm:mb-8 font-semibold">
          <span className="text-text">Fellowship</span>
        </h1>

        <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text max-w-[820px]">
          <p>
            We offer two parallel introductory fellowships in AI safety:{" "}
            alignment and governance.
          </p>
          <p>
            The alignment track introduces the technical challenge of making AI
            systems reliably follow human intentions, while the governance track
            examines the role of policy, institutions, and global coordination to
            reduce AI risks.
          </p>
          <p>
            Fellowships run weekly over dinner for 6 sessions in the form of
            paper discussions.
          </p>
        </div>

        <a
          href={NOTIFY_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="card-cta mt-6 sm:mt-7"
          style={
            {
              "--cta-fg": "#D94F30",
              "--cta-hover-bg": "#D94F30",
              "--cta-hover-fg": "#FFFFFF",
            } as React.CSSProperties
          }
        >
          Notify me when applications open
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

        <div className="mt-8 sm:mt-10">
          <TestimonialRow items={fellowTestimonials} title="Our fellows" />
        </div>

        <hr className="mt-8 sm:mt-10 border-t border-gray-200" />

        <p className="mt-6 sm:mt-8 text-[14px] leading-[1.6] text-text-secondary">
          Curriculum adapted from BlueDot Impact.
        </p>

        <div className="mt-6 sm:mt-8 grid sm:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <h2 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-text tracking-normal mb-1">
              Governance Fellowship
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

          <div>
            <h2 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-text tracking-normal mb-1">
              Alignment Fellowship
            </h2>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-4">6 weeks</p>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-3">Topics include:</p>
            <ul className="space-y-1.5 text-[17px] sm:text-[19px] text-text-secondary list-disc pl-5">
              <li>Intro to deep learning (first session only)</li>
              <li>Reinforcement learning from human feedback</li>
              <li>Scalable oversight</li>
              <li>Mechanistic interpretability</li>
              <li>Technical governance</li>
              <li>Contributing to technical AI safety</li>
            </ul>
          </div>
        </div>

        </div>
      </section>
    </main>
  );
}
