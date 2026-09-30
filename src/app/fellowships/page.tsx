import TestimonialRow, { type Testimonial } from "@/components/TestimonialRow";
import Section from "@/components/Section";
import PageHero from "@/components/PageHero";
import Accordion, { type AccordionItem } from "@/components/Accordion";
import { interestFormHref } from "@/lib/links";

const fellowTestimonials: Testimonial[] = [
  {
    quote:
      "I participated in a fellowship last fall, and I absolutely loved it! The fellowship gave me a friendly and passionate environment in which to explore recent research in AI alignment techniques during meals with other students. Since the fellowship, I’ve continued to develop my skills alongside these students, and have become much more informed and capable of working to improve AI safety.",
    name: "Boyan",
    role: "Fellow ’25",
    image: "/boyan.webp",
    imagePosition: "center 20%",
  },
  {
    quote:
      "Going in, I had some interest in AI safety but little idea how it shows up in real research or how someone technical like me could contribute. The curriculum and weekly discussions gave me a much clearer sense of the field, and I enjoyed the sushi.",
    name: "Divy",
    role: "Fellow ’25",
    image: "/divy.webp",
  },
  {
    quote:
      "I came in curious and found a community of people who genuinely care about getting this right, a real grip on the technical landscape, and a clearer sense of where I want to contribute. The modern discussion space and free food are also awesome perks. These fellowships have given me a foundation for thinking about AI safety that I carry into everything I work on.",
    name: "Pera",
    role: "Fellow ’25 and ’26",
    image: "/pera.webp",
  },
];

// Answers hold JSX rather than strings, since the first one carries a link.
const faqs: AccordionItem[] = [
  {
    q: "What if I don’t have a technical background?",
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
          className="link"
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
    q: "When does the fellowship start?",
    a: (
      <>
        The Winter fellowship starts in January. Exact dates go out to everyone who{" "}
        <a href={interestFormHref("fellowship-faq")} className="link">
          expresses interest
        </a>
        .
      </>
    ),
  },
  {
    q: "What day and time do sessions run?",
    a: (
      <>
        TAISI will be running multiple cohorts and you&rsquo;ll be placed in the
        cohort that best matches your schedule. We can&rsquo;t guarantee to
        accommodate everyone&rsquo;s schedule, but we&rsquo;ll try our best.
      </>
    ),
  },
  {
    q: "I have a question that wasn’t answered here. Who can I ask?",
    a: (
      <>
        Email{" "}
        <a
          href="mailto:joseph@taisi.ca"
          className="link"
        >
          joseph@taisi.ca
        </a>{" "}
        and we&rsquo;ll get back to you soon.
      </>
    ),
  },
];

const tracks = [
  {
    title: "AI Safety Fundamentals",
    length: "6 weeks",
    topics: [
      "Intro to deep learning (first session only)",
      "Forecasting",
      "Reinforcement learning from human feedback",
      "Scalable oversight",
      "Mechanistic interpretability",
      "Technical governance",
      "Contributing to technical AI safety",
    ],
  },
  {
    title: "AI Governance",
    length: "6 weeks",
    topics: [
      "Forecasting",
      "Overview of key actors",
      "Identifying levers for effective policy frameworks",
      "Governance at frontier labs",
      "Canada\u2019s role in international cooperation",
      "Contributing to AI governance",
    ],
  },
];

export default function Fellowships() {
  return (
    <main>
      <PageHero title="Fellowship" object="weave">
        <div className="flex flex-col gap-4 t-body max-w-[640px]">
          <p>
            We offer two parallel introductory fellowships: AI Safety Fundamentals and AI
            Governance.
          </p>
          <p>
            The fundamentals track introduces the technical challenge of making AI systems reliably
            follow human intentions, while the governance track examines the role of policy,
            institutions, and global coordination to reduce AI risks. Both cover forecasting how the
            technology develops.
          </p>
          <p>
            Fellowships run weekly for 6 sessions of paper discussions at Trajectory Labs, an
            off-campus AI safety hub.
          </p>
        </div>
        <div>
          <a href={interestFormHref("fellowship-hero")} className="btn btn-ink">
            Express interest in the Winter cohort
          </a>
        </div>
      </PageHero>

      <Section object="bounce" title="Our fellows">
        <TestimonialRow items={fellowTestimonials} />
      </Section>

      <Section object="unroll" title="Curriculum">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-x-16 gap-y-12">
          {tracks.map((t) => (
            <div key={t.title} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="t-h3">{t.title}</h3>
                <p className="t-small">{t.length}</p>
              </div>
              <div className="t-body">
                <p className="mb-2">Topics include:</p>
                <ul className="m-0 pl-5 list-disc flex flex-col gap-1.5">
                  {t.topics.map((topic) => (
                    <li key={topic} className="pl-1">
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section object="globe" title="FAQ">
        <div className="max-w-[760px]">
          <Accordion items={faqs} />
        </div>
      </Section>
    </main>
  );
}
