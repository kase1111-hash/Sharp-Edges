/**
 * API Service for Risk Assessment
 * Handles communication with the Anthropic Claude API
 */

import { EXPERTISE_LEVELS, ENVIRONMENTS } from '../utils/constants';

export class ApiError extends Error {
  constructor(message, code, status = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

const API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2500;
const MAX_TASK_LENGTH = 2000;
const VALID_EXPERTISE = EXPERTISE_LEVELS.map(l => l.value);
const VALID_ENVIRONMENTS = ENVIRONMENTS.map(e => e.value);

/**
 * System prompt that instructs Claude to generate JSEA briefs
 */
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

/**
 * Build the user prompt from input parameters
 */
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

/**
 * Parse the API response and extract the assessment JSON
 */
export function parseAssessmentResponse(responseText) {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new ApiError('No valid JSON found in response', 'PARSE');
  }

  let assessment;
  try {
    assessment = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new ApiError(`Failed to parse JSON: ${e.message}`, 'PARSE');
  }

  const requiredFields = [
    'taskSummary',
    'parsedContext',
    'hazards',
    'riskAssessment',
    'controls',
    'emergencyActions',
    'preTaskChecklist',
  ];

  for (const field of requiredFields) {
    if (!(field in assessment)) {
      throw new ApiError(`Missing required field: ${field}`, 'VALIDATION');
    }
  }

  if (
    typeof assessment.riskAssessment.severity !== 'number' ||
    typeof assessment.riskAssessment.likelihood !== 'number' ||
    !assessment.riskAssessment.overallLevel
  ) {
    throw new ApiError('Invalid riskAssessment structure', 'VALIDATION');
  }

  // Ensure arrays have default values
  assessment.parsedContext = {
    actions: assessment.parsedContext?.actions || [],
    materials: assessment.parsedContext?.materials || [],
    tools: assessment.parsedContext?.tools || [],
    environmentFactors: assessment.parsedContext?.environmentFactors || [],
  };

  assessment.controls = {
    elimination: assessment.controls?.elimination || [],
    substitution: assessment.controls?.substitution || [],
    engineering: assessment.controls?.engineering || [],
    administrative: assessment.controls?.administrative || [],
    ppe: assessment.controls?.ppe || [],
  };

  // Ensure optional string fields have defaults
  assessment.ethicalNote = assessment.ethicalNote || '';
  assessment.additionalConsiderations = assessment.additionalConsiderations || '';

  return assessment;
}

/**
 * Call the Anthropic API to analyze a task
 */
export async function analyzeTask(task, expertise, environment, { signal } = {}) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      'API key not configured. Please add VITE_ANTHROPIC_API_KEY to your .env.local file.',
      'NO_API_KEY',
    );
  }

  if (!task || typeof task !== 'string' || task.trim().length === 0) {
    throw new ApiError('Task description is required', 'VALIDATION');
  }
  if (task.length > MAX_TASK_LENGTH) {
    throw new ApiError(`Task description exceeds ${MAX_TASK_LENGTH} characters`, 'VALIDATION');
  }
  if (!VALID_EXPERTISE.includes(expertise)) {
    throw new ApiError(`Invalid expertise level: ${expertise}`, 'VALIDATION');
  }
  if (!VALID_ENVIRONMENTS.includes(environment)) {
    throw new ApiError(`Invalid environment: ${environment}`, 'VALIDATION');
  }

  let response;
  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(task, expertise, environment),
          },
        ],
      }),
      signal,
    });
  } catch (fetchError) {
    if (fetchError.name === 'AbortError') throw fetchError;
    throw new ApiError('Unable to connect to the analysis service', 'NETWORK');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.error?.message || `API request failed with status ${response.status}`;

    if (response.status === 401) throw new ApiError(msg, 'AUTH', 401);
    if (response.status === 429) throw new ApiError(msg, 'RATE_LIMIT', 429);
    if (response.status >= 500) throw new ApiError(msg, 'SERVER', response.status);
    throw new ApiError(msg, 'HTTP', response.status);
  }

  const data = await response.json();

  if (!data.content?.[0]?.text) {
    throw new ApiError('Invalid API response structure', 'PARSE');
  }

  return parseAssessmentResponse(data.content[0].text);
}
