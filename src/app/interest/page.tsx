"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FormField, RequiredFieldsNote, SuccessPanel } from "@/components/FormControls";
import PageHero from "@/components/PageHero";

// The Program field in Airtable. The Intensive was cut in September 2026, so
// every signup is for the fellowship now; the field is kept so older rows,
// which also hold "Intensive" and "Both", stay comparable.
const PROGRAM = "Fellowship";

// Matches the check the API route runs, so the two cannot disagree.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const EMAIL_ERROR = "Enter a valid email address so we can reach you.";

export default function Interest() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [year, setYear] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Read on the client rather than through useSearchParams, so the page
  // still renders statically. Same approach as /september-fellowship.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSource(params.get("from") || "website");
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      setError(EMAIL_ERROR);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          program: PROGRAM,
          affiliation,
          year,
          source,
          company,
        }),
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
      <PageHero title="Express interest" object="telescope" play="mount">
        <p className="t-body max-w-[560px]">
          We will email you when applications for the Winter Fellowship open.
        </p>
        {sent ? (
            <div className="max-w-[560px]">
              <SuccessPanel title="You’re on the list.">
                <p>We will email {email} when applications for the fellowship open.</p>
              </SuccessPanel>
            </div>
          ) : (
            <div className="max-w-[560px]">
              <RequiredFieldsNote />

              <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                <FormField label="Name" required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    aria-invalid={error === EMAIL_ERROR || undefined}
                    aria-describedby={error ? "interest-error" : undefined}
                    className="form-input"
                  />
                </FormField>

                <FormField label="School or workplace" hint="Optional.">
                  <input
                    type="text"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    autoComplete="organization"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Year of study" hint="Optional, if you are a student.">
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="form-input"
                  />
                </FormField>

                {/* Honeypot: hidden from people, tempting to bots. */}
                <div aria-hidden className="hidden">
                  <label htmlFor="interest-company">Company</label>
                  <input
                    id="interest-company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-ink-solid"
                  >
                    {submitting ? "Sending..." : "Express interest"}
                  </button>
                </div>

                {error && (
                  <p id="interest-error" role="alert" className="text-[13px] text-rose">
                    {error}
                  </p>
                )}
              </form>
            </div>
          )}
      </PageHero>
    </main>
  );
}
