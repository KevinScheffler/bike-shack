# Project Log

Persistent memory. Read at the start of every session. Keep entries concise — decisions, why, and risks to watch.

---

## 2026-07-17 — Theme onboarding

- Ran `onboard-theme`. Wrote `OUTPUT-initial-theme-analysis.md`.
- **Finding:** Theme is **stock Dawn 15.4.1**, unmodified. All 54 sections / 37 snippets / 185 assets match Dawn defaults; no custom feature files exist. Clean baseline.
- **Key conventions locked in:** `.page-width` wrapper (max-width 1200px); `section-{{ section.id }}-padding` style block using a **× 0.75** mobile multiplier (note: CLAUDE.md example shows 0.5 — theme's actual is 0.75, follow the theme); RGB-triplet color vars + `.color-{scheme}` classes (5 schemes); mobile-first breakpoints 750px / 990px; vanilla JS web components + `pubsub.js` events from `constants.js`; fully translation-driven (`t:` keys), no hardcoded text.
- **No `blocks/` folder** — this Dawn version defines blocks inline in section schemas.
- **Risks / open items:**
  - `client-notes.md` is still an empty template — fill in client/brand context before building client-facing features.
  - No `.claude/context/reference/` yet — no visual/design references analyzed.
  - Keep all new work additive; do not modify `base.css`, `global.js`, or other base files.
