# Sharp-Edges

AI-powered risk assessment tool that generates Job Safety & Environmental Analysis (JSEA) briefs for everyday tasks using Claude AI.

## Tech Stack

- **Framework**: React 18 with Vite 6
- **Styling**: Tailwind CSS 3.4
- **Testing**: Vitest + React Testing Library
- **API**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Icons**: Lucide React

## Project Structure

```
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
│   └── api.js                  # Anthropic API integration
└── utils/
    ├── constants.js            # EXPERTISE_LEVELS, ENVIRONMENTS, etc.
    └── riskCalculations.js     # Risk scoring logic & color mappings
```

## Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run test         # Run tests once
npm run test:watch   # Watch mode
```

## Environment Setup

Copy `.env.example` to `.env.local` and add your Anthropic API key:
```
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

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
- Production deployments should use a backend proxy for API calls
- The app is mobile-responsive using Tailwind breakpoints (md:/lg:)
- Error handling includes user-friendly messages with retry/dismiss actions
