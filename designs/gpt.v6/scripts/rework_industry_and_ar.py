"""
One-shot patch for v5/index.html:
  1. Replace Shop By Industry mega-menu with a sidebar-tabbed structure (mirrors Category).
  2. Add ar= to talent URLs in mega-menu nav tiles + shop-by-gender homepage tiles
     so crop=faces actually wins over the browser's object-fit cover-crop.

Run: py scripts/rework_industry_and_ar.py
"""
import re
from pathlib import Path

INDEX = Path(__file__).resolve().parents[1] / "index.html"

def url(key, w, crop):
    return f"https://wbt01.imgix.net/{key}?auto=format,compress&fit=crop&crop={crop}&w={w}"

def srcset_dpr(key, base_w, crop):
    return f"{url(key, base_w, crop)} 1x, {url(key, base_w*2, crop)} 2x"

# Asset library — (local_fallback, r2_key, crop_type)
A = {
    "polo-talent":     ("images/talent/quarter-zip-model-1.jpg",     "test01/09%20Activewear/SW225M/SW225M_Talent_Navy_White_01_R.jpg",  "faces"),
    "qz-product":      ("images/products/quarter-zip-navy-white.jpg","test01/09%20Activewear/SW225M/SW225M_Product_Navy_White_01.jpg",   "entropy"),
    "qz-talent":       ("images/talent/quarter-zip-model-2.jpg",     "test01/09%20Activewear/SW225M/SW225M_Talent_Navy_White_03_R.jpg",  "faces"),
    "qz-red-product":  ("images/products/quarter-zip-black-red.jpg", "test01/09%20Activewear/SW225M/SW225M_Product_Black_Red_01.jpg",    "entropy"),
    "tracktop-talent": ("images/talent/track-jacket-model-1.jpg",    "test01/J3150/J3150_Talent_Navy_White_01_R.jpg",                    "faces"),
    "tracktop-product":("images/products/track-jacket-navy-white.jpg","test01/J3150/J3150_Product_Navy_White_01.jpg",                    "entropy"),
    "trackbk-product": ("images/products/track-jacket-black-white.jpg","test01/J3150/J3150_Product_Black_White_01.jpg",                  "entropy"),
    "trackpants-talent":("images/talent/track-pants-model-1.jpg",    "test01/09%20Activewear/TP3160/TP3160_Talent_Navy_01_R.jpg",        "faces"),
    "trackpants-mens": ("images/products/track-pants-mens-black.jpg","test01/09%20Activewear/TP226M/TP226M_Product_Black_01.jpg",        "entropy"),
    "trackpants-womens":("images/talent/track-pants-model-women.jpg","test01/09%20Activewear/TP226L/TP226L_Talent_Black_R.jpg",          "faces"),
    "trackpants-navy": ("images/products/track-pants-navy.jpg",      "test01/09%20Activewear/TP3160/TP3160_Product_Navy_01.jpg",         "entropy"),
    "shorts-talent":   ("images/talent/shorts-model-1.jpg",          "test01/09%20Activewear/ST2020/ST2020_Talent_Black_01_R.jpg",       "faces"),
    "shorts-product":  ("images/products/shorts-black.jpg",          "test01/09%20Activewear/ST2020/ST2020_Product_Black_01.jpg",        "entropy"),
    "shorts-navy":     ("images/products/shorts-navy.jpg",           "test01/09%20Activewear/ST2020/ST2020_Product_Navy_01.jpg",         "entropy"),
    "shorts-kids":     ("images/talent/shorts-model-kids.jpg",       "test01/09%20Activewear/ST511K/ST511K_Talent_Black_R.jpg",          "faces"),
    "shorts-kids-prod":("images/products/shorts-kids-black.jpg",     "test01/09%20Activewear/ST511K/ST511K_Product_Black_01.jpg",        "entropy"),
    "shorts-mens-prod":("images/products/shorts-mens-black.jpg",     "test01/09%20Activewear/ST511M/ST511M_Product_Black_01.jpg",        "entropy"),
    "leggings-talent": ("images/talent/leggings-model-1.jpg",        "test01/09%20Activewear/L514LL/L514LL_Talent_Black_01_R.jpg",       "faces"),
    "leggings-prod":   ("images/products/leggings-long-black.jpg",   "test01/09%20Activewear/L514LL/L514LL_Product_Black_01.jpg",        "entropy"),
    "leggings-short":  ("images/products/leggings-short-black.jpg",  "test01/09%20Activewear/L323LS/L323LS_Product_Black_01.jpg",        "entropy"),
    "jacket-rwhite":   ("images/talent/jacket-model-3.jpg",          "test01/J408M/J408M_Talent_Royal_White_03_R.jpg",                   "faces"),
    "jacket-rwhite-p": ("images/products/jacket-royal-white.jpg",    "test01/J408M/J408M_Product_Royal_White_01.jpg",                    "entropy"),
    "jacket-bred":     ("images/talent/jacket-model-2.jpg",          "test01/J408M/J408M_Talent_Black_Red_02_R.jpg",                     "faces"),
    "jacket-bred-p":   ("images/products/jacket-black-red.jpg",      "test01/J408M/J408M_Product_Black_Red_01.jpg",                      "entropy"),
    "jacket-nwhite-p": ("images/products/jacket-navy-white.jpg",     "test01/J408M/J408M_Product_Navy_White_01.jpg",                     "entropy"),
    "tracktop-talent2":("images/talent/jacket-model-1.jpg",          "test01/09%20Activewear/TP409M/TP409M_Talent_Black_01_R.jpg",       "faces"),
    "women-active":    ("images/talent/activewear-model-women-1.jpg","test01/09%20Activewear/L323LT/L323LT_Talent_Black_02_R.jpg",       "faces"),
    "women-group":     ("images/talent/group-women-activewear.jpg",  "test01/09%20Activewear/L513LT/Talent_Group_Flex_01_R.jpg",         "faces"),
}

