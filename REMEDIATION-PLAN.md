# Remediation Plan — Sharp-Edges

Based on the [Vibe-Code Detection Audit v2.0](./VIBE-CHECK-AUDIT.md). Organized into
four phases by dependency order and risk severity. Each item links back to its
audit finding number.

---

## Phase 1: Security & Structural Fixes

_These block production deployment. Do them first._

### 1.1 Typed Error Handling (Finding #3)

**Problem**: `useRiskAnalysis.js` classifies errors by matching substrings in
`err.message` — fragile and one upstream wording change silently breaks routing.

**Files**: `src/services/api.js`, `src/hooks/useRiskAnalysis.js`

**Changes**:

Create a small `ApiError` class in `api.js` that carries a `code` property.
Throw typed errors instead of plain `Error`:

```js
// src/services/api.js — add near top of file

export class ApiError extends Error {
  constructor(message, code, status = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;      // 'NO_API_KEY' | 'NETWORK' | 'AUTH' | 'RATE_LIMIT' | 'SERVER' | 'PARSE' | 'VALIDATION'
    this.status = status;
  }
}
```

Then update every `throw new Error(...)` in `api.js` to use `ApiError`:

| Current throw | Replacement |
|---------------|-------------|
| `'API key not configured...'` | `new ApiError('...', 'NO_API_KEY')` |
| `response.status` branch | `new ApiError(msg, 'AUTH', 401)` for 401, `new ApiError(msg, 'RATE_LIMIT', 429)` for 429, `new ApiError(msg, 'SERVER', status)` for 5xx, generic `new ApiError(msg, 'HTTP', status)` otherwise |
| `'No valid JSON found...'` | `new ApiError('...', 'PARSE')` |
| `'Missing required field: ...'` | `new ApiError('...', 'VALIDATION')` |
| `'Failed to parse JSON: ...'` | `new ApiError('...', 'PARSE')` |
| `'Invalid riskAssessment...'` | `new ApiError('...', 'VALIDATION')` |
| `'Invalid API response structure'` | `new ApiError('...', 'PARSE')` |

Rewrite the `analyzeTask` function to use HTTP status codes directly:

```js
// src/services/api.js — in analyzeTask, replace the response.ok block

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const msg = errorData.error?.message || `API request failed with status ${response.status}`;

  if (response.status === 401) throw new ApiError(msg, 'AUTH', 401);
  if (response.status === 429) throw new ApiError(msg, 'RATE_LIMIT', 429);
  if (response.status >= 500) throw new ApiError(msg, 'SERVER', response.status);
  throw new ApiError(msg, 'HTTP', response.status);
}
```

Then rewrite the catch block in `useRiskAnalysis.js` to switch on `err.code`:

```js
// src/hooks/useRiskAnalysis.js — replace the catch block

} catch (err) {
  const messages = {
    NO_API_KEY: 'API key not configured. Please check your environment setup.',
    NETWORK:    'Unable to connect to the server. Please check your internet connection.',
    AUTH:       'Authentication failed. Please check your API key.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    SERVER:     'Server error. Please try again later.',
    PARSE:      'Could not parse the response. Please try again.',
    VALIDATION: 'Received incomplete response. Please try again.',
  };

  const errorMessage = (err.code && messages[err.code])
    || err.message
    || 'An unexpected error occurred. Please try again.';

  setError(errorMessage);
  console.error('Risk analysis error:', err);
}
```

Also catch network failures at the `fetch` call site to tag them properly:

```js
// src/services/api.js — wrap the fetch call

let response;
try {
  response = await fetch(API_ENDPOINT, { ... });
} catch (fetchError) {
  throw new ApiError(
    'Unable to connect to the analysis service',
    'NETWORK'
  );
}
```

---

### 1.2 Request Cancellation with AbortController (Finding #2)

**Problem**: No way to cancel in-flight requests. Rapid re-submissions race,
and component unmount during a request leaks state updates.

