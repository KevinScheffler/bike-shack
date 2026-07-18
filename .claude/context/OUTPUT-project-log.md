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

## 2026-07-18 — Feature: modern-product-grid (scoped)

- **Setup:** consolidated the theme-context tracking onto `main` (via PR #1) and dropped the separate `chore/track-theme-context` branch. Feature work lives on `feat-modern-product-grid` (local only, not yet pushed). `backup-pre-squash` kept as a safety net.
- **Scoped** a custom collection section (Approach A): standalone `section-modern-product-grid.liquid` + CSS, CSS-only interactions, no base-theme changes. Chose custom over extending Dawn's `main-collection-product-grid` to own the distinctive notch/stagger/hover cleanly and stay additive.
- **Key decisions:** 4/2/2 columns (desktop/tablet/mobile); even columns offset ~½ card on desktop only; notched lower-right outline (crisp SVG/mask, not box-shadow) with title+price label in the notch; accent = its own section setting (defaults to scheme link color); colors from Dawn color schemes (not the reference's dark+lime brand); secondary-image swipe-from-top on hover (desktop only, graceful fallback for single-image products); native `{% paginate %}` + `pagination.liquid`, 4/8/12 per page (default 8).
- **v1 explicitly excludes:** filtering/facets, sorting, quick-add, collection picker.
- **Risk to watch:** the notched-corner outline CSS is the fiddliest part — reserve space so long titles never overlap the stroke. Full spec in `.claude/features/feature-modern-product-grid/feature.md`.
