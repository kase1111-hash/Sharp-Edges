import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createApp } from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Environment ──────────────────────────────────────────
// Load .env.local, then .env; variables already set in the environment take precedence
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(join(__dirname, '..', file));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    process.env.VITE_ANTHROPIC_API_KEY
      ? 'Rename VITE_ANTHROPIC_API_KEY to ANTHROPIC_API_KEY: the server reads only the unprefixed name, and VITE_ variables are meant for the browser bundle.'
      : 'ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example) or the environment; analysis requests will fail until then.',
  );
}

const PORT = process.env.PORT || 3001;

createApp().listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
