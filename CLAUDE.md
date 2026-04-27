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
  03-hyper.v1/  03-hyper.v2/  03-hyper.v3/  03-hyper.v4/  03-hyper.v5/   # iterations
  hyper-ref-*.png                 # reference screenshots from Hyper theme demo
  harmonia-ref-*.png              # reference screenshots from Harmonia
  safetymart-*.png                # reference screenshots from Safetymart
```

**Current head:** `03-hyper.v5` — full imgix migration of every homepage image, plus rebuilt Industry mega-menu (sidebar tabs).

Each design folder contains:
- `index.html` — single-page homepage
- `css/styles.css` — all styles
- `js/main.js` — interactions (sidebar, mega menu, accordion, GST toggle, quickview, etc.)
- `images/` — product + talent imagery
- `screenshots/` — Playwright captures kept alongside the design (used for diff/review)

## Source asset library

WBT's licensed product and lifestyle imagery from the brands they stock lives at:

```
C:\Users\Oren\Dropbox\Family Room\Products\by brand\<brand>\
```

Brand subfolders include `Biz Collection`, `ascolour`, `gildan`, `ramo`, `supertouch`, `bluewhale`, `codered`, `leo`, `merchrobot`, `RSEA`, plus a few miscellaneous ones. Each brand is organized by category, then SKU. Example: `Biz Collection/09 Activewear/09 Activewear/L513LT/`.

**Naming convention inside an SKU folder:**
- `<SKU>_Product_<colorway>_NN.jpg` — flat product photo on white seamless. Use for product cards.
- `<SKU>_Talent_<colorway>_R.jpg` — single-model lifestyle shot (`_R` = retouched). Use for hero/feature/category banners.
- `Talent_Group_Flex_01_R.jpg` (or similar) — shared group lifestyle shots that live alongside multiple SKUs. The same file appears in several SKU folders by design — match by hash if you need to deduplicate.

When a design needs new product or talent imagery, **first check this folder for a real Biz/AsColour/etc. asset** before generating with AI. Files copied into a design folder are usually renamed (e.g. `Talent_Group_Flex_01_R.jpg` → `group-women-activewear.jpg`) so the original filename isn't a reliable provenance signal — `md5sum` against the source folder is.

This also means: don't infer "AI-generated" from EXIF alone. Brand assets pass through retouching pipelines that strip camera metadata and stamp `Software: Adobe Photoshop`, which looks identical to AI-then-Photoshop output. Hash against the source library first.

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

API keys live in `designs/03-hyper.v3/scripts/.env` (gitignored via root `.gitignore`):

```
OPENAI_API_KEY=sk-proj-...   # for gpt-image-2 generation (this script)
IMGIX_API_KEY=ak_...         # for Imgix CDN/source-management (not yet wired in)
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
- Synthetic `dispatchEvent(new MouseEvent('mouseenter'))` does **not** trigger CSS `:hover` selectors — Playwright sees the JS event but the rendering engine doesn't enter the `:hover` state. To verify hover-driven swaps (clearance card → talent image, etc.) use `page.locator(...).hover()` (real mouse-position simulation) instead.
- Browser cache is sticky. After CSS edits, a `location.reload()` may still serve old styles. If a measurement looks wrong (`getComputedStyle` shows pre-edit values), close the playwright session entirely and reopen with a cache-busting query string: `open --browser=chrome "http://127.0.0.1:8755/index.html?bust=$RANDOM"`.

## Imgix-served responsive images (v5+)

Every homepage image is served via `https://wbt01.imgix.net/` (Cloudflare R2 bucket `wbt`, mapped as the imgix source). No build step — URL strings are static inline in `<img src/srcset>`, `<video poster>`, `data-hover-images`, and `data-image-alt`. The migration script that does the bulk rewrite is `designs/03-hyper.v5/scripts/imgix_migrate.py`. The dev-facing reference is `designs/03-hyper.v5/imgix-explainer.html` (also served via Pages).

### Three R2 prefixes

