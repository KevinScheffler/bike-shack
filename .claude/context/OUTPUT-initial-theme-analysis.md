# Theme Analysis — Dawn 15.4.1

Generated: 2026-06-23

## Summary

This is Shopify's **Dawn** reference theme, version **15.4.1**, authored by Shopify — effectively **stock/unmodified**. No custom sections, snippets, or assets stand out; everything follows the standard Dawn naming and structure. Dawn is a performance-focused, server-rendered theme that uses vanilla JS Custom Web Components, CSS custom properties for theming, and a flexbox-based grid. This is the cleanest possible starting point — when we build custom features we should mirror Dawn's conventions exactly so our work stays indistinguishable from the base theme.

## File Structure Overview

- **Sections:** 54 (`.liquid`) + 2 section groups (`header-group.json`, `footer-group.json`)
- **Snippets:** 37
- **Templates:** 14 (mostly `.json`, plus `gift_card.liquid`; `customers/` subfolder)
- **Assets:** 185 (CSS, JS, SVG icons, images)
- **Locales:** 51 (`.json`) — full translation coverage
- **Layout:** 2 (`theme.liquid`, `password.liquid`)
- **Config:** `settings_schema.json`, `settings_data.json`

No `blocks/` folder (this predates/avoids theme blocks — Dawn 15.x still uses section-local `{% schema %}` blocks). Everything maps 1:1 to a clean Dawn install. **No custom files detected.**

## CSS Conventions

### Grid System
Flexbox-based, not CSS Grid. Core classes:
- `.grid` — `display: flex; flex-wrap: wrap;` with `column-gap`/`row-gap` from `--grid-*-spacing` vars
- `.grid__item` — width via `calc()`, e.g. `calc(25% - var(--grid-mobile-horizontal-spacing) * 3 / 4)`
- Column modifiers: `.grid--1-col`, `.grid--2-col`, `.grid--3-col`, `.grid--4-col` (+ `-desktop`, `-tablet`, `-tablet-down` variants like `.grid--3-col-desktop`, `.grid--2-col-tablet`)
- `.grid--gapless`, `.grid--peek` (slider peek)
Gap is controlled by CSS vars set from theme settings, not hardcoded.

### Breakpoints
- **750px** — primary mobile→tablet/desktop breakpoint (by far the most used, ~25 occurrences)
- **990px** — tablet→desktop
- Max-width counterparts: **749px** and **989px**
Standard pattern: mobile-first base styles, then `@media screen and (min-width: 750px)`.

### Color Variables
Dawn uses **color schemes**. Colors are stored as raw RGB triplets in CSS vars and wrapped in `rgb()`/`rgba()` at use site so opacity can be layered:
- `--color-foreground`, `--color-background`, `--color-base-text`, `--color-base-accent-1/2`, `--color-base-background-1/2`, `--color-base-solid-button-labels`, etc.
- Usage: `color: rgb(var(--color-foreground));` or `rgba(var(--color-foreground), 0.75)`
- Card/media theming vars: `--border-radius`, `--shadow-*`, `--image-padding` (set per `.contains-card--product`, `--collection`, `--article`)
- Typography vars: `--font-body-family/style/weight/scale`, `--font-heading-*`
- Layout vars: `--page-width`, `--page-width-margin`, `--spacing-sections-mobile/desktop`, `--grid-mobile/desktop-horizontal/vertical-spacing`

### Naming Convention
**BEM**, Dawn-style: block `.rich-text`, element `.rich-text__wrapper`, `.rich-text__blocks`, modifier `.rich-text--full-width`. Utility/state classes are flat (`.page-width`, `.isolate`, `.gradient`, `.visually-hidden`, `.scroll-trigger`, `.color-{scheme}`).

### Spacing Patterns
No utility spacing classes. Spacing is driven by:
- CSS vars (`--spacing-sections-mobile/desktop`) for inter-section gaps
- The per-section padding pattern (see Liquid section below) for intra-section vertical padding
- Grid gap vars for horizontal/vertical rhythm inside grids

