"use client";

import { useEffect, useRef } from "react";

const PREFIX = "taisi-survey";

function key(form: string, participantId: string) {
  return `${PREFIX}:${form}:${participantId}`;
}

// Persists `state` to localStorage keyed by form + participantId, and rehydrates
// once via `onHydrate` whenever participantId changes (or on mount if already set).
// Pass `cleared=true` to wipe storage (e.g. on successful submit).
export function useAutosave<T extends Record<string, unknown>>(
  form: string,
  participantId: string,
  state: T,
  onHydrate: (saved: Partial<T>) => void,
  cleared: boolean
) {
  const hydratedFor = useRef<string | null>(null);

  // Hydrate when participantId becomes available.
  useEffect(() => {
    if (!participantId) return;
    if (hydratedFor.current === participantId) return;
    hydratedFor.current = participantId;
    try {
      const raw = localStorage.getItem(key(form, participantId));
      if (raw) onHydrate(JSON.parse(raw));
    } catch {
      // ignore
    }
    // onHydrate is stable enough; we intentionally rehydrate only on participant change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId, form]);

  // Save on every state change.
  useEffect(() => {
    if (!participantId || cleared) return;
    try {
      localStorage.setItem(key(form, participantId), JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [form, participantId, state, cleared]);

  // Clear on success.
  useEffect(() => {
    if (cleared && participantId) {
      try {
        localStorage.removeItem(key(form, participantId));
      } catch {
        // ignore
      }
    }
  }, [cleared, form, participantId]);
}