```
test01/09 Activewear/{SKU}/{filename}.jpg     ← original Biz Collection / 09 Activewear upload (most SKUs)
test01/{SKU}/{filename}.jpg                   ← flat — only J3150 + J408M live here (uploaded later)
test01/bundles/{filename}.{png,jpg}           ← project-generated bundle/pack composites (AI gpt-image + PIL)
```

Spaces must be URL-encoded as `%20`. The dual prefix is a real, persistent quirk — the migration script `ASSETS` table hardcodes the right prefix per file. Don't assume new SKUs go under `09 Activewear/`.

### URL parameter rules

| Param | Use it for |
|---|---|
| `auto=format,compress` | **Mandatory on every URL.** Imgix sniffs `Accept` header → AVIF / WebP / JPEG. Single biggest perf win. |
| `w=N` | Output width in px. Always paired with srcset variants. |
| `fit=crop&crop=faces&ar=W:H` | **Talent shots (people).** Imgix face-aware-crops to the container's exact aspect; browser `object-fit: cover` becomes a no-op. |
| `fit=fill&fill=solid&fill-color=fff&ar=W:H` | **Product photos and bundle composites.** Pads with white to the container aspect instead of cropping — full garment collar-to-hem stays visible. White matches the studio backdrop. |
| `crop=entropy` | Legacy. Was used for products in v5 but produced bad crops on long garments (chest-only). Replaced by `fit=fill`. |

### `ar=` is not optional for non-square containers

Without `ar=`, imgix returns the source's native aspect (most lifestyle shots are 2:3 portrait). The browser then runs `object-fit: cover` to fill the container — slicing through the wrong axis and clipping faces or product extremities. **Always pass `ar=W:H` matching the rendered container's aspect ratio.** Browser cover-crop becomes a no-op.

Per-section ar values used in v5:

| Section | Container aspect | `ar=` |
|---|---|---|
| Hero `<video poster>` | ~525×560 | `1:1` |
| Banner rotator slides (4) | ~723×272 | `8:3` |
| Tertiary + Quaternary banner cards | ~361×272 desktop, ~480×160 mobile | `2:1` (compromise) |
| Featured banner image | ~600×400 | `3:2` |
| Mega-menu Gender tiles (3) | ~397×200 | `2:1` |
| Mega-menu Category + Industry sidebar-tab thumbs | ~321×140 (set by `grid-auto-rows: 140px`) | `2:1` |
| Shop-by-Category homepage tiles | aspect-ratio 4/5 desktop, 16/10 mobile | `4:5` |
| Product cards everywhere (Best Sellers, Clearance, etc.) | 1:1 (`aspect-ratio: 1/1` on `.offer-card__image`, etc.) | `1:1` |
| Bundle/pack thumbnail cards | varies | `1:1` (default for products) |

### srcset patterns by size class

Three patterns; pick by whether rendered px scales with viewport:

- **Width-described srcset** (banners, product cards, hero): `srcset="…&w=320 320w, …&w=480 480w, …"` + `sizes="(min-width: 992px) 33vw, 100vw"`. Browser picks based on viewport × DPR × `sizes`.
- **DPR srcset** (fixed-size tiles — mega-menu thumbs, bulk-grid swatches, gender tiles): `srcset="…&w=200 1x, …&w=400 2x"`. No `sizes`. Used when CSS px don't change with viewport.
- **Single URL** (`<video poster>`, `data-hover-images`, `data-image-alt`): no srcset.

### Gotchas (lessons learned in v5 — do not repeat)