**Files**: `src/services/api.js`, `src/hooks/useRiskAnalysis.js`

**Changes**:

Update `analyzeTask` to accept an optional `signal`:

```js
// src/services/api.js — update signature and fetch call

export async function analyzeTask(task, expertise, environment, { signal } = {}) {
  // ... existing API key check ...

  let response;
  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { ... },
      body: JSON.stringify({ ... }),
      signal,          // ← pass the AbortSignal
    });
  } catch (fetchError) {
    if (fetchError.name === 'AbortError') throw fetchError; // don't wrap aborts
    throw new ApiError('Unable to connect to the analysis service', 'NETWORK');
  }

  // ... rest unchanged ...
}
```

Manage the `AbortController` in the hook:

```js
// src/hooks/useRiskAnalysis.js

import { useState, useCallback, useRef } from 'react';
import { analyzeTask } from '../services/api';

export function useRiskAnalysis() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const analyze = useCallback(async (task, expertise, environment) => {
    if (!task?.trim()) {
      setError('Please provide a task description');
      return;
    }

    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setAssessment(null);

    try {
      const result = await analyzeTask(task, expertise, environment, {
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setAssessment(result);
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // silently ignore cancelled requests
      // ... error handling (from 1.1) ...
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setAssessment(null);
    setLoading(false);
    setError(null);
  }, []);

  // ... rest unchanged ...
}
```

---

### 1.3 Remove Dead Configuration Exports (Finding #4)

**Problem**: `RISK_LEVELS`, `SEVERITY_LABELS`, `LIKELIHOOD_LABELS` in
`constants.js` are exported but never imported. They duplicate structures in
`riskCalculations.js`.

**File**: `src/utils/constants.js`

**Changes**: Delete lines 38–46:

```diff
- export const RISK_LEVELS = {
-   low: { label: 'Low', color: 'text-green-700', bgColor: 'bg-green-500', lightBg: 'bg-green-100' },
-   moderate: { label: 'Moderate', color: 'text-yellow-700', bgColor: 'bg-yellow-500', lightBg: 'bg-yellow-100' },
-   high: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-500', lightBg: 'bg-orange-100' },
-   critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-500', lightBg: 'bg-red-100' },
- };
-
- export const SEVERITY_LABELS = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
- export const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
```

These are already covered by `RISK_COLORS`/`RISK_LEVEL_INFO` in
`riskCalculations.js` and `SEVERITY_SCALE`/`LIKELIHOOD_SCALE` there too.

---

### 1.4 Add React Error Boundary (Finding #5)

**Problem**: A rendering error anywhere crashes the entire app with a white
screen.

**Files**: New file `src/components/ErrorBoundary.jsx`, modify `src/App.jsx`

**Changes**:

```jsx
// src/components/ErrorBoundary.jsx

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred while rendering the application.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap the app:

```jsx
// src/App.jsx

import ErrorBoundary from './components/ErrorBoundary';
import RiskAssessmentTool from './components/RiskAssessmentTool';

function App() {
  return (
    <ErrorBoundary>
      <RiskAssessmentTool />
    </ErrorBoundary>
  );
}

export default App;
```

---

### 1.5 Input Validation at the Service Boundary (Finding #7)

**Problem**: The 2000-char limit is only enforced by the HTML `maxLength`
attribute. Expertise and environment values are not validated against allowed
enums. A programmatic caller or modified DOM can bypass all constraints.

**File**: `src/services/api.js`

**Changes**: Add validation at the top of `analyzeTask`:

```js
// src/services/api.js — add at the top of analyzeTask, after the API key check

const VALID_EXPERTISE = ['novice', 'general', 'experienced', 'professional'];
const VALID_ENVIRONMENTS = ['home', 'garage', 'outdoor', 'kitchen', 'commercial', 'remote'];
const MAX_TASK_LENGTH = 2000;

