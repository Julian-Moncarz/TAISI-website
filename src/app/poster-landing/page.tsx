"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";

function PosterLandingInner() {
  const params = useSearchParams();
  const location = params.get("loc") || "unknown";
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const scanRecordId = useRef<string | null>(null);
  const logged = useRef(false);

  // Log the anonymous scan on page load
  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    fetch("/api/poster-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    })
      .then((r) => r.json())
      .then((d) => {
        scanRecordId.current = d.recordId ?? null;
      })
      .catch(() => {});
  }, [location]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Update the existing scan record with the email
      if (scanRecordId.current) {
        await fetch("/api/poster-scan", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: scanRecordId.current, email }),
        }).catch(() => {});
      }

      // Also add to the Email List
      const res = await fetch("/api/qr-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "poster" }),
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
      <main>
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
          <h1 className="text-[1.75rem] sm:text-[2.25rem] leading-[1.15] tracking-tight mb-4 font-normal">
            Thanks! We&rsquo;ll send you the details.
          </h1>
          <p className="text-[17px] sm:text-[19px] leading-[1.7] text-text mb-8">
            Want to apply right now? Takes about 3 minutes.
          </p>
          <a
            href="/summer-intensive#apply"
            className="inline-flex items-center px-6 py-3 bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover transition-colors"
          >
            Apply now &rarr;
          </a>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-16">
        {/* Headline + email — must be above the fold */}
        <h1 className="text-[1.5rem] sm:text-[2rem] md:text-[2.5rem] leading-[1.15] tracking-tight mb-3 font-normal">
          TAISI{" "}
          <span className="text-accent">Summer Intensive</span>
        </h1>
        <p className="text-[17px] sm:text-[18px] leading-[1.6] text-text mb-5">
          AI safety is possibly the most pressing issue of our time, it needs more researchers, and we have a bunch of money to spend on making you into those cracked researchers. This summer, we&rsquo;re running a weekend intensive where you learn AI safety research skills and leave with real projects for your portfolio.
          </p>
          <p className="text-[17px] sm:text-[18px] leading-[1.6] text-text mb-5">
          Drop your email and we&rsquo;ll send you the details.
        </p>

        <form onSubmit={handleSubmit} className="max-w-[400px] mb-4">
          {error && (
            <p className="text-accent text-[14px] font-medium mb-3">{error}</p>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@mail.utoronto.ca"
            className="block w-full px-4 py-3 text-[16px] border border-black/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent mb-3"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center px-6 py-3 bg-accent text-white text-[16px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? "..." : "Send me the info"}
          </button>
        </form>


        {/* Pitch — scrollable below the fold */}
        <hr className="border-t border-black/10 mb-8" />

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
            The program
          </h2>
          <p>
            Mornings are discussions on threat models, mechanistic interpretability, RLHF, scalable oversight, and more. Afternoons are technical sessions where you leave with a GitHub repo or technical writeup. Compute and API credits covered.
          </p>
          <ul className="space-y-2 pl-0 list-none">
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>One Saturday or Sunday per week &mdash; <strong>compatible with internships or jobs</strong></span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Hosted at an off-campus AI safety lab near King Station</span>
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
          <p>
            No ML background needed. <strong>If you&rsquo;re a smart, hardworking student, we want you.</strong>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function PosterLanding() {
  return (
    <Suspense>
      <PosterLandingInner />
    </Suspense>
  );
}
