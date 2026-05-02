"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FormField, SuccessPanel } from "@/components/FormControls";

const EVENINGS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function SummerFellowshipAvailability() {
  const [recordId, setRecordId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkLoaded, setLinkLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRecordId(params.get("recordId") || params.get("id") || "");
    setName(params.get("name") || "");
    setEmail(params.get("email") || "");
    setLinkLoaded(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/summer-fellowship-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: data.get("recordId"),
          name: data.get("name"),
          email: data.get("email"),
          session1Evenings: data.getAll("session1Evenings"),
          session2Evenings: data.getAll("session2Evenings"),
          notes: data.get("notes"),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <h1 className="text-center text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-6 font-semibold">
          Summer fellowship availability
        </h1>

        {submitted ? (
          <SuccessPanel title="Availability saved" className="mx-auto">
            <p>Thanks. We&rsquo;ve saved your availability and sent you a confirmation email.</p>
          </SuccessPanel>
        ) : !linkLoaded ? null : !recordId ? (
          <SuccessPanel title="Use your personalized link" className="mx-auto">
            <p>
              This page needs the unique link from your email. Please open that link, or reply to us and we&rsquo;ll record your availability manually.
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
              <p>
                We&rsquo;re exploring summer fellowship iterations that would run on weekday evenings at Trajectory Labs. The program would cover similar content as the intensives. And, we&rsquo;ll buy you sushi (or some other fancy dinner).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-[640px] mx-auto space-y-8 mt-8">
              {error && (
                <p className="text-center text-accent text-[15px] font-medium leading-[1.7]">{error}</p>
              )}

              <input type="hidden" name="recordId" value={recordId} />
              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="email" value={email} />

              <EveningGroup
                name="session1Evenings"
                title="Session 1"
                dates="June 1 to July 10, 2026"
              />

              <EveningGroup
                name="session2Evenings"
                title="Session 2"
                dates="July 13 to August 21, 2026"
              />

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
                  {submitting ? "Submitting..." : "Submit availability"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function EveningGroup({
  name,
  title,
  dates,
}: {
  name: string;
  title: string;
  dates: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[15px] font-medium text-text">
        {title}
        <span className="block text-[13px] text-text-secondary mt-0.5">{dates}</span>
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EVENINGS.map((evening) => (
          <label
            key={evening}
            className="flex items-center gap-3 border border-black/20 px-4 py-3 text-[15px] text-text"
          >
            <input
              type="checkbox"
              name={name}
              value={evening}
              className="h-4 w-4 accent-accent"
            />
            <span>{evening} evenings</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
