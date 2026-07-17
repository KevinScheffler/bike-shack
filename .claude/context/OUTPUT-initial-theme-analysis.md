# Theme Analysis — Dawn 15.4.1

Generated: 2026-07-17

## Summary

This is Shopify's **Dawn** reference theme, version **15.4.1** (author: Shopify). It is **stock / unmodified** — every section, snippet, asset, and JS filename matches the Dawn defaults, with no custom feature files present. All the standard Dawn conventions apply, so we build on top of it using Dawn's own patterns (CSS custom properties, `page-width` wrapper, `section-{{ section.id }}-padding`, color schemes, web components + pubsub). Treat this as a clean baseline.

## File Structure Overview

- **sections/** — 54 files (all stock Dawn, incl. `header-group.json`, `footer-group.json`)
- **snippets/** — 37 files (all stock: `card-product`, `price`, `facets`, `product-variant-picker`, etc.)
- **assets/** — 185 files (`base.css` + 38 `component-*.css` + a handful of section/template CSS, ~35 JS files, SVG icons, placeholders)
- **templates/** — 14 (JSON templates + `gift_card.liquid`, plus `customers/` subfolder)
- **config/** — `settings_schema.json`, `settings_data.json`
- **locales/** — 51 locale files (`en.default.json` + translations + `*.schema.json`)
- **layout/** — `theme.liquid`, `password.liquid`
- **blocks/** — none (this Dawn version predates the theme-blocks `blocks/` folder; blocks are defined inline in section schemas)

**No custom files stand out.** Nothing has been added or renamed. This is a pristine Dawn install.

## CSS Conventions

Single main stylesheet `assets/base.css` (~3,600 lines) plus per-component `component-*.css` and a few `section-*.css` / `template-*.css` files loaded on demand.

### Grid System

Custom class-based grid (not CSS Grid `grid-template` in most places — flex/inline-block column widths driven by modifier classes):

- `.grid` + `.grid__item`
- Column modifiers: `.grid--1-col`, `.grid--2-col`, `.grid--3-col`, `.grid--4-col-tablet`, `.grid--3-col-tablet`, `.grid--2-col-tablet`, etc.
- `.grid--gapless` removes gaps
- Responsive variants use `-tablet` / `-desktop` suffixes

### Breakpoints

- **750px** (`min-width: 750px`) — primary mobile→tablet breakpoint (most used, ~25 occurrences)
- **990px** (`min-width: 990px`) — tablet→desktop (~15 occurrences)
- **749px / 989px** (`max-width`) — the down variants
- Dawn is **mobile-first**: base styles are mobile, `min-width` queries layer on larger screens.

### Color Variables

Dawn uses an **RGB-triplet CSS custom property** system so colors can be used with variable alpha. Never hardcode colors — always use these:

- `--color-foreground` / `--color-background` (stored as `R,G,B` triplets, used as `rgb(var(--color-foreground))` or `rgba(var(--color-foreground), 0.75)`)
- `--color-button`, `--color-button-text`, `--color-secondary-button`, `--color-link`, `--color-shadow`
- `--gradient-background`
- Alpha tokens: `--alpha-button-background`, `--alpha-link`, `--alpha-badge-border`
- Animation tokens: `--duration-short: 100ms`, `--duration-default: 200ms`, `--duration-long: 500ms`, `--ease-out-slow`, `--animation-slide-in`, `--animation-fade-in`
- Card/media shadow + border tokens: `--border-radius`, `--border-width`, `--shadow-*`, `--image-padding` (remapped per component: product card, collection card, blog card, text boxes, media)

Colors are applied via **color scheme classes** — see Schema Conventions below.

### Naming Convention

**BEM-ish, Dawn-flavored.** Block/element/modifier with double-underscore elements and double-dash modifiers, e.g.:
- `.image-with-text`, `.image-with-text__grid`, `.image-with-text__media-item--small`, `.image-with-text__content--desktop-left`
- `.multicolumn`, `.multicolumn__title`
- Utility classes exist too: `.page-width`, `.color-foreground`, `.gradient`, `.isolate`, `.rte`, `.title-wrapper-with-link`, `.scroll-trigger`, `.animate--slide-in`

### Spacing Patterns

- Uses **rem** heavily for component spacing; `px` for section padding (via the section-id padding pattern below).
- Font/line-height scale off `--font-body-scale` / `--font-heading-scale`.
- No general-purpose spacing utility scale — spacing is component-local. Section-to-section spacing is controlled by per-section `padding_top` / `padding_bottom` range settings.

### Page Width / Containers

- Wrapper class: **`.page-width`** → `max-width: var(--page-width)` with responsive horizontal padding (5rem margin on desktop).
- `--page-width` derives from the theme setting `page_width` (**default 1200px**), set inline in `theme.liquid`.
- Variants: `.page-width--narrow`, `.page-width-desktop`, `.page-width-tablet`.

## JavaScript Conventions

### Base Files (do not modify)

Loaded in `theme.liquid` `<head>` with `defer`:
- `constants.js` — `ON_CHANGE_DEBOUNCE_TIMER` and `PUB_SUB_EVENTS` map
- `pubsub.js` — `subscribe()` / `publish()` pub-sub system
- `global.js` (~1,330 lines) — core utilities + many base web components (`quantity-input`, `menu-drawer`, `header-drawer`, `modal-dialog`, `modal-opener`, `deferred-media`, `slider-component`, `slideshow-component`, `variant-selects`, etc.)
- `details-disclosure.js`, `details-modal.js`, `search-form.js`, `animations.js` (conditional)

Also do not modify: `cart.js`, `cart-drawer.js`, `product-form.js`, `product-info.js`, `facets.js`, `predictive-search.js`, and the other stock component JS files.

### Existing Components (custom elements already registered)

`account-icon`, `bulk-add`, `bulk-modal`, `cart-drawer`, `cart-drawer-items`, `cart-items`, `cart-notification`, `cart-remove-button`, `deferred-media`, `details-disclosure`, `details-modal`, `facet-filters-form`, `facet-remove`, `header-drawer`, `header-menu`, `main-search`, `menu-drawer`, `modal-dialog`, `modal-opener`, `password-modal`, `predictive-search`, `price-range`, `product-recommendations`, `quantity-input`, `search-form`, `slider-component`, `slideshow-component`, `variant-selects`.

Reusable UI already available: cart drawer, modal dialog/opener, menu drawer, slider + slideshow, quantity input, variant selects, predictive search. **Prefer reusing these** over building new equivalents.

### Event Patterns

- **Pub/Sub** via `pubsub.js`: `subscribe(eventName, cb)` returns an unsubscribe fn; `publish(eventName, data)` returns `Promise.all` of subscriber results.
- Event names come from `PUB_SUB_EVENTS` in `constants.js`: `cart-update`, `quantity-update`, `option-value-selection-change`, `variant-change`, `cart-error`.
- Standard DOM `CustomEvent`s are also used within components.

### Third-Party Libraries

**None.** Dawn ships zero JS frameworks/libraries — everything is vanilla JS + native web components. Keep it that way; any library needs explicit approval and must be vendored into `assets/`.

### Script Loading

- Core scripts: `<script src="{{ 'x.js' | asset_url }}" defer="defer"></script>` in `theme.liquid`.
- Component scripts: loaded per-section inside the section's `.liquid` file (also `defer`), or conditionally in `theme.liquid`.
- No `type="module"` in the base theme — scripts are classic deferred scripts. Web components self-register with a `customElements.get()` guard.

## Liquid Conventions

### Section Wrapper Pattern

Two common shapes, both wrap content in `.page-width`:

**Pattern A — padding on outer wrapper, page-width inside** (e.g. `image-with-text`):
```liquid
<div class="section-{{ section.id }}-padding gradient color-{{ section.settings.section_color_scheme }}">
  <div class="page-width">
    ...
  </div>
</div>
```

**Pattern B — color/gradient on outer, page-width + padding combined inside** (e.g. `multicolumn`):
```liquid
<div class="multicolumn color-{{ section.settings.color_scheme }} gradient background-{{ ... }}">
  <div class="page-width section-{{ section.id }}-padding isolate">
    ...
  </div>
</div>
```

### Section Padding Approach

Every content section defines scoped padding via a `{%- style -%}` block keyed on `section.id`, with **mobile values reduced (× 0.75)** and full values at ≥750px:

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

> Note: this Dawn version uses the **`× 0.75`** multiplier for the mobile scale-down. (The multiplier in the CLAUDE.md example is `0.5` — follow the theme's actual `0.75` to stay consistent.)

### Standard Schema Settings

Nearly every section ends its `settings` array with, in this order:
1. A `color_scheme` setting (default `"scheme-1"`) — some sections have two (`section_color_scheme` + `color_scheme` for inner container)
2. A `{ "type": "header", "content": "t:sections.all.padding.section_padding_heading" }`
3. `padding_top` range (`min: 0, max: 100, step: 4, unit: px, default: 36`)
4. `padding_bottom` range (same, `default: 36`)

Section objects use `"class": "section"` and often `"disabled_on": { "groups": ["header", "footer"] }`.

### Section Structure (anatomy)

1. Asset load(s): `{{ 'section-x.css' | asset_url | stylesheet_tag }}` (and any `component-*.css` needed)
2. `{%- style -%}` block with the `section-{{ section.id }}-padding` rules + any dynamic per-section CSS vars
3. Optional `{%- liquid -%}` prep block (assign variables, compute flags)
4. Markup: outer color/gradient wrapper → `.page-width` → component BEM markup, iterating `section.blocks` with `{% case block.type %}` and emitting `{{ block.shopify_attributes }}`
5. `{% schema %}` with settings → blocks → presets

### Snippet Patterns

37 stock snippets, included via `{% render 'snippet-name', arg: value %}`. Most reused: `card-product`, `card-collection`, `price`, `product-variant-picker`, `product-variant-options`, `quantity-input`, `facets`, `icon-accordion`, `loading-spinner`, `swatch`. Naming is kebab-case, function-descriptive.

### Translation Approach

**Fully translation-driven.** All schema labels use `t:` keys (e.g. `t:sections.image-with-text.settings.image.label`) and storefront text uses `{{ 'namespace.key' | t }}`. Locale files live in `locales/` (`en.default.json` for storefront, `en.default.schema.json` for the editor). No hardcoded English found in sections. **Follow this** — new client text goes into schema settings or locale keys, never hardcoded.

### Block Patterns

Blocks are defined **inline in each section's schema** (`type` + `name` + per-block `settings`, often with `"limit"`). Common types: `heading`, `text`, `caption`, `button`, `image`, `icon`. Rendered in markup via `{% for block in section.blocks %}{% case block.type %}...{% endcase %}{% endfor %}` with `{{ block.shopify_attributes }}` for editor support. Presets list default blocks in order.

## Schema Conventions

### Common Settings

Across most sections: a heading/title (`inline_richtext`), `heading_size` select (`h2`/`h1`/`h0`/`hxl`/`hxxl`), one or two `color_scheme` settings, the padding header, and `padding_top`/`padding_bottom` ranges. Content-heavy sections add image pickers, `richtext`, select-based layout/alignment options.

### Color Scheme Handling

- Theme defines **5 color schemes** (`scheme-1` … `scheme-5`) in `config/settings_data.json`.
- Sections expose a `{ "type": "color_scheme", "id": "color_scheme", "default": "scheme-1" }` setting.
- Applied in markup as `class="color-{{ section.settings.color_scheme }} gradient"`. The `.color-{scheme}` class swaps the `--color-foreground` / `--color-background` / `--gradient-background` variables; `.gradient` paints the scheme's background/gradient.

### Padding / Spacing Approach

Standard range: `min: 0, max: 100, step: 4, unit: "px"`, **default `36`** for both top and bottom. Mobile values auto-reduced via the `× 0.75` style block. This is the single lever for inter-section spacing — use it rather than ad-hoc margins.

### Preset Patterns

Every content section includes a `presets` array with at least `{ "name": "t:sections.<x>.presets.name" }`, often pre-populated with default `blocks` in display order so the section renders meaningfully when first dropped in. **Always include an unconfigured preset** so new sections appear in the customizer everywhere.

### Setting Types Commonly Used

`image_picker`, `select`, `range`, `color_scheme`, `checkbox`, `inline_richtext`, `richtext`, `text`, `url`, and `header`/`paragraph` for grouping.

## Visual Analysis

No reference images found — `.claude/context/reference/` does not exist. Skipped. (Add screenshots/brand assets there and re-run to capture visual conventions.)

## Recommendations

- **This is stock Dawn 15.4.1 — keep new work additive.** Build features as new `section-[feature].liquid` + `assets/section-[feature].css` (+ optional web component JS), exactly as CLAUDE.md prescribes. Don't touch `base.css`, `global.js`, or other base files.
- **Follow the `× 0.75` mobile padding multiplier**, not the `0.5` shown in the CLAUDE.md example — matching the theme is what matters.
- **Use the RGB-triplet color variables and `.color-{scheme}` classes** for all colors. Never hardcode hex values; expose a `color_scheme` setting instead.
- **Reuse existing web components** (`modal-dialog`/`modal-opener`, `slider-component`, `slideshow-component`, `quantity-input`, cart drawer) before writing new ones. Communicate cross-component via the `pubsub.js` events in `constants.js`.
- **No `blocks/` folder** in this version — define blocks inline in section schemas (the older Dawn pattern), not as theme block files.
- **All client-facing text must be translatable** — schema `t:` keys or `| t` locale lookups. This theme is 100% localized; don't be the one who hardcodes a string.
- **No third-party JS** exists — introducing any library needs approval and must be vendored to `assets/` (no CDN).
- `.claude/context/client-notes.md` is still an empty template — worth filling in the client/brand context before building client-facing features.
