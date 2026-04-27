# Live Homepage Alignment Review

Use this file to compare the production ecommerce-platform homepage against the static reference in this folder:

- Reference: `designs/gpt.v6/index.html`
- Target: final live homepage URL supplied by the developer or QA lead

The goal is not pixel-perfect matching. The goal is to confirm the live implementation preserves the important content, SEO, conversion, accessibility, and responsive behavior from the static homepage.

## Review Rules

- Prefer DOM inspection, computed styles, text extraction, link audits, and viewport metrics over screenshots.
- Use screenshots only when a visual defect cannot be described from DOM/computed data. If screenshots are needed, capture only the smallest relevant viewport or element, not full-page screenshots.
- Test the reference and live page with the same viewport sizes and browser.
- Record concrete differences with selector, viewport, observed live behavior, expected reference behavior, and severity.
- Do not require exact generated class names on the live platform. Compare user-facing behavior and stable landmarks, not implementation internals.

## Viewports

Check these widths at minimum:

- `1440 x 1000`: desktop
- `1280 x 900`: laptop
- `768 x 1024`: tablet
- `390 x 844`: large mobile
- `360 x 800`: narrow mobile

For each viewport, verify:

- No horizontal overflow: `document.documentElement.scrollWidth <= window.innerWidth`.
- Header, announcement bar, search, cart, quote, and mobile menu are visible or hidden as intended.
- Hero/banner content remains readable and CTAs remain tappable.
- Mobile hero is intentionally compact: visible H1, one short value line, primary CTA, and no stacked proof-chip block.
- Product cards, bundle cards, bulk order rows, brand grid, newsletter, and footer do not force overflow.
- Mobile sections are dense but still usable; no important CTA is pushed off-canvas.

## SEO And Head

Compare these live-page items against the reference intent:

- Exactly one meaningful `<h1>` on the homepage.
- H1 and title target the same positioning: wholesale blank apparel/t-shirts for Australian businesses, teams, schools, and bulk/custom orders.
- `<title>` is present and not generic.
- Meta description is present and describes wholesale apparel, bulk pricing, printing/embroidery, PO support, and Australia.
- Canonical URL points to the production homepage.
- Open Graph and Twitter metadata exist and use production URLs/assets.
- Favicon request does not 404.
- Structured data exists and validates as JSON-LD for the relevant homepage entities, such as `Organization`, `WebSite`, `SearchAction`, and category/item list data.

## Content And Marketing

Confirm the live page preserves these business messages:

- Purchase orders are accepted for schools, councils, government, or approved customers.
- Phone contact `02 8880 3731` remains visible or accessible.
- Quote request CTA is available in desktop and mobile navigation.
- GST inc/ex display toggle is available where intended.
- Bulk pricing and quantity-tier messaging remain visible on product cards.
- Product + print value packs are present and communicate included print/embroidery.
- Product-only value packs or multi-buy packs are present.
- Easy bulk order section is present and usable.
- Brand stockist/trust section is present without causing mobile overflow.
- Footer keeps service hours, phone, email, location, shop/category/service links, and legal links.

Treat missing or weakened conversion messages as defects, even if the page looks visually close.

## Links And Navigation

Audit all user-facing links:

- No production link should use `href="#"`.
- Navigation links should route to real category, account, cart, quote, content, or policy destinations.
- UI-only controls should be buttons, not fake links.
- Header logo links to the homepage.
- Cart, login/account, quote request, phone, email, footer, social, journal, product, category, bundle, and collection links are valid or intentionally stubbed by the platform with documented behavior.
- Search fields submit to the platform search route or trigger the intended search behavior.

## Mobile Menu

The mobile drawer is not expected to mirror the desktop mega-menu as one long accordion. It should preserve the same shopping paths while reducing scroll and decision fatigue.

Expected mobile drawer behavior:

- Drawer opens from the hamburger and closes from the close button, overlay, and Escape key if supported by the platform.
- Drawer includes a search field near the top.
- Drawer includes quick links for `T-Shirts`, `Polos`, `Hoodies`, and `Sale`.
- Drawer uses a tabbed mobile mega-menu with these tabs: `Category`, `Industry`, `Gender`, `Services`.
- Only one tab panel is visible at a time.
- `Category` panel includes: Tops, Bottoms, Outerwear, Hi-Vis & Workwear, Accessories, View All Products.
- `Industry` panel includes: Team Uniforms, Corporate Wear, Trades & Construction, Hospitality, Schools & Education, Healthcare.
- `Gender` panel includes: Men, Women, Kids.
- `Services` panel includes: Screen Printing, Embroidery, Bulk Orders, Request a Quote.
- The old long nested accordion groups from earlier prototypes should not be visible on mobile.
- Quote request, login/register, phone, help/contact links, and GST toggle remain accessible below the shop panels.

## Accessibility

Run keyboard and accessibility checks without relying on screenshots:

