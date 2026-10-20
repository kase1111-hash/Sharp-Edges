import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EXPERTISE_LEVELS, ENVIRONMENTS } from '../src/utils/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Configuration ────────────────────────────────────────
// claude-sonnet-4-20250514 was retired on 2026-06-15; this is its official replacement
const MODEL = 'claude-sonnet-5-5';
// Thinking counts toward max_tokens, so leave room beyond the ~2-3K token JSON brief
const MAX_TOKENS = 16000;
// Structured content generation: low effort keeps latency close to the original no-thinking setup
const EFFORT = 'low';
// Opts in to re-running a request the model's safety classifiers decline on a fallback model
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
const MAX_TASK_LENGTH = 2000;
const VALID_EXPERTISE = EXPERTISE_LEVELS.map(l => l.value);
const VALID_ENVIRONMENTS = ENVIRONMENTS.map(e => e.value);
// Per-client token bucket: bursts of up to 3 requests, refilling at 10 per minute
const RATE_LIMIT_BURST = 3;
const RATE_LIMIT_PER_MINUTE = 10;

// ── System prompt (server-side only) ─────────────────────
const SYSTEM_PROMPT = `You are a professional safety analyst specializing in Job Safety & Environmental Analysis (JSEA). Your role is to analyze tasks described by users and generate comprehensive safety assessments.

When analyzing a task, consider:
1. The user's stated expertise level (novice, general, experienced, professional)
2. The environment where the task will be performed
3. All potential hazards across categories: thermal, chemical, mechanical, electrical, biological, ergonomic, environmental, psychological
4. Realistic risks, not edge cases or extremely unlikely scenarios
5. Practical, actionable controls following the hierarchy of controls

You must respond with a valid JSON object (no markdown, no explanation, just the JSON) with this exact structure:

{
  "taskSummary": "1-2 sentence summary of the task as understood",
  "parsedContext": {
    "actions": ["array of action verbs identified"],
    "materials": ["materials/substances involved"],
    "tools": ["tools or equipment needed"],
    "environmentFactors": ["relevant environmental considerations"]
  },
  "hazards": [
    {
      "category": "one of: thermal, chemical, mechanical, electrical, biological, ergonomic, environmental, psychological",
      "description": "specific hazard description",
      "mechanism": "how injury/damage could occur"
    }
  ],
  "riskAssessment": {
    "severity": 1-5,
    "likelihood": 1-5,
    "overallLevel": "low, moderate, high, or critical",
    "rationale": "explanation of the risk rating"
  },
  "controls": {
    "elimination": ["ways to remove hazard entirely"],
    "substitution": ["safer alternatives"],
    "engineering": ["physical barriers, ventilation, equipment modifications"],
    "administrative": ["procedures, training, timing"],
    "ppe": ["personal protective equipment needed"]
  },
  "emergencyActions": ["emergency response steps if something goes wrong"],
  "preTaskChecklist": ["items to verify before starting"],
  "ethicalNote": "any ethical or responsibility considerations",
  "additionalConsiderations": "common mistakes, overlooked items, or helpful tips"
}

Severity Scale (1-5):
1 = Negligible: Minor discomfort, no treatment needed
2 = Minor: First aid treatment required
3 = Moderate: Medical treatment required
4 = Major: Serious injury, hospitalization
5 = Catastrophic: Fatality or permanent disability

Likelihood Scale (1-5):
1 = Rare: Highly unlikely to occur
2 = Unlikely: Could occur but not expected
3 = Possible: May occur occasionally
4 = Likely: Will probably occur
5 = Almost Certain: Expected to occur

Risk Level Thresholds:
- Score 1-4: Low
- Score 5-9: Moderate
- Score 10-16: High
- Score 17-25: Critical

Be practical and helpful, not alarmist. Focus on the most significant hazards and provide actionable guidance. Adjust recommendations based on the user's expertise level - novices need more detailed guidance, professionals need reminders of best practices.`;

function buildUserPrompt(task, expertise, environment) {
  return `Please analyze the following task and provide a safety assessment:

Task Description: ${task}

User Expertise Level: ${expertise}
- novice: First time doing this task
- general: Some basic experience
- experienced: Done this many times
- professional: Trained/certified in this area

Environment: ${environment}

Provide your response as a JSON object only.`;
}