export async function analyzeTask(task, expertise, environment, { signal } = {}) {
  // ... API key check ...

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

  // ... fetch call ...
}
```

Note: derive `VALID_EXPERTISE` and `VALID_ENVIRONMENTS` from `constants.js` to
keep them in sync:

```js
import { EXPERTISE_LEVELS, ENVIRONMENTS } from '../utils/constants';

const VALID_EXPERTISE = EXPERTISE_LEVELS.map(l => l.value);
const VALID_ENVIRONMENTS = ENVIRONMENTS.map(e => e.value);
```

---

## Phase 2: Test Coverage

_Addresses the zero-test blind spots. Run after Phase 1 since tests should
cover the new error types._

### 2.1 API Service Tests (Finding #6)

**File**: New file `src/services/api.test.js`

**Test cases to write**:

```
describe('parseAssessmentResponse')
  ├── parses valid complete JSON response
  ├── extracts JSON when surrounded by extra text
  ├── throws PARSE for response with no JSON
  ├── throws PARSE for malformed JSON
  ├── throws VALIDATION for missing taskSummary
  ├── throws VALIDATION for missing hazards array
  ├── throws VALIDATION for missing riskAssessment
  ├── throws VALIDATION when severity is not a number
  ├── throws VALIDATION when likelihood is not a number
  ├── throws VALIDATION when overallLevel is missing
  ├── defaults empty arrays in parsedContext
  ├── defaults empty arrays in controls
  ├── defaults empty strings for ethicalNote and additionalConsiderations
  └── handles response with all optional fields present

describe('analyzeTask')
  ├── throws NO_API_KEY when env var is missing
  ├── throws VALIDATION for empty task
  ├── throws VALIDATION for task exceeding 2000 chars
  ├── throws VALIDATION for invalid expertise level
  ├── throws VALIDATION for invalid environment
  ├── throws AUTH for 401 response
  ├── throws RATE_LIMIT for 429 response
  ├── throws SERVER for 500 response
  ├── throws NETWORK when fetch rejects (TypeError)
  ├── throws PARSE for invalid API response structure (missing content)
  ├── respects AbortSignal (aborted request throws AbortError)
  └── returns parsed assessment on success (mock fetch)

describe('buildUserPrompt')
  ├── includes task description in output
  ├── includes expertise level in output
  └── includes environment in output
```

**Implementation notes**:
- Use `vi.stubGlobal('fetch', vi.fn())` to mock fetch
- Use `vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'test-key')` or mock `import.meta.env`
- `buildUserPrompt` is not exported — either export it for testing or test it
  indirectly through the prompt content in the fetch call body

### 2.2 useRiskAnalysis Hook Tests (Finding #6)

**File**: New file `src/hooks/useRiskAnalysis.test.js`

**Test cases to write**:

```
describe('useRiskAnalysis')
  ├── initial state: assessment=null, loading=false, error=null
  ├── analyze sets loading=true during request
  ├── analyze sets assessment on success
  ├── analyze sets error with user-friendly message on NO_API_KEY
  ├── analyze sets error with user-friendly message on NETWORK
  ├── analyze sets error with user-friendly message on AUTH
  ├── analyze sets error with user-friendly message on RATE_LIMIT
  ├── analyze sets error with user-friendly message on PARSE
  ├── analyze sets error for empty task without calling API
  ├── analyze cancels previous request on rapid re-submit
  ├── reset clears all state
  ├── reset aborts in-flight request
  ├── clearError clears only error, preserves assessment
  └── loading returns to false after error
