"""Composite bundle images for product+print and product-only value packs.

Each bundle layers 2-4 product photos on a clean square canvas with a soft drop
shadow, slight rotation, and overlap so the cards read as a 'pack'.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS = ROOT / "images" / "products"
TALENT = ROOT / "images" / "talent"
OUT = ROOT / "images" / "bundles"
OUT.mkdir(parents=True, exist_ok=True)

CANVAS = 900
BG = (245, 246, 248, 255)  # very light cool grey


def fit_square(img: Image.Image, size: int) -> Image.Image:
    """Crop to square then resize."""
    w, h = img.size
    s = min(w, h)
    img = img.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
    return img.resize((size, size), Image.LANCZOS)


def shadow(img: Image.Image, blur: int = 22, opacity: int = 110) -> Image.Image:
    """Return an RGBA shadow layer matching img's alpha."""
    alpha = img.split()[-1]
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.putalpha(alpha.point(lambda v: int(v * opacity / 255)))
    return sh.filter(ImageFilter.GaussianBlur(blur))


def remove_white_bg(img: Image.Image, threshold: int = 240) -> Image.Image:
    """Crude white-background cutout — products sit on light backgrounds."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > threshold and g > threshold and b > threshold:
                px[x, y] = (r, g, b, 0)
    return img


def build_bundle(items, out_name: str, *, accent: tuple | None = None,
                 sizes=(560, 480, 420, 360), offsets=None, rotations=None):
    """Stack `items` (list of file paths) into a composite at OUT/out_name."""
    canvas = Image.new("RGBA", (CANVAS, CANVAS), BG)

    # subtle radial vignette via a soft circle
    if accent:
        glow = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse((-200, -200, CANVAS + 200, CANVAS + 200), fill=(*accent, 30))
        canvas = Image.alpha_composite(canvas, glow.filter(ImageFilter.GaussianBlur(120)))

    n = len(items)
    if offsets is None:
        # default: stagger from back-left to front-right
        offsets = [
            (CANVAS // 2 - sizes[i] // 2 + (i - n / 2 + 0.5) * 110,
             CANVAS // 2 - sizes[i] // 2 + (i - n / 2 + 0.5) * 60)
            for i in range(n)
        ]
    if rotations is None:
        rotations = [(-i + (n - 1) / 2) * 6 for i in range(n)]

    # back to front
    for i, path in enumerate(items):
        sz = sizes[i] if i < len(sizes) else sizes[-1]
        img = Image.open(path).convert("RGBA")
        img = fit_square(img, sz)
        img = remove_white_bg(img)
        # rotate with expand to keep edges
        img = img.rotate(rotations[i], resample=Image.BICUBIC, expand=True)
        # drop shadow (slightly offset)
        sh = shadow(img, blur=24, opacity=120)
        ox, oy = int(offsets[i][0]), int(offsets[i][1])
        canvas.alpha_composite(sh, (ox + 12, oy + 18))
        canvas.alpha_composite(img, (ox, oy))

    out_path = OUT / out_name
    canvas.convert("RGB").save(out_path, quality=88, optimize=True)
    print(f"  wrote {out_path.name}  ({out_path.stat().st_size / 1024:.0f} KB)")
    return out_path


# ----- Product + Print bundles (essentialworkwear-style) -----------------
print("Product+Print bundles:")

build_bundle(
    [PRODUCTS / "quarter-zip-navy-white.jpg",
     PRODUCTS / "track-pants-navy.jpg",
     PRODUCTS / "jacket-navy-white.jpg"],
    "bundle-corporate-team.jpg",
    accent=(26, 43, 109),
)

build_bundle(
    [PRODUCTS / "track-jacket-black-white.jpg",
     PRODUCTS / "shorts-black.jpg",
     PRODUCTS / "track-pants-mens-black.jpg",
     PRODUCTS / "quarter-zip-black-red.jpg"],
    "bundle-club-uniform.jpg",
    accent=(196, 48, 28),
)

build_bundle(
    [PRODUCTS / "jacket-royal-white.jpg",
     PRODUCTS / "shorts-navy.jpg",
     PRODUCTS / "leggings-long-black.jpg"],
    "bundle-hospitality.jpg",
    accent=(45, 80, 22),
)

# ----- Product-only value packs (workwearhub-style) ----------------------
print("Product-only packs:")

# Twin pack: 2x same item, different colorways
build_bundle(
    [PRODUCTS / "shorts-black.jpg",
     PRODUCTS / "shorts-navy.jpg"],
    "pack-shorts-twin.jpg",
    sizes=(640, 560),
    offsets=[(60, 180), (250, 280)],
    rotations=[-6, 8],
)

# 3-pack tees / quarter-zips
build_bundle(
    [PRODUCTS / "quarter-zip-navy-white.jpg",
     PRODUCTS / "quarter-zip-black-red.jpg",
     PRODUCTS / "quarter-zip-navy-white.jpg"],
    "pack-quarterzip-3.jpg",
    sizes=(540, 540, 540),
    offsets=[(20, 200), (200, 180), (380, 200)],
    rotations=[-10, 0, 10],
)

# 4-pack track pants in different colors
build_bundle(
    [PRODUCTS / "track-pants-navy.jpg",
     PRODUCTS / "track-pants-mens-black.jpg",
     PRODUCTS / "track-pants-womens-black.jpg",
     PRODUCTS / "track-pants-navy.jpg"],
    "pack-trackpants-4.jpg",
    sizes=(500, 500, 500, 500),
    offsets=[(20, 100), (210, 200), (400, 100), (590, 200)],
    rotations=[-12, -4, 4, 12],
)

# Jacket twin pack
build_bundle(
    [PRODUCTS / "jacket-black-red.jpg",
     PRODUCTS / "jacket-navy-white.jpg"],
    "pack-jackets-twin.jpg",
    sizes=(620, 560),
    offsets=[(80, 160), (260, 280)],
    rotations=[-8, 6],
)

print("\nDone.")
