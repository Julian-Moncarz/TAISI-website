"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FormPage } from "@/components/FormPage";
import {
  FormField,
  SelectWrapper,
} from "@/components/FormControls";
import {
  CohortAndNamePicker,
  useParticipants,
} from "@/components/ParticipantPicker";
import { RatingScale, RatingGroup, RatingRow } from "@/components/RatingScale";
import { useAutosave } from "@/lib/autosave";

const CAREER_BUCKETS = [
  "Not currently pursuing AIS work",
  "Continuing in school / current job, AIS on the side",
  "Planning to apply to fellowships or roles",
  "Actively applying to AI safety roles or fellowships",
  "Other",
];

const FAVOURITE_PARTS = [
  "Facilitated conversations",
  "Programming practice",
  "The cohort / meeting other participants",
  "Lunches with researchers",
  "Speakers",
  "Facilitators / TAs",
  "Social games / informal hangouts",
  "Project demo party",
  "Other",
];

const WEEKS_4 = [
  "Week 1: Evals",
  "Week 2: Fine-tuning / RLHF",
  "Week 3: Mech interp",
  "Week 4: Project day",
];

const FUTURE_HELP = [
  "Yes, as a facilitator or TA",
  "Yes, as a speaker / lunch guest",
  "Yes, by helping promote / refer applicants",
  "Maybe, ask me closer to the time",
  "Not right now",
];

type IntakePrefill = {
  knowledgeAis: number | null;
  knowledgeEvals: number | null;
  knowledgeFt: number | null;
  knowledgeMech: number | null;
  fieldFit: number | null;
  careerClarity: number | null;
};

