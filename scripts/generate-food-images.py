#!/usr/bin/env python3
"""Generate editorial watercolor illustrations for Searching for Food guide."""

import os
import sys
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

STYLE = (
    "Warm editorial watercolor illustration with loose, expressive brushstrokes. "
    "Muted earth tones with pops of coral, gold, and teal. "
    "Cream/parchment paper texture background (#f4efe5). "
    "Elegant, hand-painted feel like a high-end food magazine editorial illustration. "
    "No text, no words, no labels. No photorealistic elements."
)

images = [
    {
        "name": "hero-bg",
        "prompt": f"A wide panoramic watercolor illustration of an Indian kitchen scene — brass pots, wooden spoons, scattered spices (turmeric, cumin, chili), a mortar and pestle, and wisps of steam. Viewed from slightly above. Very soft and faded, meant as a subtle background. {STYLE}",
        "aspect": "16:9",
    },
    {
        "name": "biryani",
        "prompt": f"A beautiful watercolor illustration of a steaming pot of Hyderabadi biryani being served. Golden saffron rice, whole spices (cardamom, bay leaf, cinnamon stick), garnished with fried onions and fresh herbs. A hand lifting the lid reveals fragrant steam. {STYLE}",
        "aspect": "16:9",
    },
    {
        "name": "spices",
        "prompt": f"An overhead watercolor illustration of an Indian spice market — small bowls and mounds of colorful ground spices arranged in a row: bright yellow turmeric, deep red chili, green cardamom pods, brown cumin seeds, orange saffron threads. {STYLE}",
        "aspect": "16:9",
    },
    {
        "name": "strip-samosa",
        "prompt": f"A close-up watercolor illustration of golden crispy samosas on a plate with green chutney. Triangular pastry with visible flaky layers, some broken open showing spiced potato filling. {STYLE}",
        "aspect": "4:3",
    },
    {
        "name": "strip-idli",
        "prompt": f"A watercolor illustration of soft white idlis arranged on a banana leaf with small bowls of coconut chutney and sambar. South Indian breakfast scene, steam rising from the fluffy rice cakes. {STYLE}",
        "aspect": "4:3",
    },
    {
        "name": "strip-curry",
        "prompt": f"A watercolor illustration of a rich, deep orange butter chicken curry in a copper karahi/bowl. Cream swirled on top, garnished with fresh cilantro. Naan bread torn on the side. {STYLE}",
        "aspect": "4:3",
    },
    {
        "name": "dosa",
        "prompt": f"A watercolor illustration of a crispy golden dosa being prepared on a large flat griddle (tawa). The dosa is paper-thin and lacy, with a hand spreading batter. Small bowls of accompaniments visible. {STYLE}",
        "aspect": "16:9",
    },
    {
        "name": "sweets",
        "prompt": f"A watercolor illustration of assorted Indian sweets (mithai) — modak, gulab jamun glistening with syrup, orange jalebi coils, colorful barfi squares, and round ladoo dusted with coconut. Arranged on a brass thali. {STYLE}",
        "aspect": "16:9",
    },
    {
        "name": "dal-rice",
        "prompt": f"A watercolor illustration of a simple, humble bowl of dal (yellow lentil soup) with a tadka/tempering of mustard seeds and curry leaves on top, next to a mound of steamed white rice. Everyday Indian comfort food. {STYLE}",
        "aspect": "16:9",
    },
    {
        "name": "thali",
        "prompt": f"A watercolor illustration of a complete Indian thali — a large round steel plate with many small bowls (katoris) containing different dishes: dal, sabzi, raita, pickle, rice, roti, and a sweet. Vibrant and colorful, showing the diversity of an Indian meal. {STYLE}",
        "aspect": "16:9",
    },
]

output_dir = "/Users/Soumyo/soumyopersonalwebsite/public/images/food-guide"

for i, img in enumerate(images):
    name = img["name"]
    filepath = os.path.join(output_dir, f"{name}.jpg")

    if os.path.exists(filepath):
        print(f"[{i+1}/{len(images)}] Skipping {name} (already exists)")
        continue

    print(f"[{i+1}/{len(images)}] Generating {name}...", flush=True)

    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[img["prompt"]],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio=img["aspect"],
                    image_size="2K",
                ),
            ),
        )

        saved = False
        for part in response.parts:
            if part.inline_data:
                image = part.as_image()
                image.save(filepath)
                print(f"  -> Saved {filepath}")
                saved = True
                break

        if not saved:
            print(f"  -> WARNING: No image returned for {name}")
            for part in response.parts:
                if part.text:
                    print(f"     Text: {part.text[:200]}")

    except Exception as e:
        print(f"  -> ERROR: {e}")

print("\nDone!")
