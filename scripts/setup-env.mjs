#!/usr/bin/env node
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { createInterface } from 'readline';

const ENV_FILE = '.env.local';

if (existsSync(ENV_FILE)) {
  const content = readFileSync(ENV_FILE, 'utf-8');
  if (content.includes('GEMINI_API_KEY=') && !content.includes('GEMINI_API_KEY=your_')) {
    process.exit(0);
  }
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter your GEMINI_API_KEY (or press Enter to skip): ', (key) => {
  rl.close();
  if (key.trim()) {
    writeFileSync(ENV_FILE, `GEMINI_API_KEY=${key.trim()}\n`);
    console.log(`✓ Created ${ENV_FILE}`);
  } else {
    console.log('Skipped. Create .env.local with GEMINI_API_KEY when ready.');
  }
});
