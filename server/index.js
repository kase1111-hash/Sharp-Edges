import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EXPERTISE_LEVELS, ENVIRONMENTS } from '../src/utils/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// ── Configuration ────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2500;
const MAX_TASK_LENGTH = 2000;
const VALID_EXPERTISE = EXPERTISE_LEVELS.map(l => l.value);
const VALID_ENVIRONMENTS = ENVIRONMENTS.map(e => e.value);

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

// ── POST /api/analyze ────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  // Check server-side API key
  if (!ANTHROPIC_API_KEY) {
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

  try {
    const anthropicRes = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(task, expertise, environment) }],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.json().catch(() => ({}));
      const msg = errBody.error?.message || `Upstream API error (${anthropicRes.status})`;

      if (anthropicRes.status === 401) {
        return res.status(502).json({ error: { code: 'AUTH', message: msg } });
      }
      if (anthropicRes.status === 429) {
        return res.status(429).json({ error: { code: 'RATE_LIMIT', message: msg } });
      }
      return res.status(502).json({ error: { code: 'SERVER', message: msg } });
    }

    const data = await anthropicRes.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      return res.status(502).json({
        error: { code: 'PARSE', message: 'Invalid response from upstream API' },
      });
    }

    return res.json({ text });
  } catch (err) {
    return res.status(502).json({
      error: { code: 'NETWORK', message: 'Unable to reach the analysis service' },
    });
  }
});

// ── Serve static build in production ─────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;
