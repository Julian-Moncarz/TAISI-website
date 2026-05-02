"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SuccessPanel } from "@/components/FormControls";

export default function SeptemberFellowship() {
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
      const response = await fetch("/api/september-fellowship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: data.get("recordId"),
          name: data.get("name"),
          email: data.get("email"),
          wantsSpot: data.get("wantsSpot") === "yes",
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
        <h1 className="text-center text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] leading-[0.98] tracking-normal mb-6 font-semibold">
          September fellowship spot
        </h1>

        {submitted ? (
          <SuccessPanel title="Spot saved" className="mx-auto">
            <p>Thanks. We&rsquo;ve saved your September fellowship spot and sent you a confirmation email.</p>
          </SuccessPanel>
        ) : !linkLoaded ? null : !recordId ? (
          <SuccessPanel title="Use your personalized link" className="mx-auto">
            <p>
              This page needs the unique link from your email. Please open that link, or reply to us and we&rsquo;ll record your response manually.
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
                Confirm below and we&rsquo;ll hold a guaranteed spot for you in the September fellowship.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-[560px] mx-auto space-y-8 mt-8">
              {error && (
                <p className="text-center text-accent text-[15px] font-medium leading-[1.7]">{error}</p>
              )}

              <input type="hidden" name="recordId" value={recordId} />
              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="email" value={email} />

              <label className="flex items-start gap-3 border border-black/20 px-4 py-4 text-left text-[15px] sm:text-[16px] leading-[1.6] text-text">
                <input
                  type="checkbox"
                  name="wantsSpot"
                  value="yes"
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-accent"
                />
                <span>I would like a guaranteed spot in the September fellowship.</span>
              </label>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-cta px-8 py-3 text-[15px] disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
