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
import { RatingScale, AGREEMENT_POINTS } from "@/components/RatingScale";
import {
  NOTEBOOK_LEARNING_ACTIVITY,
  ACTIVITY_POINTS,
  NOTEBOOK_LEARNING_POINTS,
} from "@/lib/pulseActivities";
import { useAutosave } from "@/lib/autosave";

const WEEKS = [
  "Week 1: Evals",
  "Week 2: Fine-tuning / RLHF",
  "Week 3: Mech interp",
];

// Drop the description for display; the value submitted/matched stays full.
const weekLabel = (w: string) => w.split(":")[0].trim();

const WEEK_1_ACTIVITIES = [
  "Intro talk",
  "Facilitated discussion",
  "Lunch",
  "Anson's talk",
  "Intro to notebooks talk",
  "Notebooks",
  "Pair programming partner",
  "Walk",
];


// Activities/items rated 1-5, per week. Add/remove freely; no Airtable schema
// change needed (ratings are stored long-format, one row per item). Empty list =
// no ratings shown for that week yet.
const WEEK_ACTIVITIES: Record<string, string[]> = {
  "Week 1: Evals": WEEK_1_ACTIVITIES,
  "Week 2: Fine-tuning / RLHF": [
    ...WEEK_1_ACTIVITIES.filter((a) => a !== "Anson's talk"),
    NOTEBOOK_LEARNING_ACTIVITY,
  ],
  "Week 3: Mech interp": [
    "Facilitation: discussions, debate, etc.",
    "Facilitation: threat model creation",
    "Lunch",
    "Walk",
    "Notebooks",
    "Capstone project presentation",
    "Capstone project prep",
  ],
};

const READINGS_OPTIONS = ["Yes", "Some of them", "No"];
const TA_FREQUENCY_OPTIONS = ["Too high", "Just right", "Too low"];
const NOTEBOOK_DIFFICULTY_OPTIONS = ["Too hard", "Just right", "Too easy"];

function ChoiceField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <FormField label={label}>
      <SelectWrapper>
        <select
          className="form-input form-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select one</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </SelectWrapper>
    </FormField>
  );
}

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
  const [activityRatings, setActivityRatings] = useState<Record<string, number>>({});
  const [activityReasons, setActivityReasons] = useState<Record<string, string>>({});
  const [readings, setReadings] = useState("");
  const [taFrequency, setTaFrequency] = useState("");
  const [notebookDifficulty, setNotebookDifficulty] = useState("");
  const [bestPart, setBestPart] = useState("");
  const [whatChange, setWhatChange] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  useEffect(() => {
    if (initialWeek && !week) setWeek(initialWeek);
  }, [initialWeek, week]);

  const activities = WEEK_ACTIVITIES[week] || [];

  // Autosave keyed by week so each Saturday's responses are independent.
  useAutosave(
    `pulse-${week || "_"}`,
    participantId,
    { dayNps, activityRatings, activityReasons, readings, taFrequency, notebookDifficulty, bestPart, whatChange, anythingElse },
    (saved) => {
      if (typeof saved.dayNps === "number") setDayNps(saved.dayNps);
      if (saved.activityRatings && typeof saved.activityRatings === "object")
        setActivityRatings(saved.activityRatings as Record<string, number>);
      if (saved.activityReasons && typeof saved.activityReasons === "object")
        setActivityReasons(saved.activityReasons as Record<string, string>);
      if (typeof saved.readings === "string") setReadings(saved.readings);
      if (typeof saved.taFrequency === "string") setTaFrequency(saved.taFrequency);
      if (typeof saved.notebookDifficulty === "string") setNotebookDifficulty(saved.notebookDifficulty);
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
      // Only send ratings for activities shown this week.
      const ratingsForWeek: Record<string, number> = {};
      const reasonsForWeek: Record<string, string> = {};
      for (const a of activities) {
        if (typeof activityRatings[a] === "number") {
          ratingsForWeek[a] = activityRatings[a];
          // Capture the "why" only for low ratings (2 or 1).
          if (activityRatings[a] <= 2 && activityReasons[a]?.trim())
            reasonsForWeek[a] = activityReasons[a].trim();
        }
      }
      const res = await fetch("/api/survey/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          week,
          dayNps,
          activityRatings: ratingsForWeek,
          activityReasons: reasonsForWeek,
          readings,
          taFrequency,
          notebookDifficulty,
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
      <form onSubmit={handleSubmit} className="space-y-10 mt-8">
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
                  {weekLabel(w)}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </FormField>

        <RatingScale
          name="dayNps"
          label="I would recommend today to a friend interested in AI safety."
          required
          value={dayNps}
          onChange={setDayNps}
          points={AGREEMENT_POINTS}
        />

        {activities.length > 0 && (
          <div className="space-y-6">
            <p className="text-[15px] font-medium leading-[1.7]">
              Rate these items
            </p>
            {activities.map((activity) => {
              const rating = activityRatings[activity];
              return (
                <div key={activity} className="space-y-3">
                  <RatingScale
                    name={`activity-${activity}`}
                    label={activity}
                    min={1}
                    max={5}
                    points={
                      activity === NOTEBOOK_LEARNING_ACTIVITY
                        ? NOTEBOOK_LEARNING_POINTS
                        : ACTIVITY_POINTS
                    }
                    value={rating ?? null}
                    onChange={(v) =>
                      setActivityRatings((prev) => ({ ...prev, [activity]: v }))
                    }
                  />
                  {typeof rating === "number" && rating <= 2 && (
                    <input
                      type="text"
                      className="form-input"
                      placeholder={
                        activity === NOTEBOOK_LEARNING_ACTIVITY
                          ? "What would have helped you learn more? (one sentence)"
                          : "What did you dislike? (one sentence)"
                      }
                      value={activityReasons[activity] || ""}
                      onChange={(e) =>
                        setActivityReasons((prev) => ({
                          ...prev,
                          [activity]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <ChoiceField
          label="Did you do the readings? Please be honest, we use this to fix the readings and we won't judge you :)"
          value={readings}
          onChange={setReadings}
          options={READINGS_OPTIONS}
        />

        <ChoiceField
          label="TA visit frequency"
          value={taFrequency}
          onChange={setTaFrequency}
          options={TA_FREQUENCY_OPTIONS}
        />

        <ChoiceField
          label="Notebook difficulty"
          value={notebookDifficulty}
          onChange={setNotebookDifficulty}
          options={NOTEBOOK_DIFFICULTY_OPTIONS}
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
