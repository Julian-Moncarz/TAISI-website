"use client";

import { useState, type FormEvent } from "react";
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

export default function IntakeSurveyPage() {
  const { participants, loading, error: loadError } = useParticipants();
  const [participantId, setParticipantId] = useState("");
  const [cohort, setCohort] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [knowledgeAis, setKnowledgeAis] = useState<number | null>(null);
  const [knowledgeEvals, setKnowledgeEvals] = useState<number | null>(null);
  const [knowledgeFt, setKnowledgeFt] = useState<number | null>(null);
  const [knowledgeMech, setKnowledgeMech] = useState<number | null>(null);
  const [fieldFit, setFieldFit] = useState<number | null>(null);
  const [careerClarity, setCareerClarity] = useState<number | null>(null);
  const [careerBucket, setCareerBucket] = useState("");
  const [careerBucketOther, setCareerBucketOther] = useState("");
  const [counterfactual, setCounterfactual] = useState("");

  useAutosave(
    "intake",
    participantId,
    {
      counterfactual,
      knowledgeAis,
      knowledgeEvals,
      knowledgeFt,
      knowledgeMech,
      fieldFit,
      careerClarity,
      careerBucket,
      careerBucketOther,
    },
    (saved) => {
      if (typeof saved.counterfactual === "string") setCounterfactual(saved.counterfactual);
      if (typeof saved.knowledgeAis === "number") setKnowledgeAis(saved.knowledgeAis);
      if (typeof saved.knowledgeEvals === "number") setKnowledgeEvals(saved.knowledgeEvals);
      if (typeof saved.knowledgeFt === "number") setKnowledgeFt(saved.knowledgeFt);
      if (typeof saved.knowledgeMech === "number") setKnowledgeMech(saved.knowledgeMech);
      if (typeof saved.fieldFit === "number") setFieldFit(saved.fieldFit);
      if (typeof saved.careerClarity === "number") setCareerClarity(saved.careerClarity);
      if (typeof saved.careerBucket === "string") setCareerBucket(saved.careerBucket);
      if (typeof saved.careerBucketOther === "string") setCareerBucketOther(saved.careerBucketOther);
    },
    submitted
  );

  const firstName = participants.find((p) => p.id === participantId)?.name.split(" ")[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!participantId) {
      setError("Please select your name.");
      return;
    }
    setSubmitting(true);

    const payload = {
      participantId,
      counterfactual,
      knowledgeAis,
      knowledgeEvals,
      knowledgeFt,
      knowledgeMech,
      fieldFit,
      careerClarity,
      careerBucket,
      careerBucketOther: careerBucket === "Other" ? careerBucketOther : "",
    };

    try {
      const res = await fetch("/api/survey/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      title="TAISI Intake Survey"
      intro={
        <p>
          A few quick questions before the program starts. Takes about 5 minutes.
        </p>
      }
      submitted={submitted}
      successTitle={firstName ? `Thanks ${firstName}!` : "Thanks for submitting"}
      successBody={<p>See you on Day 1.</p>}
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

        <FormField
          label="If TAISI summer intensives didn't exist, what would you be doing on these Saturdays?"
          hint="1 to 2 sentences"
          required
        >
          <textarea
            rows={3}
            required
            className="form-input resize-y"
            value={counterfactual}
            onChange={(e) => setCounterfactual(e.target.value)}
          />
        </FormField>

        <RatingGroup
          label="How would you rate your knowledge of..."
          required
          lowLabel="1 = complete beginner"
          highLabel="10 = could teach this"
        >
          <RatingRow
            rowLabel="AI safety / alignment broadly"
            value={knowledgeAis}
            onChange={setKnowledgeAis}
          />
          <RatingRow
            rowLabel="AI evaluations"
            value={knowledgeEvals}
            onChange={setKnowledgeEvals}
          />
          <RatingRow
            rowLabel="Fine-tuning / RLHF"
            value={knowledgeFt}
            onChange={setKnowledgeFt}
          />
          <RatingRow
            rowLabel="Mechanistic interpretability"
            value={knowledgeMech}
            onChange={setKnowledgeMech}
          />
        </RatingGroup>

        <RatingScale
          name="fieldFit"
          label="How confident are you that AI safety is the right field for you?"
          value={fieldFit}
          onChange={setFieldFit}
          lowLabel="1 = not at all"
          highLabel="10 = very confident"
        />

        <RatingScale
          name="careerClarity"
          label="I have a clear sense of how I would actually pursue a career in AI safety from where I am today."
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