### Page Width / Containers
- `.page-width` → `max-width: var(--page-width)` (set in theme settings, typically ~1200px / 120rem) with horizontal padding via `--page-width-margin`
- Variants: `.page-width--narrow` (`max-width: 72.6rem`), `.page-width-desktop`, `.page-width-tablet`
- `.isolate` is commonly added to create a stacking context

## JavaScript Conventions

### Base Files (do NOT modify)
- `global.js` — Core helpers + base components. Defines `getFocusableElements`, `trapFocus`/`removeTrapFocus`, `debounce`, `throttle`, `fetchConfig`, `pauseAllMedia`, `onKeyUpEscape`, the `HTMLUpdateUtility` class, `SectionId` helper, the `Shopify.*` utilities (CountryProvinceSelector, postLink, etc.), and components like `QuantityInput`, `MenuDrawer`, `HeaderDrawer`, `ModalDialog`, `ModalOpener`, `DeferredMedia`, `SliderComponent`, `SlideshowComponent`, `VariantSelects`.
- `constants.js` — Global constants: `ON_CHANGE_DEBOUNCE_TIMER = 300` and `PUB_SUB_EVENTS` map.
- `pubsub.js` — `subscribe(eventName, cb)` / `publish(eventName, data)` pub/sub system (returns an `unsubscribe` fn; `publish` returns a `Promise.all`).
Treat all three as untouchable — changes ripple across the whole theme.

### Existing Components (customElements.define)
`account-icon`, `bulk-add`, `bulk-modal`, `cart-drawer`, `cart-drawer-items`, `cart-items`, `cart-notification`, `cart-remove-button`, `deferred-media`, `details-disclosure`, `details-modal`, `header-drawer`, `header-menu`, `main-search`, `menu-drawer`, `modal-dialog`, `modal-opener`, `password-modal`, `predictive-search`, `price-range`, `product-recommendations`, `quantity-input`, `search-form`, `slider-component`, `slideshow-component`, `variant-selects`.

Reuse these where possible — especially `modal-dialog`/`modal-opener` for popups, `slider-component` for carousels, `cart-drawer`/`cart-notification` for cart interactions, and `deferred-media` for lazy video/model loading.

### Event Patterns
Pub/sub via `pubsub.js` + `PUB_SUB_EVENTS` constants. Key events: `cart-update`, `quantity-update`, `option-value-selection-change`, `variant-change`, `cart-error`. Components subscribe in `connectedCallback` and store the returned unsubscribe fn to call on `disconnectedCallback`. For cart/variant integrations, publish/subscribe to these events rather than wiring up custom globals.

### Third-Party Libraries
**None.** Dawn is 100% vanilla JS — no jQuery, Swiper, Flickity, etc. Sliders use the native `slider-component`. Any new library must be approved and dropped into `assets/` (no CDN).

### Script Loading
Standard pattern is `<script src="{{ 'file.js' | asset_url }}" defer="defer"></script>` in `theme.liquid` `<head>` for global scripts. Section-specific scripts are loaded inside the section file (also `defer`). No ES modules / `type="module"`. Components self-register with `if (!customElements.get(...))` guards.

## Liquid Conventions

### Section Wrapper Pattern
Two common forms:
1. `<div class="... page-width section-{{ section.id }}-padding">` — content constrained to page width
2. `<div class="isolate{% unless section.settings.full_width %} page-width{% endunless %}">` — optional full-width via setting
Color scheme applied as `color-{{ section.settings.color_scheme }} gradient` on the section wrapper.

### Section Padding Approach
Universal pattern — a scoped `{%- style -%}` block keyed to `section.id`, with mobile padding scaled to **0.75×** the desktop value (note: Dawn 15.x uses `0.75`, not the `0.5` shown in the CLAUDE.md example):
```liquid
{%- style -%}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px;
  }
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }
{%- endstyle -%}
```
The `.section-{{ section.id }}-padding` class is then applied to the inner wrapper.

### Standard Schema Settings
Most sections end with, in this order: content settings → `color_scheme` → section-specific options → a `{ "type": "header", "content": "t:sections.all.padding.section_padding_heading" }` → `padding_top` + `padding_bottom` ranges.

