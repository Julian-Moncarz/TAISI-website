"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  FormField,
  SelectWrapper,
  SuccessPanel,
} from "@/components/FormControls";

const COHORT_DETAILS: Record<string, { name: string; dates: string }> = {
  "June Sat": {
    name: "June Saturday",
    dates: "June 6, 13, 20, and 27, 2026",
  },
  "June Sun": {
    name: "June Sunday",
    dates: "June 7, 14, 21, and 28, 2026",
  },
  "July Sat": {
    name: "July Saturday",
    dates: "July 4, 11, 18, and 25, 2026",
  },
  "July Sun": {
    name: "July Sunday",
    dates: "July 5, 12, 19, and 26, 2026",
  },
  "August Sat": {
    name: "August Saturday",
    dates: "August 1, 8, 15, and 22, 2026",
  },
  "August Sun": {
    name: "August Sunday",
    dates: "August 2, 9, 16, and 23, 2026",
  },
};

type ConfirmationResult = {
  status: "Confirmed" | "Declined";
  cohort?: string;
};

export default function IntensiveAcceptance() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<ConfirmationResult | null>(null);
  const [linkLoaded, setLinkLoaded] = useState(false);
  const [cohort, setCohort] = useState("");
  const [recordId, setRecordId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillName = params.get("name") || "";
    const prefillEmail = params.get("email") || "";
    const prefillRecordId = params.get("recordId") || params.get("id") || "";
    const cohortParam = params.get("cohort");

    setRecordId(prefillRecordId);
    setName(prefillName);
    setEmail(prefillEmail);
    if (cohortParam) {
      setCohort(normalizeCohort(cohortParam));
    }
    setLinkLoaded(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/intensive-acceptance", {
        method: "POST",
        body: JSON.stringify({
          recordId: data.get("recordId"),
          cohort: data.get("cohort"),
          name: data.get("name"),
          email: data.get("email"),
          status: data.get("status"),
          notes: data.get("notes"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Submission failed");
      }

      setSubmitted({
        status: payload.status,
        cohort: payload.cohort || cohort,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const cohortDetails = cohort ? COHORT_DETAILS[cohort] : null;

  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <h1 className="text-center text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-6 font-semibold">
          Confirm your TAISI summer intensive spot
        </h1>

        {submitted ? (
          <SuccessPanel
            title={submitted.status === "Confirmed" ? "Spot confirmed" : "Thanks for letting us know"}
            className="mx-auto"
          >
            {submitted.status === "Confirmed" && (
              <p>
                Thanks for confirming. Please make sure all four sessions are in your calendar.
              </p>
            )}
          </SuccessPanel>
        ) : !linkLoaded ? null : !recordId ? (
          <SuccessPanel title="Use your personalized link" className="mx-auto">
            <p>
              This confirmation page needs the unique link from your acceptance email. Please open that link, or reply to us and we&rsquo;ll confirm manually.
            </p>
          </SuccessPanel>
        ) : (
          <>
            <div className="max-w-[640px] mx-auto space-y-4 text-center text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary">
              {name && (
                <p className="text-text text-[16px] sm:text-[17px]">
                  <strong>{name}</strong>
                </p>
              )}
              {cohortDetails && (
                <p className="text-text">
                  Your cohort: <strong>{cohortDetails.name}</strong>
                  <br />
                  Dates: {cohortDetails.dates}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="max-w-[640px] mx-auto space-y-8 mt-8">
              {error && (
                <p className="text-center text-accent text-[15px] font-medium leading-[1.7]">{error}</p>
              )}

              <input type="hidden" name="recordId" value={recordId} />
              <input type="hidden" name="cohort" value={cohort} />
              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="email" value={email} />

              <FormField label="Do you commit to attending all four sessions?" required>
                <SelectWrapper>
                  <select name="status" required className="form-input form-select" defaultValue="">
                    <option value="" disabled>Select one</option>
                    <option value="Confirmed">Yes, I accept my spot</option>
                    <option value="Declined">No, I cannot attend</option>
                  </select>
                </SelectWrapper>
              </FormField>

              <FormField label="Notes" hint="Optional">
                <textarea
                  name="notes"
                  rows={4}
                  className="form-input resize-y"
                  placeholder="Anything we should know?"
                />
              </FormField>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-cta px-8 py-3 text-[15px] disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit confirmation"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function normalizeCohort(value: string) {
  const decoded = value.replace(/\+/g, " ").trim();
  const lower = decoded.toLowerCase();
  const aliases: Record<string, string> = {
    "june sat": "June Sat",
    "june saturday": "June Sat",
    "june sun": "June Sun",
    "june sunday": "June Sun",
    "july sat": "July Sat",
    "july saturday": "July Sat",
    "july sun": "July Sun",
    "july sunday": "July Sun",
    "august sat": "August Sat",
    "august saturday": "August Sat",
    "august sun": "August Sun",
    "august sunday": "August Sun",
  };

  return aliases[lower] || decoded;
}
