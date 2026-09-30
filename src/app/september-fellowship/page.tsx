"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SuccessPanel } from "@/components/FormControls";
import PageHero from "@/components/PageHero";

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
      <PageHero title="September fellowship spot" object="logo" play="mount">
        <div className="max-w-[560px]">

          {submitted ? (
            <SuccessPanel title="Spot saved">
              <p>Thanks. We&rsquo;ve saved your September fellowship spot and sent you a confirmation email.</p>
            </SuccessPanel>
          ) : !linkLoaded ? null : !recordId ? (
            <SuccessPanel title="Use your personalized link">
              <p>
                This page needs the unique link from your email. Please open that link, or reply to us and we&rsquo;ll record your response manually.
              </p>
            </SuccessPanel>
          ) : (
            <div>
              <div className="t-body space-y-4">
                {name && (
                  <p className="text-ink text-[17px]">
                    <strong>{name}</strong>
                  </p>
                )}
                <p>
                  Confirm below and we&rsquo;ll hold a guaranteed spot for you in the September fellowship.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
                {error && (
                  <p id="september-error" role="alert" className="text-[13px] text-rose">
                    {error}
                  </p>
                )}

                <input type="hidden" name="recordId" value={recordId} />
                <input type="hidden" name="name" value={name} />
                <input type="hidden" name="email" value={email} />

                <label className="flex items-start gap-3 rounded-[6px] border border-ink/[0.18] px-4 py-4 text-[15px] leading-[1.6] text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    name="wantsSpot"
                    value="yes"
                    required
                    aria-describedby={error ? "september-error" : undefined}
                    className="mt-1 h-4 w-4 shrink-0 [accent-color:var(--color-ink)]"
                  />
                  <span>I would like a guaranteed spot in the September fellowship.</span>
                </label>

                <div>
                  <button type="submit" disabled={submitting} className="btn btn-ink-solid">
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </PageHero>
    </main>
  );
}
