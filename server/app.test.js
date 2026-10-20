// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import { createApp } from './app.js';

const VALID_BODY = { task: 'Cut down a dead tree with a chainsaw', expertise: 'novice', environment: 'outdoor' };
const ASSESSMENT_TEXT = '{"taskSummary":"Felling a dead tree"}';

/** A Messages API response as the Anthropic API sends it */
function upstreamMessage({ content = [{ type: 'text', text: ASSESSMENT_TEXT }], stop_reason = 'end_turn', stop_details = null } = {}) {
  return new Response(
    JSON.stringify({
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: 'claude-sonnet-5-5',
      content,
      stop_reason,
      stop_details,
      usage: { input_tokens: 1000, output_tokens: 1500 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

/** An error response as the Anthropic API sends it */
function upstreamError(status, type, message) {
  return new Response(JSON.stringify({ type: 'error', error: { type, message } }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

let server;
let upstream; // stands in for fetch() calls to the Anthropic API

/** An Anthropic client that sends its HTTP requests to `upstream`, without retries */
function testClient() {
  return new Anthropic({ apiKey: 'test-key', maxRetries: 0, fetch: upstream });
}

async function listen(app) {
  server = await new Promise(resolve => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  return `http://127.0.0.1:${server.address().port}`;
}

async function analyze(baseUrl, body = VALID_BODY, headers = {}) {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return { status: res.status, headers: res.headers, body: await res.json() };
}

beforeEach(() => {
  upstream = vi.fn(async () => upstreamMessage());
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  if (server) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    server = undefined;
  }
});

// ───────────────────────────────────────────────
// POST /api/analyze
// ───────────────────────────────────────────────
describe('POST /api/analyze', () => {
  it('returns the model text for a valid request', async () => {
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ text: ASSESSMENT_TEXT });
  });

  it('reads the text block when thinking blocks come first', async () => {
    upstream.mockResolvedValueOnce(upstreamMessage({
      content: [
        { type: 'thinking', thinking: '', signature: 'sig' },
        { type: 'text', text: ASSESSMENT_TEXT },
      ],
    }));
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl);
    expect(res.status).toBe(200);
    expect(res.body.text).toBe(ASSESSMENT_TEXT);
  });

  it('sends the model, effort and fallback opt-in upstream with the user inputs', async () => {
    const baseUrl = await listen(createApp({ client: testClient() }));
    await analyze(baseUrl);

    expect(upstream).toHaveBeenCalledTimes(1);
    const [url, init] = upstream.mock.calls[0];
    const headers = new Headers(init.headers);
    const body = JSON.parse(init.body);

    expect(url).toMatch(/^https:\/\/api\.anthropic\.com\/v1\/messages/);
    expect(headers.get('x-api-key')).toBe('test-key');
    expect(headers.get('anthropic-beta')).toBe('server-side-fallback-2026-07-01');
    expect(body).toMatchObject({
      model: 'claude-sonnet-5-5',
      max_tokens: 16000,
      output_config: { effort: 'low' },
      fallbacks: 'default',
    });
    expect(body.system).toMatch(/Job Safety & Environmental Analysis/);
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].content).toContain(`Task Description: ${VALID_BODY.task}`);
    expect(body.messages[0].content).toContain('User Expertise Level: novice');
    expect(body.messages[0].content).toContain('Environment: outdoor');
  });

  it('returns 500 NO_API_KEY when no API key is configured', async () => {
    const baseUrl = await listen(createApp({ apiKey: '' }));
    const res = await analyze(baseUrl);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('NO_API_KEY');
  });

  it.each([
    ['a missing task', { ...VALID_BODY, task: undefined }],
    ['a whitespace-only task', { ...VALID_BODY, task: '   ' }],
    ['a task over 2000 characters', { ...VALID_BODY, task: 'a'.repeat(2001) }],
    ['an unknown expertise level', { ...VALID_BODY, expertise: 'wizard' }],
    ['an unknown environment', { ...VALID_BODY, environment: 'mars' }],
  ])('rejects %s with 400 VALIDATION without calling upstream', async (_label, body) => {
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl, body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    expect(upstream).not.toHaveBeenCalled();
  });

  it('returns REFUSED when the model declines', async () => {
    upstream.mockResolvedValueOnce(upstreamMessage({
      content: [],
      stop_reason: 'refusal',
      stop_details: { type: 'refusal', category: 'general_harms', explanation: null },
    }));
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl);
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('REFUSED');
  });

  it('returns INCOMPLETE when the response hits max_tokens', async () => {
    upstream.mockResolvedValueOnce(upstreamMessage({
      content: [{ type: 'text', text: '{"taskSummary": "Felling a de' }],
      stop_reason: 'max_tokens',
    }));
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl);
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('INCOMPLETE');
  });

  it.each([
    ['has no text block', []],
    ['has null content', null],
  ])('returns PARSE when the response %s', async (_label, content) => {
    upstream.mockResolvedValueOnce(upstreamMessage({ content }));
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl);
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('PARSE');
  });

  it.each([
    [401, 'authentication_error', 502, 'AUTH'],
    [429, 'rate_limit_error', 429, 'RATE_LIMIT'],
    [404, 'not_found_error', 502, 'SERVER'],
    [500, 'api_error', 502, 'SERVER'],
    [529, 'overloaded_error', 502, 'SERVER'],
  ])('maps an upstream %i (%s) to %i %s', async (upstreamStatus, type, status, code) => {
    upstream.mockResolvedValueOnce(upstreamError(upstreamStatus, type, 'upstream detail'));
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl);
    expect(res.status).toBe(status);
    expect(res.body.error.code).toBe(code);
  });

  it('maps a network failure to NETWORK', async () => {
    upstream.mockRejectedValueOnce(new TypeError('fetch failed'));
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl);
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('NETWORK');
  });

  it('logs upstream error details without forwarding them to the client', async () => {
    upstream.mockResolvedValueOnce(upstreamError(401, 'authentication_error', 'invalid x-api-key'));
    const baseUrl = await listen(createApp({ client: testClient() }));
    const res = await analyze(baseUrl);
    expect(JSON.stringify(res.body)).not.toContain('invalid x-api-key');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Claude request failed'),
      expect.stringContaining('invalid x-api-key'),
      expect.anything(),
    );
  });
});

