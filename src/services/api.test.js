import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseAssessmentResponse, analyzeTask, ApiError } from './api';
import { MOCK_ASSESSMENT } from '../utils/mockData';

// Minimal valid assessment JSON for building test responses
const VALID_JSON = JSON.stringify(MOCK_ASSESSMENT);

/** Simulate a successful proxy response: { text } */
function makeProxyResponse(text) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ text }),
  };
}

/** Simulate an error response from the proxy: { error: { code, message } } */
function makeErrorResponse(status, body = {}) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve(body),
  };
}

// ───────────────────────────────────────────────
// parseAssessmentResponse
// ───────────────────────────────────────────────
describe('parseAssessmentResponse', () => {
  it('parses a valid complete JSON response', () => {
    const result = parseAssessmentResponse(VALID_JSON);
    expect(result.taskSummary).toBe(MOCK_ASSESSMENT.taskSummary);
    expect(result.riskAssessment.severity).toBe(4);
    expect(result.hazards).toHaveLength(5);
  });

  it('extracts JSON when surrounded by extra text', () => {
    const wrapped = `Here is the assessment:\n${VALID_JSON}\nEnd of response.`;
    const result = parseAssessmentResponse(wrapped);
    expect(result.taskSummary).toBe(MOCK_ASSESSMENT.taskSummary);
  });

  it('throws PARSE for response with no JSON', () => {
    expect(() => parseAssessmentResponse('no json here'))
      .toThrow(ApiError);
    try {
      parseAssessmentResponse('no json here');
    } catch (e) {
      expect(e.code).toBe('PARSE');
    }
  });

  it('throws PARSE for malformed JSON', () => {
    expect(() => parseAssessmentResponse('{invalid json}'))
      .toThrow(ApiError);
    try {
      parseAssessmentResponse('{invalid json}');
    } catch (e) {
      expect(e.code).toBe('PARSE');
      expect(e.message).toMatch(/Failed to parse JSON/);
    }
  });

  it('throws VALIDATION for missing taskSummary', () => {
    const incomplete = { ...MOCK_ASSESSMENT };
    delete incomplete.taskSummary;
    try {
      parseAssessmentResponse(JSON.stringify(incomplete));
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.code).toBe('VALIDATION');
      expect(e.message).toMatch(/taskSummary/);
    }
  });

  it('throws VALIDATION for missing hazards', () => {
    const incomplete = { ...MOCK_ASSESSMENT };
    delete incomplete.hazards;
    try {
      parseAssessmentResponse(JSON.stringify(incomplete));
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
      expect(e.message).toMatch(/hazards/);
    }
  });

  it('throws VALIDATION for missing riskAssessment', () => {
    const incomplete = { ...MOCK_ASSESSMENT };
    delete incomplete.riskAssessment;
    try {
      parseAssessmentResponse(JSON.stringify(incomplete));
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
      expect(e.message).toMatch(/riskAssessment/);
    }
  });

  it('throws VALIDATION when severity is not a number', () => {
    const bad = {
      ...MOCK_ASSESSMENT,
      riskAssessment: { ...MOCK_ASSESSMENT.riskAssessment, severity: 'high' },
    };
    try {
      parseAssessmentResponse(JSON.stringify(bad));
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
      expect(e.message).toMatch(/Invalid riskAssessment/);
    }
  });

  it('throws VALIDATION when likelihood is not a number', () => {
    const bad = {
      ...MOCK_ASSESSMENT,
      riskAssessment: { ...MOCK_ASSESSMENT.riskAssessment, likelihood: null },
    };
    try {
      parseAssessmentResponse(JSON.stringify(bad));
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
    }
  });

  it('throws VALIDATION when overallLevel is missing', () => {
    const bad = {
      ...MOCK_ASSESSMENT,
      riskAssessment: { severity: 3, likelihood: 3 },
    };
    try {
      parseAssessmentResponse(JSON.stringify(bad));
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
    }
  });

  it('defaults empty arrays in parsedContext', () => {
    const minimal = {
      ...MOCK_ASSESSMENT,
      parsedContext: {},
    };
    const result = parseAssessmentResponse(JSON.stringify(minimal));
    expect(result.parsedContext.actions).toEqual([]);
    expect(result.parsedContext.materials).toEqual([]);
    expect(result.parsedContext.tools).toEqual([]);
    expect(result.parsedContext.environmentFactors).toEqual([]);
  });

  it('defaults empty arrays in controls', () => {
    const minimal = {
      ...MOCK_ASSESSMENT,
      controls: {},
    };
    const result = parseAssessmentResponse(JSON.stringify(minimal));
    expect(result.controls.elimination).toEqual([]);
    expect(result.controls.substitution).toEqual([]);
    expect(result.controls.engineering).toEqual([]);
    expect(result.controls.administrative).toEqual([]);
    expect(result.controls.ppe).toEqual([]);
  });

  it('defaults empty strings for optional fields', () => {
    const noOptionals = { ...MOCK_ASSESSMENT };
    delete noOptionals.ethicalNote;
    delete noOptionals.additionalConsiderations;
    const result = parseAssessmentResponse(JSON.stringify(noOptionals));
    expect(result.ethicalNote).toBe('');
    expect(result.additionalConsiderations).toBe('');
  });

  it('preserves all fields when response is complete', () => {
    const result = parseAssessmentResponse(VALID_JSON);
    expect(result.ethicalNote).toBe(MOCK_ASSESSMENT.ethicalNote);
    expect(result.additionalConsiderations).toBe(MOCK_ASSESSMENT.additionalConsiderations);
    expect(result.preTaskChecklist).toEqual(MOCK_ASSESSMENT.preTaskChecklist);
    expect(result.emergencyActions).toEqual(MOCK_ASSESSMENT.emergencyActions);
  });
});

