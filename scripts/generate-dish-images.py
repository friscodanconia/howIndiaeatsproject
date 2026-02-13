#!/usr/bin/env python3
"""
Generate watercolor-style dish illustrations using Gemini API (google-genai).
Saves square JPG images to public/images/food-guide/dishes/

Usage: python3 scripts/generate-dish-images.py
"""

import os
import time
from io import BytesIO
from google import genai
from google.genai import types
from PIL import Image as PILImage

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'food-guide', 'dishes')

# Dishes to generate — dish_id: description for the prompt
DISHES = {
    'biryani': 'Hyderabadi biryani, fragrant rice with saffron and meat, served in a copper handi pot',
    'butter-chicken': 'butter chicken (murgh makhani), rich orange-red tomato cream curry with tender chicken pieces',
    'dosa': 'crispy golden South Indian dosa, thin fermented crepe with coconut chutney and sambar',
    'paneer-tikka': 'paneer tikka, charred cubes of Indian cottage cheese with colorful bell peppers on skewers',
    'samosa': 'golden fried samosa, triangular pastry with crispy edges, with green chutney',
    'chole-bhature': 'chole bhature, fluffy fried bread with spicy chickpea curry',
    'dal-makhani': 'dal makhani, creamy black lentil curry with butter swirl on top',
    'idli': 'soft white South Indian idli, steamed rice cakes with coconut chutney',
    'pav-bhaji': 'pav bhaji, buttery bread rolls with spiced mashed vegetable curry, garnished with onion and lime',
    'tandoori-chicken': 'tandoori chicken, bright red-orange whole chicken leg with charred marks',
    'gulab-jamun': 'gulab jamun, golden-brown deep-fried milk dumplings in rose-scented sugar syrup',
    'vada-pav': 'vada pav, Mumbai street food, fried potato fritter in a soft bun with green chutney',
    'momos': 'Tibetan momos, steamed dumplings with pleated tops, arranged in a bamboo steamer',
    'poha': 'poha, flattened rice flakes with peanuts, turmeric, curry leaves and lime',
    'rogan-josh': 'Kashmiri rogan josh, deep red lamb curry with whole spices in a brass bowl',
    'fish-curry': 'Kerala fish curry, golden turmeric coconut curry with fish in a clay pot',
    'masala-chai': 'masala chai, steaming cup of spiced Indian milk tea with cinnamon and cardamom',
    'dhokla': 'Gujarati dhokla, soft yellow steamed gram flour cake with mustard seed tempering',
    'dal-bati': 'Rajasthani dal bati, golden baked wheat balls with lentil curry and ghee',
    'litti-chokha': 'Bihari litti chokha, baked wheat balls with mashed eggplant and tomato',
    'vindaloo': 'Goan vindaloo, dark red spicy pork curry with potatoes',
    'rasgulla': 'rasgulla, white spongy cheese balls floating in light sugar syrup',
    'pani-puri': 'pani puri, tiny crispy hollow puris filled with spiced mint water and chickpeas',
    'khichdi': 'khichdi, comforting yellow rice and lentil porridge with ghee on top',
    'dal-rice': 'dal rice, simple yellow lentil curry poured over steamed white rice',
    'roti': 'fresh roti, round golden-brown Indian flatbread puffed on a flame',
}


def generate_image(client, dish_id, description):
    """Generate a watercolor illustration using Gemini's image generation."""
    out_path = os.path.join(OUT_DIR, f'{dish_id}.jpg')

    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        print(f"  SKIP {dish_id} (already exists)")
        return True

    prompt = (
        f"Generate a beautiful watercolor illustration of {description}. "
        "Style: loose, artistic watercolor painting with soft edges and gentle color bleeding. "
        "Warm cream/off-white background (#f4efe5). Square composition, centered subject. "
        "Editorial cookbook illustration style. No text, no labels, no borders. "
        "Soft natural lighting, appetizing and elegant."
    )

    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
            ),
        )

        for part in response.parts:
            if part.inline_data:
                raw = part.inline_data.data
                img = PILImage.open(BytesIO(raw))
                img = img.resize((400, 400), PILImage.LANCZOS)
                img.save(out_path, 'JPEG', quality=85)
                print(f"  OK {dish_id} ({os.path.getsize(out_path)} bytes)")
                return True

        print(f"  WARN {dish_id}: No image in response")
        for part in response.parts:
            if part.text:
                print(f"    Text: {part.text[:100]}")

        return False

    except Exception as e:
        print(f"  ERROR {dish_id}: {e}")
        return False


def main():
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY not set")
        return

    os.makedirs(OUT_DIR, exist_ok=True)

    client = genai.Client(api_key=GEMINI_API_KEY)

    print(f"=== Generating {len(DISHES)} dish illustrations ===\n")
    print(f"Output: {OUT_DIR}\n")

    success = 0
    for dish_id, description in DISHES.items():
        print(f"Generating: {dish_id}")
        ok = generate_image(client, dish_id, description)

        if ok:
            success += 1

        time.sleep(8)  # Rate limiting

    print(f"\n=== Done: {success}/{len(DISHES)} images generated ===")


if __name__ == '__main__':
    main()