### Section Structure (anatomy)
1. CSS asset load(s) via `stylesheet_tag`
2. Scoped `{%- style -%}` padding block
3. Optional `{%- liquid -%}` logic prelude
4. Markup (page-width / color-scheme wrappers, BEM classes)
5. `{% schema %}` with `settings`, `blocks`, `presets`

### Snippet Patterns
37 snippets, kebab-case, included via `{% render 'name', arg: value %}` (isolated scope — Dawn does not use `{% include %}`). Heavily reused: `card-product`, `card-collection`, `article-card`, `price`, `icon-accordion`, `icon-with-text`, `product-variant-picker`, `buy-buttons`, `quantity-input`, `loading-spinner`, `meta-tags`, `pagination`.

### Translation Approach
Fully translation-driven. Schema labels use `t:` keys (e.g. `t:sections.all.padding.padding_top`, `t:sections.all.colors.label`). Storefront strings use `{{ 'key' | t }}`. 51 locale files. **Follow this strictly — no hardcoded user-facing text.** New sections should add keys to `locales/en.default.json` (and `*.schema.json` for editor labels).

### Block Patterns
Section-local blocks defined in each section's `{% schema %}` `blocks` array (e.g. rich-text has `heading`, `caption`, `text`, `button`). Rendered by `{% for block in section.blocks %}` + `{% case block.type %}`, with `{{ block.shopify_attributes }}` on the block's root element for theme-editor support.

## Schema Conventions

### Common Settings
`color_scheme` (default `scheme-1`), `padding_top`/`padding_bottom` ranges, heading + `heading_size`, `full_width` checkbox, image pickers, collection/product pickers, `richtext`/`inline_richtext`.

### Color Scheme Handling
`{ "type": "color_scheme", "id": "color_scheme", "default": "scheme-1" }`. Applied in markup as `class="color-{{ section.settings.color_scheme }} gradient"`. Schemes themselves are defined globally in `settings_schema.json` / `settings_data.json` and resolve to the `--color-*` RGB-triplet vars.

### Padding / Spacing Approach
Standard range for both padding settings: `min: 0, max: 100, step: 4, unit: "px"`. Defaults vary per section (e.g. rich-text uses `padding_top: 40`, `padding_bottom: 52`). Always preceded by the `section_padding_heading` header.

### Preset Patterns
Each section includes a `presets` array so it appears in the theme editor, e.g. `"presets": [{ "name": "t:sections.<name>.presets.name" }]`. Presets may include default `blocks` to give a ready-to-use starting state. **Always include an unconfigured preset on new sections.**

## Visual Analysis

No reference images found in `.claude/context/reference/` (folder does not exist). Skipped — add brand/design references there and re-run if needed.

## Recommendations

- **Stock theme = clean baseline.** Mirror Dawn conventions exactly (BEM, `section-{{ section.id }}-padding` with 0.75× mobile scaling, `color-{scheme} gradient` wrappers, `page-width`, `t:` translations) so custom work is indistinguishable from the base.
- **CLAUDE.md padding example uses `0.5`; Dawn 15.4.1 actually uses `0.75`.** Use `0.75` to match the rest of the theme.
- **Never modify `global.js`, `constants.js`, or `pubsub.js`.** Build new behavior as self-contained Custom Web Components with `if (!customElements.get())` guards and `disconnectedCallback` cleanup.
- **Reuse existing components** before building new ones — `modal-dialog`/`modal-opener`, `slider-component`, `deferred-media`, `cart-notification`/`cart-drawer`.
- **Integrate with the cart/variant flow via pub/sub** (`PUB_SUB_EVENTS`), not custom globals.
- **No third-party libraries** are present; keep it vanilla unless a library is explicitly approved and vendored into `assets/`.
- **All user-facing text must be `t:` keys or schema settings** — the theme is 100% translation-driven and inconsistency here is immediately visible.
- No `blocks/` (theme blocks) directory — stick with section-local schema blocks for consistency with the rest of the theme.
