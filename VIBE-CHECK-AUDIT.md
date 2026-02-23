# Vibe-Code Detection Audit v2.0 — Sharp-Edges

**Repository**: kase1111-hash/Sharp-Edges
**Audit Date**: 2026-02-23
**Auditor**: Claude Code (automated analysis)
**Commit Reviewed**: `4a1d87b` (HEAD of main)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Weighted Authenticity** | 68.3% |
| **Vibe-Code Confidence** | 31.7% |
| **Classification** | **AI-Assisted** (range 16–35) |

Sharp-Edges is a functionally complete, working React application whose git history openly declares AI authorship (14 of 16 non-merge commits by `Claude <noreply@anthropic.com>`). The code passes all 47 tests, builds cleanly, and has complete call chains with no dead modules. However, it exhibits classic AI-generation fingerprints: uniform naming, tutorial-style comments, string-matching error handlers, dead configuration exports, and zero logging infrastructure. The code quality sits above "vibe-coded" territory — it works and is architecturally coherent — but was clearly machine-generated with minimal human iteration.

---

## Domain A: Surface Provenance (20%)

### A1. Commit History Patterns — Score: 1/3 (Weak)

| Signal | Finding |
|--------|---------|
| Authorship | 14/16 non-merge commits authored by `Claude <noreply@anthropic.com>` |
| Human commits | Only 3: "Initial commit", "Create Example.jsx", "Add MIT License" |
| Message uniformity | All follow identical `Verb + object` pattern with zero deviation |
| Branch naming | All branches are `claude/<descriptive-slug>-<hash>` — auto-generated |
| Iteration markers | Zero WIP, fixup, squash, revert, or "oops" commits |
| Commit size | Phase 1: 3,641 insertions/21 files. Phase 5: 1,902 insertions/14 files |
| Phased pattern | Sequential "Phase 1" through "Phase 5" implementation |

**Evidence**: `git log --format="%an|%s"` shows a near-complete AI authorship chain. The phased implementation pattern with large atomic commits is characteristic of prompted AI generation, not organic human development where changes are typically smaller and iterative.

### A2. Comment Archaeology — Score: 1/3 (Weak)

| Signal | Finding |
|--------|---------|
| JSDoc coverage | Every function has JSDoc with `@param`/`@returns`, even trivial ones (`calculateRiskScore`: `severity * likelihood`) |
| Section dividers | Ubiquitous `{/* Section Name */}` comments: `{/* Error Display */}`, `{/* Task Description */}`, `{/* Submit Button */}`, etc. |
| File headers | `api.js` opens with `/** API Service for Risk Assessment * Handles communication with the Anthropic Claude API */` |
| "WHY" comments | Zero. No explanation of tradeoffs, alternatives considered, or design rationale |
| TODO/FIXME | Zero instances in the entire codebase |
| Personality | None. No informal notes, frustration, humor, or stylistic variation |

**Evidence**: Every comment follows an identical tutorial-style template. Real codebases accumulate organic commentary — why a workaround exists, what was tried before, notes for future developers. This codebase has none.

### A3. Test Quality Signals — Score: 2/3 (Moderate)

| Signal | Finding |
|--------|---------|
| Test files | 4 files, 47 passing tests |
| Scope | `riskCalculations.js` (29 tests), `Checklist` (6), `Section` (5), `RiskLevelBadge` (7) |
| Missing coverage | No tests for `api.js` (parseAssessmentResponse, analyzeTask), `useRiskAnalysis` hook, `RiskAssessmentTool`, `InputForm`, `ResultsDisplay`, `RiskMatrix` |
| Error-path tests | Zero. No tests for API failures, malformed responses, network errors |
| Edge cases | No tests for NaN, negative numbers, or out-of-range inputs to `calculateRiskScore` |
| Integration | Matrix integration test covers all 25 cells — this is good |
| Naming | Formulaic: "returns X for Y", "calculates X as Y" |

**Evidence**: The utility tests are solid but formulaic. The complete absence of error-path testing and the fact that the API layer (the most critical code path) has zero tests is a red flag. The test distribution suggests "generate tests for the easy parts" rather than "test what could break."

