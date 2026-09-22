# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build (use to verify changes compile)
- No test suite or linter configured

## Architecture

Next.js 16 app (App Router) with Tailwind CSS v4. Deployed on Vercel.

**Pages:**
- Home (`/`), Fellowships (`/fellowships`), Intensive (`/intensive`, with `/summer-intensive` redirecting to it via `next.config.ts`), Reach out (`/reach-out`) - the public site
- `/september-fellowship` - spot-confirmation form for people offered a September fellowship place. Reached from offer emails with `recordId`/`name`/`email` query params.
- `/interest` - the "notify me when applications open" form, behind every Express interest button on the site. Takes `?program=fellowship|intensive|both` to preselect a program and `?from=` to record which button was used. Links are built with `interestFormHref()` in `src/lib/links.ts`, never hand-written.

**Printed QR codes** point at `/qr`, a temporary redirect defined in `next.config.ts`. It lands on the home page with `?signup=1`, which opens the mailing list dialog, and `?loc=<event>`, which is recorded as the Source on the Email List row. Repoint `loc` when the code is reused for a different event. `qr.png` at the repo root is the generated code; `/qr-club-fair` is an older path kept alive for anything already printed.

**API routes** (all write to Airtable):
- `POST /api/subscribe` - Mailing list signup (email, submission time, and Source to base `appLQunyWZ3t3kx5o`, table `tblH7kI5rrYwne7a9`), then sends a welcome email via Resend.
- `POST /api/qr-visit` - Logs a QR scan to the "QR Scans" table in `AIRTABLE_BASE_ID`. Fired from the home page when it loads with a `?loc=` value.
- `POST /api/contact` - Reach out form (name, email, message). Writes to the "Contact us" table (`tbl3HQU5rwtitOSNr`) in the "Master Table" base (`appXooH0bbhwJh3QT`). The `Email` and `Message` fields were added to that table for this form. Includes a `company` honeypot field: if filled, the submission is dropped and reports success.
- `POST /api/september-fellowship` - September fellowship spot confirmation. Updates the applicant's record (`AIRTABLE_BASE_ID`/`AIRTABLE_TABLE_ID`) and sends a confirmation email via Resend.
- `POST /api/interest` - Expression of interest. Writes name, email, program, affiliation, year, source, and submission time to the "Expression of Interest" table (`tblwFurDfscp9Z8AL`) in the fellowship base (`app16GwTflH97nQy5`). Carries the same `company` honeypot as the contact route. This replaced an Airtable-hosted form whose table was deleted in September 2026, which broke the link on every page at once: keeping the form on the site means a deleted table shows up in the build rather than silently on the live site.

**Email:** `src/lib/email.ts` wraps Resend (`RESEND_API_KEY`). All sends are fire-and-forget: failures are logged, never surfaced to the user.

**Environment variables** (set in Vercel): `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`, `RESEND_API_KEY`

**Local secrets / testing:** The Airtable PAT for local dev lives at `~/.claude/taisi-secrets.env` (machine-level, never committed). Copy `AIRTABLE_PAT` from there into a gitignored `.env.local` at the repo root before running `npm run dev` against Airtable. The PAT also has Airtable metadata (schema) read/write, so you can list bases/tables via `https://api.airtable.com/v0/meta/bases`.

**Layout:** `layout.tsx` renders shared `Nav` and `Footer`. `AnnouncementBar` is not currently rendered; add it back above `Nav` in the layout's sticky wrapper when there is something to announce. Nav is a client component with a mobile hamburger menu and a Programs flyout that opens onto Fellowship and Intensive. The interest-form link is built by `interestFormHref()` in `src/lib/links.ts`; the fellowship application itself is still an Airtable form.

**Styling:** Tailwind v4 with theme tokens defined in `globals.css` via `@theme` (not a tailwind config file). The palette comes from the mark (see `taisi_tabling/` in the projects folder): `--color-accent: #501684` (primary purple, carries buttons and links), `--color-plum: #38095F` and `--color-plum-deep: #1B0630` (deeper purples), `--color-plum-light: #6B2FA0`, `--color-amber: #FF9F03` (gold), `--color-cream: #FCF8F1`. Gold only ever sits on purple or as a rule: it is 3.3:1 on white even at `--color-amber-deep`, too weak for text. Form inputs use a `.form-input` class in globals.css.

**Motion:** Entrances are deliberately quiet and defined in `globals.css`. `.intro-rise` and `.art-fade` play on load, `.reveal` plays when a section is scrolled to. One entrance carries a whole block, so a section arrives as a unit rather than element by element. Every one of them is switched off under `prefers-reduced-motion`.

**History note:** One-off program tooling (application/availability/acceptance forms, participant surveys, ops scripts for offers and rejections) was removed in the August 2026 cleanup. Check git history if a new cohort needs something similar again.

## Design Rules

- **No rounded corners** - all buttons, inputs, cards must be sharp/square (`rounded-none` or no border-radius)
- **No em dashes** - never use `&mdash;` or the `--` character. Restructure sentences instead.
- **No salesy copy** - plain, direct language. No marketing fluff or exclamation marks.
- Max-width container: `max-w-[1200px] mx-auto`