// ── Rate limiting ────────────────────────────────────────
// Every analysis spends API credit, so cap how fast any one client can request them
function createRateLimiter({ burst, perMinute }) {
  const refillPerMs = perMinute / 60_000;
  const buckets = new Map();

  // Forget clients whose bucket has fully refilled so the map stays bounded
  setInterval(() => {
    const now = Date.now();
    for (const [ip, bucket] of buckets) {
      if (bucket.tokens + (now - bucket.updatedAt) * refillPerMs >= burst) buckets.delete(ip);
    }
  }, 60_000).unref();

  return (req, res, next) => {
    const now = Date.now();
    const bucket = buckets.get(req.ip) ?? { tokens: burst, updatedAt: now };
    bucket.tokens = Math.min(burst, bucket.tokens + (now - bucket.updatedAt) * refillPerMs);
    bucket.updatedAt = now;
    buckets.set(req.ip, bucket);

    if (bucket.tokens < 1) {
      res.set('Retry-After', String(Math.ceil((1 - bucket.tokens) / refillPerMs / 1000)));
      return res.status(429).json({
        error: { code: 'RATE_LIMIT', message: 'Too many requests' },
      });
    }

    bucket.tokens -= 1;
    next();
  };
}

/**
 * Build the Express app. Options default to the environment; tests inject a
 * preconfigured Anthropic client instead.
 */
export function createApp({
  apiKey = process.env.ANTHROPIC_API_KEY,
  client = apiKey ? new Anthropic({ apiKey }) : null,
  trustProxy = process.env.TRUST_PROXY,
} = {}) {
  const app = express();
  // Behind a reverse proxy, TRUST_PROXY (number of hops) makes req.ip the real client address
  app.set('trust proxy', Number(trustProxy) || false);
  app.use(express.json());

  const rateLimit = createRateLimiter({ burst: RATE_LIMIT_BURST, perMinute: RATE_LIMIT_PER_MINUTE });

  // ── POST /api/analyze ────────────────────────────────────
  app.post('/api/analyze', rateLimit, async (req, res) => {
    // Check server-side API key
    if (!client) {
      return res.status(500).json({
        error: { code: 'NO_API_KEY', message: 'API key not configured on the server.' },
      });
    }

    const { task, expertise, environment } = req.body;

    // Validate inputs server-side
    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION', message: 'Task description is required' },
      });
    }
    if (task.length > MAX_TASK_LENGTH) {
      return res.status(400).json({
        error: { code: 'VALIDATION', message: `Task description exceeds ${MAX_TASK_LENGTH} characters` },
      });
    }
    if (!VALID_EXPERTISE.includes(expertise)) {
      return res.status(400).json({
        error: { code: 'VALIDATION', message: `Invalid expertise level: ${expertise}` },
      });
    }
    if (!VALID_ENVIRONMENTS.includes(environment)) {
      return res.status(400).json({
        error: { code: 'VALIDATION', message: `Invalid environment: ${environment}` },
      });
    }

    let message;
    try {
      message = await client.beta.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        output_config: { effort: EFFORT },
        betas: [FALLBACK_BETA],
        fallbacks: 'default',
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(task, expertise, environment) }],
      });
    } catch (err) {
      // Operators get the upstream detail in the log; clients only get the category
      console.error('[api] Claude request failed:', err.message, err.cause?.message ?? '');

      if (err instanceof Anthropic.AuthenticationError) {
        return res.status(502).json({
          error: { code: 'AUTH', message: 'The server could not authenticate with the analysis service' },
        });
      }
      if (err instanceof Anthropic.RateLimitError) {
        return res.status(429).json({
          error: { code: 'RATE_LIMIT', message: 'The analysis service is rate limited' },
        });
      }
      // APIConnectionError extends APIError, so it has to be matched before the generic case
      if (err instanceof Anthropic.APIConnectionError) {
        return res.status(502).json({
          error: { code: 'NETWORK', message: 'Unable to reach the analysis service' },
        });
      }
      return res.status(502).json({
        error: { code: 'SERVER', message: 'The analysis service returned an error' },
      });
    }

    // A refusal can come back with empty or partial content, so check stop_reason first
    if (message.stop_reason === 'refusal') {
      console.warn('[api] Claude declined the request:', message.stop_details?.category ?? 'no category');
      return res.status(502).json({
        error: { code: 'REFUSED', message: 'The analysis service declined this request' },
      });
    }
    if (message.stop_reason === 'max_tokens' || message.stop_reason === 'model_context_window_exceeded') {
      console.warn('[api] Claude response was cut off:', message.stop_reason);
      return res.status(502).json({
        error: { code: 'INCOMPLETE', message: 'The analysis was cut off before it finished' },
      });
    }

    // The response can open with thinking blocks, so find the text block by type, not position
    const text = message.content?.find(block => block.type === 'text')?.text;

    if (!text) {
      return res.status(502).json({
        error: { code: 'PARSE', message: 'Invalid response from upstream API' },
      });
    }

    return res.json({ text });
  });

  // ── Serve static build in production ─────────────────────
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, '..', 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
    });
  }

  return app;
}
