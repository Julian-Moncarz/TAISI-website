"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Lockup } from "./Logo";
import { DISCORD_URL, interestFormHref } from "@/lib/links";
import { subscribeEmail } from "@/lib/subscribe";

// Pages that are themselves the next step, where a "go and express interest"
// block would send people away from the form they are filling in.
const NO_CTA = ["/interest", "/september-fellowship"];

function FooterEmailForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await subscribeEmail(email, "footer");
      setDone(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p className="text-[15px] text-cream/75">You&rsquo;re on the list.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="footer-email" className="text-[14px] text-cream/75">
        Mailing list
      </label>
      <div className="flex gap-2">
        <input
          id="footer-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@mail.utoronto.ca"
          className="form-input field-pill flex-1 min-w-0"
        />
        <button type="submit" disabled={submitting} className="btn btn-cream btn-sm">
          {submitting ? "Joining" : "Join"}
        </button>
      </div>
      {error && <p className="text-[13px] text-gold">{error}</p>}
    </form>
  );
}

// Two short columns, so the links never need more width than a phone has.
// The email address is the way to get in touch; there is no contact form.
const columns = [
  [
    { href: "/fellowships", label: "Fellowship" },
    { href: "/team", label: "Team" },
  ],
  [{ href: "mailto:joseph@taisi.ca", label: "joseph@taisi.ca" }],
];

export default function Footer() {
  const pathname = usePathname();
  const cta = !NO_CTA.includes(pathname);

  return (
    <footer id="join" className="on-dark bg-ink text-cream">
      <div className={`container-site pb-14 flex flex-col gap-20 md:gap-[120px] ${cta ? "pt-[88px] md:pt-32" : "pt-16"}`}>
        {cta && (
          <div className="flex flex-col gap-10">
            <h2 className="t-section">Interested in the Winter Fellowship?</h2>
            <div className="flex flex-wrap items-center gap-5">
              <a href={interestFormHref("footer")} className="btn btn-gold">
                Express interest
              </a>
              {DISCORD_URL && (
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-text">
                  Join our Discord
                </a>
              )}
            </div>
          </div>
        )}

        {/* Logo, links and signup share one bottom line on desktop; below
            1024px the signup drops to its own row. */}
        <div
          className={`grid gap-10 lg:grid-cols-[1fr_auto_320px] lg:items-end lg:gap-16 ${
            cta ? "pt-10 border-t border-cream/15" : ""
          }`}
        >
          <Lockup size={60} tone="dark" />
          <div className="flex gap-12 text-[15px] whitespace-nowrap">
            {columns.map((col, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                {col.map(({ href, label }) => (
                  <a key={href} href={href} className="text-cream/75 hover:text-gold transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="w-full max-w-[420px] lg:max-w-none">
            <FooterEmailForm />
          </div>
        </div>
      </div>
    </footer>
  );
}
