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

### Gotchas hit before, save the next iteration

- Flex column drawers (`.sidebar { display:flex; flex-direction:column }`) will shrink any child without `flex-shrink: 0` — a fixed `height` alone is not enough. The sidebar search bar collapsed to 2px until `flex-shrink: 0` was added.
- A `playwright-cli click "Some Text"` on a `<button>` won't match by visible text alone — use `click "getByRole('button', { name: '...' })"` instead.
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
