"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

const LABEL = "block text-[14px] font-medium text-text mb-1.5";

// Matches the check the API route runs, so the two cannot disagree.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ReachOut() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address so we can reply.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Failed"
          ? err.message
          : "Something went wrong. Email us at joseph@taisi.ca instead."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <Reveal>
          <h1 className="hero-title text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-4 sm:mb-6 font-semibold">
            <span className="text-text">Reach out</span>
          </h1>
        </Reveal>

        {sent ? (
          <Reveal delay={120}>
            <div className="mt-8 max-w-[560px] border border-accent p-6">
              <p className="text-[17px] font-semibold text-navy">
                Message sent.
              </p>
              <p className="mt-2 text-[15px] leading-[1.6] text-text-secondary">
                Thanks for getting in touch. We will reply to {email}.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={120}>
            <form onSubmit={handleSubmit} className="mt-2 max-w-[560px]">
              <div className="mb-5">
                <label htmlFor="contact-name" className={LABEL}>
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="form-input"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="contact-email" className={LABEL}>
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="form-input"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="contact-message" className={LABEL}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="form-input resize-y"
                />
              </div>

              {/* Honeypot: hidden from people, tempting to bots. */}
              <div aria-hidden className="hidden">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="cta-base cta-solid rounded-full px-6 py-[11px] text-[16px]"
              >
                {submitting ? "Sending..." : "Send message"}
              </button>

              {error && (
                <p className="mt-3 text-[14px] text-accent">{error}</p>
              )}
            </form>
          </Reveal>
        )}
      </section>
    </main>
  );
}
