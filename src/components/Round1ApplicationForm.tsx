"use client";

import { useState, type FormEvent } from "react";
import { FileInput, FormField, RequiredFieldsNote, SuccessPanel } from "@/components/FormControls";

// TODO: replace with the real article applicants should read.
const ARTICLE_URL = "https://example.com/article";

export default function Round1ApplicationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const data = new FormData(e.currentTarget);

    const payload = new FormData();
    payload.set("name", data.get("name") as string);
    payload.set("email", data.get("email") as string);
    payload.set("linkedin", data.get("linkedin") as string);
    payload.set("github", (data.get("github") as string) || "");
    payload.set("why", data.get("why") as string);
    payload.set("weakest", data.get("weakest") as string);
    payload.set("strongest", data.get("strongest") as string);

    const resumeFile = data.get("resume") as File;
    if (resumeFile && resumeFile.size > 0) {
      payload.set("resume", resumeFile);
    }

    try {
      const res = await fetch("/api/round1-application", {
        method: "POST",
        body: payload,
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <SuccessPanel title="Application submitted" className="!mx-0 !mt-0">
        <p>Thanks for applying. We&rsquo;ll review your application and be in touch with next steps.</p>
      </SuccessPanel>
    );
  }

  return (
    <>
      <RequiredFieldsNote />
      <form onSubmit={handleSubmit} className="max-w-[640px] space-y-8 mt-8">
        {error && <p className="text-accent text-[15px] font-medium">{error}</p>}

        <FormField label="Name" required>
          <input type="text" name="name" required className="form-input" />
        </FormField>

        <FormField label="Email" required>
          <input type="email" name="email" required className="form-input" />
        </FormField>

        <FormField label="LinkedIn" required>
          <input type="url" name="linkedin" required className="form-input" placeholder="https://linkedin.com/in/..." />
        </FormField>

        <FormField label="Resume" required hint="PDF only">
          <FileInput name="resume" accept=".pdf,application/pdf" required />
        </FormField>

        <FormField label="Github" hint="Optional">
          <input type="url" name="github" className="form-input" placeholder="https://github.com/..." />
        </FormField>

        <FormField label="Briefly describe why you want to do this program" hint="2-3 sentences" required>
          <textarea name="why" required rows={4} className="form-input resize-y" />
        </FormField>

        <div className="border border-black/15 bg-black/[0.02] p-5">
          <p className="text-[15px] font-medium text-text mb-1">
            Skim{" "}
            <a
              href={ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              this article
            </a>
            , then answer the two questions below.
          </p>
        </div>

        <FormField
          label="What claims or arguments do you think are weakest? Why?"
          hint="2-5 sentences"
          required
        >
          <textarea name="weakest" required rows={5} className="form-input resize-y" />
        </FormField>

        <FormField
          label="What claims or arguments do you think are strongest? Why?"
          hint="2-5 sentences"
          required
        >
          <textarea name="strongest" required rows={5} className="form-input resize-y" />
        </FormField>

        <button
          type="submit"
          disabled={submitting}
          className="primary-cta px-8 py-3 text-[15px] disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit application"}
        </button>
      </form>
    </>
  );
}
