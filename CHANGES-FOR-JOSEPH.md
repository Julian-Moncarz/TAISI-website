# Changes on the julian-changes branch

here are all the changes we made. Joseph this is a menu for you to pick from - feel free to change or cut, or ask me why I made any choice where it does not fit with your model!

Each item below is one or more commits on this branch, newest work last. Every change is independently revertable; commit hashes are in parentheses.

## Hero

- **Removed the scroll-down chevron** at the bottom of the hero (`1c202db`).
- **The hero illustration scrolls away with the page** instead of staying pinned to the viewport and fading out (`dd5c6f7`).
- **Boats are back to charcoal grey**: removed the orange accent-tint filter (`bb20d89`).
- **Removed the drifting sailboat.** Reasoning: the page is already busy with the rotating headline word and the moving boat draws the eye away. Held with moderate confidence, may deserve a revert (`a26bedc`).

## Animations

- **Removed all entrance animations sitewide**: the Reveal component, staggered per-element fades, hero intro choreography, and the art fades on the fellowships and intensive pages. Content renders in place immediately. Interaction motion stays (rotating headline word, hovers) (`dc76f38`). A second opinion from a fresh model, blind to which option was live, independently favoured fewer entrance animations; we then went further and cut them all.

## What is AI safety? (home)

This section went through many drafts (`aa40c3d`, `8d7636f`, `ee75115`, `b093c9e`, `684668d`). Final state:

- Leads with the July 2026 sandbox-escape incidents: OpenAI models breaking out and hacking Hugging Face (linked to OpenAI's disclosure and the Black Hat talk video) and Anthropic's three disclosed escapes (linked to The Register).
- One-line diagnosis: "AI systems are advancing faster than they are being made safe."
- One-line definition: "AI safety is the field working to change that. It seeks to reduce risks from advanced AI through technical research, policy, and many other types of work."
- Deliberately cut along the way, ask Julian if you want any back: the US-military-planning link, the risk-scenario paragraph (cybercrime / bioweapons / disempowerment / loss of control), "this is the stupidest that the models will ever be", the "None of this is guaranteed..." hedge line, and a big centered pull-quote of the Statement on AI Risk attributed to Hinton and Bengio (`e2fc592`, later removed). The thinking: keep the body copy to documented incidents plus one observation, and stay well clear of fringe-doomer vibes.

## Why get involved? (new section, home)

- New section (`62b4c3d`, `103d32b`, `5487021`, `684668d`): talent-gap opener (only a few thousand people work on this full-time; the field needs people from math, law, policy, economics, philosophy, advocacy, entrepreneurship), a bolded TAISI mission line ("TAISI exists to find exceptional people like you and introduce you to the field."), then three "If you care about careers / impact / community" lines with the keywords in accent orange.

## Where can you work on AI safety? (org directory, home)

- **Replaced the expand/collapse two-tier list with a single curated 12-slot grid** on the same 4-column layout as the old research grid (`ec71b6a`, `87538f2` boxed them, then unboxed back to plain logo-and-text by request).
- **Cut** (aura/legibility judgment calls, all easy to restore): Geodesic, Kairos, Pivotal, IAPS, Palisade, MIRI, Constellation, LISA, ILIAD, FAR.AI, AISST, Timaeus, and later Center for AI Safety (`684668d`).
- **Added**: Resolution (the new $160M-backed alignment lab), UK AI Security Institute, and a "University labs" card with the U of T crest linking David Duvenaud, Sheila McIlraith, Zhijing Jin, and Nicolas Papernot (`684668d`).
- **Blurbs rewritten** to lead with each org's strongest credential ("Pioneered the field of AI control", "Evaluates frontier models for the top labs", etc.).
- Footnote links to the AI safety field map; the old university-labs paragraph and its links were folded into the new card.
- Section moved above Programming and retitled from "Where does AI safety work happen?" (`7df7b1c`, `684668d`).

## Examples of AI safety work (cut entirely)

- The 12-tile reading grid is gone (`62b4c3d`, with styling passes `83661a2` first). Reasoning: it signalled "CS people only" right under a fellowship card that says no ML background needed, and its 12 outbound links were the leakiest part of the page. The link list lives in git history if you want it back for a resources page.

## Programming section (home)

- Heading sized to match other sections instead of hero-sized (`c2c44f7`).
- Fellowship card restyled from solid orange fill to the navy outline look, matching Intensive (`b0038fa`, `62b4c3d` follow-ups).
- Fellowship card copy now sells the dinner: "free, fancy dinner at Trajectory Labs, an off-campus AI safety hub", on its own line (`6684eaf`).
- Intensive card now uses the intensive page's drawing (not the hero skyline) at a reduced size (`684668d`).
- **New Retreats card**: "TAISI sends students to the Harvard/MIT AI safety groups' workshops, and other AI safety retreats", with an MIT dome sketch (`684668d`, `eefe568`). No link target yet.

## Nav and footer

- **Programs hover flyout deleted**; Fellowship and Intensive are direct links in the nav bar, desktop and mobile (`96408b2`).
- Footer tagline ("AI safety needs more talent. Looking for it in Toronto.") cut (`9956a30`).

## Styling conventions introduced

- Text links are never orange at rest: body-coloured with an underline, orange on hover only (`948fc15`).
- Accent orange now signals emphasis (the careers/impact/community keywords), not links.

## Housekeeping

- Committed the staged August 2026 cleanup of one-off program tooling with a full catalogue in the commit message for recovery (`5292019`).
- Unused logo files for cut orgs are still in `public/logos/` on purpose, in case orgs return.

## Known loose ends

- The Retreats card has no destination page or link.
- Testimonials (with photos) exist only on the fellowships page; the home page still has no human faces. Julian's view: moving or duplicating them onto the home page is the highest-leverage next change for selling the community claim.
- The fellowships and intensive pages kept their per-element structure when animations were removed; copy there has not had the same editing pass as the home page.
