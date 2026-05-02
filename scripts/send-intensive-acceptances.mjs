#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = resolve(SCRIPT_DIR, "..");
const TAISI_DIR = resolve(WEBSITE_DIR, "..");

const BASE_ID = "appVfG77MoQbG3bgi";
const TABLE_ID = "tblzpCIOIsRpfJryh";
const FROM = "Julian from TAISI <julian@taisi.ca>";
const SUBJECT = "Congratulations! You've been accepted to TAISI's summer intensive";
const CONFIRMATION_BASE_URL = "https://taisi.ca/intensive-acceptance";

const COHORT_DETAILS = {
  "June Sat": {
    name: "June Saturday",
    dates: "June 6, 13, 20, and 27, 2026",
  },
  "June Sun": {
    name: "June Sunday",
    dates: "June 7, 14, 21, and 28, 2026",
  },
  "July Sat": {
    name: "July Saturday",
    dates: "July 4, 11, 18, and 25, 2026",
  },
  "July Sun": {
    name: "July Sunday",
    dates: "July 5, 12, 19, and 26, 2026",
  },
  "August Sat": {
    name: "August Saturday",
    dates: "August 1, 8, 15, and 22, 2026",
  },
  "August Sun": {
    name: "August Sunday",
    dates: "August 2, 9, 16, and 23, 2026",
  },
};

const args = parseArgs(process.argv.slice(2));
await loadEnvFile(resolve(WEBSITE_DIR, ".env.local"));
await loadEnvFile(resolve(WEBSITE_DIR, ".env.production.local"));

const airtablePat = process.env.AIRTABLE_SCRIPT_PAT || await readAirtablePatFromGuide() || process.env.AIRTABLE_PAT;
const resendSendKey = process.env.RESEND_SCRIPT_API_KEY || process.env.RESEND_API_KEY;
const resendAuditKey = process.env.RESEND_AUDIT_KEY || resendSendKey || "";

if (!airtablePat) {
  throw new Error("Missing AIRTABLE_PAT and could not read airtable_guide.md");
}

if (args.send && !resendSendKey) {
  throw new Error("Missing RESEND_API_KEY; live sending requires it");
}

const records = await fetchAcceptedRecords();
const previousSentEmails = await fetchPreviouslySentEmails();
const messages = records
  .map(buildMessage)
  .filter((message) => shouldIncludeMessage(message, previousSentEmails));

printSummary(records, messages, previousSentEmails);
printExamples(messages.slice(0, args.exampleCount));

if (!args.send) {
  console.log("\nDry run only. No emails were sent.");
  console.log("To send this exact filtered batch, rerun with --send.");
  process.exit(0);
}

if (messages.length === 0) {
  console.log("\nNo messages to send.");
  process.exit(0);
}

await sendMessages(messages);

async function fetchAcceptedRecords() {
  const records = [];
  let offset = "";

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("filterByFormula", "AND({Decision}='Intensive', {cohort}!='')");
    url.searchParams.append("sort[0][field]", "cohort");
    url.searchParams.append("sort[0][direction]", "asc");
    url.searchParams.append("sort[1][field]", "Full Name");
    url.searchParams.append("sort[1][direction]", "asc");
    if (offset) url.searchParams.set("offset", offset);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${airtablePat}` },
    });
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Airtable list failed ${response.status}: ${body}`);
    }

    const page = JSON.parse(body);
    records.push(...(page.records || []));
    offset = page.offset || "";
  } while (offset);

  return records;
}

