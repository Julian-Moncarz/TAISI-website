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
import { RatingScale, AGREEMENT_POINTS } from "@/components/RatingScale";
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

const BARRIERS = [
  "Time / competing commitments (school, job)",
  "Don't know what to do next / no clear opportunity",
  "Don't feel skilled enough yet",
  "Financial (need a salary, can't afford unpaid work)",
  "Geographic / visa / relocation",
  "Lost momentum after the cohort ended",
  "Imposter feelings / don't feel I belong",
  "Other",
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
  const [belonging, setBelonging] = useState<number | null>(null);
  const [selfEfficacy, setSelfEfficacy] = useState<number | null>(null);
  const [canNameOrgs, setCanNameOrgs] = useState("");
  const [orgsList, setOrgsList] = useState("");
  const [barriers, setBarriers] = useState<string[]>([]);
  const [barriersOther, setBarriersOther] = useState("");
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
      belonging,
      selfEfficacy,
      canNameOrgs,
      orgsList,
      barriers,
      barriersOther,
      hoursPerWeek,
      fellowshipOrJob,
      stillInTouch,
    },
    (saved) => {
      if (typeof saved.fieldFit === "number") setFieldFit(saved.fieldFit);
      if (typeof saved.careerClarity === "number") setCareerClarity(saved.careerClarity);
      if (typeof saved.belonging === "number") setBelonging(saved.belonging);
      if (typeof saved.selfEfficacy === "number") setSelfEfficacy(saved.selfEfficacy);
      if (typeof saved.canNameOrgs === "string") setCanNameOrgs(saved.canNameOrgs);
      if (typeof saved.orgsList === "string") setOrgsList(saved.orgsList);
      if (typeof saved.barriersOther === "string") setBarriersOther(saved.barriersOther);
      if (typeof saved.hoursPerWeek === "string") setHoursPerWeek(saved.hoursPerWeek);
      if (typeof saved.fellowshipOrJob === "string") setFellowshipOrJob(saved.fellowshipOrJob);
      if (typeof saved.stillInTouch === "string") setStillInTouch(saved.stillInTouch);
      if (Array.isArray(saved.involvement) && saved.involvement.every((x: unknown) => typeof x === "string"))
        setInvolvement(saved.involvement as string[]);
      if (Array.isArray(saved.barriers) && saved.barriers.every((x: unknown) => typeof x === "string"))
        setBarriers(saved.barriers as string[]);
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
          belonging,
          selfEfficacy,
          canNameOrgs,
          orgsList,
          barriers,
          barriersOther: barriers.includes("Other") ? barriersOther : "",
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
      <form onSubmit={handleSubmit} className="space-y-10 mt-8">
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
          label="I'm confident that AI safety is the right field for me."
          value={fieldFit}
          onChange={setFieldFit}
          points={AGREEMENT_POINTS}
        />

        <RatingScale
          name="careerClarity"
          label="I have a clear sense of how I would actually pursue a career in AI safety from where I am today."
          value={careerClarity}
          onChange={setCareerClarity}
          points={AGREEMENT_POINTS}
        />

        <RatingScale
          name="belonging"
          label="I feel like I belong in the AI safety community."
          value={belonging}
          onChange={setBelonging}
          points={AGREEMENT_POINTS}
        />

        <RatingScale
          name="selfEfficacy"
          label="I could contribute to a real AI safety project today."
          value={selfEfficacy}
          onChange={setSelfEfficacy}
          points={AGREEMENT_POINTS}
        />

        <FormField label="I can name at least 3 specific AI safety programs, fellowships, or orgs I could realistically apply to next.">
          <SelectWrapper>
            <select
              className="form-input form-select"
              value={canNameOrgs}
              onChange={(e) => setCanNameOrgs(e.target.value)}
            >
              <option value="">Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </SelectWrapper>
        </FormField>

        <FormField
          label="List the programs, fellowships, or orgs you could apply to next."
          hint="Names are enough"
        >
          <textarea
            rows={2}
            className="form-input resize-y"
            value={orgsList}
            onChange={(e) => setOrgsList(e.target.value)}
          />
        </FormField>

        <FormField label="What actually got in the way of staying engaged with AIS over the past 6 months? (select all that apply)">
          <div className="space-y-2">
            {BARRIERS.map((o) => (
              <label key={o} className="flex items-center gap-2 text-[15px]">
                <input
                  type="checkbox"
                  checked={barriers.includes(o)}
                  onChange={() => setBarriers(toggle(barriers, o))}
                />
                {o}
              </label>
            ))}
          </div>
        </FormField>

        {barriers.includes("Other") && (
          <FormField label="Other (specify)">
            <input
              type="text"
              className="form-input"
              value={barriersOther}
              onChange={(e) => setBarriersOther(e.target.value)}
            />
          </FormField>
        )}

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
