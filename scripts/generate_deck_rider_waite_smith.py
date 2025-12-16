#!/usr/bin/env python3
"""Generate all 78 tarot cards in Rider-Waite Smith style."""

import os
from google import genai
from google.genai import types
from PIL import Image as PILImage

# Initialize client
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Card data structure matching deck.ts
cards = [
    # Major Arcana
    ('major_00', 'The Fool', 'A young traveler stepping off a cliff edge, carefree and optimistic, carrying a small bundle on a stick, white rose in hand, small white dog at heels, mountains and sun in background, wearing colorful patchwork clothing'),
    ('major_01', 'The Magician', 'A robed figure at a table with ritual tools (wand, cup, sword, pentacle), one hand pointing up, one down, infinity symbol above head, red and white robes, garden of roses and lilies'),
    ('major_02', 'The High Priestess', 'Seated woman between two pillars (B and J), wearing blue robes and crescent moon crown, holding Torah scroll labeled TORA, pomegranates on tapestry behind, cross on chest'),
    ('major_03', 'The Empress', 'Regal woman on throne in nature, wearing crown with 12 stars, holding scepter, Venus symbol on heart-shaped shield, wheat field, waterfall, lush forest'),
    ('major_04', 'The Emperor', 'Armored ruler on stone throne decorated with ram heads, holding ankh scepter and orb, red robes, barren mountain background, stern expression, long white beard'),
    ('major_05', 'The Hierophant', 'Religious figure in red and white robes, triple crown, raised hand blessing, papal cross staff, two acolytes kneeling, crossed keys at feet, gray pillars'),
    ('major_06', 'The Lovers', 'Naked man and woman in garden, angel Raphael above with purple wings and sun, tree of knowledge with serpent behind woman, tree of life with 12 flames behind man'),
    ('major_07', 'The Chariot', 'Armored warrior in chariot with canopy of stars, two sphinxes (one black, one white), city background, crescent moon symbols, square on chest'),
    ('major_08', 'Strength', 'Woman in white gown gently closing lion\'s mouth, infinity symbol above head, flower garland, calm expression, mountain background'),
    ('major_09', 'The Hermit', 'Old man in gray robes on mountain peak, holding lantern with six-pointed star, leaning on staff, snow-covered peaks below'),
    ('major_10', 'Wheel of Fortune', 'Large wheel with Hebrew letters, sphinx on top, snake descending left, Anubis ascending right, four winged creatures in corners with books, clouds'),
    ('major_11', 'Justice', 'Seated figure between pillars, holding upright sword and scales, purple robe, red shoes, crown, stern expression'),
    ('major_12', 'The Hanged Man', 'Man suspended upside-down from T-shaped tree, hands behind back, right leg crossed behind left, halo around head, serene expression'),
    ('major_13', 'Death', 'Skeleton in black armor on white horse, holding black flag with white rose, sun rising between towers, fallen figures including king and child, plowed field'),
    ('major_14', 'Temperance', 'Winged angel with sun symbol on forehead, one foot on land, one in water, pouring water between two cups, iris flowers, mountain path to crown'),
    ('major_15', 'The Devil', 'Horned Baphomet figure on black pedestal, inverted pentagram, naked man and woman in chains (loosely worn), torch, bat wings, grapes and fire on tails'),
    ('major_16', 'The Tower', 'Stone tower struck by lightning, crown falling off top, two figures falling headfirst, gray clouds, 22 flames, rocky ground'),
    ('major_17', 'The Star', 'Naked woman kneeling by pool, pouring water from two jugs onto land and into pool, large yellow star and seven smaller white stars, bird in tree, hills'),
    ('major_18', 'The Moon', 'Full moon with face, two towers, dog and wolf howling, crayfish emerging from pool, winding path, moonbeams falling'),
    ('major_19', 'The Sun', 'Large smiling sun face, naked child on white horse, four sunflowers, red banner, garden wall'),
    ('major_20', 'Judgement', 'Angel Gabriel with trumpet and cross banner, naked figures rising from coffins with arms outstretched, mountains, clouds'),
    ('major_21', 'The World', 'Naked dancer in purple cloth wreath, holding two wands, four creatures in corners (angel, eagle, lion, bull), blue background'),

    # Wands
    ('wands_01', 'Ace of Wands', 'Hand emerging from cloud holding wooden wand with leaves sprouting, castle on distant hill, river landscape'),
    ('wands_02', 'Two of Wands', 'Man in red robe holding globe and wand, second wand mounted on wall, castle battlement, sea view, roses and lilies'),
    ('wands_03', 'Three of Wands', 'Figure from behind looking over sea, three wands planted in ground, ships in distance, rocky cliff, merchant watching ventures'),
    ('wands_04', 'Four of Wands', 'Four wands supporting garland canopy, two figures dancing beneath with bouquets, castle in background, celebration'),
    ('wands_05', 'Five of Wands', 'Five youths with wands in mock battle or competitive struggle, each pointing different direction, bright sky'),
    ('wands_06', 'Six of Wands', 'Victorious rider on horse with wand crowned with wreath, five other wands held by people, laurel crown on rider, parade'),
    ('wands_07', 'Seven of Wands', 'Man on higher ground defending position with wand against six other wands from below, determined stance'),
    ('wands_08', 'Eight of Wands', 'Eight wands flying through air diagonally, river landscape below, no human figures, swift motion'),
    ('wands_09', 'Nine of Wands', 'Wounded man leaning on wand, eight other wands standing behind like fence, bandaged head, wary stance'),
    ('wands_10', 'Ten of Wands', 'Man bent over carrying heavy bundle of ten wands toward distant house, burden, nearly at destination'),
    ('wands_11', 'Page of Wands', 'Young person in yellow tunic holding tall wand, examining it, pyramids and desert in background, salamanders on clothing'),
    ('wands_12', 'Knight of Wands', 'Armored rider on rearing horse, holding wand, red plumes on helm, salamander tunic, desert background, action and movement'),
    ('wands_13', 'Queen of Wands', 'Queen on throne decorated with lions and sunflowers, holding wand and sunflower, black cat at feet, desert background'),
    ('wands_14', 'King of Wands', 'King on throne with lions and salamanders, holding wand, orange robe, salamander at feet, castle background'),

    # Cups
    ('cups_01', 'Ace of Cups', 'Hand from cloud holding ornate chalice, dove descending with communion wafer, water overflowing into lily pond, five streams'),
    ('cups_02', 'Two of Cups', 'Man and woman exchanging cups in pledge, caduceus with lion head between them, red and white roses, partnership'),
    ('cups_03', 'Three of Cups', 'Three maidens dancing in circle, raising cups in toast, harvest of fruits and gourds, celebration'),
    ('cups_04', 'Four of Cups', 'Young man sitting under tree with crossed arms, three cups before him, hand from cloud offering fourth cup, apathy'),
    ('cups_05', 'Five of Cups', 'Cloaked figure looking down at three spilled cups, two upright cups behind, bridge and castle in background, mourning'),
    ('cups_06', 'Six of Cups', 'Children in garden, one giving cup with flowers to another, six cups with white flowers, village houses, nostalgia'),
    ('cups_07', 'Seven of Cups', 'Silhouetted figure before seven cups in clouds, each containing different vision (castle, jewels, wreath, dragon, head, shrouded figure, snake), choices'),
    ('cups_08', 'Eight of Cups', 'Figure walking away toward mountains, leaving eight stacked cups, moon above, seeking higher meaning'),
    ('cups_09', 'Nine of Cups', 'Satisfied man sitting with crossed arms, nine cups arranged in arc behind him on blue cloth, wish fulfilled'),
    ('cups_10', 'Ten of Cups', 'Couple with raised arms, two children playing, rainbow with ten cups, cottage, family happiness'),
    ('cups_11', 'Page of Cups', 'Young person in blue tunic holding cup with fish emerging, ocean in background, artistic and dreamy'),
    ('cups_12', 'Knight of Cups', 'Knight on white horse holding cup aloft, winged helmet, river and trees, romantic quest'),
    ('cups_13', 'Queen of Cups', 'Queen on throne at water edge, ornate cup with handles, mermaids and fish on throne, pebble beach, clouds'),
    ('cups_14', 'King of Cups', 'King on throne on turbulent sea, holding cup and scepter, fish amulet, ship in background, emotional control'),

    # Swords
    ('swords_01', 'Ace of Swords', 'Hand from cloud holding upright sword, crown with wreath and palm on point, mountains below, victory through intellect'),
    ('swords_02', 'Two of Swords', 'Blindfolded woman in white holding two crossed swords, sea and rocks behind, crescent moon, difficult choice'),
    ('swords_03', 'Three of Swords', 'Heart pierced by three swords, rain and gray clouds, heartbreak'),
    ('swords_04', 'Four of Swords', 'Knight lying on tomb with hands in prayer, sword beneath, three swords on wall, stained glass window, rest'),
    ('swords_05', 'Five of Swords', 'Man holding three swords with smug expression, two other swords on ground, two defeated figures walking away, cloudy sky, hollow victory'),
    ('swords_06', 'Six of Swords', 'Woman and child in boat with ferryman, six swords upright in boat, calm water ahead, rough water behind, transition'),
    ('swords_07', 'Seven of Swords', 'Man sneaking away from camp carrying five swords, two swords left behind, tents in background, deception'),
    ('swords_08', 'Eight of Swords', 'Blindfolded woman bound and surrounded by eight upright swords, castle and water in distance, restricted'),
    ('swords_09', 'Nine of Swords', 'Person sitting up in bed with head in hands, nine swords on wall behind, quilt with roses and astrological symbols, nightmares'),
    ('swords_10', 'Ten of Swords', 'Figure lying face down with ten swords in back, dark sky clearing to yellow horizon, calm sea, rock bottom'),
    ('swords_11', 'Page of Swords', 'Young person holding upright sword with both hands, walking across rocky ground, clouds and birds, alert stance'),
    ('swords_12', 'Knight of Swords', 'Knight on charging horse, holding sword aloft, windswept trees, birds scattered, rushing attack'),
    ('swords_13', 'Queen of Swords', 'Queen on throne decorated with butterflies and cherub, holding upright sword and extended left hand, clouds, stern expression'),
    ('swords_14', 'King of Swords', 'King on throne with butterflies, holding upright sword, trees bending in wind, intellectual authority'),

    # Pentacles
    ('pentacles_01', 'Ace of Pentacles', 'Hand from cloud holding large golden pentacle, garden path through archway of flowers, mountains beyond'),
    ('pentacles_02', 'Two of Pentacles', 'Juggler dancing while holding two pentacles connected by infinity loop, ships on rough sea, balancing'),
    ('pentacles_03', 'Three of Pentacles', 'Sculptor working on cathedral, monk and architect looking at plans, three pentacles in arch above, craftsmanship'),
    ('pentacles_04', 'Four of Pentacles', 'Figure seated holding one pentacle to chest, one under each foot, one on crown, city background, possessiveness'),
    ('pentacles_05', 'Five of Pentacles', 'Two poor figures walking in snow past church window with five pentacles, crutches, poverty'),
    ('pentacles_06', 'Six of Pentacles', 'Merchant with scales giving coins to beggars, six pentacles, charity and balance'),
    ('pentacles_07', 'Seven of Pentacles', 'Farmer leaning on hoe looking at seven pentacles growing on bush, contemplating harvest, patience'),
    ('pentacles_08', 'Eight of Pentacles', 'Craftsman at bench carving pentacles, six finished pentacles on wall, two on ground, town in distance, dedication to craft'),
    ('pentacles_09', 'Nine of Pentacles', 'Elegant woman in garden with falcon on hand, nine pentacles among grapevines, manor house, prosperity'),
    ('pentacles_10', 'Ten of Pentacles', 'Old man with two dogs, young couple and child under archway, ten pentacles in tree of life pattern, family wealth'),
    ('pentacles_11', 'Page of Pentacles', 'Young person in field holding pentacle aloft with both hands, trees and plowed earth, scholarly study of material'),
    ('pentacles_12', 'Knight of Pentacles', 'Knight on stationary heavy horse, holding pentacle, plowed field, patient and methodical'),
    ('pentacles_13', 'Queen of Pentacles', 'Queen on throne in garden, holding large pentacle, roses blooming, rabbit at feet, goat on throne, nurturing abundance'),
    ('pentacles_14', 'King of Pentacles', 'King on throne decorated with bull heads and grapes, holding pentacle and scepter, castle and vineyard, material mastery'),
]

