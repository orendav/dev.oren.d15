"""
One-shot rewrite of designs/03-hyper.v5/index.html — replace every local image
reference with an imgix URL. Adds srcset+sizes per section policy.

Run: py scripts/imgix_migrate.py

Idempotent-ish: re-running looks for `images/...` paths so once they're rewritten
to imgix URLs the script becomes a no-op (will skip).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
HOST = "https://wbt01.imgix.net"

# ── local filename → R2 key (full path under wbt01.imgix.net/) ───────────────
# Talent files. Note J3150 + J408M live at flat test01/{SKU}/ prefix (uploaded
# separately); the rest live under test01/09%20Activewear/{SKU}/.
TALENT = {
    "group-women-activewear.jpg":   "test01/09%20Activewear/L513LT/Talent_Group_Flex_01_R.jpg",
    "activewear-model-women-1.jpg": "test01/09%20Activewear/L323LT/L323LT_Talent_Black_02_R.jpg",
    "jacket-model-1.jpg":           "test01/09%20Activewear/TP409M/TP409M_Talent_Black_01_R.jpg",
    "jacket-model-2.jpg":           "test01/J408M/J408M_Talent_Black_Red_02_R.jpg",
    "jacket-model-3.jpg":           "test01/J408M/J408M_Talent_Royal_White_03_R.jpg",
    "leggings-model-1.jpg":         "test01/09%20Activewear/L514LL/L514LL_Talent_Black_01_R.jpg",
    "quarter-zip-model-1.jpg":      "test01/09%20Activewear/SW225M/SW225M_Talent_Navy_White_01_R.jpg",
    "quarter-zip-model-2.jpg":      "test01/09%20Activewear/SW225M/SW225M_Talent_Navy_White_03_R.jpg",
    "shorts-model-1.jpg":           "test01/09%20Activewear/ST2020/ST2020_Talent_Black_01_R.jpg",
    "shorts-model-kids.jpg":        "test01/09%20Activewear/ST511K/ST511K_Talent_Black_R.jpg",
    "track-jacket-model-1.jpg":    "test01/J3150/J3150_Talent_Navy_White_01_R.jpg",
    "track-pants-model-1.jpg":      "test01/09%20Activewear/TP3160/TP3160_Talent_Navy_01_R.jpg",
    "track-pants-model-2.jpg":      "test01/09%20Activewear/TP3160/TP3160_Talent_Navy_02_R.jpg",
    "track-pants-model-women.jpg":  "test01/09%20Activewear/TP226L/TP226L_Talent_Black_R.jpg",
}

# Product files. J3150 + J408M product photos also live under flat test01/{SKU}/.
PRODUCT = {
    "shorts-black.jpg":             "test01/09%20Activewear/ST2020/ST2020_Product_Black_01.jpg",
    "shorts-navy.jpg":              "test01/09%20Activewear/ST2020/ST2020_Product_Navy_01.jpg",
    "shorts-kids-black.jpg":        "test01/09%20Activewear/ST511K/ST511K_Product_Black_01.jpg",
    "shorts-mens-black.jpg":        "test01/09%20Activewear/ST511M/ST511M_Product_Black_01.jpg",
    "track-pants-mens-black.jpg":   "test01/09%20Activewear/TP226M/TP226M_Product_Black_01.jpg",
    "track-pants-womens-black.jpg": "test01/09%20Activewear/TP226L/TP226L_Product_Black_01.jpg",
    "track-pants-navy.jpg":         "test01/09%20Activewear/TP3160/TP3160_Product_Navy_01.jpg",
    "leggings-long-black.jpg":      "test01/09%20Activewear/L514LL/L514LL_Product_Black_01.jpg",
    "leggings-short-black.jpg":     "test01/09%20Activewear/L323LS/L323LS_Product_Black_01.jpg",
    "quarter-zip-black-red.jpg":    "test01/09%20Activewear/SW225M/SW225M_Product_Black_Red_01.jpg",
    "quarter-zip-navy-white.jpg":   "test01/09%20Activewear/SW225M/SW225M_Product_Navy_White_01.jpg",
    "jacket-royal-white.jpg":       "test01/J408M/J408M_Product_Royal_White_01.jpg",
    "jacket-black-red.jpg":         "test01/J408M/J408M_Product_Black_Red_01.jpg",
    "jacket-navy-white.jpg":        "test01/J408M/J408M_Product_Navy_White_01.jpg",
    "track-jacket-navy-white.jpg":  "test01/J3150/J3150_Product_Navy_White_01.jpg",
    "track-jacket-black-white.jpg": "test01/J3150/J3150_Product_Black_White_01.jpg",
}

# Bundle/pack composites — flat test01/bundles/.
BUNDLE = {
    fn: f"test01/bundles/{fn}" for fn in [
        "ai-bundle-print-hoodie-fb.png",
        "ai-bundle-print-polo-fb.png",
        "ai-bundle-print-tee-fb.png",
        "ai-pack-hivis-3.png",
        "ai-pack-jackets-twin.png",
        "ai-pack-shorts-twin.png",
        "ai-pack-trackpants-4.png",
        "bundle-club-uniform.jpg",
        "bundle-corporate-team.jpg",
        "bundle-hospitality.jpg",
        "pack-jackets-twin.jpg",
        "pack-quarterzip-3.jpg",
        "pack-shorts-twin.jpg",
        "pack-trackpants-4.jpg",
    ]
}


def r2_key(local: str) -> str | None:
    """Map images/<bucket>/<file> → R2 key, or None if unknown."""
    fname = local.rsplit("/", 1)[-1]
    if local.startswith("images/talent/"):
        return TALENT.get(fname)
    if local.startswith("images/products/"):
        return PRODUCT.get(fname)
    if local.startswith("images/bundles/"):
        return BUNDLE.get(fname)
    return None


def url(local: str, w: int, crop: str = "faces") -> str:
    key = r2_key(local)
    if key is None:
        raise KeyError(f"No R2 mapping for {local}")
    bundle = local.startswith("images/bundles/")
    if bundle:
        # bundles are flat composites — no fit/crop; just compress + resize
        return f"{HOST}/{key}?auto=format,compress&w={w}"
    return f"{HOST}/{key}?auto=format,compress&fit=crop&crop={crop}&w={w}"


def srcset_w(local: str, widths: list[int], crop: str = "faces") -> str:
    return ", ".join(f"{url(local, w, crop)} {w}w" for w in widths)


def srcset_dpr(local: str, base_w: int, multipliers=(1, 2), crop: str = "faces") -> str:
    return ", ".join(f"{url(local, base_w * m, crop)} {m}x" for m in multipliers)


# ── per-section policies ─────────────────────────────────────────────────────
# Each entry: (section_name, end_line, image_kind_default, srcset_fn, sizes)
# srcset_fn: callable(local) -> srcset string. None = leave src alone (don't add srcset).
# sizes: HTML sizes attribute, or None to omit.
def gender_tile_srcset(local):  return srcset_dpr(local, 400, (1, 2), "faces")
def megamenu_thumb_srcset(local, crop="faces"):
    return srcset_dpr(local, 200, (1, 2), crop)
def shop_cat_srcset(local):     return srcset_w(local, [320, 480, 640, 800, 960], "faces")
def product_card_srcset(local): return srcset_w(local, [240, 360, 480, 640], "entropy")
def journal_srcset(local):      return srcset_w(local, [320, 480, 640, 800], "faces")
def bundle_srcset(local):       return srcset_w(local, [320, 480, 640, 800], "entropy")
def featured_srcset(local):     return srcset_w(local, [480, 720, 960, 1280], "faces")
def team_srcset(local):         return srcset_w(local, [480, 720, 960, 1280], "faces")
def bulk_thumb_srcset(local):   return srcset_dpr(local, 80, (1, 2), "entropy")
def hover_url(local):           return url(local, 480, "entropy")  # single URL
def alt_url(local):             return url(local, 640, "faces")    # single URL


# Section line ranges (start_line, end_line_exclusive).
SECTIONS = [
    ("megamenu",      108, 438),
    ("top-banner",    438, 506),
    ("shop-cat",      506, 549),
    ("bestsellers",   549, 716),
    ("bundles-print", 716, 818),
    ("packs",         818, 909),
    ("featured-banner", 909, 926),
    ("clearance",     926, 1080),
    ("quickview",     1080, 1132),
    ("meet-brand",    1132, 1157),
    ("customizer",    1157, 1295),
    ("bulk-order",    1295, 1490),
    ("new-arrivals",  1490, 1645),
    ("brand-showcase", 1691, 1782),
    ("journal",       1782, 1823),
    ("footer",        1835, 1940),
    ("sidebar-mobile", 1940, 2116),
]

def section_for(line_num: int) -> str:
    for name, lo, hi in SECTIONS:
        if lo <= line_num < hi:
            return name
    return "other"


# ── img tag rewriter ─────────────────────────────────────────────────────────
IMG_RE = re.compile(
    r'(<img\b[^>]*?)\bsrc="(images/(?:talent|products|bundles)/[^"]+)"([^>]*?>)',
    re.IGNORECASE,
)

# matches <img> elements that already have srcset (skip those — idempotency)
HAS_SRCSET_RE = re.compile(r'\bsrcset=', re.IGNORECASE)


def rewrite_img(match: re.Match, section: str) -> str:
    pre, src, post = match.group(1), match.group(2), match.group(3)
    full = match.group(0)
    if HAS_SRCSET_RE.search(full):
        return full  # already migrated

    # Determine srcset + sizes per section
    is_talent = src.startswith("images/talent/")
    is_product = src.startswith("images/products/")
    is_bundle = src.startswith("images/bundles/")

    if section == "megamenu":
        # Gender tiles use a 400px-wide ladder, mega-menu category thumbs use 200px.
        # Distinguish by alt-text length / surrounding class is hard from regex
        # alone — we pick by bucket: talent in gender tiles + category thumbs share
        # the same regex match, so use the larger 200/400 ladder for everything in
        # this section. Gender tiles (rare, 3 of them) get a slight upscale on hover
        # but bandwidth difference is trivial.
        # Decision: use w=400 1x / w=800 2x for talent (bigger renders); w=200/400
        # for products (smaller thumb tiles).
        if is_talent:
            srcset = srcset_dpr(src, 200, (1, 2), "faces")
        else:
            srcset = srcset_dpr(src, 200, (1, 2), "entropy")
        sizes = None
    elif section == "shop-cat":
        srcset = shop_cat_srcset(src)
        sizes = "(min-width: 992px) 33vw, 100vw"
    elif section in ("bestsellers", "new-arrivals", "customizer"):
        srcset = product_card_srcset(src)
        sizes = "(min-width: 1024px) 25vw, (min-width: 600px) 33vw, 50vw"
    elif section in ("bundles-print", "packs"):
        # Bundle/pack image cards
        if is_bundle:
            srcset = bundle_srcset(src)
        else:
            srcset = product_card_srcset(src)
        sizes = "(min-width: 992px) 33vw, (min-width: 600px) 50vw, 100vw"
    elif section == "clearance":
        srcset = product_card_srcset(src)
        sizes = "(min-width: 1024px) 25vw, (min-width: 600px) 33vw, 50vw"
    elif section == "meet-brand":
        srcset = team_srcset(src)
        sizes = "(min-width: 768px) 50vw, 100vw"
    elif section == "bulk-order":
        srcset = bulk_thumb_srcset(src)
        sizes = None  # fixed-size grid thumbs
    elif section == "journal":
        srcset = journal_srcset(src)
        sizes = "(min-width: 992px) 33vw, 100vw"
    elif section == "quickview":
        srcset = product_card_srcset(src)
        sizes = "(min-width: 768px) 50vw, 100vw"
    elif section == "sidebar-mobile":
        srcset = srcset_dpr(src, 80, (1, 2), "entropy")
        sizes = None
    else:
        # Unknown section — minimal: just compress at the served dimension.
        srcset = srcset_dpr(src, 400, (1, 2), "entropy" if is_product else "faces")
        sizes = None

    # Build new tag — keep src as local fallback
    sizes_attr = f' sizes="{sizes}"' if sizes else ""
    return f'{pre}src="{src}" srcset="{srcset}"{sizes_attr}{post}'


# ── data-* attribute rewriters ───────────────────────────────────────────────
HOVER_RE = re.compile(r'data-hover-images="([^"]+)"')
ALT_RE = re.compile(r'data-image-alt="(images/[^"]+)"')
POSTER_RE = re.compile(r'<video\b([^>]*?)\bposter="(images/[^"]+)"([^>]*?>)', re.IGNORECASE)


def rewrite_hover(match: re.Match) -> str:
    paths = [p.strip() for p in match.group(1).split(",") if p.strip()]
    new_paths = []
    for p in paths:
        if p.startswith("https://") or not p.startswith("images/"):
            new_paths.append(p)
            continue
        try:
            new_paths.append(hover_url(p))
        except KeyError as e:
            print(f"  WARN: data-hover-images: no R2 mapping for {p}", file=sys.stderr)
            new_paths.append(p)
    # Use `|` separator (not `,`) because imgix URLs contain `auto=format,compress`.
    # JS in main.js splits on `|`.
    return f'data-hover-images="{" | ".join(new_paths)}"'


def rewrite_alt(match: re.Match) -> str:
    p = match.group(1)
    if p.startswith("https://") or not p.startswith("images/"):
        return match.group(0)
    try:
        return f'data-image-alt="{alt_url(p)}"'
    except KeyError:
        return match.group(0)


def rewrite_video_poster(match: re.Match) -> str:
    pre, src, post = match.group(1), match.group(2), match.group(3)
    if src.startswith("https://") or not src.startswith("images/"):
        return match.group(0)
    try:
        new_src = url(src, 1024, "faces")
        return f'<video{pre}poster="{new_src}"{post}'
    except KeyError:
        return match.group(0)


# ── main ─────────────────────────────────────────────────────────────────────
def main():
    text = INDEX.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    out_lines = []
    img_count = 0
    skip_count = 0

    for i, line in enumerate(lines, start=1):
        section = section_for(i)

        # Replace <img src="images/..."> additions of srcset+sizes
        def _img_sub(m, section=section):
            nonlocal img_count, skip_count
            if HAS_SRCSET_RE.search(m.group(0)):
                skip_count += 1
                return m.group(0)
            try:
                rewritten = rewrite_img(m, section)
                img_count += 1
                return rewritten
            except KeyError as e:
                print(f"  WARN line {i} ({section}): no R2 mapping for {m.group(2)}", file=sys.stderr)
                return m.group(0)

        new_line = IMG_RE.sub(_img_sub, line)
        new_line = HOVER_RE.sub(rewrite_hover, new_line)
        new_line = ALT_RE.sub(rewrite_alt, new_line)
        new_line = POSTER_RE.sub(rewrite_video_poster, new_line)
        out_lines.append(new_line)

    INDEX.write_text("".join(out_lines), encoding="utf-8")
    print(f"  Rewrote {img_count} <img> tags  (skipped {skip_count} that already had srcset)")
    print(f"  Wrote {INDEX}")


if __name__ == "__main__":
    main()
