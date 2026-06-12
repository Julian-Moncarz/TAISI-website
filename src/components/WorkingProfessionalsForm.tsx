"use client";

import { useState, type FormEvent } from "react";
import { FormField, SuccessPanel } from "@/components/FormControls";

const NOT_AVAILABLE = "Not available this August";
const DAY_OPTIONS = ["Saturdays", "Sundays", NOT_AVAILABLE];

export default function WorkingProfessionalsForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [joinedMailingList, setJoinedMailingList] = useState(false);
  const [error, setError] = useState("");

  const notAvailable = days.includes(NOT_AVAILABLE);

  function toggleDay(day: string) {
    setDays((prev) => {
      // "Not available" is mutually exclusive with the day options.
      if (day === NOT_AVAILABLE) {
        return prev.includes(NOT_AVAILABLE) ? [] : [NOT_AVAILABLE];
      }
      const withoutNA = prev.filter((d) => d !== NOT_AVAILABLE);
      return withoutNA.includes(day)
        ? withoutNA.filter((d) => d !== day)
        : [...withoutNA, day];
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (days.length === 0) {
      setError("Please indicate your availability.");
      return;
    }

    setSubmitting(true);

    try {
      if (notAvailable) {
        // Not available for this cohort: just add them to the mailing list.
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "working-professionals-eoi" }),
        });
        if (!res.ok) throw new Error("Failed");
        setJoinedMailingList(true);
      } else {
        const res = await fetch("/api/working-professionals-eoi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, link, availability: days }),
        });
        if (!res.ok) throw new Error("Failed");
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return joinedMailingList ? (
      <SuccessPanel title="You&rsquo;re on the list" className="!mx-0 !mt-0">
        <p>
          Thanks. We&rsquo;ve added you to our mailing list and will keep you posted on future events and cohorts.
        </p>
      </SuccessPanel>
    ) : (
      <SuccessPanel title="Thanks for your interest" className="!mx-0 !mt-0">
        <p>
          We&rsquo;ve recorded your interest in the working professionals cohort and will be in touch with dates and next steps.
        </p>
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[560px] space-y-6">
      {error && (
        <p className="text-accent text-[15px] font-medium">{error}</p>
      )}

      <FormField label="Name" required>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input"
        />
      </FormField>

      <FormField label="Email" required>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />
      </FormField>

      <FormField
        label="LinkedIn or portfolio"
        required={!notAvailable}
        hint={notAvailable ? "Optional" : undefined}
      >
        <input
          type="url"
          name="link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required={!notAvailable}
          className="form-input"
          placeholder="https://..."
        />
      </FormField>

      <FormField
        label="Which days can you attend?"
        required
        hint="One cohort meets every Saturday and the other meets every Sunday. Indicate your availability."
      >
        <div className="space-y-2">
          {DAY_OPTIONS.map((day) => (
            <label
              key={day}
              className="flex items-center gap-3 border border-black/20 px-4 py-3 text-[15px] text-text cursor-pointer hover:border-black/40 transition-colors"
            >
              <input
                type="checkbox"
                checked={days.includes(day)}
                onChange={() => toggleDay(day)}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      </FormField>

      <button
        type="submit"
        disabled={submitting}
        className="primary-cta px-8 py-3 text-[15px] disabled:cursor-not-allowed"
      >
        {submitting
          ? "Submitting..."
          : notAvailable
            ? "Join mailing list"
            : "Express interest"}
      </button>
    </form>
  );
}
