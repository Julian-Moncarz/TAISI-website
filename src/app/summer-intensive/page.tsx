"use client";

import React, { useState, useRef, useEffect, useCallback, FormEvent } from "react";

const YEAR_OPTIONS = [
  "1st Year", "2nd Year", "3rd Year", "4th Year",
  "PEY / Internship Year", "Graduated",
];

const AVAILABILITY_OPTIONS = ["Not available", "Saturday only", "Sunday only", "Both days"];
const MONTHS = ["May", "June", "July", "August"] as const;

const STORAGE_KEY = "taisi-summer-intensive-draft";

type DraftData = {
  name?: string;
  email?: string;
  major?: string;
  year?: string;
  why?: string;
  projectLink?: string;
  [key: `availability-${string}`]: string;
};

function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export default function SummerIntensive() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const restoredRef = useRef(false);

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (!draft || !formRef.current) {
      restoredRef.current = true;
      return;
    }
    const form = formRef.current;

    if (draft.name) (form.elements.namedItem("name") as HTMLInputElement).value = draft.name;
    if (draft.email) (form.elements.namedItem("email") as HTMLInputElement).value = draft.email;
    if (draft.major) (form.elements.namedItem("major") as HTMLInputElement).value = draft.major;
    if (draft.year) (form.elements.namedItem("year") as HTMLSelectElement).value = draft.year;
    if (draft.why) (form.elements.namedItem("why") as HTMLTextAreaElement).value = draft.why;
    if (draft.projectLink) (form.elements.namedItem("projectLink") as HTMLInputElement).value = draft.projectLink;

    for (const month of MONTHS) {
      const key = `availability-${month}` as keyof DraftData;
      if (draft[key]) (form.elements.namedItem(`availability-${month}`) as HTMLSelectElement).value = draft[key] as string;
    }
    restoredRef.current = true;
  }, []);

  // Save draft on every change
  const saveDraft = useCallback(() => {
    if (!formRef.current || !restoredRef.current) return;
    const form = formRef.current;
    const data = new FormData(form);
    const draft: DraftData = {
      name: data.get("name") as string,
      email: data.get("email") as string,
      major: data.get("major") as string,
      year: data.get("year") as string,
      why: data.get("why") as string,
      projectLink: data.get("projectLink") as string,
    };
    for (const month of MONTHS) {
      draft[`availability-${month}`] = data.get(`availability-${month}`) as string;
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch {}
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    // Rebuild FormData with correct field names for the API
    const payload = new FormData();
    payload.set("name", data.get("name") as string);
    payload.set("email", data.get("email") as string);
    payload.set("major", data.get("major") as string);
    payload.set("year", data.get("year") as string);
    payload.set("why", data.get("why") as string);
    payload.set("projectLink", (data.get("projectLink") as string) || "");
    payload.set("availabilityMay", data.get("availability-May") as string);
    payload.set("availabilityJune", data.get("availability-June") as string);
    payload.set("availabilityJuly", data.get("availability-July") as string);
    payload.set("availabilityAugust", data.get("availability-August") as string);

    const resumeFile = data.get("resume") as File;
    if (resumeFile && resumeFile.size > 0) {
      payload.set("resume", resumeFile);
    }

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) throw new Error("Submission failed");
      clearDraft();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[1.15] tracking-tight mb-4 sm:mb-6 font-normal">
          Apply to the <span className="text-accent">Summer Intensive</span>
        </h1>

        <div className="text-[17px] sm:text-[19px] leading-[1.7] text-text max-w-[800px] mb-8 space-y-4">
          <ul className="space-y-2 pl-0 list-none">
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>One day/week (Sat or Sun) &mdash; <strong>compatible with jobs</strong></span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Off-campus AI safety lab near King Station</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Free lunch with AI safety researchers</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Leave with finished projects for your portfolio</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Top participants get research opportunities after</span>
            </li>
          </ul>
          <p>
            Cohorts monthly May&ndash;August. No prior ML or AI safety experience required. <strong>Applications close April 5th.</strong>
          </p>
        </div>

        <div id="apply" className="scroll-mt-8">
          <p className="text-[15px] text-text-secondary">
            Fields marked with <span className="text-accent">*</span> are required. Your progress is saved automatically.
          </p>
        </div>

        {submitted ? (
          <div className="mt-10 max-w-[640px]">
            <h2 className="text-[1.5rem] sm:text-[2rem] leading-[1.15] tracking-tight mb-4 font-normal">
              Application <span className="text-accent">submitted</span>
            </h2>
            <p className="text-[17px] sm:text-[19px] text-text-secondary leading-[1.7]">
              Thanks for applying. We&rsquo;ll be in touch.
            </p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} onChange={saveDraft} className="max-w-[640px] space-y-8 mt-8">
            {error && (
              <p className="text-accent text-[15px] font-medium">{error}</p>
            )}

            <Field label="Full Name" required>
              <input type="text" name="name" required className="form-input" />
            </Field>

            <Field label="Email" required>
              <input type="email" name="email" required className="form-input" />
            </Field>

            <Field label="Major(s)" required>
              <input type="text" name="major" required className="form-input" />
            </Field>

            <Field label="Year" required>
              <SelectWrapper>
                <select name="year" required className="form-input form-select" defaultValue="">
                  <option value="" disabled>Select your year</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </SelectWrapper>
            </Field>

            <Field label="What is the number one reason you want to do this program?" required>
              <textarea
                name="why"
                required
                rows={5}
                className="form-input resize-y"
              />
            </Field>

            <Field label="Resume" hint="PDF only (optional)">
              <FileInput name="resume" accept=".pdf,application/pdf" />
            </Field>

            <Field label="Link us to something that shows your ability" hint="e.g., essay, blog post, GitHub repo, paper (optional)">
              <input type="url" name="projectLink" className="form-input" placeholder="https://..." />
            </Field>

            <fieldset className="space-y-4">
              <legend className="text-[15px] font-semibold text-text tracking-wide uppercase mb-2">
                Availability <span className="text-accent">*</span>
              </legend>
              {MONTHS.map((month) => (
                <Field key={month} label={`${month} 2026`} required>
                  <SelectWrapper>
                    <select name={`availability-${month}`} required className="form-input form-select" defaultValue="">
                      <option value="" disabled>Select availability</option>
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </SelectWrapper>
                </Field>
              ))}
            </fieldset>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
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
        .form-select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding-right: 2.5rem;
        }
      `}</style>
    </main>
  );
}

function FileInput({ name, accept, required }: { name: string; accept: string; required?: boolean }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          required={required}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
        />
        <div className="form-input text-left">
          <span className={fileName ? "" : "text-[#9ca3af]"}>
            {fileName || "Choose file"}
          </span>
        </div>
      </div>
      {fileName && (
        <div className="mt-2 flex items-center gap-2 text-[14px] text-text-secondary">
          <span>{fileName}</span>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              setFileName(null);
            }}
            className="text-accent hover:text-accent-hover transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1.5">
        <span className="text-[15px] font-medium text-text">
          {label}
          {required && <span className="text-accent ml-0.5">*</span>}
        </span>
        {hint && (
          <span className="block text-[13px] text-text-secondary mt-0.5">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}
