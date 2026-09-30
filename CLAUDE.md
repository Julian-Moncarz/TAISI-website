# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build (use to verify changes compile)
- No test suite or linter configured

## Architecture

Next.js 16 app (App Router) with Tailwind CSS v4. Deployed on Vercel.

**Pages:**
- Home (`/`), Fellowships (`/fellowships`), Team (`/team`) - the public site. The Intensive and the Reach out form were cut in September 2026; `/intensive`, `/summer-intensive` and `/reach-out` redirect to the home page via `next.config.ts`. People get in touch through the email address in the footer.
- `/september-fellowship` - spot-confirmation form for people offered a September fellowship place. Reached from offer emails with `recordId`/`name`/`email` query params.
- `/interest` - the "notify me when applications open" form, behind every "Express interest" button on the site. There is no fellowship application while applications are closed, so every call to action says "Express interest" and comes here. Takes `?from=` to record which button was used. Links are built with `interestFormHref(from)` in `src/lib/links.ts`, never hand-written. Every signup is recorded with Program "Fellowship".
- `/design-system` - the living design system reference (noindex, not linked): logo, colours, type, components, motion, and every approved geometric object. It renders the real tokens and components, so update it when you add or change one.

**Printed QR codes** point at `/qr`, a temporary redirect defined in `next.config.ts`. It lands on the home page with `?signup=1`, which opens the mailing list dialog, and `?loc=<event>`, which is recorded as the Source on the Email List row. Repoint `loc` when the code is reused for a different event. `qr.png` at the repo root is the generated code; `/qr-club-fair` is an older path kept alive for anything already printed.

**API routes** (all write to Airtable):
- `POST /api/subscribe` - Mailing list signup (email, submission time, and Source to base `appLQunyWZ3t3kx5o`, table `tblH7kI5rrYwne7a9`), then sends a welcome email via Resend.
- `POST /api/qr-visit` - Logs a QR scan to the "QR Scans" table in `AIRTABLE_BASE_ID`. Fired from the home page when it loads with a `?loc=` value.
- `POST /api/september-fellowship` - September fellowship spot confirmation. Updates the applicant's record (`AIRTABLE_BASE_ID`/`AIRTABLE_TABLE_ID`) and sends a confirmation email via Resend.
- `POST /api/interest` - Expression of interest. Writes name, email, program, affiliation, year, source, and submission time to the "Expression of Interest" table (`tblwFurDfscp9Z8AL`) in the fellowship base (`app16GwTflH97nQy5`). Carries a `company` honeypot: if filled, the submission is dropped and reports success. This replaced an Airtable-hosted form whose table was deleted in September 2026, which broke the link on every page at once: keeping the form on the site means a deleted table shows up in the build rather than silently on the live site.

**Email:** `src/lib/email.ts` wraps Resend (`RESEND_API_KEY`). All sends are fire-and-forget: failures are logged, never surfaced to the user.

**Environment variables** (set in Vercel): `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`, `RESEND_API_KEY`

**Local secrets / testing:** The Airtable PAT for local dev lives at `~/.claude/taisi-secrets.env` (machine-level, never committed). Copy `AIRTABLE_PAT` from there into a gitignored `.env.local` at the repo root before running `npm run dev` against Airtable. The PAT also has Airtable metadata (schema) read/write, so you can list bases/tables via `https://api.airtable.com/v0/meta/bases`.

**Layout:** `layout.tsx` renders shared `Nav` and `Footer` and the `LogoSprite` (the mark is defined once as an SVG symbol; `TaisiMark` and `Lockup` in `src/components/Logo.tsx` point at it). `AnnouncementBar` is not currently rendered; add it back above `Nav` in the layout's sticky wrapper when there is something to announce. Nav is a client component with a mobile menu. The footer carries the aubergine "Interested in the Winter Fellowship?" block (hidden on `/interest` and `/september-fellowship`, which are themselves the next step) and the mailing list form. Discord links render only once `DISCORD_URL` is set. Every page except the home page opens with `<PageHero title object>` (`src/components/PageHero.tsx`), so titles start at the same height and heroes share one object size; form pages put their form inside it.

**Styling:** The design comes from Claude Design ("TAISI Homepage v2" and "TAISI Web Design System v2"). Tailwind v4 with tokens in `globals.css` via `@theme`: `ink` (aubergine, type and lines), `mute` (grey body copy), `page` (white), `paper`, `cream`, `gold` (only ever on aubergine, never text on light grounds), `ember` (link hover), `rose` (errors), and `band-1` to `band-11` (the mark's ramp). Fonts: Jost Light for display (`font-display`), Geist for body. Use the component classes in globals.css rather than restyling from scratch: type is `t-display` (page titles) > `t-section` (section headings) > `t-h2` > `t-h3` > `t-h4`, plus `t-lead`, `t-quote`, `t-body`, `t-name`/`t-role` (people), `t-small`, `t-label`, and `.hang` for quotes that open with a mark. Components: `.link`, `.container-site`, `.btn` + `.btn-ink`/`.btn-ink-solid`/`.btn-gold`/`.btn-cream`, `.btn-text`, `.card`, `.cell-grid`, `.tag`, `.notice`, `.form-input`, and `.on-dark` for aubergine grounds. Page sections use `<Section object title>` (`src/components/Section.tsx`). Icons are outlined at a 1.75 stroke. Tailwind's default transition is set to the design's 200ms standard curve, so a bare `transition-colors` matches.

**Motion:** The geometric objects (`src/components/geo/`) are the site's motion. `geo-lib.jsx` is ported from the design file as plain JS so it can be diffed against later revisions; only the kinds in `objects.ts` (the approved object bank) may be used. `<GeoObject kind play align>`: `"view"` plays once per visit, only after the reader has scrolled and the object has risen well into view (section icons); `"loop"` ping-pongs while on screen (page heroes); `"mount"` plays on load (form pages). `GeoObject` scales every object so its finished pose is the same visual size, and `align="start"` pins it to the box's bottom-left so a section icon sits on the heading's left edge. No object appears more than once across the whole site (the design system page aside); Shards is currently the only unused one, so a new section takes that or frees one up. Objects show their opening frame, usually an outline, until they play. Section icons line up with the ink of the heading's first letter, not its box (`SectionIcon` measures it). `LogoSpin` is the logo animation. Text entrances are quiet: `.intro-rise` and `.intro-fade` on load. Everything, objects included, is switched off under `prefers-reduced-motion`.

**History note:** One-off program tooling (application/availability/acceptance forms, participant surveys, ops scripts for offers and rejections) was removed in the August 2026 cleanup. Check git history if a new cohort needs something similar again.

## Design Rules

- **No em dashes** - never use `&mdash;` or the `--` character. Restructure sentences instead.
- **No salesy copy** - plain, direct language. No marketing fluff or exclamation marks.
- Max-width container: `.container-site` (1200px)
