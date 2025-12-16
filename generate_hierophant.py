#!/usr/bin/env python3
"""Generate The Hierophant tarot card in Rider-Waite Smith style."""

import os
from google import genai
from google.genai import types

# Initialize client
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Detailed prompt for The Hierophant in Rider-Waite Smith style
prompt = """Create a tarot card image of The Hierophant (Major Arcana V) in the authentic Rider-Waite Smith style by Pamela Colman Smith.

The scene depicts:
- A papal figure seated on a throne between two gray stone pillars
- Wearing rich red ceremonial robes with white undergarments
- A golden triple crown (papal tiara) on his head
- His right hand raised in a traditional gesture of blessing (two fingers up, two down)
- His left hand holding an ornate papal cross staff with three horizontal bars
- Two tonsured monks or acolytes kneeling before him in gray robes, one in red, one in white
- Two crossed golden keys at his feet on the ground
- Architectural elements suggesting a church or temple interior

Art style:
- Classic early 1900s illustration style of Pamela Colman Smith
- Rich, saturated medieval colors: deep reds, pure whites, gold accents, gray stone
- Slightly simplified symbolic forms with clear outlines
- Traditional tarot card composition with ornate borders
- Formal, symmetrical composition emphasizing spiritual authority
- Flat color areas with subtle shading
- Portrait orientation typical of tarot cards

The overall feeling should be one of traditional religious authority, spiritual guidance, and sacred ceremony in the distinctive Rider-Waite aesthetic."""

# Generate the image with tarot card proportions (2:3 aspect ratio) and good quality
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=[prompt],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio="2:3",  # Traditional tarot card proportions
            image_size="1K"      # 1K resolution
        ),
    ),
)

# Save the generated image
from PIL import Image as PILImage

output_path = "/Users/adam/code/mscleo/public/decks/rider-waite-smith/major_05.jpg"
for part in response.parts:
    if part.text:
        print(f"Model response: {part.text}")
    elif part.inline_data:
        image = part.as_image()
        image.save(output_path)
        print(f"✓ Generated The Hierophant tarot card: {output_path}")

        # Convert JPEG to PNG for compatibility with the deck config
        png_path = "/Users/adam/code/mscleo/public/decks/rider-waite-smith/major_05.png"
        pil_image = PILImage.open(output_path)
        pil_image.save(png_path, "PNG")
        print(f"✓ Converted to PNG: {png_path}")
