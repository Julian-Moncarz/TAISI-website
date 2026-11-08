// The "notify me when applications open" form. It used to be an Airtable
// form; that form's table was deleted, which broke every button pointing at
// it, so the form now lives on the site at /interest and writes to the
// "Expression of Interest" table through /api/interest.
export const INTEREST_FORM_PATH = "/interest";

/**
 * Link to the interest form, behind every "Express interest" button. `from`
 * records which button was used, so a run of signups can be traced back to
 * the page that produced it.
 */
export function interestFormHref(from?: string) {
  return from ? `${INTEREST_FORM_PATH}?from=${encodeURIComponent(from)}` : INTEREST_FORM_PATH;
}

// The community Discord invite. Until it is set, the hero's Join our Discord
// button shows but points nowhere.
export const DISCORD_URL = "";