async function fetchPreviouslySentEmails() {
  if (!resendAuditKey || args.noSkipAlreadySent) return new Set();

  const sent = new Set();
  let cursor = "";

  for (let page = 0; page < args.resendPages; page += 1) {
    const url = new URL("https://api.resend.com/emails");
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("after", cursor);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${resendAuditKey}` },
    });
    const body = await response.text();
    if (!response.ok) {
      console.warn(`Warning: could not list Resend emails for duplicate checking (${response.status}). Continuing without previous-send skip.`);
      return new Set();
    }

    const data = JSON.parse(body);
    for (const email of data.data || []) {
      if (email.subject === SUBJECT) {
        for (const recipient of email.to || []) {
          sent.add(recipient.toLowerCase());
        }
      }
    }

    if (!data.has_more || !data.data?.length) break;
    cursor = data.data[data.data.length - 1].id;
  }

  return sent;
}

function buildMessage(record) {
  const fields = record.fields || {};
  const name = stringValue(fields["Full Name"]);
  const email = stringValue(fields.Email).toLowerCase();
  const decision = stringValue(fields.Decision);
  const cohort = stringValue(fields.cohort);
  const details = COHORT_DETAILS[cohort];

  if (decision !== "Intensive" || !name || !email || !details) {
    return {
      recordId: record.id,
      name,
      email,
      decision,
      cohort,
      invalidReason:
        decision !== "Intensive"
          ? `Decision is not Intensive: ${decision || "(blank)"}`
          : !details
            ? `Unknown cohort: ${cohort || "(blank)"}`
            : "Missing name or email",
    };
  }

  const confirmationLink = buildConfirmationLink({
    recordId: record.id,
    name,
    email,
    cohort,
  });

  const first = firstName(name);

  return {
    recordId: record.id,
    name,
    first,
    email,
    decision,
    cohort,
    cohortName: details.name,
    cohortDates: details.dates,
    subject: SUBJECT,
    confirmationLink,
    text: renderText({ first, cohortName: details.name, cohortDates: details.dates, confirmationLink }),
    html: renderHtml({ first, cohortName: details.name, cohortDates: details.dates, confirmationLink }),
  };
}

function shouldIncludeMessage(message, previousSentEmails) {
  if (message.invalidReason) return false;
  if (args.onlyEmails.size > 0 && !args.onlyEmails.has(message.email)) return false;
  if (args.excludeEmails.has(message.email)) return false;
  if (previousSentEmails.has(message.email)) return false;
  if (args.limit && args.includedCount >= args.limit) return false;
  args.includedCount += 1;
  return true;
}

function buildConfirmationLink({ recordId, name, email, cohort }) {
  const url = new URL(CONFIRMATION_BASE_URL);
  url.searchParams.set("recordId", recordId);
  url.searchParams.set("name", name);
  url.searchParams.set("email", email);
  url.searchParams.set("cohort", cohort);
  return url.toString();
}

function renderText({ first, cohortName, cohortDates, confirmationLink }) {
  return `Hi ${first},

Congratulations! You've been accepted to TAISI's summer intensive.

We received far more strong applications than expected, and yours stood out to us. We're excited to offer you a spot in our ${cohortName} cohort at Trajectory Labs.

Your cohort will meet on:

${cohortDates}

Please mark these dates in your calendar now. Participation in all four sessions is required.

We will also have a kickoff meeting on Zoom one week before your cohort starts. We'll send details closer to the date.

To confirm your spot, please fill out this form: ${confirmationLink}

If you have any questions, please reply to this email.

Looking forward,
TAISI team`;
}

function renderHtml({ first, cohortName, cohortDates, confirmationLink }) {
  return `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;">
  <p>Hi ${escapeHtml(first)},</p>
  <p>Congratulations! You've been accepted to TAISI's summer intensive.</p>
  <p>We received far more strong applications than expected, and yours stood out to us. We're excited to offer you a spot in our ${escapeHtml(cohortName)} cohort at Trajectory Labs.</p>
  <p>Your cohort will meet on:</p>
  <p><strong>${escapeHtml(cohortDates)}</strong></p>
  <p>Please mark these dates in your calendar now. Participation in all four sessions is required.</p>
  <p>We will also have a kickoff meeting on Zoom one week before your cohort starts. We'll send details closer to the date.</p>
  <p>To confirm your spot, please <a href="${escapeHtml(confirmationLink)}" style="color: #D94F30; text-decoration: underline;">fill out this form</a>.</p>
  <p>If you have any questions, please reply to this email.</p>
  <p>Looking forward,<br/>TAISI team</p>
</div>`;
}

async function sendMessages(messages) {
  console.log(`\nSending ${messages.length} emails...`);

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];
    const data = await sendWithRetry(message);
    console.log(`${index + 1}/${messages.length} sent ${message.email} ${data.id}`);
    await sleep(1250);
  }
}

async function sendWithRetry(message) {
  const maxAttempts = 6;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendSendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [message.email],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    const body = await response.text();
    if (response.ok) return JSON.parse(body);

    if (response.status === 429 && attempt < maxAttempts) {
      const waitMs = 3000 * attempt;
      console.warn(`Rate limited while sending ${message.email}; retrying in ${waitMs / 1000}s`);
      await sleep(waitMs);
      continue;
    }

    throw new Error(`Resend failed for ${message.email} (${response.status}): ${body}`);
  }
}

function printSummary(records, messages, previousSentEmails) {
  const invalid = records.map(buildMessage).filter((message) => message.invalidReason);
  const excluded = records
    .map(buildMessage)
    .filter((message) => !message.invalidReason && !messages.some((item) => item.recordId === message.recordId));
  const byCohort = groupBy(messages, "cohort");

  console.log(`Accepted Airtable records with cohorts: ${records.length}`);
  console.log(`Ready to send after filters: ${messages.length}`);
  console.log(`Previously sent emails skipped: ${previousSentEmails.size}`);
  if (args.excludeEmails.size) console.log(`Manually excluded: ${Array.from(args.excludeEmails).join(", ")}`);
  if (args.onlyEmails.size) console.log(`Only included: ${Array.from(args.onlyEmails).join(", ")}`);

  console.log("\nReady by cohort:");
  for (const [cohort, cohortMessages] of Object.entries(byCohort).sort()) {
    console.log(`- ${cohort}: ${cohortMessages.length}`);
  }

  if (invalid.length) {
    console.log("\nInvalid records skipped:");
    for (const item of invalid) {
      console.log(`- ${item.recordId} ${item.email || "(no email)"}: ${item.invalidReason}`);
    }
  }

  const skippedPreviouslySent = excluded.filter((message) => previousSentEmails.has(message.email));
  if (skippedPreviouslySent.length) {
    console.log("\nSkipped because Resend already has this acceptance subject:");
    for (const item of skippedPreviouslySent) {
      console.log(`- ${item.name} <${item.email}>`);
    }
  }
}

function printExamples(examples) {
  console.log(`\nExample rendered email${examples.length === 1 ? "" : "s"}:`);
  for (const message of examples) {
    console.log("\n---");
    console.log(`To: ${message.name} <${message.email}>`);
    console.log(`Subject: ${message.subject}`);
    console.log(`Confirmation link: ${message.confirmationLink}`);
    console.log("\nText body:\n");
    console.log(message.text);
  }
}

function parseArgs(argv) {
  const parsed = {
    send: false,
    noSkipAlreadySent: false,
    resendPages: 10,
    exampleCount: 2,
    limit: 0,
    includedCount: 0,
    onlyEmails: new Set(),
    excludeEmails: new Set(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (!argv[index]) throw new Error(`Missing value for ${arg}`);
      return argv[index];
    };

    if (arg === "--send") parsed.send = true;
    else if (arg === "--no-skip-already-sent") parsed.noSkipAlreadySent = true;
    else if (arg === "--resend-pages") parsed.resendPages = Number(next());
    else if (arg === "--example-count") parsed.exampleCount = Number(next());
    else if (arg === "--limit") parsed.limit = Number(next());
    else if (arg === "--only-email") parsed.onlyEmails.add(next().toLowerCase());
    else if (arg === "--exclude-email") parsed.excludeEmails.add(next().toLowerCase());
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

async function readAirtablePatFromGuide() {
  try {
    const guide = await readFile(resolve(TAISI_DIR, "airtable_guide.md"), "utf8");
    return guide.match(/PAT: `([^`]+)`/)?.[1] || "";
  } catch {
    return "";
  }
}

async function loadEnvFile(path) {
  try {
    const contents = await readFile(path, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Optional local env file.
  }
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key] || "(blank)";
    groups[value] ||= [];
    groups[value].push(item);
    return groups;
  }, {});
}

function firstName(name) {
  return name.trim().split(/\s+/)[0] || name;
}

function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
