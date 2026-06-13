// Activity rating labels for the pulse survey. Stored in Airtable as the label
// text (singleSelect), so both the form UI and the API route map a 1..5 pick to
// the same words. The notebook-learning item uses its own label set.

export const NOTEBOOK_LEARNING_ACTIVITY =
  "Notebook content: how much did you feel you learned from it?";

export const ACTIVITY_POINTS = ["Poor", "Fair", "Okay", "Good", "Loved it"];
export const NOTEBOOK_LEARNING_POINTS = [
  "Very little",
  "A little",
  "Some",
  "A lot",
  "A ton",
];

// Map a 1..5 rating for a given activity to its word label.
export function activityLabel(
  activity: string,
  value: number | null | undefined
): string | null {
  if (typeof value !== "number" || value < 1 || value > 5) return null;
  const points =
    activity === NOTEBOOK_LEARNING_ACTIVITY
      ? NOTEBOOK_LEARNING_POINTS
      : ACTIVITY_POINTS;
  return points[value - 1];
}