- **`data-hover-images` separator must be `|`, not `,`.** Imgix URLs contain `auto=format,compress` so JS `split(',')` shreds the URL list. v5 uses `|` and `js/main.js:578` splits on it.
- **Synthetic `mouseenter` doesn't trigger CSS `:hover`.** When verifying hover-swap (clearance card, color dot, etc.), use Playwright's real `page.locator().hover()`. See playwright gotcha note above.
- **`fit=fill` requires `ar=` (or both `w` and `h`).** Without a target aspect, imgix can't compute padding — falls back to source-aspect resize, then browser cover-crops anyway. v5 had 88 mega-menu product URLs that shipped without `ar=` and showed only chest-down because of this.
- **`crop=faces` only positions inside the imgix output; it does NOT help once the browser cover-crops.** If the imgix-returned aspect ≠ container aspect, the browser still slices the wrong axis. The fix is always `ar=` matching the container, not better crop modes.
- **The migration script's section policy gave `crop=entropy` to talent images sitting in product/clearance/bundle sections** (offer-card alt-image, hover-rotation lists, featured-product gallery). Then a global `entropy → fit=fill` pass left those talent URLs without face-aware cropping. Whenever a talent image lives in a product container, double-check it has `crop=faces&ar=1:1`, not `fit=fill`.
- **CSS `aspect-ratio`-set containers determine the right `ar=`.** Read `css/styles.css` for the container's CSS aspect-ratio (or inferred via `grid-auto-rows`) before picking `ar=`. Don't guess from screenshots.
- **Imgix billing is per-unique-URL origin pull**, then cached at edge indefinitely. v5 has ~600 unique variants total (URL × srcset stops). Free tier 1000 origin/month, 100 GB bandwidth — well clear.

### Audit greps for imgix URL hygiene

Every time you make bulk imgix changes, run these from the design folder to catch regressions before they ship. Targets are zero counts (or the few intentional exceptions noted in comments):

```bash
# Talent images must use crop=faces — entropy is wrong for people
grep -oE 'imgix\.net/[^"|]*Talent_[^"|]*' index.html | grep 'crop=entropy' | wc -l   # expect 0

# Product images must use crop=entropy or fit=fill — faces is wrong for flat photos
grep -oE 'imgix\.net/[^"|]*Product_[^"|]*' index.html | grep 'crop=faces' | wc -l   # expect 0

# Talent images should use fit=crop (face-aware), not fit=fill
grep -oE 'imgix\.net/[^"|]*Talent_[^"|]*' index.html | grep 'fit=fill' | wc -l   # expect 0

# fit=fill needs ar= or both w+h, otherwise the browser cover-crops anyway
grep -oE 'imgix\.net/[^"|]+' index.html | grep 'fit=fill' | grep -v 'ar=' | wc -l   # expect 0

# Every imgix URL must have auto=format,compress
grep -oE 'imgix\.net/[^"|]+' index.html | grep -v 'auto=format' | wc -l   # expect 0

# Local-only refs should only appear as `src=` fallbacks (browser auto-falls-back if srcset 404s)
grep -oE 'src="images/[^"]+"' index.html | wc -l   # informational
```

Whenever a CSS `aspect-ratio:` rule changes (or you add `grid-auto-rows: Npx` to a grid that holds image cards), audit the matching imgix URLs to confirm `ar=` matches the new container shape.

### Common bug patterns (recurrent in v5)

1. **Container-aspect mismatch.** Whenever an `aspect-ratio:` CSS rule or a fixed `grid-auto-rows: Npx` defines a container shape that's NOT the imgix source's 2:3, you need a matching `ar=`. Audit by greping `aspect-ratio:` and `grid-auto-rows:` in CSS, then confirm every imgix URL inside that component has `ar=W:H`.
2. **Mobile/desktop aspect divergence.** Containers that use `@media` to flip `aspect-ratio` between portrait and landscape can't be served well by a single `ar=`. Either use `<picture>` with media-query-gated `<source>` elements, or anchor with `object-position: center top` so the face stays in frame when the browser cover-crops.
3. **DPR srcset width too small for retina.** A fixed-size tile rendering at 321 px wide needs at least `w=642` for 2x DPR — `w=400 2x` is undersized. Multiply CSS-pixel container width by 2 and confirm.
4. **Section-policy script bugs at content-type boundaries.** When the migration script applies "this section gets `crop=entropy`", every talent image in that section silently inherits the wrong crop mode. Always grep `Talent_*` URLs after migration to catch them.
5. **Hardcoded line ranges in regex scripts.** Rebuilding a section can shift line numbers by hundreds. Prefer marker-comment-based slicing (`re.search(r'<!-- Foo -->.*?<!-- Bar -->', re.DOTALL)`) over `range(start_line, end_line)`.