### A4. Import & Dependency Hygiene — Score: 3/3 (Strong)

| Signal | Finding |
|--------|---------|
| Declared deps | 3 production (react, react-dom, lucide-react), 10 dev |
| All used | Every production dependency is actively consumed |
| No wildcards | All imports are specific named imports |
| No unused imports | Every imported symbol is referenced |
| Minor oddity | `@types/react` and `@types/react-dom` in a pure JS project (no TypeScript) |

### A5. Naming Consistency — Score: 1/3 (Weak)

| Signal | Finding |
|--------|---------|
| Components | 100% PascalCase, zero exceptions |
| Functions | 100% camelCase, zero exceptions |
| Variables | Consistently verbose: `taskDescription`, `expertiseLevel`, `checkedItems` — no abbreviations anywhere |
| Props | Uniformly camelCase with descriptive names |
| Organic variation | None. Real multi-developer codebases show naming drift |

**Evidence**: The naming is _suspiciously_ perfect. In human-authored codebases, you see inconsistencies — `desc` vs `description`, `env` vs `environment`, `cb` vs `callback`. This codebase has zero such variation, suggesting generation from a single model with consistent conventions.

### A6. Documentation vs Reality — Score: 2/3 (Moderate)

| Signal | Finding |
|--------|---------|
| README features | All 7 listed features are implemented |
| SPEC.md (733 lines) | Matches implementation precisely |
| Phantom features | None found |
| Doc quality | Template-polished, reads as AI-generated |
| SPEC came first | Commits show SPEC.md created before code — AI was prompted from spec |

### A7. Dependency Utilization — Score: 3/3 (Strong)

| Signal | Finding |
|--------|---------|
| lucide-react | 15+ icons used across 8 components |
| tailwindcss | Used on every single element, not just surface-level |
| vitest | 47 tests running with jsdom environment |
| react | Hooks API (useState, useCallback, useMemo, useEffect, useRef, useId, memo) |

### Domain A Total: 13/21 → 61.9%

---

## Domain B: Behavioral Integrity (50%)

### B1. Error Handling Authenticity — Score: 1/3 (Weak)

| Signal | Finding | Location |
|--------|---------|----------|
| Custom error classes | None. All errors are `new Error(string)` | `src/services/api.js` |
| String-matching router | 8 chained `if/else if` blocks matching substrings in `err.message` | `src/hooks/useRiskAnalysis.js:41-56` |
| Error boundaries | None in the entire app | — |
| Typed errors | None | — |
| Fallback | Generic "An unexpected error occurred" | `src/hooks/useRiskAnalysis.js:39` |

**Evidence**: The string-based error classification in `useRiskAnalysis.js` is a hallmark AI pattern:

```javascript
if (err.message.includes('API key not configured')) {
  errorMessage = 'API key not configured...';
} else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
  errorMessage = 'Unable to connect...';
} else if (err.message.includes('401') || err.message.includes('authentication')) {
  // ...
```

This is fragile — a change in error message wording anywhere upstream silently breaks classification. Human developers typically use error codes, custom error classes, or HTTP status checking.

### B2. Configuration Actually Used — Score: 2/3 (Moderate)

| Config | Used? | Location |
|--------|-------|----------|
| `VITE_ANTHROPIC_API_KEY` | Yes | `src/services/api.js:173` |
| `MODEL`, `MAX_TOKENS`, `API_ENDPOINT` | Yes | `src/services/api.js:188-189` |
| `EXPERTISE_LEVELS` | Yes | `src/components/InputForm.jsx:121` |
| `ENVIRONMENTS` | Yes | `src/components/InputForm.jsx:140` |
| `EXAMPLE_TASKS` | Yes | `src/components/InputForm.jsx:94` |
| `HAZARD_CATEGORIES` | Yes | `src/components/HazardList.jsx:9` |
| `CONTROL_HIERARCHY` | Yes | `src/components/ControlsHierarchy.jsx:29` |
| **`RISK_LEVELS`** | **No** | `src/utils/constants.js:38` — exported but never imported |
| **`SEVERITY_LABELS`** | **No** | `src/utils/constants.js:45` — exported but never imported |
| **`LIKELIHOOD_LABELS`** | **No** | `src/utils/constants.js:46` — exported but never imported |