```

**Implementation notes**:
- Use `renderHook` from `@testing-library/react`
- Mock `../services/api` module with `vi.mock`
- Use `act()` wrapper for state updates

### 2.3 RiskAssessmentTool Integration Tests (Finding #6)

**File**: New file `src/components/RiskAssessmentTool.test.jsx`

**Test cases to write** (top-level orchestration):

```
describe('RiskAssessmentTool')
  ├── renders InputForm on initial load
  ├── shows loading state when submitting
  ├── displays results after successful analysis
  ├── scrolls to results after render
  ├── shows ErrorDisplay on failure
  ├── retry re-submits with saved input
  ├── dismiss clears error
  ├── "Start New Assessment" resets when no checklist progress
  ├── "Start New Assessment" shows confirm dialog when checklist has progress
  ├── confirming dialog resets everything
  └── cancelling dialog preserves state
```

---

## Phase 3: Resilience & UX Hardening

### 3.1 Clean Up setTimeout on Unmount (Finding #8)

**File**: `src/components/RiskAssessmentTool.jsx`

**Problem**: The `setTimeout` at line 22 is not cleaned up if the component
unmounts within 100ms.

**Changes**:

```js
// src/components/RiskAssessmentTool.jsx

import { useState, useRef, useEffect } from 'react';

export default function RiskAssessmentTool() {
  // ... existing state ...
  const scrollTimerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const handleSubmit = async ({ taskDescription, expertiseLevel, environment }) => {
    setLastInput({ taskDescription, expertiseLevel, environment });
    await analyze(taskDescription, expertiseLevel, environment);

    scrollTimerRef.current = setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ... rest unchanged ...
}
```

---

### 3.2 Add Content Security Policy (Finding #9)

**File**: `index.html`

**Changes**: Add a CSP meta tag that allows only necessary origins:

```html
<!-- index.html — add inside <head> -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.anthropic.com; img-src 'self' data:;"
/>
```

**Notes**:
- `'unsafe-inline'` for styles is needed by Tailwind's runtime injection
  during development. For production builds, Tailwind is compiled to a static
  CSS file so you could tighten this.
- `connect-src` whitelists only the Anthropic API endpoint.
- When a backend proxy replaces the direct API call, update `connect-src` to
  point at your own domain only.

---

### 3.3 Basic Structured Logging (Finding #10)

**Problem**: One `console.error` call is the entire observability surface.

**File**: New file `src/utils/logger.js`

**Changes**: A minimal logger that can be swapped for a real service later:

```js
// src/utils/logger.js

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = import.meta.env.DEV ? LOG_LEVELS.debug : LOG_LEVELS.warn;

function log(level, message, data) {
  if (LOG_LEVELS[level] < CURRENT_LEVEL) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data }),
  };

  switch (level) {
    case 'error': console.error(entry); break;
    case 'warn':  console.warn(entry);  break;
    default:      console.log(entry);   break;
  }
}

export const logger = {
  debug: (msg, data) => log('debug', msg, data),
  info:  (msg, data) => log('info',  msg, data),
  warn:  (msg, data) => log('warn',  msg, data),
  error: (msg, data) => log('error', msg, data),
};
```

Then replace bare `console.error` calls:

```js
// src/hooks/useRiskAnalysis.js
import { logger } from '../utils/logger';

// In catch block:
logger.error('Risk analysis failed', { code: err.code, message: err.message, status: err.status });
```

This gives you:
- Structured JSON entries instead of bare strings
- Level filtering (debug in dev, warn+ in prod)
- A single place to wire in a real service (Sentry, etc.) later

---

## Phase 4: Client-Exposed API Key (Finding #1)

_This is the most impactful security issue but requires architectural work
(a backend component). Treat it as a separate workstream._

### 4.1 Strategy Options

| Option | Effort | Trade-offs |
|--------|--------|------------|
| **A. Lightweight proxy (recommended)** | 1-2 days | Add a small backend (Express, Cloudflare Worker, or Vercel Edge Function) that holds the API key and forwards requests. Client calls `/api/analyze` instead of Anthropic directly. |
| **B. Backend-for-Frontend** | 2-3 days | Full backend with rate limiting, request validation, and response caching. Best for production. |
| **C. OAuth / server-issued tokens** | 3-5 days | Users authenticate; backend issues short-lived tokens. Prevents abuse but adds auth complexity. |

### 4.2 Recommended: Cloudflare Worker Proxy

**New file**: `worker/index.js` (or equivalent platform)

```js
// Minimal Cloudflare Worker example

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await request.json();

    // Validate and forward
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,  // stored in Worker secrets
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://your-domain.com',
      },
    });
  },
};
```

**Client-side changes** (`src/services/api.js`):

```js
// Replace the direct Anthropic endpoint
const API_ENDPOINT = import.meta.env.VITE_API_PROXY_URL || 'https://api.anthropic.com/v1/messages';

