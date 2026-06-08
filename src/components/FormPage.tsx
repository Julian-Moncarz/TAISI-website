"use client";

import type { ReactNode } from "react";
import { SuccessPanel } from "@/components/FormControls";

// Centered-by-default page wrapper for Airtable-backed forms.
// Provides:
//  - Section with site max-width + page padding
//  - Centered title
//  - Optional intro text block (centered, max-w-[640px])
//  - Centered <form> wrapper at a sensible reading width
//  - SuccessPanel that's centered when the submitted state is shown
export function FormPage({
  title,
  intro,
  formWidth = "640px",
  submitted,
  successTitle,
  successBody,
  children,
}: {
  title: string;
  intro?: ReactNode;
  formWidth?: string;
  submitted: boolean;
  successTitle: string;
  successBody?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <h1 className="text-center text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] leading-[0.98] tracking-normal mb-6 font-semibold">
          {title}
        </h1>

        {intro && (
          <div
            className="mx-auto space-y-4 text-center text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary"
            style={{ maxWidth: "640px" }}
          >
            {intro}
          </div>
        )}

        {submitted ? (
          <SuccessPanel title={successTitle} className="mx-auto">
            {successBody}
          </SuccessPanel>
        ) : (
          <div className="mx-auto" style={{ maxWidth: formWidth }}>
            <div className="mt-8 mb-8">
              <span className="block mb-1.5 text-[15px] font-medium text-text">
                Have anonymous feedback?
              </span>
              <div className="form-input">
                <a
                  href="https://airtable.com/appVfG77MoQbG3bgi/pagCFWbfrImkt4nq4/form"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent font-medium underline underline-offset-4 hover:opacity-80"
                >
                  anonymous feedback form link
                </a>
              </div>
            </div>
            {children}
          </div>
        )}
      </section>
    </main>
  );
}
