"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { FormPage } from "@/components/FormPage";
import {
  FormField,
  SelectWrapper,
} from "@/components/FormControls";
import {
  CohortAndNamePicker,
  useParticipants,
} from "@/components/ParticipantPicker";
import { RatingScale } from "@/components/RatingScale";
import { useAutosave } from "@/lib/autosave";

const WEEKS = [
  "Week 1: Evals",
  "Week 2: Fine-tuning / RLHF",
  "Week 3: Mech interp",
];

function PulseSurveyInner() {
  const params = useSearchParams();
  const weekParam = params.get("week");
  const initialWeek = WEEKS.find(
    (w) => w === weekParam || w.toLowerCase().startsWith(`${(weekParam || "").toLowerCase()}:`)
  );

  const { participants, loading, error: loadError } = useParticipants();
  const [participantId, setParticipantId] = useState("");
  const [cohort, setCohort] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [dayNps, setDayNps] = useState<number | null>(null);
  const [week, setWeek] = useState(initialWeek || "");
  const [bestPart, setBestPart] = useState("");
  const [whatChange, setWhatChange] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  useEffect(() => {
    if (initialWeek && !week) setWeek(initialWeek);
  }, [initialWeek, week]);

  // Autosave keyed by week so each Saturday's responses are independent.
  useAutosave(
    `pulse-${week || "_"}`,
    participantId,
    { dayNps, bestPart, whatChange, anythingElse },
    (saved) => {
      if (typeof saved.dayNps === "number") setDayNps(saved.dayNps);
      if (typeof saved.bestPart === "string") setBestPart(saved.bestPart);
      if (typeof saved.whatChange === "string") setWhatChange(saved.whatChange);
      if (typeof saved.anythingElse === "string") setAnythingElse(saved.anythingElse);
    },
    submitted
  );

  const firstName = participants.find((p) => p.id === participantId)?.name.split(" ")[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!participantId) return setError("Please select your name.");
    if (!week) return setError("Please select which week.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/survey/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          week,
          dayNps,
          bestPart,
          whatChange,
          anythingElse,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormPage
      title="End of day check-in :)"
      submitted={submitted}
      successTitle={firstName ? `Thanks ${firstName}!` : "Thanks for submitting"}
    >
      <form onSubmit={handleSubmit} className="space-y-8 mt-8">
        {(error || loadError) && (
          <p className="text-center text-accent text-[15px] font-medium leading-[1.7]">
            {error || loadError}
          </p>
        )}
        <CohortAndNamePicker
          participantId={participantId}
          onParticipantChange={setParticipantId}
          cohort={cohort}
          onCohortChange={setCohort}
          participants={participants}
          loading={loading}
        />

        <FormField label="Which week?" required>
          <SelectWrapper>
            <select
              name="week"
              required
              className="form-input form-select"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
            >
              <option value="" disabled>
                Select one
              </option>
              {WEEKS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </FormField>

        <RatingScale
          name="dayNps"
          label="How likely are you to recommend today to a friend interested in AI safety?"
          required
          min={0}
          value={dayNps}
          onChange={setDayNps}
          lowLabel="0 = not at all"
          highLabel="10 = extremely likely"
        />

        <FormField label="Best part of today" hint="One sentence" required>
          <textarea
            rows={2}
            required
            className="form-input resize-y"
            value={bestPart}
            onChange={(e) => setBestPart(e.target.value)}
          />
        </FormField>

        <FormField label="What would you change?" hint="One sentence" required>
          <textarea
            rows={2}
            required
            className="form-input resize-y"
            value={whatChange}
            onChange={(e) => setWhatChange(e.target.value)}
          />
        </FormField>

        <FormField
          label="Anything else for the team?"
          hint="Facilitators, logistics, food, etc."
        >
          <textarea
            rows={3}
            className="form-input resize-y"
            value={anythingElse}
            onChange={(e) => setAnythingElse(e.target.value)}
          />
        </FormField>

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
    </FormPage>
  );
}

export default function PulseSurveyPage() {
  return (
    <Suspense fallback={null}>
      <PulseSurveyInner />
    </Suspense>
  );
}