- All interactive elements are reachable by keyboard.
- Focus is visible on links, buttons, inputs, category controls, sidebar controls, and modal controls.
- Mobile menu open/close updates `aria-expanded` or equivalent accessible state.
- Mobile menu tabs update `aria-selected` or equivalent selected state, and hidden panels are not exposed as active content.
- Mega menu opens on keyboard focus as well as pointer hover, or the live platform provides an equivalent keyboard path.
- Quickview/product modal traps focus while open, closes on Escape, and restores focus to the opener.
- Icon-only buttons have accessible names.
- Images that communicate product/category meaning have useful alt text; decorative images can use empty alt.
- Product rating UI must not imply fake reviews. If review counts are unavailable, use non-review merchandising labels instead.

## Performance-Sensitive Behavior

Compare important performance choices:

- Hero video remains visible on mobile but is cropped/overscaled to avoid side bars. It must not block the initial mobile experience.
- Critical hero poster/fallback imagery is optimized and sized for the viewport.
- Fonts are loaded via efficient `<link>` usage, not excessive CSS `@import`.
- Only necessary font families and weights are loaded.
- Lazy loading is used for below-the-fold images.
- Above-the-fold assets do not cause layout shift.
- Console has no avoidable errors, especially missing assets.

## Automated Checks To Run

For both reference and live page, collect and compare:

```js
JSON.stringify({
  url: location.href,
  title: document.title,
  h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
  metaDescription: document.querySelector('meta[name="description"]')?.content || null,
  canonical: document.querySelector('link[rel="canonical"]')?.href || null,
  hashLinks: [...document.querySelectorAll('a[href="#"]')].length,
  emptyButtons: [...document.querySelectorAll('button')]
    .filter(b => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length,
  images: document.images.length,
  lazyImages: [...document.images].filter(i => i.loading === 'lazy').length,
  jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth,
  overflowX: document.documentElement.scrollWidth > innerWidth
});
```

At each viewport, also collect:

```js
JSON.stringify({
  width: innerWidth,
  height: innerHeight,
  overflowX: document.documentElement.scrollWidth > innerWidth,
  headerVisible: !!document.querySelector('header'),
  subnavDisplay: getComputedStyle(document.querySelector('.subnav') || document.body).display,
  desktopSearchDisplay: getComputedStyle(document.querySelector('.header__search') || document.body).display,
  mobileSearchDisplay: getComputedStyle(document.querySelector('.header__mobile-search') || document.body).display,
  mobileMenu: (() => {
    const menu = document.querySelector('.mobile-mega');
    if (!menu) return null;
    return {
      quickLinks: [...menu.querySelectorAll('.mobile-mega__quick a')].map(a => a.textContent.trim()),
      tabs: [...menu.querySelectorAll('.mobile-mega__tab')].map(t => ({
        text: t.textContent.trim(),
        selected: t.getAttribute('aria-selected'),
        active: t.classList.contains('active')
      })),
      activePanel: menu.querySelector('.mobile-mega__panel.active')?.dataset.mobilePanel || null,
      visiblePanelLinks: [...menu.querySelectorAll('.mobile-mega__panel.active a')].map(a => a.textContent.trim().replace(/\s+/g, ' '))
    };
  })(),
  mobileHero: (() => {
    const hero = document.querySelector('.banner-card--main');
    if (!hero) return null;
    const video = hero.querySelector('.banner-card__video');
    const proof = hero.querySelector('.hero-proof');
    return {
      heading: hero.querySelector('h1')?.textContent.trim() || null,
      description: hero.querySelector('.banner-card__desc')?.textContent.trim() || null,
      proofDisplay: proof ? getComputedStyle(proof).display : null,
      videoDisplay: video ? getComputedStyle(video).display : null,
      videoTransform: video ? getComputedStyle(video).transform : null
    };
  })(),
  firstSections: [...document.querySelectorAll('section')].slice(0, 6).map(s => ({
    label: s.getAttribute('aria-label') || s.querySelector('h1,h2,h3')?.textContent.trim() || s.className,
    top: Math.round(s.getBoundingClientRect().top),
    height: Math.round(s.getBoundingClientRect().height)
  }))
});
```

If overflow exists, identify causes with:

```js
JSON.stringify([...document.body.querySelectorAll('*')]
  .map(el => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      id: el.id,
      className: String(el.className).slice(0, 120),
      left: Math.round(r.left),
      right: Math.round(r.right),
      width: Math.round(r.width),
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)
    };
  })
  .filter(x => x.width > innerWidth || x.right > innerWidth + 2 || x.left < -2)
  .sort((a, b) => b.right - a.right)
  .slice(0, 30));
```

## Severity Guide

- `Blocker`: checkout/search/account/nav cannot be used, page has severe mobile overflow, or critical content is missing.
- `High`: SEO fundamentals missing, no H1, fake links in production, inaccessible navigation/modal, broken primary CTAs.
- `Medium`: important marketing proof weakened, non-critical overflow, poor focus visibility, missing structured data, avoidable console errors.
- `Low`: copy mismatch, spacing/visual polish issue, minor metadata inconsistency, non-critical image alt issue.

## Expected Output

Return a findings-first review:

- Findings ordered by severity.
- Each finding includes viewport, selector or page area, live behavior, expected reference behavior, and recommended fix.
- Include a short residual-risk section for anything not fully testable.
- Avoid dumping screenshots unless they are necessary to explain a visual-only issue.