// ───────────────────────────────────────────────
// Rate limiting
// ───────────────────────────────────────────────
describe('rate limiting', () => {
  it('allows a burst of 3 requests, then returns 429 with Retry-After', async () => {
    const baseUrl = await listen(createApp({ client: testClient() }));
    for (let i = 0; i < 3; i++) {
      expect((await analyze(baseUrl)).status).toBe(200);
    }

    const limited = await analyze(baseUrl);
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe('RATE_LIMIT');
    expect(Number(limited.headers.get('retry-after'))).toBe(6);
    expect(upstream).toHaveBeenCalledTimes(3);
  });

  it('refills one request every 6 seconds', async () => {
    let now = Date.now();
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const baseUrl = await listen(createApp({ client: testClient() }));
    for (let i = 0; i < 3; i++) await analyze(baseUrl);
    expect((await analyze(baseUrl)).status).toBe(429);

    now += 6_000;
    expect((await analyze(baseUrl)).status).toBe(200);
    expect((await analyze(baseUrl)).status).toBe(429);
  });

  it('ignores X-Forwarded-For unless TRUST_PROXY is set', async () => {
    const baseUrl = await listen(createApp({ client: testClient() }));
    for (let i = 0; i < 3; i++) await analyze(baseUrl, VALID_BODY, { 'X-Forwarded-For': '203.0.113.1' });
    const spoofed = await analyze(baseUrl, VALID_BODY, { 'X-Forwarded-For': '203.0.113.2' });
    expect(spoofed.status).toBe(429);
  });

  it('limits each forwarded client separately when TRUST_PROXY is set', async () => {
    const baseUrl = await listen(createApp({ client: testClient(), trustProxy: '1' }));
    for (let i = 0; i < 3; i++) await analyze(baseUrl, VALID_BODY, { 'X-Forwarded-For': '203.0.113.1' });
    expect((await analyze(baseUrl, VALID_BODY, { 'X-Forwarded-For': '203.0.113.1' })).status).toBe(429);
    expect((await analyze(baseUrl, VALID_BODY, { 'X-Forwarded-For': '203.0.113.2' })).status).toBe(200);
  });
});