**Evidence**: Three exported constants in `constants.js` are dead code. `RISK_LEVELS` duplicates `RISK_COLORS`/`RISK_LEVEL_INFO` from `riskCalculations.js`. `SEVERITY_LABELS` and `LIKELIHOOD_LABELS` duplicate `SEVERITY_SCALE` and `LIKELIHOOD_SCALE`. This is a classic AI artifact — the model generated both files independently and didn't reconcile the duplication.

### B3. Call Chain Completeness — Score: 3/3 (Strong)

**Trace 1: Submit Task → Display Results**
```
InputForm.handleSubmit (line 10)
  → RiskAssessmentTool.handleSubmit (line 15)
    → useRiskAnalysis.analyze (line 23)
      → api.analyzeTask (line 172)
        → fetch(API_ENDPOINT) (line 181)
          → parseAssessmentResponse (line 102)
            → setAssessment(result) (line 36)
              → ResultsDisplay renders (line 77)
```
Complete. No stubs, no dead ends.

**Trace 2: Error → Retry**
```
fetch fails → catch block (line 37)
  → setError(errorMessage) (line 59)
    → ErrorDisplay renders (line 67)
      → handleRetry (line 28)
        → clearError + analyze(lastInput) (line 29-30)
```
Complete.

**Trace 3: Reset with Checklist Progress**
```
handleResetClick (line 34)
  → if checkedItems.size > 0 → setShowConfirmDialog(true) (line 36-37)
    → ConfirmDialog.onConfirm → handleReset (line 43)
      → reset(), clear state, scroll top (lines 44-49)
```
Complete.

### B4. Async Correctness — Score: 2/3 (Moderate)

| Signal | Finding |
|--------|---------|
| Proper await | `analyzeTask` is properly awaited in `useRiskAnalysis.analyze` |
| Loading state | Set in correct order: `true` before await, `false` in `finally` block |
| Effect cleanup | Both `useEffect` hooks (keyboard, escape) properly remove listeners |
| AbortController | **Missing**. No request cancellation. Rapid re-submits fire concurrent requests; last-to-complete wins |
| Race conditions | Double-submit could yield stale results if first request completes after second |

### B5. State Management Coherence — Score: 3/3 (Strong)

| Signal | Finding |
|--------|---------|
| Pattern | `useState` + custom hook. Appropriate for app complexity |
| State lifting | `checkedItems` lifted to parent for confirm dialog coordination |
| Prop drilling depth | Max 2 levels — clean |
| Reset completeness | `handleReset` clears all 4 state variables + scrolls to top |
| Memoization | `useCallback` for hook functions, `memo()` on 3 expensive components |

### B6. Security Implementation Depth — Score: 1/3 (Weak)

| Signal | Finding | Severity |
|--------|---------|----------|
| Client-exposed API key | `VITE_ANTHROPIC_API_KEY` embedded in client JS bundle | High |
| No backend proxy | README acknowledges this: "implement a backend proxy for production" | High |
| No input sanitization | Task description goes directly into AI prompt | Medium |
| No rate limiting | Nothing prevents rapid API key abuse | Medium |
| No CSP headers | No Content-Security-Policy in `index.html` or Vite config | Low |
| XSS baseline | React's JSX auto-escaping provides default protection | OK |
| No `dangerouslySetInnerHTML` | Good — no direct HTML injection vectors | OK |

**Evidence**: The security model is "acknowledge the problem, defer to production." The client-exposed API key is the biggest concern — anyone who views source can extract and abuse the key.

### B7. Resource Management — Score: 2/3 (Moderate)

| Signal | Finding |
|--------|---------|
| Event listener cleanup | Both `useEffect` hooks properly return cleanup functions |
| Fetch cancellation | **Missing**. No `AbortController` — unmounting during request could cause issues |
| Memory leaks | No obvious leaks; state properly reset |
| Timer cleanup | `setTimeout` in `handleSubmit` not cleaned up (minor; fires once) |

### Domain B Total: 14/21 → 66.7%

---

## Domain C: Interface Authenticity (30%)

