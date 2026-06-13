"use client";

import { FormField } from "@/components/FormControls";

// Shared label set for the fully-labeled 5-point agreement scale.
export const AGREEMENT_POINTS = [
  "Strongly disagree",
  "Slightly disagree",
  "Neutral",
  "Slightly agree",
  "Strongly agree",
];

// Reusable single-question scale: a row of labelled cells (the label lives
// inside each clickable cell). One grid per question. `points` gives the cell
// labels; without it, falls back to plain numbered buttons.
export function RatingScale({
  name,
  label,
  hint,
  required,
  value,
  onChange,
  min = 1,
  max = 5,
  points,
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
  points?: string[];
  lowLabel?: string;
  highLabel?: string;
}) {
  const values: number[] = [];
  for (let i = min; i <= max; i++) values.push(i);
  const labels = points && points.length === values.length ? points : null;

  return (
    <FormField label={label} hint={hint} required={required}>
      <input type="hidden" name={name} value={value ?? ""} />
      {labels ? (
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
        >
          {values.map((n, idx) => {
            const selected = value === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                aria-pressed={selected}
                className={
                  "border px-1.5 py-2.5 min-h-[52px] flex items-center justify-center text-center text-[12px] sm:text-[13px] leading-[1.2] break-words transition-colors " +
                  (selected
                    ? "bg-accent text-white border-accent font-medium"
                    : "bg-white text-text border-black/25 hover:border-black/55 hover:bg-black/[0.02]")
                }
              >
                {labels[idx]}
              </button>
            );
          })}
        </div>
      ) : (
        <>
          {(lowLabel || highLabel) && (
            <div className="mb-2 text-[12px] text-text-secondary leading-[1.5]">
              {lowLabel && <div>{lowLabel}</div>}
              {highLabel && <div>{highLabel}</div>}
            </div>
          )}
          <div className="flex justify-between w-full gap-1">
            {values.map((n) => {
              const selected = value === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(n)}
                  aria-label={String(n)}
                  aria-pressed={selected}
                  className={
                    "w-8 h-8 rounded-full border text-[12px] font-medium flex items-center justify-center " +
                    (selected
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-text border-black/25 hover:border-black/60")
                  }
                >
                  {n}
                </button>
              );
            })}
          </div>
        </>
      )}
    </FormField>
  );
}
