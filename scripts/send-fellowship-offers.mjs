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
const SEPTEMBER_FORM_URL = "https://taisi.ca/september-fellowship";
const SUMMER_FORM_URL = "https://taisi.ca/summer-fellowship-availability";

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

const records = args.testEmail
  ? [await fetchRecordById(args.testRecordId)]
  : await fetchFellowshipRecords();

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

async function fetchFellowshipRecords() {
  const records = [];
  let offset = "";

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("filterByFormula", "{Decision}='Fellowship'");
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

async function fetchRecordById(recordId) {
  if (!recordId) {
    throw new Error("--test-email requires --test-record-id");
  }

  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`, {
    headers: { Authorization: `Bearer ${airtablePat}` },
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Airtable test record read failed ${response.status}: ${body}`);
  }

  return JSON.parse(body);
}

async function fetchPreviouslySentEmails() {
  if (!resendAuditKey || args.noSkipAlreadySent || args.testEmail) return new Set();

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
  const deliveryEmail = args.testEmail || email;

  if (!args.testEmail && decision !== "Fellowship") {
    return {
      recordId: record.id,
      name,
      email,
      decision,
      invalidReason: `Decision is not Fellowship: ${decision || "(blank)"}`,
    };
  }

  if (!name || !email || !email.includes("@")) {
    return {
      recordId: record.id,
      name,
      email,
      decision,
      invalidReason: "Missing name or email",
    };
  }

  const septemberLink = buildPersonalizedLink(SEPTEMBER_FORM_URL, { recordId: record.id, name, email });
  const summerLink = buildPersonalizedLink(SUMMER_FORM_URL, { recordId: record.id, name, email });

  return {
    recordId: record.id,
    name,
    first: firstName(name),
    email,
    deliveryEmail,
    decision,
    subject: SUBJECT,
    septemberLink,
    summerLink,
    text: renderText({ name, septemberLink, summerLink }),
    html: renderHtml({ name, septemberLink, summerLink }),
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

function buildPersonalizedLink(baseUrl, { recordId, name, email }) {
  const url = new URL(baseUrl);
  url.searchParams.set("recordId", recordId);
  url.searchParams.set("name", name);
  url.searchParams.set("email", email);
  return url.toString();
}

function renderText({ name, septemberLink, summerLink }) {
  return `Hi ${name},

We received far more strong applications than expected, and we don't have the capacity to include everyone we were excited about in the intensive cohorts.

However, your application stood out to us. We would like to offer you a guaranteed spot in our September fellowship.

The fellowship covers much of the same core content as the intensive, but runs on a more spread-out schedule during the semester.

Please confirm your September fellowship spot here: ${septemberLink}

We are also working hard to create summer fellowship capacity. These would run on weekday evenings at Trajectory Labs, and be held over a fancy dinner.

If you are available for a summer evening fellowship, please share your availability here: ${summerLink}

Please reply to this email if you have any questions.

Thanks!
TAISI team`;
}

function renderHtml({ name, septemberLink, summerLink }) {
  return `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;">
  <p>Hi ${escapeHtml(name)},</p>
  <p>We received far more strong applications than expected, and we don't have the capacity to include everyone we were excited about in the intensive cohorts.</p>
  <p>However, your application stood out to us. We would like to offer you a guaranteed spot in our September fellowship.</p>
  <p>The fellowship covers much of the same core content as the intensive, but runs on a more spread-out schedule during the semester.</p>
  <p>Please <a href="${escapeHtml(septemberLink)}" style="color: #D94F30; text-decoration: underline;">confirm your September fellowship spot here</a>.</p>
  <p>We are also working hard to create summer fellowship capacity. These would run on weekday evenings at Trajectory Labs, and be held over a fancy dinner.</p>
  <p>If you are available for a summer evening fellowship, please <a href="${escapeHtml(summerLink)}" style="color: #D94F30; text-decoration: underline;">share your availability here</a>.</p>
  <p>Please reply to this email if you have any questions.</p>
  <p>Thanks!<br/>TAISI team</p>
</div>`;
}

async function sendMessages(messages) {
  console.log(`\nSending ${messages.length} emails...`);

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];
    const data = await sendWithRetry(message);
    console.log(`${index + 1}/${messages.length} sent ${message.deliveryEmail} ${data.id}`);
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
        to: [message.deliveryEmail],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    const body = await response.text();
    if (response.ok) return JSON.parse(body);

    if (response.status === 429 && attempt < maxAttempts) {
      const waitMs = 3000 * attempt;
      console.warn(`Rate limited while sending ${message.deliveryEmail}; retrying in ${waitMs / 1000}s`);
      await sleep(waitMs);
      continue;
    }

    throw new Error(`Resend failed for ${message.deliveryEmail} (${response.status}): ${body}`);
  }
}

function printSummary(records, messages, previousSentEmails) {
  const invalid = records.map(buildMessage).filter((message) => message.invalidReason);

  console.log(`Fellowship Airtable records loaded: ${records.length}`);
  console.log(`Ready to send after filters: ${messages.length}`);
  console.log(`Previously sent emails skipped: ${previousSentEmails.size}`);
  if (args.testEmail) console.log(`Test delivery override: ${args.testEmail}`);
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
    console.log(`Original applicant: ${message.name} <${message.email}>`);
    console.log(`Delivery to: ${message.deliveryEmail}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`September link: ${message.septemberLink}`);
    console.log(`Summer link: ${message.summerLink}`);
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
    testEmail: "",
    testRecordId: "",
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
    else if (arg === "--test-email") parsed.testEmail = next().toLowerCase();
    else if (arg === "--test-record-id") parsed.testRecordId = next();
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