### C1. API Design Consistency — Score: 2/3 (Moderate)

| Signal | Finding |
|--------|---------|
| Endpoint count | 1 (Anthropic API) |
| Parameter pattern | `(task, expertise, environment)` consistent through all layers |
| Response parsing | Regex-based JSON extraction from AI response — functional but brittle |
| Error response handling | `response.ok` check + JSON error body extraction |

### C2. UI Implementation Depth — Score: 3/3 (Strong)

| Component | Sophistication |
|-----------|---------------|
| `RiskMatrix` | Interactive 5x5 grid, hover info panel, memoized data, selected cell highlighting, scale reference, legend with current-level indicator |
| `ConfirmDialog` | Focus trapping (cancel button), Escape key, backdrop click, ARIA modal attributes, `useId()` for accessibility |
| `InputForm` | Keyboard shortcut (Ctrl+Enter), char counter, clear button, example task buttons, disabled state during loading |
| `Checklist` | Progress bar with ARIA progressbar role, toggle animations, check/uncheck with Set-based state |
| `ResultsDisplay` | 8 sections, conditional rendering for optional content, fadeIn animation |

**Evidence**: These aren't skeleton components. The RiskMatrix alone is 200+ lines with genuine interactivity. The accessibility implementation (ARIA roles, labels, keyboard navigation) is thorough.

### C3. State Management (Frontend) — Score: 3/3 (Strong)

| Signal | Finding |
|--------|---------|
| Architecture | useState + custom hook — appropriate for SPA of this complexity |
| Data flow | Unidirectional parent→child, no prop drilling issues |
| Performance | `useMemo` for matrix data, `useCallback` for stable refs, `memo()` on 3 components |
| No over-engineering | No Redux, Context, or state management library for an app that doesn't need it |

### C4. Security Infrastructure (Frontend) — Score: 2/3 (Moderate)

| Signal | Finding |
|--------|---------|
| XSS | React JSX auto-escaping; no `dangerouslySetInnerHTML` |
| CSRF | N/A (no backend) |
| Credential handling | API key via env var, not hardcoded. `.env.example` has placeholder only |
| `.gitignore` | `.env.local` is gitignored — keys won't be committed |

### C5. WebSocket Implementation — Score: N/A

No WebSocket usage. Scored as 2/3 (neutral) for calculation purposes.

### C6. Error UX — Score: 3/3 (Strong)

| Signal | Finding |
|--------|---------|
| Error component | Dedicated `ErrorDisplay` with icon, message, retry, and dismiss |
| User-friendly messages | Technical errors translated to plain language in `useRiskAnalysis.js` |
| Retry | Saves `lastInput` and replays the request on retry |
| Dismiss | Users can clear errors without being forced to retry |
| Loading state | Spinner + "Analyzing Risks..." text + disabled form inputs |
| Confirm dialog | Protects against accidental checklist progress loss |

### C7. Logging & Observability — Score: 1/3 (Weak)

| Signal | Finding |
|--------|---------|
| Console logging | Single `console.error` in `useRiskAnalysis.js:60` |
| Structured logging | None |
| Log levels | None |
| Error reporting | No Sentry, Bugsnag, or similar |
| Performance monitoring | None |
| Debug mode | None |

**Evidence**: The entire observability surface is one `console.error` call. A production application needs more than this to diagnose issues.

### Domain C Total: 16/21 → 76.2%

---

## Final Score Calculation

```
Weighted Authenticity = (A% × 0.20) + (B% × 0.50) + (C% × 0.30)
                      = (61.9% × 0.20) + (66.7% × 0.50) + (76.2% × 0.30)
                      = 12.4% + 33.3% + 22.9%
                      = 68.6%

Vibe-Code Confidence  = 100% - 68.6% = 31.4%
```

| Domain | Raw Score | Weight | Weighted |
|--------|-----------|--------|----------|
| A: Surface Provenance | 61.9% (13/21) | 20% | 12.4% |
| B: Behavioral Integrity | 66.7% (14/21) | 50% | 33.3% |
| C: Interface Authenticity | 76.2% (16/21) | 30% | 22.9% |
| **Weighted Authenticity** | | | **68.6%** |
| **Vibe-Code Confidence** | | | **31.4%** |

