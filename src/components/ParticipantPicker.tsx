"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormField, SelectWrapper } from "@/components/FormControls";

export type Participant = { id: string; name: string; cohort?: string };

export const COHORTS = [
  "June Sat",
  "June Sun",
  "July Sat",
  "July Sun",
  "August Sat",
  "August Sun",
];

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/survey/participants")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.participants) setParticipants(d.participants);
        else setError(d.error || "Could not load participants");
      })
      .catch(() => {
        if (!cancelled) setError("Could not load participants");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { participants, loading, error };
}

function NameCombobox({
  participants,
  value,
  onChange,
  loading,
  disabledReason,
}: {
  participants: Participant[];
  value: string;
  onChange: (id: string) => void;
  loading: boolean;
  disabledReason?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => participants.find((p) => p.id === value),
    [participants, value]
  );

  // When the parent clears value (cohort change), clear the typed query too.
  useEffect(() => {
    if (!value) setQuery("");
    else if (selected) setQuery(selected.name);
  }, [value, selected]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, participants]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  // Click outside to close.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(p: Participant) {
    onChange(p.id);
    setQuery(p.name);
    setOpen(false);
  }

  const isDisabled = loading || !!disabledReason;

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input so HTML `required` validation on the form picks it up. */}
      <input type="hidden" name="participantId" value={value} />
      <input
        type="text"
        autoComplete="off"
        className="form-input"
        placeholder={
          loading
            ? "Loading..."
            : disabledReason
            ? disabledReason
            : "Type to search..."
        }
        disabled={isDisabled}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          // Typing invalidates the previous selection until they click one.
          if (value) onChange("");
        }}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            if (matches[highlight]) {
              e.preventDefault();
              pick(matches[highlight]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && !isDisabled && (
        <ul
          className="absolute z-10 left-0 right-0 mt-1 max-h-60 overflow-auto border border-black/30 bg-white shadow-md"
          role="listbox"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-[14px] text-text-secondary">
              No matches
            </li>
          ) : (
            matches.map((p, i) => (
              <li
                key={p.id}
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => {
                  // mousedown beats blur so the click registers before the input loses focus.
                  e.preventDefault();
                  pick(p);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={
                  "px-3 py-2 text-[15px] cursor-pointer " +
                  (i === highlight ? "bg-black/5" : "")
                }
              >
                {p.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// Cohort-first picker: select cohort, then the name dropdown shrinks to that cohort.
// When `cohort` prop is provided (URL prefill), the cohort dropdown is hidden.
export function CohortAndNamePicker({
  participantId,
  onParticipantChange,
  cohort,
  onCohortChange,
  participants,
  loading,
  hideCohortPicker = false,
}: {
  participantId: string;
  onParticipantChange: (id: string) => void;
  cohort: string;
  onCohortChange: (c: string) => void;
  participants: Participant[];
  loading: boolean;
  hideCohortPicker?: boolean;
}) {
  const filtered = useMemo(
    () =>
      cohort ? participants.filter((p) => p.cohort === cohort) : participants,
    [cohort, participants]
  );

  // If the previously-selected participant is no longer in the filtered list, clear it.
  useEffect(() => {
    if (!participantId) return;
    if (!filtered.find((p) => p.id === participantId)) {
      onParticipantChange("");
    }
  }, [filtered, participantId, onParticipantChange]);

  return (
    <>
      {!hideCohortPicker && (
        <FormField label="Your cohort" required>
          <SelectWrapper>
            <select
              required
              value={cohort}
              onChange={(e) => onCohortChange(e.target.value)}
              className="form-input form-select"
            >
              <option value="" disabled>
                Select your cohort
              </option>
              {COHORTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </FormField>
      )}

      <FormField label="Your name" required>
        <NameCombobox
          participants={filtered}
          value={participantId}
          onChange={onParticipantChange}
          loading={loading}
          disabledReason={
            !hideCohortPicker && !cohort ? "Pick a cohort first" : undefined
          }
        />
      </FormField>
    </>
  );
}

// Cohort-agnostic picker (used for the 6-month follow-up where cohorts are mixed).
export function ParticipantPicker({
  value,
  onChange,
  participants,
  loading,
}: {
  value: string;
  onChange: (id: string) => void;
  participants: Participant[];
  loading: boolean;
}) {
  // For mixed-cohort use, append cohort to the searchable display.
  const withCohort = useMemo(
    () =>
      participants.map((p) => ({
        ...p,
        name: p.cohort ? `${p.name} (${p.cohort})` : p.name,
      })),
    [participants]
  );
  return (
    <FormField label="Your name" required>
      <NameCombobox
        participants={withCohort}
        value={value}
        onChange={onChange}
        loading={loading}
      />
    </FormField>
  );
}
