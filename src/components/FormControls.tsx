"use client";

import { useRef, useState, type ReactNode } from "react";

export function RequiredFieldsNote() {
  return (
    <p className="text-[15px] text-text-secondary mb-0">
      Fields marked with <span className="text-accent">*</span> are required.
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
    <div className={`mt-8 mx-auto w-full max-w-[500px] border border-black/20 p-6 sm:p-8 ${className}`}>
      <h2 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-text tracking-normal mb-3">
        {title}
      </h2>
      {children && (
        <div className="text-[15px] sm:text-[16px] text-text-secondary leading-[1.7]">
          {children}
        </div>
      )}
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
      <label className="block mb-1.5">
        <span className="text-[15px] font-medium text-text">
          {label}
          {required && <span className="text-accent ml-0.5">*</span>}
        </span>
        {hint && (
          <span className="block text-[13px] text-text-secondary mt-0.5">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

export function SelectWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function FileInput({
  name,
  accept,
  required,
}: {
  name: string;
  accept: string;
  required?: boolean;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          required={required}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(event) => setFileName(event.target.files?.[0]?.name || null)}
        />
        <div className="form-input text-left">
          <span className={fileName ? "" : "text-[#9ca3af]"}>
            {fileName || "Choose file"}
          </span>
        </div>
      </div>
      {fileName && (
        <div className="mt-2 flex items-center gap-2 text-[14px] text-text-secondary">
          <span>{fileName}</span>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              setFileName(null);
            }}
            className="text-accent hover:text-accent-hover transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
