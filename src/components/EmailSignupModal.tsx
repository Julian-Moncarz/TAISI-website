"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeEmail } from "@/lib/subscribe";

// Opened by the QR links, which land on the home page with ?signup=1. Someone
// standing at a booth with a phone in one hand gets the email field straight
// away instead of hunting for it in the hero.
export default function EmailSignupModal({ source }: { source: string }) {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<"sent" | "error" | null>(null);
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

  // The confirmation clears itself; a failure stays up, since it is the only
  // sign the address did not make it.
  useEffect(() => {
    if (toast !== "sent") return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // The dialog gets out of the way on submit rather than waiting on Airtable,
  // so the site is there the moment the address is typed. The request carries
  // on in the background.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const address = email;
    setOpen(false);
    setToast(null);
    subscribeEmail(address, source).then(
      () => setToast("sent"),
      () => setToast("error"),
    );
  }

  return (
    <>
      {open && (
        // Above the sticky header, which sits at z-100. Anything lower leaves
        // the bar undimmed and draws a hard edge across the top of the page.
        <div
          className="fixed inset-0 z-[200]"
          role="dialog"
          aria-modal="true"
          aria-label="Join our mailing list"
        >
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="intro-fade absolute inset-0 bg-[#1A1A1A]/45"
          />

          {/* Centred in the viewport the phone is actually showing. Pinning
              the card to the bottom put it under the browser's own chrome. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[100dvh] flex items-center justify-center p-4 sm:p-6">
            <div
              className="pointer-events-auto intro-rise relative w-full max-w-[440px] rounded-[12px] bg-white border border-black/10 shadow-[0_20px_60px_rgba(26,26,26,0.22)] px-5 pt-11 pb-5 sm:px-6 sm:pb-6"
              style={{ animationDuration: "420ms" }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-2 right-2 p-2 text-text-secondary/60 hover:text-text transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

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
                  className="cta-base cta-solid rounded-full px-6 py-[11px] text-[16px]"
                >
                  I&rsquo;m interested
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="intro-fade fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] max-w-[calc(100vw-2rem)] rounded-[10px] bg-white border border-black/10 shadow-[0_10px_30px_rgba(26,26,26,0.18)] px-4 py-3 flex items-center gap-3"
        >
          {toast === "sent" ? (
            <p className="text-navy text-[15px] font-medium">
              You&rsquo;re on the list.
            </p>
          ) : (
            <>
              <p className="text-text text-[15px]">
                That didn&rsquo;t go through.
              </p>
              <button
                type="button"
                onClick={() => {
                  setToast(null);
                  setOpen(true);
                }}
                className="text-accent text-[15px] font-semibold hover:underline"
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