def card(label, asset_id):
    src, key, crop = A[asset_id]
    s = srcset_dpr(key, 200, crop)
    return (f'                <div class="mega-menu__content-card">\n'
            f'                  <img src="{src}" srcset="{s}" alt="{label}" loading="lazy">\n'
            f'                  <span>{label}</span>\n'
            f'                </div>')

# Industry -> (label, slug, [(card_label, asset_id) × 6])
INDUSTRIES = [
    ("Team Uniforms",         "team",        [("Team Polos","polo-talent"),("Sports Jerseys","jacket-bred-p"),("Track Jackets","tracktop-talent"),("Team Track Pants","trackpants-talent"),("Hoodies","jacket-rwhite"),("Match Day Shorts","shorts-talent")]),
    ("Corporate Wear",        "corporate",   [("Corporate Polos","polo-talent"),("Quarter-Zips","qz-talent"),("Soft-Shell Jackets","jacket-bred"),("Vests","jacket-rwhite-p"),("Branded Tees","shorts-mens-prod"),("Tailored Pants","trackpants-mens")]),
    ("Trades & Construction", "trades",      [("Hi-Vis Tops","tracktop-product"),("Hi-Vis Hoodies","tracktop-talent"),("Work Pants","trackpants-mens"),("Work Shorts","shorts-mens-prod"),("Work Jackets","trackbk-product"),("Singlets","jacket-rwhite-p")]),
    ("Hospitality",           "hospitality", [("Server Polos","polo-talent"),("Hospitality Tees","shorts-mens-prod"),("Chef Tops","jacket-nwhite-p"),("Black Pants","trackpants-mens"),("Aprons","shorts-product"),("Headwear","shorts-kids-prod")]),
    ("Schools & Education",   "schools",     [("School Polos","qz-product"),("Sports Polos","polo-talent"),("School Hoodies","jacket-rwhite"),("Track Pants","trackpants-mens"),("School Shorts","shorts-kids"),("Kids Sports Tees","shorts-kids-prod")]),
    ("Gym & Fitness",         "fitness",     [("Gym Tops","qz-talent"),("Leggings","leggings-talent"),("Performance Shorts","shorts-talent"),("Track Jackets","tracktop-talent2"),("Womens Activewear","women-active"),("Compression","qz-red-product")]),
    ("Events & Promo",        "events",      [("Printed Tees","shorts-mens-prod"),("Promo Hoodies","jacket-rwhite"),("Event Polos","polo-talent"),("Caps & Hats","shorts-kids-prod"),("Crew Jackets","jacket-bred"),("Group Sets","women-group")]),
    ("Healthcare",            "healthcare",  [("Scrub Tops","jacket-nwhite-p"),("Healthcare Polos","qz-product"),("Lab Coats","jacket-rwhite-p"),("Cargo Pants","trackpants-mens"),("Compression","leggings-short"),("Outer Layers","jacket-bred")]),
]


