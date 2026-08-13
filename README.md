# Bike Shack

A demo Shopify storefront built to develop and document two custom theme sections. Bike Shack is a fictional cycling brand, used as a realistic context for the build rather than as a client project.

The theme is based on Shopify's [Dawn](https://github.com/Shopify/dawn). Everything under `sections/section-modern-product-grid.liquid`, `sections/section-scroll-video.liquid`, and their matching assets is written by me. The rest is Dawn.

## Modern Product Grid

A custom collection grid with notched product cards, built without JavaScript.

Each card's image is clipped by an inline SVG `clipPath` using `objectBoundingBox` coordinates, which cuts a notch out of the lower edge for the product label to sit in. Hover reveals a second image through an elliptical `clip-path` transition. Column heights are staggered so the grid reads as composed rather than tabular.

The notch geometry is not a direct copy of the reference design. The reference used 450px cards where a 35 percent notch gave enough room for the label, but Dawn's 1200px page width produces roughly 281px cards in a four-column layout, where the same percentage would be too narrow to hold the text. The desktop path uses 46 percent and the mobile path uses a separate clip at 31 percent, so the notch stays proportional to its contents at every breakpoint instead of to the card.

Merchant settings cover products per page, accent color, color scheme, and section padding.

**Files:** `sections/section-modern-product-grid.liquid`, `assets/section-modern-product-grid.css`

## Scroll Video

A pinned, full-bleed video whose playhead is driven by scroll position, with tooltips that appear at authored timestamps.

Implemented as a `<scroll-video>` custom element. Two problems drove most of the design:

The video is `object-fit: cover`, so it crops differently at every window shape. Tooltips are authored against the video frame rather than the viewport, so the component measures the video's real rendered box, including the cropped-off area, and exposes four CSS custom properties for positioning. That measurement runs on resize only, never during scroll.

The playhead eases toward the scroll target rather than locking to it. Tooltips read the smoothed value instead of the raw target, because reading the target would make labels lead the picture during the ease and desync from the frame the visitor is actually looking at. Sub-frame seeks are skipped, since redundant `currentTime` writes cost decode work and change nothing visible.

The section degrades to a static image layout when no video is configured, and distinguishes an unconfigured section from a deliberately image-only one so the placeholder only appears when it should.

**Files:** `sections/section-scroll-video.liquid`, `assets/scroll-video.js`, `assets/section-scroll-video.css`

## Stack

Liquid, vanilla JavaScript (custom elements), CSS, Shopify CLI, Dawn

## Running locally

Requires the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) and a development store.

```bash
git clone https://github.com/KevinScheffler/bike-shack.git
cd bike-shack
shopify theme dev --store your-store.myshopify.com
```

## Notes

Bike Shack is not a real company. The brand and catalog are invented for this build.