// ───────────────────────────────────────────────
// analyzeTask (calls backend proxy, NOT Anthropic)
// ───────────────────────────────────────────────
describe('analyzeTask', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // ── Client-side validation (no fetch needed) ──

  it('throws VALIDATION for empty task', async () => {
    try {
      await analyzeTask('', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
    }
  });

  it('throws VALIDATION for whitespace-only task', async () => {
    try {
      await analyzeTask('   ', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
    }
  });

  it('throws VALIDATION for task exceeding 2000 chars', async () => {
    const longTask = 'a'.repeat(2001);
    try {
      await analyzeTask(longTask, 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
      expect(e.message).toMatch(/2000/);
    }
  });

  it('throws VALIDATION for invalid expertise level', async () => {
    try {
      await analyzeTask('test task', 'wizard', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
      expect(e.message).toMatch(/expertise/);
    }
  });

  it('throws VALIDATION for invalid environment', async () => {
    try {
      await analyzeTask('test task', 'general', 'mars');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('VALIDATION');
      expect(e.message).toMatch(/environment/);
    }
  });

  // ── Proxy error responses ──

  it('maps error code from proxy error body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      makeErrorResponse(502, { error: { code: 'AUTH', message: 'invalid key' } }),
    );
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.code).toBe('AUTH');
      expect(e.status).toBe(502);
    }
  });

  it('maps RATE_LIMIT from proxy 429', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      makeErrorResponse(429, { error: { code: 'RATE_LIMIT', message: 'rate limited' } }),
    );
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('RATE_LIMIT');
      expect(e.status).toBe(429);
    }
  });

  it('maps NO_API_KEY from proxy 500', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      makeErrorResponse(500, { error: { code: 'NO_API_KEY', message: 'API key not configured' } }),
    );
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('NO_API_KEY');
      expect(e.status).toBe(500);
    }
  });

  it('maps SERVER from proxy 502', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      makeErrorResponse(502, { error: { code: 'SERVER', message: 'upstream error' } }),
    );
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('SERVER');
      expect(e.status).toBe(502);
    }
  });

  it('falls back to HTTP code when error body has no code', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      makeErrorResponse(403, { error: { message: 'forbidden' } }),
    );
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('HTTP');
      expect(e.status).toBe(403);
    }
  });

  it('handles error response with no parseable JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    });
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.code).toBe('HTTP');
      expect(e.status).toBe(500);
    }
  });

  // ── Network errors ──

  it('throws NETWORK when fetch rejects', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.code).toBe('NETWORK');
    }
  });

  it('rethrows AbortError without wrapping', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    globalThis.fetch = vi.fn().mockRejectedValue(abortError);
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.name).toBe('AbortError');
      expect(e).not.toBeInstanceOf(ApiError);
    }
  });

  // ── Response parsing ──

  it('throws PARSE when proxy returns no text field', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    try {
      await analyzeTask('test task', 'general', 'home');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.code).toBe('PARSE');
    }
  });

  // ── Success path ──

  it('returns parsed assessment on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(makeProxyResponse(VALID_JSON));
    const result = await analyzeTask('test task', 'general', 'home');
    expect(result.taskSummary).toBe(MOCK_ASSESSMENT.taskSummary);
    expect(result.riskAssessment.severity).toBe(4);
  });

  it('passes signal to fetch', async () => {
    const controller = new AbortController();
    globalThis.fetch = vi.fn().mockResolvedValue(makeProxyResponse(VALID_JSON));
    await analyzeTask('test task', 'general', 'home', { signal: controller.signal });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const fetchCall = globalThis.fetch.mock.calls[0];
    expect(fetchCall[1].signal).toBe(controller.signal);
  });

  it('sends only task, expertise, environment in request body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(makeProxyResponse(VALID_JSON));
    await analyzeTask('cut tree', 'novice', 'outdoor');
    const [url, opts] = globalThis.fetch.mock.calls[0];
    expect(url).toBe('/api/analyze');
    const body = JSON.parse(opts.body);
    expect(body).toEqual({ task: 'cut tree', expertise: 'novice', environment: 'outdoor' });
  });

  it('does not send API key or Anthropic headers', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(makeProxyResponse(VALID_JSON));
    await analyzeTask('test task', 'general', 'home');
    const [, opts] = globalThis.fetch.mock.calls[0];
    expect(opts.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(opts.headers['x-api-key']).toBeUndefined();
    expect(opts.headers['anthropic-version']).toBeUndefined();
  });
});

// ───────────────────────────────────────────────
// ApiError class
// ───────────────────────────────────────────────
describe('ApiError', () => {
  it('is an instance of Error', () => {
    const err = new ApiError('msg', 'PARSE');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('carries code and status properties', () => {
    const err = new ApiError('forbidden', 'AUTH', 401);
    expect(err.message).toBe('forbidden');
    expect(err.code).toBe('AUTH');
    expect(err.status).toBe(401);
    expect(err.name).toBe('ApiError');
  });

  it('defaults status to null', () => {
    const err = new ApiError('msg', 'PARSE');
    expect(err.status).toBeNull();
  });
});
