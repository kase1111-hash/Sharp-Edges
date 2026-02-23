/**
 * API Service for Risk Assessment
 * Communicates with the backend proxy — API key never reaches the browser.
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

const PROXY_ENDPOINT = '/api/analyze';
const MAX_TASK_LENGTH = 2000;
const VALID_EXPERTISE = EXPERTISE_LEVELS.map(l => l.value);
const VALID_ENVIRONMENTS = ENVIRONMENTS.map(e => e.value);

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
 * Call the backend proxy to analyze a task.
 * The server holds the API key and system prompt — the client only sends user inputs.
 */
export async function analyzeTask(task, expertise, environment, { signal } = {}) {
  // Client-side validation for immediate UX feedback
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
    response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, expertise, environment }),
      signal,
    });
  } catch (fetchError) {
    if (fetchError.name === 'AbortError') throw fetchError;
    throw new ApiError('Unable to connect to the analysis service', 'NETWORK');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const code = errorData.error?.code || 'HTTP';
    const msg = errorData.error?.message || `API request failed with status ${response.status}`;
    throw new ApiError(msg, code, response.status);
  }

  const data = await response.json();

  if (!data.text) {
    throw new ApiError('Invalid API response structure', 'PARSE');
  }

  return parseAssessmentResponse(data.text);
}
