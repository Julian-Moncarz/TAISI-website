"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeEmail } from "@/lib/subscribe";

// Opened by the QR links, which land on the home page with ?signup=1. Someone
// standing at a booth with a phone in one hand gets the email field straight
// away instead of hunting for it in the hero.
export default function EmailSignupModal({ source }: { source: string }) {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    // Hold the page still behind the dialog so a stray scroll on a phone does
    // not drag the site around underneath it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await subscribeEmail(email, source);
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
    >
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className="intro-fade absolute inset-0 bg-[#1A1A1A]/45"
      />

      <div
        className="intro-rise relative w-full max-w-[440px] bg-white border border-black/10 shadow-[0_20px_60px_rgba(26,26,26,0.22)] px-6 py-7 sm:px-8 sm:py-8"
        style={{ animationDuration: "420ms" }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 p-2 text-text-secondary/60 hover:text-text transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {done ? (
          <>
            <h2 id="signup-modal-title" className="text-navy text-[22px] font-semibold mb-2">
              You&rsquo;re on the list
            </h2>
            <p className="text-[16px] leading-[1.6] text-text-secondary mb-6">
              We just sent a confirmation to {email}. Have a look around while
              you&rsquo;re here.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cta-base cta-outline rounded-full px-6 py-[11px] text-[16px]"
            >
              Browse the site
            </button>
          </>
        ) : (
          <>
            <h2 id="signup-modal-title" className="text-navy text-[22px] font-semibold mb-2">
              Join our mailing list
            </h2>
            <p className="text-[16px] leading-[1.6] text-text-secondary mb-5">
              We&rsquo;ll keep you posted on upcoming programs, events, and
              opportunities in AI safety.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@gmail.com"
                className="field-pill"
              />
              <button
                type="submit"
                disabled={submitting}
                className="cta-base cta-solid rounded-full px-6 py-[11px] text-[16px]"
              >
                {submitting ? "..." : "Sign up"}
              </button>
              {error && (
                <p className="text-accent text-[14px] font-medium">{error}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