output_dir = "/Users/adam/code/mscleo/public/decks/rider-waite-smith"

# Track which cards already exist
existing = set()
for file in os.listdir(output_dir):
    if file.endswith('.png'):
        existing.add(file.replace('.png', ''))

print(f"Found {len(existing)} existing cards. Generating {len(cards) - len(existing)} remaining cards...\n")

for card_id, card_name, description in cards:
    if card_id in existing:
        print(f"⊘ Skipping {card_name} (already exists)")
        continue

    print(f"Generating {card_name}...")

    # Build detailed prompt
    prompt = f"""Create a tarot card image of {card_name} in the authentic Rider-Waite Smith style by Pamela Colman Smith.

The scene depicts:
{description}

Art style:
- Classic early 1900s illustration style of Pamela Colman Smith
- Rich, saturated medieval colors with symbolic meaning
- Slightly simplified symbolic forms with clear outlines
- Traditional tarot card composition with ornate decorative borders
- Portrait orientation typical of tarot cards
- Flat color areas with subtle shading
- Traditional tarot border frame

The card title "{card_name.upper()}" should appear at the bottom in a decorative banner."""

    try:
        # Generate the image
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio="2:3",
                    image_size="1K"
                ),
            ),
        )

        # Save as JPEG first, then convert to PNG
        jpg_path = f"{output_dir}/{card_id}.jpg"
        png_path = f"{output_dir}/{card_id}.png"

        for part in response.parts:
            if part.inline_data:
                image = part.as_image()
                image.save(jpg_path)

                # Convert to PNG
                pil_image = PILImage.open(jpg_path)
                pil_image.save(png_path, "PNG")

                # Remove JPEG
                os.remove(jpg_path)

                print(f"✓ Generated {card_name} -> {card_id}.png")
                break

    except Exception as e:
        print(f"✗ Error generating {card_name}: {e}")

print(f"\n✓ Complete! All cards generated in {output_dir}")
