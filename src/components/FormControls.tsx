"use client";

import { type ReactNode } from "react";

export function RequiredFieldsNote() {
  return (
    <p className="t-small mb-0">
      Fields marked with <span className="text-ink">*</span> are required.
    </p>
  );
}

export function SuccessPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card w-full max-w-[560px] p-6 sm:p-8 ${className}`}>
      <h2 className="t-h2 mb-4">{title}</h2>
      {children && <div className="t-body">{children}</div>}
    </div>
  );
}

export function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block mb-2">
        <span className="text-[14px] font-medium text-ink">
          {label}
          {required && <span className="text-mute ml-0.5">*</span>}
        </span>
        {hint && <span className="block text-[13px] text-mute mt-0.5">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
