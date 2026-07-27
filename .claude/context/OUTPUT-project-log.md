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
- **Planned** (Phase 2): 8-step build plan in `OUTPUT-implementation-plan.md` + QA checklist in `OUTPUT-qa-debugging.md`. CSS-only (no JS). New files: `sections/section-modern-product-grid.liquid`, `assets/section-modern-product-grid.css`; touches `locales/en.default*.json` for new keys only. Reuses `{% paginate %}` + `pagination.liquid`, `.color-{scheme}`/`.gradient`, `.page-width`, the ×0.75 padding pattern. Decision: render `product.price | money` directly (no sale/compare-at badges on cards in v1) for the clean accent-price look.
- **Built** (pending QA): `sections/section-modern-product-grid.liquid` + `assets/section-modern-product-grid.css` (no JS). `shopify theme check` clean for both files. Build-time judgment calls to flag at QA:
  - **Schema labels use literal strings**, not new `t:` keys — new `t:` keys would trip `MatchingTranslations` across all ~50 `*.schema.json` locales (can't meaningfully translate a custom section into 50 langs). Storefront-facing text stays translated (reused `sections.collection_template.empty` + `products.product.price.from_price_html`). Only base-theme files touched: none (locale edits were reverted).
  - **Media locked to 1:1 aspect** so the notch SVG (viewBox 0 0 100, `preserveAspectRatio=none` + `non-scaling-stroke`) maps distortion-free.
  - **Hover reveal via `clip-path` inset** (top-down wipe), not a translate slide — avoids overflow clipping the notch stroke. Easing `cubic-bezier(0.16,1,0.3,1)`.
  - **Stagger via `translateY(42%)`** on `:nth-child(4n+2)/(4n)` desktop-only; grid has `margin-bottom: 9rem` clearance. Offset amount + clearance are the main QA-tuning candidates, along with the notch geometry and label fit for long titles.
- **QA Round 1 → failed (visual mismatch), fixed:** (1) images were `object-fit: cover` (cropped helmets) → now `contain` with padding, card locked to **4:5**; (2) notch was a big blocky square bite with the label *below* the card → redrew as a **concave rounded notch** (viewBox `0 0 80 100` matching 4:5 → no distortion) with the label tucked **inside** the notch. Verified shape via headless-Chrome render before re-handoff (`shopify theme check` clean). Open Q for user: label one-line (reference) vs stacked title/price (current, safer for long product titles).
- **QA Round 2 → cutoff bug fixed:** staggered even columns used `translateY(42%)` (no reserved layout space) → on wide screens they overflowed and the next section painted over them. Now offset + clearance share one var: `--mpg-stagger: clamp(6rem,10vw,12rem)` drives both `translateY` and grid `padding-bottom: calc(var(--mpg-stagger)+3rem)`, so the section always contains them. Verified via headless render. Round 3 checklist ready; label one-line-vs-stacked question still open.
- **QA Round 3 → hover fixed:** secondary image was inheriting the product shot's `contain`+padding, so the hover image was small and the top-down wipe looked partial. Secondary now `object-fit:cover; padding:0` full-bleed (fills whole card) with the top→bottom `clip-path` reveal kept. Product shot stays contained. Verified via headless render. Round 4 ready; label one-line-vs-stacked still open.
- **QA Round 4 → notch clipping fixed:** full-bleed lifestyle image covered the notch, so the price sat over the photo. Added a section-scoped SVG `clipPath` (objectBoundingBox notch path, id `mpg-notch-{{ section.id }}`) on a new `.mpg-card__media-clip` wrapper around both images; outline + label stay outside the clip. Images now respect the notch; label sits on clean bg. `theme check` clean, headless-verified. Round 5 ready; label one-line-vs-stacked still open.
- **QA Round 5 → elliptical transition:** matched the reference's DevTools exactly — reveal now uses `clip-path: ellipse(100% 0% at 50% 0)` (rest) → `ellipse(100% 150% at 50% 0)` (hover/focus) instead of a straight `inset()` wipe, giving the curved dome leading edge ("small elliptical curve" from the brief). CSS-only. Round 6 ready; label one-line-vs-stacked still the only open design question.

## 2026-07-19 (later) — Deployment / "not seeing changes" diagnosis

- **Root cause the grid wasn't visible:** the section was never placed on any template — `templates/collection.json` still had the stock `main-collection-product-grid`. A new section file only makes it available in the customizer; it must be added to a template. Likely history: an earlier customizer placement lived on the remote theme and got overwritten when `shopify theme dev` synced the local (stock) `collection.json` up.
- **Also flagged (urgent):** the section files (`sections/section-modern-product-grid.liquid`, `assets/section-modern-product-grid.css`) are **untracked in git** — all build + 6 QA rounds are uncommitted. Branch tip is still `09334b5 scoping questions`. Needs a commit to protect the work. (Awaiting user go-ahead.)
- **Action taken:** swapped the default `templates/collection.json` product-grid section to `section-modern-product-grid` (settings: products_per_page 8, color_scheme scheme-1 [dark: #1f1f21/white], padding 0/40) so it renders on the running dev preview. **Trade-off (stated to user):** this affects ALL collection pages (they lose stock filtering/sorting) and is reversible. Proper production scoping = dedicated `collection.<suffix>.json` + publish + assign in admin (dev-theme templates don't show in the admin template dropdown, so scoping can't be previewed on an unpublished dev theme).
- Note: scheme-1 = dark, scheme-4 = lime (#e3fc02, the bright bar seen earlier was a scheme-4 section).