// Remove the x-api-key header when using the proxy
const headers = { 'Content-Type': 'application/json' };
if (!import.meta.env.VITE_API_PROXY_URL) {
  headers['x-api-key'] = apiKey;
  headers['anthropic-version'] = '2023-06-01';
}
```

### 4.3 Add Rate Limiting to the Proxy

Once a proxy exists, add basic rate limiting:

- **Token bucket** per IP: 10 requests per minute, burst of 3
- **Response**: 429 with `Retry-After` header
- This protects your API key from abuse even without user authentication

---

## Execution Order & Dependencies

```
Phase 1 (Security & Structure)
  1.1 Typed Errors        ─┐
  1.2 AbortController      ├── These touch the same two files; do together
  1.5 Input Validation     ─┘
  1.3 Dead Code Removal   ─── Independent; can be done in parallel
  1.4 Error Boundary       ─── Independent; can be done in parallel

Phase 2 (Tests) — depends on Phase 1 error types
  2.1 API Service Tests    ─── Write first (tests the foundation)
  2.2 Hook Tests           ─── Write second (depends on mocked API)
  2.3 Integration Tests    ─── Write last (depends on both)

Phase 3 (Hardening)
  3.1 setTimeout Cleanup   ─── Independent
  3.2 CSP Headers          ─── Independent
  3.3 Structured Logger    ─── Independent
  All Phase 3 items can be done in parallel.

Phase 4 (API Key) — independent workstream
  4.1 Choose proxy strategy
  4.2 Implement proxy
  4.3 Add rate limiting
  Sequential; blocks production deployment.
```

---

## Expected Impact on Audit Scores

| Criterion | Current | After Phase 1-3 | After Phase 4 | Change |
|-----------|---------|-----------------|---------------|--------|
| B1. Error Handling | 1 | 3 | 3 | +2 |
| B2. Configuration | 2 | 3 | 3 | +1 |
| B4. Async Correctness | 2 | 3 | 3 | +1 |
| B6. Security | 1 | 1 | 3 | +2 |
| B7. Resource Mgmt | 2 | 3 | 3 | +1 |
| C4. Security Infra | 2 | 2 | 3 | +1 |
| C7. Logging | 1 | 2 | 2 | +1 |

**Projected Vibe-Code Confidence after all phases**: ~15% (down from 31.4%),
moving the classification from "AI-Assisted" to the boundary of "Human-Authored."

---

## Verification Checklist

After completing all phases, verify:

- [ ] `npm test` passes with all new test files
- [ ] `npm run build` succeeds with no warnings
- [ ] `RISK_LEVELS`, `SEVERITY_LABELS`, `LIKELIHOOD_LABELS` are no longer exported from `constants.js`
- [ ] No `err.message.includes(` patterns remain in `useRiskAnalysis.js`
- [ ] `AbortController` is used in `useRiskAnalysis` and `api.js`
- [ ] `ErrorBoundary` wraps the app in `App.jsx`
- [ ] CSP meta tag is present in `index.html`
- [ ] `logger.error` replaces bare `console.error`
- [ ] Input validation rejects invalid expertise/environment values
- [ ] (Phase 4) API key is no longer in the client bundle
- [ ] (Phase 4) Proxy returns 429 after rate limit exceeded
