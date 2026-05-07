"use client";

import { FormField } from "@/components/FormControls";

// Round, full-width-distributed scale. Default 1..10.
export function RatingButtons({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const buttons: number[] = [];
  for (let i = min; i <= max; i++) buttons.push(i);

  return (
    <div className="flex justify-between w-full gap-1">
      {buttons.map((n) => {
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={
              "w-7 h-7 sm:w-8 sm:h-8 rounded-full border text-[12px] font-medium transition-all flex items-center justify-center " +
              (selected
                ? "bg-accent text-white border-accent shadow-[0_0_0_3px_rgba(217,79,48,0.18)] scale-110"
                : "bg-white text-text border-black/25 hover:border-black/60 hover:scale-105")
            }
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

export function RatingScale({
  name,
  label,
  hint,
  required,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <FormField label={label} hint={hint} required={required}>
      <input type="hidden" name={name} value={value ?? ""} />
      {(lowLabel || highLabel) && (
        <div className="mb-2 text-[12px] text-text-secondary leading-[1.5]">
          {lowLabel && <div>{lowLabel}</div>}
          {highLabel && <div>{highLabel}</div>}
        </div>
      )}
      <RatingButtons value={value} onChange={onChange} min={min} max={max} />
    </FormField>
  );
}

// Compact row used inside RatingGroup (no per-row label/hint/lowHigh).
export function RatingRow({
  rowLabel,
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  rowLabel: string;
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[15px] font-medium text-text">{rowLabel}</div>
      <RatingButtons value={value} onChange={onChange} min={min} max={max} />
    </div>
  );
}

export function RatingGroup({
  label,
  required,
  lowLabel,
  highLabel,
  children,
}: {
  label: string;
  required?: boolean;
  lowLabel?: string;
  highLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1.5">
        <span className="text-[15px] font-medium text-text">
          {label}
          {required && <span className="text-accent ml-0.5">*</span>}
        </span>
      </label>
      {(lowLabel || highLabel) && (
        <div className="mb-4 text-[12px] text-text-secondary leading-[1.5]">
          {lowLabel && <div>{lowLabel}</div>}
          {highLabel && <div>{highLabel}</div>}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
