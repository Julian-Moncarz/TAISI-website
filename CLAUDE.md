# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build (use to verify changes compile)
- No test suite or linter configured

## Architecture

Next.js 16 app (App Router) with Tailwind CSS v4. Deployed on Vercel.

**Pages:** Home (`/`), Fellowships (`/fellowships`), Summer Intensive (`/summer-intensive`), QR redirect (`/qr`)

**API routes** submit to Airtable:
- `POST /api/qr-signup` - Email capture (writes to Email List table)
- `POST /api/apply` - Summer intensive application with resume upload

**Environment variables** (set in Vercel): `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`, `AIRTABLE_RESUME_FIELD_ID`

**Layout:** `layout.tsx` renders shared `Nav` component and footer. Nav is a client component with mobile hamburger menu.

**Styling:** Tailwind v4 with theme tokens defined in `globals.css` via `@theme` (not a tailwind config file). Key colors: `--color-accent: #D94F30`, `--color-navy: #1A3355`. Form inputs use a `.form-input` class in globals.css.

## Design Rules

- **No rounded corners** - all buttons, inputs, cards must be sharp/square (`rounded-none` or no border-radius)
- **No em dashes** - never use `&mdash;` or the `--` character. Restructure sentences instead.
- **No salesy copy** - plain, direct language. No marketing fluff or exclamation marks.
- Max-width container: `max-w-[1200px] mx-auto`