### Classification: **AI-Assisted** (16–35 range)

| Range | Classification | This Project |
|-------|---------------|--------------|
| 0–15 | Human-Authored | |
| **16–35** | **AI-Assisted** | **← 31.4%** |
| 36–60 | Substantially Vibe-Coded | |
| 61–85 | Predominantly Vibe-Coded | |
| 86–100 | Almost Certainly AI-Generated | |

---

## Critical Findings

### High Priority

1. **Client-Exposed API Key** (`src/services/api.js:173`)
   The Anthropic API key ships in the client JavaScript bundle. Anyone inspecting network traffic or source code can extract and abuse it. A backend proxy is mandatory before any non-local deployment.

2. **No Request Cancellation** (`src/hooks/useRiskAnalysis.js:34`)
   No `AbortController` on the fetch call. Rapid re-submissions fire concurrent requests, and the last-to-complete wins regardless of order. Component unmounting during a request could trigger state updates on unmounted components.

3. **String-Matching Error Handler** (`src/hooks/useRiskAnalysis.js:41-56`)
   Error classification relies on substring matching of `err.message`. This is fragile — any upstream wording change silently breaks error routing. Use HTTP status codes or custom error types instead.

4. **Dead Configuration Exports** (`src/utils/constants.js:38-46`)
   `RISK_LEVELS`, `SEVERITY_LABELS`, and `LIKELIHOOD_LABELS` are exported but never imported anywhere. They duplicate structures in `riskCalculations.js` (`RISK_COLORS`, `SEVERITY_SCALE`, `LIKELIHOOD_SCALE`). This is dead code that increases maintenance burden.

### Medium Priority

5. **No Error Boundary**
   No React error boundary exists. A rendering error in any component will crash the entire app with a white screen instead of graceful degradation.

6. **Zero Error-Path Tests**
   The API service (`parseAssessmentResponse`, `analyzeTask`) has no tests at all, despite being the most failure-prone code path. No tests for malformed JSON, missing fields, network errors, or non-200 responses.

7. **No Input Validation Beyond UI**
   The 2000-character limit is enforced only by the `maxLength` HTML attribute. The API service accepts any string. There's no validation of expertise level or environment values against the allowed enums.

### Low Priority

8. **Uncleaned setTimeout** (`src/components/RiskAssessmentTool.jsx:23`)
   The `setTimeout` for scroll-to-results is not cleaned up on unmount. Unlikely to cause issues in practice but violates React cleanup best practices.

9. **No CSP Headers**
   No Content-Security-Policy configuration. Not critical for a dev tool, but should be added before production deployment.

10. **Single Console.error**
    The entire observability surface is one `console.error` call. No structured logging, no error reporting service, no performance monitoring.

---

## Build & Test Verification

```
$ npm test
 ✓ src/utils/riskCalculations.test.js (29 tests)
 ✓ src/components/RiskLevelBadge.test.jsx (7 tests)
 ✓ src/components/Checklist.test.jsx (6 tests)
 ✓ src/components/Section.test.jsx (5 tests)

 Test Files  4 passed (4)
       Tests  47 passed (47)

$ npm run build
 ✓ 1587 modules transformed
 dist/index.html          0.48 kB
 dist/assets/index.css   19.19 kB │ gzip:  4.07 kB
 dist/assets/index.js   182.00 kB │ gzip: 56.22 kB
 ✓ built in 7.47s
```

All tests pass. Build succeeds. No warnings.

---

## Methodology Notes

This audit followed the Vibe-Code Detection Audit v2.0 framework with two analysis passes:

1. **Problem-focused pass**: Systematic inspection of all 27 source files, 4 test files, configuration, documentation, and git history for AI-generation indicators
2. **Execution-tracing pass**: 3 critical user flows traced end-to-end (submit → results, error → retry, reset with progress confirmation)

Scoring reflects that this project is openly AI-authored (git history declares it) but is functionally complete, architecturally sound, and above the threshold of "vibe-coded" quality. The code works, the call chains are complete, and the UI has genuine depth. The main weaknesses are in provenance signals, security posture, error handling patterns, and observability.
