"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import RotatingText from "@/components/RotatingText";

function EmailCapture({ location }: { location: string | null }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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
      <div className="mt-8 border border-black/20 p-6 sm:p-8">
        <h2 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-text tracking-normal mb-3">
          You&rsquo;re on the list.
        </h2>
        <p className="text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary">
          We&rsquo;ll keep you posted on upcoming programs, events, and opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-black/20 p-6 sm:p-8">
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="text-accent text-[15px] font-medium mb-3">{error}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@mail.utoronto.ca"
            className="form-input flex-1"
          />
          <button
            type="submit"
            disabled={submitting}
            className="primary-cta shrink-0 px-6 py-3 text-[16px]"
          >
            {submitting ? "..." : "Join our mailing list"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ResearchGrid() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 text-[17px] sm:text-[19px] text-text-secondary hover:text-navy transition-colors group"
      >
        <span
          className="text-accent font-bold text-[17px] sm:text-[19px] transition-transform duration-200"
          style={{ display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          &#8594;
        </span>
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
      <section className="relative max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 pb-24 min-h-[calc(100svh-4rem)] flex flex-col justify-center">
        <div className="-translate-y-[3vh] sm:-translate-y-[4vh]">
          <h1
            className="hero-title intro-rise text-[2.25rem] sm:text-[3.15rem] md:text-[4.5rem] leading-[0.98] tracking-normal mb-7 sm:mb-8 md:mb-10 font-semibold"
            style={{ animationDelay: "150ms" }}
          >
            We train exceptional students to become AI safety{" "}
            <RotatingText />
          </h1>

          <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text">
            <p className="intro-rise" style={{ animationDelay: "1400ms" }}>
              AI systems are advancing faster than we can make them safe.
            </p>
            <p className="intro-rise" style={{ animationDelay: "2400ms" }}>
              The field needs more people.
            </p>
            <p className="intro-rise" style={{ animationDelay: "3400ms" }}>
              We are a sister organization to AI safety groups at MIT, Harvard, and Cambridge.
            </p>
          </div>

          <div className="intro-rise mt-8 sm:mt-10" style={{ animationDelay: "3800ms" }}>
            <a
              href="/summer-intensive"
              className="primary-cta px-7 py-3.5 text-[15px] sm:text-[16px]"
            >
              Express interest in our August cohort
            </a>
          </div>
        </div>

        <div
          className="intro-fade absolute bottom-8 left-0 right-0 flex justify-center"
          style={{ animationDelay: "3900ms" }}
        >
          <a
            href="#mailing-list"
            aria-label="Scroll to next section"
            className="text-text-secondary/40 hover:text-text-secondary transition-colors"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Mailing list */}
      <section id="mailing-list" className="scroll-mt-20 max-w-[1200px] mx-auto px-5 sm:px-8 pt-12 md:pt-16 pb-8 md:pb-10">
        <EmailCapture location={location} />
      </section>

      {/* What is AI safety? */}
      <section id="what-is-ai-safety" className="scroll-mt-20 max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 md:pt-12 pb-8 md:pb-10">
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
            <strong>That&rsquo;s why we exist:</strong> we have funding to find exceptional students like you, introduce you to AI safety, and train you into the cracked researchers that the field desperately needs.
          </p>
          <p>
            If you care about careers, there are exceptional careers to be made in AI safety. If you care about impact, this is a chance to have a critical impact on the world. This is the cutting edge.
          </p>
        </div>

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

      {/* What do we run? */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-3 md:pt-5 pb-8 md:pb-10">
        <div className="space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text">
          <h2 className="section-header">What do we run?</h2>
          <p>
            <a href="/fellowships" className="text-accent hover:underline">Fellowship</a> applications reopen late summer.
          </p>
          <p>
            <a href="/summer-intensive" className="text-accent hover:underline">Intensive</a> expressions of interest are open for our working professionals cohort this August.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-3 md:pt-5 pb-8 md:pb-10">
        <h2 className="section-header mb-6 sm:mb-8">
          What our fellows say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {testimonials.map((t, i) => (
            <blockquote key={i} className="border-l border-accent pl-5">
              <p className="text-[15px] sm:text-[16px] leading-[1.7] text-text mb-4">
                {t.quote}
              </p>
              <footer className="flex items-center gap-3">
                {t.image ? (
                  <Image src={t.image} alt={t.name} width={64} height={64} className="w-16 h-16 object-cover shrink-0" style={t.imagePosition ? { objectPosition: t.imagePosition } : { objectPosition: "top" }} />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 shrink-0" />
                )}
                <div>
                  <span className="block text-[15px] font-semibold text-text">
                    {t.name}
                  </span>
                  <span className="block text-[13px] text-text-secondary">
                    {t.role}
                  </span>
                </div>
              </footer>
            </blockquote>
          ))}
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

const testimonials = [
  {
    quote:
      "I came in curious and found a community of people who genuinely care about getting this right, a real grip on the technical landscape, and a clearer sense of where I want to contribute. The modern discussion space and free food are also awesome perks. These fellowships have given me a foundation for thinking about AI safety that I carry into everything I work on.",
    name: "Pera",
    role: "Fellow '25 and '26",
    image: "/pera.webp",
  },
  {
    quote:
      "I participated in a fellowship last fall, and I absolutely loved it! The fellowship gave me a friendly and passionate environment in which to explore recent research in AI alignment techniques during meals with other students. Since the fellowship, I've continued to develop my skills alongside these students, and have become much more informed and capable of working to improve AI safety.",
    name: "Boyan",
    role: "Fellow '25",
    image: "/boyan.png",
    imagePosition: "center 20%",
  },
];

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
