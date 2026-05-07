"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FormPage } from "@/components/FormPage";
import {
  FormField,
  SelectWrapper,
} from "@/components/FormControls";
import {
  ParticipantPicker,
  useParticipants,
} from "@/components/ParticipantPicker";
import { RatingScale } from "@/components/RatingScale";
import { useAutosave } from "@/lib/autosave";

const HOURS = ["0", "1-2", "3-5", "6-10", "10+"];
const AIS_INVOLVEMENT = [
  "Full-time AIS role / job",
  "AIS fellowship or program",
  "Independent AIS research",
  "Volunteering with TAISI or similar org",
  "Self-study / reading",
  "Not currently active in AIS",
];

type ExitPrefill = {
  commitment: string;
  stayInTouch: string;
};

export default function FollowupSurveyPage() {
  const { participants, loading, error: loadError } = useParticipants();
  const [participantId, setParticipantId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [prefill, setPrefill] = useState<ExitPrefill | null>(null);
  const [involvement, setInvolvement] = useState<string[]>([]);
  const [fieldFit, setFieldFit] = useState<number | null>(null);
  const [careerClarity, setCareerClarity] = useState<number | null>(null);
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [fellowshipOrJob, setFellowshipOrJob] = useState("");
  const [stillInTouch, setStillInTouch] = useState("");

  useAutosave(
    "followup",
    participantId,
    {
      involvement,
      fieldFit,
      careerClarity,
      hoursPerWeek,
      fellowshipOrJob,
      stillInTouch,
    },
    (saved) => {
      if (typeof saved.fieldFit === "number") setFieldFit(saved.fieldFit);
      if (typeof saved.careerClarity === "number") setCareerClarity(saved.careerClarity);
      if (typeof saved.hoursPerWeek === "string") setHoursPerWeek(saved.hoursPerWeek);
      if (typeof saved.fellowshipOrJob === "string") setFellowshipOrJob(saved.fellowshipOrJob);
      if (typeof saved.stillInTouch === "string") setStillInTouch(saved.stillInTouch);
      if (Array.isArray(saved.involvement) && saved.involvement.every((x: unknown) => typeof x === "string"))
        setInvolvement(saved.involvement as string[]);
    },
    submitted
  );

  const firstName = participants.find((p) => p.id === participantId)?.name.split(" ")[0];

  useEffect(() => {
    if (!participantId) {
      setPrefill(null);
      return;
    }
    fetch(
      `/api/survey/prefill?form=exit&participantId=${encodeURIComponent(participantId)}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.found) setPrefill(d);
        else setPrefill(null);
      })
      .catch(() => setPrefill(null));
  }, [participantId]);

  function toggle(arr: string[], v: string) {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!participantId) return setError("Please select your name.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/survey/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          hoursPerWeek,
          involvement,
          fellowshipOrJob,
          fieldFit,
          careerClarity,
          stillInTouch,
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
      title="TAISI 6-month follow-up"
      intro={<p>Five minutes. We use this for funder reports :)</p>}
      submitted={submitted}
      successTitle={firstName ? `Thanks ${firstName}!` : "Thanks for submitting"}
    >
      <form onSubmit={handleSubmit} className="space-y-8 mt-8">
        {(error || loadError) && (
          <p className="text-center text-accent text-[15px] font-medium leading-[1.7]">
            {error || loadError}
          </p>
        )}
        <ParticipantPicker
          value={participantId}
          onChange={setParticipantId}
          participants={participants}
          loading={loading}
        />

        <FormField
          label="In the past month, how many hours per week have you spent on AIS-related work?"
          required
        >
          <SelectWrapper>
            <select
              required
              className="form-input form-select"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
            >
              <option value="" disabled>
                Select one
              </option>
              {HOURS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </FormField>

        <FormField
          label="Which best describes your current AIS involvement? (select all that apply)"
          required
        >
          <div className="space-y-2">
            {AIS_INVOLVEMENT.map((p) => (
              <label key={p} className="flex items-center gap-2 text-[15px]">
                <input
                  type="checkbox"
                  checked={involvement.includes(p)}
                  onChange={() => setInvolvement(toggle(involvement, p))}
                />
                {p}
              </label>
            ))}
          </div>
        </FormField>

        <FormField
          label="If in a fellowship or job, which one(s)?"
          hint="e.g. MATS, ARENA, Anthropic, METR"
        >
          <input
            type="text"
            className="form-input"
            value={fellowshipOrJob}
            onChange={(e) => setFellowshipOrJob(e.target.value)}
          />
        </FormField>

        <RatingScale
          name="fieldFit"
          label="How confident are you now that AI safety is the right field for you?"
          value={fieldFit}
          onChange={setFieldFit}
          lowLabel="1 = not at all"
          highLabel="10 = very confident"
        />

        <RatingScale
          name="careerClarity"
          label="I have a clear sense of how I would actually pursue a career in AI safety from where I am today."
          value={careerClarity}
          onChange={setCareerClarity}
          lowLabel="1 = no idea"
          highLabel="10 = concrete plan"
        />

        <FormField
          label={
            prefill?.stayInTouch
              ? `At exit you said you wanted to stay in touch with: ${prefill.stayInTouch}. Are you still in touch with any of them?`
              : "Are you still in touch with people from the program?"
          }
        >
          <textarea
            rows={3}
            className="form-input resize-y"
            value={stillInTouch}
            onChange={(e) => setStillInTouch(e.target.value)}
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
