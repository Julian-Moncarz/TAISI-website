// The "notify me when applications open" form. It used to be an Airtable
// form; that form's table was deleted, which broke every button pointing at
// it, so the form now lives on the site at /interest and writes to the
// "Expression of Interest" table through /api/interest.
export const INTEREST_FORM_PATH = "/interest";

/**
 * Link to the interest form. `program` arrives preselected, and `from`
 * records which button was used, so a run of signups can be traced back to
 * the page that produced it.
 */
export function interestFormHref(
  program?: "fellowship" | "intensive" | "both",
  from?: string
) {
  const params = new URLSearchParams();
  if (program) params.set("program", program);
  if (from) params.set("from", from);
  const query = params.toString();
  return query ? `${INTEREST_FORM_PATH}?${query}` : INTEREST_FORM_PATH;
}
