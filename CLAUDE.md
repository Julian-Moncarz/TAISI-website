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

**Printed QR codes** point at `/qr`, a temporary redirect defined in `next.config.ts`. It lands on the home page with `?signup=1`, which opens the mailing list dialog, and `?loc=<event>`, which is recorded as the Source on the Email List row. Repoint `loc` when the code is reused for a different event. `qr.png` at the repo root is the generated code; `/qr-club-fair` is an older path kept alive for anything already printed.

**API routes** (all write to Airtable):
- `POST /api/subscribe` - Mailing list signup (email, submission time, and Source to base `appLQunyWZ3t3kx5o`, table `tblH7kI5rrYwne7a9`), then sends a welcome email via Resend.
- `POST /api/qr-visit` - Logs a QR scan to the "QR Scans" table in `AIRTABLE_BASE_ID`. Fired from the home page when it loads with a `?loc=` value.
- `POST /api/contact` - Reach out form (name, email, message). Writes to the "Contact us" table (`tbl3HQU5rwtitOSNr`) in the "Master Table" base (`appXooH0bbhwJh3QT`). The `Email` and `Message` fields were added to that table for this form. Includes a `company` honeypot field: if filled, the submission is dropped and reports success.
- `POST /api/september-fellowship` - September fellowship spot confirmation. Updates the applicant's record (`AIRTABLE_BASE_ID`/`AIRTABLE_TABLE_ID`) and sends a confirmation email via Resend.

**Email:** `src/lib/email.ts` wraps Resend (`RESEND_API_KEY`). All sends are fire-and-forget: failures are logged, never surfaced to the user.

**Environment variables** (set in Vercel): `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`, `RESEND_API_KEY`

**Local secrets / testing:** The Airtable PAT for local dev lives at `~/.claude/taisi-secrets.env` (machine-level, never committed). Copy `AIRTABLE_PAT` from there into a gitignored `.env.local` at the repo root before running `npm run dev` against Airtable. The PAT also has Airtable metadata (schema) read/write, so you can list bases/tables via `https://api.airtable.com/v0/meta/bases`.

**Layout:** `layout.tsx` renders `AnnouncementBar`, shared `Nav`, and `Footer`. Nav is a client component with a mobile hamburger menu and a Programs flyout that opens onto Fellowship and Intensive. External application links live in `src/lib/links.ts` and `AnnouncementBar.tsx` (Airtable forms).

**Styling:** Tailwind v4 with theme tokens defined in `globals.css` via `@theme` (not a tailwind config file). Key colors: `--color-accent: #D94F30`, `--color-navy: #1A3355`. Form inputs use a `.form-input` class in globals.css.

**Motion:** Entrances are deliberately quiet and defined in `globals.css`. `.intro-rise` and `.art-fade` play on load, `.reveal` plays when a section is scrolled to. One entrance carries a whole block, so a section arrives as a unit rather than element by element. Every one of them is switched off under `prefers-reduced-motion`.

**History note:** One-off program tooling (application/availability/acceptance forms, participant surveys, ops scripts for offers and rejections) was removed in the August 2026 cleanup. Check git history if a new cohort needs something similar again.

## Design Rules

- **No rounded corners** - all buttons, inputs, cards must be sharp/square (`rounded-none` or no border-radius)
- **No em dashes** - never use `&mdash;` or the `--` character. Restructure sentences instead.
- **No salesy copy** - plain, direct language. No marketing fluff or exclamation marks.
- Max-width container: `max-w-[1200px] mx-auto`
