"use client";

import React, { useState, FormEvent } from "react";

export default function QRPage() {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError("");
    setEmailSubmitting(true);

    const email = new FormData(e.currentTarget).get("email") as string;
    setSubmittedEmail(email);

    try {
      const res = await fetch("/api/qr-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "lecture" }),
      });

      if (!res.ok) throw new Error("Failed");
      setEmailSubmitted(true);
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setEmailSubmitting(false);
    }
  }

  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        {!emailSubmitted ? (
          <div>
            <h1 className="text-[1.75rem] sm:text-[2.25rem] leading-[1.15] tracking-tight mb-8 font-normal">
              TAISI <span className="text-accent">Summer Intensive</span>
            </h1>

            <form onSubmit={handleEmailSubmit}>
              {emailError && (
                <p className="text-accent text-[15px] font-medium mb-3">{emailError}</p>
              )}
              <input
                type="email"
                name="email"
                required
                placeholder="you@mail.utoronto.ca"
                className="form-input mb-4"
              />
              <button
                type="submit"
                disabled={emailSubmitting}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailSubmitting ? "..." : "Send me the info"}
              </button>
            </form>
          </div>
        ) : (
          <div className="border border-black/20 p-6 sm:p-8 max-w-[500px]">
            <h2 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-navy tracking-tight mb-3">
              Got it. Check your inbox (and spam).
            </h2>
            <p className="text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary mb-5">
              Want to get ahead? Apply now &mdash; it takes about 3 minutes.
            </p>
            <a
              href={`/summer-intensive?email=${encodeURIComponent(submittedEmail)}#apply`}
              className="inline-flex items-center px-5 sm:px-6 py-3 bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover transition-colors"
            >
              Apply now &rarr;
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