def build_industry_section():
    sidebar = []
    panels = []
    for i, (label, slug, cards) in enumerate(INDUSTRIES):
        cls = "mega-menu__sidebar-link active" if i == 0 else "mega-menu__sidebar-link"
        sidebar.append(f'              <a href="#" class="{cls}" data-cat="{slug}">{label}</a>')
        panel_cls = "mega-menu__panel mega-menu__content active" if i == 0 else "mega-menu__panel mega-menu__content"
        cards_html = "\n".join(card(l, k) for l, k in cards)
        panels.append(f'              <div class="{panel_cls}" data-cat="{slug}">\n{cards_html}\n              </div>')

    return ("      <!-- Shop By Industry (B-style visual mega menu, sidebar tabs) -->\n"
            "      <div class=\"subnav__item\">\n"
            "        <a href=\"#\" class=\"subnav__link\">\n"
            "          Shop By Industry\n"
            "          <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke-width=\"2\" stroke-linecap=\"round\"><polyline points=\"6 9 12 15 18 9\"/></svg>\n"
            "        </a>\n"
            "        <div class=\"mega-menu mega-menu--style-b mega-menu--tabs\">\n"
            "          <div class=\"mega-menu__inner\">\n"
            "            <div class=\"mega-menu__sidebar\">\n"
            + "\n".join(sidebar) + "\n"
            "            </div>\n"
            "            <div class=\"mega-menu__panels\">\n"
            + "\n".join(panels) + "\n"
            "            </div>\n"
            "          </div>\n"
            "        </div>\n"
            "      </div>")


def replace_industry_section(text):
    # Match from the Industry comment through to the closing of its subnav__item
    pat = re.compile(
        r'\s*<!-- Shop By Industry[^\n]*-->\s*\n'
        r'\s*<div class="subnav__item">\s*\n'
        r'\s*<a href="#" class="subnav__link">\s*\n'
        r'\s*Shop By Industry\s*\n'
        r'.*?'
        r'\s*</div>\s*\n'           # closing mega-menu__content
        r'\s*</div>\s*\n'           # closing mega-menu__inner
        r'\s*</div>\s*\n'           # closing mega-menu
        r'\s*</div>',               # closing subnav__item
        re.DOTALL,
    )
    m = pat.search(text)
    if not m:
        raise SystemExit("Industry section not found")
    print(f"  Industry block matched: {len(m.group(0))} chars at line ~{text[:m.start()].count(chr(10))+1}")
    return text[:m.start()] + "\n" + build_industry_section() + text[m.end():]


def add_ar_to_section(text, start_line, end_line, ar):
    """Add &ar=W:H to imgix URLs in given line range (only crop=faces URLs without existing ar=)."""
    lines = text.splitlines(keepends=True)
    needle = "?auto=format,compress&fit=crop&crop=faces"
    inj = f"?auto=format,compress&fit=crop&crop=faces&ar={ar}"
    pat = re.compile(re.escape(needle) + r'(?!&ar=)')
    n = 0
    for i in range(start_line - 1, min(end_line, len(lines))):
        new_line, k = pat.subn(inj, lines[i])
        if k:
            lines[i] = new_line
            n += k
    return "".join(lines), n


def main():
    text = INDEX.read_text(encoding="utf-8")
    print("[1] Replacing Shop By Industry mega-menu with sidebar-tabs structure")
    text = replace_industry_section(text)

    # After the replacement, the file's line numbers shift. Recompute.
    # Find sections by looking for the comment markers.
    def find_section_lines(text, start_marker, end_marker):
        s = text.find(start_marker)
        e = text.find(end_marker, s)
        if s == -1 or e == -1:
            return None, None
        return (text[:s].count("\n") + 1, text[:e].count("\n") + 1)

    print("[2] Adding ar= to mega-menu (Gender + Category + Industry tile imgix URLs)")
    s, e = find_section_lines(text, "<!-- Shop By Gender", "<!-- Direct links -->")
    if s and e:
        text, n = add_ar_to_section(text, s, e, "1:1")
        print(f"      mega-menu lines {s}-{e}: ar=1:1 -> {n} URLs")

    print("[3] Adding ar= to Shop-by-Gender homepage tiles (.shop-cat-card)")
    s, e = find_section_lines(text, "5b. Shop by Category", "6. Best Sellers")
    if s and e:
        text, n = add_ar_to_section(text, s, e, "4:5")
        print(f"      shop-cat lines {s}-{e}: ar=4:5 -> {n} URLs")

    INDEX.write_text(text, encoding="utf-8")
    print(f"  Wrote {INDEX}")


if __name__ == "__main__":
    main()
