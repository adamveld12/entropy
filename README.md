# Entropy

A deterministic tarot reading web application that generates personalized readings based on your reflections and intentions.

**Live Site**: [tarot.vdhsn.com](https://tarot.vdhsn.com)

## About

Entropy creates unique tarot readings by using your answers to reflection questions as a seed for deterministic randomness. The same answers will always produce the same reading, allowing you to revisit and share meaningful insights.

**Key Features:**
- **Deterministic Readings**: Your responses generate a reproducible tarot spread
- **AI-Powered Interpretations**: Gemini AI provides contextual readings based on your cards and reflections
- **Rider-Waite Smith Deck**: Full 78-card deck with AI-generated artwork in the classic style
- **Shareable Readings**: Generate unique URLs to share your readings with others

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm

### Development

1. Clone the repository
   ```bash
   git clone https://github.com/adamveld12/entropy.git
   cd entropy
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```

   Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Deployment**: Vercel
- **Language**: TypeScript

## License

MIT
