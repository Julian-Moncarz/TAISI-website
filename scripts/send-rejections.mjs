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
const SUBJECT = "TAISI summer intensive application update";
const BLUEDOT_URL = "https://bluedot.org/courses/technical-ai-safety";

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

const records = await fetchRejectRecords();
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

async function fetchRejectRecords() {
  const records = [];
  let offset = "";

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("filterByFormula", "{Decision}='Reject'");
    url.searchParams.append("sort[0][field]", "Full Name");
    url.searchParams.append("sort[0][direction]", "asc");
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

  if (decision !== "Reject" || !name || !email || !email.includes("@")) {
    return {
      recordId: record.id,
      name,
      email,
      decision,
      invalidReason:
        decision !== "Reject"
          ? `Decision is not Reject: ${decision || "(blank)"}`
          : "Missing name or email",
    };
  }

  return {
    recordId: record.id,
    name,
    email,
    decision,
    subject: SUBJECT,
    text: renderText({ name }),
    html: renderHtml({ name }),
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

function renderText({ name }) {
  return `Hi ${name},

Thank you for applying to TAISI's summer intensive.

We received far more applications than expected, and unfortunately we don't have the capacity to offer you a spot in this round.

We still encourage you to keep exploring AI safety. In particular, we recommend applying to BlueDot's Technical AI Safety course, which covers much of the same core content and is a strong way to build your understanding of the field:

${BLUEDOT_URL}

Thanks again for applying.

Best,
TAISI team`;
}

function renderHtml({ name }) {
  return `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;">
  <p>Hi ${escapeHtml(name)},</p>
  <p>Thank you for applying to TAISI's summer intensive.</p>
  <p>We received far more applications than expected, and unfortunately we don't have the capacity to offer you a spot in this round.</p>
  <p>We still encourage you to keep exploring AI safety. In particular, we recommend applying to BlueDot's Technical AI Safety course, which covers much of the same core content and is a strong way to build your understanding of the field:</p>
  <p><a href="${BLUEDOT_URL}" style="color: #D94F30; text-decoration: underline;">${BLUEDOT_URL}</a></p>
  <p>Thanks again for applying.</p>
  <p>Best,<br/>TAISI team</p>
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

  console.log(`Reject Airtable records loaded: ${records.length}`);
  console.log(`Ready to send after filters: ${messages.length}`);
  console.log(`Previously sent emails skipped by subject: ${previousSentEmails.size}`);
  if (args.excludeEmails.size) console.log(`Manually excluded: ${Array.from(args.excludeEmails).join(", ")}`);
  if (args.onlyEmails.size) console.log(`Only included: ${Array.from(args.onlyEmails).join(", ")}`);

  if (invalid.length) {
    console.log("\nInvalid records skipped:");
    for (const item of invalid) {
      console.log(`- ${item.recordId} ${item.email || "(no email)"}: ${item.invalidReason}`);
    }
  }
}

function printExamples(examples) {
  console.log(`\nExample rendered email${examples.length === 1 ? "" : "s"}:`);
  for (const message of examples) {
    console.log("\n---");
    console.log(`To: ${message.name} <${message.email}>`);
    console.log(`Subject: ${message.subject}`);
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
