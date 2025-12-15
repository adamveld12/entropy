Here is the comprehensive, finalized Product Requirement Document (PRD). It is formatted for direct hand-off to a developer.

-----

# Product Requirement Document: "Entropy" AI Tarot Reader

**Version:** 1.0
**Status:** Ready for Development

## 1\. Executive Summary

We are building a web-based Tarot application that mimics the "energy transfer" of a physical reading. Unlike standard RNG tarot apps, this system uses a **Cold Reading Entropy** mechanism. The user’s answers to abstract, AI-generated questions are used to mathematically seed the random number generator, ensuring the user's subconscious input directly influences the cards drawn.

**Key Technical Pillars:**

1.  **LLM-Driven Cold Reading:** Dynamic generation of probing questions using Google Gemini.
2.  **Entropy Seeding:** User inputs convert to cryptographic hashes to drive the card shuffle.
3.  **Multi-Deck Architecture:** Backend designed to support various deck themes (MVP launches with Standard Tarot).
4.  **Provider-Agnostic AI:** Built on Google Gemini, but abstracted via an Adapter Pattern to allow easy swapping of LLM backends.

-----

## 2\. User Experience Flow

1.  **Setup Phase:**

      * User lands on the page.
      * User inputs an **Intention** (e.g., "What should I focus on next month?").
      * User selects **Card Count** (Min: 3).
      * User defines **Position Meanings** for each card (e.g., "1: My Head", "2: My Heart", "3: My Hands"). *Defaults provided if skipped.*
      * User clicks "Begin Reading."

2.  **The Cold Read (Entropy Generation):**

      * The system uses AI to generate 3 abstract/mystical questions based on the Intention.
      * *Example Question:* "If your current challenge was a color, what shade would it be and why?"
      * User types answers to these questions.

3.  **The Draw:**

      * User submits answers.
      * System creates a hash from the text of the answers.
      * Cards are drawn and revealed (Upright or Reversed) based on that hash.

4.  **The Interpretation:**

      * The system displays the cards.
      * The system streams an AI-generated reading connecting the cards, the intention, and the cold-read context.

-----

## 3\. Functional Requirements

### 3.1 Input & Configuration

  * **Intention Input:** Text area (Required).
  * **Card Count:** Number selector (Min: 3, Max: 10).
  * **Dynamic Position Labels:**
      * If user selects 5 cards, UI must render 5 input fields for "Position Meaning."
      * *Placeholder logic:* "Card {N} Meaning".

### 3.2 Dynamic Question Engine (AI Step 1)

  * **Category Bank:** The system must utilize a hardcoded list of categories (Sensory, Nostalgia, Abstract, Nature, Psychology).
  * **Selection:** Randomly select 3 categories from the bank.
  * **Generation Prompt:**
      * Input: User Intention + Selected Categories.
      * Output: 3 short, abstract, open-ended questions.
  * **UI:** Display questions one by one or in a form group.

### 3.3 Entropy & Seeding Logic (Critical)

This is the core differentiator. The card draw must **not** be purely random; it must be deterministic based on user input.

1.  **Concatenation:** Join all user answer strings into one block: `raw_string`.
2.  **Hashing:** Apply SHA-256 (or similar) to `raw_string` to generate a hex string.
3.  **Integer Conversion:** Convert a portion of the hex string into a numeric Integer.
4.  **RNG Seeding:** Initialize a pseudo-random number generator (e.g., `seedrandom` library) using this Integer.
5.  **Deck Shuffle:** Use the seeded RNG to shuffle the deck array.

### 3.4 Card Engine & Multi-Deck Support

  * **Deck Registry:** The app must load deck data from a configuration object, not hardcoded into the component.
  * **MVP Deck:** Standard Rider-Waite Smith.
  * **Reversals:** For each drawn card, call the seeded RNG again.
      * `if (rng() > 0.5) return "Reversed"`
  * **Asset Management:** Images should be referenced by relative paths (e.g., `/assets/decks/standard/wands_01.jpg`).

### 3.5 Final Interpretation (AI Step 2)

  * **Context Assembly:** The payload sent to the LLM must include:
      * The Intention.
      * The User's Cold Read Answers (Context).
      * The Drawn Cards (Name + Orientation).
      * The Position Meaning for each card.
      * The Deck's "Theme" (e.g., "Classic Medieval Symbology").

-----

## 4\. Technical Architecture

### 4.1 Tech Stack

  * **Framework:** Next.js (React) - Recommended for server-side API route handling.
  * **Styling:** Tailwind CSS.
  * **State Management:** React Context or Zustand (to manage the wizard steps).
  * **Utility:** `seedrandom` (NPM package) for seeded shuffling.
  * **LLM SDK:** Google AI JavaScript SDK (`@google/generative-ai`).

### 4.2 LLM Adapter Pattern

To ensure the app is "LLM Agnostic" while using Gemini as the default, the developer must implement an Interface-based architecture.

**The Interface:**

```typescript
interface LLMService {
  /**
   * Generates cold read questions based on intention and random categories.
   */
  generateQuestions(intention: string, categories: string[]): Promise<string[]>;

  /**
   * Generates the final tarot reading.
   */
  interpretSpread(context: ReadingContext): Promise<string>;
}
```

**The Implementation (`GeminiService.ts`):**

  * This class implements `LLMService`.
  * It initializes the `GoogleGenerativeAI` client using an API Key from environment variables.
  * It uses `gemini-1.5-flash` (recommended for speed) or `gemini-1.5-pro`.

**Configuration:**

  * `process.env.LLM_PROVIDER`: Set to `"GEMINI"`.
  * `process.env.GEMINI_API_KEY`: The actual key.

-----

## 5\. Data Models

### 5.1 Deck Configuration

The developer must create a `decks.ts` file exporting a registry of decks.

```typescript
type Card = {
  id: string;          // e.g., 'major_00'
  name: string;        // e.g., 'The Fool'
  image: string;       // path to asset
};

type Deck = {
  id: string;
  name: string;        // Display name
  description: string;
  themePrompt: string; // Instructions for the LLM on how to interpret this specific deck style
  backImage: string;   // Image for the back of the cards
  cards: Card[];       // Array of 78 cards
};
```

### 5.2 Category Bank (Static Data)

```json
[
  "Sensory (Smell, Sound, Texture)",
  "Nostalgia (Childhood, Memory, History)",
  "Abstract (Color, Geometry, Numbers)",
  "Environment (Weather, Lighting, Atmosphere)",
  "Psychological (Dreams, Fears, Hopes)"
]
```

-----

## 6\. Implementation Steps for Developer

1.  **Scaffold:** Set up Next.js + Tailwind.
2.  **Core:** Implement the `LLMService` interface and the `GeminiService` class.
3.  **Data:** Create the `decks.ts` file with the standard Tarot 78-card JSON structure.
4.  **Logic:** Build the `useEntropy` hook:
      * Takes user strings -\> returns RNG function.
5.  **UI:** Build the multi-step form wizard.
6.  **Integration:** Connect the `GeminiService` to the UI steps.