export default function ExitSurveyPage() {
  const { participants, loading, error: loadError } = useParticipants();

  // Identity
  const [participantId, setParticipantId] = useState("");
  const [cohort, setCohort] = useState("");

  // Wizard
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — project-day pulse
  const [dayNps, setDayNps] = useState<number | null>(null);
  const [bestPart, setBestPart] = useState("");
  const [whatChange, setWhatChange] = useState("");
  const [anythingElsePulse, setAnythingElsePulse] = useState("");

  // Step 2 — exit
  const [prefill, setPrefill] = useState<IntakePrefill | null>(null);
  const [knowledgeAis, setKnowledgeAis] = useState<number | null>(null);
  const [knowledgeEvals, setKnowledgeEvals] = useState<number | null>(null);
  const [knowledgeFt, setKnowledgeFt] = useState<number | null>(null);
  const [knowledgeMech, setKnowledgeMech] = useState<number | null>(null);
  const [fieldFit, setFieldFit] = useState<number | null>(null);
  const [careerClarity, setCareerClarity] = useState<number | null>(null);
  const [favouriteParts, setFavouriteParts] = useState<string[]>([]);
  const [careerBucket, setCareerBucket] = useState("");
  const [careerBucketOther, setCareerBucketOther] = useState("");
  const [programNps, setProgramNps] = useState<number | null>(null);
  const [futureHelp, setFutureHelp] = useState<string[]>([]);
  const [commitment, setCommitment] = useState("");
  const [stayInTouch, setStayInTouch] = useState("");
  const [favouritePartsOther, setFavouritePartsOther] = useState("");
  const [mostValuableWeek, setMostValuableWeek] = useState("");
  const [doubleDownOn, setDoubleDownOn] = useState("");
  const [cutOrChange, setCutOrChange] = useState("");
  const [peopleToCallOut, setPeopleToCallOut] = useState("");
  const [referrals, setReferrals] = useState("");
  const [testimonial, setTestimonial] = useState("");

  useAutosave(
    "exit",
    participantId,
    {
      step,
      dayNps,
      bestPart,
      whatChange,
      anythingElsePulse,
      knowledgeAis,
      knowledgeEvals,
      knowledgeFt,
      knowledgeMech,
      fieldFit,
      careerClarity,
      favouriteParts,
      careerBucket,
      careerBucketOther,
      programNps,
      futureHelp,
      commitment,
      stayInTouch,
      favouritePartsOther,
      mostValuableWeek,
      doubleDownOn,
      cutOrChange,
      peopleToCallOut,
      referrals,
      testimonial,
    },
    (saved) => {
      const set = <K extends string>(k: K, fn: (v: never) => void, type: "string" | "number" | "stringArray") => {
        const v = (saved as Record<string, unknown>)[k];
        if (type === "string" && typeof v === "string") fn(v as never);
        if (type === "number" && typeof v === "number") fn(v as never);
        if (type === "stringArray" && Array.isArray(v) && v.every((x) => typeof x === "string"))
          fn(v as never);
      };
      set("bestPart", setBestPart, "string");
      set("whatChange", setWhatChange, "string");
      set("anythingElsePulse", setAnythingElsePulse, "string");
      set("dayNps", setDayNps, "number");
      set("knowledgeAis", setKnowledgeAis, "number");
      set("knowledgeEvals", setKnowledgeEvals, "number");
      set("knowledgeFt", setKnowledgeFt, "number");
      set("knowledgeMech", setKnowledgeMech, "number");
      set("fieldFit", setFieldFit, "number");
      set("careerClarity", setCareerClarity, "number");
      set("programNps", setProgramNps, "number");
      set("favouriteParts", setFavouriteParts, "stringArray");
      set("futureHelp", setFutureHelp, "stringArray");
      set("careerBucket", setCareerBucket, "string");
      set("careerBucketOther", setCareerBucketOther, "string");
      set("commitment", setCommitment, "string");
      set("stayInTouch", setStayInTouch, "string");
      set("favouritePartsOther", setFavouritePartsOther, "string");
      set("mostValuableWeek", setMostValuableWeek, "string");
      set("doubleDownOn", setDoubleDownOn, "string");
      set("cutOrChange", setCutOrChange, "string");
      set("peopleToCallOut", setPeopleToCallOut, "string");
      set("referrals", setReferrals, "string");
      set("testimonial", setTestimonial, "string");
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
      `/api/survey/prefill?form=intake&participantId=${encodeURIComponent(participantId)}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.found) setPrefill(d);
        else setPrefill(null);
      })
      .catch(() => setPrefill(null));
  }, [participantId]);

  function toggle(arr: string[], v: string, max?: number) {
    if (arr.includes(v)) return arr.filter((x) => x !== v);
    if (max && arr.length >= max) return arr;
    return [...arr, v];
  }

  function intakeHint(score: number | null | undefined) {
    if (typeof score === "number" && score > 0) {
      return `You said ${score}/10 at intake`;
    }
    return undefined;
  }

  function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!participantId) return setError("Please select your name.");
    if (typeof dayNps !== "number") return setError("Please rate today.");
    if (!bestPart.trim()) return setError("Please write a best part.");
    if (!whatChange.trim()) return setError("Please write something to change.");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (favouriteParts.length === 0)
      return setError("Please pick at least one favourite part.");
    setSubmitting(true);
    try {
      const [pulseRes, exitRes] = await Promise.all([
        fetch("/api/survey/pulse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId,
            week: "Week 4: Project day",
            dayNps,
            bestPart,
            whatChange,
            anythingElse: anythingElsePulse,
          }),
        }),
        fetch("/api/survey/exit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId,
            knowledgeAis,
            knowledgeEvals,
            knowledgeFt,
            knowledgeMech,
            fieldFit,
            careerClarity,
            careerBucket,
            careerBucketOther: careerBucket === "Other" ? careerBucketOther : "",
            commitment,
            stayInTouch,
            testimonial,
            favouriteParts,
            favouritePartsOther: favouriteParts.includes("Other") ? favouritePartsOther : "",
            mostValuableWeek,
            doubleDownOn,
            cutOrChange,
            peopleToCallOut,
            programNps,
            referrals,
            futureHelp,
          }),
        }),
      ]);
      if (!pulseRes.ok || !exitRes.ok) {
        const detail = !pulseRes.ok ? await pulseRes.json().catch(() => ({})) : await exitRes.json().catch(() => ({}));
        throw new Error(detail.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormPage
      title="TAISI Exit Survey"
      submitted={submitted}
      successTitle={firstName ? `Thanks ${firstName}!` : "Thanks for submitting"}
      successBody={<p>See you at the demos.</p>}
    >
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-8 mt-8">
          {(error || loadError) && (
            <p className="text-center text-accent text-[15px] font-medium leading-[1.7]">
              {error || loadError}
            </p>
          )}

          <p className="text-[14px] text-text-secondary text-center">
            Step 1 of 2: project day check-in
          </p>

          <CohortAndNamePicker
            participantId={participantId}
            onParticipantChange={setParticipantId}
            cohort={cohort}
            onCohortChange={setCohort}
            participants={participants}
            loading={loading}
          />

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
              value={anythingElsePulse}
              onChange={(e) => setAnythingElsePulse(e.target.value)}
            />
          </FormField>

          <div className="flex justify-center">
            <button
              type="submit"
              className="primary-cta px-8 py-3 text-[15px]"
            >
              Next
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          {error && (
            <p className="text-center text-accent text-[15px] font-medium leading-[1.7]">
              {error}
            </p>
          )}

          <p className="text-[14px] text-text-secondary text-center">
            Step 2 of 2: program wrap-up
          </p>

          <RatingGroup
            label="How would you rate your knowledge of..."
            required
            lowLabel="1 = complete beginner"
            highLabel="10 = could teach this"
          >
            <RatingRow
              rowLabel={
                "AI safety / alignment broadly" +
                (intakeHint(prefill?.knowledgeAis) ? ` (${intakeHint(prefill?.knowledgeAis)})` : "")
              }
              value={knowledgeAis}
              onChange={setKnowledgeAis}
            />
            <RatingRow
              rowLabel={
                "AI evaluations" +
                (intakeHint(prefill?.knowledgeEvals) ? ` (${intakeHint(prefill?.knowledgeEvals)})` : "")
              }
              value={knowledgeEvals}
              onChange={setKnowledgeEvals}
            />
            <RatingRow
              rowLabel={
                "Fine-tuning / RLHF" +
                (intakeHint(prefill?.knowledgeFt) ? ` (${intakeHint(prefill?.knowledgeFt)})` : "")
              }
              value={knowledgeFt}
              onChange={setKnowledgeFt}
            />
            <RatingRow
              rowLabel={
                "Mechanistic interpretability" +
                (intakeHint(prefill?.knowledgeMech) ? ` (${intakeHint(prefill?.knowledgeMech)})` : "")
              }
              value={knowledgeMech}
              onChange={setKnowledgeMech}
            />
          </RatingGroup>

          <RatingScale
            name="fieldFit"
            label="How confident are you now that AI safety is the right field for you?"
            hint={intakeHint(prefill?.fieldFit)}
            required
            value={fieldFit}
            onChange={setFieldFit}
            lowLabel="1 = not at all"
            highLabel="10 = very confident"
          />

          <RatingScale
            name="careerClarity"
            label="I have a clear sense of how I would actually pursue a career in AI safety from where I am today."
            hint={intakeHint(prefill?.careerClarity)}
            required
            value={careerClarity}
            onChange={setCareerClarity}
            lowLabel="1 = no idea"
            highLabel="10 = concrete plan"
          />

          <FormField label="Which best describes your AIS plans right now?" required>
            <SelectWrapper>
              <select
                required
                className="form-input form-select"
                value={careerBucket}
                onChange={(e) => setCareerBucket(e.target.value)}
              >
                <option value="" disabled>
                  Select one
                </option>
                {CAREER_BUCKETS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>

          {careerBucket === "Other" && (
            <FormField label="Tell us more" required>
              <input
                type="text"
                required
                className="form-input"
                value={careerBucketOther}
                onChange={(e) => setCareerBucketOther(e.target.value)}
              />
            </FormField>
          )}

          <FormField
            label="What is one specific AIS-related thing you'll do in the next 30 days?"
            hint="Be specific"
            required
          >
            <textarea
              rows={3}
              required
              className="form-input resize-y"
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
            />
          </FormField>

          <FormField
            label="Name any people from this program you want to stay in touch with."
            required
          >
            <textarea
              rows={3}
              required
              className="form-input resize-y"
              value={stayInTouch}
              onChange={(e) => setStayInTouch(e.target.value)}
            />
          </FormField>

          <FormField
            label="Favourite parts of the program (pick up to 3)"
            required
          >
            <div className="space-y-2">
              {FAVOURITE_PARTS.map((p) => {
                const checked = favouriteParts.includes(p);
                const disabled = !checked && favouriteParts.length >= 3;
                return (
                  <label
                    key={p}
                    className={
                      "flex items-center gap-2 text-[15px] " +
                      (disabled ? "text-text-secondary opacity-50" : "")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() =>
                        setFavouriteParts(toggle(favouriteParts, p, 3))
                      }
                    />
                    {p}
                  </label>
                );
              })}
            </div>
          </FormField>

          {favouriteParts.includes("Other") && (
            <FormField label="Other (specify)">
              <input
                type="text"
                className="form-input"
                value={favouritePartsOther}
                onChange={(e) => setFavouritePartsOther(e.target.value)}
              />
            </FormField>
          )}

          <FormField label="Most valuable or fun week">
            <SelectWrapper>
              <select
                className="form-input form-select"
                value={mostValuableWeek}
                onChange={(e) => setMostValuableWeek(e.target.value)}
              >
                <option value="">No preference</option>
                {WEEKS_4.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>

          <FormField label="What should we double down on next cohort?" required>
            <textarea
              rows={3}
              required
              className="form-input resize-y"
              value={doubleDownOn}
              onChange={(e) => setDoubleDownOn(e.target.value)}
            />
          </FormField>

          <FormField
            label="With hindsight, what should we cut or change next cohort?"
            required
          >
            <textarea
              rows={3}
              required
              className="form-input resize-y"
              value={cutOrChange}
              onChange={(e) => setCutOrChange(e.target.value)}
            />
          </FormField>

          <FormField
            label="Any specific facilitators, TAs, or speakers worth calling out?"
            hint="Positive or negative"
          >
            <textarea
              rows={3}
              className="form-input resize-y"
              value={peopleToCallOut}
              onChange={(e) => setPeopleToCallOut(e.target.value)}
            />
          </FormField>

          <RatingScale
            name="programNps"
            label="How likely are you to recommend this program to a friend interested in AI safety?"
            required
            min={0}
            value={programNps}
            onChange={setProgramNps}
            lowLabel="0 = not at all"
            highLabel="10 = extremely likely"
          />

          <FormField
            label="Got a quote we can share?"
            hint="Optional. We use these on the website and in funder reports."
          >
            <textarea
              rows={3}
              className="form-input resize-y"
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
            />
          </FormField>

          <FormField
            label="Do you know 1 to 3 people who'd be a great fit for a future TAISI cohort?"
            hint="Names + emails or LinkedIn URLs welcome"
          >
            <textarea
              rows={3}
              className="form-input resize-y"
              value={referrals}
              onChange={(e) => setReferrals(e.target.value)}
            />
          </FormField>

          <FormField label="Would you be willing to help with a future TAISI program?">
            <div className="space-y-2">
              {FUTURE_HELP.map((p) => {
                const checked = futureHelp.includes(p);
                return (
                  <label key={p} className="flex items-center gap-2 text-[15px]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setFutureHelp(toggle(futureHelp, p))}
                    />
                    {p}
                  </label>
                );
              })}
            </div>
          </FormField>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="border border-black/30 px-6 py-3 text-[15px] hover:border-black/60"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="primary-cta px-8 py-3 text-[15px] disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      )}
    </FormPage>
  );
}
