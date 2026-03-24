"use client";

import React, { useState, FormEvent } from "react";

export default function QRPage() {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError("");
    setEmailSubmitting(true);

    const email = new FormData(e.currentTarget).get("email") as string;

    try {
      const res = await fetch("/api/qr-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      <section className="max-w-[480px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        {!emailSubmitted ? (
          <div>
            <h1 className="text-[1.75rem] sm:text-[2.25rem] leading-[1.15] tracking-tight mb-5 font-normal">
              TAISI <span className="text-accent">Summer Intensive</span>
            </h1>

            <p className="text-[16px] sm:text-[17px] leading-[1.6] text-text mb-8">
              Drop your email and we will send you the details.
            </p>

            <form onSubmit={handleEmailSubmit}>
              {emailError && (
                <p className="text-accent text-[14px] font-medium mb-3">{emailError}</p>
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
                {emailSubmitting ? "..." : "Get the details"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h1 className="text-[1.75rem] sm:text-[2.25rem] leading-[1.15] tracking-tight mb-4 font-normal">
              Thanks! We will send you the details.
            </h1>
            <p className="text-[17px] sm:text-[19px] leading-[1.7] text-text mb-8">
              Want to apply right now? Takes like 3 minutes 😄
            </p>
            <a
              href="/summer-intensive#apply"
              className="inline-flex items-center px-6 py-3 bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover transition-colors"
            >
              Apply now &rarr;
            </a>
          </div>
        )}
      </section>

      <style jsx global>{`
        .form-input {
          display: block;
          width: 100%;
          padding: 0.625rem 0.75rem;
          font-size: 15px;
          line-height: 1.5;
          color: var(--color-text);
          background-color: white;
          border: 1px solid rgba(26, 26, 26, 0.2);
          transition: border-color 0.15s ease;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 1px var(--color-accent);
        }
        .form-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </main>
  );
}
