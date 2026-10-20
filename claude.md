# Sharp-Edges

AI-powered risk assessment tool that generates Job Safety & Environmental Analysis (JSEA) briefs for everyday tasks using Claude AI.

## Tech Stack

- **Framework**: React 18 with Vite 6
- **Styling**: Tailwind CSS 3.4
- **Testing**: Vitest + React Testing Library
- **API**: Anthropic Claude API (`claude-sonnet-5-5`) via `@anthropic-ai/sdk`, called only from the Express server
- **Server**: Express 4 (`/api/analyze` proxy, production static hosting)
- **Icons**: Lucide React

## Project Structure

```
server/
├── index.js              # Entry point: loads .env.local/.env, starts the server
├── app.js                # createApp(): /api/analyze, rate limiting, static hosting in production
└── app.test.js           # Server tests (Vitest node environment)
src/
├── components/           # React UI components
│   ├── RiskAssessmentTool.jsx  # Main container, state management
│   ├── InputForm.jsx           # Task input form
│   ├── ResultsDisplay.jsx      # Results container
│   ├── RiskMatrix.jsx          # 5×5 interactive risk grid
│   └── *.test.jsx              # Component tests
├── hooks/
│   └── useRiskAnalysis.js      # API state management hook
├── services/
│   └── api.js                  # Client for /api/analyze; validates the model's JSON
└── utils/
    ├── constants.js            # EXPERTISE_LEVELS, ENVIRONMENTS, etc.
    └── riskCalculations.js     # Risk scoring logic & color mappings
```

## Commands

```bash
npm run dev          # API server (port 3001) + Vite dev server (port 5173)
npm run dev:server   # API server only
npm run dev:client   # Vite only (proxies /api to port 3001)
npm run build        # Production build
npm start            # Serve dist/ and the API from Express (production)
npm run test         # Run tests once
npm run test:watch   # Watch mode
```

## Environment Setup

Copy `.env.example` to `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```
The server loads `.env.local`, then `.env`; real environment variables take precedence.

## Coding Conventions

### Components
- Functional components with React hooks
- Use `memo()` for expensive renders (HazardList, ControlsHierarchy, RiskMatrix)
- Custom hooks for complex state (useRiskAnalysis)
- PascalCase for components, camelCase for utilities

### Styling
- Tailwind CSS utility classes only (no custom CSS except animations in index.css)
- Risk level colors: green (#22c55e), yellow (#eab308), orange (#f97316), red (#ef4444)

### Accessibility
- Always include ARIA labels and roles
- Use `aria-hidden="true"` on decorative icons
- Support keyboard navigation (Escape, Tab, Ctrl+Enter)
- Use `useId()` for unique accessibility IDs

### Testing
- Co-locate tests with source files (*.test.js/jsx)
- Focus on utilities in `riskCalculations.test.js`
- Use React Testing Library patterns for component tests

## Key Data Models

### Risk Assessment Input
- `taskDescription`: string (max 2000 chars)
- `expertiseLevel`: 'novice' | 'general' | 'experienced' | 'professional'
- `environment`: 'home' | 'garage' | 'outdoor' | 'kitchen' | 'commercial' | 'remote'

### Risk Scoring
- Score = Severity (1-5) × Likelihood (1-5)
- 1-4: Low | 5-9: Moderate | 10-16: High | 17-25: Critical

### Hazard Categories
thermal, chemical, mechanical, electrical, biological, ergonomic, environmental, psychological

## Important Notes

- API key should never be committed; use `.env.local` for development
- The API key, system prompt and model config live only in `server/app.js`; never give the key a `VITE_` prefix or reference it from `src/`
- Treat model output as untrusted: `parseAssessmentResponse` validates and normalizes it before any component renders it
- `/api/analyze` is rate limited per client IP (burst 3, then 10/min); set `TRUST_PROXY` when deployed behind a reverse proxy
- The app is mobile-responsive using Tailwind breakpoints (md:/lg:)
- Error handling includes user-friendly messages with retry/dismiss actions
