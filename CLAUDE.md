# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

New e-commerce website for **wholesale-blank-tshirts.com.au** — an Australian wholesale blank t-shirt supplier.

## Status

Greenfield project — design exploration phase. No production stack yet. Static HTML/CSS/JS prototypes live under `designs/`.

## Design directories

Each homepage iteration gets its own self-contained folder. Don't edit a previous version when iterating — copy it to a new `.vN` and edit there so prior versions stay intact for comparison.

```
designs/
  01-elverys/                     # reference: Elverys-style homepage
  02-harmonia/                    # reference: Harmonia theme
  03-hyper/                       # base Hyper-theme inspired homepage
  03-hyper.v1/  03-hyper.v2/  03-hyper.v3/   # iterations
  hyper-ref-*.png                 # reference screenshots from Hyper theme demo
  harmonia-ref-*.png              # reference screenshots from Harmonia
  safetymart-*.png                # reference screenshots from Safetymart
```

Each design folder contains:
- `index.html` — single-page homepage
- `css/styles.css` — all styles
- `js/main.js` — interactions (sidebar, mega menu, accordion, GST toggle, quickview, etc.)
- `images/` — product + talent imagery
- `screenshots/` — Playwright captures kept alongside the design (used for diff/review)

## Local preview workflow

These prototypes are static, so any local HTTP server works. Use the Windows `py` launcher (Python is installed but `python` isn't on PATH):

```bash
cd designs/03-hyper.v3
py -m http.server 8753
# then open http://127.0.0.1:8753/index.html
```

Pick a unique port per session (e.g. 8753) so multiple iterations can run in parallel without clashing. Stop the server with `taskkill //F //PID <pid>` after finding the listener via `netstat -ano | grep ":<port>.*LISTENING"`.

## Visual verification with playwright-cli

Use `playwright-cli` (already installed locally — call via `npx --no-install playwright-cli`) to verify rendering at multiple breakpoints. Always test at desktop, tablet, and mobile widths — the homepage has explicit breakpoints at 1100/1024/900/768/600/480.

```bash
# named session keeps the browser alive between commands
npx --no-install playwright-cli -s=hyperv3 open --browser=chrome http://127.0.0.1:8753/index.html

# resize + screenshot at each breakpoint
npx --no-install playwright-cli -s=hyperv3 resize 1440 900
npx --no-install playwright-cli -s=hyperv3 screenshot --filename=v3-desktop-top.png

npx --no-install playwright-cli -s=hyperv3 resize 900 800
npx --no-install playwright-cli -s=hyperv3 screenshot --filename=v3-tablet-top.png

npx --no-install playwright-cli -s=hyperv3 resize 480 800
npx --no-install playwright-cli -s=hyperv3 screenshot --filename=v3-mobile-top.png

# interact (e.g. open the hamburger drawer)
npx --no-install playwright-cli -s=hyperv3 click "#sidebar-toggle"
npx --no-install playwright-cli -s=hyperv3 click "getByRole('button', { name: 'Shop By Gender' })"
npx --no-install playwright-cli -s=hyperv3 screenshot --filename=v3-mobile-sidebar-gender.png

# inspect computed styles when something looks wrong
npx --no-install playwright-cli -s=hyperv3 --raw eval "() => { const el = document.querySelector('.sidebar__search'); const cs = getComputedStyle(el); return JSON.stringify({display:cs.display, height:cs.height, flexShrink:cs.flexShrink}); }"

npx --no-install playwright-cli -s=hyperv3 console     # check for JS errors
npx --no-install playwright-cli -s=hyperv3 close
```

Screenshots default to the repo root — move them into `designs/<version>/screenshots/` so they stay with the iteration they document.

### Scrolling to a section before screenshot

The site applies `html { scroll-behavior: smooth }`, which means `scrollIntoView()` *animates* — `screenshot` immediately after will fire mid-animation and miss the target. Override to `auto` and use absolute coordinates instead:

```bash
npx --no-install playwright-cli -s=hyperv3 --raw eval "() => { document.documentElement.style.scrollBehavior='auto'; const el = document.querySelector('.section--bundles'); window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset - 50); return window.pageYOffset; }"
```

After this returns, the screenshot lands on the right section.

### Inspecting a reference site for design ideas

Standard Playwright-cli flow with a separate named session (`-s=ref`) so the WBT preview session stays clean. Many e-commerce sites pop a newsletter modal on first load — close it, then dump `document.body.innerText` (truncated) instead of trying to query unfamiliar class names:

```bash
npx --no-install playwright-cli -s=ref open --browser=chrome <reference-url>
npx --no-install playwright-cli -s=ref --raw eval "() => document.body.innerText.slice(0,3000)"
npx --no-install playwright-cli -s=ref screenshot --filename=ref-foo.png   # then mv into designs/
npx --no-install playwright-cli -s=ref close
```

`innerText` plus a screenshot gives enough to mirror layout patterns (e.g. the "VALUE PACK / SAVE $X / NN reviews" pack-card pattern from workwearhub) without scraping their actual DOM.

### Composite product images with PIL (Pillow)

ImageMagick 7 is installed at `/c/Program Files/ImageMagick-7.1.1-Q16-HDRI/` and PIL/Pillow ships with the system Python (call via `py`). For "bundle" or "pack" thumbnails (multiple products overlapped on a clean canvas), use the helper at `designs/03-hyper.v3/scripts/make_bundles.py` as a template:

- `fit_square(img, size)` — center-crop and resize.
- `remove_white_bg(img, threshold=240)` — crude white-keyed alpha cutout (works because product photos sit on near-white studio backgrounds).
- `shadow(img, blur, opacity)` — generates a soft drop shadow from the image's alpha channel.
- `build_bundle(items, out_name, sizes=, offsets=, rotations=, accent=)` — back-to-front composite with per-layer rotation, sizing, and offset, plus an optional radial color glow.

Run with `py scripts/make_bundles.py` from inside the design folder. Output lands in `images/bundles/`. Edit the lists at the bottom of the file to add new bundles.

**Status: deprecated for production thumbnails.** The threshold-based cutout chews up white piping, white panels, zipper teeth and anti-aliased edges (leaves jagged halos). Use AI generation (next section) for any new bundle/pack thumbnails. Keep this script around as a reference / fallback only.

### AI-generated bundle thumbnails (OpenAI gpt-image-2)

`designs/03-hyper.v3/scripts/gen_bundles_ai.py` calls `POST https://api.openai.com/v1/images/generations` and writes 1024×1024 PNGs into `images/bundles/ai-*.png`. Idempotent — skips files that already exist; pass `--force` to regenerate.

API key lives in `designs/03-hyper.v3/scripts/.env` (gitignored via root `.gitignore`):

```
OPENAI_API_KEY=sk-proj-...
```

Run with `py scripts/gen_bundles_ai.py` from inside `designs/03-hyper.v3/`.

**Default model** is `gpt-image-2`. It requires **org verification** (platform.openai.com → Settings → Organization → General → Verify Organization, ID check, ~15min to propagate). Until verified, fall back by editing the `model` default in the `generate()` signature to `gpt-image-1` — same API shape, slightly older quality, no verification needed. The two existing bundle/pack AI images were generated on `gpt-image-1` while waiting for verification.

**Other gotchas:**
- `billing_hard_limit_reached` (HTTP 400): top up credit or raise the project's hard limit; `sk-proj-…` keys are project-scoped so check the project cap, not just the org cap.
- The model softens "bright orange" disc requests unless you pin a hex value AND emphasize "vivid saturated, fully opaque" — see the `STYLE` anchor in the script.
- `b64_json` is the default response field. URL responses are not always available.

#### Two thumbnail styles in this project

Both share the same `STYLE` prompt anchor (workwearhub-style flat lay, white background, **vivid saturated bright orange `#F58220` disc** behind the garments, square 1:1, no text/logos/people).

1. **Pack thumbnails** (`ai-pack-*.png`) — multi-copy of one garment in a triangle composition (2-3-4 of same item). Used on the `.section--packs` cards (twin / 3-pack / 4-pack of the same product).
2. **Bundle thumbnails** (`ai-bundle-print-*.png`) — safetrex-style: two views of one garment (front + back) laid flat side by side, with a sample printed/embroidered logo applied so the customer can see where the print will go. Used on the `.section--bundles` cards (multi-piece print kits — corporate team, club & sports, hospitality).

#### Exact `STYLE` anchor used by every prompt

```
Flat-lay e-commerce product photography for an Australian wholesale workwear
retailer. Clean pure-white background, soft realistic drop shadows, shot
directly from above. Behind the garments is a single vivid saturated bright
orange flat circular disc (color #F58220) as a graphic accent, fully opaque,
taking up about 70% of the image height, exactly like the workwearhub.com.au
value-pack thumbnails. Square 1:1 composition, no text, no logos visible from
manufacturers, no people, no hands, no mannequins, no models. Product
photography only.
```

#### Per-image prompt fragments (appended to `STYLE`)

- `ai-pack-hivis-3.png` → "Three identical orange-and-navy two-tone hi-vis long-sleeve work shirts with reflective silver tape across the chest and arms, arranged in a triangle composition (two on top, one centered below), slightly overlapping."
- `ai-pack-shorts-twin.png` → "Two identical pairs of khaki cargo work shorts with drawstring waist and side pockets, photographed flat from above, side by side with a slight overlap."
- `ai-bundle-print-polo-fb.png` → "Two identical navy-blue corporate polo shirts laid flat side by side: the LEFT shirt shows the FRONT view with a small embroidered company logo on the upper left chest (a simple geometric crest with a generic monogram, full-colour stitching). The RIGHT shirt shows the BACK view with a larger embroidered version of the same logo centered between the shoulder blades. Both shirts are the same product, shown front and back so the buyer can see where the print will go."
- `ai-bundle-print-hoodie-fb.png` → "Two identical orange-and-navy hi-vis fleecy zip hoodies laid flat side by side: the LEFT hoodie shows the FRONT view with a vivid full-colour DTF screen-printed crest (a simple shield design with a generic team monogram in bold colours) across the chest. The RIGHT hoodie shows the BACK view with the same crest printed much larger, filling the upper back. Both garments identical, same orientation, shown to demonstrate front and back print placement."
- `ai-bundle-print-tee-fb.png` → "Two identical charcoal-grey cotton t-shirts laid flat side by side: the LEFT tee shows the FRONT view with a small embroidered first-name patch on the upper left chest in white thread on a dark rectangle. The RIGHT tee shows the BACK view with a small embroidered single-line wordmark across the upper back. Both tees identical, shown to demonstrate where the personalisation goes."

#### Adding a new prompt

Append a `(filename, prompt_fragment)` tuple to the `PROMPTS` list at the bottom of `gen_bundles_ai.py` and re-run. Always interpolate `{STYLE}` at the start so the new image matches the orange-disc / flat-lay convention. Each call is roughly 30-50s and consumes credit — aim to get the prompt right before re-running with `--force`.

### Gotchas hit before, save the next iteration

- Flex column drawers (`.sidebar { display:flex; flex-direction:column }`) will shrink any child without `flex-shrink: 0` — a fixed `height` alone is not enough. The sidebar search bar collapsed to 2px until `flex-shrink: 0` was added.
- `<header>` was set to `display:flex; height:64px` so a sibling `.header__mobile-search` row got squashed alongside `.header__inner` instead of stacking below it. Fix: leave the outer `.header` as block, put the height/flex on `.header__inner`.
- A `playwright-cli click "Some Text"` on a `<button>` won't match by visible text alone — use `click "getByRole('button', { name: '...' })"` instead.
- `playwright-cli click 'css#selector'` works, but `eval` followed by `screenshot` in the same `&&` chain can silently drop the screenshot if the eval call kills the named browser session — keep multi-step Playwright flows as separate Bash invocations or expect to reopen.
- Run the static server with `py -m http.server`, not `python -m http.server`. `python` isn't on PATH on this machine; `py` is.

## Iteration log

Document each iteration's intent + the changes that landed, so the next pass has context without re-reading diffs.

### `03-hyper.v3` (2026-04-25)

Header / chrome cleanup, mobile parity with desktop menu.

- Removed top dark utility bar (`.utility-bar`, `--utility-height`, related media queries).
- Header actions: bolded the phone number in primary blue, added a primary-filled "Quote Request" button, renamed "Sign in" → "Login", added an `inc. GST / ex. GST` segmented toggle. Toggle state syncs between header and drawer instances and writes `data-gst` on `<html>` for theming.
- Hamburger drawer now mirrors the desktop mega menu: accordion sections for Shop By Gender, Shop By Category, Shop By Industry (with the same sub-headings as the desktop mega menus — Men/Women/Kids; Tops/Bottoms/Outerwear/Accessories/Hi-Vis/Services). Added a prominent "Request a Quote" CTA, Login/Register, click-to-call phone, Help/Contact links, and a duplicate GST toggle inside the drawer.
- Added a mobile-only secondary search row (`.header__mobile-search`) that appears below the header at ≤768px, plus a search input inside the drawer as a second fallback. The desktop inline search still hides at 768px as before, but search is no longer lost on mobile.
- Responsive ladder for the header: ≤1100px hides Quote/Login labels (icons only), ≤900px hides the GST toggle and phone number text, ≤768px hides the inline search and shows the mobile-search row.

### `03-hyper.v3` continued (2026-04-26)

PO bar, mobile fixes, clearance/bundles content sweep. (Edited in place — not a new `.vN` because it's the same iteration.)

- Added a dismissible Purchase Order announcement bar above the header with the audience tag ("Schools, councils & government"), a one-line message, a flat white "APPLY →" button, and an `×` close. Mobile copy collapses to "Pay later with Purchase Orders APPLY ×" so it stays one line down to 360px. Dismissal persists in `sessionStorage`.
- Mobile header fixed to a single row: hamburger + logo + always-visible phone number (with full number) + cart. Quote and Login icons drop on mobile (both still in the drawer). Root cause was the outer `<header>` being `display:flex` so the search row got squashed alongside `.header__inner`; moved `display:flex` and `height` onto `.header__inner` only.
- Rotating "New Arrivals" hero tile: replaced the static "Winter Jackets" banner card with a 4-slide fade rotator (Winter Jackets → Quarter-Zips → Track Jackets → Women's Activewear), 4.5s interval, dot indicator bottom-right.
- Renamed "Shop Our Offers" to a CLEARANCE section ("End-of-line & Run-out") with a red eyebrow chip, gradient red `Clearance` badge (replaces `Sale`), and per-card `Only N left` urgency tags.
- Standardized product-card heights by adding a 4th row to every bulk-pricing table — either a faded "+N more bulk tiers — see full product" link (for products that really have more tiers) or a placeholder em-dash row (`.product-card__bulk-more--placeholder`) so cards align in the grid.
- Easy Bulk Order grid: added a Colour `<select>` column per row and rebuilt the head row so size labels (S / M / L / XL / 2XL) sit directly above their input cells. Grid is now `2.4fr 1.2fr 2fr 0.9fr 0.9fr`.
- New section: **Product + Print Value Packs** (`section--bundles`) — three bundle cards inspired by essentialworkwear.com. Each shows a multi-product composite image, SAVE badge, pieces count, "Embroidered logo / Free setup" inclusion pills, contents bullets, "per person" pricing, and a primary CTA. A "Print & embroidery included — no setup fees" strip sits below.
- New section: **Multi-buy & Twin Packs** (`section--packs`) — four product-only pack cards inspired by workwearhub.com.au. Each has the orange `VALUE PACK` chip, `SAVE $X` badge (filled red for big savings), a `2×/3×/4×` quantity bubble, optional `ONLINE ONLY` tag, stars + review count, and red discounted price.
- Composite bundle/pack thumbnails generated by `scripts/make_bundles.py` from existing product photos — outputs to `images/bundles/`. Strictly Biz Collection (no model talent shots) per the brief.

### `03-hyper.v3` continued (2026-04-26, evening)

Replaced the PIL composite bundle/pack thumbnails with AI-generated ones, and added safetrex-style print-preview pattern to the print-bundle cards. (Same iteration, same folder.)

- New script `scripts/gen_bundles_ai.py` calls OpenAI's image API. PIL composite script (`make_bundles.py`) is kept as a fallback but deprecated for production thumbnails — the threshold-cutout chewed up white piping and zipper teeth.
- All bundle/pack thumbnails now share a single saturated-orange `#F58220` disc background (workwearhub-style) for visual unity. See "AI-generated bundle thumbnails" section above for the full `STYLE` anchor and per-image prompt fragments.
- Bundle cards (multi-piece print kits) switched from multi-piece composites to **safetrex-style front+back print previews** — one garment shown from the front (with sample chest logo) and the back (with larger logo) side by side. Three new images: `ai-bundle-print-polo-fb.png`, `ai-bundle-print-hoodie-fb.png`, `ai-bundle-print-tee-fb.png`.
- Pack cards (multi-buy of one item) use existing `ai-pack-hivis-3.png` and `ai-pack-shorts-twin.png`. The other two pack thumbnails (track-pants 4-pack, jackets twin) still use the old PIL composites — regenerate when convenient.
- Added a reusable `.qty-badge` circular badge (×2/×3/×4) in the top-right corner of every card image. Replaces the old `bundle-card__pieces` pill.
- Added a `.print-pill` (gradient orange) inside bundle-card body listing the print method (e.g. "DTF Full Colour — Front + Back", "Embroidered Name — Chest"). Replaces the old `__incl` overlay tags that used to sit on the image.
- Hover rotation: every bundle/pack card has a `data-hover-images="path1,path2,…"` attribute listing individual product photos. JS in `js/main.js` swaps the card image to one of those photos as the mouse moves across the image-wrap (mouse-X position → image index). Mouse-leave restores the composite.