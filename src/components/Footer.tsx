"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p className="text-[13px] text-text-secondary">You&rsquo;re on the list.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-[360px]">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@mail.utoronto.ca"
        className="form-input flex-1 text-[14px]"
      />
      <button
        type="submit"
        disabled={submitting}
        className="primary-cta px-4 py-2 text-[14px] shrink-0"
      >
        {submitting ? "..." : "Join our mailing list"}
      </button>
      {error && (
        <p className="text-accent text-[12px] mt-1 sm:basis-full">{error}</p>
      )}
    </form>
  );
}

const links = [
  { href: "/", label: "Home" },
  { href: "/summer-intensive", label: "Summer Intensive" },
  { href: "/fellowships", label: "Fellowships" },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 mt-20 py-10">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          {/* Brand */}
          <div className="max-w-[320px]">
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/icon.png"
                alt="TAISI"
                width={155}
                height={193}
                className="h-[28px] w-auto"
              />
              <span className="text-[15px] text-text">Toronto AI Safety Initiative</span>
            </div>
            <p className="text-[13px] text-text-secondary leading-[1.6]">
              We train exceptional students to become AI safety researchers.
            </p>
            <a
              href="mailto:julian@taisi.ca"
              className="block mt-3 text-[13px] text-text-secondary hover:text-accent transition-colors"
            >
              julian@taisi.ca
            </a>
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-2 text-[14px]">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-text-secondary hover:text-accent transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mailing list */}
          <div className="md:max-w-[380px] w-full">
            <p className="text-[13px] text-text-secondary mb-2">Mailing list</p>
            <FooterEmailForm />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-black/10 text-[12px] text-text-secondary">
          © 2026 Toronto AI Safety Initiative
        </div>
      </div>
    </footer>
  );
}
