"""Generate bundle/pack thumbnails via OpenAI gpt-image-2.

Reads OPENAI_API_KEY from scripts/.env (gitignored). Writes square PNGs into
images/bundles/ai-*.png. Edit PROMPTS at the bottom and re-run.
"""
from __future__ import annotations
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images" / "bundles"
OUT.mkdir(parents=True, exist_ok=True)

ENV = Path(__file__).with_name(".env")
if ENV.exists():
    for line in ENV.read_text().splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    sys.exit("OPENAI_API_KEY not set (looked in scripts/.env and environment)")

ENDPOINT = "https://api.openai.com/v1/images/generations"


def generate(prompt: str, out_name: str, *, model: str = "gpt-image-1",
             size: str = "1024x1024", quality: str = "high") -> Path:
    body = json.dumps({
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": quality,
        "n": 1,
    }).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} for {out_name}: {e.read().decode('utf-8', 'replace')}")

    b64 = payload["data"][0]["b64_json"]
    out_path = OUT / out_name
    out_path.write_bytes(base64.b64decode(b64))
    dt = time.time() - t0
    print(f"  wrote {out_path.name}  ({out_path.stat().st_size / 1024:.0f} KB, {dt:.1f}s)")
    return out_path


# Style anchor used by all prompts so the whole set looks consistent.
# Disc is always saturated orange (#F58220) — workwearhub-style — for visual
# unity across the value-pack section.
STYLE = (
    "Flat-lay e-commerce product photography for an Australian wholesale "
    "workwear retailer. Clean pure-white background, soft realistic drop "
    "shadows, shot directly from above. Behind the garments is a single "
    "vivid saturated bright orange flat circular disc (color #F58220) as a "
    "graphic accent, fully opaque, taking up about 70% of the image height, "
    "exactly like the workwearhub.com.au value-pack thumbnails. Square 1:1 "
    "composition, no text, no logos visible from manufacturers, no people, "
    "no hands, no mannequins, no models. Product photography only."
)

PROMPTS = [
    # ---------- PACK cards (multi-copy of same garment) ----------------
    # 1. Three identical hi-vis shirts, triangle layout.
    (
        "ai-pack-hivis-3.png",
        f"{STYLE} Three identical orange-and-navy two-tone hi-vis long-sleeve "
        "work shirts with reflective silver tape across the chest and arms, "
        "arranged in a triangle composition (two on top, one centered below), "
        "slightly overlapping.",
    ),
    # 2. Twin pack of cargo shorts.
    (
        "ai-pack-shorts-twin.png",
        f"{STYLE} Two identical pairs of khaki cargo work shorts with "
        "drawstring waist and side pockets, photographed flat from above, "
        "side by side with a slight overlap.",
    ),

    # ---------- BUNDLE cards (safetrex-style front+back print preview) -
    # Each shows ONE garment laid flat front-view next to the same garment
    # back-view, with a sample printed/embroidered logo applied. Customer
    # imagines their own logo in place of the sample.
    # 3. Polo with embroidered chest logo (Corporate Team Pack).
    (
        "ai-bundle-print-polo-fb.png",
        f"{STYLE} Two identical navy-blue corporate polo shirts laid flat "
        "side by side: the LEFT shirt shows the FRONT view with a small "
        "embroidered company logo on the upper left chest (a simple "
        "geometric crest with a generic monogram, full-colour stitching). "
        "The RIGHT shirt shows the BACK view with a larger embroidered "
        "version of the same logo centered between the shoulder blades. "
        "Both shirts are the same product, shown front and back so the "
        "buyer can see where the print will go.",
    ),
    # 4. Hi-vis hoodie front+back with full-colour DTF print (Club/Sports).
    (
        "ai-bundle-print-hoodie-fb.png",
        f"{STYLE} Two identical orange-and-navy hi-vis fleecy zip hoodies "
        "laid flat side by side: the LEFT hoodie shows the FRONT view "
        "with a vivid full-colour DTF screen-printed crest (a simple "
        "shield design with a generic team monogram in bold colours) "
        "across the chest. The RIGHT hoodie shows the BACK view with "
        "the same crest printed much larger, filling the upper back. "
        "Both garments identical, same orientation, shown to demonstrate "
        "front and back print placement.",
    ),
    # 5. Cotton tee front+back with embroidered name + small back logo
    #    (Hospitality / Events Pack).
    (
        "ai-bundle-print-tee-fb.png",
        f"{STYLE} Two identical charcoal-grey cotton t-shirts laid flat "
        "side by side: the LEFT tee shows the FRONT view with a small "
        "embroidered first-name patch on the upper left chest in white "
        "thread on a dark rectangle. The RIGHT tee shows the BACK view "
        "with a small embroidered single-line wordmark across the upper "
        "back. Both tees identical, shown to demonstrate where the "
        "personalisation goes.",
    ),
]


def main():
    force = "--force" in sys.argv
    todo = [(n, p) for (n, p) in PROMPTS if force or not (OUT / n).exists()]
    if not todo:
        print("All images already exist. Re-run with --force to regenerate.")
        return
    print(f"Generating {len(todo)} images...")
    for out_name, prompt in todo:
        print(f"- {out_name}")
        generate(prompt, out_name)
    print("Done.")


if __name__ == "__main__":
    main()
