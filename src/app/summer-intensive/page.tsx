"use client";

import React, { useState, useRef, useEffect, useCallback, FormEvent } from "react";

const MAJOR_OPTIONS = [
  "Computer Science", "Statistics", "Mathematics", "Economics", "Physics",
  "Philosophy", "Psychology", "Neuroscience", "Political Science", "Linguistics",
  "Biology", "Chemistry", "Engineering Science", "Electrical Engineering",
  "Computer Engineering", "Mechanical Engineering", "Industrial Engineering",
  "Data Science", "Cognitive Science", "Commerce", "Sociology", "English", "Other",
];

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
  majors?: string[];
  year?: string;
  why?: string;
  projectLink?: string;
  priorExperience?: string;
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
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [majorDropdownOpen, setMajorDropdownOpen] = useState(false);
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
    if (draft.majors?.length) setSelectedMajors(draft.majors);
    if (draft.year) (form.elements.namedItem("year") as HTMLSelectElement).value = draft.year;
    if (draft.why) (form.elements.namedItem("why") as HTMLTextAreaElement).value = draft.why;
    if (draft.projectLink) (form.elements.namedItem("projectLink") as HTMLInputElement).value = draft.projectLink;
    if (draft.priorExperience) (form.elements.namedItem("priorExperience") as HTMLTextAreaElement).value = draft.priorExperience;
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
      majors: selectedMajors,
      year: data.get("year") as string,
      why: data.get("why") as string,
      projectLink: data.get("projectLink") as string,
      priorExperience: data.get("priorExperience") as string,
    };
    for (const month of MONTHS) {
      draft[`availability-${month}`] = data.get(`availability-${month}`) as string;
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch {}
  }, [selectedMajors]);

  // Save whenever majors change (since they're not native form elements)
  useEffect(() => {
    saveDraft();
  }, [selectedMajors, saveDraft]);

  function toggleMajor(major: string) {
    setSelectedMajors((prev) =>
      prev.includes(major) ? prev.filter((m) => m !== major) : [...prev, major]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selectedMajors.length === 0) {
      setError("Please select at least one major.");
      return;
    }

    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    // Rebuild FormData with correct field names for the API
    const payload = new FormData();
    payload.set("name", data.get("name") as string);
    payload.set("email", data.get("email") as string);
    payload.set("majors", JSON.stringify(selectedMajors));
    payload.set("year", data.get("year") as string);
    payload.set("why", data.get("why") as string);
    payload.set("projectLink", (data.get("projectLink") as string) || "");
    payload.set("priorExperience", (data.get("priorExperience") as string) || "");
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
        <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[1.15] tracking-tight mb-6 sm:mb-8 font-normal">
          <span className="text-accent">Summer Intensive</span>
        </h1>

        <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text-secondary">
          <p className="text-text">
            AI progress is accelerating. AI safety is talent-constrained.
          </p>
          <p className="text-text">
            In partnership with Trajectory Labs, we&rsquo;re running 4-day
            summer bootcamps to bring more talent into AI safety.
          </p>
          <p>
            The intensive introduces ambitious undergraduates to the hard
            problems of aligning and controlling superintelligent AI systems. No machine learning background or prior engagement with the field is
            required. We&rsquo;re looking for strong quantitative thinkers
            who care about this problem.
          </p>
        </div>

        <hr className="mt-10 border-t border-gray-200" />

        <div className="mt-10">
          <h2 className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] leading-[1.15] tracking-tight font-normal text-text mb-6">
            About the program
          </h2>
          <div className="space-y-5 text-[17px] sm:text-[19px] text-text-secondary">
            <div>
              <p className="font-semibold text-text">People</p>
              <p>A small cohort of exceptional, engaged peers.</p>
            </div>
            <div>
              <p className="font-semibold text-text">Mornings</p>
              <p>Facilitated discussions on the hardest open problems in AI safety: what the risks are, why they&rsquo;re hard, and what the field is doing about them. You&rsquo;ll do curated readings beforehand.</p>
            </div>
            <div>
              <p className="font-semibold text-text">Lunch</p>
              <p>Catered lunch. Hang out with AI safety researchers.</p>
            </div>
            <div>
              <p className="font-semibold text-text">Afternoons</p>
              <p>Technical workshops to teach you the critical tools of AI safety research. Each session builds a specific skill and produces a finished artifact you can show someone to prove you have it. Compute and API credits covered.</p>
            </div>
            <div>
              <p className="font-semibold text-text">After</p>
              <p>After the intensive, you&rsquo;re in our network: we&rsquo;ll keep connecting you with research opportunities and people in the field.</p>
            </div>
            <div>
              <p className="font-semibold text-text">Logistics</p>
              <p>The intensive runs one day per week on a weekend (to be compatible with internships and other summer commitments), for 4 weeks. Cohorts run May through August, hosted at Trajectory Labs in Toronto. Each cohort ~8 people.</p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-text font-semibold text-[17px] sm:text-[19px]">
          Applications are selective and close April 5th, EoD.
        </p>

        <hr className="mt-14 border-t border-gray-200" />

        <div className="mt-10">
          <h2 className="text-[1.5rem] sm:text-[2rem] leading-[1.15] tracking-tight mb-2 font-normal">
            Application form
          </h2>
          <p className="text-[15px] text-text-secondary">
            Fields marked with <span className="text-accent">*</span> are required.
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMajorDropdownOpen(!majorDropdownOpen)}
                  className="form-input !flex text-left items-center justify-between"
                >
                  <span className={`truncate ${selectedMajors.length === 0 ? "text-[#9ca3af]" : ""}`}>
                    {selectedMajors.length === 0
                      ? "Select your major(s)"
                      : selectedMajors.join(", ")}
                  </span>
                  <svg className="w-4 h-4 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {majorDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                    {MAJOR_OPTIONS.map((major) => (
                      <label
                        key={major}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-[15px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMajors.includes(major)}
                          onChange={() => toggleMajor(major)}
                          className="mr-2"
                        />
                        {major}
                      </label>
                    ))}
                  </div>
                )}
              </div>
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

            <Field label="Why do you want to do this program?" required hint="~3 bullet points">
              <textarea
                name="why"
                required
                rows={5}
                className="form-input resize-y"
                placeholder="- First reason&#10;- Second reason&#10;- Third reason"
              />
            </Field>

            <Field label="Link us to a project you think shows your ability" hint="e.g., GitHub repo, paper, blog post — optional">
              <input type="url" name="projectLink" className="form-input" placeholder="https://..." />
            </Field>

            <Field label="Do you have any prior AI safety involvement?" hint="Optional">
              <textarea
                name="priorExperience"
                rows={3}
                className="form-input resize-y"
              />
            </Field>

            <Field label="Resume" hint="PDF only — optional">
              <FileInput name="resume" accept=".pdf,application/pdf" />
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

function FileInput({ name, accept }: { name: string; accept: string }) {
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
