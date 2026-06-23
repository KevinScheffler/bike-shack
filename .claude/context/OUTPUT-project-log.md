[Do not write this manually. AI maintains this file automatically after every meaningful action.]

This is the project's persistent memory. AI reads it at the start of every session to restore context. It will contain:

- **Timestamped entries** — What was done and when
- **Decisions made** — What was decided and why, including alternatives that were considered
- **Architectural choices** — Technical decisions that affect the project long-term
- **Risks & open questions** — Things to watch out for in future development

## 2026-06-23 — Theme onboarding

- Ran `onboard-theme`. Analyzed the full codebase and wrote `OUTPUT-initial-theme-analysis.md`.
- **Finding:** Theme is **stock Shopify Dawn 15.4.1** — no custom files detected. Clean baseline.
- **Key conventions documented:** flexbox `.grid`/`.grid__item` system; breakpoints 750px / 990px; color-scheme + RGB-triplet CSS vars; BEM naming; `page-width` containers; vanilla-JS Custom Web Components with pub/sub (`PUB_SUB_EVENTS`); 100% translation-driven (`t:` keys).
- **Watch out:** CLAUDE.md's padding example uses `0.5` mobile scaling, but Dawn 15.4.1 actually uses **`0.75`** — follow the real theme value.
- **Do-not-touch base JS:** `global.js`, `constants.js`, `pubsub.js`.
- No `reference/` images present; visual analysis skipped.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# OUTPUT-project-log.md — v1.0

# AI Shopify Developer Bootcamp

# by Coding with Jan

# https://codingwithjan.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
