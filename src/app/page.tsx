"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
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
      const res = await fetch("/api/qr-signup", {
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
      <div className="mt-8">
        <p className="text-[17px] sm:text-[19px] text-text mb-4">
          Thanks! We&rsquo;ll send you the details.
        </p>
        <Link
          href="/summer-intensive#apply"
          className="inline-flex items-center px-5 sm:px-6 py-3 bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover transition-colors"
        >
          Apply now &rarr;
        </Link>
        <p className="text-[14px] text-text-secondary mt-2">
          Takes about 3 minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="text-accent text-[14px] font-medium mb-3">{error}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 max-w-[500px]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@mail.utoronto.ca"
            className="flex-1 px-4 py-3 text-[16px] border border-black/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 flex items-center justify-center px-6 py-3 bg-accent text-white text-[16px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? "..." : "Send me the info"}
          </button>
        </div>
      </form>
    </div>
  );
}

function HomeInner() {
  const params = useSearchParams();
  const location = params.get("loc") || null;

  return (
    <main className="md:overflow-hidden">
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-8 md:pb-10">
        <h1 className="text-[2rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[1.15] tracking-tight mb-6 sm:mb-8 font-normal">
          We train exceptional students to become AI safety{" "}
          <RotatingText />
        </h1>

        <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text">
          <p>
            AI safety is possibly the most pressing issue of our time, it needs more researchers, and we have a bunch of money to spend on making you into those cracked researchers.
          </p>
          <p>
            We are a sister organization to AI safety student groups at MIT, Harvard, and Cambridge.
          </p>
          <p>
            This summer, we&rsquo;re running a weekend AI safety intensive. It runs one day a week, we&rsquo;ll buy you lunch, invite AI safety researchers to hang out with you, and you&rsquo;ll leave with finished projects for your portfolio.
          </p>
        </div>

        <EmailCapture location={location} />
      </section>

      {/* Pitch */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-2 md:pt-4 pb-8 md:pb-10">
        <div className="space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text">
          <h2 className="font-semibold text-navy text-[1.35rem] sm:text-[1.5rem] tracking-tight">
            What is AI safety?
          </h2>
          <p>
            AI systems are getting powerful. The US government uses AI for military planning, and wants the ability to have AIs piloting autonomous lethal weapons. These are not just chatbots anymore &mdash; people are putting them in charge of real-world things, with dangerous consequences. And this is the stupidest that the AI will ever be.
          </p>
          <p>
            AI safety asks the question: <strong>&ldquo;how can we make sure the machines don&rsquo;t do bad things?&rdquo;</strong> We think that this is the most pressing problem of our time.
          </p>

          <h2 className="font-semibold text-navy text-[1.35rem] sm:text-[1.5rem] tracking-tight pt-4">
            What&rsquo;s in it for you?
          </h2>
          <p>
            AI safety needs more researchers, and people are pouring money into getting more talent into the field. That&rsquo;s why we exist &mdash; we have funding to find talented students like you, introduce you to AI safety, and train you into the cracked researchers that the field desperately needs.
          </p>
          <p>
            If you care about careers, there are exceptional careers to be made in AI safety. If you care about impact, this is a chance to have a critical impact on the world. This is the cutting edge.
          </p>

          <h2 className="font-semibold text-navy text-[1.35rem] sm:text-[1.5rem] tracking-tight pt-4">
            The Summer Intensive
          </h2>
          <ul className="space-y-2 pl-0 list-none">
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>One Saturday or Sunday per week &mdash; <strong>compatible with internships or other summer commitments</strong></span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Hosted at Trajectory Labs, an off-campus AI safety lab near King Station</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Free lunch, hang out with AI safety researchers</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Top participants get connected to research opportunities after</span>
            </li>
          </ul>
          <h2 className="font-semibold text-navy text-[1.35rem] sm:text-[1.5rem] tracking-tight pt-4">
            Who is this for?
          </h2>
          <p>
            You don&rsquo;t need an ML background or prior engagement with the field. <strong>If you are a smart, hardworking student, we want you.</strong>
          </p>
        </div>

        <div className="mt-8">
          <p className="text-[17px] sm:text-[19px] leading-[1.7] text-text mb-4">
            Drop us your email and we&rsquo;ll send you more program details.
          </p>
          <EmailCapture location={location} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-2 md:pt-4 pb-8 md:pb-10">
        <h2 className="font-semibold text-navy text-[1.35rem] sm:text-[1.5rem] tracking-tight mb-6 sm:mb-8">
          What our fellows say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {testimonials.map((t, i) => (
            <blockquote key={i} className="border-l border-accent pl-5">
              <p className="text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary mb-4">
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
