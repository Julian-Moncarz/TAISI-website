# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build (use to verify changes compile)
- No test suite or linter configured

## Architecture

Next.js 16 app (App Router) with Tailwind CSS v4. Deployed on Vercel.

**Pages:** Home (`/`), Fellowships (`/fellowships`), Intensive (`/intensive`, with `/summer-intensive` redirecting to it), Reach out (`/reach-out`)

**Printed QR codes** point at `/qr`, a temporary redirect defined in `next.config.ts`. It lands on the home page with `?signup=1`, which opens the mailing list dialog, and `?loc=<event>`, which is recorded as the Source on the Email List row. Repoint `loc` when the code is reused for a different event. `qr.png` at the repo root is the generated code; `/qr-club-fair` is an older path kept alive for anything already printed.

**API routes** submit to Airtable:
- `POST /api/subscribe` - Mailing list signup (writes email, submission time, and Source to the Email List table)
- `POST /api/apply` - Summer intensive application with resume upload
- `POST /api/contact` - Reach out form (name, email, message). Writes to the "Contact us" table (`tbl3HQU5rwtitOSNr`) in the "Master Table" base (`appXooH0bbhwJh3QT`). The `Email` and `Message` fields were added to that table for this form. Includes a `company` honeypot field: if filled, the submission is dropped and reports success.
- `POST /api/working-professionals-eoi` - Working Professionals expression-of-interest (name, email, LinkedIn/portfolio). Writes to the "Working Professionals EOI" table (`tblvuakrOt7JSZPdT`) in the "October Intensive" base (`app798YMmVWgN0Acg`). No longer surfaced on the site: `/intensive` now links out to an Airtable form instead.

**Environment variables** (set in Vercel): `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`, `AIRTABLE_RESUME_FIELD_ID`

**Local secrets / testing:** The Airtable PAT for local dev lives at `~/.claude/taisi-secrets.env` (machine-level, never committed). Copy `AIRTABLE_PAT` from there into a gitignored `.env.local` at the repo root before running `npm run dev` against Airtable. The PAT also has Airtable metadata (schema) read/write, so you can list bases/tables via `https://api.airtable.com/v0/meta/bases`.

**Layout:** `layout.tsx` renders shared `Nav` component and footer. Nav is a client component with mobile hamburger menu.

**Styling:** Tailwind v4 with theme tokens defined in `globals.css` via `@theme` (not a tailwind config file). Key colors: `--color-accent: #D94F30`, `--color-navy: #1A3355`. Form inputs use a `.form-input` class in globals.css.

## Design Rules

- **No rounded corners** - all buttons, inputs, cards must be sharp/square (`rounded-none` or no border-radius)
- **No em dashes** - never use `&mdash;` or the `--` character. Restructure sentences instead.
- **No salesy copy** - plain, direct language. No marketing fluff or exclamation marks.
- Max-width container: `max-w-[1200px] mx-auto`
