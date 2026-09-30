// Types for geo-lib.jsx, which stays plain JS so it can be diffed against the
// design file it was ported from.
import type { ReactElement } from "react";

export type GeoDef = {
  label: string;
  note: string;
  /** Length of the object's motion, in seconds. */
  dur: number;
};

export const LIB: Record<string, GeoDef>;

export function Scene(props: {
  def: GeoDef;
  /** Time in seconds. Past `dur` the object rests in its final pose. */
  T: number;
  /** Skip the fade-in over the first second, for objects that loop. */
  noFade?: boolean;
  /** Outline weight in viewBox units. */
  strokeWidth?: number;
  /** A document-unique id for the object's exact colour bands. */
  gradId?: string;
}): ReactElement;

/** Bounds of the object's final pose, in viewBox units. */
export function finalBox(def: GeoDef): { x0: number; y0: number; x1: number; y1: number };

/** Bounds of the object's opening frame, in viewBox units. */
export function firstBox(def: GeoDef): { x0: number; y0: number; x1: number; y1: number };
