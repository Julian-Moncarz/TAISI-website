"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  FormField,
  RequiredFieldsNote,
  SelectWrapper,
  SuccessPanel,
} from "@/components/FormControls";

// The three values the Program field in Airtable accepts.
const PROGRAMS = ["Fellowship", "Intensive", "Both"] as const;
type ProgramChoice = (typeof PROGRAMS)[number];

// Matches the check the API route runs, so the two cannot disagree.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Buttons across the site carry ?program=, so someone arriving from the
// intensive page finds that already chosen. Anything unrecognised falls
// through to Both, which is the safe answer for a link we did not write.
function readProgram(value: string | null): ProgramChoice {
  const match = PROGRAMS.find((p) => p.toLowerCase() === value?.toLowerCase());
  return match || "Both";
}

export default function Interest() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [program, setProgram] = useState<ProgramChoice>("Both");
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
    setProgram(readProgram(params.get("program")));
    setSource(params.get("from") || params.get("program") || "website");
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address so we can reach you.");
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
          program,
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
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-16 pb-16 md:pb-24">
        {/* Sized as a section heading rather than a page title, matching
            Reach out: at hero size it shouts over a short form. */}
        <h1 className="section-header mb-5 sm:mb-6">Express interest</h1>

        {sent ? (
          <div className="max-w-[560px]">
            <SuccessPanel title="You're on the list." className="mx-0">
              <p>
                We will email {email} when applications open for the{" "}
                {program === "Both" ? "fellowship and the intensive" : program.toLowerCase()}.
              </p>
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
                  className="form-input"
                />
              </FormField>

              <FormField label="Which program" required>
                <SelectWrapper>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value as ProgramChoice)}
                    required
                    className="form-input form-select"
                  >
                    <option value="Fellowship">Fellowship</option>
                    <option value="Intensive">Intensive</option>
                    <option value="Both">Both</option>
                  </select>
                </SelectWrapper>
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
                  className="cta-base cta-solid rounded-full px-6 py-[11px] text-[16px]"
                >
                  {submitting ? "Sending..." : "Express interest"}
                </button>
              </div>

              {error && <p className="text-[14px] text-accent">{error}</p>}
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