### Adding a new image

1. Hash the local file with `md5sum` against the source library (`Biz Collection/...`) to find the source path. CLAUDE.md "Source asset library" note explains why hash, not filename.
2. Upload to R2 under the right prefix (most SKUs go under `test01/09 Activewear/{SKU}/`; J3150 + J408M go under flat `test01/{SKU}/`; bundle composites go under `test01/bundles/`).
3. Probe the imgix URL with `curl -I` to verify it's reachable. Test a transform: `?w=400&auto=format,compress`.
4. In `index.html`, write `<img src="local/fallback.jpg" srcset="<imgix urls>" sizes="..." alt="..." loading="lazy" decoding="async">`. Match the section's existing pattern (DPR vs width-described, ar value, faces vs fit=fill).

## GitHub Pages deployment

The `master` branch auto-publishes to `https://orendav.github.io/dev.oren.d15/` via GitHub Pages (legacy build, `master:/`, repo is public). Each design folder is browseable directly:

```
https://orendav.github.io/dev.oren.d15/designs/03-hyper.v5/
https://orendav.github.io/dev.oren.d15/designs/03-hyper.v5/imgix-explainer.html
```

Deploy = `git push origin master`. Pages rebuilds in ~60–90s. Wait for the build with:
```bash
until [ "$(gh api repos/orendav/dev.oren.d15/pages/builds/latest --jq '.commit[:7]')" = "<sha>" -a "$(gh api repos/orendav/dev.oren.d15/pages/builds/latest --jq '.status')" = "built" ]; do sleep 5; done
```

The repo was made public on 2026-04-26 specifically to enable Pages on the free plan (private repo Pages requires Pro/Team/Enterprise). All commits and brand imagery are publicly visible.

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

### `03-hyper.v4` (2026-04-26)

Single change: replace the static "Premium Activewear" hero JPEG with an autoplay muted looping `<video>`. `images/activwear.mp4` is the source. New `.banner-card__image` / `.banner-card__video` classes layer behind the gradient overlay (z-index 0; gradient at 1; content at 2). Same pattern is reused in v5 for `<img>`-backed banners after the background-image conversion.

### `03-hyper.v5` (2026-04-27)

Full migration of every homepage image (~158 references) to imgix. See "Imgix-served responsive images" section above for the full convention; iteration-specific notes:

- **Background-image → `<img>` conversion** for the 4 rotator slides + tertiary + quaternary banners (used to be inline `style="background-image: url(...)"`). New `.banner-card__image` rule layers `<img>` at z-index 0 below the gradient, identical to `.banner-card__video`. CSS dropped `background-size`/`background-position` from `.banner-card__slide` and `.featured-banner__image`.
- **Migration script:** `designs/03-hyper.v5/scripts/imgix_migrate.py` — section-aware preprocessor with `ASSETS` mapping (local filename → R2 key, including the dual `test01/{SKU}/` vs `test01/09 Activewear/{SKU}/` prefix split). Idempotent for `<img>` tags via a `srcset=` skip check; **not** idempotent for `data-hover-images`/`data-image-alt` so don't re-run blindly.
- **Industry mega-menu rebuild** to match Category's sidebar-tab pattern: `.mega-menu--tabs`, sidebar links with `data-cat="<slug>"`, 8 panels with content cards swappable on hover. Tabs are wired by the existing `js/main.js:110` handler — adding `mega-menu--tabs` class is all that's needed JS-side.
- **WBT vendor pill → Syzmik brand pill.** `.product-card__brand` now contains an SVG mark (reuses `#mk-star` from the brand showcase symbol library) + brand name, with a `:hover` overlay showing "See more Syzmik ›". When extending to other brands, swap the `<use href="#mk-star">` reference and the name.
- **Imgix explainer** at `designs/03-hyper.v5/imgix-explainer.html` — single-page reference for the dev team. Update when new sections or `ar=` values are introduced.
- **Public Pages deployment** — see "GitHub Pages deployment" section above. Repo went public on 2026-04-26.